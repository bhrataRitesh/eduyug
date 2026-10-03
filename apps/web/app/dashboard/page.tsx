'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, PlayCircle, Clock, CheckCircle2, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { EnrollmentSummary } from '@eduyug/shared-types';

const DEMO_ENROLLMENTS: EnrollmentSummary[] = [
  {
    enrollmentId: 'enr-1',
    courseId: 'demo-1',
    courseTitle: 'Building Scalable Microservices with Node.js & Kafka',
    courseSlug: 'building-scalable-microservices-nodejs-kafka',
    thumbnailUrl: null,
    enrolledAt: new Date().toISOString(),
    completionPercentage: 35,
    totalLessons: 42,
    completedLessonsCount: 15,
  },
  {
    enrollmentId: 'enr-2',
    courseId: 'demo-2',
    courseTitle: 'Generative AI & LLM Systems Engineering from Scratch',
    courseSlug: 'generative-ai-llm-systems-engineering',
    thumbnailUrl: null,
    enrolledAt: new Date().toISOString(),
    completionPercentage: 60,
    totalLessons: 36,
    completedLessonsCount: 22,
  },
];

export default function LearnerDashboardPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>(DEMO_ENROLLMENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyEnrollments() {
      setLoading(true);
      const { data, error } = await fetchApi<EnrollmentSummary[]>('/api/v1/learning/my-enrollments');
      setLoading(false);
      if (!error && data && data.length > 0) {
        setEnrollments(data);
      }
    }
    loadMyEnrollments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Learner Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Learning Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Pick up right where you left off and track your syllabus progress.</p>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors self-start sm:self-auto text-xs"
        >
          <BookOpen className="w-4 h-4 text-brand-400" />
          <span>Browse More Courses</span>
        </Link>
      </div>

      {/* Enrolled Courses Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your enrolled courses...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl mt-8">
          <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No courses enrolled yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">Explore our technical engineering courses and start learning today.</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all"
          >
            <span>Explore Course Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {enrollments.map((enr) => (
            <div key={enr.enrollmentId} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>Enrolled on {new Date(enr.enrolledAt).toLocaleDateString()}</span>
                  <span className="font-bold text-accent-cyan">{enr.completionPercentage}% Done</span>
                </div>

                <h2 className="text-lg font-bold text-white line-clamp-2 mb-4 leading-snug">{enr.courseTitle}</h2>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-accent-cyan rounded-full transition-all duration-500"
                    style={{ width: `${enr.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />
                    <span>
                      {enr.completedLessonsCount} / {enr.totalLessons} Lessons
                    </span>
                  </div>
                </div>

                <Link
                  href={`/learn/${enr.courseSlug}/start`}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Resume Learning</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
