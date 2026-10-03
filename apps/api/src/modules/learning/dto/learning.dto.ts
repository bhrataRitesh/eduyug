import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class HeartbeatDto {
  @IsString()
  @IsNotEmpty()
  lessonId!: string;

  @IsNumber()
  @Min(0)
  currentSecond!: number;

  @IsNumber()
  @IsOptional()
  playbackRate?: number;
}
