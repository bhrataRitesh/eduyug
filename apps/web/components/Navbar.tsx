'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, BookOpen, Search, LogOut, Menu, X, LayoutDashboard, Film, DollarSign } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Navbar() {
  const { user, isInstructor, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.08] backdrop-blur-xl bg-[#080C14]/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 group-hover:shadow-brand-500/40 transition-all">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-200 transition-colors">
              EduYug
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-accent-cyan/90 -mt-1 hidden sm:block">
              AI Engineering
            </span>
          </div>
        </Link>

        {/* Global Search Bar with Search Submission */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md items-center relative">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI, Kafka, Go, System Design courses..."
            className="w-full pl-10 pr-12 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors shadow-inner"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/90 rounded border border-slate-700 pointer-events-none">
            ↵
          </kbd>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          <Link
            href="/courses"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isLinkActive('/courses')
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            <span>Explore</span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isLinkActive('/dashboard')
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Dashboard</span>
            </Link>
          )}

          {user && (user.role === 'instructor' || user.role === 'admin') && (
            <>
              <Link
                href="/studio"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  pathname === '/studio'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Studio</span>
              </Link>
              <Link
                href="/studio/earnings"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isLinkActive('/studio/earnings')
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-accent-amber" />
                <span>Earnings</span>
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30 capitalize">
                {user.role}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 border border-brand-400/40 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-accent-rose hover:bg-slate-800/60 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link
                href="/auth/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-lg shadow-md shadow-brand-600/30 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white">
              {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#080C14] px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </form>

          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
          >
            Explore Courses
          </Link>

          {user && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Learner Dashboard
            </Link>
          )}

          {user && (user.role === 'instructor' || user.role === 'admin') && (
            <>
              <Link
                href="/studio"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                Instructor Studio
              </Link>
              <Link
                href="/studio/earnings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                Revenue & Earnings
              </Link>
            </>
          )}

          {user ? (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">{user.email}</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-xs text-accent-rose flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold text-white bg-slate-800 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-bold text-white bg-brand-600 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
