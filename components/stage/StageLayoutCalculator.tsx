'use client';

import { useState } from 'react';
import { Layers, Sliders, CheckCircle2, Info, LayoutGrid } from 'lucide-react';

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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8">
      {/* 画面ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-400 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-purple-500/20">
            <Layers className="w-3.5 h-3.5" /> 実行委員サポート
          </div>
          <h2 className="text-xl font-bold text-white">舞台配置 ＆ ひな壇・椅子・譜面台 自動計算</h2>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
          合計乗戦奏者数: <span className="text-purple-400 font-extrabold text-sm">{totalPlayers}名</span>
        </div>
      </div>

      {/* 自動計算結果サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-500/30 rounded-xl p-4 text-center">
          <span className="text-xs text-purple-300 font-semibold block mb-1">椅子（必要脚数）</span>
          <span className="text-3xl font-black text-white">{totalChairs}</span>
          <span className="text-[11px] text-slate-400 block mt-1">
            管打 {woodwindsCount + brassCount + percussionCount}脚 / 弦 {stringChairs}脚
          </span>
        </div>

        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 rounded-xl p-4 text-center">
          <span className="text-xs text-indigo-300 font-semibold block mb-1">譜面台（必要台数）</span>
          <span className="text-3xl font-black text-white">{totalStands}</span>
          <span className="text-[11px] text-slate-400 block mt-1">
            管打 {windStands}台 / 弦 {stringStands}台 (プルト数)
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 rounded-xl p-4 text-center">
          <span className="text-xs text-emerald-300 font-semibold block mb-1">ひな壇段数 ＆ 2m×1m箱数</span>
          <span className="text-3xl font-black text-white">3 段</span>
          <span className="text-[11px] text-slate-400 block mt-1">
            計 {tierBoxes.tier1 + tierBoxes.tier2 + tierBoxes.tier3}箱 (20/40/60cm)
          </span>
        </div>
      </div>

      {/* パラメーター調整スライダー ＆ 設定 */}
      <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-400" />
          当日の出席人数 / プルト数パラメータ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* 管・打楽器数 */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <span className="font-bold text-blue-400 block border-b border-slate-800 pb-1">
              管打楽器 出席奏者数
            </span>

            <div className="flex justify-between items-center">
              <span>木管楽器 (Fl, Ob, Cl, Fg):</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWoodwindsCount(Math.max(1, woodwindsCount - 1))}
                  className="w-6 h-6 bg-slate-800 rounded font-bold"
                >
                  -
                </button>
                <span className="font-mono text-sm text-white w-6 text-center">{woodwindsCount}</span>
                <button
                  onClick={() => setWoodwindsCount(woodwindsCount + 1)}
                  className="w-6 h-6 bg-slate-800 rounded font-bold"
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
                  className="w-6 h-6 bg-slate-800 rounded font-bold"
                >
                  -
                </button>
                <span className="font-mono text-sm text-white w-6 text-center">{brassCount}</span>
                <button onClick={() => setBrassCount(brassCount + 1)} className="w-6 h-6 bg-slate-800 rounded font-bold">
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span>打楽器 ＆ ティンパニ:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPercussionCount(Math.max(1, percussionCount - 1))}
                  className="w-6 h-6 bg-slate-800 rounded font-bold"
                >
                  -
                </button>
                <span className="font-mono text-sm text-white w-6 text-center">{percussionCount}</span>
                <button
                  onClick={() => setPercussionCount(percussionCount + 1)}
                  className="w-6 h-6 bg-slate-800 rounded font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 弦楽器プルト数 */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <span className="font-bold text-amber-400 block border-b border-slate-800 pb-1">
              弦楽器 プルト数 (1プルト=2名)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                <span>Vn1:</span>
                <span className="font-mono text-white font-bold">{vn1Desks} プルト</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                <span>Vn2:</span>
                <span className="font-mono text-white font-bold">{vn2Desks} プルト</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                <span>Vla:</span>
                <span className="font-mono text-white font-bold">{vaDesks} プルト</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                <span>Vc:</span>
                <span className="font-mono text-white font-bold">{vcDesks} プルト</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded col-span-2">
                <span>Contrabass:</span>
                <span className="font-mono text-white font-bold">{cbDesks} プルト ({cbDesks * 2}名)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2D インタラクティブ 舞台配置プレビュー図 */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4" />
            2D 舞台配置 扇形マップ
          </span>
          <span className="text-[10px] text-slate-500 font-mono">客席側から見下ろした図</span>
        </div>

        {/* 舞台ビジュアル図 */}
        <div className="relative w-full h-[360px] bg-slate-900/80 rounded-xl border border-slate-800/80 p-4 flex flex-col items-center justify-between overflow-hidden">
          {/* 指揮台 */}
          <div className="w-20 h-10 bg-amber-600/30 border border-amber-500 rounded-lg flex items-center justify-center text-[10px] font-bold text-amber-300 shadow-md">
            指揮台
          </div>

          {/* 1層目: 弦楽器 扇形 */}
          <div className="w-full flex justify-around items-center px-4 text-[10px] font-bold text-slate-300 z-10">
            <div className="bg-amber-500/20 border border-amber-500/40 px-3 py-2 rounded-xl text-center">
              1st Violin ({vn1Desks * 2}名)
            </div>
            <div className="bg-amber-500/20 border border-amber-500/40 px-3 py-2 rounded-xl text-center">
              2nd Violin ({vn2Desks * 2}名)
            </div>
            <div className="bg-amber-500/20 border border-amber-500/40 px-3 py-2 rounded-xl text-center">
              Viola ({vaDesks * 2}名)
            </div>
            <div className="bg-amber-500/20 border border-amber-500/40 px-3 py-2 rounded-xl text-center">
              Cello ({vcDesks * 2}名)
            </div>
          </div>

          {/* 2層目: 木管楽器 (ひな壇1段目: 高20cm) */}
          <div className="w-4/5 bg-blue-950/60 border border-blue-500/40 py-2 rounded-xl text-center text-[11px] font-bold text-blue-300 shadow">
            【ひな壇 1段目 H=20cm】 木管パート ({woodwindsCount}名 / Fl, Ob, Cl, Fg)
          </div>

          {/* 3層目: 金管楽器 ＆ コントラバス (ひな壇2段目: 高40cm) */}
          <div className="w-11/12 flex justify-between items-center gap-2 text-[11px] font-bold">
            <div className="bg-orange-950/60 border border-orange-500/40 py-2 px-6 rounded-xl text-center text-orange-300 flex-1">
              【ひな壇 2段目 H=40cm】 金管パート ({brassCount}名 / Hr, Tp, Tb, Tuba)
            </div>
            <div className="bg-amber-950/60 border border-amber-500/40 py-2 px-4 rounded-xl text-center text-amber-300">
              CB ({cbDesks * 2}名)
            </div>
          </div>

          {/* 4層目: 打楽器・ティンパニ (ひな壇3段目: 高60cm) */}
          <div className="w-3/5 bg-purple-950/70 border border-purple-500/50 py-2 rounded-xl text-center text-[11px] font-bold text-purple-300 shadow-lg">
            【ひな壇 3段目 H=60cm】 ティンパニ ＆ 打楽器 ({percussionCount}名)
          </div>
        </div>
      </div>
    </div>
  );
}
