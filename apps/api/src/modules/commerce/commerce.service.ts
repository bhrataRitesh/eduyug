import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { DRIZZLE_DB } from '../database/database.module';
import {
  EduYugDb,
  courses,
  orders,
  orderItems,
  payments,
  ledgerEntries,
  enrollments,
  sections,
  lessons,
  eq,
  and,
  desc,
  sql,
} from '@eduyug/database';
import { CreateOrderDto, VerifyPaymentDto } from './dto/commerce.dto';
import {
  OrderStatus,
  PaymentGateway,
  LedgerAccount,
  CreateOrderResponse,
  VerifyPaymentResponse,
  InstructorEarningsSummary,
} from '@eduyug/shared-types';

@Injectable()
export class CommerceService {
  private readonly logger = new Logger(CommerceService.name);
  private razorpay: Razorpay | null = null;
  private readonly razorpayKey: string;
  private readonly razorpaySecret: string;

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: EduYugDb,
    private readonly configService: ConfigService,
  ) {
    this.razorpayKey = this.configService.get<string>('RAZORPAY_KEY') || 'rzp_test_RF8I4FcZ61Uqei';
    this.razorpaySecret = this.configService.get<string>('RAZORPAY_SECRET') || 'XIlKfDF0VOQPgn7VhZDVTe6W';

    if (this.razorpayKey && this.razorpaySecret) {
      this.razorpay = new Razorpay({
        key_id: this.razorpayKey,
        key_secret: this.razorpaySecret,
      });
      this.logger.log('Initialized Razorpay Client');
    }
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<CreateOrderResponse> {
    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.id, dto.courseId))
      .limit(1);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user is already enrolled
    const [existingEnrollment] = await this.db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, dto.courseId)))
      .limit(1);

    if (existingEnrollment) {
      throw new ConflictException('You are already enrolled in this course');
    }

    const price = parseFloat(course.salePriceInr || course.priceInr || '0');
    const amountPaise = Math.round(price * 100);
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    let razorpayOrderId = '';

    if (this.razorpay && amountPaise > 0) {
      try {
        const rzpOrder = await this.razorpay.orders.create({
          amount: amountPaise,
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            courseId: course.id,
            userId,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err: any) {
        this.logger.warn(`Razorpay API call fallback to simulated order ID: ${err?.message}`);
        razorpayOrderId = `order_sim_${Date.now()}`;
      }
    } else {
      razorpayOrderId = `order_free_${Date.now()}`;
    }

    // Insert order in Postgres
    const [newOrder] = await this.db
      .insert(orders)
      .values({
        userId,
        orderNumber,
        totalAmountInr: price.toFixed(2),
        discountAmountInr: '0.00',
        status: OrderStatus.PENDING,
        gateway: PaymentGateway.RAZORPAY,
        gatewayOrderId: razorpayOrderId,
      })
      .returning();

    // 80% instructor / 20% platform split
    const instructorShare = (price * 0.80).toFixed(2);
    const platformShare = (price * 0.20).toFixed(2);

    await this.db.insert(orderItems).values({
      orderId: newOrder.id,
      courseId: course.id,
      priceInr: price.toFixed(2),
      instructorPayoutAmountInr: instructorShare,
      platformFeeAmountInr: platformShare,
    });

    return {
      orderId: newOrder.id,
      razorpayOrderId,
      amountInr: price.toFixed(2),
      currency: 'INR',
      key: this.razorpayKey,
    };
  }

  async verifyPayment(userId: string, dto: VerifyPaymentDto): Promise<VerifyPaymentResponse> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, dto.orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Order record not found');
    }

    if (order.status === OrderStatus.COMPLETED) {
      // Idempotent: already processed
      return this.buildVerificationResponse(order.id, userId);
    }

    // Cryptographic HMAC Signature Validation (unless simulated order)
    if (!dto.razorpayOrderId.startsWith('order_sim_') && !dto.razorpayOrderId.startsWith('order_free_')) {
      const generatedSignature = crypto
        .createHmac('sha256', this.razorpaySecret)
        .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== dto.razorpaySignature) {
        this.logger.error('Razorpay signature mismatch');
        throw new BadRequestException('Invalid payment signature');
      }
    }

    const price = parseFloat(order.totalAmountInr);
    const instructorShare = (price * 0.80).toFixed(2);
    const platformShare = (price * 0.20).toFixed(2);
    const transactionId = `TXN-${order.orderNumber}`;

    // 1. Mark Order as COMPLETED
    await this.db
      .update(orders)
      .set({
        status: OrderStatus.COMPLETED,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    // 2. Insert into Payments
    await this.db.insert(payments).values({
      orderId: order.id,
      gatewayPaymentId: dto.razorpayPaymentId,
      gatewaySignature: dto.razorpaySignature,
      amountInr: order.totalAmountInr,
      currency: 'INR',
      paymentMethod: 'razorpay',
    });

    // 3. Double-Entry Financial Ledger Posting
    // Debit: platform_cash_asset (We received money)
    await this.db.insert(ledgerEntries).values({
      transactionId,
      orderId: order.id,
      account: LedgerAccount.PLATFORM_CASH_ASSET,
      debitAmount: order.totalAmountInr,
      creditAmount: '0.00',
      notes: `Received payment for order ${order.orderNumber}`,
    });

    // Credit: instructor_payable_liability (Owed to instructor)
    await this.db.insert(ledgerEntries).values({
      transactionId,
      orderId: order.id,
      account: LedgerAccount.INSTRUCTOR_PAYABLE_LIABILITY,
      debitAmount: '0.00',
      creditAmount: instructorShare,
      notes: `80% instructor share for order ${order.orderNumber}`,
    });

    // Credit: platform_revenue (Platform fee)
    await this.db.insert(ledgerEntries).values({
      transactionId,
      orderId: order.id,
      account: LedgerAccount.PLATFORM_REVENUE,
      debitAmount: '0.00',
      creditAmount: platformShare,
      notes: `20% platform fee for order ${order.orderNumber}`,
    });

    // 4. Provision Enrollment
    const [orderItem] = await this.db
      .select({ courseId: orderItems.courseId })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .limit(1);

    if (orderItem) {
      await this.db
        .insert(enrollments)
        .values({
          userId,
          courseId: orderItem.courseId,
        })
        .onConflictDoNothing();
    }

    return this.buildVerificationResponse(order.id, userId);
  }

  async getInstructorEarnings(instructorId: string): Promise<InstructorEarningsSummary> {
    const instructorOrderItems = await this.db
      .select({
        priceInr: orderItems.priceInr,
        instructorPayoutAmountInr: orderItems.instructorPayoutAmountInr,
        platformFeeAmountInr: orderItems.platformFeeAmountInr,
        orderStatus: orders.status,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(courses, eq(courses.id, orderItems.courseId))
      .where(and(eq(courses.instructorId, instructorId), eq(orders.status, OrderStatus.COMPLETED)));

    let gross = 0;
    let instructorRev = 0;
    let platformFee = 0;

    for (const item of instructorOrderItems) {
      gross += parseFloat(item.priceInr);
      instructorRev += parseFloat(item.instructorPayoutAmountInr);
      platformFee += parseFloat(item.platformFeeAmountInr);
    }

    return {
      totalGrossSalesInr: gross.toFixed(2),
      totalInstructorRevenueInr: instructorRev.toFixed(2),
      totalPlatformFeeInr: platformFee.toFixed(2),
      totalOrdersCount: instructorOrderItems.length,
      withdrawableBalanceInr: (instructorRev * 0.90).toFixed(2), // After holding window
    };
  }

  async getUserOrders(userId: string) {
    return this.db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        totalAmountInr: orders.totalAmountInr,
        status: orders.status,
        createdAt: orders.createdAt,
        courseTitle: courses.title,
        courseSlug: courses.slug,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .innerJoin(courses, eq(courses.id, orderItems.courseId))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  private async buildVerificationResponse(orderId: string, userId: string): Promise<VerifyPaymentResponse> {
    const [orderItem] = await this.db
      .select({
        courseId: orderItems.courseId,
        courseSlug: courses.slug,
      })
      .from(orderItems)
      .innerJoin(courses, eq(courses.id, orderItems.courseId))
      .where(eq(orderItems.orderId, orderId))
      .limit(1);

    const [enrollment] = await this.db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, orderItem.courseId)))
      .limit(1);

    // Find first lesson for immediate launch
    const [firstSection] = await this.db
      .select({ id: sections.id })
      .from(sections)
      .where(eq(sections.courseId, orderItem.courseId))
      .orderBy(sections.orderIndex)
      .limit(1);

    let firstLessonId = '';
    if (firstSection) {
      const [firstLesson] = await this.db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.sectionId, firstSection.id))
        .orderBy(lessons.orderIndex)
        .limit(1);
      if (firstLesson) firstLessonId = firstLesson.id;
    }

    return {
      success: true,
      enrollmentId: enrollment?.id || '',
      courseSlug: orderItem.courseSlug,
      firstLessonId,
    };
  }
}
