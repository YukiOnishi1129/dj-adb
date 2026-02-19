"use client";

import { Suspense, useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronDown, Check, X, JapaneseYen, Loader2 } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDiscount } from "@/lib/utils";
import type { SortType, PriceFilter } from "@/lib/search";

function getTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "終了";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `残り${days}日`;
  return `残り${hours}時間`;
}

// モバイル判定用
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

function SearchContentInner() {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const {
    results,
    isLoading,
    query,
    setQuery,
    sortType,
    setSortType,
    onSaleOnly,
    setOnSaleOnly,
    maxPrice,
    setMaxPrice,
    resultCount,
  } = useSearch();

  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const loadMoreCount = isMobile ? 20 : 50;
  const initialCount = isMobile ? 20 : 50;
  const [displayCount, setDisplayCount] = useState(50);
  const [prevResultCount, setPrevResultCount] = useState(resultCount);

  // 検索結果が変わったらリセット
  if (resultCount !== prevResultCount) {
    setPrevResultCount(resultCount);
    setDisplayCount(initialCount);
  }

  // URLパラメータから初期値を取得
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
    }

    const sortParam = searchParams.get("sort");
    if (
      sortParam === "rank" ||
      sortParam === "new" ||
      sortParam === "discount" ||
      sortParam === "price" ||
      sortParam === "rating"
    ) {
      setSortType(sortParam);
    }

    const maxParam = searchParams.get("max");
    if (
      maxParam === "500" ||
      maxParam === "1000" ||
      maxParam === "1500" ||
      maxParam === "2000"
    ) {
      setMaxPrice(maxParam);
    }
  }, [searchParams, setQuery, setSortType, setMaxPrice]);

  const MAX_DISPLAY_RESULTS = 300;
  const displayResults = results.slice(0, MAX_DISPLAY_RESULTS);
  const hasMoreResults = results.length > MAX_DISPLAY_RESULTS;

  const sortOptions: { value: SortType; label: string }[] = [
    { value: "rank", label: "ランキング順" },
    { value: "new", label: "新着順" },
    { value: "rating", label: "評価順" },
    { value: "discount", label: "割引率順" },
    { value: "price", label: "価格が安い順" },
  ];

  const priceOptions: { value: PriceFilter; label: string }[] = [
    { value: "all", label: "指定なし" },
    { value: "500", label: "〜500円" },
    { value: "1000", label: "〜1,000円" },
    { value: "1500", label: "〜1,500円" },
    { value: "2000", label: "〜2,000円" },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortType)?.label || "ランキング順";
  const currentPriceLabel =
    priceOptions.find((opt) => opt.value === maxPrice)?.label || "指定なし";

  return (
    <>
      {/* 検索フォーム */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="タイトル、作者、サークル、タグで検索..."
            className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* フィルター・ソート */}
      <div className="mb-4 space-y-3">
        {/* セール中トグル + 価格 + ソート */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* セール中のみ - トグルスイッチ */}
            <label className="flex cursor-pointer items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                セール中
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={onSaleOnly}
                onClick={() => setOnSaleOnly(!onSaleOnly)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  onSaleOnly ? "bg-sale" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    onSaleOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>

            {/* 価格フィルター */}
            <button
              type="button"
              onClick={() => setIsPriceModalOpen(true)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                maxPrice !== "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <JapaneseYen className="h-3 w-3" />
              <span>{maxPrice === "all" ? "価格" : currentPriceLabel}</span>
            </button>
          </div>

          {/* ソート */}
          <button
            type="button"
            onClick={() => setIsSortModalOpen(true)}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
          >
            <span>{currentSortLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* 検索結果件数 */}
      <p className="mb-3 text-xs text-muted-foreground">
        {query ? `「${query}」` : ""}
        {resultCount}件
        {maxPrice !== "all" && (
          <span className="ml-1">（{currentPriceLabel}）</span>
        )}
      </p>

      {/* 検索結果 */}
      {isLoading ? (
        <p className="text-muted-foreground">読み込み中...</p>
      ) : displayResults.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {displayResults.slice(0, displayCount).map((item) => {
              const isOnSale = item.dr !== null && item.dr > 0;
              const hasRating = item.rt && item.rt > 0;

              return (
                <Link key={item.id} href={`/works/${item.id}`}>
                  <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                    {/* サムネイル */}
                    <div className="relative overflow-hidden bg-muted">
                      <img
                        src={item.img || "https://placehold.co/300x400/f4f4f5/71717a?text=No+Image"}
                        alt={item.t}
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* ランキングバッジ */}
                      {item.rk && item.rk <= 100 && (
                        <div
                          className={`absolute -left-1 -top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full font-bold shadow-lg ${
                            item.rk === 1
                              ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-amber-900"
                              : item.rk === 2
                                ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-gray-800"
                                : item.rk === 3
                                  ? "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 text-orange-900"
                                  : "bg-pink-500 text-white"
                          }`}
                        >
                          {item.rk}
                        </div>
                      )}
                      {/* セールバッジ */}
                      {isOnSale && (
                        <Badge
                          variant="sale"
                          className={`absolute ${item.rk && item.rk <= 100 ? "top-2 right-2" : "top-2 left-2"}`}
                        >
                          {formatDiscount(item.dr!)}
                        </Badge>
                      )}
                      {/* 高評価バッジ */}
                      {item.rt && item.rt >= 4.5 && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          ★ 高評価
                        </div>
                      )}
                      {/* ページ数バッジ */}
                      {item.pg > 0 && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                          {item.pg}P
                        </div>
                      )}
                    </div>

                    {/* 情報エリア */}
                    <div className="p-3">
                      {/* サークル名 */}
                      <div className="mb-1.5">
                        <Badge variant="circle" className="text-[10px]">
                          {item.c}
                        </Badge>
                      </div>

                      {/* タイトル */}
                      <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-tight text-foreground">
                        {item.t}
                      </h3>

                      {/* ジャンルタグ */}
                      {item.tg && item.tg.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {item.tg.slice(0, 2).map((tag) => (
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
                            ¥{item.dp.toLocaleString()}
                          </span>
                        )}
                        <span
                          className={`text-base font-bold ${isOnSale ? "text-red-500" : "text-foreground"}`}
                        >
                          ¥{item.p.toLocaleString()}
                        </span>
                        {isOnSale && item.saleEnd && (
                          <span className="text-[10px] text-orange-500 font-medium">
                            ({getTimeRemaining(item.saleEnd)})
                          </span>
                        )}
                      </div>

                      {/* 評価 */}
                      {hasRating && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const filled = star <= Math.round(item.rt!);
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
                            {item.rt!.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
          {displayCount < displayResults.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(() => {
                    setDisplayCount((prev) =>
                      Math.min(prev + loadMoreCount, displayResults.length)
                    );
                  });
                }}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {isPending
                  ? "読み込み中..."
                  : `もっと見る（残り${displayResults.length - displayCount}件）`}
              </button>
            </div>
          )}
          {hasMoreResults && displayCount >= displayResults.length && (
            <div className="mt-4 rounded-lg bg-amber-500/10 p-4 text-center">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                表示上限（{MAX_DISPLAY_RESULTS}件）に達しました。検索条件を絞り込んでください。
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {query
              ? `「${query}」に一致する作品が見つかりませんでした`
              : "検索条件に一致する作品がありません"}
          </p>
        </div>
      )}

      {/* ソートモーダル */}
      {isSortModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setIsSortModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-background p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">並び替え</h2>
              <button
                type="button"
                onClick={() => setIsSortModalOpen(false)}
                className="rounded-full p-2 hover:bg-secondary"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortType(opt.value);
                    setIsSortModalOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                    sortType === opt.value
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary"
                  }`}
                >
                  <span className="text-base">{opt.label}</span>
                  {sortType === opt.value && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 価格フィルターモーダル */}
      {isPriceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setIsPriceModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-background p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                価格で絞り込み
              </h2>
              <button
                type="button"
                onClick={() => setIsPriceModalOpen(false)}
                className="rounded-full p-2 hover:bg-secondary"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-1">
              {priceOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setMaxPrice(opt.value);
                    setIsPriceModalOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                    maxPrice === opt.value
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "hover:bg-secondary"
                  }`}
                >
                  <span className="text-base">{opt.label}</span>
                  {maxPrice === opt.value && (
                    <Check className="h-5 w-5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SearchContent() {
  return (
    <Suspense
      fallback={<p className="text-muted-foreground">読み込み中...</p>}
    >
      <SearchContentInner />
    </Suspense>
  );
}
