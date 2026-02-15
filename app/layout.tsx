import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DJ-ADB | 同人コミック・CGデータベース",
    template: "%s | DJ-ADB",
  },
  description:
    "同人コミック・CGの最新ランキング、セール情報、おすすめ作品を毎日更新。FANZAの人気作品をチェック！",
  keywords: ["同人", "コミック", "CG", "FANZA", "セール", "ランキング"],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "DJ-ADB",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <head>
        {/* テーマ初期化（FOUC防止） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <MobileNav />
        {/* モバイルナビの高さ分の余白 */}
        <div className="h-14 md:hidden" />
      </body>
    </html>
  );
}
