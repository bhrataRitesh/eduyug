'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, BarChart3, Sparkles, Filter } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { CourseCardSummary, CourseStatus } from '@eduyug/shared-types';

const INITIAL_FALLBACK_COURSES: CourseCardSummary[] = [
  {
    id: 'demo-1',
    title: 'Building Scalable Microservices with Node.js & Kafka',
    slug: 'building-scalable-microservices-nodejs-kafka',
    subtitle: 'Master event-driven architecture, distributed transactions, and high-concurrency systems.',
    priceInr: '4999.00',
    language: 'English',
    difficultyLevel: 'intermediate',
    status: CourseStatus.PUBLISHED,
    instructorName: 'Ritesh Kumar',
    totalLessons: 42,
    totalDurationSeconds: 43200, // 12 hours
  },
  {
    id: 'demo-2',
    title: 'Generative AI & LLM Systems Engineering from Scratch',
    slug: 'generative-ai-llm-systems-engineering',
    subtitle: 'Build production RAG pipelines, fine-tune models, and deploy scalable vector search.',
    priceInr: '6499.00',
    salePriceInr: '4999.00',
    language: 'English',
    difficultyLevel: 'advanced',
    status: CourseStatus.PUBLISHED,
    instructorName: 'Ritesh Kumar',
    totalLessons: 36,
    totalDurationSeconds: 36000, // 10 hours
  },
  {
    id: 'demo-3',
    title: 'Full-Stack Next.js 14, TypeScript & PostgreSQL Masterclass',
    slug: 'fullstack-nextjs-typescript-postgresql',
    subtitle: 'From zero to production: Server components, Drizzle ORM, auth, and cloud deployment.',
    priceInr: '3499.00',
    language: 'English',
    difficultyLevel: 'beginner',
    status: CourseStatus.PUBLISHED,
    instructorName: 'Ritesh Kumar',
    totalLessons: 28,
    totalDurationSeconds: 28800, // 8 hours
  },
];

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<CourseCardSummary[]>(INITIAL_FALLBACK_COURSES);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (difficulty !== 'all') queryParams.append('difficulty', difficulty);

      const endpoint = `/api/v1/courses?${queryParams.toString()}`;
      const { data, error } = await fetchApi<CourseCardSummary[]>(endpoint);

      setLoading(false);
      if (!error && data && data.length > 0) {
        setCourses(data);
      } else if (!search && difficulty === 'all') {
        setCourses(INITIAL_FALLBACK_COURSES);
      } else {
        // Filter fallback if backend has no records yet
        const filtered = INITIAL_FALLBACK_COURSES.filter((c) => {
          const matchDifficulty = difficulty === 'all' || c.difficultyLevel === difficulty;
          const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.subtitle?.toLowerCase().includes(search.toLowerCase());
          return matchDifficulty && matchSearch;
        });
        setCourses(filtered);
      }
    }

    const timer = setTimeout(() => {
      loadCourses();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, difficulty]);

  const formatHours = (seconds: number) => {
    const hours = Math.round((seconds / 3600) * 10) / 10;
    return `${hours} hrs`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Technical Courses
        </h1>
        <p className="text-slate-400 mt-2 text-base">
          Industry-tested curriculums with built-in AI tutoring and timestamped video search.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, framework, or skill..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-700/80 rounded-xl self-start md:self-auto">
          {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                difficulty === lvl
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No courses found</h3>
          <p className="text-sm text-slate-400 mt-1">Try tweaking your search keywords or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const gradients = [
              'from-indigo-600/40 via-purple-600/20 to-slate-900',
              'from-cyan-600/40 via-blue-600/20 to-slate-900',
              'from-emerald-600/40 via-teal-600/20 to-slate-900',
              'from-amber-600/40 via-rose-600/20 to-slate-900',
            ];
            const cardGrad = gradients[idx % gradients.length];

            const diffColor =
              course.difficultyLevel === 'advanced'
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                : course.difficultyLevel === 'intermediate'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-800 hover:border-brand-500/40"
              >
                <div>
                  {/* Card Visual Banner */}
                  <div className={`h-36 w-full bg-gradient-to-tr ${cardGrad} p-4 flex flex-col justify-between relative border-b border-slate-800/80`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${diffColor}`}>
                        {course.difficultyLevel}
                      </span>
                      <div className="inline-flex items-center gap-1 text-[11px] text-accent-cyan font-semibold px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm border border-accent-cyan/30">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Tutor</span>
                      </div>
                    </div>

                    <div className="text-white/80 font-mono text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                      <span>{course.language}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <h2 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 mb-2 leading-snug">
                      {course.title}
                    </h2>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {course.subtitle || 'Learn core concepts and real-world architectures with guided hands-on modules.'}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  {/* Meta details */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>{course.totalLessons} Lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatHours(course.totalDurationSeconds)}</span>
                    </div>
                  </div>

                  {/* Price and Instructor */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">By {course.instructorName}</span>
                    <div className="flex items-baseline gap-2">
                      {course.salePriceInr && (
                        <span className="text-xs line-through text-slate-500">₹{course.priceInr}</span>
                      )}
                      <span className="text-base font-extrabold text-white">
                        ₹{course.salePriceInr || course.priceInr}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
