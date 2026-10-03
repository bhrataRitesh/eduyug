import { pgTable, uuid, varchar, text, numeric, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { mediaAssets } from './media';
import { CourseStatus, LessonType } from '@eduyug/shared-types';

export const courseStatusEnum = pgEnum('course_status', [
  CourseStatus.DRAFT,
  CourseStatus.REVIEW_PENDING,
  CourseStatus.PUBLISHED,
  CourseStatus.ARCHIVED,
  CourseStatus.REJECTED,
]);

export const lessonTypeEnum = pgEnum('lesson_type', [
  LessonType.VIDEO,
  LessonType.ARTICLE,
  LessonType.QUIZ,
]);

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  instructorId: uuid('instructor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 280 }).notNull().unique(),
  subtitle: varchar('subtitle', { length: 500 }),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  trailerVideoUrl: text('trailer_video_url'),
  priceInr: numeric('price_inr', { precision: 10, scale: 2 }).default('0.00').notNull(),
  salePriceInr: numeric('sale_price_inr', { precision: 10, scale: 2 }),
  language: varchar('language', { length: 50 }).default('English').notNull(),
  difficultyLevel: varchar('difficulty_level', { length: 30 }).default('all_levels').notNull(),
  status: courseStatusEnum('status').default(CourseStatus.DRAFT).notNull(),
  publishedVersionId: uuid('published_version_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const courseVersions = pgTable('course_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  snapshotTree: jsonb('snapshot_tree').notNull(),
  changeSummary: text('change_summary'),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sections = pgTable('sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => sections.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  lessonType: lessonTypeEnum('lesson_type').default(LessonType.VIDEO).notNull(),
  contentText: text('content_text'),
  mediaAssetId: uuid('media_asset_id').references(() => mediaAssets.id, { onDelete: 'set null' }),
  durationSeconds: integer('duration_seconds').default(0).notNull(),
  isPreview: boolean('is_preview').default(false).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
