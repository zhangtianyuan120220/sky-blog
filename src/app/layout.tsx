// src/app/layout.tsx
import './globals.css'; // 必须引入这一行！

export const metadata = {
  title: 'Sky-Blog',
  description: 'Sky-Blog Desktop Client',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
