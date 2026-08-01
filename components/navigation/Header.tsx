'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Calendar, Sparkles, Layers, Bot } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logos */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-105 transition shadow-sm">
              <Music className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
                <span className="text-blue-700">
                  オケカン
                </span>
                <span className="text-slate-400 text-sm">×</span>
                <span className="text-amber-600">
                  リハクル
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium -mt-1">
                楽団グループウェア ＆ エキストラ
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link
              href="/schedules"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                pathname.startsWith('/schedules')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              練習日程・出欠
            </Link>

            <Link
              href="/ai-inspector"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                pathname.startsWith('/ai-inspector')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-4 h-4 text-blue-600" />
              AIインペク (練習立案)
            </Link>

            <Link
              href="/stage-layout"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                pathname.startsWith('/stage-layout')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-600" />
              ひな壇・舞台配置
            </Link>

            <Link
              href="/rehakuru"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                pathname.startsWith('/rehakuru')
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              リハクル (エキストラ)
            </Link>
          </nav>
        </div>

        {/* User Info & Quick Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>東京市民交響楽団 (Cl. パート)</span>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition">
            マイページ
          </button>
        </div>
      </div>
    </header>
  );
}
