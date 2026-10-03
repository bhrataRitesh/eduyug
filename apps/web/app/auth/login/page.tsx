'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { setSession, useAuth } from '../../../lib/auth';
import { UserProfileResponse, AuthTokens } from '@eduyug/shared-types';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingSubmit(true);

    const { data, error: apiError } = await fetchApi<{
      user: UserProfileResponse;
      tokens: AuthTokens;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoadingSubmit(false);

    if (apiError || !data) {
      setError(apiError || 'Failed to authenticate');
      return;
    }

    // Save tokens and user session reactively
    setSession(data.user, data.tokens);

    // Navigate directly to dashboard
    router.push('/dashboard');
  };

  // Prevent flash of login form while resolving auth state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // If already authenticated, show friendly redirect card
  if (user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-accent-emerald/20 text-accent-emerald flex items-center justify-center mx-auto border border-accent-emerald/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Already Signed In</h1>
            <p className="text-xs text-slate-400 mt-2">
              You are currently logged in as <span className="text-brand-300 font-semibold">{user.email}</span> ({user.role})
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.replace('/dashboard')}
              className="w-full py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-700/80 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-2">Sign in to your EduYug account to resume learning</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-center gap-3 text-accent-rose text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loadingSubmit ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-brand-400 hover:underline font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
