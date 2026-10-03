'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  FileText,
  Sparkles,
  Bot,
  MessageSquare,
  Clock,
  BookOpen,
} from 'lucide-react';
import VideoPlayer from '../../../../components/VideoPlayer';
import { fetchApi } from '../../../../lib/api';
import { CourseDetail, LessonType, LessonSummary, RagQueryResponse } from '@eduyug/shared-types';

export default function LessonClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params?.courseSlug as string;
  const currentLessonId = params?.lessonId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonSummary | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  const [seekTarget, setSeekTarget] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'aitutor'>('aitutor');
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  // AI Tutor chat with real RAG retrieval & interactive citations
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; citationTimestamp?: number; citationLabel?: string }[]
  >([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Tutor for this lesson. Ask me any question about the curriculum, architecture trade-offs, or implementation details covered in the video.',
    },
    {
      role: 'user',
      text: 'Where does the instructor explain the Kafka consumer group offset committing mechanism?',
    },
    {
      role: 'assistant',
      text: 'The instructor explains manual vs automatic offset committing and potential duplicate processing risks in detail at',
      citationTimestamp: 145, // 02:25
      citationLabel: '[02:25]',
    },
  ]);

  useEffect(() => {
    async function loadCurriculum() {
      const { data, error } = await fetchApi<CourseDetail>(`/api/v1/courses/detail/${courseSlug}`);
      if (!error && data) {
        setCourse(data);
        // Find current lesson
        let found: LessonSummary | null = null;
        for (const sec of data.sections || []) {
          for (const les of sec.lessons) {
            if (les.id === currentLessonId) {
              found = les;
              break;
            }
          }
        }
        if (found) {
          setActiveLesson(found);
        } else if (data.sections?.[0]?.lessons?.[0]) {
          setActiveLesson(data.sections[0].lessons[0]);
        }
      }
    }
    if (courseSlug) {
      loadCurriculum();
    }
  }, [courseSlug, currentLessonId]);

  const handleSeekCitation = (seconds: number) => {
    setSeekTarget(seconds);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setChatInput('');
    setAiLoading(true);

    const { data, error } = await fetchApi<RagQueryResponse>('/api/v1/ai/tutor', {
      method: 'POST',
      body: JSON.stringify({
        courseId: course?.id || 'demo-1',
        lessonId: activeLesson?.id,
        query: userText,
      }),
    });

    setAiLoading(false);

    if (data) {
      const firstCitation = data.citations?.[0];
      let startM = 0;
      let startS = 0;
      if (firstCitation) {
        startM = Math.floor(firstCitation.startTimeSeconds / 60);
        startS = Math.floor(firstCitation.startTimeSeconds % 60);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer,
          citationTimestamp: firstCitation?.startTimeSeconds,
          citationLabel: firstCitation
            ? `[${startM < 10 ? '0' : ''}${startM}:${startS < 10 ? '0' : ''}${startS}]`
            : undefined,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            error ||
            'I encountered an issue querying the course knowledge base. Please verify you are enrolled or try again.',
        },
      ]);
    }
  };

  const allLessons: LessonSummary[] = course?.sections?.flatMap((s) => s.lessons) || [];
  const currentIdx = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const lastPingRef = React.useRef<number>(0);

  const handleVideoProgress = (currentSecond: number, duration: number) => {
    if (!activeLesson) return;
    const now = Date.now();
    if (now - lastPingRef.current > 15000) {
      lastPingRef.current = now;
      fetchApi('/api/v1/learning/heartbeat', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: activeLesson.id,
          currentSecond: Math.round(currentSecond),
        }),
      }).then(({ data }) => {
        if ((data as any)?.isCompleted) {
          setCompletedLessons((prev) => ({ ...prev, [activeLesson.id]: true }));
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col">
      {/* Top Classroom Bar */}
      <header className="h-14 border-b border-slate-800 glass-panel px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseSlug}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Course Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs font-bold text-white line-clamp-1">{course?.title || 'EduYug Classroom'}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400">Progress:</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full w-1/3" />
            </div>
            <span className="text-xs font-semibold text-brand-300">33%</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Center Pane: Video & Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Video Player */}
          {activeLesson?.lessonType === LessonType.ARTICLE ? (
            <div className="aspect-video glass-panel rounded-2xl p-8 flex flex-col justify-center items-center text-center">
              <FileText className="w-12 h-12 text-brand-400 mb-3" />
              <h2 className="text-xl font-bold text-white mb-2">{activeLesson.title}</h2>
              <p className="text-xs text-slate-400 max-w-md">
                Reading Assignment: Review the reference guide and architectural pattern documentation below.
              </p>
            </div>
          ) : (
            <VideoPlayer
              src={videoSrc}
              seekTarget={seekTarget}
              onTimeUpdate={handleVideoProgress}
            />
          )}

          {/* Lesson Title and Next/Prev Nav */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">
                Current Lesson
              </span>
              <h1 className="text-xl font-extrabold text-white mt-1">
                {activeLesson?.title || 'Loading lesson...'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && router.push(`/learn/${courseSlug}/${prevLesson.id}`)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 disabled:opacity-30 transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={!nextLesson}
                onClick={() => {
                  if (activeLesson) {
                    setCompletedLessons((prev) => ({ ...prev, [activeLesson.id]: true }));
                  }
                  if (nextLesson) router.push(`/learn/${courseSlug}/${nextLesson.id}`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Complete & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs: Overview & AI Tutor */}
          <div>
            <div className="flex items-center gap-4 border-b border-slate-800 pb-2 mb-4">
              <button
                onClick={() => setActiveTab('aitutor')}
                className={`text-xs font-bold pb-2 flex items-center gap-1.5 transition-colors relative ${
                  activeTab === 'aitutor' ? 'text-brand-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Tutor Chat</span>
                {activeTab === 'aitutor' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`text-xs font-bold pb-2 flex items-center gap-1.5 transition-colors relative ${
                  activeTab === 'overview' ? 'text-brand-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Notes & Overview</span>
                {activeTab === 'overview' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </button>
            </div>

            {activeTab === 'aitutor' ? (
              <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-cyan" />
                    <span className="font-semibold text-white">Context-Aware AI Tutor</span>
                  </div>
                  <span>Scoped to active lesson transcript</span>
                </div>

                {/* Messages stream */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-brand-600/20 text-brand-100 border border-brand-500/30 ml-8'
                          : 'bg-slate-900/80 text-slate-200 border border-slate-800 mr-8'
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                        {m.role === 'user' ? 'You' : 'AI Tutor'}
                      </div>
                      <p>{m.text}</p>
                      {m.citationTimestamp !== undefined && (
                        <button
                          onClick={() => handleSeekCitation(m.citationTimestamp!)}
                          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/40 text-brand-300 font-bold hover:scale-105 transition-all"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-accent-cyan" />
                          <span>Jump to {m.citationLabel}</span>
                        </button>
                      )}
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="p-3.5 rounded-xl text-xs bg-slate-900/80 text-slate-400 border border-slate-800 mr-8 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                      <span>AI Tutor is querying lesson transcripts & vector embeddings...</span>
                    </div>
                  )}
                </div>

                {/* Input Prompt */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={chatInput}
                    disabled={aiLoading}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask anything about this video (e.g. explain the code at 03:15)..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !chatInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {aiLoading ? 'Thinking...' : 'Ask'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {activeLesson?.contentText ||
                  'In this video lesson, we examine production architecture patterns, resilience considerations, and practical benchmarks. Review key takeaways and test the interactive AI tutor on the other tab!'}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Full Syllabus Navigation */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 glass-panel p-4 space-y-4 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Course Curriculum</h3>
            <span className="text-[11px] text-slate-400">{allLessons.length} Total Lessons</span>
          </div>

          <div className="space-y-4">
            {course?.sections?.map((sec, sIdx) => (
              <div key={sec.id} className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300 px-2 py-1">
                  {sec.title}
                </div>
                <div className="space-y-1">
                  {sec.lessons.map((les) => {
                    const isActive = les.id === activeLesson?.id;
                    const isCompleted = completedLessons[les.id];
                    return (
                      <button
                        key={les.id}
                        onClick={() => router.push(`/learn/${courseSlug}/${les.id}`)}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-2 ${
                          isActive
                            ? 'bg-brand-600/30 border border-brand-500/50 text-white font-semibold'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 line-clamp-1">
                          {isCompleted ? (
                            <CheckCircle className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className="line-clamp-1">{les.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {Math.round(les.durationSeconds / 60)}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
