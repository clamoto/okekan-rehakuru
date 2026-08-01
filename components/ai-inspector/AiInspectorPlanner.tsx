'use client';

import { useState } from 'react';
import { Bot, Sparkles, Calendar, Clock, AlertTriangle, CheckCircle2, Music, Layers, ArrowRight, UserPlus, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { FeedbackItem } from '@/components/feedback/FeedbackBoard';

export interface RehearsalPlanItem {
  sessionNumber: number;
  dateStr: string;
  focusTitle: string;
  timeTable: {
    time: string;
    activity: string;
    targetPart: string;
    notes: string;
  }[];
  aiAdvice: string;
  hasExtraNeed?: boolean;
  extraPart?: string;
  appliedFeedbacks?: string[];
}

interface AiInspectorPlannerProps {
  feedbacksToApply?: FeedbackItem[];
}

export default function AiInspectorPlanner({
  feedbacksToApply = [],
}: AiInspectorPlannerProps) {
  const [concertDate, setConcertDate] = useState<string>('2026-09-13');
  const [concertTitle, setConcertTitle] = useState<string>('第20回定期演奏会');
  const [rehearsalCount, setRehearsalCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<RehearsalPlanItem[] | null>(null);

  const handleGeneratePlan = (withFeedback: boolean = false) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      if (withFeedback || feedbacksToApply.length > 0) {
        // フィードバック反映済みの自動再最適化プラン
        setGeneratedPlan([
          {
            sessionNumber: 1,
            dateStr: '2026年7月12日 (日)',
            focusTitle: '第1回合奏：チャイコフスキー5番 第1・2楽章 読み合わせ ＆ 分奏',
            timeTable: [
              { time: '13:00 - 14:15', activity: '木管・金管セクション分奏 (テンポ決め)', targetPart: '管打楽器', notes: '第1楽章 P.I. テンポ変化の確認' },
              { time: '13:00 - 14:15', activity: '弦楽器パート練習 (ボウイング合わせ)', targetPart: '弦楽器', notes: 'コンマス清水氏主導' },
              { time: '14:30 - 17:00', activity: '全合奏：交響曲第5番 第1・2楽章', targetPart: '全員', notes: '第2楽章 Horn ソロテンポ感共有' },
            ],
            aiAdvice: '🤖 AIインペク助言: 初回は音合わせと難所のテンポ感共有を最優先に設定しました。',
          },
          {
            sessionNumber: 2,
            dateStr: '2026年7月26日 (日)',
            focusTitle: '第2回合奏：【指導フィードバック反映】ボウイング＆テンポ集中補強',
            timeTable: [
              { time: '13:00 - 13:20', activity: '🎻 コンマス指示：16分音符ボウイング合わせ (P.I.直前)', targetPart: '弦楽器全般', notes: '清水コンマスからのFB反映：1st/2ndのスタッカート返し弓統一' },
              { time: '13:20 - 13:40', activity: '🎼 指揮者指示：第4楽章 Presto テンポキープ合奏', targetPart: '全合奏 (金管重視)', notes: '山田指揮者からのFB反映：メトロノーム合わせた走り防止トレーニング' },
              { time: '13:40 - 15:00', activity: '全合奏：交響曲第5番 第4楽章 コーダ', targetPart: '全員', notes: 'Presto 部分のアンサンブル完成' },
              { time: '15:10 - 17:00', activity: '全合奏：ブラームス 大学式典序曲', targetPart: '全員', notes: 'ファンファーレ音量バランス調整' },
            ],
            aiAdvice: '✨ AIインペク自動調整: コンマス（ボウイング統一）および指揮者（Prestoテンポ走り防止）の緊急フィードバックを考慮し、第2回合奏の冒頭40分に専用補強コマを自動挿入しました！',
            appliedFeedbacks: [
              'コンマス清水氏：16分音符返し弓統一コマ (20分)',
              '指揮者山田氏：第4楽章 Presto 走り防止メトロノームコマ (20分)',
            ],
          },
          {
            sessionNumber: 3,
            dateStr: '2026年8月8日 (土)',
            focusTitle: '第3回合奏：モーツァルト協奏曲 ＆ 交響曲全曲通し',
            timeTable: [
              { time: '13:00 - 14:15', activity: '🎺 指導者指示：モーツァルト伴奏弦楽器の pp ニュアンス調整', targetPart: '弦・フルート', notes: '佐藤先生からのFB反映：ソロフルート消し防止の音量バランス調整' },
              { time: '14:30 - 17:00', activity: '交響曲第5番 全曲通し (Ob.2 エキストラ参加)', targetPart: '全員', notes: 'リハクル手配のエキストラ高橋氏合流' },
            ],
            aiAdvice: '⚠️ AIインペク注意: この日はOb.2団員欠席のため、リハクル手配のエキストラ奏者が参加します。冒頭にパート指導者からのソロ音量バランス改善コマを組み込みました。',
            hasExtraNeed: true,
            extraPart: 'Oboe 2',
            appliedFeedbacks: ['指導者佐藤先生：モーツァルト伴奏 pp ニュアンス調整コマ'],
          },
          {
            sessionNumber: 4,
            dateStr: '2026年8月22日 (土)',
            focusTitle: '第4回合奏：全曲バランス調整 ＆ 録音チェック',
            timeTable: [
              { time: '18:00 - 21:00', activity: '全曲 止まらず通しリハーサル ＆ 録音', targetPart: '全員', notes: 'オケカン録音機能で録音作成' },
            ],
            aiAdvice: '🤖 AIインペク助言: 本番3週間前のため、全曲を通した録音を取り、復習用アーカイブを団員に共有しましょう。',
          },
          {
            sessionNumber: 5,
            dateStr: '2026年9月13日 (日)',
            focusTitle: '本番当日のゲネプロ (GP) ＆ 最終調整',
            timeTable: [
              { time: '10:30 - 12:30', activity: 'ホールGP (曲順通りランスルー)', targetPart: '全員', notes: 'ホール響き確認' },
              { time: '14:00 - 16:15', activity: '演奏会本番', targetPart: '全員', notes: '開演' },
            ],
            aiAdvice: '🎉 AIインペク助言: フィードバックがすべて反映された完璧なマスタープランです！自信を持って演奏会に臨みましょう。',
          },
        ]);
      } else {
        // 標準基本プラン
        setGeneratedPlan([
          {
            sessionNumber: 1,
            dateStr: '2026年7月12日 (日)',
            focusTitle: '第1回合奏：チャイコフスキー5番 第1・2楽章 読み合わせ ＆ 分奏',
            timeTable: [
              { time: '13:00 - 14:15', activity: '木管・金管セクション分奏 (テンポ決め)', targetPart: '管打楽器', notes: '第1楽章 P.I. テンポ変化の確認' },
              { time: '13:00 - 14:15', activity: '弦楽器パート練習 (ボウイング合わせ)', targetPart: '弦楽器', notes: 'コンマス清水氏主導' },
              { time: '14:30 - 17:00', activity: '全合奏：交響曲第5番 第1・2楽章', targetPart: '全員', notes: '第2楽章 Horn ソロテンポ感共有' },
            ],
            aiAdvice: '🤖 AIインペク助言: 初回は音合わせと難所のテンポ感共有を最優先に設定しました。',
          },
          {
            sessionNumber: 2,
            dateStr: '2026年7月26日 (日)',
            focusTitle: '第2回合奏：第3・4楽章 コーダ攻略 ＆ ブラームス序曲',
            timeTable: [
              { time: '13:00 - 14:30', activity: '全合奏：ブラームス 大学式典序曲', targetPart: '全員', notes: '金管ファンファーレ合わせ' },
              { time: '14:40 - 17:00', activity: '全合奏：交響曲第5番 第4楽章 コーダ', targetPart: '全員', notes: 'Presto 部分のアンサンブル強化' },
            ],
            aiAdvice: '🤖 AIインペク助言: 第4楽章コーダは事故が起こりやすいため、早めのコマ確保を行いました。',
          },
          {
            sessionNumber: 3,
            dateStr: '2026年8月8日 (土)',
            focusTitle: '第3回合奏：モーツァルト協奏曲 ＆ 交響曲全曲通し',
            timeTable: [
              { time: '13:00 - 14:30', activity: 'モーツァルト フルート協奏曲 ソロ合わせ', targetPart: 'Fl, 弦小編成', notes: 'ソリスト来訪' },
              { time: '14:40 - 17:00', activity: '交響曲第5番 全曲通し (Ob.2 エキストラ参加)', targetPart: '全員', notes: 'リハクル手配のエキストラ高橋氏合流' },
            ],
            aiAdvice: '⚠️ AIインペク注意: この日はOb.2団員欠席のため、リハクル手配のエキストラ奏者が参加します。',
            hasExtraNeed: true,
            extraPart: 'Oboe 2',
          },
          {
            sessionNumber: 4,
            dateStr: '2026年8月22日 (土)',
            focusTitle: '第4回合奏：全曲バランス調整 ＆ 録音チェック',
            timeTable: [
              { time: '18:00 - 21:00', activity: '全曲 止まらず通しリハーサル ＆ 録音', targetPart: '全員', notes: 'オケカン録音機能で録音作成' },
            ],
            aiAdvice: '🤖 AIインペク助言: 本番3週間前のため、全曲を通した録音を取り、復習用アーカイブを団員に共有しましょう。',
          },
          {
            sessionNumber: 5,
            dateStr: '2026年9月13日 (日)',
            focusTitle: '本番当日のゲネプロ (GP) ＆ 最終調整',
            timeTable: [
              { time: '10:30 - 12:30', activity: 'ホールGP (曲順通りランスルー)', targetPart: '全員', notes: 'ホール響き確認' },
              { time: '14:00 - 16:15', activity: '演奏会本番', targetPart: '全員', notes: '開演' },
            ],
            aiAdvice: '🎉 AIインペク助言: 完璧な計画です！全力を尽くして素晴らしい演奏会にしましょう。',
          },
        ]);
      }
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl border border-blue-200">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-0.5 rounded-full mb-1 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" /> AIインスペクター (AIインペク)
            </div>
            <h2 className="text-xl font-bold text-slate-900">練習スケジュール・コマ割り 自動立案エージェント</h2>
          </div>
        </div>

        <div className="text-xs text-slate-600 max-w-xs leading-relaxed">
          指導陣（コンマス・指揮者・講師）のフィードバックを取り込み、練習計画をリアルタイムで再最適化します。
        </div>
      </div>

      {/* 条件設定フォーム */}
      <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-700" />
          演奏会パラメータ ＆ 条件入力
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">演奏会名</label>
            <input
              type="text"
              value={concertTitle}
              onChange={(e) => setConcertTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold">本番年月日</label>
            <input
              type="date"
              value={concertDate}
              onChange={(e) => setConcertDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold">確保可能な練習回数</label>
            <select
              value={rehearsalCount}
              onChange={(e) => setRehearsalCount(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
            >
              <option value={4}>4 回 (直前集中)</option>
              <option value={5}>5 回 (標準)</option>
              <option value={6}>6 回 (じっくり強化)</option>
            </select>
          </div>
        </div>

        {/* AI生成実行ボタン群 */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => handleGeneratePlan(false)}
            disabled={isGenerating}
            className="flex-1 w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition border border-slate-300"
          >
            <Sparkles className="w-4 h-4 text-blue-700" />
            基本スケジュールを自動立案
          </button>

          <button
            onClick={() => handleGeneratePlan(true)}
            disabled={isGenerating}
            className="flex-1 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Bot className="w-4 h-4 animate-spin" />
                AIインペクが指導陣フィードバックを再計算中...
              </span>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 text-white/90" />
                指導陣フィードバックを反映してAI再計算・最適化
              </>
            )}
          </button>
        </div>
      </div>

      {/* 生成されたAIインペク練習計画ロードマップ */}
      {generatedPlan && (
        <div className="space-y-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              AIインペク提案：{concertTitle} マスター練習ロードマップ ({generatedPlan.length}回)
            </h3>

            <button
              onClick={() => alert('オケカンのスケジュールデータベースに一括反映しました！')}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              この計画を「オケカン」の日程に反映する
            </button>
          </div>

          <div className="space-y-4">
            {generatedPlan.map((plan) => (
              <div
                key={plan.sessionNumber}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-inner space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      #{plan.sessionNumber}
                    </span>
                    <div>
                      <span className="text-xs font-mono text-blue-700 font-bold">{plan.dateStr}</span>
                      <h4 className="text-sm font-bold text-slate-900">{plan.focusTitle}</h4>
                    </div>
                  </div>

                  {plan.hasExtraNeed && (
                    <Link
                      href={`/rehakuru?part=${encodeURIComponent(plan.extraPart || '')}`}
                      className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-xs font-bold transition w-fit"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {plan.extraPart} エキストラ要手配 (リハクルへ)
                    </Link>
                  )}
                </div>

                {/* 反映された指導指示ハイライト */}
                {plan.appliedFeedbacks && plan.appliedFeedbacks.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-purple-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> 指導陣フィードバック自動反映項目:
                    </span>
                    <ul className="list-disc list-inside text-slate-700 text-[11px]">
                      {plan.appliedFeedbacks.map((fb, idx) => (
                        <li key={idx}>{fb}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* コマ割りタイムテーブル */}
                <div className="space-y-2 text-xs">
                  {plan.timeTable.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        slot.activity.includes('指示')
                          ? 'bg-purple-50/50 border-purple-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-600 font-bold w-24 shrink-0">{slot.time}</span>
                        <div>
                          <span className="font-bold text-slate-800">{slot.activity}</span>
                          <p className="text-[11px] text-slate-600">{slot.notes}</p>
                        </div>
                      </div>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded w-fit">
                        対象: {slot.targetPart}
                      </span>
                    </div>
                  ))}
                </div>

                {/* AIインペクのアドバイス */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                  <Bot className="w-4 h-4 shrink-0 text-blue-700 mt-0.5" />
                  <span>{plan.aiAdvice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
