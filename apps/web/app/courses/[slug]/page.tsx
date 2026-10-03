'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Share2,
  AlertCircle,
  Star,
  Users,
  Award,
  Play,
  CheckCircle2,
  Lock,
  Flame,
  Zap,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { CourseDetail, LessonType, CreateOrderResponse, VerifyPaymentResponse } from '@eduyug/shared-types';

const DEMO_COURSE_DETAILS: Record<string, CourseDetail> = {
  'building-scalable-microservices-nodejs-kafka': {
    id: 'demo-1',
    instructorId: 'inst-1',
    instructorName: 'Ritesh Kumar',
    title: 'Building Scalable Microservices with Node.js & Kafka',
    slug: 'building-scalable-microservices-nodejs-kafka',
    subtitle: 'Master event-driven architecture, distributed transactions (Saga), and high-concurrency systems.',
    description: `### Why this course?
In this course, we dive deep into production-ready distributed systems. You won't just build a simple CRUD API; you will architect a real-time event-driven platform handling thousands of transactions per second.

### What you will learn:
- Clean modular monolith to microservice decomposition
- Apache Kafka topics, partitions, consumer groups, and idempotency
- Distributed transaction management with the Orchestrated Saga Pattern
- Outbox pattern with Change Data Capture (CDC)
- Deploying to Kubernetes with Helm and Prometheus observability`,
    priceInr: '4999.00',
    language: 'English',
    difficultyLevel: 'intermediate',
    status: 'published' as any,
    sections: [
      {
        id: 's1',
        courseId: 'demo-1',
        title: 'Section 1: Distributed Architecture Foundations',
        orderIndex: 0,
        lessons: [
          {
            id: 'l1',
            sectionId: 's1',
            courseId: 'demo-1',
            title: 'Welcome & System Architecture Overview',
            lessonType: LessonType.VIDEO,
            durationSeconds: 720,
            isPreview: true,
            orderIndex: 0,
          },
          {
            id: 'l2',
            sectionId: 's1',
            courseId: 'demo-1',
            title: 'Microservices vs Modular Monolith: The Trade-Offs',
            lessonType: LessonType.VIDEO,
            durationSeconds: 1140,
            isPreview: true,
            orderIndex: 1,
          },
        ],
      },
      {
        id: 's2',
        courseId: 'demo-1',
        title: 'Section 2: Apache Kafka & Event Streaming',
        orderIndex: 1,
        lessons: [
          {
            id: 'l3',
            sectionId: 's2',
            courseId: 'demo-1',
            title: 'Kafka Internals: Topics, Offsets, and Log Compaction',
            lessonType: LessonType.VIDEO,
            durationSeconds: 1800,
            isPreview: false,
            orderIndex: 0,
          },
          {
            id: 'l4',
            sectionId: 's2',
            courseId: 'demo-1',
            title: 'Building an Exactly-Once Producer & Consumer Pipeline',
            lessonType: LessonType.VIDEO,
            durationSeconds: 2100,
            isPreview: false,
            orderIndex: 1,
          },
        ],
      },
    ],
  },
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ s1: true });
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      const { data, error } = await fetchApi<CourseDetail>(`/api/v1/courses/detail/${slug}`);
      if (!error && data) {
        setCourse(data);
      } else {
        setCourse(DEMO_COURSE_DETAILS[slug] || DEMO_COURSE_DETAILS['building-scalable-microservices-nodejs-kafka']);
      }
      setLoading(false);
    }
    if (slug) {
      loadCourse();
    }
  }, [slug]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnroll = async () => {
    if (!course) return;
    setCheckoutError(null);
    const token = localStorage.getItem('eduyug_token');
    if (!token) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/courses/${slug}`)}`);
      return;
    }

    setEnrolling(true);

    const { data: orderData, error: orderError } = await fetchApi<CreateOrderResponse>('/api/v1/commerce/orders', {
      method: 'POST',
      body: JSON.stringify({ courseId: course.id }),
    });

    if (orderError || !orderData) {
      setEnrolling(false);
      setCheckoutError(orderError || 'Failed to initiate order');
      return;
    }

    const loadRazorpayScript = () => {
      return new Promise<boolean>((resolve) => {
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const isLoaded = await loadRazorpayScript();

    if (!isLoaded || !(window as any).Razorpay) {
      // Fallback for simulated development: auto-verify mock payment
      const { data: verifyData } = await fetchApi<VerifyPaymentResponse>('/api/v1/commerce/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          orderId: orderData.orderId,
          razorpayOrderId: orderData.razorpayOrderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'simulated_signature',
        }),
      });
      setEnrolling(false);
      if (verifyData?.success) {
        const firstLesson = course.sections?.[0]?.lessons?.[0]?.id || 'start';
        router.push(`/learn/${course.slug}/${firstLesson}`);
      }
      return;
    }

    const rawUser = localStorage.getItem('eduyug_user');
    const userObj = rawUser ? JSON.parse(rawUser) : null;

    const options = {
      key: orderData.key,
      amount: Math.round(parseFloat(orderData.amountInr) * 100),
      currency: orderData.currency,
      name: 'EduYug',
      description: course.title,
      order_id: orderData.razorpayOrderId,
      prefill: {
        email: userObj?.email || '',
        name: userObj?.profile?.firstName || '',
      },
      theme: {
        color: '#4F46E5',
      },
      handler: async function (response: any) {
        const { data: verifyData, error: verifyError } = await fetchApi<VerifyPaymentResponse>(
          '/api/v1/commerce/verify-payment',
          {
            method: 'POST',
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          }
        );

        setEnrolling(false);
        if (verifyError || !verifyData?.success) {
          setCheckoutError(verifyError || 'Payment verification failed');
        } else {
          const targetLesson = verifyData.firstLessonId || course.sections?.[0]?.lessons?.[0]?.id || 'start';
          router.push(`/learn/${course.slug}/${targetLesson}`);
        }
      },
      modal: {
        ondismiss: function () {
          setEnrolling(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading course curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Course not found</h2>
        <Link href="/courses" className="text-brand-400 hover:underline text-sm inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
      </div>
    );
  }

  const totalLessons = course.sections?.reduce((sum, s) => sum + s.lessons.length, 0) || 0;
  const totalSeconds =
    course.sections?.reduce((sum, s) => sum + s.lessons.reduce((lSum, l) => lSum + l.durationSeconds, 0), 0) || 0;
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

  const firstPreviewLesson = course?.sections
    ?.flatMap((s) => s.lessons)
    ?.find((l) => l.isPreview);
  const firstLessonId = firstPreviewLesson?.id || course?.sections?.[0]?.lessons?.[0]?.id || 'l1';

  const allSectionsOpen = course?.sections?.every((s) => openSections[s.id]) ?? false;
  const toggleAllSections = () => {
    if (!course?.sections) return;
    const nextState: Record<string, boolean> = {};
    course.sections.forEach((s) => {
      nextState[s.id] = !allSectionsOpen;
    });
    setOpenSections(nextState);
  };

  return (
    <div className="relative overflow-hidden bg-[#080C14]">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-brand-600/20 via-accent-cyan/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] -right-48 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/courses" className="hover:text-white transition-colors flex items-center gap-1.5 group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Course Catalog</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-md">{course.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Course Hero Banner */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-300">
                  <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>AI Tutor & Timestamp RAG Enabled</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-300 capitalize">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>{course.difficultyLevel} Level</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0 (1,840 ratings)</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                {course.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
                {course.subtitle}
              </p>

              {/* Course Meta Ribbon */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-600/40 border border-brand-500/50 flex items-center justify-center font-bold text-[10px] text-white">
                    {(course.instructorName || 'Ritesh Kumar')[0]}
                  </div>
                  <span>Created by <strong className="text-slate-200">{course.instructorName || 'Ritesh Kumar'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>12,450+ engineers enrolled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{totalHours} hrs high-bitrate video</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Official Certificate Included</span>
                </div>
              </div>
            </div>

            {/* Free Preview Video Spotlight Stage */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-brand-500/25">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-accent-cyan mb-0.5">
                      Complimentary Preview Lesson
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {firstPreviewLesson?.title || 'System Architecture & Core Overview'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Test-drive the interactive video player and ask the real-time AI Tutor questions.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/learn/${course.slug}/${firstLessonId}`}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 hover:to-cyan-400 shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02]"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Watch Free Preview</span>
                </Link>
              </div>
            </div>

            {/* Key Architectural Outcomes Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">What You Will Master</h2>
                <span className="text-xs text-brand-300 font-medium">Production-Grade Competencies</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    title: 'Distributed Saga Orchestration',
                    desc: 'Manage distributed transactions across independent databases with rollback compensations.',
                  },
                  {
                    title: 'Apache Kafka Zero-Loss Streaming',
                    desc: 'Configure partition keys, consumer group rebalancing, and idempotent message delivery.',
                  },
                  {
                    title: 'Change Data Capture (CDC) Outbox',
                    desc: 'Guarantee database-to-broker dual writes without distributed two-phase commit overhead.',
                  },
                  {
                    title: 'In-Browser AI Video RAG',
                    desc: 'Vector embeddings paired with millisecond timestamp markers to query any lecture topic.',
                  },
                  {
                    title: 'High-Throughput Load Testing',
                    desc: 'Benchmark endpoints to 10,000+ req/sec using realistic k6 and distributed metrics.',
                  },
                  {
                    title: 'Kubernetes & Helm Deployment',
                    desc: 'Containerize microservices with automated health probes, secrets, and Prometheus telemetry.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/30 transition-colors flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-md bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0 mt-0.5 border border-accent-emerald/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Syllabus Accordion */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Course Curriculum</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {course.sections?.length || 0} Modules • {totalLessons} Lessons • {totalHours} Total Hours
                  </p>
                </div>

                <button
                  onClick={toggleAllSections}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
                >
                  {allSectionsOpen ? 'Collapse All' : 'Expand All'}
                </button>
              </div>

              <div className="space-y-3">
                {course.sections?.map((section, idx) => {
                  const isOpen = openSections[section.id] ?? (idx === 0);
                  const secSeconds = section.lessons.reduce((acc, l) => acc + l.durationSeconds, 0);
                  const secMinutes = Math.round(secSeconds / 60);

                  return (
                    <div
                      key={section.id}
                      className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 transition-all hover:border-slate-700/80"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 shrink-0">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-brand-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white">{section.title}</span>
                            <div className="text-[11px] text-slate-400 mt-0.5 sm:hidden">
                              {section.lessons.length} lessons • {secMinutes} min
                            </div>
                          </div>
                        </div>
                        <span className="hidden sm:block text-xs font-medium text-slate-400 shrink-0">
                          {section.lessons.length} lessons • {secMinutes} min
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-3 divide-y divide-slate-800/60 bg-slate-950/50">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="py-3 flex items-center justify-between text-xs group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-3 text-slate-300">
                                {lesson.lessonType === LessonType.VIDEO ? (
                                  <PlayCircle className="w-4 h-4 text-brand-400 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <span className="font-medium group-hover:text-white transition-colors">
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {lesson.isPreview ? (
                                  <Link
                                    href={`/learn/${course.slug}/${lesson.id}`}
                                    className="px-2.5 py-1 rounded text-[11px] font-bold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/25 transition-all flex items-center gap-1"
                                  >
                                    <Play className="w-2.5 h-2.5 fill-accent-cyan" />
                                    <span>Preview Free</span>
                                  </Link>
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                                )}
                                <span className="text-slate-500 font-mono text-[11px]">
                                  {Math.round(lesson.durationSeconds / 60)} min
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructor Spotlight Card */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Your Course Instructor</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-brand-500/20 shrink-0">
                  {(course.instructorName || 'Ritesh Kumar')[0]}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {course.instructorName || 'Ritesh Kumar'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      Verified Architect
                    </span>
                  </div>
                  <p className="text-xs text-brand-200">
                    Principal Systems Engineer & Distributed Architect
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    Specializing in high-throughput transactional backends, Apache Kafka, and pgvector-backed retrieval pipelines. Has designed infrastructure powering millions of daily requests.
                  </p>
                </div>
              </div>
            </div>

            {/* Course Description Markdown */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Comprehensive Overview</h2>
              <div className="glass-card p-6 rounded-2xl text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line border border-slate-800/80">
                {course.description || 'Comprehensive course material structured for real-world engineering mastery.'}
              </div>
            </div>
          </div>

          {/* Right Sticky Checkout Sidebar (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="glass-card p-6 rounded-2xl border border-brand-500/30 shadow-2xl relative overflow-hidden">
                {/* Subtle Card Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Urgency Ribbon */}
                <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-semibold mb-5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>148 engineers enrolled in the last 48 hours</span>
                </div>

                {/* Price Display */}
                <div className="mb-6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Complete Lifetime Access
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-white">
                      ₹{course.salePriceInr || course.priceInr}
                    </span>
                    {course.salePriceInr && (
                      <span className="text-base line-through text-slate-500">₹{course.priceInr}</span>
                    )}
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30">
                      ₹2,000 OFF
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    One-time payment • All future curriculum updates included
                  </div>
                </div>

                {checkoutError && (
                  <div className="mb-4 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-center gap-2 text-accent-rose text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* CTA Action Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 shadow-xl shadow-brand-600/30 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <span>{enrolling ? 'Initiating Secure Checkout...' : 'Enroll in Masterclass'}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>

                  <Link
                    href={`/learn/${course.slug}/${firstLessonId}`}
                    className="w-full py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition-colors flex items-center justify-center gap-2 text-center"
                  >
                    <PlayCircle className="w-4 h-4 text-accent-cyan" />
                    <span>Try Free Preview Lesson</span>
                  </Link>
                </div>

                <div className="text-center text-[11px] text-slate-400 pb-5 border-b border-slate-800/80">
                  Instant UPI (GPay, PhonePe), Cards & Netbanking via Razorpay
                </div>

                {/* Guarantee & Benefits */}
                <div className="space-y-3 text-xs text-slate-300 pt-5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-accent-emerald shrink-0" />
                    <span>Full lifetime access to all 42 lessons</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-accent-cyan shrink-0" />
                    <span>In-browser AI Tutor with timestamp deep-linking</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-brand-300 shrink-0" />
                    <span>Full production GitHub repository source code</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-accent-emerald shrink-0" />
                    <span>Verifiable Certificate of Engineering Completion</span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800/60">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-emerald-300">
                      30-Day 100% Money-Back Guarantee
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Pill */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>HMAC-SHA256 Encrypted & Verified by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
