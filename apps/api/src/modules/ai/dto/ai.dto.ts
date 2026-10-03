import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TutorQueryDto {
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @IsString()
  @IsOptional()
  lessonId?: string;

  @IsString()
  @IsNotEmpty()
  query!: string;
}

export class TranscribeLessonDto {
  @IsString()
  @IsNotEmpty()
  lessonId!: string;

  @IsString()
  @IsNotEmpty()
  mediaAssetId!: string;
}
