import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TrendingChipsProps {
  circles: { name: string; workCount: number }[];
  tags: string[];
}

export function TrendingChips({ circles, tags }: TrendingChipsProps) {
  if (circles.length === 0 && tags.length === 0) return null;

  return (
    <section className="mb-4 space-y-2">
      {/* 人気サークル */}
      {circles.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain py-1 scrollbar-hide">
          <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
            人気サークル
          </span>
          <div className="flex gap-1.5">
            {circles.slice(0, 6).map((circle) => (
              <Link
                key={circle.name}
                href={`/circles/${encodeURIComponent(circle.name)}`}
              >
                <Badge
                  variant="circle"
                  className="cursor-pointer whitespace-nowrap px-2 py-0.5 text-[10px] transition-opacity hover:opacity-80"
                >
                  {circle.name}
                </Badge>
              </Link>
            ))}
            <Link href="/circles">
              <Badge
                variant="outline"
                className="cursor-pointer whitespace-nowrap px-2 py-0.5 text-[10px] transition-opacity hover:opacity-80"
              >
                もっと見る
              </Badge>
            </Link>
          </div>
        </div>
      )}

      {/* 人気タグ */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain py-1 scrollbar-hide">
          <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
            人気タグ
          </span>
          <div className="flex gap-1.5">
            {tags.slice(0, 8).map((tag) => (
              <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                <Badge
                  variant="tag"
                  className="cursor-pointer whitespace-nowrap px-2 py-0.5 text-[10px] transition-opacity hover:opacity-80"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
