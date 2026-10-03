import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { PresignUploadDto, ConfirmUploadDto } from './dto/media.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserPayload } from '@eduyug/shared-types';

@Controller('api/v1/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Post('presign-upload')
  async presignUpload(
    @CurrentUser() user: UserPayload,
    @Body() dto: PresignUploadDto,
  ) {
    return this.mediaService.presignUpload(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Post('confirm-upload')
  @HttpCode(HttpStatus.OK)
  async confirmUpload(
    @CurrentUser() user: UserPayload,
    @Body() dto: ConfirmUploadDto,
  ) {
    return this.mediaService.confirmUpload(user.sub, dto);
  }

  @Get(':id')
  async getMediaAsset(@Param('id') id: string) {
    return this.mediaService.getMediaAsset(id);
  }

  @Get(':id/playback-token')
  async getPlaybackToken(
    @Param('id') id: string,
  ) {
    return this.mediaService.getPlaybackToken(id);
  }

  // Local simulated upload endpoint for development without active AWS S3 account
  @Put('mock-upload/:id')
  @HttpCode(HttpStatus.OK)
  async mockUpload(@Param('id') id: string) {
    return { success: true, message: `Mock file received for asset ${id}` };
  }
}
