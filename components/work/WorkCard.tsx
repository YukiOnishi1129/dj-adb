"use client";

import { memo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import type { Work } from "@/types";

interface WorkCardProps {
  work: Work;
  showRankBadge?: boolean;
  rank?: number;
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function getSaleRemainingText(saleEndDate: string | null): string | null {
  if (!saleEndDate) return null;

  const now = new Date();
  const end = new Date(saleEndDate);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return null;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `残り${diffDays}日`;
  } else if (diffHours > 0) {
    return `残り${diffHours}時間`;
  } else {
    return "まもなく終了";
  }
}

function getRankBadgeStyles(rank: number) {
  if (rank === 1) {
    return {
      bg: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600",
      text: "text-amber-900",
    };
  }
  if (rank === 2) {
    return {
      bg: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
      text: "text-gray-800",
    };
  }
  if (rank === 3) {
    return {
      bg: "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700",
      text: "text-orange-900",
    };
  }
  return {
    bg: "bg-pink-500",
    text: "text-white",
  };
}

export const WorkCard = memo(function WorkCard({
  work,
  showRankBadge = false,
  rank,
}: WorkCardProps) {
  const isOnSale = work.sale_price !== null && work.sale_price < work.price;
  const rankStyles = rank ? getRankBadgeStyles(rank) : null;

  return (
    <Link href={`/works/${work.id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
        {/* サムネイル */}
        <div className="relative overflow-hidden bg-muted">
          <img
            src={
              work.thumbnail_url ||
              "https://placehold.co/300x400/f4f4f5/71717a?text=No+Image"
            }
            alt={work.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/300x400/f4f4f5/71717a?text=No+Image";
            }}
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />

          {/* ランキングバッジ */}
          {showRankBadge && rank && rankStyles && (
            <div
              className={`absolute -left-1 -top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full font-bold ${rankStyles.bg} ${rankStyles.text} shadow-lg`}
            >
              {rank}
            </div>
          )}

          {/* セールバッジ */}
          {isOnSale && work.discount_rate > 0 && (
            <Badge
              variant="sale"
              className={`absolute ${showRankBadge ? "top-2 right-2" : "top-2 left-2"}`}
            >
              {work.discount_rate}%OFF
            </Badge>
          )}

          {/* 高評価バッジ */}
          {work.rating && work.rating >= 4.5 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
              ★ 高評価
            </div>
          )}

          {/* ページ数バッジ */}
          {work.page_count && work.page_count > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
              <BookOpen className="h-3 w-3" />
              {work.page_count}P
            </div>
          )}
        </div>

        {/* 情報エリア */}
        <div className="p-3">
          {/* サークル名 */}
          <div className="mb-1.5">
            <Badge variant="circle" className="text-[10px]">
              {work.circle_name}
            </Badge>
          </div>

          {/* タイトル */}
          <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-tight text-foreground">
            {work.title}
          </h3>

          {/* ジャンルタグ */}
          {work.genre_tags && work.genre_tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {work.genre_tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="tag" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 価格エリア */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {isOnSale && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(work.price)}
              </span>
            )}
            <span
              className={`text-base font-bold ${isOnSale ? "text-red-500" : "text-foreground"}`}
            >
              {formatPrice(isOnSale ? work.sale_price! : work.price)}
            </span>
            {isOnSale && work.sale_end_date && (
              <span className="text-[10px] text-orange-500 font-medium">
                ({getSaleRemainingText(work.sale_end_date)})
              </span>
            )}
          </div>

          {/* 評価 */}
          {work.rating && work.rating > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = star <= Math.round(work.rating ?? 0);
                  return (
                    <svg key={star} className="h-4 w-4" viewBox="0 0 20 20">
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
              <span className="text-xs font-bold text-orange-500">
                {(work.rating ?? 0).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
});
