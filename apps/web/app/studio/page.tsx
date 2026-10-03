'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Layers, Edit, Eye, Sparkles, AlertCircle } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { CourseDetail, CourseStatus } from '@eduyug/shared-types';

export default function InstructorStudioDashboard() {
  const [courses, setCourses] = useState<CourseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInstructorCourses() {
      setLoading(true);
      const { data, error: apiError } = await fetchApi<CourseDetail[]>('/api/v1/courses/instructor/my-courses');
      setLoading(false);

      if (apiError) {
        setError(apiError);
      } else if (data) {
        setCourses(data);
      }
    }
    loadInstructorCourses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instructor Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Course Creator Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Design curriculums, manage draft lessons, and publish immutable releases.</p>
        </div>

        <Link
          href="/studio/courses/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </Link>
      </div>

      {error && (
        <div className="my-6 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-center gap-3 text-accent-rose text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error} (Sign in with an instructor account to view authored courses)</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading your authored courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl mt-8">
          <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No courses created yet</h3>
          <p className="text-sm text-slate-400 mt-1 mb-6">Create your first technical course and build out the curriculum.</p>
          <Link
            href="/studio/courses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Course</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {courses.map((course) => {
            const lessonCount = course.sections?.reduce((sum, s) => sum + s.lessons.length, 0) || 0;
            return (
              <div key={course.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        course.status === CourseStatus.PUBLISHED
                          ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30'
                          : 'bg-accent-amber/10 text-accent-amber border-accent-amber/30'
                      }`}
                    >
                      {course.status}
                    </span>
                    <span className="text-xs text-slate-400">₹{course.priceInr}</span>
                  </div>

                  <h2 className="text-lg font-bold text-white line-clamp-2 mb-2">{course.title}</h2>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{course.subtitle || 'No subtitle provided'}</p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span>{course.sections?.length || 0} Sections</span>
                    <span>{lessonCount} Lessons</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/studio/courses/${course.id}/curriculum`}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-center text-white bg-brand-600 hover:bg-brand-500 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Curriculum Builder</span>
                    </Link>
                    {course.status === CourseStatus.PUBLISHED && (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
                        title="View Public Course"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
