'use client';

import { useState } from 'react';
import Header from '@/components/navigation/Header';
import AiInspectorPlanner from '@/components/ai-inspector/AiInspectorPlanner';
import FeedbackBoard, { FeedbackItem } from '@/components/feedback/FeedbackBoard';

export default function AiInspectorPage() {
  const [activeFeedbacks, setActiveFeedbacks] = useState<FeedbackItem[]>([]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        <div>
          <h1 className="text-2xl font-black text-white">AIインペク (自律練習計画エージェント)</h1>
          <p className="text-xs text-slate-400 mt-1">
            本番までの練習回数・出欠脆弱性に加え、コンマス・指揮者・指導者からのフィードバックをAIが解析・自動反映
          </p>
        </div>

        {/* コンマス・指揮者・指導者フィードバック入力ボード */}
        <section>
          <FeedbackBoard
            onFeedbacksChange={(fbs) => setActiveFeedbacks(fbs)}
          />
        </section>

        {/* AIインペク練習計画立案 ＆ フィードバック自動再最適化 */}
        <section>
          <AiInspectorPlanner feedbacksToApply={activeFeedbacks} />
        </section>
      </main>
    </div>
  );
}
