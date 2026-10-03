import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LessonType } from '@eduyug/shared-types';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(LessonType)
  @IsOptional()
  lessonType?: LessonType;

  @IsString()
  @IsOptional()
  contentText?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(LessonType)
  @IsOptional()
  lessonType?: LessonType;

  @IsString()
  @IsOptional()
  contentText?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}
