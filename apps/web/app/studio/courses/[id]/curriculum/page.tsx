'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  PlayCircle,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  UploadCloud,
} from 'lucide-react';
import { fetchApi } from '../../../../../lib/api';
import { CourseDetail, LessonType, CourseStatus } from '@eduyug/shared-types';

export default function CourseCurriculumBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form States
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<LessonType>(LessonType.VIDEO);
  const [newLessonDuration, setNewLessonDuration] = useState(600); // 10 mins
  const [newLessonIsPreview, setNewLessonIsPreview] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLessonId(lessonId);
    setError(null);

    // 1. Get presigned upload URL from backend
    const { data: presignData, error: presignError } = await fetchApi<{
      mediaAssetId: string;
      uploadUrl: string;
    }>('/api/v1/media/presign-upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'video/mp4',
        fileSize: file.size,
        lessonId,
      }),
    });

    if (presignError || !presignData) {
      setUploadingLessonId(null);
      setError(presignError || 'Failed to generate upload URL');
      return;
    }

    try {
      // 2. Direct upload to S3 / mock endpoint
      await fetch(presignData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'video/mp4',
        },
      });

      // 3. Confirm upload and trigger HLS packaging
      await fetchApi('/api/v1/media/confirm-upload', {
        method: 'POST',
        body: JSON.stringify({ mediaAssetId: presignData.mediaAssetId }),
      });

      setSuccessMsg('Video uploaded successfully and transcoded to HLS ABR!');
      loadCourse();
    } catch (err: any) {
      setError(err?.message || 'Video upload failed');
    } finally {
      setUploadingLessonId(null);
    }
  };

  const loadCourse = async () => {
    setLoading(true);
    const { data, error: apiError } = await fetchApi<CourseDetail>(`/api/v1/courses/id/${courseId}`);
    setLoading(false);
    if (apiError || !data) {
      setError(apiError || 'Failed to load course details');
    } else {
      setCourse(data);
    }
  };

  useEffect(() => {
    if (courseId) loadCourse();
  }, [courseId]);

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    setActionLoading(true);
    setError(null);

    const { error: apiError } = await fetchApi(`/api/v1/courses/${courseId}/sections`, {
      method: 'POST',
      body: JSON.stringify({ title: newSectionTitle.trim() }),
    });

    setActionLoading(false);
    if (apiError) {
      setError(apiError);
    } else {
      setNewSectionTitle('');
      loadCourse();
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section and all its lessons?')) return;
    setActionLoading(true);
    const { error: apiError } = await fetchApi(`/api/v1/courses/${courseId}/sections/${sectionId}`, {
      method: 'DELETE',
    });
    setActionLoading(false);
    if (apiError) setError(apiError);
    else loadCourse();
  };

  const handleAddLesson = async (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    setActionLoading(true);
    setError(null);

    const { error: apiError } = await fetchApi(`/api/v1/courses/${courseId}/sections/${sectionId}/lessons`, {
      method: 'POST',
      body: JSON.stringify({
        title: newLessonTitle.trim(),
        lessonType: newLessonType,
        durationSeconds: newLessonDuration,
        isPreview: newLessonIsPreview,
      }),
    });

    setActionLoading(false);
    if (apiError) {
      setError(apiError);
    } else {
      setNewLessonTitle('');
      setActiveSectionId(null);
      loadCourse();
    }
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    setActionLoading(true);
    const { error: apiError } = await fetchApi(
      `/api/v1/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      { method: 'DELETE' }
    );
    setActionLoading(false);
    if (apiError) setError(apiError);
    else loadCourse();
  };

  const handlePublishCourse = async () => {
    if (!confirm('Publish course? This will freeze the curriculum into an immutable version snapshot.')) return;
    setActionLoading(true);
    setError(null);

    const { data, error: apiError } = await fetchApi<{ success: boolean; versionNumber: number }>(
      `/api/v1/courses/${courseId}/publish`,
      {
        method: 'POST',
        body: JSON.stringify({ changeSummary: 'Release initial version' }),
      }
    );

    setActionLoading(false);
    if (apiError || !data) {
      setError(apiError || 'Failed to publish course');
    } else {
      setSuccessMsg(`Course successfully published as Version ${data.versionNumber}!`);
      loadCourse();
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading curriculum editor...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Course not found</h2>
        <Link href="/studio" className="text-brand-400 hover:underline text-xs">
          Return to Studio Dashboard
        </Link>
      </div>
    );
  }

  const totalLessons = course.sections?.reduce((sum, s) => sum + s.lessons.length, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Navigation */}
      <Link
        href="/studio"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Studio Dashboard</span>
      </Link>

      {/* Top Header & Actions */}
      <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                course.status === CourseStatus.PUBLISHED
                  ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30'
                  : 'bg-accent-amber/10 text-accent-amber border-accent-amber/30'
              }`}
            >
              {course.status}
            </span>
            <span className="text-xs text-slate-400">₹{course.priceInr} INR</span>
            <span className="text-xs text-slate-400">• {course.sections?.length || 0} Sections</span>
            <span className="text-xs text-slate-400">• {totalLessons} Lessons</span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">{course.title}</h1>
          <p className="text-xs text-slate-400 mt-1">{course.subtitle || 'Build sections and lessons below.'}</p>
        </div>

        <div className="flex items-center gap-3">
          {course.status === CourseStatus.PUBLISHED && (
            <Link
              href={`/courses/${course.slug}`}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>View Live</span>
            </Link>
          )}

          <button
            onClick={handlePublishCourse}
            disabled={actionLoading || totalLessons === 0}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent-emerald hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-accent-emerald/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Release</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-center gap-3 text-accent-rose text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 flex items-center gap-3 text-accent-emerald text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Curriculum Sections List */}
      <div className="space-y-6">
        {course.sections?.map((section, sIdx) => (
          <div key={section.id} className="glass-card rounded-2xl p-6 border border-slate-800">
            {/* Section Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center">
                  {sIdx + 1}
                </span>
                <h3 className="text-base font-bold text-white">{section.title}</h3>
                <span className="text-xs text-slate-500">({section.lessons.length} lessons)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-300 bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lesson</span>
                </button>
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-accent-rose transition-colors"
                  title="Delete Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inline Add Lesson Form */}
            {activeSectionId === section.id && (
              <form
                onSubmit={(e) => handleAddLesson(e, section.id)}
                className="my-4 p-4 rounded-xl bg-slate-900/90 border border-brand-500/30 space-y-3"
              >
                <div className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Add New Lesson to {section.title}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="Lesson Title (e.g. Distributed Consensus Algorithms)"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <select
                      value={newLessonType}
                      onChange={(e) => setNewLessonType(e.target.value as LessonType)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value={LessonType.VIDEO}>Video Lesson</option>
                      <option value={LessonType.ARTICLE}>Article / Reading</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newLessonIsPreview}
                      onChange={(e) => setNewLessonIsPreview(e.target.checked)}
                      className="rounded border-slate-700 text-brand-600 focus:ring-0"
                    />
                    <span>Allow free preview for prospective learners</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSectionId(null)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-500"
                    >
                      Add Lesson
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Lessons List */}
            {section.lessons.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No lessons in this section yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/80 mt-2">
                {section.lessons.map((lesson, lIdx) => (
                  <div key={lesson.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500">{lIdx + 1}.</span>
                      {lesson.lessonType === LessonType.VIDEO ? (
                        <PlayCircle className="w-4 h-4 text-brand-400 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-medium text-slate-200">{lesson.title}</span>
                      {lesson.isPreview && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30">
                          Free Preview
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-slate-400">
                      {lesson.lessonType === LessonType.VIDEO && (
                        <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 flex items-center gap-1.5 transition-colors">
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{uploadingLessonId === lesson.id ? 'Uploading...' : 'Upload Video'}</span>
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm"
                            className="hidden"
                            disabled={uploadingLessonId === lesson.id}
                            onChange={(e) => handleUploadVideo(e, lesson.id)}
                          />
                        </label>
                      )}
                      <span>{Math.round(lesson.durationSeconds / 60)} min</span>
                      <button
                        onClick={() => handleDeleteLesson(section.id, lesson.id)}
                        className="text-slate-500 hover:text-accent-rose transition-colors"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Add New Section Inline Form */}
        <form onSubmit={handleAddSection} className="glass-panel p-5 rounded-2xl border border-dashed border-slate-700">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              required
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="New Section Title (e.g. Section 2: Concurrency & Thread Safety)"
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
