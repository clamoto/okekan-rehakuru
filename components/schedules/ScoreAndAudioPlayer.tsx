'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Play,
  Pause,
  Bookmark,
  ExternalLink,
  Clock,
  Music2
} from 'lucide-react';

export interface ScoreItem {
  id: string;
  title: string;
  composer: string;
  partName: string;
  pdfUrl: string;
  fileSize: string;
}

export interface RecordingBookmark {
  timeInSeconds: number;
  label: string;
}

export interface RecordingItem {
  id: string;
  title: string;
  dateStr: string;
  conductor: string;
  durationStr: string;
  audioUrl: string;
  bookmarks: RecordingBookmark[];
}

interface ScoreAndAudioPlayerProps {
  scores?: ScoreItem[];
  recordings?: RecordingItem[];
}

const DEFAULT_SCORES: ScoreItem[] = [
  {
    id: 's1',
    title: '交響曲第5番 ホ短調 Op.64',
    composer: 'P.I. チャイコフスキー',
    partName: '全パートスコア (フルスコア)',
    pdfUrl: '#',
    fileSize: '14.2 MB',
  },
  {
    id: 's2',
    title: '交響曲第5番 (第1楽章/第2楽章)',
    composer: 'P.I. チャイコフスキー',
    partName: 'クラリネット (1&2 / A管・B♭管)',
    pdfUrl: '#',
    fileSize: '3.8 MB',
  },
  {
    id: 's3',
    title: '大学式典序曲 Op.80',
    composer: 'J. ブラームス',
    partName: '管打楽器 パート譜一式',
    pdfUrl: '#',
    fileSize: '8.5 MB',
  },
];

const DEFAULT_RECORDINGS: RecordingItem[] = [
  {
    id: 'r1',
    title: '2026/07/26 第3回 全合奏録音 (メイン・中通し)',
    dateStr: '2026年7月26日',
    conductor: '山田 太郎 指揮',
    durationStr: '48:15',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // デモ音源
    bookmarks: [
      { timeInSeconds: 0, label: '第1楽章 開始' },
      { timeInSeconds: 120, label: '練習番号 A (主題)' },
      { timeInSeconds: 340, label: '練習番号 C (Ob. ソロパート)' },
      { timeInSeconds: 610, label: '第2楽章 (Hr. ソロ)' },
    ],
  },
  {
    id: 'r2',
    title: '2026/07/12 第2回 木管・金管セクション練習',
    dateStr: '2026年7月12日',
    conductor: '佐藤 奏 先生',
    durationStr: '32:40',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    bookmarks: [
      { timeInSeconds: 0, label: 'チューニング' },
      { timeInSeconds: 180, label: 'ブラームス テンポあわせ' },
    ],
  },
];

export default function ScoreAndAudioPlayer({
  scores = DEFAULT_SCORES,
  recordings = DEFAULT_RECORDINGS,
}: ScoreAndAudioPlayerProps) {
  const [activeTab, setActiveTab] = useState<'scores' | 'recordings'>('recordings');
  const [currentRecording, setCurrentRecording] = useState<RecordingItem>(recordings[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [progressPercent, setProgressPercent] = useState<number>(30); // デモ用プログレス

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (percent: number) => {
    setProgressPercent(percent);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* タブ切替 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('recordings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'recordings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Music2 className="w-4 h-4" />
            合奏録音アーカイブ ({recordings.length})
          </button>

          <button
            onClick={() => setActiveTab('scores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'scores'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            楽譜PDF共有 ({scores.length})
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline font-medium">
          団員限定共有
        </span>
      </div>

      {/* 録音プレイヤー表示 */}
      {activeTab === 'recordings' && (
        <div className="space-y-6">
          {/* メインアクティブプレイヤー */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {currentRecording.dateStr} • {currentRecording.conductor}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{currentRecording.title}</h3>
              </div>

              {/* 再生速度調整ボタン */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-[11px] text-slate-500 font-medium mr-1">再生速度:</span>
                {[0.8, 0.9, 1.0, 1.2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                      playbackRate === rate
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* 再生コントロール ＆ プログレスバー */}
            <div className="space-y-3">
              <div
                className="w-full bg-slate-200 h-3 rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newPercent = (clickX / rect.width) * 100;
                  handleSeek(Math.min(100, Math.max(0, newPercent)));
                }}
              >
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-150 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border border-blue-600 rounded-full shadow-sm"></div>
                </div>
              </div>

              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>14:28</span>
                <span>{currentRecording.durationStr}</span>
              </div>

              {/* 再生/一時停止ボタン */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </div>
            </div>

            {/* 練習番号・タイムスタンプブックマーク */}
            {currentRecording.bookmarks.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  練習番号・チャプター目次:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentRecording.bookmarks.map((bm, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSeek((bm.timeInSeconds / 2800) * 100)}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                      <span>{bm.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 録音リスト */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">過去の合奏録音:</span>
            {recordings.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setCurrentRecording(rec)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  currentRecording.id === rec.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Music2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                    <span className="text-[11px] text-slate-500">{rec.dateStr} • {rec.conductor}</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500">{rec.durationStr}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 楽譜PDF表示 */}
      {activeTab === 'scores' && (
        <div className="space-y-3">
          {scores.map((score) => (
            <div
              key={score.id}
              className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
            >
              <div className="flex items-start gap-3">
                <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl border border-rose-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">{score.composer}</span>
                  <h4 className="text-sm font-bold text-slate-900">{score.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2 py-0.5 rounded font-bold">
                      {score.partName}
                    </span>
                    <span className="text-[11px] text-slate-500">{score.fileSize}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={score.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition border border-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  プレビュー
                </a>
                <a
                  href={score.pdfUrl}
                  download
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF保存
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
