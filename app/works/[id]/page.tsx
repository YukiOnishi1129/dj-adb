import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, BookOpen, Tag } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { getWorks, getWorkById } from "@/lib/parquet";
import { formatPrice, formatRating, formatDiscount, getFanzaUrl } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const work = await getWorkById(parseInt(id, 10));

  if (!work) {
    return { title: "作品が見つかりません" };
  }

  return {
    title: work.title,
    description: work.ai_summary || `${work.circle_name}の作品「${work.title}」`,
    openGraph: {
      images: work.thumbnail_url ? [work.thumbnail_url] : [],
    },
  };
}

export async function generateStaticParams() {
  const works = await getWorks();
  // 全作品をSSGで生成
  return works.map((work) => ({
    id: work.id.toString(),
  }));
}

export const dynamic = "force-static";

export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
  const work = await getWorkById(parseInt(id, 10));

  if (!work) {
    notFound();
  }

  const isOnSale = work.sale_price !== null && work.sale_price < work.price;
  const fanzaUrl = getFanzaUrl(work.fanza_content_id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            トップ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/works" className="hover:text-foreground">
            作品一覧
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{work.title}</span>
        </nav>

        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Thumbnail */}
          <div className="space-y-4">
            <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-muted">
              <img
                src={
                  work.thumbnail_url ||
                  "https://placehold.co/300x400/f4f4f5/71717a?text=No+Image"
                }
                alt={work.title}
                className="h-full w-full object-cover"
              />
              {/* Ranking badge */}
              {work.ranking && (
                <div className="absolute left-3 top-3 rounded bg-linear-to-r from-amber-500 to-amber-600 px-3 py-1 text-sm font-bold text-white">
                  #{work.ranking}
                </div>
              )}
              {/* Sale badge */}
              {isOnSale && (
                <Badge
                  variant="sale"
                  className="absolute right-3 top-3 text-sm"
                >
                  {formatDiscount(work.discount_rate)}
                </Badge>
              )}
            </div>

            {/* FANZA link */}
            <a
              href={fanzaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 font-bold text-accent-foreground transition-colors hover:bg-accent/80"
            >
              FANZAで見る
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {work.title}
            </h1>

            {/* Circle */}
            <div className="text-muted-foreground">
              <span className="text-muted-foreground/70">サークル:</span>{" "}
              <Badge variant="circle">{work.circle_name}</Badge>
              {work.author_name && (
                <>
                  <span className="mx-2 text-muted-foreground/50">|</span>
                  <span className="text-muted-foreground/70">作者:</span>{" "}
                  <span className="text-foreground">{work.author_name}</span>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {isOnSale ? (
                <>
                  <span className="text-2xl font-bold text-red-500">
                    {formatPrice(work.sale_price!)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(work.price)}
                  </span>
                  <Badge variant="sale">{formatDiscount(work.discount_rate)}</Badge>
                </>
              ) : (
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(work.price)}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1 text-foreground">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= Math.round(work.rating);
                    return (
                      <svg key={star} className="h-4 w-4" viewBox="0 0 20 20">
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          fill={filled ? "#f59e0b" : "#e5e7eb"}
                          stroke="#ea580c"
                          strokeWidth="0.5"
                        />
                      </svg>
                    );
                  })}
                </div>
                <span className="ml-1 font-bold text-orange-500">
                  {formatRating(work.rating)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{work.page_count}ページ</span>
              </div>
            </div>

            {/* AI Summary */}
            {work.ai_summary && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-foreground">あらすじ</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {work.ai_summary}
                </p>
              </div>
            )}

            {/* AI Appeal Points */}
            {work.ai_appeal_points && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-foreground">
                  おすすめポイント
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {work.ai_appeal_points}
                </p>
              </div>
            )}

            {/* Genre tags */}
            {work.genre_tags && work.genre_tags.length > 0 && (
              <div className="space-y-2">
                <h2 className="flex items-center gap-1 text-sm font-medium text-foreground">
                  <Tag className="h-4 w-4" />
                  ジャンル
                </h2>
                <div className="flex flex-wrap gap-2">
                  {work.genre_tags.map((tag) => (
                    <Badge key={tag} variant="tag">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sample images */}
        {work.sample_images && work.sample_images.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-lg font-bold text-foreground">サンプル画像</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {work.sample_images.slice(0, 8).map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-3/4 overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={url}
                    alt={`サンプル ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
