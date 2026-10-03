import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { TutorQueryDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPayload } from '@eduyug/shared-types';

@Controller('api/v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('tutor')
  @HttpCode(HttpStatus.OK)
  async queryTutor(
    @CurrentUser() user: UserPayload,
    @Body() dto: TutorQueryDto,
  ) {
    return this.aiService.queryTutor(user.sub, dto);
  }

  @Get('lessons/:lessonId/transcript')
  async getLessonTranscript(@Param('lessonId') lessonId: string) {
    return this.aiService.getLessonTranscript(lessonId);
  }
}
