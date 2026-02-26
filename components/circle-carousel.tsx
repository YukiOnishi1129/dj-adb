"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Users, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CircleFeature, GenreFeature } from "@/types";

// カルーセルに表示する統一型
export type FeatureCarouselItem =
  | { type: "circle"; feature: CircleFeature }
  | { type: "genre"; feature: GenreFeature };

interface CircleCarouselProps {
  features: CircleFeature[];
  autoPlay?: boolean;
  interval?: number;
}

export interface FeatureCarouselProps {
  items: FeatureCarouselItem[];
  autoPlay?: boolean;
  interval?: number;
}

// モバイル用カルーセルアイテム（サークル特集）
function CircleCarouselItemMobile({ feature }: { feature: CircleFeature }) {
  const circleName = feature.headline
    .replace(/の作品.*$/, "")
    .replace(/特集$/, "")
    .replace(/、全力で推せる！$/, "");

  return (
    <Link href={`/features/circle/${feature.slug}`}>
      <Card className="h-full overflow-hidden border border-pink-500/30 transition-all hover:border-pink-500/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          {feature.thumbnail_url ? (
            <img
              src={feature.thumbnail_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-pink-500/10">
              <Users className="h-8 w-8 text-pink-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          <div
            className="absolute left-2 top-2 rounded-md bg-pink-500 px-2.5 py-1 text-sm font-bold text-white"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
          >
            🎨 サークル特集
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="mb-1 flex items-center gap-2">
              <Users
                className="h-5 w-5 text-pink-400"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}
              />
              <span
                className="text-base font-bold text-white"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
              >
                {circleName}特集
              </span>
            </div>
            <p
              className="line-clamp-2 text-sm font-bold text-white/90"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
            >
              {feature.description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// モバイル用カルーセルアイテム（ジャンル特集）
function GenreCarouselItemMobile({ feature }: { feature: GenreFeature }) {
  return (
    <Link href={`/features/genre/${feature.slug}`}>
      <Card className="h-full overflow-hidden border border-orange-500/30 transition-all hover:border-orange-500/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          {feature.thumbnail_url ? (
            <img
              src={feature.thumbnail_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-orange-500/10">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          <div
            className="absolute left-2 top-2 rounded-md bg-orange-500 px-2.5 py-1 text-sm font-bold text-white"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
          >
            🔥 性癖特集
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="mb-1 flex items-center gap-2">
              <Flame
                className="h-5 w-5 text-orange-400"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}
              />
              <span
                className="text-base font-bold text-white"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
              >
                {feature.name}特集
              </span>
            </div>
            <p
              className="line-clamp-2 text-sm font-bold text-white/90"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
            >
              {feature.headline}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// モバイル用統一カルーセルアイテム
function CarouselItem({ item }: { item: FeatureCarouselItem }) {
  if (item.type === "circle") {
    return <CircleCarouselItemMobile feature={item.feature} />;
  }
  return <GenreCarouselItemMobile feature={item.feature} />;
}

// PC用グリッドカルーセルアイテム（サークル特集）
function CircleGridItem({ feature }: { feature: CircleFeature }) {
  const circleName = feature.headline
    .replace(/の作品.*$/, "")
    .replace(/特集$/, "")
    .replace(/、全力で推せる！$/, "");

  return (
    <Link href={`/features/circle/${feature.slug}`}>
      <Card className="group overflow-hidden border border-pink-500/30 transition-all hover:border-pink-500/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          {feature.thumbnail_url ? (
            <img
              src={feature.thumbnail_url}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-pink-500/10">
              <Users className="h-8 w-8 text-pink-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          <div
            className="absolute left-2 top-2 rounded-md bg-pink-500 px-2 py-1 text-xs font-bold text-white"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
          >
            🎨 サークル特集
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="mb-0.5 flex items-center gap-1">
              <Users
                className="h-3 w-3 text-pink-400"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}
              />
              <span
                className="truncate text-xs font-bold text-white"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
              >
                {circleName}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// PC用グリッドカルーセルアイテム（ジャンル特集）
function GenreGridItem({ feature }: { feature: GenreFeature }) {
  return (
    <Link href={`/features/genre/${feature.slug}`}>
      <Card className="group overflow-hidden border border-orange-500/30 transition-all hover:border-orange-500/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          {feature.thumbnail_url ? (
            <img
              src={feature.thumbnail_url}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-orange-500/10">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          <div
            className="absolute left-2 top-2 rounded-md bg-orange-500 px-2 py-1 text-xs font-bold text-white"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
          >
            🔥 性癖特集
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="mb-0.5 flex items-center gap-1">
              <Flame
                className="h-3 w-3 text-orange-400"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}
              />
              <span
                className="truncate text-xs font-bold text-white"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
              >
                {feature.name}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// PC用統一グリッドカルーセルアイテム
function GridCarouselItem({ item }: { item: FeatureCarouselItem }) {
  if (item.type === "circle") {
    return <CircleGridItem feature={item.feature} />;
  }
  return <GenreGridItem feature={item.feature} />;
}

// カルーセルアイテムのslugを取得するヘルパー
function getItemSlug(item: FeatureCarouselItem): string {
  return item.feature.slug;
}

// モバイル用カルーセル（後方互換）
export function CircleCarousel({
  features,
  autoPlay = true,
  interval = 5000,
}: CircleCarouselProps) {
  const items: FeatureCarouselItem[] = features.map((f) => ({ type: "circle", feature: f }));
  return <FeatureCarousel items={items} autoPlay={autoPlay} interval={interval} />;
}

// PC用グリッドカルーセル（後方互換）
export function CircleGridCarousel({
  features,
  autoPlay = true,
  interval = 4000,
}: CircleCarouselProps) {
  const items: FeatureCarouselItem[] = features.map((f) => ({ type: "circle", feature: f }));
  return <FeatureGridCarousel items={items} autoPlay={autoPlay} interval={interval} />;
}

// モバイル用カルーセル（統一型）
export function FeatureCarousel({
  items,
  autoPlay = true,
  interval = 5000,
}: FeatureCarouselProps) {
  const extendedItems =
    items.length > 1
      ? [items[items.length - 1], ...items, items[0]]
      : items;

  const [slideIndex, setSlideIndex] = useState(items.length > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const displayIndex =
    items.length > 1
      ? (slideIndex - 1 + items.length) % items.length
      : 0;

  const goToNext = useCallback(() => {
    if (isTransitioning || items.length <= 1) return;
    setIsTransitioning(true);
    setSlideIndex((prev) => prev + 1);
  }, [isTransitioning, items.length]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || items.length <= 1) return;
    setIsTransitioning(true);
    setSlideIndex((prev) => prev - 1);
  }, [isTransitioning, items.length]);

  const goToIndex = useCallback(
    (targetDisplayIndex: number) => {
      if (isTransitioning || items.length <= 1) return;
      if (targetDisplayIndex === displayIndex) return;

      setIsTransitioning(true);
      const diff = targetDisplayIndex - displayIndex;
      if (diff > 0) {
        setSlideIndex((prev) => prev + diff);
      } else {
        setSlideIndex(targetDisplayIndex + 1);
      }
    },
    [isTransitioning, items.length, displayIndex]
  );

  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);

      if (slideIndex >= extendedItems.length - 1) {
        setSlideIndex(1);
      } else if (slideIndex <= 0) {
        setSlideIndex(items.length);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isTransitioning, slideIndex, extendedItems.length, items.length]);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length, goToNext]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="relative h-full">
      <div
        className="h-full overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className={`flex ${isTransitioning ? "transition-transform duration-300 ease-out" : ""}`}
          style={{ transform: `translateX(-${slideIndex * 100}%)` }}
        >
          {extendedItems.map((item, index) => (
            <div
              key={`${getItemSlug(item)}-${index}`}
              className="h-full w-full shrink-0"
            >
              <CarouselItem item={item} />
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 md:left-2 md:h-8 md:w-8"
            aria-label="前へ"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 md:right-2 md:h-8 md:w-8"
            aria-label="次へ"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="mt-2 flex justify-center gap-1.5">
            {items.map((item, index) => (
              <button
                type="button"
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === displayIndex
                    ? "w-4 bg-pink-500"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`${index + 1}番目へ`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// PC用グリッドカルーセル（5カラム表示で1つずつスライド、統一型）
export function FeatureGridCarousel({
  items,
  autoPlay = true,
  interval = 4000,
}: FeatureCarouselProps) {
  const visibleCount = 5;
  const cardWidthPercent = 100 / visibleCount;

  const extendedItems =
    items.length > visibleCount
      ? [
          ...items.slice(-visibleCount),
          ...items,
          ...items.slice(0, visibleCount),
        ]
      : items;

  const initialIndex = items.length > visibleCount ? visibleCount : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    if (isTransitioning || items.length <= visibleCount) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isTransitioning, items.length]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || items.length <= visibleCount) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isTransitioning, items.length]);

  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);

      if (currentIndex >= items.length + visibleCount) {
        setCurrentIndex(visibleCount);
      } else if (currentIndex < visibleCount) {
        setCurrentIndex(items.length + visibleCount - 1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isTransitioning, currentIndex, items.length]);

  useEffect(() => {
    if (!autoPlay || items.length <= visibleCount) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length, goToNext]);

  if (items.length === 0) return null;

  const showNavigation = items.length > visibleCount;
  const translateX = currentIndex * cardWidthPercent;

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className={`flex gap-3 ${isTransitioning ? "transition-transform duration-300 ease-out" : ""}`}
          style={{
            transform: `translateX(calc(-${translateX}% - ${(currentIndex * 12) / visibleCount}px))`,
          }}
        >
          {extendedItems.map((item, index) => (
            <div
              key={`${getItemSlug(item)}-${index}`}
              className="shrink-0"
              style={{ width: `calc((100% - 48px) / 5)` }}
            >
              <GridCarouselItem item={item} />
            </div>
          ))}
        </div>
      </div>

      {showNavigation && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute -left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            aria-label="前へ"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute -right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            aria-label="次へ"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
