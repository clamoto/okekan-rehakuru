'use client';

import { useState } from 'react';
import { Clock, Download, Sparkles, CheckCircle2 } from 'lucide-react';

export default function TimelineGenerator() {
  const [doorsOpenTime, setDoorsOpenTime] = useState<string>('13:30');
  const [showStartTime, setShowStartTime] = useState<string>('14:00');
  const [pieceCount, setPieceCount] = useState<number>(3);
  const [intermissionMinutes, setIntermissionMinutes] = useState<number>(15);

  const timelineItems = [
    { time: '09:00 - 09:30', title: 'ホール楽屋口搬入 ＆ トラック下ろし', desc: '大型楽器（Timp, CB, Perc）搬入。ホール利用手続き。', category: 'setup' },
    { time: '09:30 - 10:15', title: 'ひな壇・椅子・譜面台 舞台設営', desc: '実行委員＆山積み担当によるひな壇（3段）組み上げ。', category: 'setup' },
    { time: '10:15 - 10:30', title: 'チューニング ＆ 音出し', desc: '管打楽器・弦楽器のステージ音出し。', category: 'practice' },
    { time: '10:30 - 12:30', title: 'GP (ゲネプロ / 全体ランスルー)', desc: '本番同様の曲順でゲネプロ実施（指揮：山田先生）。', category: 'practice' },
    { time: '12:30 - 13:30', title: '昼食休憩 ＆ 客席開場前点検', desc: '楽屋で昼食。受付・アナウンス・ステマネ最終打ち合わせ。', category: 'break' },
    { time: doorsOpenTime, title: '客席開場 (Doors Open)', desc: '開場アナウンス、ウェルカム演奏（木管アンサンブル）。', category: 'event' },
    { time: showStartTime, title: '演奏会 開演 (Concert Start)', desc: '【前半】序曲 ＆ 協奏曲', category: 'event' },
    { time: '14:50 - 15:05', title: `休憩 (${intermissionMinutes}分間)`, desc: '客席換気・調律チェック。', category: 'break' },
    { time: '15:05 - 16:00', title: '【後半】交響曲第5番', desc: 'メインプログラム演奏。', category: 'event' },
    { time: '16:00 - 16:15', title: 'アンコール ＆ 終演', desc: '客席送り出し。', category: 'event' },
    { time: '16:15 - 17:00', title: '舞台撤収・トラック積込・ホール完全退館', desc: '椅子・譜面台・ひな壇バラシ。楽屋清掃。', category: 'setup' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> 当日タイムスケジュール自動生成
          </div>
          <h2 className="text-xl font-bold text-slate-900">演奏会・ゲネプロ 当日進行表</h2>
        </div>

        <button
          onClick={() => alert('タイムスケジュールPDFを出力しました。')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          進行表PDFをダウンロード
        </button>
      </div>

      {/* 設定パラメータ */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="text-slate-600 block mb-1 font-semibold">開場時間 (Doors Open)</label>
          <input
            type="text"
            value={doorsOpenTime}
            onChange={(e) => setDoorsOpenTime(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
          />
        </div>

        <div>
          <label className="text-slate-600 block mb-1 font-semibold">開演時間 (Concert Start)</label>
          <input
            type="text"
            value={showStartTime}
            onChange={(e) => setShowStartTime(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
          />
        </div>

        <div>
          <label className="text-slate-600 block mb-1 font-semibold">休憩時間</label>
          <select
            value={intermissionMinutes}
            onChange={(e) => setIntermissionMinutes(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
          >
            <option value={15}>15 分間</option>
            <option value={20}>20 分間</option>
          </select>
        </div>
      </div>

      {/* タイムラインリスト */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-100 pl-8">
        {timelineItems.map((item, idx) => (
          <div
            key={idx}
            className="relative bg-slate-50 border border-slate-200 p-4 rounded-xl transition hover:border-slate-300"
          >
            <div className="absolute -left-8 top-4 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-white"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-blue-700">{item.time}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold w-fit border ${
                  item.category === 'event'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : item.category === 'practice'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {item.category === 'event' ? '本番 / 開場' : item.category === 'practice' ? 'ゲネプロ' : '設営・準備'}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
