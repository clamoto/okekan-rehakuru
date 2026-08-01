'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/navigation/Header';
import PlayerSearch, { ExtraPlayer } from '@/components/rehakuru/PlayerSearch';
import EscrowOfferModal from '@/components/rehakuru/EscrowOfferModal';
import PdfReceiptModal from '@/components/rehakuru/PdfReceiptModal';
import { Sparkles, ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

function RehakuruContent() {
  const searchParams = useSearchParams();
  const initialPart = searchParams.get('part') || searchParams.get('parts') || '';

  const [selectedPlayer, setSelectedPlayer] = useState<ExtraPlayer | null>(null);
  const [activeOffers, setActiveOffers] = useState<any[]>([
    {
      id: 'off-101',
      playerName: '高橋 英樹',
      part: 'Oboe / E.H.',
      rewardAmount: 18000,
      platformFee: 900,
      totalAmount: 18900,
      scheduleTitle: '第20回定期演奏会 第4回全合奏',
      status: 'escrow_paid',
      statusLabel: '仮払い完了 (Escrow Paid)',
      createdAt: '2026/08/01',
    },
  ]);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const handleSuccessOffer = (newOffer: any) => {
    setActiveOffers([
      {
        id: newOffer.id,
        playerName: newOffer.targetPlayer.fullName,
        part: newOffer.targetPlayer.part,
        rewardAmount: newOffer.rewardAmount,
        platformFee: newOffer.platformFee,
        totalAmount: newOffer.totalAmount,
        scheduleTitle: newOffer.scheduleTitle,
        status: 'escrow_paid',
        statusLabel: '仮払い完了 (Escrow Paid)',
        createdAt: newOffer.createdAt,
      },
      ...activeOffers,
    ]);
  };

  return (
    <>
      {/* URL クエリパラメータ引き継ぎ通知 */}
      {initialPart && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-xs text-orange-300">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span>オケカン出欠画面より【{initialPart}】パートのエキストラ募集条件を引き継ぎました。</span>
          </div>
        </div>
      )}

      {/* アクティブな仮払いオファー ＆ 領収書一覧 */}
      {activeOffers.length > 0 && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 mb-8">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            現在進行中のオファー ＆ 仮払い・領収書
          </h3>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden text-xs">
            {activeOffers.map((off) => (
              <div
                key={off.id}
                className="p-4 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-0.5 rounded border border-emerald-500/20">
                      {off.statusLabel}
                    </span>
                    <span className="text-slate-400 font-mono">{off.createdAt}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {off.playerName} 氏 ({off.part}) - {off.scheduleTitle}
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    提示謝礼: ¥{off.rewardAmount.toLocaleString()} (合計仮払額: ¥{off.totalAmount.toLocaleString()})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedReceipt(off)}
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  PDF領収書を表示
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 奏者検索コンポーネント */}
      <section>
        <PlayerSearch
          initialPartQuery={initialPart}
          onSelectPlayer={(player) => setSelectedPlayer(player)}
        />
      </section>

      {/* エスクロー決済モーダル */}
      {selectedPlayer && (
        <EscrowOfferModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onSuccessOffer={handleSuccessOffer}
        />
      )}

      {/* PDF領収書モーダル */}
      {selectedReceipt && (
        <PdfReceiptModal
          offerData={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </>
  );
}

export default function RehakuruPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* ヘッダーセクション */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-400 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-orange-500/20">
              <Sparkles className="w-3.5 h-3.5" /> リハクル (エキストラマッチング)
            </div>
            <h1 className="text-2xl font-black text-white">エキストラ奏者検索 ＆ Stripe代理決済</h1>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Stripe Connect エスクロー安全決済システム稼働中</span>
          </div>
        </div>

        <Suspense fallback={<div className="text-center text-slate-400 text-xs py-10">読み込み中...</div>}>
          <RehakuruContent />
        </Suspense>
      </main>
    </div>
  );
}
