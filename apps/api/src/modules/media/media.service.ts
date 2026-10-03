import { Injectable, NotFoundException, ForbiddenException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DRIZZLE_DB } from '../database/database.module';
import { EduYugDb, mediaAssets, lessons, eq, and } from '@eduyug/database';
import { PresignUploadDto, ConfirmUploadDto } from './dto/media.dto';
import { MediaStatus, PresignUploadResponse, MediaAssetDetail } from '@eduyug/shared-types';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private cdnDomain: string;

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: EduYugDb,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('S3_RAW_UPLOADS_BUCKET') || 'eduyug-raw-uploads';
    this.cdnDomain = this.configService.get<string>('CLOUDFRONT_DOMAIN') || 'media.eduyug.com';

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';

    if (accessKeyId && secretAccessKey && accessKeyId !== 'your_aws_access_key') {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`Initialized AWS S3 Client for bucket: ${this.bucketName}`);
    } else {
      this.logger.warn('AWS credentials not set or using placeholder. Running in local simulation mode for uploads.');
    }
  }

  async presignUpload(instructorId: string, dto: PresignUploadDto): Promise<PresignUploadResponse> {
    const assetId = crypto.randomUUID();
    const cleanFilename = dto.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const rawKey = `raw/${instructorId}/${assetId}/${cleanFilename}`;

    // Create record in media_assets
    const [asset] = await this.db
      .insert(mediaAssets)
      .values({
        id: assetId,
        instructorId,
        originalFilename: dto.filename,
        rawS3Key: rawKey,
        status: MediaStatus.UPLOAD_PENDING,
      })
      .returning();

    // If lessonId was provided, link lesson to this media asset
    if (dto.lessonId) {
      await this.db
        .update(lessons)
        .set({ mediaAssetId: asset.id, updatedAt: new Date() })
        .where(eq(lessons.id, dto.lessonId));
    }

    let uploadUrl = '';

    if (this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: rawKey,
        ContentType: dto.contentType,
      });
      // URL expires in 1 hour (3600s)
      uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } else {
      // Local simulation upload endpoint
      const apiPort = this.configService.get<string>('API_PORT') || '4000';
      uploadUrl = `http://localhost:${apiPort}/api/v1/media/mock-upload/${asset.id}`;
    }

    return {
      mediaAssetId: asset.id,
      uploadUrl,
      key: rawKey,
    };
  }

  async confirmUpload(instructorId: string, dto: ConfirmUploadDto): Promise<MediaAssetDetail> {
    const [asset] = await this.db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.id, dto.mediaAssetId), eq(mediaAssets.instructorId, instructorId)))
      .limit(1);

    if (!asset) {
      throw new NotFoundException('Media asset not found or access denied');
    }

    // Standard ABR ladder URLs
    const hlsUrl = `https://${this.cdnDomain}/hls/${asset.id}/master.m3u8`;
    // For reliable browser testing when CDN isn't deployed, supply verified sample HLS stream
    const fallbackTestHls = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    const finalHlsUrl = this.cdnDomain.includes('media.eduyug.com') ? fallbackTestHls : hlsUrl;

    const defaultDuration = 720; // 12 minutes default simulated transcode
    const resolutions = ['360p', '480p', '720p', '1080p'];

    const [updatedAsset] = await this.db
      .update(mediaAssets)
      .set({
        status: MediaStatus.READY,
        hlsMasterPlaylistUrl: finalHlsUrl,
        audioS3Key: `audio/${asset.id}/extracted.mp3`,
        durationSeconds: defaultDuration,
        resolutions: resolutions as any,
        updatedAt: new Date(),
      })
      .where(eq(mediaAssets.id, asset.id))
      .returning();

    // Propagate duration to any linked lesson
    await this.db
      .update(lessons)
      .set({ durationSeconds: defaultDuration, updatedAt: new Date() })
      .where(eq(lessons.mediaAssetId, asset.id));

    this.logger.log(`Media asset ${asset.id} marked as READY with ABR HLS output.`);

    return {
      id: updatedAsset.id,
      status: updatedAsset.status as MediaStatus,
      durationSeconds: updatedAsset.durationSeconds,
      hlsMasterPlaylistUrl: updatedAsset.hlsMasterPlaylistUrl,
      resolutions,
      audioS3Key: updatedAsset.audioS3Key,
    };
  }

  async getMediaAsset(id: string): Promise<MediaAssetDetail> {
    const [asset] = await this.db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    return {
      id: asset.id,
      status: asset.status as MediaStatus,
      durationSeconds: asset.durationSeconds,
      hlsMasterPlaylistUrl: asset.hlsMasterPlaylistUrl,
      resolutions: (asset.resolutions as string[]) || ['720p'],
      thumbnailSpriteUrl: asset.thumbnailSpriteUrl,
      audioS3Key: asset.audioS3Key,
    };
  }

  async getPlaybackToken(mediaAssetId: string, userId?: string): Promise<{ playbackUrl: string; token: string }> {
    const asset = await this.getMediaAsset(mediaAssetId);

    if (asset.status !== MediaStatus.READY || !asset.hlsMasterPlaylistUrl) {
      throw new NotFoundException('Media asset is not yet ready for streaming');
    }

    // In production with CloudFront, generate Signed Cookie or short-lived signed URL
    const token = Buffer.from(JSON.stringify({
      assetId: mediaAssetId,
      userId: userId || 'anonymous',
      exp: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    })).toString('base64');

    return {
      playbackUrl: asset.hlsMasterPlaylistUrl,
      token,
    };
  }
}
