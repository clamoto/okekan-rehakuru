import Link from 'next/link';
import Header from '@/components/navigation/Header';
import ScheduleTabsContainer from '@/components/schedules/ScheduleTabsContainer';
import { ArrowLeft } from 'lucide-react';

interface ScheduleDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return [
    { id: 'sch-1' },
    { id: 'sch-2' },
    { id: 'sch-3' },
  ];
}

export default function ScheduleDetailPage({ params }: ScheduleDetailPageProps) {
  const scheduleId = params.id;

  // 各スケジュール詳細のリッチなモックデータ
  const schedulesData: Record<string, any> = {
    'sch-1': {
      id: 'sch-1',
      title: '第20回定期演奏会 第4回全合奏',
      eventType: 'practice',
      eventTypeLabel: '全体合奏',
      dateStr: '2026年8月8日 (土) 13:00 - 17:00 (受付開始 12:30)',
      location: '目黒区民キャンパス パーシモンホール 練習室1 (東京都目黒区八雲1-1-1)',
      conductor: '山田 太郎 先生',
      pieces: [
        'P.I. チャイコフスキー / 交響曲第5番 ホ短調 Op.64',
        'J. ブラームス / 大学式典序曲 Op.80',
      ],
      notes: '当日は12:45より全員で大型楽器（Timp, CB）の打音出しとひな壇設営を行います。遅刻される方は事前に理由をコメント欄に記入してください。',
    },
    'sch-2': {
      id: 'sch-2',
      title: '第20回定期演奏会 木管・金管分奏',
      eventType: 'section_practice',
      eventTypeLabel: 'セクション分奏',
      dateStr: '2026年8月22日 (土) 18:00 - 21:00 (受付開始 17:30)',
      location: '大田区民プラザ スタジオA (東京都大田区下丸子3-1-3)',
      conductor: 'パートリーダー各氏',
      pieces: [
        'P.I. チャイコフスキー / 交響曲第5番 ホ短調 Op.64 (第2楽章・第4楽章の難所)',
      ],
      notes: '管楽器のみの分奏練習です。弦楽器は参加不要です。息使い、ピッチ調整、ハーモニーを重点的に合わせます。',
    },
    'sch-3': {
      id: 'sch-3',
      title: '第20回定期演奏会 GP (ゲネプロ) ＆ 本番',
      eventType: 'performance',
      eventTypeLabel: '演奏会本番 🎺',
      dateStr: '2026年9月13日 (日) 09:00 - 18:00 (受付開始 09:00, 開演 14:00)',
      location: 'ミューザ川崎シンフォニーホール 大ホール (神奈川県川崎市幸区大宮町1310)',
      conductor: '山田 太郎 先生 (フルート独奏: 鈴木 華子 先生)',
      pieces: [
        'J. ブラームス / 大学式典序曲 Op.80',
        'W.A. モーツァルト / フルート協奏曲第1番 ト長調 K.313',
        'P.I. チャイコフスキー / 交響曲第5番 ホ短調 Op.64',
      ],
      notes: '記念すべき第20回定期演奏会の本番当日です！朝9:00までにホールの楽屋口に集合してください。当日タイムラインにて「舞台上」「受付周り」「演者」の連動スケジュールを確認できます。お忘れ物のないようお気をつけてお越しください。',
    },
  };

  const scheduleDetails = schedulesData[scheduleId] || schedulesData['sch-1'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/schedules"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            練習日程一覧へ戻る
          </Link>
        </div>

        {/* タブ切り替えコンテナ (出欠管理, 当日スケジュール, 楽譜・録音) */}
        <ScheduleTabsContainer 
          scheduleId={scheduleId} 
          scheduleDetails={scheduleDetails} 
        />
      </main>
    </div>
  );
}
