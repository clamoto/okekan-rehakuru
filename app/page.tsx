import Link from 'next/link';
import Header from '@/components/navigation/Header';
import { Calendar, Users, Music2, Sparkles, Layers, ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <section className="text-center py-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-slate-800 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <span className="text-blue-400">オケカン (出欠・グループウェア)</span>
            <span className="text-slate-600">×</span>
            <span className="text-orange-400">リハクル (エキストラ代理決済)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            オーケストラ・吹奏楽団の運営を、
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-orange-400 bg-clip-text text-transparent">
              スマート＆ストレスフリーに。
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-slate-400 text-sm leading-relaxed">
            団員のリアルタイム出欠共有から、練習録音・楽譜PDFのアーカイブ、当日の舞台配置ひな壇自動計算。
            欠席発生時はそのまま「リハクル」で特殊管・相性スコアにマッチした奏者を即座手配・エスクロー決済。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/schedules"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              練習日程・出欠確認デモを見る
            </Link>

            <Link
              href="/rehakuru"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              リハクル (エキストラ検索) デモ
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Okekan Features */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
                オケカン (無料グループウェア)
              </span>
              <span className="text-xs text-slate-500 font-semibold">基本機能</span>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">リアルタイム出欠 ＆ 録音・楽譜共有</h2>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              パート別の出席率集計、遅刻・欠席のコメント管理、練習録音のプレイヤー再生（チャプターブックマーク付き）、楽譜PDF共有。
            </p>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-300 font-semibold">8/8 第4回全合奏 (Ob.2 欠席発生)</span>
                <span className="text-rose-400 font-bold">1名欠席</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span className="text-slate-200 font-medium">高橋 健二 (Ob.2 / E.H.)</span>
                  <p className="text-[11px] text-slate-500">欠席（エキストラ要手配）</p>
                </div>
                <Link
                  href="/schedules/sch-1"
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition shadow"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  リハクル手配へ導線 →
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/schedules/sch-1"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-bold transition"
              >
                出欠＆録音アーカイブ詳細を開く
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Executive Support / Stage Layout Preview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold px-3 py-1 rounded-full">
                実行委員サポート
              </span>
              <span className="text-xs text-slate-500 font-semibold">自動計算</span>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">ひな壇・舞台配置の自動計算</h2>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              登録＆出席メンバー数（管楽器、弦楽器のプルト数、打楽器）に基づき、当日のひな壇段数・椅子脚数・譜面台数を瞬時に自動計算。
            </p>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-900 rounded-lg">
                <span className="text-slate-400 text-[10px] block">椅子必要数</span>
                <span className="text-purple-400 font-black text-base">52 脚</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <span className="text-slate-400 text-[10px] block">譜面台必要数</span>
                <span className="text-indigo-400 font-black text-base">34 台</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <span className="text-slate-400 text-[10px] block">ひな壇構成</span>
                <span className="text-emerald-400 font-black text-base">3 段</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/stage-layout"
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs font-bold transition"
              >
                舞台配置シミュレーターを準備中
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
