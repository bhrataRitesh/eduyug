import { pgTable, uuid, varchar, boolean, timestamp, text, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { UserRole } from '@eduyug/shared-types';

export const userRoleEnum = pgEnum('user_role', [
  UserRole.LEARNER,
  UserRole.INSTRUCTOR,
  UserRole.ADMIN,
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: userRoleEnum('role').default(UserRole.LEARNER).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  headline: varchar('headline', { length: 255 }),
  bio: text('bio'),
  websiteUrl: text('website_url'),
  socialLinks: jsonb('social_links').default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const instructorProfiles = pgTable('instructor_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  panNumber: varchar('pan_number', { length: 10 }),
  gstin: varchar('gstin', { length: 15 }),
  bankAccountNumber: varchar('bank_account_number', { length: 30 }),
  bankIfsc: varchar('bank_ifsc', { length: 11 }),
  beneficiaryName: varchar('beneficiary_name', { length: 150 }),
  payoutTier: varchar('payout_tier', { length: 50 }).default('standard_80_20').notNull(),
  verificationStatus: varchar('verification_status', { length: 50 }).default('pending').notNull(),
  payoutEnabled: boolean('payout_enabled').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  deviceInfo: varchar('device_info', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
