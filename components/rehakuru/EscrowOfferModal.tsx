'use client';

import { useState } from 'react';
import { ExtraPlayer } from './PlayerSearch';
import { X, CreditCard, ShieldCheck, CheckCircle2, Lock, FileText } from 'lucide-react';

interface EscrowOfferModalProps {
  player: ExtraPlayer;
  onClose: () => void;
  onSuccessOffer: (offerData: any) => void;
}

export default function EscrowOfferModal({
  player,
  onClose,
  onSuccessOffer,
}: EscrowOfferModalProps) {
  const [rewardAmount, setRewardAmount] = useState<number>(15000);
  const [scheduleTitle, setScheduleTitle] = useState<string>('第20回定期演奏会 GP＆本番 (2026/09/13)');
  const [notes, setNotes] = useState<string>('Ob.2およびイングリッシュホルンパートをお願いしたく存じます。交通費・謝礼込みです。');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const platformFee = Math.round(rewardAmount * 0.05); // 5% システム手数料
  const totalAmount = rewardAmount + platformFee;

  const handleEscrowPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      onSuccessOffer({
        id: `off-${Date.now()}`,
        targetPlayer: player,
        rewardAmount,
        platformFee,
        totalAmount,
        scheduleTitle,
        status: 'escrow_paid',
        receiptUrl: '#',
        createdAt: new Date().toLocaleDateString('ja-JP'),
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold text-orange-400">Stripe Connect エスクロー決済</span>
            <h3 className="text-lg font-bold text-white">エキストラオファー作成 ＆ 仮払い</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCompleted ? (
          <div className="space-y-4 text-xs">
            {/* 対象奏者概要 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">依頼先奏者:</span>
                <span className="text-sm font-bold text-white">{player.fullName} 氏</span>
                <span className="text-slate-400 ml-2">({player.part})</span>
              </div>
              <span className="bg-orange-500/20 text-orange-300 font-bold px-2.5 py-1 rounded text-[11px]">
                相性 {player.compatibilityScore}点
              </span>
            </div>

            {/* 関連日程 */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">依頼対象スケジュール</label>
              <input
                type="text"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            {/* 提示謝礼額 */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">提示謝礼額 (JPY / 交通費・税込)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">¥</span>
                <input
                  type="number"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 pl-8 text-white font-mono text-sm font-bold"
                />
              </div>
            </div>

            {/* メッセージ・連絡事項 */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">依頼詳細・備考</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            {/* 金額内訳サマリー */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>奏者謝礼金:</span>
                <span>¥{rewardAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>システム保証手数料 (5%):</span>
                <span>¥{platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                <span>仮払い請求合計額:</span>
                <span className="text-orange-400">¥{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* セキュリティ説明 */}
            <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-300 text-[11px]">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                **安心の仮払いシステム**: 演奏会・リハーサル終了後に双方が完了報告をするまで、決済金はStripe Connectによって安全に仮保持されます。
              </span>
            </div>

            {/* 決済ボタン */}
            <button
              onClick={handleEscrowPayment}
              disabled={isProcessing}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-orange-500/30 transition"
            >
              {isProcessing ? (
                <span>Stripe 代理決済処理中...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Stripeで仮払い手続きを実行 (¥{totalAmount.toLocaleString()})
                </>
              )}
            </button>
          </div>
        ) : (
          /* 仮払い完了完了状態 */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-bold text-white">オファー提出 ＆ 仮払い完了！</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Stripe Connect により謝礼金 ¥{totalAmount.toLocaleString()} の仮払いが安全に完了しました。奏者が受諾次第リハーサルに参加します。
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
