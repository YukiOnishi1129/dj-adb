import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { getDailyRecommendations } from "@/lib/parquet";
import { FeatureWorkCard } from "@/components/work";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "今日のおすすめ",
  description: "毎日更新！おすすめの同人コミック・CG作品を厳選して紹介。",
};

export const dynamic = "force-static";

export default async function DailyRecommendationPage() {
  const recommendations = await getDailyRecommendations();

  // 日付で降順ソート
  const sortedRecommendations = recommendations.sort(
    (a, b) =>
      new Date(b.target_date).getTime() - new Date(a.target_date).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            トップ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">今日のおすすめ</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">今日のおすすめ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            毎日更新！厳選した同人コミック・CGをご紹介
          </p>
        </div>

        {/* Recommendations list */}
        {sortedRecommendations.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">おすすめデータがまだありません</p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedRecommendations.map((rec) => (
              <section key={rec.id} className="space-y-4">
                {/* Date header */}
                <div className="border-b border-border pb-2">
                  <h2 className="text-lg font-bold text-foreground">
                    {formatDate(rec.target_date)}
                  </h2>
                  <p className="text-sm text-accent">{rec.headline}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {rec.total_works_count}作品から厳選
                  </p>
                </div>

                {/* Works */}
                <div className="grid gap-4">
                  {rec.works.map((work) => (
                    <FeatureWorkCard key={work.work_id} work={work} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
