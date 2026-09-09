import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sky-Blog',
  description: 'Sky-Blog 跨平台客户端',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased overflow-hidden">{children}</body>
    </html>
  );
}