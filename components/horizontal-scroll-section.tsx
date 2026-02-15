"use client";

import type { Work } from "@/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface HorizontalScrollSectionProps {
  title: string;
  subtitle?: string;
  href: string;
  works: Work[];
  showRankBadge?: boolean;
  rankBadgeColor?: "gold" | "purple" | "orange" | "pink" | "emerald";
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function getRankBadgeStyles(rank: number, color: string) {
  if (rank === 1) {
    return {
      bg: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600",
      text: "text-amber-900",
      size: "h-10 w-10 text-lg",
      shadow: "shadow-lg shadow-yellow-500/50",
    };
  }
  if (rank === 2) {
    return {
      bg: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
      text: "text-gray-800",
      size: "h-9 w-9 text-base",
      shadow: "shadow-lg shadow-gray-400/50",
    };
  }
  if (rank === 3) {
    return {
      bg: "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700",
      text: "text-orange-900",
      size: "h-9 w-9 text-base",
      shadow: "shadow-lg shadow-orange-500/50",
    };
  }

  const colorMap: Record<string, string> = {
    gold: "bg-amber-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    emerald: "bg-emerald-500",
  };

  return {
    bg: colorMap[color] || "bg-gray-500",
    text: "text-white",
    size: "h-7 w-7 text-sm",
    shadow: "",
  };
}

export function HorizontalScrollSection({
  title,
  subtitle,
  href,
  works,
  showRankBadge = false,
  rankBadgeColor = "pink",
}: HorizontalScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (works.length === 0) return null;

  return (
    <section className="mb-4">
      {/* ヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent/80"
        >
          もっと見る
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 横スクロールエリア */}
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-6 flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory overscroll-x-contain"
      >
        {works.map((work, index) => {
          const isOnSale =
            work.sale_price !== null && work.sale_price < work.price;
          const rankStyles = showRankBadge
            ? getRankBadgeStyles(index + 1, rankBadgeColor)
            : null;

          return (
            <Link
              key={work.id}
              href={`/works/${work.id}`}
              className="flex-shrink-0 snap-start"
              style={{ width: index < 3 && showRankBadge ? "200px" : "180px" }}
            >
              <Card className="group h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                {/* サムネイル - 横長（画像全体表示） */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={
                      work.thumbnail_url ||
                      "https://placehold.co/300x400/f4f4f5/71717a?text=No+Image"
                    }
                    alt={work.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* ランキングバッジ */}
                  {showRankBadge && rankStyles && (
                    <div
                      className={`absolute -left-1 -top-1 z-10 flex items-center justify-center rounded-full font-bold ${rankStyles.bg} ${rankStyles.text} ${rankStyles.size} ${rankStyles.shadow}`}
                    >
                      {index + 1}
                    </div>
                  )}

                  {/* セールバッジ */}
                  {isOnSale && work.discount_rate > 0 && (
                    <Badge
                      variant="sale"
                      className={`absolute ${showRankBadge ? "top-2 right-2" : "top-2 left-2"} text-xs font-bold`}
                    >
                      {work.discount_rate}%OFF
                    </Badge>
                  )}

                  {/* ページ数バッジ */}
                  {work.page_count > 0 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                      <BookOpen className="h-3 w-3" />
                      {work.page_count}P
                    </div>
                  )}
                </div>

                {/* 情報エリア */}
                <div className="p-2.5">
                  {/* サークル名 */}
                  <div className="mb-1">
                    <Badge variant="circle" className="text-[9px] px-1.5 py-0">
                      {work.circle_name}
                    </Badge>
                  </div>

                  {/* タイトル */}
                  <h3 className="mb-1 line-clamp-2 text-xs font-medium leading-tight text-foreground">
                    {work.title}
                  </h3>

                  {/* 価格エリア */}
                  <div className="flex items-baseline gap-1.5">
                    {isOnSale && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        {formatPrice(work.price)}
                      </span>
                    )}
                    <span
                      className={`text-sm font-bold ${isOnSale ? "text-red-500" : "text-foreground"}`}
                    >
                      {formatPrice(isOnSale ? work.sale_price! : work.price)}
                    </span>
                  </div>

                  {/* 評価 */}
                  {work.rating > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const filled = star <= Math.round(work.rating);
                          return (
                            <svg
                              key={star}
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                            >
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                fill={filled ? "#f59e0b" : "#e5e7eb"}
                                stroke="#ea580c"
                                strokeWidth="0.5"
                              />
                            </svg>
                          );
                        })}
                      </div>
                      <span className="text-[9px] font-bold text-orange-500">
                        {work.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}

        {/* もっと見るカード */}
        <Link
          href={href}
          className="flex-shrink-0 snap-start"
          style={{ width: "120px" }}
        >
          <Card className="flex h-full items-center justify-center bg-secondary/50 transition-all duration-200 hover:bg-secondary hover:shadow-lg">
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ChevronRight className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                もっと見る
              </span>
            </div>
          </Card>
        </Link>
      </div>
    </section>
  );
}
