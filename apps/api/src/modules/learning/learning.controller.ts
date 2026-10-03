import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LearningService } from './learning.service';
import { HeartbeatDto } from './dto/learning.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPayload } from '@eduyug/shared-types';

@Controller('api/v1/learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @UseGuards(JwtAuthGuard)
  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  async recordHeartbeat(
    @CurrentUser() user: UserPayload,
    @Body() dto: HeartbeatDto,
  ) {
    return this.learningService.recordHeartbeat(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('courses/:courseId/progress')
  async getCourseProgress(
    @CurrentUser() user: UserPayload,
    @Param('courseId') courseId: string,
  ) {
    return this.learningService.getCourseProgress(user.sub, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-enrollments')
  async getMyEnrollments(@CurrentUser() user: UserPayload) {
    return this.learningService.getMyEnrollments(user.sub);
  }
}
