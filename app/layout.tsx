import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'オケカン / リハクル - オーケストラ・吹奏楽団向けグループウェア＆エキストラマッチング',
  description: '団員の出欠確認、楽譜・録音共有、舞台配置自動計算からエキストラ奏者の代理決済・仮払いマッチングまで',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
