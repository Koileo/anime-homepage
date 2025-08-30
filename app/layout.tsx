import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koileo ✨ 小世界",
  description: "欢迎来到 Koileo 的个人主页，展示 GitHub 活跃度和 Codeforces 最新动态。",
  keywords: ["Koileo", "GitHub", "Codeforces", "Bilibili", "个人主页"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-cn">
      <body>{children}</body>
    </html>
  );
}
