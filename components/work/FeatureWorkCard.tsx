import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn, formatPrice, formatRating } from "@/lib/utils";
import type { FeatureWork } from "@/types";

interface FeatureWorkCardProps {
  work: FeatureWork;
  className?: string;
}

export function FeatureWorkCard({ work, className }: FeatureWorkCardProps) {
  return (
    <div
      className={cn(
        "bg-zinc-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition-all",
        className
      )}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-32 flex-shrink-0 bg-zinc-700 rounded overflow-hidden">
          {work.thumbnail_url && (
            <Image
              src={work.thumbnail_url}
              alt={work.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title */}
          <Link
            href={`/works/${work.work_id}`}
            className="block text-sm text-zinc-100 line-clamp-2 hover:text-pink-400 transition-colors"
          >
            {work.title}
          </Link>

          {/* Price and rating */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-zinc-100">
              {formatPrice(work.price)}
            </span>

            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span>{formatRating(work.rating)}</span>
            </div>
          </div>

          {/* Reason */}
          <p className="text-xs text-zinc-400 line-clamp-2">{work.reason}</p>

          {/* Target audience */}
          <p className="text-[10px] text-pink-400">{work.target_audience}</p>
        </div>
      </div>
    </div>
  );
}
