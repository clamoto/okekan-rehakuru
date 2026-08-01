'use client';

import { X, Download, Printer, ShieldCheck } from 'lucide-react';

interface PdfReceiptModalProps {
  offerData: {
    id: string;
    groupName?: string;
    playerName: string;
    part: string;
    rewardAmount: number;
    platformFee: number;
    totalAmount: number;
    scheduleTitle: string;
    createdAt: string;
  };
  onClose: () => void;
}

export default function PdfReceiptModal({ offerData, onClose }: PdfReceiptModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-50/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-6 relative overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-semibold text-emerald-700">適格領収書・証明書</span>
            <h3 className="text-lg font-bold text-slate-900">エキストラ謝礼 代理決済 領収書 (PDF)</h3>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 領収書本文プレビュー */}
        <div className="bg-white text-slate-900 p-6 rounded-xl font-serif space-y-6 shadow-inner text-xs">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h4 className="text-2xl font-bold tracking-widest text-slate-900">領 収 証</h4>
              <p className="text-[10px] text-slate-600 font-sans mt-1">領収番号: {offerData.id}</p>
            </div>
            <div className="text-right font-sans text-[10px] text-slate-600">
              <p>発行日: {offerData.createdAt}</p>
              <p className="font-bold text-slate-900">リハクル（Stripe Connect 代理決済）</p>
            </div>
          </div>

          <div className="space-y-2 border-b border-slate-300 pb-4">
            <p className="text-sm font-bold">東京市民交響楽団 御中</p>
            <div className="bg-slate-100 p-3 rounded text-center my-2 border border-slate-300">
              <span className="text-xs font-sans text-slate-600">一、受領金額</span>
              <p className="text-2xl font-bold text-slate-900 font-mono">¥{offerData.totalAmount.toLocaleString()} -</p>
            </div>
            <p className="text-[11px] text-slate-700">
              但: 演奏会エキストラ謝礼代として（奏者: {offerData.playerName} 氏 / {offerData.part}）
            </p>
          </div>

          {/* 明細テーブル */}
          <div className="font-sans text-[11px]">
            <span className="font-bold block mb-1">【内訳明細】</span>
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-700">
                  <th className="p-2 border border-slate-300">項目</th>
                  <th className="p-2 border border-slate-300 text-right">金額</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-300">エキストラ奏者謝礼 ({offerData.playerName} 氏)</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">¥{offerData.rewardAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300">リハクル エスクロー代理決済手数料 (5%)</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">¥{offerData.platformFee.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Stripe Connect 代理発行適格明細
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('PDF領収書をダウンロードしました。')}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              PDF領収書をダウンロード
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
