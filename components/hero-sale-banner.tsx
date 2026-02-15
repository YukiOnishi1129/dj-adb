"use client";

import Link from "next/link";
import { Flame, ChevronRight } from "lucide-react";

interface HeroSaleBannerProps {
  maxDiscount: number;
  saleCount: number;
}

export function HeroSaleBanner({ maxDiscount, saleCount }: HeroSaleBannerProps) {
  if (saleCount === 0) return null;

  return (
    <section className="mb-4 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 px-4 py-3 text-white shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* 左側: セール情報 */}
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 shrink-0 animate-pulse text-yellow-300" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-black md:text-xl">
              最大<span className="mx-1 text-yellow-300">{maxDiscount}%</span>
              OFF
            </span>
            <span className="hidden text-sm text-white/80 sm:inline">
              · {saleCount}作品
            </span>
          </div>
        </div>

        {/* 右側: CTAボタン */}
        <Link
          href="/features/sale"
          className="flex shrink-0 items-center gap-0.5 rounded-lg bg-white px-2 py-1.5 text-sm font-bold text-rose-600 transition-colors hover:bg-white/90 sm:px-3"
        >
          <span className="hidden sm:inline">セールを見る</span>
          <span className="sm:hidden">見る</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
