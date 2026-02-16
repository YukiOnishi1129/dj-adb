"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface CircleInfo {
  name: string;
  workCount: number;
}

interface CircleListContentProps {
  circles: CircleInfo[];
}

export function CircleListContent({ circles }: CircleListContentProps) {
  const [displayCount, setDisplayCount] = useState(50);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {circles.slice(0, displayCount).map((circle) => (
          <Link
            key={circle.name}
            href={`/circles/${encodeURIComponent(circle.name)}`}
          >
            <Card className="group transition-all hover:border-pink-500/50 hover:shadow-md">
              <CardContent className="p-4">
                <h2 className="mb-2 font-medium text-foreground group-hover:text-pink-500">
                  {circle.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {circle.workCount}作品
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {displayCount < circles.length && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() =>
              setDisplayCount((prev) => Math.min(prev + 50, circles.length))
            }
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ChevronDown className="h-4 w-4" />
            もっと見る（残り{circles.length - displayCount}件）
          </button>
        </div>
      )}
    </>
  );
}
