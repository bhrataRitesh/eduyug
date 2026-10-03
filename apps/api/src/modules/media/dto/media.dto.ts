import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PresignUploadDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsNumber()
  @Min(1)
  fileSize!: number;

  @IsString()
  @IsOptional()
  lessonId?: string;
}

export class ConfirmUploadDto {
  @IsString()
  @IsNotEmpty()
  mediaAssetId!: string;
}
