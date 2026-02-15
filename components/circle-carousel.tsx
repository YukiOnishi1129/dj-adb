"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CircleFeature } from "@/types";

interface CircleCarouselProps {
  features: CircleFeature[];
  autoPlay?: boolean;
  interval?: number;
}

// モバイル用カルーセルアイテム
function CarouselItem({ feature }: { feature: CircleFeature }) {
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
          {/* グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          {/* ラベル */}
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

// PC用グリッドカルーセルアイテム
function GridCarouselItem({ feature }: { feature: CircleFeature }) {
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
          {/* グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          {/* ラベル */}
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

// モバイル用カルーセル
export function CircleCarousel({
  features,
  autoPlay = true,
  interval = 5000,
}: CircleCarouselProps) {
  const extendedItems =
    features.length > 1
      ? [features[features.length - 1], ...features, features[0]]
      : features;

  const [slideIndex, setSlideIndex] = useState(features.length > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const displayIndex =
    features.length > 1
      ? (slideIndex - 1 + features.length) % features.length
      : 0;

  const goToNext = useCallback(() => {
    if (isTransitioning || features.length <= 1) return;
    setIsTransitioning(true);
    setSlideIndex((prev) => prev + 1);
  }, [isTransitioning, features.length]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || features.length <= 1) return;
    setIsTransitioning(true);
    setSlideIndex((prev) => prev - 1);
  }, [isTransitioning, features.length]);

  const goToIndex = useCallback(
    (targetDisplayIndex: number) => {
      if (isTransitioning || features.length <= 1) return;
      if (targetDisplayIndex === displayIndex) return;

      setIsTransitioning(true);
      const diff = targetDisplayIndex - displayIndex;
      if (diff > 0) {
        setSlideIndex((prev) => prev + diff);
      } else {
        setSlideIndex(targetDisplayIndex + 1);
      }
    },
    [isTransitioning, features.length, displayIndex]
  );

  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);

      if (slideIndex >= extendedItems.length - 1) {
        setSlideIndex(1);
      } else if (slideIndex <= 0) {
        setSlideIndex(features.length);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isTransitioning, slideIndex, extendedItems.length, features.length]);

  useEffect(() => {
    if (!autoPlay || features.length <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, features.length, goToNext]);

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

  if (features.length === 0) return null;

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
          {extendedItems.map((feature, index) => (
            <div
              key={`${feature.slug}-${index}`}
              className="h-full w-full shrink-0"
            >
              <CarouselItem feature={feature} />
            </div>
          ))}
        </div>
      </div>

      {features.length > 1 && (
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
            {features.map((_, index) => (
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

// PC用グリッドカルーセル（5カラム表示で1つずつスライド）
export function CircleGridCarousel({
  features,
  autoPlay = true,
  interval = 4000,
}: CircleCarouselProps) {
  const visibleCount = 5;
  const cardWidthPercent = 100 / visibleCount;

  const extendedItems =
    features.length > visibleCount
      ? [
          ...features.slice(-visibleCount),
          ...features,
          ...features.slice(0, visibleCount),
        ]
      : features;

  const initialIndex = features.length > visibleCount ? visibleCount : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    if (isTransitioning || features.length <= visibleCount) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isTransitioning, features.length]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || features.length <= visibleCount) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isTransitioning, features.length]);

  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);

      if (currentIndex >= features.length + visibleCount) {
        setCurrentIndex(visibleCount);
      } else if (currentIndex < visibleCount) {
        setCurrentIndex(features.length + visibleCount - 1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isTransitioning, currentIndex, features.length]);

  useEffect(() => {
    if (!autoPlay || features.length <= visibleCount) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, features.length, goToNext]);

  if (features.length === 0) return null;

  const showNavigation = features.length > visibleCount;
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
          {extendedItems.map((feature, index) => (
            <div
              key={`${feature.slug}-${index}`}
              className="shrink-0"
              style={{ width: `calc((100% - 48px) / 5)` }}
            >
              <GridCarouselItem feature={feature} />
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
