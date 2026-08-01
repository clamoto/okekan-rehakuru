import Link from 'next/link';
import Header from '@/components/navigation/Header';
import { Calendar, Users, Music2, Sparkles, Layers, ArrowRight, UserPlus } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <section className="text-center py-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <span className="text-blue-700">オケカン (楽団連絡・出欠)</span>
            <span className="text-slate-400">×</span>
            <span className="text-amber-700">リハクル (エキストラ依頼)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            オーケストラ・吹奏楽団の運営を、
            <br />
            <span className="text-blue-600">
              かんたん・安心・スムーズに。
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            団員の出欠確認から練習録音・楽譜の共有、当日の舞台配置計算まで。
            エキストラが必要なときも「リハクル」でかんたんに依頼・手配ができます。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/schedules"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition"
            >
              <Calendar className="w-4 h-4" />
              練習日程・出欠確認デモを見る
            </Link>

            <Link
              href="/rehakuru"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              リハクル (エキストラ検索) デモ
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Okekan Features */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
                オケカン (グループウェア)
              </span>
              <span className="text-xs text-slate-500 font-medium">基本機能</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-2">リアルタイム出欠 ＆ 録音・楽譜共有</h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              パート別の出席率集計、遅刻・欠席の連絡管理、練習録音のプレイヤー再生、楽譜PDF共有をこれひとつで。
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                <span className="text-slate-800 font-bold">8/8 第4回全合奏 (Ob.2 欠席発生)</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">1名欠席</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span className="text-slate-800 font-semibold">高橋 健二 (Ob.2 / E.H.)</span>
                  <p className="text-[12px] text-slate-500">欠席（エキストラ手配が必要）</p>
                </div>
                <Link
                  href="/schedules/sch-1"
                  className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  リハクルで手配 →
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/schedules/sch-1"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-bold transition"
              >
                出欠＆録音詳細を開く
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Executive Support / Stage Layout Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1 rounded-full">
                係・実行委員サポート
              </span>
              <span className="text-xs text-slate-500 font-medium">自動計算</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-2">ひな壇・舞台配置の自動計算</h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              登録＆出席メンバー数（管楽器、弦楽器のプルト数、打楽器）に基づき、当日のひな壇段数・椅子脚数・譜面台数を瞬時に自動計算。
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">椅子必要数</span>
                <span className="text-slate-900 font-extrabold text-base">52 脚</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">譜面台必要数</span>
                <span className="text-slate-900 font-extrabold text-base">34 台</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">ひな壇構成</span>
                <span className="text-blue-600 font-extrabold text-base">3 段</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/stage-layout"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-bold transition"
              >
                舞台配置シミュレーターを見る
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
