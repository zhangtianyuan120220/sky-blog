import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sky-Blog 客户端',
  description: 'Sky-Blog Desktop Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 引入 KaTeX 官方 CDN 样式库 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
