"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WorkCard } from "./WorkCard";
import type { Work } from "@/types";
import { ChevronDown, Loader2 } from "lucide-react";

interface WorkGridWithLoadMoreProps {
  works: Work[];
  initialCount?: number;
  loadMoreCount?: number;
}

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

export function WorkGridWithLoadMore({
  works,
  initialCount = 20,
  loadMoreCount = 20,
}: WorkGridWithLoadMoreProps) {
  const isMobile = useIsMobile();
  const effectiveLoadCount = isMobile ? 20 : loadMoreCount;
  const effectiveInitialCount = isMobile ? 20 : initialCount;

  const [displayCount, setDisplayCount] = useState(20);
  const [isPending, startTransition] = useTransition();
  const [prevEffectiveInitialCount, setPrevEffectiveInitialCount] =
    useState(effectiveInitialCount);

  if (effectiveInitialCount !== prevEffectiveInitialCount) {
    setPrevEffectiveInitialCount(effectiveInitialCount);
    setDisplayCount(effectiveInitialCount);
  }

  const displayedWorks = works.slice(0, displayCount);
  const hasMore = displayCount < works.length;
  const remainingCount = works.length - displayCount;

  const handleLoadMore = () => {
    startTransition(() => {
      setDisplayCount((prev) =>
        Math.min(prev + effectiveLoadCount, works.length)
      );
    });
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {displayedWorks.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {isPending
              ? "読み込み中..."
              : `もっと見る（残り${remainingCount}件）`}
          </Button>
        </div>
      )}
    </div>
  );
}
