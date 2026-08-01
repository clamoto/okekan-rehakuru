'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Users, Calendar, Sparkles, Layers, Bot } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logos */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-105 transition shadow-lg shadow-blue-600/30">
              <Music className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-black text-lg tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  オケカン
                </span>
                <span className="text-slate-600 text-sm">×</span>
                <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                  リハクル
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium -mt-1">
                楽団グループウェア ＆ エキストラ
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link
              href="/schedules"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname.startsWith('/schedules')
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              練習日程・出欠
            </Link>

            <Link
              href="/ai-inspector"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname.startsWith('/ai-inspector')
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              AIインペク (自動練習立案)
            </Link>

            <Link
              href="/stage-layout"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname.startsWith('/stage-layout')
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              ひな壇・舞台配置
            </Link>

            <Link
              href="/rehakuru"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname.startsWith('/rehakuru')
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              リハクル (エキストラ)
            </Link>
          </nav>
        </div>

        {/* User Info & Quick Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>東京市民交響楽団 (Cl. パート)</span>
          </div>

          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs px-3 py-2 rounded-lg shadow-md transition">
            マイページ
          </button>
        </div>
      </div>
    </header>
  );
}
