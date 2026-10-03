import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Play, Brain, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-600/20 via-accent-cyan/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-brand-300 mb-8 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Next-Generation AI Tutoring Built Right Into Every Lesson</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Learn Faster with{' '}
          <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-brand-300 bg-clip-text text-transparent">
            AI-Augmented
          </span>{' '}
          Engineering Courses
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          High-definition video courses paired with an intelligent RAG tutor that answers questions with exact video timestamp citations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            href="/courses"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Teach on EduYug</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left">
          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Contextual AI Tutor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ask deep technical questions anytime. Our RAG engine searches exact lesson transcripts and jumps straight to the timestamp.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Adaptive HLS Streaming</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Silky smooth 1080p playback encoded across multi-bitrate ladders, cached worldwide on CloudFront CDN edges.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-accent-emerald/20 text-accent-emerald flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Seamless Razorpay Checkout</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instant UPI and card checkout backed by an immutable double-entry ledger and transparent instructor payouts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
