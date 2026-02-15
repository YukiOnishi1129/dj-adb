import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的サイト生成
  output: "export",

  // 画像最適化（外部画像を許可）
  images: {
    unoptimized: true, // SSGでは必須
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.dmm.co.jp",
      },
      {
        protocol: "https",
        hostname: "*.dmm.com",
      },
    ],
  },

  // トレイリングスラッシュを追加
  trailingSlash: true,

  // Turbopack設定（Next.js 16ではデフォルト）
  turbopack: {},
};

export default nextConfig;
