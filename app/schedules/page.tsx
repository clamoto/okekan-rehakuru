import Link from 'next/link';
import Header from '@/components/navigation/Header';
import { Calendar, MapPin, Music, ChevronRight, AlertCircle, Clock, CheckCircle2, UserPlus } from 'lucide-react';

export default function SchedulesListPage() {
  const schedules = [
    {
      id: 'sch-1',
      title: '第20回定期演奏会 第4回全合奏',
      eventType: 'practice',
      eventTypeLabel: '全体練習',
      dateStr: '2026年8月8日 (土) 13:00 - 17:00',
      location: '目黒区民キャンパス パーシモンホール 練習室1',
      pieces: ['チャイコフスキー / 交響曲第5番', 'ブラームス / 大学式典序曲'],
      attendingCount: 42,
      absentCount: 3,
      totalCount: 50,
      absentParts: ['Oboe 2', 'Horn 3', 'Contrabass 1'],
      isNext: true,
    },
    {
      id: 'sch-2',
      title: '第20回定期演奏会 木管・金管分奏',
      eventType: 'section_practice',
      eventTypeLabel: 'セクション分奏',
      dateStr: '2026年8月22日 (土) 18:00 - 21:00',
      location: '大田区民プラザ スタジオA',
      pieces: ['チャイコフスキー / 交響曲第5番 (第2楽章・第4楽章)'],
      attendingCount: 18,
      absentCount: 1,
      totalCount: 22,
      absentParts: ['Trumpet 2'],
      isNext: false,
    },
    {
      id: 'sch-3',
      title: '第20回定期演奏会 GP (ゲネプロ) ＆ 本番',
      eventType: 'performance',
      eventTypeLabel: '演奏会本番',
      dateStr: '2026年9月13日 (日) 10:00 - 19:00',
      location: 'ミューザ川崎シンフォニーホール 大ホール',
      pieces: [
        'ブラームス / 大学式典序曲 Op.80',
        'モーツァルト / フルート協奏曲第1番 ト長調',
        'チャイコフスキー / 交響曲第5番 ホ短調 Op.64',
      ],
      attendingCount: 58,
      absentCount: 0,
      totalCount: 60,
      absentParts: [],
      isNext: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
              <span>オケカン</span>
              <span>•</span>
              <span>東京市民交響楽団</span>
            </div>
            <h1 className="text-2xl font-black text-white">練習日程 ＆ パート別出欠管理</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition">
              + 新規日程を登録
            </button>
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="mt-8 space-y-6">
          {schedules.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900/90 border rounded-2xl p-6 shadow-xl transition hover:border-slate-700 relative overflow-hidden ${
                item.isNext ? 'border-blue-500/50 ring-1 ring-blue-500/30' : 'border-slate-800'
              }`}
            >
              {item.isNext && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                  次回練習
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-700">
                      {item.eventTypeLabel}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {item.dateStr}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                    {item.title}
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{item.location}</span>
                  </div>

                  {/* 曲目リスト */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Music className="w-3.5 h-3.5 text-slate-500" />
                    {item.pieces.map((piece, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-950 text-slate-300 border border-slate-800 text-xs px-2.5 py-0.5 rounded-full"
                      >
                        {piece}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 出欠状態 ＆ アクション */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">出席率:</span>
                      <span className="text-emerald-400 font-extrabold text-sm">
                        {Math.round((item.attendingCount / item.totalCount) * 100)}%
                      </span>
                      <span className="text-slate-500">
                        ({item.attendingCount}/{item.totalCount}名)
                      </span>
                    </div>

                    {item.absentCount > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400 font-semibold justify-end">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>欠席: {item.absentCount}名 ({item.absentParts.join(', ')})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {item.absentCount > 0 && (
                      <Link
                        href={`/rehakuru?schedule_id=${item.id}&parts=${item.absentParts.join(',')}`}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        エキストラ手配
                      </Link>
                    )}

                    <Link
                      href={`/schedules/${item.id}`}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                    >
                      出欠・楽譜・録音
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
