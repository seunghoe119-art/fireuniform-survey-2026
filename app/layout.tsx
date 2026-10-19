import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "피복 구매 가능 품목 조회",
  description: "2026년 상반기 피복 구매 가능 금액과 품목을 조회합니다.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}

