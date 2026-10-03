'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { CourseDetail, LessonType } from '@eduyug/shared-types';

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
  const slug = params?.slug as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ s1: true });
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Course Catalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Course Header & Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-300 mb-4">
              <Sparkles className="w-3 h-3 text-accent-cyan" />
              <span>AI Tutor Ready</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-base text-slate-300 mt-3 leading-relaxed">
              {course.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-6 pt-4 border-t border-slate-800">
              <span>Authored by <strong className="text-slate-200">{course.instructorName || 'Ritesh Kumar'}</strong></span>
              <span>•</span>
              <span className="capitalize">{course.difficultyLevel}</span>
              <span>•</span>
              <span>{course.language}</span>
              <span>•</span>
              <span>Last updated October 2026</span>
            </div>
          </div>

          {/* Curriculum Section */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Curriculum Syllabus</h2>
              <span className="text-xs text-slate-400">
                {course.sections?.length || 0} Sections • {totalLessons} Lessons • {totalHours} Hours
              </span>
            </div>

            <div className="space-y-3">
              {course.sections?.map((section, idx) => {
                const isOpen = openSections[section.id] ?? (idx === 0);
                return (
                  <div key={section.id} className="glass-panel rounded-xl overflow-hidden border border-slate-800">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-brand-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-sm font-semibold text-white">{section.title}</span>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {section.lessons.length} lessons
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-3 divide-y divide-slate-800/60 bg-slate-950/40">
                        {section.lessons.map((lesson) => (
                          <div key={lesson.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5 text-slate-300">
                              {lesson.lessonType === LessonType.VIDEO ? (
                                <PlayCircle className="w-4 h-4 text-brand-400 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span>{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500">
                              {lesson.isPreview && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30">
                                  Preview
                                </span>
                              )}
                              <span>{Math.round(lesson.durationSeconds / 60)} min</span>
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

          {/* Description Markdown Overview */}
          <div className="pt-6">
            <h2 className="text-xl font-bold text-white tracking-tight mb-4">Course Description</h2>
            <div className="glass-card p-6 rounded-2xl text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {course.description || 'Comprehensive course material structured for real-world engineering mastery.'}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Checkout Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 glass-card p-6 rounded-2xl border border-brand-500/30 shadow-2xl">
            {/* Price Header */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold text-white">
                ₹{course.salePriceInr || course.priceInr}
              </span>
              {course.salePriceInr && (
                <span className="text-sm line-through text-slate-500">₹{course.priceInr}</span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent-rose/20 text-accent-rose border border-accent-rose/30">
                Limited Offer
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => alert(`Starting Razorpay checkout for ${course.title}...`)}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 mb-4"
            >
              <span>Enroll Now</span>
            </button>

            <p className="text-center text-[11px] text-slate-400 mb-6">
              Instant UPI, Cards & Netbanking via Razorpay
            </p>

            {/* Benefits Checklist */}
            <div className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-accent-emerald shrink-0" />
                <span>Full lifetime access to all lessons</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-accent-cyan shrink-0" />
                <span>24/7 AI Tutor with video timestamp citations</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-accent-emerald shrink-0" />
                <span>Certificate of Completion</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Learn at your own pace on web & mobile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
