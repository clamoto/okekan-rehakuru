'use client';

import { useState } from 'react';
import { Sparkles, Car, Search, ShieldCheck } from 'lucide-react';

export interface ExtraPlayer {
  id: string;
  fullName: string;
  part: string;
  avatarUrl?: string;
  instrumentsOwned: string[];
  hasCar: boolean;
  teachers: string;
  pastConductors: string[];
  isPro: boolean;
  bio: string;
  stripeConnected: boolean;
  compatibilityScore: number; // 0 - 100
}

const SAMPLE_PLAYERS: ExtraPlayer[] = [
  {
    id: 'p1',
    fullName: '高橋 英樹',
    part: 'Oboe / English Horn',
    instrumentsOwned: ['イングリッシュホルン (F.Loree)', 'A管クラリネット'],
    hasCar: true,
    teachers: '東京藝術大学 〇〇教授, 元NHK交響楽団 △△氏',
    pastConductors: ['山田 太郎', '広上 淳一', '佐渡 裕'],
    isPro: true,
    bio: 'オーボエ・イングリッシュホルン奏者。オケ・吹奏楽エキストラ経験多数。車出し・大型荷物運搬対応可。',
    stripeConnected: true,
    compatibilityScore: 95,
  },
  {
    id: 'p2',
    fullName: '坂本 葵',
    part: 'Contrabass',
    instrumentsOwned: ['5弦コントラバス', 'C extension'],
    hasCar: true,
    teachers: '〇〇音楽大学 △△講師',
    pastConductors: ['山田 太郎', '小林 研一郎'],
    isPro: false,
    bio: 'アマチュア歴12年。5弦コントラバス所有。ワンボックスカーでの楽器運搬対応可能です。',
    stripeConnected: true,
    compatibilityScore: 90,
  },
  {
    id: 'p3',
    fullName: '藤田 慎吾',
    part: 'Horn',
    instrumentsOwned: ['F/B♭ フルダブルホルン (Alexander 103)', 'Wagner Tuba'],
    hasCar: false,
    teachers: '読売日本交響楽団 〇〇氏',
    pastConductors: ['山田 太郎', '大友 直人'],
    isPro: true,
    bio: 'アレキサンダー103所有。1番ホーンから4番ホーン、ワグナーチューバまで幅広く対応します。',
    stripeConnected: true,
    compatibilityScore: 88,
  },
  {
    id: 'p4',
    fullName: '松田 優花',
    part: 'Clarinet / Bass Clarinet',
    instrumentsOwned: ['B♭/A管クラリネット', 'バスクラリネット (Low C)'],
    hasCar: false,
    teachers: '桐朋学園大学 〇〇教授',
    pastConductors: ['佐渡 裕'],
    isPro: false,
    bio: 'バスクラLow C管所有。吹き振りやセクション補強などお気軽にご相談ください。',
    stripeConnected: true,
    compatibilityScore: 82,
  },
];

interface PlayerSearchProps {
  initialPartQuery?: string;
  onSelectPlayer: (player: ExtraPlayer) => void;
}

export default function PlayerSearch({
  initialPartQuery = '',
  onSelectPlayer,
}: PlayerSearchProps) {
  const [searchPart, setSearchPart] = useState<string>(initialPartQuery);
  const [requireSpecialInst, setRequireSpecialInst] = useState<boolean>(false);
  const [requireCar, setRequireCar] = useState<boolean>(false);
  const [proOnly, setProOnly] = useState<boolean>(false);

  const filteredPlayers = SAMPLE_PLAYERS.filter((player) => {
    if (searchPart && !player.part.toLowerCase().includes(searchPart.toLowerCase()) && !searchPart.toLowerCase().includes(player.part.split(' ')[0].toLowerCase())) {
      return false;
    }
    if (requireSpecialInst && player.instrumentsOwned.length === 0) return false;
    if (requireCar && !player.hasCar) return false;
    if (proOnly && !player.isPro) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 検索フィルター */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-amber-50 text-amber-600 p-2 rounded-xl border border-amber-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-800">リハクル マッチング</span>
              <h2 className="text-lg font-bold text-slate-900">エキストラ奏者・相性スコア検索</h2>
            </div>
          </div>

          <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold">
            全 {filteredPlayers.length} 名ヒット
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-700 block mb-1 font-bold">パート / 楽器</label>
            <div className="relative">
              <input
                type="text"
                placeholder="例: Oboe, Horn, Contrabass"
                value={searchPart}
                onChange={(e) => setSearchPart(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 pl-8 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="specialInst"
              checked={requireSpecialInst}
              onChange={(e) => setRequireSpecialInst(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="specialInst" className="text-slate-700 font-medium cursor-pointer">
              特殊管所有者のみ (E.H., BassCl等)
            </label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="carAvailable"
              checked={requireCar}
              onChange={(e) => setRequireCar(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="carAvailable" className="text-slate-700 font-medium cursor-pointer">
              車出し可能者のみ
            </label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="proOnly"
              checked={proOnly}
              onChange={(e) => setProOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="proOnly" className="text-slate-700 font-medium cursor-pointer">
              プロ奏者のみ
            </label>
          </div>
        </div>
      </div>

      {/* 奏者カードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            {/* 相性スコアバッジ */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-lg shadow-sm">
                  相性 {player.compatibilityScore}点
                </span>
                {player.isPro ? (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">
                    プロ奏者
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded">
                    アマチュア
                  </span>
                )}
              </div>

              {player.stripeConnected && (
                <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Stripe連携済
                </span>
              )}
            </div>

            {/* 奏者基本情報 */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {player.fullName}
                <span className="text-xs font-normal text-slate-500">({player.part})</span>
              </h3>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{player.bio}</p>

              {/* 特殊管 ＆ 車出し情報 */}
              <div className="mt-4 space-y-2 text-xs">
                {player.instrumentsOwned.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-700 font-bold shrink-0">所有特殊管:</span>
                    <div className="flex flex-wrap gap-1">
                      {player.instrumentsOwned.map((inst, idx) => (
                        <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          {inst}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {player.hasCar && (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Car className="w-3.5 h-3.5" />
                    <span>車出し・大型楽器運搬可能</span>
                  </div>
                )}

                <div className="text-slate-600 text-[11px]">
                  <span className="font-semibold text-slate-800">師事情報:</span> {player.teachers}
                </div>
                <div className="text-slate-600 text-[11px]">
                  <span className="font-semibold text-slate-800">過去共演指揮者:</span> {player.pastConductors.join(', ')}
                </div>
              </div>
            </div>

            {/* オファー作成ボタン */}
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => onSelectPlayer(player)}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
              >
                <Sparkles className="w-4 h-4" />
                オファー提出 ＆ 仮払いへ進む
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
