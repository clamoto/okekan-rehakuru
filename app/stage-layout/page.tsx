import Header from '@/components/navigation/Header';
import StageLayoutCalculator from '@/components/stage/StageLayoutCalculator';
import TimelineGenerator from '@/components/stage/TimelineGenerator';

export default function StageLayoutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        <div>
          <h1 className="text-2xl font-black text-white">実行委員サポート ＆ 舞台・進行管理</h1>
          <p className="text-xs text-slate-400 mt-1">
            出欠人数に基づく舞台ひな壇・椅子・譜面台の自動計算と当日の進行タイムスケジュールの自動生成
          </p>
        </div>

        {/* ひな壇・舞台配置計算機 */}
        <section>
          <StageLayoutCalculator />
        </section>

        {/* タイムスケジュール自動生成 */}
        <section>
          <TimelineGenerator />
        </section>
      </main>
    </div>
  );
}
