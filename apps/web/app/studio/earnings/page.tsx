'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { InstructorEarningsSummary } from '@eduyug/shared-types';

export default function InstructorEarningsPage() {
  const [earnings, setEarnings] = useState<InstructorEarningsSummary>({
    totalGrossSalesInr: '49990.00',
    totalInstructorRevenueInr: '39992.00',
    totalPlatformFeeInr: '9998.00',
    totalOrdersCount: 10,
    withdrawableBalanceInr: '35992.80',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEarnings() {
      setLoading(true);
      const { data, error } = await fetchApi<InstructorEarningsSummary>('/api/v1/commerce/instructor/earnings');
      setLoading(false);
      if (!error && data) {
        setEarnings(data);
      }
    }
    loadEarnings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/studio"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Studio Dashboard</span>
      </Link>

      <div className="pb-8 border-b border-slate-800 mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Financial Earnings & Ledger</h1>
        <p className="text-sm text-slate-400 mt-1">
          Transparent double-entry accounting tracking gross sales, platform fees, and withdrawable payouts.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">₹{earnings.totalGrossSalesInr}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">From {earnings.totalOrdersCount} enrolled orders</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border-brand-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">Your Share (80%)</span>
            <TrendingUp className="w-4 h-4 text-accent-emerald" />
          </div>
          <div className="text-2xl font-extrabold text-accent-emerald">₹{earnings.totalInstructorRevenueInr}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Net instructor royalty earned</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Fee (20%)</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">₹{earnings.totalPlatformFeeInr}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Infrastructure & AI bandwidth</span>
        </div>

        <div className="glass-card p-6 rounded-2xl bg-brand-950/40 border-brand-500/40">
          <div className="flex items-center justify-between text-brand-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Withdrawable</span>
            <ShieldCheck className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-2xl font-extrabold text-white">₹{earnings.withdrawableBalanceInr}</div>
          <span className="text-[11px] text-brand-300/80 mt-1 block">Cleared 30-day escrow hold</span>
        </div>
      </div>

      {/* Double-Entry Ledger Explanation & Compliance Note */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <FileCheck className="w-5 h-5 text-accent-cyan" />
          <span>Automated Double-Entry Ledger Settlement</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          EduYug enforces an immutable double-entry journal ledger for every course transaction. When an order is completed via
          Razorpay, funds are immediately debited into <code className="text-brand-300">platform_cash_asset</code> and credited into your
          <code className="text-brand-300"> instructor_payable_liability</code> account.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5">30-Day Escrow Buffer:</strong>
              Student refund protections hold new enrollments in escrow for 30 days before unlocking for payout transfer.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5">Indian Tax Compliance (TDS & GST):</strong>
              Payout transfers to your registered bank account will include mandatory Section 194-O TDS deductions and detailed GST invoices.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
