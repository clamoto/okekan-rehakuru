'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  UserPlus,
  AlertTriangle,
  Filter,
  Save,
  Music,
  Smile,
  Check,
  Megaphone,
  Sparkles,
  Info,
  Calendar,
  ThumbsUp,
  Truck,
  FileText,
  UserCheck
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
  piece_attendance?: Record<string, 'attending' | 'absent'>; // 曲別出欠
  cooperations?: string[]; // 協力項目 (stand: 譜面台持参, car: 車運搬, carry: 運搬手伝い)
}

interface AttendanceDashboardProps {
  scheduleId: string;
  scheduleTitle: string;
  dateStr: string;
  pieces?: string[];
  initialAttendances?: MemberAttendance[];
}

const DEFAULT_ATTENDANCES: MemberAttendance[] = [
  // 木管パート
  { id: '1', user_id: 'u1', full_name: '山田 太郎', part: 'Flute 1', section: 'woodwinds', status: 'attending', comment: '譜面台持参します' },
  { id: '2', user_id: 'u2', full_name: '佐藤 花子', part: 'Flute 2', section: 'woodwinds', status: 'attending', comment: '' },
  { id: '3', user_id: 'u3', full_name: '鈴木 一郎', part: 'Oboe 1', section: 'woodwinds', status: 'attending', comment: '' },
  { id: '4', user_id: 'u4', full_name: '高橋 健二', part: 'Oboe 2 / E.H.', section: 'woodwinds', status: 'absent', comment: '仕事の都合により欠席（エキストラ要手配）' },
  { id: '5', user_id: 'u5', full_name: '田中 美咲', part: 'Clarinet 1', section: 'woodwinds', status: 'attending', comment: '譜面台持参 | 大学式典は降り番', piece_attendance: { 'P.I. チャイコフスキー / 交響曲第5番 ホ短調 Op.64': 'attending', 'J. ブラームス / 大学式典序曲 Op.80': 'absent' }, cooperations: ['stand'] },
  { id: '6', user_id: 'u6', full_name: '伊藤 翔太', part: 'Clarinet 2', section: 'woodwinds', status: 'late', comment: '19:00頃到着予定です' },
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
  { id: '16', user_id: 'u16', full_name: '林 アキラ', part: 'Tuba', section: 'brass', status: 'attending', comment: '車出し可能です', cooperations: ['car'] },

  // 弦楽器パート
  { id: '17', user_id: 'u17', full_name: '清水 裕子', part: 'Violin 1 (Top)', section: 'strings', status: 'attending', comment: '' },
  { id: '18', user_id: 'u18', full_name: '山崎 亮', part: 'Violin 2 (Top)', section: 'strings', status: 'attending', comment: '' },
  { id: '19', user_id: 'u19', full_name: '池田 彩', part: 'Viola (Top)', section: 'strings', status: 'attending', comment: '' },
  { id: '20', user_id: 'u20', full_name: '橋本 卓', part: 'Cello (Top)', section: 'strings', status: 'attending', comment: '' },
  { id: '21', user_id: 'u21', full_name: '阿部 直樹', part: 'Contrabass 1', section: 'strings', status: 'absent', comment: '楽器修理中のため欠席' },
  { id: '22', user_id: 'u22', full_name: '森 恵美', part: 'Contrabass 2', section: 'strings', status: 'attending', comment: '' },

  // 打楽器パート
  { id: '23', user_id: 'u23', full_name: '石川 剛', part: 'Timpani / Percussion', section: 'percussion', status: 'attending', comment: '大太鼓運搬協力お願いします', cooperations: ['carry'] },
];

export default function AttendanceDashboard({
  scheduleId,
  scheduleTitle,
  dateStr,
  pieces = [],
  initialAttendances = DEFAULT_ATTENDANCES,
}: AttendanceDashboardProps) {
  const [attendances, setAttendances] = useState<MemberAttendance[]>(initialAttendances);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [myUserId] = useState<string>('u5'); // デモ用のログインユーザー (田中 美咲: Clarinet 1)

  const myMember = attendances.find((a) => a.user_id === myUserId) || DEFAULT_ATTENDANCES[4];

  // 奏者入力用のリッチなフォーム状態
  const [myStatus, setMyStatus] = useState<AttendanceStatus>(myMember.status);
  const [myComment, setMyComment] = useState<string>(''); // 生の入力用コメント
  const [myLateTime, setMyLateTime] = useState<string>('19:00');
  const [myEarlyLeaveTime, setMyEarlyLeaveTime] = useState<string>('16:00');
  const [myCooperations, setMyCooperations] = useState<string[]>(myMember.cooperations || []);
  const [myPieceAttendance, setMyPieceAttendance] = useState<Record<string, 'attending' | 'absent'>>({});
  
  // 状態反映用のマイクロインタラクション
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // 練習曲目の設定 (piecesプロップスが空の場合はデモデフォルト)
  const activePieces = pieces && pieces.length > 0 ? pieces : [
    'P.I. チャイコフスキー / 交響曲第5番 ホ短調 Op.64',
    'J. ブラームス / 大学式典序曲 Op.80'
  ];

  // ログインユーザー(田中美咲)の初期データをフォームに反映
  useEffect(() => {
    // 曲別出欠の初期設定
    const initialPieceAtt: Record<string, 'attending' | 'absent'> = {};
    activePieces.forEach((piece) => {
      const prevAtt = myMember.piece_attendance?.[piece];
      initialPieceAtt[piece] = prevAtt || 'attending';
    });
    setMyPieceAttendance(initialPieceAtt);

    // コメント初期化（飾りテキストを省いて純粋なフリーコメント部分だけを抽出）
    const rawComment = myMember.comment
      .replace(/譜面台持参\s*\|?\s*/g, '')
      .replace(/.*は降り番\s*\|?\s*/g, '')
      .replace(/\d{2}:\d{2}頃到着予定\s*\|?\s*/g, '')
      .replace(/\d{2}:\d{2}頃早退予定\s*\|?\s*/g, '')
      .trim();
    setMyComment(rawComment);

    setMyStatus(myMember.status);
    setMyCooperations(myMember.cooperations || []);
  }, [scheduleId]);

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

  // 協力トグルハンドラ
  const handleCooperationToggle = (type: string) => {
    setMyCooperations((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // 曲別出欠トグルハンドラ
  const handlePieceAttendanceToggle = (piece: string) => {
    setMyPieceAttendance((prev) => ({
      ...prev,
      [piece]: prev[piece] === 'attending' ? 'absent' : 'attending',
    }));
  };

  // 奏者出欠保存ハンドラ (デモの要)
  const handleSaveMyAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // 0.6秒のローディングアニメーションを経てリアルタイム保存を演出
    setTimeout(() => {
      let generatedComments: string[] = [];

      // 1. 協力項目のテキスト化
      if (myCooperations.includes('stand')) {
        generatedComments.push('譜面台持参');
      }
      if (myCooperations.includes('car')) {
        generatedComments.push('車運搬可');
      }
      if (myCooperations.includes('carry')) {
        generatedComments.push('運搬手伝い可');
      }

      // 2. 遅刻・早退のテキスト化
      if (myStatus === 'late') {
        generatedComments.push(`${myLateTime}頃到着予定`);
      } else if (myStatus === 'early_leave') {
        generatedComments.push(`${myEarlyLeaveTime}頃早退予定`);
      }

      // 3. 曲別出欠（降り番）のテキスト化
      const absentPieces = Object.entries(myPieceAttendance)
        .filter(([_, status]) => status === 'absent')
        .map(([piece]) => {
          const splitPiece = piece.split(' / ')[1] || piece;
          const cleanPieceName = splitPiece.split(' ')[0]; // 交響曲第5番 のような一部
          return `${cleanPieceName}は降り番`;
        });
      
      if (absentPieces.length > 0) {
        generatedComments.push(absentPieces.join(', '));
      }

      // 4. 生コメント
      if (myComment.trim()) {
        generatedComments.push(myComment.trim());
      }

      const finalCommentStr = generatedComments.join(' | ');

      // 団員一覧ステートを書き換え（自分の行を最新にする）
      setAttendances((prev) =>
        prev.map((item) =>
          item.user_id === myUserId
            ? {
                ...item,
                status: myStatus,
                comment: finalCommentStr,
                cooperations: myCooperations,
                piece_attendance: myPieceAttendance,
              }
            : item
        )
      );

      setIsSaving(false);
      setSaveSuccess(true);
      setShowToast(true);

      // 数秒後に完了ステートをリセット
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

      setTimeout(() => {
        setShowToast(false);
      }, 4500);
    }, 600);
  };

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
    <div className="space-y-6 relative">
      {/* 1. 【奏者用】プレミアムマイ予定・出欠登録カード (WOWデザイン) */}
      <div className="relative bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-slate-50 border border-indigo-150 rounded-3xl p-6 shadow-md shadow-indigo-100/40 overflow-hidden transition-all duration-300">
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-sm shadow-indigo-200">
              美
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full tracking-wider uppercase">
                  団員入力画面デモ
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {myMember.part}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-800">
                {myMember.full_name} さんの予定・出欠登録シート
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-200/50">
              <UserCheck className="w-3.5 h-3.5" />
              ログイン中
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveMyAttendance} className="mt-6 space-y-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左カラム: 基本出欠 ＆ 協力項目 (6/12) */}
            <div className="lg:col-span-6 space-y-5">
              {/* クイック出欠ボタン */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-2">
                  ① 当日の基本出欠ステータス
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setMyStatus('attending')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs font-extrabold transition-all border ${
                      myStatus === 'attending'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100 scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${myStatus === 'attending' ? 'text-white' : 'text-emerald-600'}`} />
                    出席
                  </button>

                  <button
                    type="button"
                    onClick={() => setMyStatus('late')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs font-extrabold transition-all border ${
                      myStatus === 'late'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100 scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <Clock className={`w-5 h-5 ${myStatus === 'late' ? 'text-white' : 'text-amber-500'}`} />
                    遅刻・早退
                  </button>

                  <button
                    type="button"
                    onClick={() => setMyStatus('absent')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs font-extrabold transition-all border ${
                      myStatus === 'absent'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-100 scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <XCircle className={`w-5 h-5 ${myStatus === 'absent' ? 'text-white' : 'text-rose-600'}`} />
                    欠席
                  </button>

                  <button
                    type="button"
                    onClick={() => setMyStatus('undecided')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs font-extrabold transition-all border ${
                      myStatus === 'undecided'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-md shadow-slate-100 scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <HelpCircle className={`w-5 h-5 ${myStatus === 'undecided' ? 'text-white' : 'text-slate-500'}`} />
                    未定
                  </button>
                </div>
              </div>

              {/* 遅刻・早退時間指定 (アコーディオン展開) */}
              {myStatus === 'late' && (
                <div className="bg-white border border-amber-200 p-4 rounded-2xl space-y-3 shadow-inner animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>詳細な予定時間を選択してください</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1">
                        遅刻 (何時頃到着予定か)
                      </label>
                      <select
                        value={myLateTime}
                        onChange={(e) => setMyLateTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2 text-slate-800 outline-none focus:ring-2 focus:ring-amber-200 focus:bg-white"
                      >
                        <option value="13:30">13:30 頃</option>
                        <option value="14:00">14:00 頃</option>
                        <option value="15:00">15:00 頃</option>
                        <option value="16:00">16:00 頃</option>
                        <option value="19:00">19:00 頃</option>
                        <option value="19:30">19:30 頃</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1">
                        早退 (何時頃早退予定か)
                      </label>
                      <select
                        value={myEarlyLeaveTime}
                        onChange={(e) => setMyEarlyLeaveTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2 text-slate-800 outline-none focus:ring-2 focus:ring-amber-200 focus:bg-white"
                      >
                        <option value="14:00">14:00 頃</option>
                        <option value="15:00">15:00 頃</option>
                        <option value="16:00">16:00 頃</option>
                        <option value="16:30">16:30 頃</option>
                        <option value="20:00">20:00 頃</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 協力アンケート */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-2">
                  ② 持ち物・運搬協力アンケート
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleCooperationToggle('stand')}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition ${
                      myCooperations.includes('stand')
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-inner'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className={`w-4 h-4 ${myCooperations.includes('stand') ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>マイスマート譜面台を持参できる</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      myCooperations.includes('stand') ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                    }`}>
                      {myCooperations.includes('stand') && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCooperationToggle('car')}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition ${
                      myCooperations.includes('car')
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-inner'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className={`w-4 h-4 ${myCooperations.includes('car') ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>車での大型楽器・機材運搬協力が可能</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      myCooperations.includes('car') ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                    }`}>
                      {myCooperations.includes('car') && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCooperationToggle('carry')}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition ${
                      myCooperations.includes('carry')
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-inner'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Smile className={`w-4 h-4 ${myCooperations.includes('carry') ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>ひな壇・打楽器の設営・片付け手伝い可能</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      myCooperations.includes('carry') ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                    }`}>
                      {myCooperations.includes('carry') && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 右カラム: 曲別の乗番（出欠）管理 (6/12) */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <label className="text-xs font-black text-slate-700">
                    ③ 練習曲別の乗番（出欠）スケジュール
                  </label>
                  <span className="bg-indigo-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-widest scale-90">
                    オケ専用
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  今日の合奏は、曲ごとに「演奏参加 (乗る)」か「不参加 (降りる)」を選べます。降り番の曲がある場合はオフに設定してください。出席率計算や幹事のひな壇配置計算が自動調整されます。
                </p>

                <div className="space-y-3">
                  {activePieces.map((piece) => {
                    const isAttendingPiece = myPieceAttendance[piece] === 'attending';
                    const pieceShort = piece.split(' / ');
                    const composer = pieceShort[0];
                    const title = pieceShort[1] || piece;

                    return (
                      <div
                        key={piece}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          isAttendingPiece
                            ? 'bg-white border-slate-200 shadow-sm'
                            : 'bg-slate-100/50 border-slate-200 opacity-70'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl mt-0.5 ${
                            isAttendingPiece ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'
                          }`}>
                            <Music className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold block">{composer}</span>
                            <span className={`text-xs font-black block leading-tight ${isAttendingPiece ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                              {title}
                            </span>
                          </div>
                        </div>

                        {/* トグルスイッチ */}
                        <button
                          type="button"
                          onClick={() => handlePieceAttendanceToggle(piece)}
                          className={`w-14 h-7 rounded-full transition-all relative outline-none border focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 ${
                            isAttendingPiece 
                              ? 'bg-indigo-600 border-indigo-600' 
                              : 'bg-slate-300 border-slate-300'
                          }`}
                        >
                          <span className={`text-[9px] font-black absolute top-1.5 ${isAttendingPiece ? 'left-2.5 text-white' : 'right-2.5 text-slate-600'}`}>
                            {isAttendingPiece ? '乗る' : '降り'}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${
                              isAttendingPiece ? 'left-8' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* コメント入力 */}
              <div className="pt-2">
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  ④ その他連絡事項（遅刻理由・運営連絡など）
                </label>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  placeholder="例：19時半のチャイコフスキー合奏から参加します。楽譜の確認をしました。"
                  className="w-full bg-white border border-slate-200 text-xs font-medium rounded-2xl p-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-300 min-h-[70px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* 送信セクション */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-indigo-100 font-bold">
            {saveSuccess && (
              <span className="text-xs font-black text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 animate-fade-in">
                <Check className="w-4 h-4 animate-bounce" />
                登録完了！下の一覧にリアルタイム反映されました
              </span>
            )}
            
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center justify-center gap-1.5 text-xs font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all ${
                isSaving
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:scale-[1.01]'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  登録中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  この出欠・予定を登録する
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. サマリーダッシュボードカード */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-medium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 font-bold">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                Realtime Data
              </span>
              <span className="text-xs font-medium text-slate-500 font-bold">リアルタイム集計</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">団員・パート別出欠状況</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-bold">出席率:</span>
              <span className="text-indigo-600 font-black text-base">{attendancePercentage}%</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-bold text-[11px] sm:text-xs text-slate-700">
              <span className="text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> 出席 {attendingCount}
              </span>
              <span className="text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                <Clock className="w-3.5 h-3.5" /> 遅刻 {lateCount}
              </span>
              <span className="text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                <XCircle className="w-3.5 h-3.5" /> 欠席 {absentCount}
              </span>
              <span className="text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150 font-bold">
                <HelpCircle className="w-3.5 h-3.5" /> 未定 {undecidedCount}
              </span>
            </div>
          </div>
        </div>

        {/* 欠席発生時の「リハクルでエキストラ手配」ハイライトバナー */}
        {absentCount > 0 && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 text-amber-800 p-2 rounded-xl mt-0.5 shadow-inner">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {absentCount}名の欠席が発生しています
                  </span>
                  <span className="bg-amber-200 text-amber-950 text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase">
                    リハクル連携
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  欠席パート: {Object.entries(absentPartMap).map(([p, c]) => `${p} (${c}名)`).join(', ')}。エキストラが必要な場合は、リハクルで条件に合う奏者を1クリックで手配できます。
                </p>
              </div>
            </div>

            <Link
              href={`/rehakuru?schedule_id=${scheduleId}&parts=${Object.keys(absentPartMap).join(',')}`}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-sm hover:shadow transition duration-200 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              リハクルでエキストラを手配する
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
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedSection === sec.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* 出欠一覧テーブル */}
        <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <th className="p-3.5 font-bold">パート</th>
                <th className="p-3.5 font-bold">氏名</th>
                <th className="p-3.5 font-bold">出欠ステータス</th>
                <th className="p-3.5 font-bold">連絡事項・理由・乗番</th>
                <th className="p-3.5 font-bold text-right">エキストラ手配</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 bg-white font-medium">
              {filteredAttendances.map((item) => {
                const isAbsent = item.status === 'absent';
                const isLate = item.status === 'late' || item.status === 'early_leave';
                const isAttending = item.status === 'attending';
                const isMe = item.user_id === myUserId;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 transition-all ${
                      isAbsent ? 'bg-rose-50/20' : ''
                    } ${isMe ? 'bg-indigo-50/20 font-medium' : ''}`}
                  >
                    <td className="p-3.5 font-bold text-slate-900">{item.part}</td>
                    <td className="p-3.5 text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className={isMe ? 'font-black text-indigo-700' : ''}>{item.full_name}</span>
                        {isMe && (
                          <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                            あなた
                          </span>
                        )}
                        {item.cooperations?.includes('car') && (
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[8px] font-bold px-1.5 py-0.5 rounded" title="車運搬可能">
                            🚗 車運搬
                          </span>
                        )}
                        {item.cooperations?.includes('carry') && (
                          <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[8px] font-bold px-1.5 py-0.5 rounded" title="運搬手伝い可能">
                            💪 設営可
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      {isAttending && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 出席
                        </span>
                      )}
                      {isLate && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-full font-bold">
                          <Clock className="w-3 h-3 text-amber-500" /> 遅刻・早退
                        </span>
                      )}
                      {isAbsent && (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200/50 px-2.5 py-1 rounded-full font-bold">
                          <XCircle className="w-3 h-3 text-rose-600" /> 欠席
                        </span>
                      )}
                      {item.status === 'undecided' && (
                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full font-bold">
                          <HelpCircle className="w-3 h-3 text-slate-500" /> 未定
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs md:max-w-md">
                      <div className="space-y-1">
                        {/* 曲別出欠のバッジ（乗・降）表示（WOW!） */}
                        {item.piece_attendance && Object.keys(item.piece_attendance).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {Object.entries(item.piece_attendance).map(([piece, status]) => {
                              const pieceShortName = piece.split(' / ')[1]?.split(' ')[0] || piece;
                              const isPieceAttending = status === 'attending';
                              return (
                                <span
                                  key={piece}
                                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold border transition-all ${
                                    isPieceAttending
                                      ? 'bg-indigo-50/80 text-indigo-700 border-indigo-100/80'
                                      : 'bg-slate-100 text-slate-400 line-through border-slate-200'
                                  }`}
                                >
                                  {pieceShortName}: {isPieceAttending ? '乗る' : '降り'}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <p className={`text-slate-600 ${isMe ? 'text-indigo-900 font-medium' : ''}`}>
                          {item.comment ? item.comment : <span className="text-slate-350 italic font-normal">-</span>}
                        </p>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      {isAbsent ? (
                        <Link
                          href={`/rehakuru?schedule_id=${scheduleId}&part=${encodeURIComponent(item.part)}`}
                          className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition duration-150"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
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

      {/* トースト通知 (保存成功) */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-slate-800 font-bold">
          <div className="p-1.5 bg-emerald-600 text-white rounded-xl shadow-inner">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-black">出欠と予定登録を保存しました！</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-normal">変更内容は団員一覧へ瞬時に同期されました。</p>
          </div>
        </div>
      )}
    </div>
  );
}
