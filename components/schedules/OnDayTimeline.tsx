'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, MapPin, User, FileText, CheckSquare, Plus, Trash2, Edit3, 
  Eye, EyeOff, Printer, Play, Pause, RotateCcw, Sliders, ChevronDown, 
  ChevronUp, AlertCircle, Info, Sparkles, Filter, Grid, List, Download
} from 'lucide-react';

// イベントの型定義
interface TimelineEvent {
  id: string;
  title: string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  lane: 'performers' | 'stage' | 'reception' | 'all'; // レーン (演者が最優先)
  location?: string;
  pic?: string; // 担当者
  notes?: string;
  importance?: 'low' | 'medium' | 'high';
}

// チェックリストアイテムの型定義
interface ChecklistItem {
  id: string;
  task: string;
  lane: 'performers' | 'stage' | 'reception';
  checked: boolean;
}

interface OnDayTimelineProps {
  scheduleId: string;
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

export default function OnDayTimeline({ scheduleId }: OnDayTimelineProps) {
  // --- 初期モックデータ (演者が最優先) ---
  const initialEvents: TimelineEvent[] = [
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
      title: '受付準備完了 ＆ チケット当日券・招待券窓口オープン',
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
      end: '14:00',
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
    {
      id: 'e16',
      title: 'ロビー開場 (ドアオープン) ＆ 来場客案内',
      start: '13:30',
      end: '14:00',
      lane: 'all',
      location: 'ホールロビー ＆ 客席',
      pic: '受付スタッフ全員',
      notes: '開場ベル。スムーズなもぎりと案内。パンフレットを確実に手渡し。車椅子席のお客様の誘導、プレゼントのお預かり。',
      importance: 'high',
    },
    {
      id: 'e17',
      title: 'ソリスト・指揮者舞台袖スタンバイ ＆ 楽員入場開始',
      start: '13:50',
      end: '14:00',
      lane: 'performers',
      location: '上手・下手舞台袖',
      pic: 'インスペクター ＆ 舞台監督',
      notes: '舞台袖でA=442での最終ピッチ確認。13:55より楽員が舞台上へ入場し、それぞれのチューニング(音出し)。ソリストと指揮者は上手楽屋で待機。',
      importance: 'high',
    },
    {
      id: 'e18',
      title: '演奏会開演：第1部 (大学式典序曲)',
      start: '14:00',
      end: '14:15',
      lane: 'all',
      location: '舞台上 ＆ 客席',
      pic: '指揮者 ＆ オーケストラ',
      notes: '本番演奏(約12分)。客席扉は完全ロック(演奏中入場不可)。遅刻者は曲間(または楽章間)にのみ誘導。',
      importance: 'high',
    },
    {
      id: 'e19',
      title: '舞台転換 (協奏曲用：ピアノ出し・ひな段再調整)',
      start: '14:15',
      end: '14:22',
      lane: 'stage',
      location: '舞台上',
      pic: '舞台監督 ＆ ステージマネージャーチーム',
      notes: '大急ぎでソリスト用フルコンサートピアノを中央へ。中央ひな壇前列の椅子を撤去。譜面台の高さを調整。照明を協奏曲用に切り替え。目標7分。',
      importance: 'high',
    },
    {
      id: 'e20',
      title: '演奏会：第1部 (フルート協奏曲)',
      start: '14:22',
      end: '14:47',
      lane: 'all',
      location: '舞台上 ＆ 客席',
      pic: 'ソリスト ＆ 指揮者 ＆ オーケストラ',
      notes: '本番演奏(約22分)。演奏中の急な退出や体調不良者への緊急対応チーム待機。',
      importance: 'high',
    },
    {
      id: 'e21',
      title: '中間休憩 (ロビー物販 ＆ 受付遅刻・お忘れ物対応)',
      start: '14:47',
      end: '15:10',
      lane: 'reception',
      location: 'ロビー ＆ トイレ導線',
      pic: '受付スタッフ',
      notes: '20分間の休憩。お手洗いへの誘導(非常に混雑するため)。物販対応。アンケート記入のお願い。',
      importance: 'medium',
    },
    {
      id: 'e22',
      title: '舞台転換 (交響曲用：ピアノハケ・フル編成ひな段復旧)',
      start: '14:47',
      end: '15:00',
      lane: 'stage',
      location: '舞台上',
      pic: '舞台監督 ＆ 舞台スタッフ',
      notes: 'ピアノを上手袖へ収納。椅子・譜面台を元のフル編成用(チャイ5)へ並べ直し、セッティング確認。指揮台の譜面台の楽譜を入れ替え。休憩終了5分前までに完了させる。',
      importance: 'high',
    },
    {
      id: 'e23',
      title: '後半チューニング ＆ 舞台袖スタンバイ',
      start: '14:55',
      end: '15:10',
      lane: 'performers',
      location: '舞台袖 ＆ 楽屋',
      pic: 'インスペクター ＆ チューニングチーフ',
      notes: '弦楽器の松脂塗り直し、木管リード調整。15:05楽員舞台入場。チューニング。',
      importance: 'medium',
    },
    {
      id: 'e24',
      title: '演奏会開演：第2部 (チャイコフスキー交響曲第5番)',
      start: '15:10',
      end: '16:05',
      lane: 'all',
      location: '舞台上 ＆ 客席',
      pic: '指揮者 ＆ オーケストラ ＆ 舞台監督',
      notes: '大本命の本番演奏(約50分) ＋ アンコール(約5分)。カーテンコール時の照明、指揮者への花束贈呈タイミング(舞台袖で待機)。',
      importance: 'high',
    },
    {
      id: 'e25',
      title: '終演お見送り ＆ アンケート回収 ＆ 忘れ物確認',
      start: '16:05',
      end: '16:45',
      lane: 'reception',
      location: 'ロビー出口 ＆ 客席内',
      pic: '受付スタッフ全員',
      notes: 'お見送り、チラシの回収、アンケート用紙の回収(鉛筆回収も忘れずに)。客席の忘れ物チェック(携帯、傘、コートなど)。',
      importance: 'medium',
    },
    {
      id: 'e26',
      title: '楽員記念撮影 ＆ 着替え ＆ 楽屋清掃',
      start: '16:15',
      end: '17:00',
      lane: 'performers',
      location: '舞台上 ＆ 各楽屋',
      pic: 'インスペクター ＆ 写真担当',
      notes: '舞台上での全員の集合記念撮影(15分)。速やかに楽屋に戻り、衣装から私服に着替え。楽屋のゴミをまとめ、忘れ物がないかチェックして施錠。',
      importance: 'medium',
    },
    {
      id: 'e27',
      title: '打楽器梱包 ＆ 運搬トラック積み込み ＆ 舞台撤収',
      start: '16:15',
      end: '17:30',
      lane: 'stage',
      location: '舞台袖 ＆ 搬入口',
      pic: '舞台監督 ＆ 打楽器パート ＆ ステマチーフ',
      notes: 'Timp, バスドラム、チャイムなどの専用ハードケース梱包。搬入口の4tトラックへの積み込み（リフト操作）。舞台上の譜面台・椅子をラックに収納しホール倉庫へ返還。',
      importance: 'high',
    },
    {
      id: 'e28',
      title: '受付撤収 ＆ 会計集計 ＆ 終礼ミーティング',
      start: '16:45',
      end: '17:30',
      lane: 'reception',
      location: 'ロビー ＆ 会計室',
      pic: 'レセプションチーフ ＆ 会計担当',
      notes: '当日券売上の集計、アンケート枚数のカウント、お預かりプレゼントの引き渡し確認。スタッフ終礼ミーティングと挨拶。',
      importance: 'high',
    },
    {
      id: 'e29',
      title: '出演者・スタッフ完全退館 ＆ 鍵の返還',
      start: '17:30',
      end: '18:00',
      lane: 'all',
      location: 'ホール全館',
      pic: '代表 (団長) ＆ 舞台監督',
      notes: '全ての楽屋・ホールが空になったことを確認し、ホールの管理事務所へ鍵を返還。精算(付帯設備使用料の支払い)。18:00完全退館。',
      importance: 'high',
    },
  ];

  const initialChecklist: ChecklistItem[] = [
    { id: 'c11', task: '全楽屋の開錠 ＆ ネームプレート設置完了', lane: 'performers', checked: false },
    { id: 'c12', task: 'ソリスト・指揮者の控室にお茶・お菓子の用意', lane: 'performers', checked: false },
    { id: 'c13', task: '団員お弁当 (60食分) の納品確認 ＆ 配布準備', lane: 'performers', checked: false },
    { id: 'c14', task: 'エキストラ奏者への挨拶 ＆ 楽屋案内完了', lane: 'performers', checked: false },
    { id: 'c15', task: '全員のステージ衣装への着替え完了確認', lane: 'performers', checked: false },
    { id: 'c1', task: '大型打楽器 (Timp) 搬入完了', lane: 'stage', checked: false },
    { id: 'c2', task: '舞台上ひな段 ＆ 譜面台・椅子並べ完了', lane: 'stage', checked: false },
    { id: 'c3', task: 'ゲネプロ用照明・音響調整完了', lane: 'stage', checked: false },
    { id: 'c4', task: '指揮台 ＆ 指揮者譜面台の設置完了', lane: 'stage', checked: false },
    { id: 'c5', task: '本番中の舞台転換手順のスタッフ再確認', lane: 'stage', checked: false },
    { id: 'c6', task: '案内看板 (当日券・招待券・開場時間) のロビー設置', lane: 'reception', checked: false },
    { id: 'c7', task: '当日パンフレット ＆ アンケート挟み込み (600部)', lane: 'reception', checked: false },
    { id: 'c8', task: '当日券窓口のお釣り金庫 ＆ チケット準備完了', lane: 'reception', checked: false },
    { id: 'c9', task: '花束・プレゼント預かり所の特設完了', lane: 'reception', checked: false },
    { id: 'c10', task: 'クロークの番号札 ＆ ハンガー準備完了', lane: 'reception', checked: false },
  ];

  // --- 状態管理 ---
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(initialEvents[0]);
  const [activeLaneFilter, setActiveLaneFilter] = useState<'all' | 'performers' | 'stage' | 'reception'>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [printMode, setPrintMode] = useState<boolean>(false);
  const [highlightImportance, setHighlightImportance] = useState<boolean>(false);
  
  // デモ/シミュレーター機能用の状態
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedTimeMinutes, setSimulatedTimeMinutes] = useState<number>(timeToMinutes('09:00')); // 開始 09:00 (540分)
  const [simulationSpeed, setSimulationSpeed] = useState<number>(5); // 1秒あたりの経過分
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 新規イベント追加用の簡易フォーム用状態
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [newLane, setNewLane] = useState<'performers' | 'stage' | 'reception' | 'all'>('performers');
  const [newLocation, setNewLocation] = useState('');
  const [newPic, setNewPic] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newImportance, setNewImportance] = useState<'low' | 'medium' | 'high'>('medium');

  // 時間範囲
  const timelineStartMins = timeToMinutes('09:00');
  const timelineEndMins = timeToMinutes('18:00');
  const totalDurationMins = timelineEndMins - timelineStartMins;

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

  // リアルタイム反映（もし本番当日であれば本番時間、デモモードならデモ時間）
  const currentSimulatedTimeStr = minutesToTime(simulatedTimeMinutes);

  // --- イベント編集・追加 ---
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newEvent: TimelineEvent = {
      id: `e-custom-${Date.now()}`,
      title: newTitle,
      start: newStart,
      end: newEnd,
      lane: newLane,
      location: newLocation || undefined,
      pic: newPic || undefined,
      notes: newNotes || undefined,
      importance: newImportance,
    };

    setEvents((prev) => [...prev, newEvent].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)));
    setSelectedEvent(newEvent);
    setIsAddOpen(false);
    // フォームリセット
    setNewTitle('');
    setNewStart('12:00');
    setNewEnd('13:00');
    setNewLocation('');
    setNewPic('');
    setNewNotes('');
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('このスケジュール項目を削除しますか？')) {
      const filtered = events.filter(e => e.id !== id);
      setEvents(filtered);
      if (selectedEvent?.id === id) {
        setSelectedEvent(filtered[0] || null);
      }
    }
  };

  // チェックリストの切り替え
  const toggleChecklist = (id: string) => {
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  // --- スタイル計算 ---
  // 1時間あたりの高さ(px)
  const pxPerHour = 100;
  // 1分あたりの高さ(px)
  const pxPerMin = pxPerHour / 60;

  // 開始時間からの相対位置(px)を計算
  const getTopPosition = (startStr: string): number => {
    const mins = timeToMinutes(startStr) - timelineStartMins;
    return Math.max(0, mins * pxPerMin);
  };

  // イベントの高さを計算
  const getHeight = (startStr: string, endStr: string): number => {
    const startMins = timeToMinutes(startStr);
    const endMins = timeToMinutes(endStr);
    const duration = endMins - startMins;
    return Math.max(30, duration * pxPerMin);
  };

  // --- フィルタリングされたイベント ---
  const filteredEvents = events.filter(e => {
    if (activeLaneFilter === 'all') return true;
    return e.lane === activeLaneFilter || e.lane === 'all';
  });

  // 時間目盛りを生成 (09:00から18:00まで30分おき)
  const timeTicks = [];
  for (let m = timelineStartMins; m <= timelineEndMins; m += 30) {
    timeTicks.push(minutesToTime(m));
  }

  // アクティブなイベント（現在シミュレートしている時間帯に行われているイベント）
  const getActiveEventsNow = () => {
    return events.filter(e => {
      const start = timeToMinutes(e.start);
      const end = timeToMinutes(e.end);
      return simulatedTimeMinutes >= start && simulatedTimeMinutes < end;
    });
  };

  const activeEventsNow = getActiveEventsNow();

  // 印刷トリガー
  const triggerPrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 300);
  };

  return (
    <div className={`bg-white border rounded-2xl shadow-md overflow-hidden transition-all ${printMode ? 'p-0 border-0 shadow-none' : 'p-6'}`}>
      
      {/* 印刷ヘッダー (通常非表示、印刷時のみ) */}
      {printMode && (
        <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-slate-900">当日進行スケジュール表</h1>
          <p className="text-sm text-slate-600 mt-1">
            イベント：第20回定期演奏会 GP＆本番 | 日程: 2026年9月13日 (日)
          </p>
        </div>
      )}

      {/* --- ヘッダー・ツールバー (印刷時は非表示) --- */}
      {!printMode && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl text-white shadow-md shadow-indigo-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                  Time Table
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  3レーン連動
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">当日進行マルチタイムライン</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 表示モード切替 */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center gap-0.5">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'timeline' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                グリッド表示
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'list' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                リスト表示
              </button>
            </div>

            {/* 重要イベント強調 */}
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

            {/* 新規追加ボタン */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-indigo-100 transition"
            >
              <Plus className="w-4 h-4" />
              予定追加
            </button>

            {/* 印刷 */}
            <button
              onClick={triggerPrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              印刷
            </button>
          </div>
        </div>
      )}

      {/* --- 本番タイムシミュレーター (印刷時は非表示) --- */}
      {!printMode && (
        <div className="my-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-inner">
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
                  進行シミュレーター 💡
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                  スライダーを動かして当日の時間を進められます。各役割(演者・舞台・受付)が「その瞬間に何をするか」が連動して変化します。
                </p>
              </div>
            </div>

            {/* シミュレーション操作パネル */}
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
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    一時停止
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    自動進行
                  </>
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

          {/* シミュレータースライダー */}
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

          {/* 現在時間進行中のイベント概要 */}
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

      {/* --- 新規追加モーダル --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-indigo-600" />
                当日タイムスケジュールを追加
              </h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1 rounded-lg hover:bg-slate-50 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">イベント名 (必須)</label>
                <input
                  type="text"
                  required
                  placeholder="例：チューニング、舞台ひな壇設営、ドアオープンなど"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">開始時間</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">終了時間</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">対象レーン (役割カテゴリ)</label>
                  <select
                    value={newLane}
                    onChange={(e) => setNewLane(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800 font-bold"
                  >
                    <option value="performers">演者・進行 (楽屋・チューニング)</option>
                    <option value="stage">舞台上 (照明・音響・転換)</option>
                    <option value="reception">受付周り (ロビー・クローク)</option>
                    <option value="all">全員共通 (ゲネプロ・開場など)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">重要度</label>
                  <select
                    value={newImportance}
                    onChange={(e) => setNewImportance(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800 font-bold"
                  >
                    <option value="low">低 (一般・自由)</option>
                    <option value="medium">中 (標準)</option>
                    <option value="high">高 (厳守・クリティカル)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">実施場所 (任意)</label>
                  <input
                    type="text"
                    placeholder="例：楽屋A、舞台上、ロビー"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">担当者/責任者 (任意)</label>
                  <input
                    type="text"
                    placeholder="例：インスペクター、佐藤、高橋"
                    value={newPic}
                    onChange={(e) => setNewPic(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">注意事項・メモ (任意)</label>
                <textarea
                  placeholder="作業内容、必要なツール、緊急時の連絡先など"
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-slate-800 font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition"
                >
                  スケジュールを追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* --- メインコンテンツ領域 --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">

        {/* --- タイムライン / リスト本体 (12カラム中 8または9カラム) --- */}
        <div className={`xl:col-span-8 ${printMode ? 'xl:col-span-12' : ''}`}>
          
          {/* レーンフィルタータブ (タイムライン表示＆通常時のみ - 演者が最優先) */}
          {viewMode === 'timeline' && !printMode && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveLaneFilter('all')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                  activeLaneFilter === 'all' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-indigo-500" />
                全員共通 ＆ 全体
              </button>
              <button
                onClick={() => setActiveLaneFilter('performers')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                  activeLaneFilter === 'performers' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                演者・進行
              </button>
              <button
                onClick={() => setActiveLaneFilter('stage')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                  activeLaneFilter === 'stage' 
                    ? 'bg-amber-500 text-slate-950 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                舞台上
              </button>
              <button
                onClick={() => setActiveLaneFilter('reception')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                  activeLaneFilter === 'reception' 
                    ? 'bg-sky-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                受付周り
              </button>
            </div>
          )}

          {/* ==================== 1. タイムライン(グリッド)表示 ==================== */}
          {viewMode === 'timeline' && (
            <div className="border border-slate-200 rounded-2xl bg-slate-50 relative overflow-x-auto min-h-[600px]">
              
              {/* グリッド本体コンテナ */}
              <div className="min-w-[760px] relative select-none" style={{ height: `${totalDurationMins * pxPerMin + 60}px` }}>
                
                {/* タイムラインの背景横線グリッド */}
                {timeTicks.map((tickStr, idx) => {
                  const top = getTopPosition(tickStr);
                  const isHour = tickStr.endsWith(':00');
                  return (
                    <div 
                      key={idx} 
                      className="absolute left-0 right-0 border-t pointer-events-none flex items-center"
                      style={{ 
                        top: `${top + 40}px`,
                        borderColor: isHour ? '#cbd5e1' : '#f1f5f9', // 1時間おきに濃い線
                      }}
                    >
                      {/* 時間目盛り表示 */}
                      <span className={`absolute left-2 -top-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-black ${
                        isHour ? 'bg-slate-200 text-slate-800' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {tickStr}
                      </span>
                    </div>
                  );
                })}

                {/* タイムライン縦レーンヘッダー (演者・舞台・受付の順) */}
                <div className="absolute top-0 left-[70px] right-0 h-10 border-b border-slate-300 bg-slate-100 flex font-extrabold text-[11px] text-slate-700 tracking-wider">
                  {/* 各役割カラム (演者が最優先) */}
                  {(activeLaneFilter === 'all' || activeLaneFilter === 'performers') && (
                    <div className="flex-1 border-r border-slate-200 flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-800 uppercase font-extrabold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      演者・進行 (楽屋・チューニング)
                    </div>
                  )}
                  {(activeLaneFilter === 'all' || activeLaneFilter === 'stage') && (
                    <div className="flex-1 border-r border-slate-200 flex items-center justify-center gap-1.5 bg-amber-500/10 text-amber-800 uppercase font-extrabold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      舞台上 (照明・転換・仕込み)
                    </div>
                  )}
                  {(activeLaneFilter === 'all' || activeLaneFilter === 'reception') && (
                    <div className="flex-1 flex items-center justify-center gap-1.5 bg-sky-500/10 text-sky-800 uppercase font-extrabold">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                      受付周り (ロビー・クローク)
                    </div>
                  )}
                </div>

                {/* 現在シミュレーション時間表示ライン (縦タイムライン上を横断する赤いライン) */}
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

                {/* イベントカード配置レイヤー */}
                <div className="absolute top-10 left-[70px] right-0 bottom-0">
                  {filteredEvents.map((event) => {
                    const top = getTopPosition(event.start);
                    const height = getHeight(event.start, event.end);
                    const isSelected = selectedEvent?.id === event.id;
                    const isNowActive = simulatedTimeMinutes >= timeToMinutes(event.start) && simulatedTimeMinutes < timeToMinutes(event.end);
                    
                    // 重要度の表示スタイル
                    const isHighImp = event.importance === 'high' && highlightImportance;

                    // ポジショニング (演者 = 左、舞台上 = 真ん中、受付 = 右)
                    let leftClass = 'left-0 right-0'; // all (結合)
                    let widthClass = 'w-full';
                    let bgBorderClass = 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200 text-indigo-900';

                    if (activeLaneFilter === 'all') {
                      if (event.lane === 'performers') {
                        leftClass = 'left-[0%] right-[66.6%]';
                        widthClass = 'w-[33%]';
                        bgBorderClass = `bg-emerald-50 hover:bg-emerald-100/90 border-emerald-200 text-emerald-900 ${isNowActive ? 'ring-2 ring-emerald-500/50' : ''}`;
                      } else if (event.lane === 'stage') {
                        leftClass = 'left-[33.3%] right-[33.3%]';
                        widthClass = 'w-[33%]';
                        bgBorderClass = `bg-amber-50 hover:bg-amber-100/90 border-amber-200 text-amber-900 ${isNowActive ? 'ring-2 ring-amber-500/50' : ''}`;
                      } else if (event.lane === 'reception') {
                        leftClass = 'left-[66.6%] right-0';
                        widthClass = 'w-[33%]';
                        bgBorderClass = `bg-sky-50 hover:bg-sky-100/90 border-sky-200 text-sky-900 ${isNowActive ? 'ring-2 ring-sky-500/50' : ''}`;
                      } else if (event.lane === 'all') {
                        leftClass = 'left-0 right-0';
                        widthClass = 'w-full z-10';
                        bgBorderClass = `bg-violet-100/90 hover:bg-violet-200 border-violet-300 text-violet-955 font-bold border-l-4 border-l-violet-600 ${isNowActive ? 'ring-2 ring-violet-500/50' : ''}`;
                      }
                    } else {
                      // 1レーンのみにフィルタリングされている場合
                      widthClass = 'w-full';
                      if (event.lane === 'performers') bgBorderClass = 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900';
                      if (event.lane === 'stage') bgBorderClass = 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900';
                      if (event.lane === 'reception') bgBorderClass = 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900';
                      if (event.lane === 'all') bgBorderClass = 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-955';
                    }

                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                        }}
                        className={`absolute ${leftClass} ${widthClass} border p-2 transition cursor-pointer select-none group flex flex-col justify-between overflow-hidden shadow-sm ${bgBorderClass} ${
                          isSelected ? 'ring-2 ring-indigo-600 ring-offset-1 z-20 shadow-md' : ''
                        } ${isHighImp ? 'ring-2 ring-rose-500 bg-rose-50 border-rose-300' : ''}`}
                      >
                        <div>
                          {/* 開始時間・終了時間・重要度バッジ */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[9px] font-black opacity-80 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5 shrink-0" />
                              {event.start} - {event.end}
                            </span>
                            
                            {/* アイコンインジケータ */}
                            {event.importance === 'high' && (
                              <span className="bg-rose-500 text-white font-extrabold text-[8px] px-1 rounded-sm shrink-0 scale-90">
                                必須
                              </span>
                            )}
                          </div>

                          {/* タイトル */}
                          <h4 className="font-extrabold text-[11px] leading-snug mt-1 line-clamp-2 tracking-tight">
                            {event.title}
                          </h4>
                        </div>

                        {/* 持ち物/場所等のショートカット情報 */}
                        {height >= 60 && (
                          <div className="mt-1 pt-1 border-t border-black/5 flex items-center gap-2 text-[9px] text-slate-500 font-medium">
                            {event.location && (
                              <span className="truncate flex items-center gap-0.5 max-w-[50%]">
                                <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                                {event.location.split('・')[0]}
                              </span>
                            )}
                            {event.pic && (
                              <span className="truncate flex items-center gap-0.5 max-w-[50%]">
                                <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
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
          )}


          {/* ==================== 2. リスト形式表示 ==================== */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const isSelected = selectedEvent?.id === event.id;
                const isNowActive = simulatedTimeMinutes >= timeToMinutes(event.start) && simulatedTimeMinutes < timeToMinutes(event.end);
                
                // レーンごとのスタイル
                let laneBadge = '';
                if (event.lane === 'performers') laneBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                if (event.lane === 'stage') laneBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                if (event.lane === 'reception') laneBadge = 'bg-sky-50 text-sky-800 border-sky-200';
                if (event.lane === 'all') laneBadge = 'bg-violet-100 text-violet-800 border-violet-300';

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`bg-white border rounded-xl p-4 cursor-pointer transition flex items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-50' : 'border-slate-200'
                    } ${isNowActive && !printMode ? 'ring-2 ring-rose-500/20 bg-rose-50/10' : ''}`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* 時間帯 */}
                      <div className="text-center min-w-[90px] shrink-0">
                        <span className="text-xs font-black font-mono text-slate-900 block bg-slate-100 px-2 py-1 rounded-lg">
                          {event.start} - {event.end}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1">
                          {minutesToTime(timeToMinutes(event.end) - timeToMinutes(event.start))}間
                        </span>
                      </div>

                      {/* 主要中身 */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${laneBadge}`}>
                            {event.lane === 'performers' ? '演者・進行' : 
                             event.lane === 'stage' ? '舞台上' : 
                             event.lane === 'reception' ? '受付周り' : '全員共通'}
                          </span>
                          
                          {event.importance === 'high' && (
                            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-sm shrink-0">
                              高重要
                            </span>
                          )}

                          {event.location && (
                            <span className="text-slate-500 text-[11px] flex items-center gap-0.5 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              {event.location}
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {event.title}
                        </h4>

                        {event.notes && (
                          <p className="text-slate-500 text-xs mt-1 truncate max-w-xl">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {event.pic && (
                        <span className="hidden sm:inline-block bg-slate-50 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                          担当: {event.pic.split('(')[0]}
                        </span>
                      )}
                      
                      {!printMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>


        {/* --- 詳細表示 ＆ 進行チェックリスト --- */}
        <div className={`xl:col-span-4 space-y-6 ${printMode ? 'hidden' : ''}`}>
          
          {/* ==================== A. イベント詳細カード ==================== */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-6">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              選択中の予定詳細
            </h3>

            {selectedEvent ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                
                {/* ヘッダー・レーン */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                    selectedEvent.lane === 'performers' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    selectedEvent.lane === 'stage' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    selectedEvent.lane === 'reception' ? 'bg-sky-100 text-sky-800 border-sky-200' :
                    'bg-violet-100 text-violet-800 border-violet-300'
                  }`}>
                    {selectedEvent.lane === 'performers' ? '演者・楽屋進行' : 
                     selectedEvent.lane === 'stage' ? '舞台上（照明・舞台転換）' : 
                     selectedEvent.lane === 'reception' ? '受付周り（ロビー）' : '全員共通（全体）'}
                  </span>
                  
                  {selectedEvent.importance && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedEvent.importance === 'high' ? 'bg-rose-500 text-white' :
                      selectedEvent.importance === 'medium' ? 'bg-slate-200 text-slate-800' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      重要度: {selectedEvent.importance === 'high' ? '高' : selectedEvent.importance === 'medium' ? '中' : '低'}
                    </span>
                  )}
                </div>

                {/* タイトル & 時間 */}
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    {selectedEvent.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold mt-2">
                    <Clock className="w-4 h-4" />
                    <span>本番当日時間: {selectedEvent.start} 〜 {selectedEvent.end}</span>
                    <span className="text-slate-400 font-medium">({minutesToTime(timeToMinutes(selectedEvent.end) - timeToMinutes(selectedEvent.start))}間)</span>
                  </div>
                </div>

                {/* メタ情報リスト */}
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
                        <span className="font-extrabold text-slate-800 block">指示内容 ＆ 注意事項:</span>
                        <p className="text-slate-600 leading-relaxed font-medium mt-1 whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200">
                          {selectedEvent.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* アクション */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-600 px-3 py-2 rounded-xl hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    この予定を削除
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                <Clock className="w-8 h-8 mx-auto text-slate-300 stroke-1 mb-2" />
                <p className="text-xs font-bold">タイムライン上の予定をクリックすると、詳細がここに表示されます</p>
              </div>
            )}

            {/* ==================== B. 当日進行タスクチェックリスト ==================== */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  当日の役割別チェックリスト
                </h3>
                <span className="text-[10px] font-bold text-slate-500">
                  {checklist.filter(c => c.checked).length} / {checklist.length} 完了
                </span>
              </div>

              {/* 簡単なフィルター */}
              <div className="flex gap-1 mb-3">
                <button 
                  onClick={() => setActiveLaneFilter(activeLaneFilter === 'all' ? 'performers' : 'all')}
                  className={`text-[9px] px-2 py-1 rounded font-extrabold transition ${
                    activeLaneFilter === 'performers' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  演者用
                </button>
                <button 
                  onClick={() => setActiveLaneFilter(activeLaneFilter === 'all' ? 'stage' : 'all')}
                  className={`text-[9px] px-2 py-1 rounded font-extrabold transition ${
                    activeLaneFilter === 'stage' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  舞台用
                </button>
                <button 
                  onClick={() => setActiveLaneFilter(activeLaneFilter === 'all' ? 'reception' : 'all')}
                  className={`text-[9px] px-2 py-1 rounded font-extrabold transition ${
                    activeLaneFilter === 'reception' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  受付用
                </button>
              </div>

              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {checklist
                  .filter(c => activeLaneFilter === 'all' || c.lane === activeLaneFilter)
                  .map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer select-none text-[11px] font-medium transition ${
                        item.checked
                          ? 'bg-slate-100/50 border-slate-200 text-slate-400 line-through'
                          : item.lane === 'performers' ? 'bg-emerald-50/20 border-emerald-200 hover:bg-emerald-50/40 text-slate-800' :
                            item.lane === 'stage' ? 'bg-amber-50/20 border-amber-200 hover:bg-amber-50/40 text-slate-800' :
                            'bg-sky-50/20 border-sky-200 hover:bg-sky-50/40 text-slate-800'
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

    </div>
  );
}
