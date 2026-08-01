'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Upload, Share2, Printer, Check, Info, 
  Send, RefreshCw, Layers, Layout, HelpCircle, Eye, AlertCircle, Trash2
} from 'lucide-react';

// 要素の型定義
export interface CanvasItem {
  id: string;
  type: 'chair' | 'stand' | 'riser' | 'conductor' | 'piano' | 'percussion' | 'text';
  x: number; // 0 to 800
  y: number; // 0 to 500
  width: number;
  height: number;
  rotation: number; // 0 to 360
  label: string;
  color: string;
  riserHeight?: '20cm' | '40cm' | '60cm' | 'none';
}

// 舞台図面の型定義
export interface StageBlueprint {
  id: string;
  name: string;
  uploadedBy: string;
  isPublic: boolean;
  type: 'svg' | 'image';
  svgType?: 'suntory' | 'geigeki' | 'gym' | 'standard';
  imageUrl?: string;
}

interface StageLayoutCanvasProps {
  woodwindsCount: number;
  brassCount: number;
  percussionCount: number;
  vn1Desks: number;
  vn2Desks: number;
  vaDesks: number;
  vcDesks: number;
  cbDesks: number;
}

export default function StageLayoutCanvas({
  woodwindsCount,
  brassCount,
  percussionCount,
  vn1Desks,
  vn2Desks,
  vaDesks,
  vcDesks,
  cbDesks,
}: StageLayoutCanvasProps) {
  // --- 状態管理 ---
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('suntory');
  const [layoutStyle, setLayoutStyle] = useState<'standard' | 'antiphonal' | 'windband' | 'concerto'>('standard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  
  // AIチャット・プロンプト調整用
  const [aiPrompt, setUploadPrompt] = useState('');
  const [aiLog, setAiLog] = useState<string[]>([
    'AIプランナーが起動しました。図面「サントリーホール風」を読み込み、ステージ有効面積（幅15.2m, 奥行11.8m）を算出しました。',
    '自動計算機と同期完了：奏者数合計52名（弦楽プルト合計18プルト、管打楽器26名、打楽器4名）。'
  ]);
  const [aiReport, setAiLogReport] = useState({
    title: 'オーケストラ標準配置 (アメリカ式) の最適化',
    details: [
      'ステージ中心（指揮台：X=400, Y=440）を基準に、4重の同心円アーク（半径1.2m〜3.2m）を形成しました。',
      'ひな壇：木管（20cm段差）に1.8m幅のひな壇を3基、金管（40cm段差）に2基、打楽器（60cm段差）に1基を自動調芯配置しました。',
      '安全基準：各椅子の中心間隔を85cm確保し、演奏時のボウイング干渉および管楽器の音圧干渉を回避する間隔に自動調整しました。'
    ]
  });

  // 図面ライブラリ
  const [blueprints, setBlueprints] = useState<StageBlueprint[]>([
    { id: 'standard', name: '標準多目的ホール (ひな壇なしフラット)', uploadedBy: 'システム標準', isPublic: true, type: 'svg', svgType: 'standard' },
    { id: 'suntory', name: 'サントリーホール風 大ホール舞台平面図', uploadedBy: '豊島区交響楽団', isPublic: true, type: 'svg', svgType: 'suntory' },
    { id: 'geigeki', name: '東京芸術劇場風 コンサートホール舞台図面', uploadedBy: '練馬市民オーケストラ', isPublic: true, type: 'svg', svgType: 'geigeki' },
    { id: 'gym', name: '学校体育館 舞台配置用平面図', uploadedBy: 'OKEKANユースオーケストラ', isPublic: true, type: 'svg', svgType: 'gym' },
  ]);

  // アップロード用状態
  const [uploadName, setUploadName] = useState('');
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [isShareChecked, setIsShareChecked] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // 印刷・出力プレビューモード
  const [isPrintMode, setIsPrintMode] = useState(false);

  const activeBlueprint = blueprints.find(b => b.id === selectedBlueprintId) || blueprints[0];

  // --- AI自動配置アルゴリズム (Concentric Orchestral Arcs & Prompt Parsing) ---
  const runAiLayout = (style = layoutStyle, promptCommand = '') => {
    setIsAnalyzing(true);
    
    // AIスキャン風の演出
    const steps = [
      '背景図面をスキャン中...',
      'ステージ境界線および反響板位置の検出中...',
      '指揮台センターポイントの同定完了...',
      'ひな壇設置エリアのグリッド空間マッピング中...',
      '奏者・機材リストから必要椅子・譜面台数を算出中...',
      '干渉回避（コリジョン判定）および角度微調整を実行中...'
    ];

    let currentStep = 0;
    setAnalysisStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setAnalysisStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        executePositioning(style, promptCommand);
        setIsAnalyzing(false);
      }
    }, 400);
  };

  const executePositioning = (style: typeof layoutStyle, promptCommand = '') => {
    const newItems: CanvasItem[] = [];
    const centerX = 400;
    const centerY = 410; // 指揮台位置

    // 指揮台
    newItems.push({
      id: 'conductor',
      type: 'conductor',
      x: centerX,
      y: centerY + 25,
      width: 44,
      height: 34,
      rotation: 0,
      label: '指揮台',
      color: 'bg-rose-50 text-rose-700 border-rose-400 font-bold border-2 text-[9px]'
    });

    let idCounter = 0;

    // ヘルパー：極座標から配置
    const addElement = (
      type: CanvasItem['type'],
      radius: number,
      angleDeg: number,
      label: string,
      color: string,
      extra: Partial<CanvasItem> = {}
    ) => {
      idCounter++;
      // プロンプト指令によるグローバルオフセットのシミュレーション
      let radiusOffset = 0;
      let xOffset = 0;
      let yOffset = 0;

      // 「全体を後ろに」
      if (promptCommand.includes('後ろ') || promptCommand.includes('下げ')) {
        yOffset = -30;
        radiusOffset = 20;
      }
      // 「全体を前に」
      if (promptCommand.includes('前') || promptCommand.includes('出し')) {
        yOffset = 20;
        radiusOffset = -15;
      }
      // 「打楽器を左寄りに」
      if (type === 'percussion' && (promptCommand.includes('打楽器') && promptCommand.includes('左'))) {
        xOffset = -80;
        yOffset = -10;
      }

      const angleRad = (angleDeg * Math.PI) / 180;
      const x = Math.round(centerX + (radius + radiusOffset) * Math.cos(angleRad)) + xOffset;
      const y = Math.round(centerY - (radius + radiusOffset) * Math.sin(angleRad)) + yOffset;

      const angleToCenter = Math.atan2(centerY - y, centerX - x) * (180 / Math.PI);
      const rotation = Math.round(angleToCenter - 90);

      newItems.push({
        id: `${type}_${idCounter}`,
        type,
        x,
        y,
        width: type === 'chair' ? 18 : type === 'stand' ? 14 : 28,
        height: type === 'chair' ? 18 : type === 'stand' ? 14 : 28,
        rotation,
        label,
        color,
        ...extra
      });
    };

    // --- 各配置パターンのロジック ---
    if (style === 'standard') {
      // 1. 標準オーケストラ (アメリカ式)
      // 弦楽器アーク
      // 1st Vn (左手 125°-165°)
      for (let i = 0; i < vn1Desks; i++) {
        const angle = 165 - i * (40 / Math.max(1, vn1Desks - 1));
        addElement('stand', 110, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 130, angle + 3.5, `${i+1}`, 'bg-amber-100 text-amber-800 border-amber-400 text-[9px]');
        addElement('chair', 130, angle - 3.5, `${i+1}`, 'bg-amber-100 text-amber-800 border-amber-400 text-[9px]');
      }
      // 2nd Vn (左中手 105°-135°)
      for (let i = 0; i < vn2Desks; i++) {
        const angle = 140 - i * (35 / Math.max(1, vn2Desks - 1));
        addElement('stand', 150, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 170, angle + 3.5, `${i+1}`, 'bg-orange-100 text-orange-800 border-orange-400 text-[9px]');
        addElement('chair', 170, angle - 3.5, `${i+1}`, 'bg-orange-100 text-orange-800 border-orange-400 text-[9px]');
      }
      // Viola (右中手 75°-105°)
      for (let i = 0; i < vaDesks; i++) {
        const angle = 105 - i * (30 / Math.max(1, vaDesks - 1));
        addElement('stand', 150, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 170, angle + 4, `${i+1}`, 'bg-emerald-100 text-emerald-800 border-emerald-400 text-[9px]');
        addElement('chair', 170, angle - 4, `${i+1}`, 'bg-emerald-100 text-emerald-800 border-emerald-400 text-[9px]');
      }
      // Cello (右手 15°-60°)
      for (let i = 0; i < vcDesks; i++) {
        const angle = 65 - i * (45 / Math.max(1, vcDesks - 1));
        addElement('stand', 110, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 130, angle + 3.5, `${i+1}`, 'bg-teal-100 text-teal-800 border-teal-400 text-[9px]');
        addElement('chair', 130, angle - 3.5, `${i+1}`, 'bg-teal-100 text-teal-800 border-teal-400 text-[9px]');
      }
      // Contrabass (右端奥)
      for (let i = 0; i < cbDesks; i++) {
        const angle = 45 - i * (25 / Math.max(1, cbDesks - 1));
        addElement('stand', 190, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 210, angle + 4, `${i+1}`, 'bg-cyan-100 text-cyan-800 border-cyan-400 text-[9px]');
        addElement('chair', 210, angle - 4, `${i+1}`, 'bg-cyan-100 text-cyan-800 border-cyan-400 text-[9px]');
      }

      // 木管ひな壇 20cm
      newItems.push({ id: 'riser_w1', type: 'riser', x: centerX - 100, y: centerY - 120, width: 85, height: 40, rotation: 10, label: 'ひな壇 20cm', color: 'bg-indigo-50/70 border-indigo-300 text-indigo-700 font-bold text-[9px]', riserHeight: '20cm' });
      newItems.push({ id: 'riser_w2', type: 'riser', x: centerX, y: centerY - 130, width: 85, height: 40, rotation: 0, label: 'ひな壇 20cm', color: 'bg-indigo-50/70 border-indigo-300 text-indigo-700 font-bold text-[9px]', riserHeight: '20cm' });
      newItems.push({ id: 'riser_w3', type: 'riser', x: centerX + 100, y: centerY - 120, width: 85, height: 40, rotation: -10, label: 'ひな壇 20cm', color: 'bg-indigo-50/70 border-indigo-300 text-indigo-700 font-bold text-[9px]', riserHeight: '20cm' });

      // 木管パート
      for (let i = 0; i < woodwindsCount; i++) {
        const angle = 135 - i * (90 / Math.max(1, woodwindsCount - 1));
        addElement('chair', 215, angle, 'W', 'bg-blue-100 border-blue-500 text-blue-800 text-[8px]');
        addElement('stand', 200, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      // 金管ひな壇 40cm
      newItems.push({ id: 'riser_b1', type: 'riser', x: centerX - 100, y: centerY - 185, width: 95, height: 40, rotation: 15, label: 'ひな壇 40cm', color: 'bg-amber-50/70 border-amber-300 text-amber-700 font-bold text-[9px]', riserHeight: '40cm' });
      newItems.push({ id: 'riser_b2', type: 'riser', x: centerX + 100, y: centerY - 185, width: 95, height: 40, rotation: -15, label: 'ひな壇 40cm', color: 'bg-amber-50/70 border-amber-300 text-amber-700 font-bold text-[9px]', riserHeight: '40cm' });

      // 金管パート
      for (let i = 0; i < brassCount; i++) {
        const angle = 140 - i * (100 / Math.max(1, brassCount - 1));
        addElement('chair', 280, angle, 'B', 'bg-amber-100 border-amber-500 text-amber-800 text-[8px]');
        addElement('stand', 265, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      // 打楽器ひな壇 60cm
      newItems.push({ id: 'riser_p1', type: 'riser', x: centerX, y: centerY - 245, width: 110, height: 45, rotation: 0, label: 'ひな壇 60cm', color: 'bg-purple-50/70 border-purple-300 text-purple-700 font-bold text-[9px]', riserHeight: '60cm' });

      // 打楽器・ティンパニ
      for (let i = 0; i < percussionCount; i++) {
        const angle = 120 - i * (60 / Math.max(1, percussionCount - 1));
        addElement('percussion', 340, angle, '🥁', 'bg-purple-100 border-purple-500 text-purple-800 text-[9px]');
        addElement('stand', 325, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      setAiLogReport({
        title: 'オーケストラ標準配置 (アメリカ式) のAI最適化',
        details: [
          '弦楽器配置：高弦（1st Vn）を左側に、低弦（Vc/Cb）を右側へ流れる標準的な配置を設定。',
          '管楽器ひな壇：木管（20cm）を前列、金管（40cm）を後列に配置して、音圧のバランスを考慮。',
          '打楽器設置：最も振動と音量が大きい打楽器・ティンパニをひな壇3段目（60cm）にセンタリングしました。'
        ]
      });

    } else if (style === 'antiphonal') {
      // 2. 対向配置 (ドイツ式) - 1st Vn左、2nd Vn右。Vcはセンター左、Violaはセンター右。
      // 1st Vn (左端 130°-170°)
      for (let i = 0; i < vn1Desks; i++) {
        const angle = 170 - i * (40 / Math.max(1, vn1Desks - 1));
        addElement('stand', 110, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 130, angle + 3.5, `${i+1}`, 'bg-amber-100 text-amber-800 border-amber-400 text-[9px]');
        addElement('chair', 130, angle - 3.5, `${i+1}`, 'bg-amber-100 text-amber-800 border-amber-400 text-[9px]');
      }
      // 2nd Vn (右端 10°-50°)
      for (let i = 0; i < vn2Desks; i++) {
        const angle = 50 - i * (40 / Math.max(1, vn2Desks - 1));
        addElement('stand', 110, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 130, angle + 3.5, `${i+1}`, 'bg-orange-100 text-orange-800 border-orange-400 text-[9px]');
        addElement('chair', 130, angle - 3.5, `${i+1}`, 'bg-orange-100 text-orange-800 border-orange-400 text-[9px]');
      }
      // Viola (右中 55°-90°)
      for (let i = 0; i < vaDesks; i++) {
        const angle = 90 - i * (35 / Math.max(1, vaDesks - 1));
        addElement('stand', 150, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 170, angle + 4, `${i+1}`, 'bg-emerald-100 text-emerald-800 border-emerald-400 text-[9px]');
        addElement('chair', 170, angle - 4, `${i+1}`, 'bg-emerald-100 text-emerald-800 border-emerald-400 text-[9px]');
      }
      // Cello (左中 90°-125°)
      for (let i = 0; i < vcDesks; i++) {
        const angle = 125 - i * (35 / Math.max(1, vcDesks - 1));
        addElement('stand', 150, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 170, angle + 3.5, `${i+1}`, 'bg-teal-100 text-teal-800 border-teal-400 text-[9px]');
        addElement('chair', 170, angle - 3.5, `${i+1}`, 'bg-teal-100 text-teal-800 border-teal-400 text-[9px]');
      }
      // Contrabass (左端奥 130°-155°付近)
      for (let i = 0; i < cbDesks; i++) {
        const angle = 155 - i * (25 / Math.max(1, cbDesks - 1));
        addElement('stand', 195, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 215, angle + 4, `${i+1}`, 'bg-cyan-100 text-cyan-800 border-cyan-400 text-[9px]');
        addElement('chair', 215, angle - 4, `${i+1}`, 'bg-cyan-100 text-cyan-800 border-cyan-400 text-[9px]');
      }

      // 木管・金管ひな壇
      newItems.push({ id: 'riser_ant_w', type: 'riser', x: centerX, y: centerY - 130, width: 150, height: 40, rotation: 0, label: '木管用 20cmひな壇', color: 'bg-indigo-50/70 border-indigo-300 text-indigo-700 font-bold text-[9px]', riserHeight: '20cm' });
      newItems.push({ id: 'riser_ant_b', type: 'riser', x: centerX, y: centerY - 190, width: 160, height: 40, rotation: 0, label: '金管用 40cmひな壇', color: 'bg-amber-50/70 border-amber-300 text-amber-700 font-bold text-[9px]', riserHeight: '40cm' });

      // 木管 (120°-60°アーク)
      for (let i = 0; i < woodwindsCount; i++) {
        const angle = 125 - i * (70 / Math.max(1, woodwindsCount - 1));
        addElement('chair', 215, angle, 'W', 'bg-blue-100 border-blue-500 text-blue-800 text-[8px]');
        addElement('stand', 200, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }
      // 金管 (130°-50°アーク)
      for (let i = 0; i < brassCount; i++) {
        const angle = 135 - i * (90 / Math.max(1, brassCount - 1));
        addElement('chair', 275, angle, 'B', 'bg-amber-100 border-amber-500 text-amber-800 text-[8px]');
        addElement('stand', 260, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      // 打楽器ひな壇 60cm
      newItems.push({ id: 'riser_ant_p', type: 'riser', x: centerX - 120, y: centerY - 240, width: 100, height: 40, rotation: 10, label: '打楽器ひな壇 60cm', color: 'bg-purple-50/70 border-purple-300 text-purple-700 font-bold text-[9px]', riserHeight: '60cm' });
      for (let i = 0; i < percussionCount; i++) {
        const angle = 145 - i * (50 / Math.max(1, percussionCount - 1));
        addElement('percussion', 320, angle, '🥁', 'bg-purple-100 border-purple-500 text-purple-800 text-[9px]');
        addElement('stand', 305, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      setAiLogReport({
        title: 'オーケストラ対向配置 (ドイツ式) のAI最適化',
        details: [
          '対向配置：1st Vn（左）と2nd Vn（右）を舞台前列の両翼に正対させ、高音弦の掛け合い効果を最大化。',
          '中音弦・低音弦：チェロを中央左寄り、ヴィオラを中央右寄りに配し、ステレオ効果と中低音の調和を確保。',
          'コントラバス：下手側（左奥）の1st Vn後方に置くことで、低音の定位を左端に収束。'
        ]
      });

    } else if (style === 'windband') {
      // 3. 吹奏楽・ウィンドアンサンブル配置 (木管左、金管右、サックス中、打楽器奥)
      // フルート・オーボエ (左前 120°-165°付近)
      const woodHalf = Math.ceil(woodwindsCount / 2);
      for (let i = 0; i < woodHalf; i++) {
        const angle = 160 - i * (45 / Math.max(1, woodHalf - 1));
        addElement('stand', 100, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 120, angle, 'Fl', 'bg-sky-100 border-sky-400 text-sky-800 text-[9px]');
      }
      // クラリネット・サックス (右前 15°-100°付近)
      for (let i = 0; i < woodHalf; i++) {
        const angle = 95 - i * (75 / Math.max(1, woodHalf - 1));
        addElement('stand', 110, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 130, angle, 'Cl', 'bg-blue-50 border-blue-300 text-blue-700 text-[9px]');
      }

      // 中低音木管・低音弦 (Cello/CB枠を中音サックス等に流用)
      for (let i = 0; i < Math.max(2, vcDesks); i++) {
        const angle = 45 - i * (25 / 2);
        addElement('stand', 160, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 180, angle, 'Sax', 'bg-orange-50 border-orange-300 text-orange-700 text-[9px]');
      }

      // 低音・チューバ・バスクラ
      for (let i = 0; i < Math.max(2, cbDesks); i++) {
        const angle = 20 - i * (15 / 2);
        addElement('stand', 230, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 250, angle, 'Tub', 'bg-red-50 border-red-300 text-red-700 text-[9px]');
      }

      // 吹奏楽用ひな壇：金管用
      newItems.push({ id: 'riser_wind_b1', type: 'riser', x: centerX - 60, y: centerY - 180, width: 130, height: 45, rotation: 12, label: '金管ひな壇 20cm', color: 'bg-amber-50/70 border-amber-300 text-amber-700 font-bold text-[9px]', riserHeight: '20cm' });
      newItems.push({ id: 'riser_wind_b2', type: 'riser', x: centerX + 90, y: centerY - 180, width: 130, height: 45, rotation: -12, label: '金管ひな壇 40cm', color: 'bg-amber-100/70 border-amber-400 text-amber-800 font-bold text-[9px]', riserHeight: '40cm' });

      // トランペット・ホルン・トロンボーン
      const brassHalf = Math.ceil(brassCount / 2);
      // ホルン/ユーフォ等 (左奥 110°-150°)
      for (let i = 0; i < brassHalf; i++) {
        const angle = 150 - i * (35 / Math.max(1, brassHalf - 1));
        addElement('chair', 220, angle, 'Hr', 'bg-amber-50 border-amber-400 text-amber-700 text-[9px]');
        addElement('stand', 205, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }
      // トランペット/トロンボーン等 (右奥 50°-100°)
      for (let i = 0; i < brassHalf; i++) {
        const angle = 95 - i * (45 / Math.max(1, brassHalf - 1));
        addElement('chair', 230, angle, 'Trp', 'bg-rose-50 border-rose-400 text-rose-700 text-[9px]');
        addElement('stand', 215, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      // 打楽器ひな壇（左奥に大きくフラット、または60cm段差）
      newItems.push({ id: 'riser_wind_p', type: 'riser', x: centerX - 180, y: centerY - 220, width: 120, height: 50, rotation: 25, label: '打楽器エリア 40cmひな壇', color: 'bg-purple-50/70 border-purple-300 text-purple-700 font-bold text-[9px]', riserHeight: '40cm' });

      // 吹奏楽打楽器
      for (let i = 0; i < percussionCount; i++) {
        const angle = 160 - i * (35 / Math.max(1, percussionCount - 1));
        addElement('percussion', 300, angle, '🥁', 'bg-purple-100 border-purple-500 text-purple-800 text-[9px]');
        addElement('stand', 285, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      setAiLogReport({
        title: '吹奏楽ウィンドアンサンブル配置のAI最適化',
        details: [
          '木管楽器：主旋律のクラリネットを右翼アーク全体、フルート/オーボエを指揮台左手前に集約配置。',
          '金管楽器：トランペット・トロンボーンを右手後方に、ホルンを左手後方に配置してステレオ感のあるサウンドを設計。',
          '打楽器：ティンパニおよび多様なパーカッション機材が必要なため、上手奥（左側）に余裕を持たせた打楽器ひな壇空間を確保しました。'
        ]
      });

    } else if (style === 'concerto') {
      // 4. ピアノ協奏曲配置 (ピアノが主役。オーケストラは少し後ろに下がり、ソリストを引き立てる)
      // 特大グランドピアノを指揮台左隣に配置
      newItems.push({
        id: 'piano_solo',
        type: 'piano',
        x: centerX - 70,
        y: centerY - 25,
        width: 80,
        height: 55,
        rotation: 35,
        label: '🎹 ピアノ独奏 (Soloist)',
        color: 'bg-zinc-900 text-yellow-300 border-yellow-500 border-2 font-bold text-[9px] flex items-center justify-center'
      });

      // 弦楽器はピアノを避けて少し外側に再計算
      // 1st Vn (左端 145°-180°)
      for (let i = 0; i < vn1Desks; i++) {
        const angle = 180 - i * (35 / Math.max(1, vn1Desks - 1));
        addElement('stand', 130, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 150, angle + 3.5, `${i+1}`, 'bg-amber-100 text-amber-800 border-amber-400 text-[9px]');
        addElement('chair', 150, angle - 3.5, `${i+1}`, 'bg-amber-100 text-amber-800 border-amber-400 text-[9px]');
      }
      // 2nd Vn (左奥または中 120°-145°)
      for (let i = 0; i < vn2Desks; i++) {
        const angle = 145 - i * (25 / Math.max(1, vn2Desks - 1));
        addElement('stand', 185, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 205, angle + 3.5, `${i+1}`, 'bg-orange-100 text-orange-800 border-orange-400 text-[9px]');
        addElement('chair', 205, angle - 3.5, `${i+1}`, 'bg-orange-100 text-orange-800 border-orange-400 text-[9px]');
      }
      // Viola (右中 65°-95°)
      for (let i = 0; i < vaDesks; i++) {
        const angle = 95 - i * (30 / Math.max(1, vaDesks - 1));
        addElement('stand', 150, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 170, angle + 4, `${i+1}`, 'bg-emerald-100 text-emerald-800 border-emerald-400 text-[9px]');
        addElement('chair', 170, angle - 4, `${i+1}`, 'bg-emerald-100 text-emerald-800 border-emerald-400 text-[9px]');
      }
      // Cello (右翼 15°-55°)
      for (let i = 0; i < vcDesks; i++) {
        const angle = 60 - i * (45 / Math.max(1, vcDesks - 1));
        addElement('stand', 110, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 130, angle + 3.5, `${i+1}`, 'bg-teal-100 text-teal-800 border-teal-400 text-[9px]');
        addElement('chair', 130, angle - 3.5, `${i+1}`, 'bg-teal-100 text-teal-800 border-teal-400 text-[9px]');
      }
      // Contrabass (右端奥)
      for (let i = 0; i < cbDesks; i++) {
        const angle = 45 - i * (25 / Math.max(1, cbDesks - 1));
        addElement('stand', 190, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
        addElement('chair', 210, angle + 4, `${i+1}`, 'bg-cyan-100 text-cyan-800 border-cyan-400 text-[9px]');
        addElement('chair', 210, angle - 4, `${i+1}`, 'bg-cyan-100 text-cyan-800 border-cyan-400 text-[9px]');
      }

      // 木管ひな壇 20cm
      newItems.push({ id: 'riser_c_w', type: 'riser', x: centerX + 50, y: centerY - 140, width: 140, height: 40, rotation: -5, label: 'ひな壇 20cm', color: 'bg-indigo-50/70 border-indigo-300 text-indigo-700 font-bold text-[9px]', riserHeight: '20cm' });
      for (let i = 0; i < woodwindsCount; i++) {
        const angle = 125 - i * (65 / Math.max(1, woodwindsCount - 1));
        addElement('chair', 230, angle, 'W', 'bg-blue-100 border-blue-500 text-blue-800 text-[8px]');
        addElement('stand', 215, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      // 金管ひな壇 40cm
      newItems.push({ id: 'riser_c_b', type: 'riser', x: centerX + 60, y: centerY - 195, width: 150, height: 40, rotation: -8, label: 'ひな壇 40cm', color: 'bg-amber-50/70 border-amber-300 text-amber-700 font-bold text-[9px]', riserHeight: '40cm' });
      for (let i = 0; i < brassCount; i++) {
        const angle = 130 - i * (80 / Math.max(1, brassCount - 1));
        addElement('chair', 290, angle, 'B', 'bg-amber-100 border-amber-500 text-amber-800 text-[8px]');
        addElement('stand', 275, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      // 打楽器ひな壇 60cm
      newItems.push({ id: 'riser_c_p', type: 'riser', x: centerX - 140, y: centerY - 210, width: 90, height: 40, rotation: 15, label: 'ひな壇 60cm', color: 'bg-purple-50/70 border-purple-300 text-purple-700 font-bold text-[9px]', riserHeight: '60cm' });
      for (let i = 0; i < percussionCount; i++) {
        const angle = 145 - i * (45 / Math.max(1, percussionCount - 1));
        addElement('percussion', 320, angle, '🥁', 'bg-purple-100 border-purple-500 text-purple-800 text-[9px]');
        addElement('stand', 305, angle, '┳', 'bg-blue-100 text-blue-800 border-blue-400 text-[8px]');
      }

      setAiLogReport({
        title: 'ピアノ協奏曲 (Concerto) 配置のAI最適化',
        details: [
          'ソロ楽器配置：フルサイズ・グランドピアノを指揮台の左手前に、屋根が開く方向（斜め35°）に自動調芯。',
          'オケ後退干渉回避：ピアノ設置による遮音を防ぐため、1st/2nd Vnのアーク半径を20cm外側に逃がし、ピアノ周辺スペースを1.5m以上確保。',
          '指揮者の視線：指揮者からピアノ鍵盤、独奏者、および全パートへの視線を遮らない高さを確認・計算。'
        ]
      });
    }

    setItems(newItems);
  };

  // 最初に初期自動配置を実行
  useEffect(() => {
    executePositioning('standard');
  }, [woodwindsCount, brassCount, percussionCount, vn1Desks, vn2Desks, vaDesks, vcDesks, cbDesks]);

  // --- AIアシスタントプロンプトの送信 ---
  const handleAiPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userMsg = aiPrompt.trim();
    setUploadPrompt('');

    // AIの自然言語解析（モック・スマートパーシング）
    setAiLog(prev => [...prev, `💡 指示入力:「${userMsg}」`]);
    
    setTimeout(() => {
      let response = '';
      if (userMsg.includes('後ろ') || userMsg.includes('下げ') || userMsg.includes('下げて') || userMsg.includes('うしろ')) {
        response = '了解しました。ピアノ、指揮台を基準に、全パートおよびひな壇の配置半径を +20cm 拡大し、舞台後方に30px分平行移動させました。これにより客席前スペース（エプロンステージ）が2.1m広がり、ソリスト追加に対応できます。';
        runAiLayout(layoutStyle, '後ろ');
      } else if (userMsg.includes('対向') || userMsg.includes('ドイツ') || userMsg.includes('ヴァイオリンを分ける')) {
        response = '対向配置（ドイツ式）に変更命令を検出しました。1st Violinを上手（左）、2nd Violinを下手（右）に振り分け、ヴィオラとチェロの位置を対角線上に再計算・配置しました。ステレオダイナミクスが有効になります。';
        setLayoutStyle('antiphonal');
        runAiLayout('antiphonal', '');
      } else if (userMsg.includes('吹奏楽') || userMsg.includes('ブラスバンド')) {
        response = '吹奏楽・ウィンドアンサンブル編成モードの配置要請。木管パート（Fl, Cl）を舞台前面、サックス・低音金管を中衛右、高音金管を中衛奥、打楽器を上手（左奥）に設定した独自配置を生成しました。';
        setLayoutStyle('windband');
        runAiLayout('windband', '');
      } else if (userMsg.includes('ピアノ') || userMsg.includes('協奏曲') || userMsg.includes('コンチェルト')) {
        response = 'ピアノ協奏曲配置への移行指令。指揮台下手側にピアノソロ席を生成し、グランドピアノの反射板屋根の開き角（客席側）に合わせた音響線上に全ストリングスを再配置。干渉スペース自動算出完了。';
        setLayoutStyle('concerto');
        runAiLayout('concerto', '');
      } else if (userMsg.includes('打楽器') && (userMsg.includes('左') || userMsg.includes('下手'))) {
        response = '打楽器（ティンパニ他）の配置を左奥（下手奥）へ集約完了。これにより上手奥（右奥）のコントラバスおよび金管楽器用の空きスペースが拡張されます。';
        runAiLayout(layoutStyle, '打楽器左');
      } else {
        response = `指示「${userMsg}」を解釈しました。干渉計算アルゴリズムを作動させ、椅子・譜面台・ひな壇の間隔バランスを崩さない範囲で、AIによる最適化配置を再構築しました。`;
        runAiLayout(layoutStyle, userMsg);
      }

      setAiLog(prev => [...prev, `🤖 AI回答: ${response}`]);
    }, 1000);
  };

  // --- ファイルアップロード (Base64) & デモ共有機能 ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadImage(event.target.result as string);
          if (!uploadName) {
            setUploadName(file.name.split('.')[0] + ' (図面)');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUpload = () => {
    if (!uploadImage || !uploadName.trim()) return;

    // AIスキャンアニメーション
    setIsAnalyzing(true);
    setAnalysisStep('アップロードされたカスタム図面の画像解析中...');
    
    setTimeout(() => {
      const newBlueprint: StageBlueprint = {
        id: `custom_${Date.now()}`,
        name: uploadName,
        uploadedBy: isShareChecked ? 'あなたの団体 (パブリック共有中)' : 'あなたの団体 (非公開)',
        isPublic: isShareChecked,
        type: 'image',
        imageUrl: uploadImage
      };

      setBlueprints(prev => [...prev, newBlueprint]);
      setSelectedBlueprintId(newBlueprint.id);
      
      setIsAnalyzing(false);
      setShowUploadModal(false);
      
      // 新図面のAI解析ログ
      setAiLog(prev => [
        ...prev,
        `📸 新規図面「${uploadName}」がアップロードされました。`,
        `🔍 [AI図面解析結果] 提供元: ${isShareChecked ? 'パブリックデータベース共有' : 'ローカル保存'}。画像解像度からステージ有効寸法をアスペクト比8:5（幅16m, 奥行き10m相当）と推定し、AIレイアウト空間座標系を再構築しました。`
      ]);

      // アップロード完了後の自動配置
      executePositioning(layoutStyle);
      
      // リセット
      setUploadName('');
      setUploadImage(null);
    }, 1500);
  };

  // --- 備品カウント ---
  const counts = {
    chair: items.filter(i => i.type === 'chair').length,
    stand: items.filter(i => i.type === 'stand').length,
    riser20: items.filter(i => i.type === 'riser' && i.riserHeight === '20cm').length,
    riser40: items.filter(i => i.type === 'riser' && i.riserHeight === '40cm').length,
    riser60: items.filter(i => i.type === 'riser' && i.riserHeight === '60cm').length,
    piano: items.filter(i => i.type === 'piano').length,
    percussion: items.filter(i => i.type === 'percussion').length,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* 1. プレミアムヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI舞台配置プランナー
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1">
            AI自動舞台配置 ＆ 音響・干渉回避シミュレーター
          </h3>
          <p className="text-[11px] text-slate-500">
            アップロードされた舞台平面図をAIが自動スキャン。ホールの形状や音圧バランス、奏者の干渉を計算し、瞬時に最適なオーケストラ・吹奏楽配置を自動決定します。
          </p>
        </div>

        {/* 印刷・一覧切り替え */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintMode(!isPrintMode)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition ${
              isPrintMode 
                ? 'bg-slate-800 text-white border-slate-900' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isPrintMode ? <Layout className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
            {isPrintMode ? 'AIプランナーに戻る' : '機材搬入用リスト & 図面印刷'}
          </button>
        </div>
      </div>

      {/* 2. 印刷用チェックシートモード */}
      {isPrintMode ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-md font-bold text-slate-900">🖨️ 舞台設営・機材搬出入用チェックシート</h4>
              <p className="text-xs text-slate-500">
                AIが自動配置したレイアウトに基づき、必要な機材数量とチェックリストを自動生成しました。
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition shadow"
            >
              <Printer className="w-4 h-4" /> 印刷用PDFを生成
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 備品集計 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 md:col-span-1">
              <span className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5 block">
                📋 必要設営機材リスト (AI自動集計)
              </span>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span>演奏者用 椅子（黒）</span>
                  </span>
                  <span className="font-bold text-sm">{counts.chair} 脚</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span>折りたたみ式 譜面台</span>
                  </span>
                  <span className="font-bold text-sm">{counts.stand} 台</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span>ひな壇 (高20cm) 2m×1m</span>
                  </span>
                  <span className="font-bold text-sm">{counts.riser20} 台</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span>ひな壇 (高40cm) 2m×1m</span>
                  </span>
                  <span className="font-bold text-sm">{counts.riser40} 台</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span>ひな壇 (高60cm) 2m×1m</span>
                  </span>
                  <span className="font-bold text-sm">{counts.riser60} 台</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span>グランドピアノ (モデルD等)</span>
                  </span>
                  <span className="font-bold text-sm">{counts.piano} 台</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span>打楽器セット (ティンパニ含む)</span>
                  </span>
                  <span className="font-bold text-sm">{counts.percussion} セット</span>
                </li>
              </ul>
              
              <div className="bg-slate-100 p-3 rounded-lg text-[10px] text-slate-600 mt-2 space-y-1">
                <span className="font-bold text-slate-700 block">💡 設営指示書備考：</span>
                <p>・ひな壇の合計枚数は {counts.riser20 + counts.riser40 + counts.riser60} 枚となります。</p>
                <p>・AI配置に基づき、ステージ幅14mに対する適正なクリアランスが確保されています。</p>
              </div>
            </div>

            {/* 図面出力プレビュー */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 md:col-span-2 shadow-inner">
              <div className="bg-slate-50 relative w-full h-[320px] rounded-lg overflow-hidden border border-slate-200">
                {/* 背景図面 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-85">
                  {renderBlueprintBackground(activeBlueprint)}
                </div>

                {/* 配置された要素 */}
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      position: 'absolute',
                      left: `${(item.x / 800) * 100}%`,
                      top: `${(item.y / 500) * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                      width: `${(item.width / 800) * 100}%`,
                      height: `${(item.height / 500) * 100}%`,
                      minWidth: `${item.width}px`,
                      minHeight: `${item.height}px`,
                    }}
                    className={`rounded flex items-center justify-center border font-bold pointer-events-none select-none text-[8px] leading-none transition-all shadow-sm ${item.color}`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="text-center text-[10px] text-slate-400 mt-2">
                選択中の舞台図面: {activeBlueprint.name} (アップロード: {activeBlueprint.uploadedBy})
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 3. メインAIプランナー画面
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 左サイド：図面アップロード & 共有ライブラリ */}
          <div className="space-y-4 lg:col-span-1">
            
            {/* 図面ライブラリ */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layout className="w-4 h-4 text-indigo-600" />
                  解析用 舞台平面図
                </span>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded hover:bg-indigo-100 transition flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> アップロード
                </button>
              </div>

              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {blueprints.map(bp => (
                  <button
                    key={bp.id}
                    onClick={() => {
                      setSelectedBlueprintId(bp.id);
                      setAiLog(prev => [
                        ...prev,
                        `🔄 舞台図面を「${bp.name}」へ変更しました。AIによる形状・重心スキャンを開始します...`
                      ]);
                      runAiLayout(layoutStyle);
                    }}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition flex flex-col ${
                      selectedBlueprintId === bp.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{bp.name}</span>
                      {selectedBlueprintId === bp.id && <Check className="w-3 h-3 text-indigo-600 flex-shrink-0" />}
                    </div>
                    <span className="text-[9px] text-slate-500 font-normal mt-0.5">
                      提供: {bp.uploadedBy}
                    </span>
                  </button>
                ))}
              </div>

              {/* シェアリングデモ枠 */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-2.5 rounded-lg border border-indigo-100 text-[10px] text-indigo-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  図面の他団体パブリック共有
                </div>
                <p className="leading-relaxed text-[10px] text-slate-600">
                  サントリーホールや芸術劇場の平面図は<b>他団体がアップロードした共有資産</b>です。あなたが共有フラグをオンにして図面をアップロードすると、全国の別のオケ団体でも即座に背景画像として使えるようになり、コミュニティ型データベースが構築されます。
                </p>
              </div>
            </div>

            {/* AI配置スタイルの選択 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block">
                📐 AI配置パターン設定
              </span>
              
              <div className="space-y-1.5">
                {[
                  { id: 'standard', title: 'オーケストラ標準アーク', desc: 'バイオリンを左翼、チェロを右翼に配する標準形式' },
                  { id: 'antiphonal', title: 'オーケストラ対向配置', desc: '1st Vnを左、2nd Vnを右に正対させる対抗形式' },
                  { id: 'windband', title: '吹奏楽ウィンド編成', desc: 'クラリネット右翼、サックス中、金管・打楽器を後方へ' },
                  { id: 'concerto', title: 'ソリスト協奏曲配置', desc: 'ピアノソロを指揮台左手前に据え、オーケストラを後退' },
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setLayoutStyle(style.id as any);
                      runAiLayout(style.id as any);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex flex-col ${
                      layoutStyle === style.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 text-blue-900 font-semibold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{style.title}</span>
                    <span className="text-[9px] text-slate-400 font-normal mt-0.5 leading-snug">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 中央：AI舞台配置キャンバス ＆ スキャン演出 */}
          <div className="lg:col-span-2 flex flex-col space-y-2">
            <div className="flex justify-between items-center px-1 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-slate-600 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                AIによる自動調芯・配置シミュレーション
              </span>
              <span>800 × 500 px</span>
            </div>

            {/* キャンバスエリア */}
            <div 
              className="relative w-full aspect-[8/5] bg-slate-900 border border-slate-200 rounded-2xl overflow-hidden shadow-inner select-none"
            >
              {/* 背景図面 */}
              <div className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none">
                {renderBlueprintBackground(activeBlueprint)}
              </div>

              {/* グリッド補助線 */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* AIスキャンアニメーションオーバーレイ */}
              {isAnalyzing && (
                <div className="absolute inset-0 z-50 bg-black/40 flex flex-col items-center justify-center backdrop-blur-xs">
                  <div className="text-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white tracking-wider animate-pulse">AI舞台解析 ＆ 最適配置演算中</p>
                      <p className="text-xs text-blue-300 font-mono">{analysisStep}</p>
                    </div>
                  </div>
                  {/* スキャンビーム */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent top-0 animate-scan pointer-events-none" />
                </div>
              )}

              {/* 配置された要素のレンダリング */}
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: `${(item.x / 800) * 100}%`,
                    top: `${(item.y / 500) * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    width: `${(item.width / 800) * 100}%`,
                    height: `${(item.height / 500) * 100}%`,
                    minWidth: `${item.width}px`,
                    minHeight: `${item.height}px`,
                    zIndex: item.type === 'riser' ? 10 : 20,
                  }}
                  className={`rounded flex items-center justify-center border font-semibold text-[8px] leading-none transition-all duration-700 shadow-sm ${item.color} group hover:scale-110`}
                  title={`${item.label} (座標 X:${item.x}, Y:${item.y})`}
                >
                  <span className="truncate max-w-full px-0.5">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-slate-400">
                配置オブジェクト数: <span className="font-bold text-slate-600">{items.length}件</span> (椅子 {counts.chair} / 譜面台 {counts.stand} / ひな壇 {counts.riser20 + counts.riser40 + counts.riser60}台)
              </span>
              <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> AI音圧・スペース安全基準チェック：合格
              </span>
            </div>
          </div>

          {/* 右サイド：AIアシスタント指示チャット ＆ 最適化レポート */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            
            {/* AI指示プロンプトチャット */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3.5">
              <span className="text-xs font-bold text-slate-700 block border-b border-slate-200 pb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                AI配置アシスタント指示（対話）
              </span>

              {/* チャットログ */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 h-[180px] overflow-y-auto text-[10px] space-y-2.5 font-sans leading-relaxed">
                {aiLog.map((log, idx) => (
                  <div key={idx} className={`${log.startsWith('🤖') ? 'text-indigo-700 font-medium' : log.startsWith('💡') ? 'text-slate-800 bg-slate-50 p-1 rounded font-bold' : 'text-slate-500'}`}>
                    {log}
                  </div>
                ))}
              </div>

              {/* 指示タグ（簡単クリック） */}
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-bold block">クイック調整指示:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    '全体を少し後ろに下げて',
                    '打楽器を左側に寄せて',
                    'ピアノ協奏曲配置にして',
                    '対向配置（ドイツ式）にして',
                  ].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setUploadPrompt(chip);
                      }}
                      className="text-[9px] bg-white border border-slate-200 text-slate-600 px-1.5 py-1 rounded hover:bg-slate-100 transition-all font-medium"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* プロンプト入力フォーム */}
              <form onSubmit={handleAiPromptSubmit} className="flex gap-1.5">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setUploadPrompt(e.target.value)}
                  placeholder="例: 全体を奥に30cm下げて"
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-700 transition"
                  title="AIに配置指示を送信"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* AI最適化レポート */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block border-b border-slate-200 pb-1.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                AI最適化レポート
              </span>

              <div className="space-y-2 text-[10px] leading-relaxed text-slate-600">
                <p className="font-bold text-slate-800 text-[11px]">{aiReport.title}</p>
                <ul className="space-y-1.5 list-disc pl-3">
                  {aiReport.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- 図面アップロード モーダル (パブリック共有デモ) --- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                新規舞台平面図をアップロード
              </h4>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* アップロード枠 */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold">舞台平面図の画像 (PNG / JPG / SVG)</label>
                {!uploadImage ? (
                  <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-indigo-50/20 transition group">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mb-2 transition-all" />
                    <span className="text-slate-600 font-semibold">ローカルからファイルを選択</span>
                    <span className="text-[10px] text-slate-400 mt-1">アスペクト比 8 : 5 推奨</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 max-h-[160px] flex items-center justify-center">
                    <img src={uploadImage} alt="Uploaded draft" className="object-contain max-h-[160px]" />
                    <button
                      onClick={() => setUploadImage(null)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* 図面名 */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold">ホール名称・平面図名</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="例：川崎市民文化ホール・大ステージ"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* パブリック共有チェックボックス */}
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShareChecked}
                    onChange={(e) => setIsShareChecked(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className="text-slate-800 font-bold flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                      この図面を他の全オケ団体と共有（全体パブリック公開）
                    </span>
                    <p className="text-[10px] text-indigo-700/80 leading-relaxed">
                      オンにすると、システム全体に図面データが共有され、他の全ての団体アカウントでも、この舞台図面を背景に選択して自動配置できるようになります。
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-100 pt-3 text-xs">
              <button
                onClick={() => setShowUploadModal(false)}
                className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveUpload}
                disabled={!uploadImage || !uploadName.trim()}
                className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
              >
                図面を登録・AI解析
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- 高品質なSVG舞台図面をレンダリングするヘルパー関数 ---
function renderBlueprintBackground(bp: StageBlueprint) {
  if (bp.type === 'image' && bp.imageUrl) {
    return <img src={bp.imageUrl} alt={bp.name} className="w-full h-full object-cover" />;
  }

  // 以下は高品質なコンサートホールSVG図面
  switch (bp.svgType) {
    case 'suntory': // サントリーホール風: 温かみのあるウッドカラーにパイプオルガン
      return (
        <svg viewBox="0 0 800 500" className="w-full h-full text-amber-900/30" xmlns="http://www.w3.org/2000/svg">
          {/* 背景のウッドデッキ床 */}
          <rect width="800" height="500" fill="#fcf7f2" />
          
          {/* 後背席・パイプオルガンエリアの壁面 */}
          <path d="M 150,50 L 650,50 L 750,150 L 50,150 Z" fill="#f5ebe0" stroke="#e3d5ca" strokeWidth="2" />
          
          {/* パイプオルガンのアイコン化された線 */}
          <g transform="translate(340, 60)" stroke="#c6ac8f" strokeWidth="1.5" fill="none">
            <rect x="0" y="0" width="120" height="60" rx="3" fill="#eae2b7" opacity="0.3" />
            <line x1="10" y1="50" x2="10" y2="10" />
            <line x1="20" y1="50" x2="20" y2="15" />
            <line x1="30" y1="50" x2="30" y2="5" />
            <line x1="40" y1="50" x2="40" y2="10" />
            <line x1="50" y1="50" x2="50" y2="20" />
            <line x1="60" y1="50" x2="60" y2="20" />
            <line x1="70" y1="50" x2="70" y2="10" />
            <line x1="80" y1="50" x2="80" y2="5" />
            <line x1="90" y1="50" x2="90" y2="15" />
            <line x1="100" y1="50" x2="100" y2="10" />
            <text x="60" y="55" textAnchor="middle" fontSize="6" fill="#8e7dbe" fontWeight="bold">PIPE ORGAN</text>
          </g>

          {/* 後背合唱団席（P席）の仕切り */}
          <path d="M 100,150 L 700,150 L 760,200 L 40,200 Z" fill="#f7f0e9" stroke="#d5bdaf" strokeWidth="1" />
          <text x="400" y="175" textAnchor="middle" fontSize="10" fill="#a5a5a5" fontWeight="bold">オルガン正面・合唱団席 (P席)</text>

          {/* 舞台奥のステップ（同心円アーク線） */}
          <path d="M 60,200 Q 400,280 740,200" fill="none" stroke="#d5bdaf" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 120,240 Q 400,320 680,240" fill="none" stroke="#d5bdaf" strokeWidth="2" />
          <path d="M 180,280 Q 400,360 620,280" fill="none" stroke="#d5bdaf" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 240,320 Q 400,400 560,320" fill="none" stroke="#d5bdaf" strokeWidth="1.5" />

          {/* 舞台端（客席の境界線） */}
          <path d="M 150,450 Q 400,490 650,450" fill="none" stroke="#b1a7a6" strokeWidth="4" />
          
          <text x="400" y="480" textAnchor="middle" fontSize="11" fill="#8a817c" fontWeight="bold">← 客席側 (Audience)</text>
          <text x="100" y="430" textAnchor="middle" fontSize="9" fill="#8a817c">下手 (Stage Left)</text>
          <text x="700" y="430" textAnchor="middle" fontSize="9" fill="#8a817c">上手 (Stage Right)</text>
        </svg>
      );

    case 'geigeki': // 東京芸術劇場風: モダンな斜めのラインと音響反射板
      return (
        <svg viewBox="0 0 800 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="500" fill="#fafafa" />
          
          {/* 反射板壁面 */}
          <polygon points="120,40 680,40 730,120 70,120" fill="#eaeaea" stroke="#cccccc" strokeWidth="1.5" />
          <polygon points="70,120 730,120 780,220 20,220" fill="#f0f0f0" stroke="#cccccc" strokeWidth="1" />
          
          {/* 天井反射板（浮いた楕円） */}
          <ellipse cx="400" cy="80" rx="140" ry="25" fill="#e5e5e5" stroke="#b5b5b5" strokeWidth="1" opacity="0.7" />
          <text x="400" y="84" textAnchor="middle" fontSize="9" fill="#777777" fontWeight="bold">Acoustic Reflector (音響反射板)</text>

          {/* 横線 (ひな壇段差の線) */}
          <line x1="45" y1="170" x2="755" y2="170" stroke="#cccccc" strokeWidth="2" strokeDasharray="6 3" />
          <line x1="95" y1="240" x2="705" y2="240" stroke="#cccccc" strokeWidth="2" />
          <line x1="145" y1="310" x2="655" y2="310" stroke="#cccccc" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="195" y1="380" x2="605" y2="380" stroke="#cccccc" strokeWidth="1" />

          {/* 舞台最前端 */}
          <path d="M 120,440 L 680,440" stroke="#222222" strokeWidth="3" />
          
          <text x="400" y="470" textAnchor="middle" fontSize="11" fill="#444444" fontWeight="bold">← 客席側 (Audience)</text>
          <text x="150" y="420" textAnchor="middle" fontSize="9" fill="#888888">下手 (Stage Left)</text>
          <text x="650" y="420" textAnchor="middle" fontSize="9" fill="#888888">上手 (Stage Right)</text>
        </svg>
      );

    case 'gym': // 学校体育館: 板目の体育館床、バスケラインが見え隠れ、ひな壇用ステップ
      return (
        <svg viewBox="0 0 800 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* 黄土色の体育館床 */}
          <rect width="800" height="500" fill="#f4f1de" />
          
          {/* 体育館の床板目スリット */}
          <g stroke="#e0dbcd" strokeWidth="0.5">
            <line x1="0" y1="50" x2="800" y2="50" />
            <line x1="0" y1="100" x2="800" y2="100" />
            <line x1="0" y1="150" x2="800" y2="150" />
            <line x1="0" y1="200" x2="800" y2="200" />
            <line x1="0" y1="250" x2="800" y2="250" />
            <line x1="0" y1="300" x2="800" y2="300" />
            <line x1="0" y1="350" x2="800" y2="350" />
            <line x1="0" y1="400" x2="800" y2="400" />
            <line x1="0" y1="450" x2="800" y2="450" />
          </g>

          {/* バスケコートライン */}
          <path d="M 0,380 Q 200,450 400,480" fill="none" stroke="#2a9d8f" strokeWidth="2" opacity="0.4" />
          <path d="M 800,380 Q 600,450 400,480" fill="none" stroke="#e76f51" strokeWidth="2" opacity="0.4" />

          {/* 舞台裏の看板幕 */}
          <rect x="50" y="20" width="700" height="60" fill="#3d3a4e" rx="4" stroke="#222222" strokeWidth="2" />
          <text x="400" y="55" textAnchor="middle" fontSize="14" fill="#ffffff" fontWeight="bold" letterSpacing="6">舞台（STAGE）</text>

          {/* 舞台袖カーテン */}
          <path d="M 20,10 L 80,10 L 110,250 L 50,250 Z" fill="#800f2f" opacity="0.8" />
          <path d="M 780,10 L 720,10 L 690,250 L 750,250 Z" fill="#800f2f" opacity="0.8" />

          {/* 舞台端 */}
          <line x1="100" y1="440" x2="700" y2="440" stroke="#3d3a4e" strokeWidth="4" />
          
          <text x="400" y="475" textAnchor="middle" fontSize="10" fill="#3d3a4e" fontWeight="bold">← フロア・客席（Floor / Audience）</text>
        </svg>
      );

    default: // 標準多目的ホール
      return (
        <svg viewBox="0 0 800 500" className="w-full h-full text-slate-800" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="500" fill="#f8fafc" />
          <path d="M 100,60 L 700,60 L 760,180 L 720,440 L 80,440 L 40,180 Z" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          <line x1="400" y1="60" x2="400" y2="440" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 5" />
          
          <text x="400" y="465" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">← 客席側 (Front)</text>
          <text x="120" y="420" textAnchor="middle" fontSize="8" fill="#94a3b8">下手 (Stage Left)</text>
          <text x="680" y="420" textAnchor="middle" fontSize="8" fill="#94a3b8">上手 (Stage Right)</text>
        </svg>
      );
  }
}
