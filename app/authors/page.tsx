import { Header, Footer } from "@/components/layout";
import { AuthorListContent } from "@/components/author-list-content";
import { FeaturedBanners } from "@/components/featured-banners";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAuthorsWithWorkCount,
  getLatestDailyRecommendation,
  getLatestSaleFeature,
  getWorkById,
  getAuthorFeatures,
} from "@/lib/parquet";
import { Pen, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "作家一覧",
  description: "FANZA同人コミック・CGの人気作家一覧。サークル横断で活動する作家を作品数・評価別に並び替え可能。お気に入りの作家を見つけて、最新作・代表作のレビュー・感想・抜きどころを毎日チェック。",
  alternates: { canonical: "/authors/" },
};

export default async function AuthorsPage() {
  const [authors, dailyRecommendation, saleFeature, authorFeatures] = await Promise.all([
    getAuthorsWithWorkCount(),
    getLatestDailyRecommendation(),
    getLatestSaleFeature(),
    getAuthorFeatures(),
  ]);

  const recommendationWork = dailyRecommendation?.works?.[0]?.work_id
    ? await getWorkById(dailyRecommendation.works[0].work_id)
    : null;
  const saleFeatureMainWork = saleFeature?.main_work_id
    ? await getWorkById(saleFeature.main_work_id)
    : null;

  const recommendationThumbnail = recommendationWork?.thumbnail_url || null;
  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <FeaturedBanners
          saleThumbnail={saleThumbnail}
          saleMaxDiscountRate={saleFeature?.max_discount_rate}
          saleTargetDate={saleFeature?.target_date}
          recommendationThumbnail={recommendationThumbnail}
          recommendationHeadline={dailyRecommendation?.headline}
        />

        {/* 作家特集への導線 */}
        {authorFeatures.length > 0 && (
          <Link href="/features/author">
            <Card className="mb-6 overflow-hidden border border-blue-500/30 hover:border-blue-500/50 transition-all">
              {authorFeatures[0]?.thumbnail_url ? (
                <div className="relative aspect-[21/9] overflow-hidden">
                  <img
                    src={authorFeatures[0].thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-sm font-bold text-white bg-blue-500"
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                  >
                    作家特集
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-base font-bold text-white mb-1"
                          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
                        >
                          人気作家のおすすめ作品を厳選紹介
                        </p>
                        <p
                          className="text-sm text-white/80"
                          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
                        >
                          {authorFeatures.length}作家を特集中
                        </p>
                      </div>
                      <ChevronRight
                        className="h-6 w-6 text-white shrink-0"
                        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 shrink-0">
                    <Pen className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Pen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-bold text-blue-500">作家特集</span>
                      <Badge variant="outline" className="text-xs">
                        {authorFeatures.length}作家
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      人気作家のおすすめ作品を厳選紹介
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-blue-500 shrink-0" />
                </div>
              )}
            </Card>
          </Link>
        )}

        <AuthorListContent authors={authors} />
      </main>

      <Footer />
    </div>
  );
}
