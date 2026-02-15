import { WorkCard } from "./WorkCard";
import type { Work } from "@/types";

interface WorkGridProps {
  works: Work[];
  showRankBadge?: boolean;
}

export function WorkGrid({ works, showRankBadge = false }: WorkGridProps) {
  if (works.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">作品が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {works.map((work, index) => (
        <WorkCard
          key={work.id}
          work={work}
          showRankBadge={showRankBadge}
          rank={showRankBadge ? index + 1 : undefined}
        />
      ))}
    </div>
  );
}
