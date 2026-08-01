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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>オケカン出欠画面より【{initialPart}】パートのエキストラ募集条件を引き継ぎました。</span>
          </div>
        </div>
      )}

      {/* アクティブな仮払いオファー ＆ 領収書一覧 */}
      {activeOffers.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 mb-8">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            現在進行中のオファー ＆ 仮払い・領収書
          </h3>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {activeOffers.map((off) => (
              <div
                key={off.id}
                className="p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded border border-emerald-200">
                      {off.statusLabel}
                    </span>
                    <span className="text-slate-500 font-medium">{off.createdAt}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {off.playerName} 氏 ({off.part}) - {off.scheduleTitle}
                  </h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    提示謝礼: ¥{off.rewardAmount.toLocaleString()} (合計仮払額: ¥{off.totalAmount.toLocaleString()})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedReceipt(off)}
                  className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ヘッダーセクション */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> リハクル (エキストラマッチング)
            </div>
            <h1 className="text-2xl font-bold text-slate-900">エキストラ奏者検索 ＆ 代理決済</h1>
          </div>

          <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-700 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Stripe Connect エスクロー安全決済システム稼働中</span>
          </div>
        </div>

        <Suspense fallback={<div className="text-center text-slate-500 text-xs py-10">読み込み中...</div>}>
          <RehakuruContent />
        </Suspense>
      </main>
    </div>
  );
}
