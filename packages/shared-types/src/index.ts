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

export interface PresignUploadDto {
  filename: string;
  contentType: string;
  fileSize: number;
  lessonId?: string;
}

export interface PresignUploadResponse {
  mediaAssetId: string;
  uploadUrl: string;
  key: string;
}

export interface ConfirmUploadDto {
  mediaAssetId: string;
}

export interface MediaAssetDetail {
  id: string;
  status: MediaStatus;
  durationSeconds: number;
  hlsMasterPlaylistUrl?: string | null;
  resolutions: string[];
  thumbnailSpriteUrl?: string | null;
  audioS3Key?: string | null;
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

export interface CourseProgressResponse {
  courseId: string;
  completionPercentage: number;
  completedLessonIds: string[];
  lastPositionSeconds: number;
  lastLessonId?: string;
}

export interface EnrollmentSummary {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl?: string | null;
  enrolledAt: string;
  completionPercentage: number;
  totalLessons: number;
  completedLessonsCount: number;
}

// ------------------------------------------------------------------------------
// Commerce & Financial Ledger Types
// ------------------------------------------------------------------------------

export interface CreateOrderDto {
  courseId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amountInr: string;
  currency: string;
  key: string;
}

export interface VerifyPaymentDto {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  enrollmentId: string;
  courseSlug: string;
  firstLessonId: string;
}

export interface InstructorEarningsSummary {
  totalGrossSalesInr: string;
  totalInstructorRevenueInr: string;
  totalPlatformFeeInr: string;
  totalOrdersCount: number;
  withdrawableBalanceInr: string;
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
  contentText?: string | null;
  mediaAssetId?: string | null;
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
  instructorName?: string;
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

export interface CourseCardSummary {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  thumbnailUrl?: string | null;
  priceInr: string;
  salePriceInr?: string | null;
  language: string;
  difficultyLevel: string;
  status: CourseStatus;
  instructorName: string;
  totalLessons: number;
  totalDurationSeconds: number;
}

export interface CreateCourseDto {
  title: string;
  subtitle?: string;
  description?: string;
  categoryId?: string;
  priceInr?: number;
  language?: string;
  difficultyLevel?: string;
}

export interface UpdateCourseDto {
  title?: string;
  subtitle?: string;
  description?: string;
  categoryId?: string;
  priceInr?: number;
  salePriceInr?: number;
  language?: string;
  difficultyLevel?: string;
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
}

export interface CreateSectionDto {
  title: string;
  orderIndex?: number;
}

export interface UpdateSectionDto {
  title?: string;
  orderIndex?: number;
}

export interface CreateLessonDto {
  title: string;
  lessonType?: LessonType;
  contentText?: string;
  durationSeconds?: number;
  isPreview?: boolean;
  orderIndex?: number;
}

export interface UpdateLessonDto {
  title?: string;
  lessonType?: LessonType;
  contentText?: string;
  durationSeconds?: number;
  isPreview?: boolean;
  orderIndex?: number;
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
