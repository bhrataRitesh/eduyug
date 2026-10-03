import { pgTable, uuid, timestamp, integer, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses, lessons, courseVersions } from './courses';

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'restrict' }),
    courseVersionId: uuid('course_version_id').references(() => courseVersions.id),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    certificateId: uuid('certificate_id'),
  },
  (table) => ({
    userCourseEnrollmentIdx: uniqueIndex('idx_user_course_enrollment').on(table.userId, table.courseId),
  })
);

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    enrollmentId: uuid('enrollment_id')
      .notNull()
      .references(() => enrollments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    lastPositionSeconds: integer('last_position_seconds').default(0).notNull(),
    maxPositionSeconds: integer('max_position_seconds').default(0).notNull(),
    isCompleted: boolean('is_completed').default(false).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    enrollmentLessonProgressIdx: uniqueIndex('idx_enrollment_lesson_progress').on(table.enrollmentId, table.lessonId),
    userLessonProgressIdx: uniqueIndex('idx_user_lesson_progress').on(table.userId, table.lessonId),
  })
);
