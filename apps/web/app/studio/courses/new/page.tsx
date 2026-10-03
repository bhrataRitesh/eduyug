'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { fetchApi } from '../../../../lib/api';
import { CourseDetail } from '@eduyug/shared-types';

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceInr, setPriceInr] = useState(2999);
  const [difficultyLevel, setDifficultyLevel] = useState('all_levels');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: apiError } = await fetchApi<CourseDetail>('/api/v1/courses', {
      method: 'POST',
      body: JSON.stringify({
        title,
        subtitle,
        description,
        priceInr,
        difficultyLevel,
      }),
    });

    setLoading(false);

    if (apiError || !data) {
      setError(apiError || 'Failed to create course. Ensure you are signed in as an Instructor.');
      return;
    }

    router.push(`/studio/courses/${data.id}/curriculum`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/studio"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Studio Dashboard</span>
      </Link>

      <div className="glass-panel p-8 rounded-2xl shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create a New Course</h1>
          <p className="text-xs text-slate-400 mt-1">
            Define your course title, pricing, and overview. You can build out sections and lessons in the next step.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-center gap-3 text-accent-rose text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Course Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Caching with Redis & Go"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Subtitle / Catchphrase</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Master cache invalidation, write-through patterns, and cluster failover."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">Price (INR ₹) *</label>
              <input
                type="number"
                min="0"
                required
                value={priceInr}
                onChange={(e) => setPriceInr(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">Difficulty Level</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all_levels">All Levels</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Course Overview & Syllabus Summary</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what learners will achieve and prerequisites..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              href="/studio"
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-brand-600/30"
            >
              {loading ? (
                <span>Creating draft...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Continue to Curriculum Builder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
