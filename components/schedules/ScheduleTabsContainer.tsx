'use client';

import React, { useState } from 'react';
import AttendanceDashboard from './AttendanceDashboard';
import ScoreAndAudioPlayer from './ScoreAndAudioPlayer';
import OnDayTimeline from './OnDayTimeline';
import { 
  Users, Music, Clock, FileText, Calendar, MapPin, 
  Layers, Share2, Sparkles, CheckSquare, Megaphone
} from 'lucide-react';
import Link from 'next/link';

interface ScheduleTabsContainerProps {
  scheduleId: string;
  scheduleDetails: {
    id: string;
    title: string;
    eventType: string;
    eventTypeLabel: string;
    dateStr: string;
    location: string;
    conductor: string;
    pieces: string[];
    notes: string;
  };
}

export default function ScheduleTabsContainer({ scheduleId, scheduleDetails }: ScheduleTabsContainerProps) {
  // 本番 (sch-3) の場合は、デフォルトで「当日スケジュール」タブ(timeline)を選択
  // それ以外は「出欠・出欠確認」タブ(attendance)を選択
  const defaultTab = scheduleId === 'sch-3' ? 'timeline' : 'attendance';
  const [activeTab, setActiveTab] = useState<'attendance' | 'timeline' | 'scores'>(defaultTab);

  // 本番日程かどうかのフラグ
  const isPerformance = scheduleId === 'sch-3';

  return (
    <div className="space-y-6">
      {/* Schedule Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                isPerformance 
                  ? 'bg-rose-600 text-white animate-pulse' 
                  : 'bg-blue-600 text-white'
              }`}>
                {scheduleDetails.eventTypeLabel}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                指揮: {scheduleDetails.conductor}
              </span>
              {isPerformance && (
                <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  マルチレーン進行表あり
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{scheduleDetails.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/stage-layout?schedule_id=${scheduleId}`}
              className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition"
            >
              <Layers className="w-3.5 h-3.5" />
              舞台配置・ひな壇計算
            </Link>
            <button className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition border border-slate-200">
              <Share2 className="w-3.5 h-3.5" />
              共有
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs text-slate-700">
          <div className="flex items-start gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-900 block mb-0.5">日時・基本時間</span>
              <p className="text-slate-700 font-medium">{scheduleDetails.dateStr}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-900 block mb-0.5">会場・アクセス</span>
              <p className="text-slate-700 font-medium">{scheduleDetails.location}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <span className="font-extrabold text-slate-900 block mb-1.5">演奏曲目:</span>
          <div className="flex flex-wrap gap-2">
            {scheduleDetails.pieces.map((piece, idx) => (
              <span
                key={idx}
                className="bg-white border border-slate-200 text-slate-800 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Music className="w-3.5 h-3.5 text-blue-600" />
                {piece}
              </span>
            ))}
          </div>
          {scheduleDetails.notes && (
            <div className="text-slate-600 text-xs mt-3 pt-3 border-t border-slate-200 flex items-start gap-1.5 font-medium">
              <Megaphone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                <span className="font-extrabold text-slate-800">運営連絡事項:</span> {scheduleDetails.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- タブ切り替えバー (WOW プレミアムデザイン) --- */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4 -mb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-extrabold text-xs transition-all ${
              activeTab === 'attendance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            出欠管理 ＆ エキストラ手配
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-extrabold text-xs transition-all relative ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            当日進行スケジュール
            {isPerformance && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('scores')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-extrabold text-xs transition-all ${
              activeTab === 'scores'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            楽譜 ＆ 練習録音アーカイブ
          </button>
        </nav>
      </div>

      {/* --- 各タブのコンテンツ描画 --- */}
      <div className="transition-all duration-300">
        {activeTab === 'attendance' && (
          <div className="animate-in fade-in duration-200">
            <AttendanceDashboard
              scheduleId={scheduleId}
              scheduleTitle={scheduleDetails.title}
              dateStr={scheduleDetails.dateStr}
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="animate-in fade-in duration-200">
            {/* 当日タイムラインの表示 */}
            <OnDayTimeline scheduleId={scheduleId} />
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="animate-in fade-in duration-200">
            <ScoreAndAudioPlayer />
          </div>
        )}
      </div>
    </div>
  );
}
