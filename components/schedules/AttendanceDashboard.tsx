'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  UserPlus,
  AlertTriangle,
  Filter
} from 'lucide-react';

export type AttendanceStatus = 'attending' | 'absent' | 'late' | 'early_leave' | 'undecided';

export interface MemberAttendance {
  id: string;
  user_id: string;
  full_name: string;
  part: string;
  section: 'strings' | 'woodwinds' | 'brass' | 'percussion';
  status: AttendanceStatus;
  comment: string;
  is_extra?: boolean;
}

interface AttendanceDashboardProps {
  scheduleId: string;
  scheduleTitle: string;
  dateStr: string;
  initialAttendances?: MemberAttendance[];
}

const DEFAULT_ATTENDANCES: MemberAttendance[] = [
  // 木管パート
  { id: '1', user_id: 'u1', full_name: '山田 太郎', part: 'Flute 1', section: 'woodwinds', status: 'attending', comment: '譜面台持参します' },
  { id: '2', user_id: 'u2', full_name: '佐藤 花子', part: 'Flute 2', section: 'woodwinds', status: 'attending', comment: '' },
  { id: '3', user_id: 'u3', full_name: '鈴木 一郎', part: 'Oboe 1', section: 'woodwinds', status: 'attending', comment: '' },
  { id: '4', user_id: 'u4', full_name: '高橋 健二', part: 'Oboe 2 / E.H.', section: 'woodwinds', status: 'absent', comment: '仕事の都合により欠席（エキストラ要手配）' },
  { id: '5', user_id: 'u5', full_name: '田中 美咲', part: 'Clarinet 1', section: 'woodwinds', status: 'attending', comment: '' },
  { id: '6', user_id: 'u6', full_name: '伊藤 翔太', part: 'Clarinet 2', section: 'woodwinds', status: 'late', comment: '19時頃到着予定です' },
  { id: '7', user_id: 'u7', full_name: '渡辺 真理', part: 'Bassoon 1', section: 'woodwinds', status: 'attending', comment: '' },
  { id: '8', user_id: 'u8', full_name: '小林 誠', part: 'Bassoon 2', section: 'woodwinds', status: 'absent', comment: '体調不良のため欠席' },

  // 金管パート
  { id: '9', user_id: 'u9', full_name: '加藤 勇気', part: 'Horn 1', section: 'brass', status: 'attending', comment: '' },
  { id: '10', user_id: 'u10', full_name: '吉田 恵', part: 'Horn 2', section: 'brass', status: 'attending', comment: '' },
  { id: '11', user_id: 'u11', full_name: '佐々木 健', part: 'Horn 3', section: 'brass', status: 'absent', comment: '出張のため欠席' },
  { id: '12', user_id: 'u12', full_name: '山口 舞', part: 'Horn 4', section: 'brass', status: 'undecided', comment: '' },
  { id: '13', user_id: 'u13', full_name: '松本 拓也', part: 'Trumpet 1', section: 'brass', status: 'attending', comment: '' },
  { id: '14', user_id: 'u14', full_name: '井上 さくら', part: 'Trumpet 2', section: 'brass', status: 'attending', comment: '' },
  { id: '15', user_id: 'u15', full_name: '木村 浩二', part: 'Trombone 1', section: 'brass', status: 'attending', comment: '' },
  { id: '16', user_id: 'u16', full_name: '林 アキラ', part: 'Tuba', section: 'brass', status: 'attending', comment: '車出し可能です' },

  // 弦楽器パート
  { id: '17', user_id: 'u17', full_name: '清水 裕子', part: 'Violin 1 (Top)', section: 'strings', status: 'attending', comment: '' },
  { id: '18', user_id: 'u18', full_name: '山崎 亮', part: 'Violin 2 (Top)', section: 'strings', status: 'attending', comment: '' },
  { id: '19', user_id: 'u19', full_name: '池田 彩', part: 'Viola (Top)', section: 'strings', status: 'attending', comment: '' },
  { id: '20', user_id: 'u20', full_name: '橋本 卓', part: 'Cello (Top)', section: 'strings', status: 'attending', comment: '' },
  { id: '21', user_id: 'u21', full_name: '阿部 直樹', part: 'Contrabass 1', section: 'strings', status: 'absent', comment: '楽器修理中のため欠席' },
  { id: '22', user_id: 'u22', full_name: '森 恵美', part: 'Contrabass 2', section: 'strings', status: 'attending', comment: '' },

  // 打楽器パート
  { id: '23', user_id: 'u23', full_name: '石川 剛', part: 'Timpani / Percussion', section: 'percussion', status: 'attending', comment: '大太鼓運搬協力お願いします' },
];

export default function AttendanceDashboard({
  scheduleId,
  scheduleTitle,
  dateStr,
  initialAttendances = DEFAULT_ATTENDANCES,
}: AttendanceDashboardProps) {
  const [attendances, setAttendances] = useState<MemberAttendance[]>(initialAttendances);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [myUserId] = useState<string>('u5'); // デモ用のログインユーザー (田中 美咲: Clarinet 1)

  // 集計カウント
  const totalCount = attendances.length;
  const attendingCount = attendances.filter((a) => a.status === 'attending').length;
  const absentCount = attendances.filter((a) => a.status === 'absent').length;
  const lateCount = attendances.filter((a) => a.status === 'late' || a.status === 'early_leave').length;
  const undecidedCount = attendances.filter((a) => a.status === 'undecided').length;

  const attendancePercentage = Math.round((attendingCount / totalCount) * 100);

  // パートごとの欠席者分析
  const absentPartMap = attendances
    .filter((a) => a.status === 'absent')
    .reduce((acc, curr) => {
      const basePart = curr.part.split(' ')[0]; // e.g. "Oboe 2" -> "Oboe"
      acc[basePart] = (acc[basePart] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // 自分のステータス更新 handler
  const handleMyStatusChange = (newStatus: AttendanceStatus) => {
    setAttendances((prev) =>
      prev.map((item) =>
        item.user_id === myUserId ? { ...item, status: newStatus } : item
      )
    );
  };

  const myAttendance = attendances.find((a) => a.user_id === myUserId);

  const sectionsMap = [
    { key: 'all', label: '全パート' },
    { key: 'woodwinds', label: '木管楽器' },
    { key: 'brass', label: '金管楽器' },
    { key: 'strings', label: '弦楽器' },
    { key: 'percussion', label: '打楽器' },
  ];

  const filteredAttendances =
    selectedSection === 'all'
      ? attendances
      : attendances.filter((a) => a.section === selectedSection);

  return (
    <div className="space-y-6">
      {/* 自分の出欠変更カード */}
      {myAttendance && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
                <span>あなたの出欠登録</span>
                <span className="text-slate-400">•</span>
                <span>{myAttendance.part}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{myAttendance.full_name} さんのステータス</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleMyStatusChange('attending')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  myAttendance.status === 'attending'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                出席
              </button>

              <button
                onClick={() => handleMyStatusChange('late')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  myAttendance.status === 'late'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                遅刻・早退
              </button>

              <button
                onClick={() => handleMyStatusChange('absent')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  myAttendance.status === 'absent'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <XCircle className="w-4 h-4" />
                欠席
              </button>

              <button
                onClick={() => handleMyStatusChange('undecided')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  myAttendance.status === 'undecided'
                    ? 'bg-slate-700 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                未定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* サマリーダッシュボードカード */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-medium text-slate-500">リアルタイム集計</span>
            <h2 className="text-xl font-bold text-slate-900">団員・パート別出欠確認</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-600">出席率:</span>
              <span className="text-emerald-600 font-extrabold text-base">{attendancePercentage}%</span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 出席 {attendingCount}
              </span>
              <span className="text-amber-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 遅刻 {lateCount}
              </span>
              <span className="text-rose-700 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> 欠席 {absentCount}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> 未定 {undecidedCount}
              </span>
            </div>
          </div>
        </div>

        {/* 欠席発生時の「リハクルでエキストラ手配」ハイライトバナー */}
        {absentCount > 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 text-amber-800 p-2 rounded-lg mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {absentCount}名の欠席が発生しています
                  </span>
                  <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded font-bold">
                    リハクル連携
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  欠席パート: {Object.entries(absentPartMap).map(([p, c]) => `${p} (${c}名)`).join(', ')}。リハクルで条件に合うエキストラをかんたんに手配できます。
                </p>
              </div>
            </div>

            <Link
              href={`/rehakuru?schedule_id=${scheduleId}&parts=${Object.keys(absentPartMap).join(',')}`}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              リハクルでエキストラを探す
            </Link>
          </div>
        )}

        {/* セクションフィルタータブ */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
          {sectionsMap.map((sec) => (
            <button
              key={sec.key}
              onClick={() => setSelectedSection(sec.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedSection === sec.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* 出欠一覧テーブル / リスト */}
        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <th className="p-3 font-semibold">パート</th>
                <th className="p-3 font-semibold">氏名</th>
                <th className="p-3 font-semibold">出欠ステータス</th>
                <th className="p-3 font-semibold">連絡事項・理由</th>
                <th className="p-3 font-semibold text-right">エキストラ手配</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredAttendances.map((item) => {
                const isAbsent = item.status === 'absent';
                const isLate = item.status === 'late' || item.status === 'early_leave';
                const isAttending = item.status === 'attending';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition ${
                      isAbsent ? 'bg-rose-50/50' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-900">{item.part}</td>
                    <td className="p-3 text-slate-800 flex items-center gap-2">
                      <span>{item.full_name}</span>
                      {item.user_id === myUserId && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          あなた
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {isAttending && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3" /> 出席
                        </span>
                      )}
                      {isLate && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
                          <Clock className="w-3 h-3" /> 遅刻・早退
                        </span>
                      )}
                      {isAbsent && (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full font-bold">
                          <XCircle className="w-3 h-3" /> 欠席
                        </span>
                      )}
                      {item.status === 'undecided' && (
                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full font-bold">
                          <HelpCircle className="w-3 h-3" /> 未定
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">
                      {item.comment ? item.comment : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="p-3 text-right">
                      {isAbsent ? (
                        <Link
                          href={`/rehakuru?schedule_id=${scheduleId}&part=${encodeURIComponent(item.part)}`}
                          className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition"
                        >
                          <UserPlus className="w-3 h-3" />
                          リハクルで募集
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
