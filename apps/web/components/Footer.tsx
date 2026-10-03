import React from 'react';
import Link from 'next/link';
import { Sparkles, Github, Twitter, Linkedin, Heart, Shield, Cpu, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060910] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">EduYug</span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              The AI-augmented engineering marketplace. High-bitrate video courses powered by an in-browser RAG AI Tutor with millisecond timestamp deep-linking.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="https://github.com/bhrataRitesh/eduyug" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Curriculum</h4>
            <ul className="space-y-2.5">
              <li><Link href="/courses" className="hover:text-white transition-colors">Distributed Systems</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">Apache Kafka & Event Streaming</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">pgvector & AI RAG Systems</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">Go Microservices</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">Full-Stack Next.js 14</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link href="/courses" className="hover:text-white transition-colors">Course Catalog</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Learner Dashboard</Link></li>
              <li><Link href="/studio" className="hover:text-white transition-colors">Instructor Studio</Link></li>
              <li><Link href="/studio/earnings" className="hover:text-white transition-colors">Revenue Ledger</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Become an Instructor</Link></li>
            </ul>
          </div>

          {/* Architecture */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Architecture</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-accent-cyan" /> <span>NestJS 10 Monolith</span></li>
              <li className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-brand-400" /> <span>PostgreSQL + pgvector</span></li>
              <li className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-accent-emerald" /> <span>Razorpay Ledger</span></li>
              <li className="text-[11px] text-slate-500 pt-1">HLS Adaptive Multi-Bitrate</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 EduYug. All rights reserved. Developed by Ritesh Kumar.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/courses" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="/courses" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/courses" className="hover:text-slate-400 transition-colors">Security Audit</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
