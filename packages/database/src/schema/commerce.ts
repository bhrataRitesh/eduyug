import { pgTable, uuid, varchar, numeric, timestamp, text, pgEnum, date } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';
import { OrderStatus, PaymentGateway, LedgerAccount } from '@eduyug/shared-types';

export const orderStatusEnum = pgEnum('order_status', [
  OrderStatus.PENDING,
  OrderStatus.COMPLETED,
  OrderStatus.FAILED,
  OrderStatus.REFUNDED,
]);

export const paymentGatewayEnum = pgEnum('payment_gateway', [
  PaymentGateway.RAZORPAY,
  PaymentGateway.STRIPE,
]);

export const ledgerAccountEnum = pgEnum('ledger_account', [
  LedgerAccount.PLATFORM_CASH_ASSET,
  LedgerAccount.INSTRUCTOR_PAYABLE_LIABILITY,
  LedgerAccount.PLATFORM_REVENUE,
  LedgerAccount.REFUND_LOSS_EXPENSE,
]);

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  orderNumber: varchar('order_number', { length: 64 }).notNull().unique(),
  totalAmountInr: numeric('total_amount_inr', { precision: 10, scale: 2 }).notNull(),
  discountAmountInr: numeric('discount_amount_inr', { precision: 10, scale: 2 }).default('0.00').notNull(),
  status: orderStatusEnum('status').default(OrderStatus.PENDING).notNull(),
  gateway: paymentGatewayEnum('gateway').default(PaymentGateway.RAZORPAY).notNull(),
  gatewayOrderId: varchar('gateway_order_id', { length: 128 }).unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id),
  priceInr: numeric('price_inr', { precision: 10, scale: 2 }).notNull(),
  instructorPayoutAmountInr: numeric('instructor_payout_amount_inr', { precision: 10, scale: 2 }).notNull(),
  platformFeeAmountInr: numeric('platform_fee_amount_inr', { precision: 10, scale: 2 }).notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  gatewayPaymentId: varchar('gateway_payment_id', { length: 128 }).notNull().unique(),
  gatewaySignature: varchar('gateway_signature', { length: 255 }).notNull(),
  amountInr: numeric('amount_inr', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  capturedAt: timestamp('captured_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ledgerEntries = pgTable('ledger_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: varchar('transaction_id', { length: 128 }).notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  account: ledgerAccountEnum('account').notNull(),
  debitAmount: numeric('debit_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  creditAmount: numeric('credit_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const instructorPayouts = pgTable('instructor_payouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  instructorId: uuid('instructor_id')
    .notNull()
    .references(() => users.id),
  amountInr: numeric('amount_inr', { precision: 10, scale: 2 }).notNull(),
  tdsDeductedInr: numeric('tds_deducted_inr', { precision: 10, scale: 2 }).default('0.00').notNull(),
  netPaidInr: numeric('net_paid_inr', { precision: 10, scale: 2 }).notNull(),
  gatewayTransferId: varchar('gateway_transfer_id', { length: 128 }),
  payoutStatus: varchar('payout_status', { length: 50 }).default('processing').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  settledAt: timestamp('settled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
