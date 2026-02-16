import { WorkCard } from "./WorkCard";
import type { Work } from "@/types";

export interface WorkGridProps {
  works: Work[];
  showRankBadge?: boolean;
  /** カラム数（デフォルト: レスポンシブ 2→3→4） */
  columns?: 2 | 3 | 4;
}

const gridClasses = {
  2: "grid grid-cols-2 gap-4",
  3: "grid grid-cols-2 gap-4 sm:grid-cols-3",
  4: "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4",
};

export function WorkGrid({ works, showRankBadge = false, columns }: WorkGridProps) {
  if (works.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">作品が見つかりませんでした</p>
      </div>
    );
  }

  const gridClass = columns ? gridClasses[columns] : gridClasses[4];

  return (
    <div className={gridClass}>
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
