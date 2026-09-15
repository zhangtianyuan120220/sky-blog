import "katex/dist/katex.min.css";
import "./globals.css";
import React from "react";

export const metadata = {
  title: "Sky-Blog",
  description: "Sky-Blog 客户端·动态社区",
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
