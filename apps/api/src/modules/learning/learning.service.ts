import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DB } from '../database/database.module';
import {
  EduYugDb,
  enrollments,
  lessonProgress,
  lessons,
  courses,
  sections,
  eq,
  and,
  desc,
  sql,
} from '@eduyug/database';
import { HeartbeatDto } from './dto/learning.dto';
import { CourseProgressResponse, EnrollmentSummary } from '@eduyug/shared-types';

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(@Inject(DRIZZLE_DB) private readonly db: EduYugDb) {}

  async recordHeartbeat(userId: string, dto: HeartbeatDto): Promise<{ isCompleted: boolean }> {
    const [lesson] = await this.db
      .select({
        id: lessons.id,
        courseId: lessons.courseId,
        durationSeconds: lessons.durationSeconds,
      })
      .from(lessons)
      .where(eq(lessons.id, dto.lessonId))
      .limit(1);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Find enrollment
    const [enrollment] = await this.db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, lesson.courseId)))
      .limit(1);

    if (!enrollment) {
      // Auto-enroll if free preview or not strictly gated
      this.logger.debug(`User ${userId} pinged lesson ${dto.lessonId} without active enrollment.`);
      return { isCompleted: false };
    }

    // 90% threshold for automatic completion
    const duration = lesson.durationSeconds || 600;
    const isNowCompleted = dto.currentSecond >= 0.90 * duration;

    const [existingProgress] = await this.db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, dto.lessonId)))
      .limit(1);

    if (existingProgress) {
      const maxPos = Math.max(existingProgress.maxPositionSeconds, Math.round(dto.currentSecond));
      const finalCompleted = existingProgress.isCompleted || isNowCompleted;

      await this.db
        .update(lessonProgress)
        .set({
          lastPositionSeconds: Math.round(dto.currentSecond),
          maxPositionSeconds: maxPos,
          isCompleted: finalCompleted,
          completedAt: finalCompleted && !existingProgress.completedAt ? new Date() : existingProgress.completedAt,
          updatedAt: new Date(),
        })
        .where(eq(lessonProgress.id, existingProgress.id));

      return { isCompleted: finalCompleted };
    } else {
      await this.db.insert(lessonProgress).values({
        enrollmentId: enrollment.id,
        userId,
        lessonId: dto.lessonId,
        lastPositionSeconds: Math.round(dto.currentSecond),
        maxPositionSeconds: Math.round(dto.currentSecond),
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted ? new Date() : null,
      });

      return { isCompleted: isNowCompleted };
    }
  }

  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgressResponse> {
    const courseLessons = await this.db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.courseId, courseId));

    const totalLessons = courseLessons.length;
    if (totalLessons === 0) {
      return {
        courseId,
        completionPercentage: 0,
        completedLessonIds: [],
        lastPositionSeconds: 0,
      };
    }

    const progressRecords = await this.db
      .select({
        lessonId: lessonProgress.lessonId,
        isCompleted: lessonProgress.isCompleted,
        lastPositionSeconds: lessonProgress.lastPositionSeconds,
        updatedAt: lessonProgress.updatedAt,
      })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.isCompleted, true)));

    const lessonIdSet = new Set(courseLessons.map((l) => l.id));
    const completedForThisCourse = progressRecords.filter((p) => lessonIdSet.has(p.lessonId));
    const completedLessonIds = completedForThisCourse.map((p) => p.lessonId);
    const completionPercentage = Math.round((completedLessonIds.length / totalLessons) * 100);

    // Get last active lesson
    const [latestActivity] = await this.db
      .select({
        lessonId: lessonProgress.lessonId,
        lastPositionSeconds: lessonProgress.lastPositionSeconds,
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .where(and(eq(lessonProgress.userId, userId), eq(lessons.courseId, courseId)))
      .orderBy(desc(lessonProgress.updatedAt))
      .limit(1);

    return {
      courseId,
      completionPercentage,
      completedLessonIds,
      lastPositionSeconds: latestActivity?.lastPositionSeconds || 0,
      lastLessonId: latestActivity?.lessonId,
    };
  }

  async getMyEnrollments(userId: string): Promise<EnrollmentSummary[]> {
    const userEnrollments = await this.db
      .select({
        enrollmentId: enrollments.id,
        courseId: courses.id,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        thumbnailUrl: courses.thumbnailUrl,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .innerJoin(courses, eq(courses.id, enrollments.courseId))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));

    const results: EnrollmentSummary[] = [];

    for (const e of userEnrollments) {
      const [totalCount] = await this.db
        .select({ count: sql<number>`count(${lessons.id})::int` })
        .from(lessons)
        .where(eq(lessons.courseId, e.courseId));

      const [completedCount] = await this.db
        .select({ count: sql<number>`count(${lessonProgress.id})::int` })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessons.courseId, e.courseId),
            eq(lessonProgress.isCompleted, true),
          ),
        );

      const total = totalCount?.count || 0;
      const completed = completedCount?.count || 0;
      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      results.push({
        enrollmentId: e.enrollmentId,
        courseId: e.courseId,
        courseTitle: e.courseTitle,
        courseSlug: e.courseSlug,
        thumbnailUrl: e.thumbnailUrl,
        enrolledAt: e.enrolledAt.toISOString(),
        completionPercentage,
        totalLessons: total,
        completedLessonsCount: completed,
      });
    }

    return results;
  }
}
