"use client";

import { Suspense, useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronDown, Check, X, JapaneseYen, Loader2 } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatRating, formatDiscount } from "@/lib/utils";
import type { SortType, PriceFilter } from "@/lib/search";

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
            {displayResults.slice(0, displayCount).map((item) => (
              <Link
                key={item.id}
                href={`/works/${item.id}`}
                className="group block overflow-hidden rounded-lg bg-card transition-all hover:ring-2 hover:ring-accent"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={
                      item.img ||
                      "https://placehold.co/300x400/f4f4f5/71717a?text=No+Image"
                    }
                    alt={item.t}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Rank badge */}
                  {item.rk && item.rk <= 100 && (
                    <div
                      className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-xs font-bold text-white ${
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
                  {/* Sale badge */}
                  {item.dr && item.dr > 0 && (
                    <Badge variant="sale" className="absolute right-1 top-1 text-xs">
                      {formatDiscount(item.dr)}
                    </Badge>
                  )}
                </div>
                {/* Info */}
                <div className="p-2">
                  <h3 className="line-clamp-2 text-xs font-medium text-foreground">
                    {item.t}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {item.a || item.c}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(item.p)}
                    </span>
                    {item.rt && (
                      <span className="text-xs text-orange-500">
                        ★{formatRating(item.rt)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
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
