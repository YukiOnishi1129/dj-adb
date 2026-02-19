"use client";

import { Suspense, useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronDown, Check, X, JapaneseYen, Loader2 } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDiscount } from "@/lib/utils";
import { getUnitPrice } from "@/lib/search";
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {displayResults.slice(0, displayCount).map((item) => {
              const unitPrice = getUnitPrice(item);
              const hasRating = item.rt && item.rt > 0;
              const hasSaleEnd = item.dr && item.dr > 0 && item.saleEnd;

              return (
                <Link key={item.id} href={`/works/${item.id}`}>
                  <Card className="group h-full overflow-hidden transition-colors hover:border-accent">
                    {/* サムネイル */}
                    <div className="relative">
                      <img
                        src={item.img || "https://placehold.co/600x400/f4f4f5/71717a?text=No+Image"}
                        alt={item.t}
                        className="aspect-[4/3] w-full object-cover"
                        loading="lazy"
                      />
                      {item.dr && item.dr > 0 && (
                        <Badge variant="sale" className="absolute left-2 top-2">
                          {formatDiscount(item.dr)}
                        </Badge>
                      )}
                      {item.rk && item.rk <= 100 && (
                        <div
                          className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-xs font-bold text-white ${
                            item.rk === 1
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : item.rk === 2
                                ? "bg-gradient-to-r from-gray-300 to-gray-500"
                                : item.rk === 3
                                  ? "bg-gradient-to-r from-amber-600 to-amber-800"
                                  : "bg-black/70"
                          }`}
                        >
                          #{item.rk}
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3">
                      {/* タイトル */}
                      <h3 className="mb-1 line-clamp-2 text-sm font-medium text-foreground group-hover:text-accent">
                        {item.t}
                      </h3>

                      {/* サークル名 */}
                      <p className="mb-2 text-xs text-muted-foreground">{item.a || item.c}</p>

                      {/* ページ数 */}
                      {item.pg > 0 && (
                        <div className="mb-2 text-xs text-muted-foreground">
                          <span>{item.pg}ページ</span>
                        </div>
                      )}

                      {/* 価格 + セール残り時間 */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-foreground">
                            ¥{item.p.toLocaleString()}
                          </span>
                          {unitPrice && (
                            <span className="text-[10px] font-medium text-primary">
                              ({unitPrice})
                            </span>
                          )}
                        </div>
                        {hasSaleEnd && (
                          <span className="text-[10px] font-medium text-orange-500">
                            {getTimeRemaining(item.saleEnd!)}
                          </span>
                        )}
                      </div>
                      {item.dr && item.dr > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          ¥{item.dp.toLocaleString()}
                        </span>
                      )}

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
                          {item.rc && item.rc > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({item.rc})
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
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
