import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn, formatPrice, formatRating, formatDiscount } from "@/lib/utils";
import type { FeatureWork, SaleFeatureWork } from "@/types";

interface FeatureWorkCardProps {
  work: FeatureWork | SaleFeatureWork;
  className?: string;
}

function isSaleWork(work: FeatureWork | SaleFeatureWork): work is SaleFeatureWork {
  return "sale_price" in work && "discount_rate" in work;
}

export function FeatureWorkCard({ work, className }: FeatureWorkCardProps) {
  const isOnSale = isSaleWork(work);

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
          {/* Sale badge */}
          {isOnSale && (
            <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {formatDiscount(work.discount_rate)}
            </div>
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

          {/* Circle name (if available) */}
          {"circle_name" in work && (
            <p className="text-xs text-zinc-400 truncate">{work.circle_name}</p>
          )}

          {/* Price and rating */}
          <div className="flex items-center gap-3">
            {isOnSale ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-red-400">
                  {formatPrice(work.sale_price)}
                </span>
                <span className="text-xs text-zinc-500 line-through">
                  {formatPrice(work.price)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-zinc-100">
                {formatPrice(work.price)}
              </span>
            )}

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
