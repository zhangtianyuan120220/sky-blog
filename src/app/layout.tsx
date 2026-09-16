import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Sky-Blog',
  description: 'Sky-Blog Desktop Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
