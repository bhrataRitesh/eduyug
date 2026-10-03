// ==============================================================================
// EduYug Domain Enums & Interfaces
// ==============================================================================

export enum UserRole {
  LEARNER = 'learner',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

export enum CourseStatus {
  DRAFT = 'draft',
  REVIEW_PENDING = 'review_pending',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  REJECTED = 'rejected',
}

export enum LessonType {
  VIDEO = 'video',
  ARTICLE = 'article',
  QUIZ = 'quiz',
}

export enum MediaStatus {
  UPLOAD_PENDING = 'upload_pending',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentGateway {
  RAZORPAY = 'razorpay',
  STRIPE = 'stripe',
}

export enum LedgerAccount {
  PLATFORM_CASH_ASSET = 'platform_cash_asset',
  INSTRUCTOR_PAYABLE_LIABILITY = 'instructor_payable_liability',
  PLATFORM_REVENUE = 'platform_revenue',
  REFUND_LOSS_EXPENSE = 'refund_loss_expense',
}

// ------------------------------------------------------------------------------
// Auth & Identity Types
// ------------------------------------------------------------------------------

export interface UserPayload {
  sub: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  profile?: {
    firstName: string;
    lastName?: string | null;
    avatarUrl?: string | null;
    headline?: string | null;
    bio?: string | null;
  } | null;
}

// ------------------------------------------------------------------------------
// Learning Telemetry Types
// ------------------------------------------------------------------------------

export interface LearningHeartbeatDto {
  lessonId: string;
  currentSecond: number;
  playbackRate?: number;
}

// ------------------------------------------------------------------------------
// Course Catalog Types
// ------------------------------------------------------------------------------

export interface LessonSummary {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  lessonType: LessonType;
  durationSeconds: number;
  isPreview: boolean;
  orderIndex: number;
}

export interface SectionSummary {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: LessonSummary[];
}

export interface CourseDetail {
  id: string;
  instructorId: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  trailerVideoUrl?: string | null;
  priceInr: string;
  salePriceInr?: string | null;
  language: string;
  difficultyLevel: string;
  status: CourseStatus;
  sections?: SectionSummary[];
}

// ------------------------------------------------------------------------------
// AI & RAG Query Contracts
// ------------------------------------------------------------------------------

export interface RagQueryRequest {
  courseId: string;
  lessonId?: string;
  query: string;
}

export interface Citation {
  chunkId: string;
  lessonId: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  similarity: number;
}

export interface RagQueryResponse {
  answer: string;
  citations: Citation[];
}
