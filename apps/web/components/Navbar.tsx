'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Navbar() {
  const { user, isInstructor, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
            EduYug
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search AI, System Design, Full-Stack courses..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Nav Links & Actions */}
        <nav className="flex items-center gap-4">
          <Link
            href="/courses"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-brand-400" />
            <span>Explore</span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-accent-emerald" />
              <span>Dashboard</span>
            </Link>
          )}

          {user && (user.role === 'instructor' || user.role === 'admin') && (
            <>
              <Link
                href="/studio"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                <span>Studio</span>
              </Link>
              <Link
                href="/studio/earnings"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Earnings</span>
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 font-medium border border-brand-500/30 capitalize">
                {user.role}
              </span>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-semibold text-white">
                  {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-accent-rose transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-200 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-md shadow-brand-600/30 transition-all hover:shadow-brand-500/40"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
