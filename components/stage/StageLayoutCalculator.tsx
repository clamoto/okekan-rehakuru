'use client';

import { useState } from 'react';
import { Layers, Sliders, CheckCircle2, Info, LayoutGrid } from 'lucide-react';
import StageLayoutCanvas from './StageLayoutCanvas';

interface StageLayoutCalculatorProps {
  initialAttendingCount?: number;
}

export default function StageLayoutCalculator({
  initialAttendingCount = 52,
}: StageLayoutCalculatorProps) {
  // 登録・出席メンバー数入力
  const [woodwindsCount, setWoodwindsCount] = useState<number>(12); // Fl:4, Ob:3, Cl:3, Fg:2
  const [brassCount, setBrassCount] = useState<number>(14); // Hr:5, Tp:4, Tb:4, Tuba:1
  const [percussionCount, setPercussionCount] = useState<number>(4); // Timp+Perc
  const [vn1Desks, setVn1Desks] = useState<number>(6); // 12名
  const [vn2Desks, setVn2Desks] = useState<number>(5); // 10名
  const [vaDesks, setVaDesks] = useState<number>(4); // 8名
  const [vcDesks, setVcDesks] = useState<number>(4); // 8名
  const [cbDesks, setCbDesks] = useState<number>(3); // 5〜6名

  // 自動計算
  const totalStringsPlayers = (vn1Desks + vn2Desks + vaDesks + vcDesks + cbDesks) * 2;
  const totalPlayers = woodwindsCount + brassCount + percussionCount + totalStringsPlayers;

  // 椅子数: 管・打は1人1脚、弦は1プルト2脚
  const stringChairs = (vn1Desks + vn2Desks + vaDesks + vcDesks + cbDesks) * 2;
  const totalChairs = woodwindsCount + brassCount + percussionCount + stringChairs;

  // 譜面台数: 管打は1人1台（または2人1台）、弦は1プルト1台
  const stringStands = vn1Desks + vn2Desks + vaDesks + vcDesks + cbDesks;
  const windStands = Math.ceil(woodwindsCount / 2) + Math.ceil(brassCount / 2) + percussionCount;
  const totalStands = stringStands + windStands;

  // ひな壇自動計算
  // 木管: 1段目 (高さ20cm)
  // 金管: 2段目 (高さ40cm)
  // 打楽器: 3段目 (高さ60cm)
  const tier1Pats = woodwindsCount; // 1段目箱数
  const tier2Pats = brassCount; // 2段目箱数
  const tier3Pats = percussionCount; // 3段目箱数

  const tierBoxes = {
    tier1: Math.ceil(tier1Pats / 3), // 2m x 1m 箱数目安
    tier2: Math.ceil(tier2Pats / 3),
    tier3: Math.ceil(tier3Pats / 2),
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-8">
      {/* 画面ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-blue-200">
            <Layers className="w-3.5 h-3.5" /> 実行委員サポート
          </div>
          <h2 className="text-xl font-bold text-slate-900">舞台配置 ＆ ひな壇・椅子・譜面台 自動計算</h2>
        </div>

        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-700">
          合計乗戦奏者数: <span className="text-blue-700 font-extrabold text-sm">{totalPlayers}名</span>
        </div>
      </div>

      {/* 自動計算結果サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <span className="text-xs text-purple-700 font-semibold block mb-1">椅子（必要脚数）</span>
          <span className="text-3xl font-bold text-slate-900">{totalChairs}</span>
          <span className="text-[11px] text-slate-600 block mt-1">
            管打 {woodwindsCount + brassCount + percussionCount}脚 / 弦 {stringChairs}脚
          </span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <span className="text-xs text-blue-700 font-semibold block mb-1">譜面台（必要台数）</span>
          <span className="text-3xl font-bold text-slate-900">{totalStands}</span>
          <span className="text-[11px] text-slate-600 block mt-1">
            管打 {windStands}台 / 弦 {stringStands}台 (プルト数)
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <span className="text-xs text-emerald-700 font-semibold block mb-1">ひな壇段数 ＆ 2m×1m箱数</span>
          <span className="text-3xl font-bold text-slate-900">3 段</span>
          <span className="text-[11px] text-slate-600 block mt-1">
            計 {tierBoxes.tier1 + tierBoxes.tier2 + tierBoxes.tier3}箱 (20/40/60cm)
          </span>
        </div>
      </div>

      {/* パラメーター調整スライダー ＆ 設定 */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-700" />
          当日の出席人数 / プルト数パラメータ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* 管・打楽器数 */}
          <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
            <span className="font-bold text-blue-700 block border-b border-slate-200 pb-1">
              管打楽器 出席奏者数
            </span>

            <div className="flex justify-between items-center">
              <span>木管楽器 (Fl, Ob, Cl, Fg):</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWoodwindsCount(Math.max(1, woodwindsCount - 1))}
                  className="w-6 h-6 bg-slate-100 rounded font-bold hover:bg-slate-200"
                >
                  -
                </button>
                <span className="font-mono text-sm text-slate-900 w-6 text-center">{woodwindsCount}</span>
                <button
                  onClick={() => setWoodwindsCount(woodwindsCount + 1)}
                  className="w-6 h-6 bg-slate-100 rounded font-bold hover:bg-slate-200"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span>金管楽器 (Hr, Tp, Tb, Tuba):</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBrassCount(Math.max(1, brassCount - 1))}
                  className="w-6 h-6 bg-slate-100 rounded font-bold hover:bg-slate-200"
                >
                  -
                </button>
                <span className="font-mono text-sm text-slate-900 w-6 text-center">{brassCount}</span>
                <button onClick={() => setBrassCount(brassCount + 1)} className="w-6 h-6 bg-slate-100 rounded font-bold hover:bg-slate-200">
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span>打楽器 ＆ ティンパニ:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPercussionCount(Math.max(1, percussionCount - 1))}
                  className="w-6 h-6 bg-slate-100 rounded font-bold hover:bg-slate-200"
                >
                  -
                </button>
                <span className="font-mono text-sm text-slate-900 w-6 text-center">{percussionCount}</span>
                <button
                  onClick={() => setPercussionCount(percussionCount + 1)}
                  className="w-6 h-6 bg-slate-100 rounded font-bold hover:bg-slate-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 弦楽器プルト数 */}
          <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
            <span className="font-bold text-amber-700 block border-b border-slate-200 pb-1">
              弦楽器 プルト数 (1プルト=2名)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span>Vn1:</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setVn1Desks(Math.max(1, vn1Desks - 1))} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">-</button>
                  <span className="font-mono text-slate-900 font-bold w-4 text-center">{vn1Desks}</span>
                  <button onClick={() => setVn1Desks(vn1Desks + 1)} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span>Vn2:</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setVn2Desks(Math.max(1, vn2Desks - 1))} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">-</button>
                  <span className="font-mono text-slate-900 font-bold w-4 text-center">{vn2Desks}</span>
                  <button onClick={() => setVn2Desks(vn2Desks + 1)} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span>Vla:</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setVaDesks(Math.max(1, vaDesks - 1))} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">-</button>
                  <span className="font-mono text-slate-900 font-bold w-4 text-center">{vaDesks}</span>
                  <button onClick={() => setVaDesks(vaDesks + 1)} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span>Vc:</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setVcDesks(Math.max(1, vcDesks - 1))} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">-</button>
                  <span className="font-mono text-slate-900 font-bold w-4 text-center">{vcDesks}</span>
                  <button onClick={() => setVcDesks(vcDesks + 1)} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded col-span-2">
                <span>Contrabass:</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCbDesks(Math.max(1, cbDesks - 1))} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">-</button>
                  <span className="font-mono text-slate-900 font-bold w-12 text-center">{cbDesks} P ({cbDesks * 2}名)</span>
                  <button onClick={() => setCbDesks(cbDesks + 1)} className="w-5 h-5 bg-slate-200/60 hover:bg-slate-200 font-bold rounded text-xs">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI舞台配置プランナーキャンバス */}
      <div>
        <StageLayoutCanvas
          woodwindsCount={woodwindsCount}
          brassCount={brassCount}
          percussionCount={percussionCount}
          vn1Desks={vn1Desks}
          vn2Desks={vn2Desks}
          vaDesks={vaDesks}
          vcDesks={vcDesks}
          cbDesks={cbDesks}
        />
      </div>
    </div>
  );
}
