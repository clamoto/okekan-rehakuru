import Link from 'next/link';
import Header from '@/components/navigation/Header';
import AttendanceDashboard from '@/components/schedules/AttendanceDashboard';
import ScoreAndAudioPlayer from '@/components/schedules/ScoreAndAudioPlayer';
import { ArrowLeft, Calendar, MapPin, Music, Share2, Layers } from 'lucide-react';

interface ScheduleDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return [
    { id: 'sch-1' },
    { id: 'sch-2' },
    { id: 'sch-3' },
  ];
}

export default function ScheduleDetailPage({ params }: ScheduleDetailPageProps) {
  const scheduleId = params.id;

  const mockScheduleDetails = {
    id: scheduleId,
    title: '第20回定期演奏会 第4回全合奏',
    eventTypeLabel: '全体合奏',
    dateStr: '2026年8月8日 (土) 13:00 - 17:00 (受付開始 12:30)',
    location: '目黒区民キャンパス パーシモンホール 練習室1 (東京都目黒区八雲1-1-1)',
    conductor: '山田 太郎 先生',
    pieces: [
      'P.I. チャイコフスキー / 交響曲第5番 ホ短調 Op.64',
      'J. ブラームス / 大学式典序曲 Op.80',
    ],
    notes: '当日は12:45より全員で大型楽器（Timp, CB）の打音出しとひな壇設営を行います。遅刻される方は事前に理由をコメント欄に記入してください。',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/schedules"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            練習日程一覧へ戻る
          </Link>
        </div>

        {/* Schedule Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                  {mockScheduleDetails.eventTypeLabel}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  指揮: {mockScheduleDetails.conductor}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">{mockScheduleDetails.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/stage-layout?schedule_id=${scheduleId}`}
                className="inline-flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs px-3.5 py-2 rounded-xl transition"
              >
                <Layers className="w-3.5 h-3.5" />
                舞台配置・ひな壇計算
              </Link>
              <button className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition">
                <Share2 className="w-3.5 h-3.5" />
                共有
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs text-slate-300">
            <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">日時・タイムスケジュール</span>
                <p className="font-mono text-slate-200">{mockScheduleDetails.dateStr}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">会場・アクセス</span>
                <p className="text-slate-200">{mockScheduleDetails.location}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 text-xs">
            <span className="font-semibold text-slate-400 block mb-1">練習曲目:</span>
            <div className="flex flex-wrap gap-2">
              {mockScheduleDetails.pieces.map((piece, idx) => (
                <span
                  key={idx}
                  className="bg-blue-950/50 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-lg font-medium"
                >
                  <Music className="w-3 h-3 inline mr-1 text-blue-400" />
                  {piece}
                </span>
              ))}
            </div>
            {mockScheduleDetails.notes && (
              <p className="text-slate-400 text-[11px] mt-3 pt-2 border-t border-slate-800/60">
                💡 連絡事項: {mockScheduleDetails.notes}
              </p>
            )}
          </div>
        </div>

        {/* 出欠確認 ＆ リハクルエキストラ募集セクション */}
        <section className="mb-12">
          <AttendanceDashboard
            scheduleId={scheduleId}
            scheduleTitle={mockScheduleDetails.title}
            dateStr={mockScheduleDetails.dateStr}
          />
        </section>

        {/* 楽譜PDF ＆ 合奏録音アーカイブセクション */}
        <section>
          <ScoreAndAudioPlayer />
        </section>
      </main>
    </div>
  );
}
