import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { getSaleFeatures, getWorks } from "@/lib/parquet";
import { WorkCard } from "@/components/work";
import { formatDate, formatDiscount } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "セール特集",
  description: "お得なセール中の同人コミック・CG作品を毎日チェック！",
};

export const dynamic = "force-static";

export default async function SaleFeaturePage() {
  const [features, works] = await Promise.all([getSaleFeatures(), getWorks()]);

  // 日付で降順ソート
  const sortedFeatures = features.sort(
    (a, b) =>
      new Date(b.target_date).getTime() - new Date(a.target_date).getTime()
  );

  // セール中の作品を取得
  const saleWorks = works.filter(
    (w) => w.sale_price !== null && w.sale_price < w.price
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
          <span className="text-foreground">セール特集</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">セール特集</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            お得なセール中の作品を毎日チェック！
          </p>
        </div>

        {/* Sale info from features */}
        {sortedFeatures.length > 0 && sortedFeatures[0].total_sale_count > 0 && (
          <div className="mb-8 rounded-lg bg-sale/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(sortedFeatures[0].target_date)}
                </p>
                <p className="font-bold text-sale">
                  {sortedFeatures[0].total_sale_count}作品がセール中
                </p>
              </div>
              {sortedFeatures[0].max_discount_rate > 0 && (
                <span className="text-lg font-bold text-sale">
                  最大{formatDiscount(sortedFeatures[0].max_discount_rate)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sale works list */}
        {saleWorks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              現在セール中の作品はありません
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {saleWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
