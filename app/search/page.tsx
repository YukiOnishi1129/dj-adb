import { Header, Footer } from "@/components/layout";
import { SearchContent } from "@/components/search-content";
import { FeaturedBanners } from "@/components/featured-banners";
import {
  getLatestDailyRecommendation,
  getLatestSaleFeature,
  getWorkById,
} from "@/lib/parquet";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "作品検索 - 同人コミック・CG",
  description: "FANZA同人コミック・CG作品をキーワード・サークル・タグ・価格・評価で絞り込み検索。フェラ・巨乳・NTR・触手など人気ジャンル別、無料セール・お買い得作品も検索可能。レビュー・感想・抜きどころも掲載。",
  alternates: { canonical: "/search/" },
};

export const dynamic = "force-static";

export default async function SearchPage() {
  // バナー用データを取得
  const [dailyRecommendation, saleFeature] = await Promise.all([
    getLatestDailyRecommendation(),
    getLatestSaleFeature(),
  ]);

  // サムネイル取得
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

      <main className="mx-auto max-w-5xl px-4 py-4">
        {/* 今日のおすすめ & セール特集バナー */}
        <FeaturedBanners
          saleThumbnail={saleThumbnail}
          saleMaxDiscountRate={saleFeature?.max_discount_rate}
          saleTargetDate={saleFeature?.target_date}
          recommendationThumbnail={recommendationThumbnail}
          recommendationHeadline={dailyRecommendation?.headline}
        />

        <SearchContent />
      </main>

      <Footer />
    </div>
  );
}
