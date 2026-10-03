'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Play,
  PlayCircle,
  Brain,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  Star,
  Terminal,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Code2,
  HelpCircle,
  Quote,
  Cpu,
} from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true });

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="relative overflow-hidden bg-[#080C14]">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-brand-600/25 via-accent-cyan/15 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-48 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-[1200px] -right-48 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        {/* Release / Innovation Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-brand-300 mb-8 backdrop-blur-md shadow-inner shadow-brand-500/10 hover:border-brand-500/40 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
          <span>Real-time pgvector RAG + Adaptive Multi-Bitrate HLS</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.08] mb-6">
          Architect Real Systems.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-brand-200 bg-clip-text text-transparent">
            Learn with an In-Browser
          </span>{' '}
          AI Tutor.
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Industrial-grade video courses covering distributed systems, Kafka, and cloud scale. Ask technical questions anytime—our RAG tutor cites the exact video timestamp.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link
            href="/courses"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-600/30 hover:shadow-brand-500/50 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02]"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/courses/distributed-systems-kafka-go"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2 group"
          >
            <PlayCircle className="w-4 h-4 text-accent-cyan" />
            <span>Watch Preview</span>
          </Link>
        </div>

        {/* Interactive Classroom Mockup Preview */}
        <div className="relative max-w-5xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl shadow-black/80">
          <div className="bg-[#0B101E] rounded-xl overflow-hidden border border-slate-800 text-left">
            {/* Window Topbar */}
            <div className="h-10 bg-slate-950/80 border-b border-slate-800/80 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-brand-400" />
                <span>eduyug.com/learn/distributed-systems-kafka-go</span>
              </div>
              <div className="text-[10px] text-accent-cyan font-semibold px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/30">
                1080p ABR • Live
              </div>
            </div>

            {/* Split Classroom Preview: Video on Left, AI Tutor on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              {/* Video Simulated Stage */}
              <div className="lg:col-span-7 bg-slate-950 p-6 flex flex-col justify-between relative group">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">Module 1 • Lesson 2</div>
                  <h3 className="text-base font-bold text-white">Kafka Consumer Group Protocol & Offset Commit Semantics</h3>
                </div>

                <div className="my-8 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                </div>

                {/* Simulated scrub bar */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full w-2/5 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>02:25 / 08:10</span>
                    <span className="text-brand-300">Offset Commit Analysis</span>
                  </div>
                </div>
              </div>

              {/* AI Tutor Chat Simulated Stage */}
              <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#0E1528] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">AI Tutor Assistant</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Connected to Video Transcripts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Chat Message with Clickable Citation */}
                <div className="space-y-3 my-4">
                  <div className="p-3 rounded-xl bg-brand-600/20 border border-brand-500/30 text-xs text-brand-100 ml-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Learner</span>
                    Where is consumer group offset committing explained?
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 mr-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-accent-cyan block">AI Tutor • 142ms</span>
                    <p className="leading-relaxed">
                      The instructor explains manual vs automatic offset committing and duplicate processing risks at
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-500/20 border border-brand-500/40 text-brand-300 font-bold text-[11px] cursor-pointer hover:bg-brand-500/30 transition-all">
                      <PlayCircle className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Jump to [02:25]</span>
                    </div>
                  </div>
                </div>

                {/* Input box */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="h-9 px-3 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-400 flex items-center justify-between">
                    <span>Ask about this lesson...</span>
                    <div className="px-2 py-0.5 bg-brand-600 rounded text-[10px] font-bold text-white">Ask</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Metrics Counter Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-slate-800/80 max-w-4xl mx-auto">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">15,000+</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Engineers</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-accent-cyan mb-1">4.9 / 5.0</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Average Course Rating</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-accent-emerald mb-1">&lt; 150ms</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">RAG Vector Latency</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-brand-300 mb-1">99.9%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">CDN Availability</div>
          </div>
        </div>
      </section>

      {/* Featured Course Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden glass-panel border border-brand-500/30">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-600/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-brand-300" />
                <span>Featured Masterclass</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Production-Grade Distributed Systems with Kafka & Go
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Master event streaming, consumer group rebalancing, and exactly-once semantics at scale. Includes complete source code, Protocol Buffers schemas, and AI RAG assistance.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> 4 In-Depth Lessons</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> 33m High-Bitrate Video</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> Interactive AI Tutor</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> Certificate of Completion</span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl p-6 border border-slate-700/80 text-center space-y-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">One-time Enrollment</div>
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-3xl font-extrabold text-white">₹2,999</span>
                <span className="text-sm line-through text-slate-500">₹4,999</span>
                <span className="text-xs font-bold text-accent-emerald px-2 py-0.5 rounded bg-accent-emerald/10 border border-accent-emerald/20">40% OFF</span>
              </div>
              <Link
                href="/courses/distributed-systems-kafka-go"
                className="w-full py-3 px-6 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-[11px] text-slate-500">
                Instant access via Razorpay • 30-day money-back guarantee
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Engineered for Modern Developers
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Every feature in EduYug is built to eliminate friction and maximize technical understanding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Contextual AI Tutor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No generic answers. Queries are matched against 1536-dimensional embeddings of actual transcripts, returning precise timestamp badges you can click to jump.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Adaptive HLS Streaming</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Direct S3 presigned multipart ingestion and multi-bitrate encoding (360p to 1080p). Zero buffer delays on mobile, desktop, or poor network conditions.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-accent-emerald/20 text-accent-emerald flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Double-Entry Financials</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Razorpay checkout with cryptographic HMAC-SHA256 signature verification and automated double-entry ledger allocation between platform and instructor.
            </p>
          </div>
        </div>
      </section>

      {/* Engineer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-300">
            <Quote className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Learner Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by Senior Engineers Across Top Tech
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Engineers from high-growth tech companies use EduYug to master core infrastructure patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote:
                'The Kafka consumer group rebalancing and idempotent producer breakdown solved an actual high-severity latency bottleneck in our payment processing pipeline.',
              author: 'Aakash Verma',
              role: 'Staff Infrastructure Engineer',
              company: 'Fintech Payments Platform',
              initial: 'A',
            },
            {
              quote:
                'Having an in-browser AI Tutor that cites the exact video timestamp is revolutionary. I asked about Saga rollback compensation and had the 2-minute video clip in 150ms.',
              author: 'Priya Sundaram',
              role: 'Senior Backend Architect',
              company: 'Logistics Unicorn',
              initial: 'P',
            },
            {
              quote:
                'No toy Todo apps. Every single line of code is structured with real domain-driven design, Protocol Buffers, and Kubernetes manifests ready for production.',
              author: 'Rohan Sharma',
              role: 'Lead Platform Engineer',
              company: 'Cloud Scale-up',
              initial: 'R',
            },
          ].map((t, idx) => (
            <div key={idx} className="glass-card p-8 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center font-bold text-white text-sm shadow-md">
                  {t.initial}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.author}</h4>
                  <div className="text-[11px] text-brand-300">{t.role}</div>
                  <div className="text-[10px] text-slate-500">{t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/80">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-300">
            <HelpCircle className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            Everything you need to know about curriculum access, the AI Tutor, and technical prerequisites.
          </p>
        </div>

        <div className="space-y-3.5">
          {[
            {
              q: 'Do I get lifetime access to course videos and future updates?',
              a: 'Yes! Once you enroll in any EduYug masterclass, you receive full lifetime access to all lessons, source code repositories, and any future curriculum updates or architectural enhancements at zero additional charge.',
            },
            {
              q: 'How does the in-browser AI Tutor find exact video timestamps?',
              a: 'All video lectures are transcribed and chunked with millisecond-precision timestamps. We generate 1536-dimensional vector embeddings stored in PostgreSQL using pgvector. When you ask a question, Cosine Similarity search identifies the top matching transcript snippets and renders clickable video jump links.',
            },
            {
              q: 'Is complete source code included with every course?',
              a: 'Yes. Every masterclass comes with complete GitHub repositories including Docker Compose files, Kubernetes manifests, Helm charts, and automated integration tests.',
            },
            {
              q: 'What is your refund policy?',
              a: 'We offer a 30-Day 100% Money-Back Guarantee. If the course does not meet your engineering expectations, simply contact us within 30 days of purchase for a prompt, full refund with no questions asked.',
            },
          ].map((item, idx) => {
            const isOpen = !!openFaq[idx];
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 transition-all hover:border-slate-700"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-white pr-4">
                    {item.q}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-brand-400" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-r from-brand-900/60 via-slate-900 to-accent-cyan/20 border border-brand-500/30 text-center space-y-6 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center mx-auto text-brand-300">
            <Code2 className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
            Ready to Accelerate Your Engineering Career?
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of developers leveling up on distributed architectures, high-concurrency systems, and AI engineering.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/courses"
              className="px-8 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/40 transition-all flex items-center gap-2"
            >
              <span>Explore Course Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
