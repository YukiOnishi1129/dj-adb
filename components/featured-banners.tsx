import Link from "next/link";
import { Sparkles, Trophy, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeaturedBannersProps {
  saleThumbnail?: string | null;
  saleMaxDiscountRate?: number;
  saleTargetDate?: string | null;
  recommendationThumbnail?: string | null;
  recommendationHeadline?: string | null;
}

// 日付を「1/15」形式にフォーマット
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function FeaturedBanners({
  saleThumbnail,
  saleMaxDiscountRate,
  saleTargetDate,
  recommendationThumbnail,
  recommendationHeadline,
}: FeaturedBannersProps) {
  const saleTitle = saleTargetDate
    ? `${formatShortDate(saleTargetDate)}のセール特集`
    : "セール特集";

  const saleSubtext = saleMaxDiscountRate
    ? `最大${saleMaxDiscountRate}%OFF！`
    : "厳選おすすめ作品";

  const recommendationSubtext = recommendationHeadline || "迷ったらここから選べばハズレなし";

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4">
      {/* 今日のおすすめ（左） */}
      <Link href="/features/daily">
        <Card className="h-full overflow-hidden border border-amber-500/30 transition-all hover:border-amber-500/50">
          {/* スマホ: 画像大きめ + オーバーレイテキスト */}
          <div className="relative md:hidden">
            {recommendationThumbnail ? (
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={recommendationThumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
                <div
                  className="absolute left-2 top-2 rounded-md bg-amber-500 px-2.5 py-1 text-sm font-bold text-white"
                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                >
                  🏆 今日のおすすめ
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <Trophy
                      className="h-3.5 w-3.5 text-amber-400"
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}
                    />
                    <span
                      className="text-xs font-bold text-white"
                      style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
                    >
                      今日の間違いないやつ
                    </span>
                  </div>
                  <p
                    className="text-[10px] font-bold text-white/80"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
                  >
                    {recommendationSubtext}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <Trophy className="h-5 w-5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-amber-500">
                    今日の間違いないやつ
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* PC: 横並びレイアウト */}
          <div className="hidden items-center gap-4 p-4 md:flex">
            {recommendationThumbnail ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={recommendationThumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent" />
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="text-base font-bold text-amber-500">
                  今日の間違いないやつ
                </span>
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                {recommendationSubtext}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-amber-500" />
          </div>
        </Card>
      </Link>

      {/* セール特集（右） */}
      <Link href="/features/sale">
        <Card className="h-full overflow-hidden border border-sale/30 transition-all hover:border-sale/50">
          {/* スマホ: 画像大きめ + オーバーレイテキスト */}
          <div className="relative md:hidden">
            {saleThumbnail ? (
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={saleThumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
                <div
                  className="absolute left-2 top-2 rounded-md bg-red-500 px-2.5 py-1 text-sm font-bold text-white"
                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                >
                  🔥 セール特集
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <Sparkles
                      className="h-3.5 w-3.5 text-sale"
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}
                    />
                    <span
                      className="text-xs font-bold text-white"
                      style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
                    >
                      {saleTitle}
                    </span>
                  </div>
                  <p
                    className="text-[10px] font-bold text-white/80"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
                  >
                    {saleSubtext}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sale/20">
                  <Sparkles className="h-5 w-5 text-sale" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-sale">{saleTitle}</span>
                </div>
              </div>
            )}
          </div>

          {/* PC: 横並びレイアウト */}
          <div className="hidden items-center gap-4 p-4 md:flex">
            {saleThumbnail ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={saleThumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-sale/20 to-transparent" />
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sale/20">
                <Sparkles className="h-6 w-6 text-sale" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sale" />
                <span className="text-base font-bold text-sale">{saleTitle}</span>
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                {saleSubtext}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-sale" />
          </div>
        </Card>
      </Link>
    </div>
  );
}
