'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, MapPin, User, FileText, CheckSquare, Plus, Trash2, 
  Printer, Play, Pause, RotateCcw, Sliders, Sparkles, Filter, Info, AlertCircle
} from 'lucide-react';

// イベントの型定義
interface TimelineEvent {
  id: string;
  title: string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  lane: 'performers' | 'stage' | 'reception' | 'all'; // レーン
  location?: string;
  pic?: string; // 担当者
  notes?: string;
  importance?: 'low' | 'medium' | 'high';
}

// チェックリストアイテムの型
interface ChecklistItem {
  id: string;
  task: string;
  lane: 'performers' | 'stage' | 'reception';
  checked: boolean;
}

// 時間表記 (HH:MM) を分に変換
const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// 分を時間表記 (HH:MM) に変換
const minutesToTime = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// 時間の足し算用ヘルパー
const addMinutesToTimeStr = (timeStr: string, minsToAdd: number): string => {
  try {
    const mins = timeToMinutes(timeStr) + minsToAdd;
    return minutesToTime(mins);
  } catch (e) {
    return timeStr;
  }
};

export default function TimelineGenerator() {
  // --- 動的パラメータ設定 ---
  const [doorsOpenTime, setDoorsOpenTime] = useState<string>('13:30');
  const [showStartTime, setShowStartTime] = useState<string>('14:00');
  const [intermissionMinutes, setIntermissionMinutes] = useState<number>(20);

  const [activeLaneFilter, setActiveLaneFilter] = useState<'all' | 'performers' | 'stage' | 'reception'>('all');
  const [printMode, setPrintMode] = useState<boolean>(false);
  const [highlightImportance, setHighlightImportance] = useState<boolean>(false);

  // --- シミュレーター用の状態 ---
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedTimeMinutes, setSimulatedTimeMinutes] = useState<number>(timeToMinutes('09:00')); // 開始 09:00 (540分)
  const [simulationSpeed, setSimulationSpeed] = useState<number>(5); // 1秒あたりの経過分
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 時間範囲
  const timelineStartMins = timeToMinutes('09:00');
  const timelineEndMins = timeToMinutes('18:00');
  const totalDurationMins = timelineEndMins - timelineStartMins;

  // 動的なスケジュール時間の算出
  const firstPartEnd = addMinutesToTimeStr(showStartTime, 47); // 第1部 47分間 (大学式典12分 + 転換7分 + フルート協奏曲28分)
  const secondPartStart = addMinutesToTimeStr(firstPartEnd, intermissionMinutes); // 後半開始 (休憩時間分加算)
  const secondPartEnd = addMinutesToTimeStr(secondPartStart, 55); // 後半 55分間 (チャイ5本番)
  const concertEnd = addMinutesToTimeStr(secondPartEnd, 15); // 終演・お見送り 15分
  const checkoutTime = addMinutesToTimeStr(concertEnd, 105); // 撤収完了 1時間45分後

  // --- 動的イベントデータの構築 (開場・開演・休憩時間に完全連動) ---
  const events: TimelineEvent[] = [
    {
      id: 'e1',
      title: '楽屋開場 ＆ スタッフ入り',
      start: '09:00',
      end: '09:30',
      lane: 'performers',
      location: '楽屋A-D、楽屋控室',
      pic: '楽屋チーフ (鈴木)',
      notes: '受付での楽屋キー受け取り、出演者用のネームプレート設置、お弁当の納品場所確認。',
      importance: 'medium',
    },
    {
      id: 'e2',
      title: 'ロビー設営 ＆ 受付準備開始',
      start: '09:00',
      end: '10:00',
      lane: 'reception',
      location: '大ホールロビー',
      pic: 'レセプションチーフ (高橋)',
      notes: '案内看板の設置、当日券・招待券窓口のセット、パンフレット挟み込み資材の準備、アンケート用ペン準備。',
      importance: 'medium',
    },
    {
      id: 'e3',
      title: '舞台ひな壇設営 ＆ 反響板・照明仕込み',
      start: '09:00',
      end: '10:00',
      lane: 'stage',
      location: '舞台上',
      pic: '舞台監督 (佐藤) ＆ ホール技術スタッフ',
      notes: '反響板のセッティング、ひな壇(ひな段計算器で算出した配置)の設営、譜面台・椅子の並べ込み。大型打楽器(Timpなど)の搬入。',
      importance: 'high',
    },
    {
      id: 'e4',
      title: '照明シュート ＆ 音響マイクテスト',
      start: '10:00',
      end: '10:30',
      lane: 'stage',
      location: '舞台上',
      pic: '舞台監督 ＆ 音響・照明チーム',
      notes: '指揮者・ソリストへのスポットライト位置調整、MC用マイク・合奏録音用吊りマイクの感度チェック。物音厳禁。',
      importance: 'medium',
    },
    {
      id: 'e5',
      title: 'パンフレット挟み込み作業',
      start: '10:00',
      end: '11:00',
      lane: 'reception',
      location: 'ロビー特設テーブル',
      pic: '受付ボランティア ＆ 運営サポート',
      notes: 'チラシ・アンケート・プログラムの挟み込み(600部)。他の演奏会の挟み込みチラシも一緒に束ねる。',
      importance: 'low',
    },
    {
      id: 'e6',
      title: 'パート個人練習 ＆ チューニング可能時間',
      start: '09:30',
      end: '10:30',
      lane: 'performers',
      location: '各楽屋 ＆ 練習室2',
      pic: 'インスペクター (田中)',
      notes: '各自音出し。打楽器は10:00以降舞台上での音出し可能。弦・木管は楽屋にて。',
      importance: 'low',
    },
    {
      id: 'e7',
      title: 'ゲネプロ (GP) 開始・全体ミーティング',
      start: '10:30',
      end: '10:45',
      lane: 'all',
      location: '舞台上',
      pic: '指揮者 (山田) ＆ 舞台監督 ＆ 全員',
      notes: 'ゲネプロの注意事項説明。入りハケの確認、演奏中の照明演出、打楽器の位置の最終確認。全員舞台上に集合。',
      importance: 'high',
    },
    {
      id: 'e8',
      title: 'ゲネプロ：大学式典序曲',
      start: '10:45',
      end: '11:15',
      lane: 'performers',
      location: '舞台上',
      pic: '指揮者 ＆ 舞台監督 ＆ オーケストラ',
      notes: '冒頭ファンファーレ、コーダ、管楽器のバランス、舞台上の照明明度の確認。',
      importance: 'medium',
    },
    {
      id: 'e9',
      title: 'ゲネプロ：フルート協奏曲 (ソリスト合わせ)',
      start: '11:15',
      end: '12:00',
      lane: 'performers',
      location: '舞台上',
      pic: '指揮者 ＆ ソリスト ＆ 舞台監督',
      notes: 'フルート協奏曲のゲネプロ。ピアノの出し入れ、ソリストの入退場、譜面台と椅子のレイアウト調整（小編成化）を実際にシミュレーション。',
      importance: 'high',
    },
    {
      id: 'e10',
      title: '舞台転換リハーサル (ピアノ収納・ひな段拡張)',
      start: '11:15',
      end: '11:30',
      lane: 'stage',
      location: '舞台上',
      pic: '舞台監督 ＆ ステージマネージャーチーム',
      notes: 'ソリスト用ピアノの退場と、オーケストラフル編成用(チャイ5)への椅子・譜面台の拡張増設、パーカッション配置変更。15分以内で行う練習。',
      importance: 'high',
    },
    {
      id: 'e11',
      title: 'ゲネプロ：交響曲第5番',
      start: '12:00',
      end: '13:00',
      lane: 'performers',
      location: '舞台上',
      pic: '指揮者 ＆ オーケストラ ＆ 舞台監督',
      notes: '第2楽章ホルンソロ、第4楽章のテンポ変化、トランペットの高音、金管ミュートなどのバランス最終確認。全曲通し。',
      importance: 'high',
    },
    {
      id: 'e12',
      title: '受付準備完了 ＆ 窓口オープン',
      start: '11:00',
      end: '13:00',
      lane: 'reception',
      location: 'ロビー正面受付',
      pic: 'レセプションチーフ',
      notes: 'おつり・当日券の確認。金庫のロック、招待名簿のアルファベット順整理完了。プレゼント預かり所の設置。',
      importance: 'medium',
    },
    {
      id: 'e13',
      title: '昼食 ＆ 着替え ＆ 最終チューニング',
      start: '13:00',
      end: '13:30',
      lane: 'performers',
      location: '各楽屋 ＆ 楽屋ロビー',
      pic: '各自',
      notes: 'お弁当配布、ステージ衣装(男性:燕尾/黒タキシード、女性:オール黒)へ着替え。ロビーでの大声はお客様に聞こえるので厳禁。',
      importance: 'medium',
    },
    {
      id: 'e14',
      title: '舞台上最終調律 ＆ 反響板最終クリーン',
      start: '13:00',
      end: '13:30',
      lane: 'stage',
      location: '舞台上',
      pic: '調律師 ＆ 舞台スタッフ',
      notes: 'ゲネプロでのズレを直す最終調律。反響板下のゴミ清労。舞台袖にミネラルウォーターを配置。',
      importance: 'low',
    },
    {
      id: 'e15',
      title: 'スタッフ全体ミーティング ＆ ポジション配置',
      start: '13:00',
      end: '13:20',
      lane: 'reception',
      location: 'ロビー中央',
      pic: 'レセプションチーフ',
      notes: 'もぎり、パンフ配布、当日券、クローク、案内、客席扉の各ポジションの役割再確認。開場時の遅刻者対応フローの徹底。',
      importance: 'high',
    },
    
    // --- ここから下が設定されたパラメータに「動的完全連動」 ---
    {
      id: 'e16',
      title: '客席開場 (ドアオープン) 🔔',
      start: doorsOpenTime,
      end: showStartTime,
      lane: 'all',
      location: 'ホールロビー ＆ 客席',
      pic: '受付スタッフ全員',
      notes: '開場ベル。スムーズなもぎりと案内。パンフレットを確実に手渡し。車椅子席のお客様の誘導、プレゼントのお預かり。楽員はステージ上最終チューニング。',
      importance: 'high',
    },
    {
      id: 'e17',
      title: '演奏会開演：第1部本番 🎺',
      start: showStartTime,
      end: firstPartEnd,
      lane: 'all',
      location: '舞台上 ＆ 客席',
      pic: '指揮者 ＆ オーケストラ ＆ ソリスト',
      notes: 'ブラームス/大学式典序曲、モーツァルト/フルート協奏曲の本番演奏。客席扉は完全ロック(演奏中入場不可)。',
      importance: 'high',
    },
    {
      id: 'e18',
      title: '舞台転換 (協奏曲用：ピアノハケ・フル編成ひな段復旧)',
      start: firstPartEnd,
      end: secondPartStart,
      lane: 'stage',
      location: '舞台上',
      pic: '舞台監督 ＆ 舞台スタッフ',
      notes: 'ソリスト用ピアノを上手袖へ収納。椅子・譜面台を元のフル編成用(チャイ5)へ並べ直し、セッティング確認。休憩終了5分前までに完了させる。',
      importance: 'high',
    },
    {
      id: 'e19',
      title: '中間休憩 (ロビー混雑整理・物販対応)',
      start: firstPartEnd,
      end: secondPartStart,
      lane: 'reception',
      location: 'ロビー ＆ トイレ導線',
      pic: '受付スタッフ',
      notes: `中間休憩 (${intermissionMinutes}分間)。お手洗いへの誘導(非常に混雑するため)。物販対応。アンケート記入のお願い。`,
      importance: 'medium',
    },
    {
      id: 'e20',
      title: '後半チューニング ＆ 舞台袖スタンバイ',
      start: addMinutesToTimeStr(firstPartEnd, intermissionMinutes - 15), // 休憩終了15分前から
      end: secondPartStart,
      lane: 'performers',
      location: '舞台袖 ＆ 楽屋',
      pic: 'インスペクター ＆ チューニングチーフ',
      notes: '弦楽器の松脂塗り直し、木管リード調整。休憩終了5分前には楽員舞台入場。チューニング。',
      importance: 'medium',
    },
    {
      id: 'e21',
      title: '演奏会第2部：交響曲第5番本番 🎻',
      start: secondPartStart,
      end: secondPartEnd,
      lane: 'all',
      location: '舞台上 ＆ 客席',
      pic: '指揮者 ＆ オーケストラ',
      notes: '交響曲第5番の本番演奏(約50分)。持てるすべての情熱を音に乗せて！',
      importance: 'high',
    },
    {
      id: 'e22',
      title: 'アンコール ＆ 終演お見送り 🔔',
      start: secondPartEnd,
      end: concertEnd,
      lane: 'all',
      location: 'ホール全体',
      pic: '全員',
      notes: 'アンコール演奏、カーテンコール、お客様のお見送り。楽員はその後、集合写真撮影準備。',
      importance: 'high',
    },
    {
      id: 'e23',
      title: '打楽器梱包 ＆ トラック積み込み ＆ 舞台撤収',
      start: concertEnd,
      end: checkoutTime,
      lane: 'stage',
      location: '舞台袖 ＆ 搬入口',
      pic: '舞台監督 ＆ 打楽器パート ＆ ステマチーフ',
      notes: 'Timp, バスドラム、チャイムなどの梱包、搬入口のトラックへの積み込み（リフト操作）。舞台上の譜面台・椅子をラックに収納しホール倉庫へ返還。',
      importance: 'high',
    },
    {
      id: 'e24',
      title: '楽員記念撮影 ＆ 着替え ＆ 楽屋清掃',
      start: addMinutesToTimeStr(concertEnd, 10), // 終演10分後から
      end: addMinutesToTimeStr(concertEnd, 55),
      lane: 'performers',
      location: '舞台上 ＆ 各楽屋',
      pic: 'インスペクター ＆ 写真担当',
      notes: '舞台上での全員の集合記念撮影(15分)。速やかに楽屋に戻り、着替え、忘れ物がないかチェックして施錠。ゴミまとめ。',
      importance: 'medium',
    },
    {
      id: 'e25',
      title: '受付撤収 ＆ 会計集計 ＆ 終礼ミーティング',
      start: concertEnd,
      end: addMinutesToTimeStr(concertEnd, 60),
      lane: 'reception',
      location: 'ロビー ＆ 会計室',
      pic: 'レセプションチーフ ＆ 会計担当',
      notes: '当日券売上の集計、アンケート枚数のカウント、お預かりプレゼントの引き渡し確認。スタッフ終礼ミーティング。',
      importance: 'high',
    },
    {
      id: 'e26',
      title: '出演者・スタッフ完全退館 ＆ 鍵の返還',
      start: addMinutesToTimeStr(checkoutTime, -30), // 撤収完了の30分前から
      end: checkoutTime,
      lane: 'all',
      location: 'ホール全館',
      pic: '代表 (団長) ＆ 舞台監督',
      notes: 'すべての楽屋・楽屋ロビーを空にし、ホールの管理事務所へ鍵を返還。精算(付帯設備使用料の支払い)。完全退館。',
      importance: 'high',
    },
  ];

  // --- チェックリストのモックデータ ---
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'c1', task: '大型打楽器 (Timp, 弦バス) の搬入完了', lane: 'stage', checked: false },
    { id: 'c2', task: 'ひな段・椅子・譜面台の配置完了（計算器の数値と合致）', lane: 'stage', checked: false },
    { id: 'c3', task: 'ソリスト用ピアノ（フルコンサート）の配置・調律完了', lane: 'stage', checked: false },
    { id: 'c4', task: '楽屋開錠 ＆ ネームプレート設置・お茶菓子準備完了', lane: 'performers', checked: false },
    { id: 'c5', task: '楽員お弁当 (60食分) の納品確認 ＆ 受取完了', lane: 'performers', checked: false },
    { id: 'c6', task: '案内看板 (当日券・クローク・お祝い花スタンド) 設置', lane: 'reception', checked: false },
    { id: 'c7', task: 'プログラム・アンケート・チラシの挟み込み (600部)', lane: 'reception', checked: false },
    { id: 'c8', task: '当日券用お釣り・チケット・招待者リスト準備完了', lane: 'reception', checked: false },
  ]);

  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(events[0]);

  // --- シミュレーション処理 ---
  useEffect(() => {
    if (isSimulating) {
      simIntervalRef.current = setInterval(() => {
        setSimulatedTimeMinutes((prev) => {
          const next = prev + simulationSpeed;
          if (next >= timelineEndMins) {
            setIsSimulating(false);
            return timelineEndMins;
          }
          return next;
        });
      }, 1000);
    } else {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isSimulating, simulationSpeed]);

  const toggleSimulation = () => setIsSimulating(!isSimulating);
  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulatedTimeMinutes(timeToMinutes('09:00'));
  };

  const currentSimulatedTimeStr = minutesToTime(simulatedTimeMinutes);

  // チェックリスト切り替え
  const toggleChecklist = (id: string) => {
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  // --- スタイル計算 ---
  const pxPerHour = 100;
  const pxPerMin = pxPerHour / 60;

  const getTopPosition = (startStr: string): number => {
    const mins = timeToMinutes(startStr) - timelineStartMins;
    return Math.max(0, mins * pxPerMin);
  };

  const getHeight = (startStr: string, endStr: string): number => {
    const startMins = timeToMinutes(startStr);
    const endMins = timeToMinutes(endStr);
    const duration = endMins - startMins;
    return Math.max(30, duration * pxPerMin);
  };

  // フィルタリング
  const filteredEvents = events.filter(e => {
    if (activeLaneFilter === 'all') return true;
    return e.lane === activeLaneFilter || e.lane === 'all';
  });

  // 時間目盛り生成 (09:00 - 18:00)
  const timeTicks = [];
  for (let m = timelineStartMins; m <= timelineEndMins; m += 30) {
    timeTicks.push(minutesToTime(m));
  }

  // 現在進行中イベント
  const activeEventsNow = events.filter(e => {
    const start = timeToMinutes(e.start);
    const end = timeToMinutes(e.end);
    return simulatedTimeMinutes >= start && simulatedTimeMinutes < end;
  });

  const triggerPrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 300);
  };

  return (
    <div className={`bg-white border rounded-2xl shadow-md overflow-hidden transition-all ${printMode ? 'p-0 border-0 shadow-none' : 'p-6'}`}>
      
      {/* 印刷用ヘッダー */}
      {printMode && (
        <div className="hidden print:block mb-6 border-b-2 border-slate-800 pb-3">
          <h1 className="text-xl font-bold text-slate-900">演奏会当日進行マルチタイムライン (開場開演連動)</h1>
          <p className="text-xs text-slate-600 mt-1">
            開場: {doorsOpenTime} | 開演: {showStartTime} | 休憩: {intermissionMinutes}分
          </p>
        </div>
      )}

      {/* ヘッダー・アクションバー */}
      {!printMode && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl text-white shadow-md shadow-indigo-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase animate-pulse">
                  Dynamic Preview
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  パラメータ完全連動
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">当日進行マルチタイムスケジュール表</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setHighlightImportance(!highlightImportance)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                highlightImportance
                  ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              重要度で強調
            </button>

            <button
              onClick={triggerPrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              印刷・PDF保存
            </button>
          </div>
        </div>
      )}

      {/* 連動設定パラメータ (印刷時は非表示) */}
      {!printMode && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs my-5">
          <div>
            <label className="text-slate-600 block mb-1 font-bold">客席開場時間 (Doors Open)</label>
            <input
              type="time"
              value={doorsOpenTime}
              onChange={(e) => setDoorsOpenTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-bold outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-bold">演奏会開演時間 (Concert Start)</label>
            <input
              type="time"
              value={showStartTime}
              onChange={(e) => setShowStartTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-bold outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-bold">中間休憩時間 (Intermission)</label>
            <select
              value={intermissionMinutes}
              onChange={(e) => setIntermissionMinutes(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-bold outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={15}>15 分間</option>
              <option value={20}>20 分間</option>
              <option value={25}>25 分間</option>
            </select>
          </div>
        </div>
      )}

      {/* 進行シミュレーター (デモモード) */}
      {!printMode && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-inner mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[120px]">
                <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">当日想定時間</div>
                <div className="text-3xl font-black font-mono tracking-wider text-white mt-1">
                  {currentSimulatedTimeStr}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1 text-indigo-200">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  タイムシミュレーター 💡
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                  スライダーをスライドすると、開場開演時間から算出した各予定（演者・舞台・受付）の現在位置が点灯ハイライトされます。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
              <button
                onClick={toggleSimulation}
                className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                  isSimulating 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                {isSimulating ? (
                  <><Pause className="w-3.5 h-3.5 fill-current" />一時停止</>
                ) : (
                  <><Play className="w-3.5 h-3.5 fill-current" />自動進行</>
                )}
              </button>
              
              <button
                onClick={resetSimulation}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                title="朝9:00にリセット"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>速度:</span>
                <select
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="bg-slate-800 text-white rounded px-2 py-1 border border-slate-700 text-xs font-bold outline-none"
                >
                  <option value={1}>1倍 (1分/秒)</option>
                  <option value={5}>5倍 (5分/秒)</option>
                  <option value={10}>10倍 (10分/秒)</option>
                  <option value={20}>20倍 (20分/秒)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-[10px] font-extrabold text-slate-400">09:00</span>
            <input
              type="range"
              min={timelineStartMins}
              max={timelineEndMins}
              value={simulatedTimeMinutes}
              onChange={(e) => {
                setIsSimulating(false);
                setSimulatedTimeMinutes(Number(e.target.value));
              }}
              className="flex-1 accent-indigo-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
            />
            <span className="text-[10px] font-extrabold text-slate-400">18:00</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2 items-center text-xs">
            <span className="text-slate-400 font-bold">現在進行中 ({activeEventsNow.length}件):</span>
            {activeEventsNow.length === 0 ? (
              <span className="text-slate-500 italic">予定されている動きはありません</span>
            ) : (
              activeEventsNow.map((e) => (
                <span
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  className={`cursor-pointer px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
                    e.lane === 'performers' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' :
                    e.lane === 'stage' ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' :
                    e.lane === 'reception' ? 'bg-sky-950/40 border-sky-500/40 text-sky-300' :
                    'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                  }`}
                >
                  [{e.start}-{e.end}] {e.title}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* メイングリッドエリア */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* 左側：3レーン・タイムライン */}
        <div className={`xl:col-span-8 ${printMode ? 'xl:col-span-12' : ''}`}>
          
          {/* レーンフィルター */}
          {!printMode && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveLaneFilter('all')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                  activeLaneFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全員共通 ＆ 全体
              </button>
              <button
                onClick={() => setActiveLaneFilter('performers')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                  activeLaneFilter === 'performers' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                演者・進行
              </button>
              <button
                onClick={() => setActiveLaneFilter('stage')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                  activeLaneFilter === 'stage' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                舞台上
              </button>
              <button
                onClick={() => setActiveLaneFilter('reception')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                  activeLaneFilter === 'reception' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                受付周り
              </button>
            </div>
          )}

          {/* タイムライン本体 */}
          <div className="border border-slate-200 rounded-2xl bg-slate-50 relative overflow-x-auto min-h-[600px]">
            <div className="min-w-[760px] relative select-none" style={{ height: `${totalDurationMins * pxPerMin + 60}px` }}>
              
              {/* 背景横目盛り線 */}
              {timeTicks.map((tickStr, idx) => {
                const top = getTopPosition(tickStr);
                const isHour = tickStr.endsWith(':00');
                return (
                  <div 
                    key={idx} 
                    className="absolute left-0 right-0 border-t pointer-events-none flex items-center"
                    style={{ 
                      top: `${top + 40}px`,
                      borderColor: isHour ? '#cbd5e1' : '#f1f5f9',
                    }}
                  >
                    <span className={`absolute left-2 -top-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-black ${
                      isHour ? 'bg-slate-200 text-slate-800' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {tickStr}
                    </span>
                  </div>
                );
              })}

              {/* 3カラムヘッダー (演者が一番左) */}
              <div className="absolute top-0 left-[70px] right-0 h-10 border-b border-slate-300 bg-slate-100 flex font-extrabold text-[11px] text-slate-700 tracking-wider">
                {(activeLaneFilter === 'all' || activeLaneFilter === 'performers') && (
                  <div className="flex-1 border-r border-slate-200 flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-800 uppercase font-extrabold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    演者・進行 (楽屋・チューニング)
                  </div>
                )}
                {(activeLaneFilter === 'all' || activeLaneFilter === 'stage') && (
                  <div className="flex-1 border-r border-slate-200 flex items-center justify-center gap-1.5 bg-amber-500/10 text-amber-800 uppercase font-extrabold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    舞台上 (照明・転換・仕込み)
                  </div>
                )}
                {(activeLaneFilter === 'all' || activeLaneFilter === 'reception') && (
                  <div className="flex-1 flex items-center justify-center gap-1.5 bg-sky-500/10 text-sky-800 uppercase font-extrabold">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    受付周り (ロビー・クローク)
                  </div>
                )}
              </div>

              {/* 現在進行度赤ライン */}
              {!printMode && simulatedTimeMinutes >= timelineStartMins && simulatedTimeMinutes <= timelineEndMins && (
                <div 
                  className="absolute left-0 right-0 border-t-2 border-dashed border-rose-500 z-20 flex items-center justify-end pointer-events-none transition-all duration-500"
                  style={{ top: `${getTopPosition(currentSimulatedTimeStr) + 40}px` }}
                >
                  <span className="bg-rose-500 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-l-md -mt-3.5 shadow-sm animate-pulse">
                    NOW {currentSimulatedTimeStr}
                  </span>
                </div>
              )}

              {/* 動的イベントカードのプロット */}
              <div className="absolute top-10 left-[70px] right-0 bottom-0">
                {filteredEvents.map((event) => {
                  const top = getTopPosition(event.start);
                  const height = getHeight(event.start, event.end);
                  const isSelected = selectedEvent?.id === event.id;
                  const isNowActive = simulatedTimeMinutes >= timeToMinutes(event.start) && simulatedTimeMinutes < timeToMinutes(event.end);
                  const isHighImp = event.importance === 'high' && highlightImportance;

                  let leftClass = 'left-0 right-0';
                  let widthClass = 'w-full';
                  let bgBorderClass = 'bg-indigo-50 border-indigo-200 text-indigo-950';

                  if (activeLaneFilter === 'all') {
                    if (event.lane === 'performers') {
                      leftClass = 'left-[0%] right-[66.6%]';
                      widthClass = 'w-[33%]';
                      bgBorderClass = `bg-emerald-50 hover:bg-emerald-100/90 border-emerald-200 text-emerald-950 ${isNowActive ? 'ring-2 ring-emerald-500/50' : ''}`;
                    } else if (event.lane === 'stage') {
                      leftClass = 'left-[33.3%] right-[33.3%]';
                      widthClass = 'w-[33%]';
                      bgBorderClass = `bg-amber-50 hover:bg-amber-100/90 border-amber-200 text-amber-950 ${isNowActive ? 'ring-2 ring-amber-500/50' : ''}`;
                    } else if (event.lane === 'reception') {
                      leftClass = 'left-[66.6%] right-0';
                      widthClass = 'w-[33%]';
                      bgBorderClass = `bg-sky-50 hover:bg-sky-100/90 border-sky-200 text-sky-950 ${isNowActive ? 'ring-2 ring-sky-500/50' : ''}`;
                    } else if (event.lane === 'all') {
                      leftClass = 'left-0 right-0';
                      widthClass = 'w-full z-10';
                      bgBorderClass = `bg-violet-100 hover:bg-violet-200 border-violet-300 text-violet-950 border-l-4 border-l-violet-600 ${isNowActive ? 'ring-2 ring-violet-500/50' : ''}`;
                    }
                  } else {
                    widthClass = 'w-full';
                    if (event.lane === 'performers') bgBorderClass = 'bg-emerald-50 border-emerald-200 text-emerald-950';
                    if (event.lane === 'stage') bgBorderClass = 'bg-amber-50 border-amber-200 text-amber-950';
                    if (event.lane === 'reception') bgBorderClass = 'bg-sky-50 border-sky-200 text-sky-950';
                    if (event.lane === 'all') bgBorderClass = 'bg-violet-50 border-violet-200 text-violet-950';
                  }

                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      className={`absolute ${leftClass} ${widthClass} border p-2 transition cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm ${bgBorderClass} ${
                        isSelected ? 'ring-2 ring-indigo-600 ring-offset-1 z-20 shadow-md' : ''
                      } ${isHighImp ? 'ring-2 ring-rose-500 bg-rose-50 border-rose-300' : ''}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[9px] font-black opacity-80 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            {event.start} - {event.end}
                          </span>
                          {event.importance === 'high' && (
                            <span className="bg-rose-500 text-white font-extrabold text-[8px] px-1 rounded-sm scale-90">
                              必須
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-[11px] leading-snug mt-1 line-clamp-2 tracking-tight">
                          {event.title}
                        </h4>
                      </div>

                      {height >= 60 && (
                        <div className="mt-1 pt-1 border-t border-black/5 flex items-center gap-2 text-[9px] text-slate-500 font-medium">
                          {event.location && (
                            <span className="truncate flex items-center gap-0.5 max-w-[50%]">
                              <MapPin className="w-2.5 h-2.5 text-rose-500" />
                              {event.location.split('・')[0]}
                            </span>
                          )}
                          {event.pic && (
                            <span className="truncate flex items-center gap-0.5 max-w-[50%]">
                              <User className="w-2.5 h-2.5 text-slate-400" />
                              {event.pic.split('(')[0]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* 右側：詳細インスペクター＆チェックリスト */}
        <div className={`xl:col-span-4 space-y-6 ${printMode ? 'hidden' : ''}`}>
          
          {/* A. 詳細表示カード */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-6">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              選択中の進行詳細
            </h3>

            {selectedEvent ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                    selectedEvent.lane === 'performers' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    selectedEvent.lane === 'stage' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    selectedEvent.lane === 'reception' ? 'bg-sky-100 text-sky-800 border-sky-200' :
                    'bg-violet-100 text-violet-800 border-violet-300'
                  }`}>
                    {selectedEvent.lane === 'performers' ? '演者・楽屋進行' : 
                     selectedEvent.lane === 'stage' ? '舞台上（転換・音響照明）' : 
                     selectedEvent.lane === 'reception' ? '受付周り（ロビー）' : '全員共通（全体）'}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    {selectedEvent.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold mt-2">
                    <Clock className="w-4 h-4" />
                    <span>想定時刻: {selectedEvent.start} 〜 {selectedEvent.end}</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-200 text-xs">
                  {selectedEvent.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-slate-800 block">実施場所:</span>
                        <p className="text-slate-600 font-medium">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.pic && (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-slate-800 block">担当者 / グループ / 責任者:</span>
                        <p className="text-slate-600 font-medium">{selectedEvent.pic}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-slate-800 block">指示内容・注意事項:</span>
                        <p className="text-slate-600 leading-relaxed font-medium mt-1 whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200">
                          {selectedEvent.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                <Clock className="w-8 h-8 mx-auto text-slate-300 stroke-1 mb-2" />
                <p className="text-xs font-bold">タイムライン上の予定をクリックすると、詳細がここに表示されます</p>
              </div>
            )}

            {/* B. チェックリスト */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  当日の役割別チェックリスト
                </h3>
              </div>

              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer select-none text-[11px] font-medium transition ${
                      item.checked
                        ? 'bg-slate-100 text-slate-400 line-through'
                        : item.lane === 'performers' ? 'bg-emerald-50/20 border-emerald-200 text-slate-800' :
                          item.lane === 'stage' ? 'bg-amber-50/20 border-amber-200 text-slate-800' :
                          'bg-sky-50/20 border-sky-200 text-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklist(item.id)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 shrink-0"
                    />
                    <span>
                      <span className={`text-[8px] font-black tracking-wider px-1 py-0.1 rounded-sm mr-1 border uppercase ${
                        item.lane === 'performers' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        item.lane === 'stage' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-sky-100 text-sky-700 border-sky-200'
                      }`}>
                        {item.lane === 'performers' ? '演者' : item.lane === 'stage' ? '舞台' : '受付'}
                      </span>
                      {item.task}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {!printMode && (
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold pl-1">
          <Clock className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
          <span>※ 本部設定を変更（開場時間、開演時間、および休憩時間を上にインプット）すると、下のタイムラインのブロックがリアルタイムに伸縮・自動調整されます。</span>
        </div>
      )}
    </div>
  );
}
