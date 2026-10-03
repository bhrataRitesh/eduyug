import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { MediaStatus } from '@eduyug/shared-types';

export const mediaStatusEnum = pgEnum('media_status', [
  MediaStatus.UPLOAD_PENDING,
  MediaStatus.PROCESSING,
  MediaStatus.READY,
  MediaStatus.FAILED,
]);

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  instructorId: uuid('instructor_id')
    .notNull()
    .references(() => users.id),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  rawS3Key: text('raw_s3_key').notNull(),
  hlsMasterPlaylistUrl: text('hls_master_playlist_url'),
  audioS3Key: text('audio_s3_key'),
  thumbnailSpriteUrl: text('thumbnail_sprite_url'),
  durationSeconds: integer('duration_seconds').default(0).notNull(),
  resolutions: jsonb('resolutions').default([]),
  status: mediaStatusEnum('status').default(MediaStatus.UPLOAD_PENDING).notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
