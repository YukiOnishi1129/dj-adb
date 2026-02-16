"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Crown, Trophy, Medal, Users, ChevronDown } from "lucide-react";

interface CircleInfo {
  name: string;
  workCount: number;
}

interface CircleListContentProps {
  circles: CircleInfo[];
}

export function CircleListContent({ circles }: CircleListContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(50);

  // 検索時にリセット
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on search change
  useEffect(() => {
    setDisplayCount(50);
  }, [searchQuery]);

  // 人気サークル（上位10名）とその他を分離
  const { popularCircles, otherCircles } = useMemo(() => {
    const sorted = [...circles].sort((a, b) => b.workCount - a.workCount);
    return {
      popularCircles: sorted.slice(0, 10),
      otherCircles: sorted.slice(10),
    };
  }, [circles]);

  // 検索フィルタ
  const filteredPopular = useMemo(() => {
    if (!searchQuery) return popularCircles;
    return popularCircles.filter((circle) =>
      circle.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [popularCircles, searchQuery]);

  const filteredOther = useMemo(() => {
    if (!searchQuery) return otherCircles;
    return otherCircles.filter((circle) =>
      circle.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [otherCircles, searchQuery]);

  const totalFiltered = filteredPopular.length + filteredOther.length;

  // ランクアイコン
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-amber-400" />;
    if (rank === 2) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return null;
  };

  return (
    <>
      {/* ヘッダー */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground mb-1">サークル一覧</h1>
        <p className="text-sm text-muted-foreground">
          {circles.length}サークルが登録されています
        </p>
      </div>

      {/* 検索ボックス */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="サークル名で検索..."
            className="h-11 pl-10 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-muted-foreground">
            「{searchQuery}」で {totalFiltered}件ヒット
          </p>
        )}
      </div>

      {/* 人気サークルセクション */}
      {filteredPopular.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-foreground">人気サークルTOP10</h2>
          </div>
          <div className="grid gap-3">
            {filteredPopular.map((circle) => {
              const rank = popularCircles.indexOf(circle) + 1;
              return (
                <Link
                  key={circle.name}
                  href={`/circles/${encodeURIComponent(circle.name)}`}
                >
                  <Card className="group transition-all hover:border-primary/50 border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* ランク */}
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                          rank === 1
                            ? "bg-amber-500 text-white"
                            : rank === 2
                              ? "bg-gray-400 text-white"
                              : rank === 3
                                ? "bg-amber-700 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {rank}
                      </div>
                      {/* 名前 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {circle.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {circle.workCount}作品
                        </p>
                      </div>
                      {/* バッジ */}
                      {rank <= 3 && (
                        <Badge
                          variant="secondary"
                          className={`shrink-0 ${
                            rank === 1
                              ? "bg-amber-500/20 text-amber-500"
                              : rank === 2
                                ? "bg-gray-400/20 text-gray-400"
                                : "bg-amber-700/20 text-amber-700"
                          }`}
                        >
                          {getRankIcon(rank)}
                          <span className="ml-1">
                            {rank === 1
                              ? "1st"
                              : rank === 2
                                ? "2nd"
                                : "3rd"}
                          </span>
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* その他のサークルセクション */}
      {filteredOther.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">その他のサークル</h2>
            <span className="text-sm text-muted-foreground">
              ({filteredOther.length}件)
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredOther.slice(0, displayCount).map((circle) => (
              <Link
                key={circle.name}
                href={`/circles/${encodeURIComponent(circle.name)}`}
              >
                <Card className="group transition-colors hover:border-primary/50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {circle.name}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {circle.workCount}作品
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {displayCount < filteredOther.length && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDisplayCount((prev) => Math.min(prev + 50, filteredOther.length))}
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                もっと見る（残り{filteredOther.length - displayCount}件）
              </Button>
            </div>
          )}
        </section>
      )}

      {/* 検索結果なし */}
      {totalFiltered === 0 && searchQuery && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            「{searchQuery}」に一致するサークルが見つかりませんでした
          </p>
        </div>
      )}
    </>
  );
}
