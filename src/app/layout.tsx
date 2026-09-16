import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Sky-Blog 客户端',
  description: 'Sky-Blog Desktop Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased h-screen w-screen overflow-hidden bg-[#f3f4f6]">
        {children}
      </body>
    </html>
  );
}
