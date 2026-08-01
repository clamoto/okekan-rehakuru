'use client';

import { useState } from 'react';
import { MessageSquarePlus, UserCheck, ShieldAlert, Sparkles, CheckCircle2, Bookmark, Send } from 'lucide-react';

export type LeadershipRole = 'concertmaster' | 'conductor' | 'instructor';

export interface FeedbackItem {
  id: string;
  role: LeadershipRole;
  authorName: string;
  pieceTitle: string;
  category: 'bowing' | 'tempo' | 'pitch' | 'balance' | 'other';
  categoryLabel: string;
  priority: 'high' | 'normal';
  content: string;
  createdAt: string;
  isAppliedToAiPlan?: boolean;
}

const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'fb-1',
    role: 'concertmaster',
    authorName: '清水 裕子 (コンサートマスター)',
    pieceTitle: 'チャイコフスキー交響曲第5番 第1楽章',
    category: 'bowing',
    categoryLabel: '弦楽器ボウイング・アーティキュレーション',
    priority: 'high',
    content: '第1楽章 P.I. 直前の16分音符スタッカートの返し弓が1st/2ndでバラついている。次回の分奏で20分間ボウイング統一のコマを入れてほしい。',
    createdAt: '2026/07/27',
    isAppliedToAiPlan: false,
  },
  {
    id: 'fb-2',
    role: 'conductor',
    authorName: '山田 太郎 (指揮者)',
    pieceTitle: '交響曲第5番 第4楽章 コーダ',
    category: 'tempo',
    categoryLabel: 'テンポキープ・アゴーギク',
    priority: 'high',
    content: 'Presto部分で金管セクションが走る傾向がある。次回全体合奏の最初15分でメトロノーム合わせた叩き込み練習を行いたい。',
    createdAt: '2026/07/28',
    isAppliedToAiPlan: false,
  },
  {
    id: 'fb-3',
    role: 'instructor',
    authorName: '佐藤 奏 先生 (木管パート指導者)',
    pieceTitle: 'モーツァルト フルート協奏曲',
    category: 'balance',
    categoryLabel: 'ハーモニー・音量バランス',
    priority: 'normal',
    content: '伴奏弦楽器の音量がソロフルートを消してしまっている。p, pp のニュアンス徹底をAIインペクの練習指示に含めてほしい。',
    createdAt: '2026/07/29',
    isAppliedToAiPlan: false,
  },
];

interface FeedbackBoardProps {
  onFeedbacksChange?: (feedbacks: FeedbackItem[]) => void;
  onApplyToAiPlan?: (feedbacks: FeedbackItem[]) => void;
}

export default function FeedbackBoard({
  onFeedbacksChange,
  onApplyToAiPlan,
}: FeedbackBoardProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(INITIAL_FEEDBACKS);
  const [newRole, setNewRole] = useState<LeadershipRole>('concertmaster');
  const [newAuthorName, setNewAuthorName] = useState<string>('');
  const [newPieceTitle, setNewPieceTitle] = useState<string>('チャイコフスキー交響曲第5番');
  const [newCategory, setNewCategory] = useState<FeedbackItem['category']>('bowing');
  const [newContent, setNewContent] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'high' | 'normal'>('high');

  const categoryMap = {
    bowing: '弦楽器ボウイング・アーティキュレーション',
    tempo: 'テンポキープ・アゴーギク',
    pitch: 'ピッチ・ハーモニー和声',
    balance: '音量バランス・ソロ伴奏',
    other: 'その他全体指示',
  };

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const roleName =
      newRole === 'concertmaster'
        ? `${newAuthorName || '清水 コンマス'} (コンサートマスター)`
        : newRole === 'conductor'
        ? `${newAuthorName || '山田 指揮者'} (指揮者)`
        : `${newAuthorName || '佐藤 先生'} (パート指導者)`;

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      role: newRole,
      authorName: roleName,
      pieceTitle: newPieceTitle,
      category: newCategory,
      categoryLabel: categoryMap[newCategory],
      priority: newPriority,
      content: newContent,
      createdAt: new Date().toLocaleDateString('ja-JP'),
      isAppliedToAiPlan: false,
    };

    const updated = [newItem, ...feedbacks];
    setFeedbacks(updated);
    if (onFeedbacksChange) onFeedbacksChange(updated);

    setNewContent('');
  };

  const handleTriggerAiOptimization = () => {
    const updated = feedbacks.map((f) => ({ ...f, isAppliedToAiPlan: true }));
    setFeedbacks(updated);
    if (onApplyToAiPlan) onApplyToAiPlan(updated);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-purple-400">指導陣フィードバック連携</span>
            <h2 className="text-xl font-bold text-white">コンマス・指揮者・指導者からの改善指示ボード</h2>
          </div>
        </div>

        <button
          onClick={handleTriggerAiOptimization}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <Sparkles className="w-4 h-4" />
          フィードバックをAIインペクの練習計画に反映・自動再調整
        </button>
      </div>

      {/* 新規フィードバック投稿フォーム */}
      <form onSubmit={handleAddFeedback} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
        <span className="font-bold text-slate-300 block mb-1">新規フィードバックを投稿</span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-slate-400 block mb-1">役職 / 権限</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as LeadershipRole)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="concertmaster">🎻 コンサートマスター</option>
              <option value="conductor">🎼 指揮者</option>
              <option value="instructor">🎺 パート指導者 / 講師</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">投稿者氏名</label>
            <input
              type="text"
              placeholder="例: 清水 裕子"
              value={newAuthorName}
              onChange={(e) => setNewAuthorName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">対象曲目 / 楽章</label>
            <input
              type="text"
              value={newPieceTitle}
              onChange={(e) => setNewPieceTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 block mb-1">改善カテゴリ</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="bowing">弦楽器ボウイング・アーティキュレーション</option>
              <option value="tempo">テンポキープ・アゴーギク</option>
              <option value="pitch">ピッチ・ハーモニー和声</option>
              <option value="balance">音量バランス・ソロ伴奏</option>
              <option value="other">その他全体指示</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">優先度</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="high">🔴 緊急・次回練習で最優先</option>
              <option value="normal">🟡 重要・順次対応</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">具体指示・改善フィードバック内容</label>
          <textarea
            rows={2}
            placeholder="例: 第1楽章 P.I. の16分音符の縦のラインを揃えるため、弦楽器分奏で20分間ボウイングを合わせたい"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition"
          >
            <Send className="w-3.5 h-3.5" />
            フィードバックを投稿する
          </button>
        </div>
      </form>

      {/* 投稿済みフィードバック一覧 */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-300 block">投稿された指導フィードバック一覧 ({feedbacks.length}件):</span>

        {feedbacks.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2 relative transition hover:border-slate-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                    item.role === 'concertmaster'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : item.role === 'conductor'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {item.authorName}
                </span>

                {item.priority === 'high' && (
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                    🔴 最優先
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400 font-mono">{item.createdAt}</span>
                {item.isAppliedToAiPlan && (
                  <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> AI計画に反映済
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs">
              <span className="text-slate-400 font-semibold">【{item.pieceTitle}】</span>
              <span className="text-blue-400 ml-2 font-medium">[{item.categoryLabel}]</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
