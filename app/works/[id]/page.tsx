import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, BookOpen } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaleBannerCountdown } from "@/components/sale-banner-countdown";
import { FixedPurchaseCta } from "@/components/fixed-purchase-cta";
import { FanzaLink } from "@/components/fanza-link";
import { WorkGrid } from "@/components/work";
import {
  getWorks,
  getWorkById,
  getRelatedWorksByCircle,
  getRelatedWorksByGenre,
  getCircleFeatureByName,
  getCircleFeatures,
  getRecommendedWorks,
} from "@/lib/parquet";
import {
  formatPrice,
  formatRating,
  formatDiscount,
  getFanzaUrl,
} from "@/lib/utils";
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

  const isOnSale = work.sale_price !== null && work.sale_price < work.price;
  const salePrefix = isOnSale ? `【${work.discount_rate}%OFF】` : "";

  return {
    title: `${salePrefix}${work.title} | DJ-ADB`,
    description:
      work.ai_appeal_points ||
      work.ai_summary ||
      `${work.circle_name}の作品「${work.title}」`,
    openGraph: {
      images: work.thumbnail_url ? [work.thumbnail_url] : [],
    },
  };
}

export async function generateStaticParams() {
  const works = await getWorks();
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
  const displayPrice = isOnSale ? work.sale_price! : work.price;

  // 関連データを取得
  const [circleWorks, relatedWorks, circleFeature, allCircleFeatures, recommendedWorks] = await Promise.all([
    getRelatedWorksByCircle(work.circle_name, work.id, 4),
    getRelatedWorksByGenre(work.genre_tags || [], work.id, 4),
    getCircleFeatureByName(work.circle_name),
    getCircleFeatures(),
    getRecommendedWorks(work.id, 4),
  ]);

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      <Header />

      {/* セール中固定バナー（スマホのみ） */}
      {isOnSale && work.sale_end_date && work.discount_rate > 0 && (
        <div className="sticky top-16 z-40 bg-gradient-to-r from-red-500 to-orange-500 text-white py-1.5 px-4 shadow-md md:hidden">
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="font-bold">{work.discount_rate}%OFF</span>
            <span>終了まで</span>
            <SaleBannerCountdown endDate={work.sale_end_date} compact />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">
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
          <span className="text-foreground line-clamp-1">{work.title}</span>
        </nav>

        {/* ヒーローセクション */}
        <div className="relative mb-6 overflow-hidden rounded-lg">
          <img
            src={
              work.thumbnail_url ||
              "https://placehold.co/800x450/f4f4f5/71717a?text=No+Image"
            }
            alt={work.title}
            className="w-full max-h-[500px] object-contain bg-black/5"
          />
          {/* Ranking badge */}
          {work.ranking && (
            <div className="absolute left-4 top-4 rounded bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-sm font-bold text-white">
              #{work.ranking}
            </div>
          )}
          {/* Sale badge */}
          {isOnSale && (
            <Badge
              variant="sale"
              className="absolute right-4 top-4 text-lg px-3 py-1"
            >
              {formatDiscount(work.discount_rate)}
            </Badge>
          )}
          {/* 高評価・レビュー数バッジ */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            {work.rating && work.rating >= 4.5 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-xs font-bold backdrop-blur-sm">
                ★ 高評価
              </div>
            )}
            {work.review_count && work.review_count >= 10 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm">
                💬 {work.review_count.toLocaleString()}件のレビュー
              </div>
            )}
          </div>
        </div>

        {/* 作品情報セクション */}
        <div className="space-y-6">
          {/* カテゴリ + 評価 */}
          {work.rating && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">評価：</span>
                <span className="text-2xl font-bold text-red-500">
                  {formatRating(work.rating)}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-5 w-5" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        fill={star <= Math.round(work.rating ?? 0) ? "#f59e0b" : "#e5e7eb"}
                        stroke="#ea580c"
                        strokeWidth="0.5"
                      />
                    </svg>
                  ))}
                </div>
                {work.review_count && (
                  <span className="text-sm text-muted-foreground">
                    ({work.review_count.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* タイトル */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {work.title}
          </h1>

          {/* サークル */}
          <div className="text-muted-foreground">
            <Link
              href={`/circles/${encodeURIComponent(work.circle_name)}`}
              className="hover:text-foreground"
            >
              <Badge variant="circle">{work.circle_name}</Badge>
            </Link>
            {work.author_name && (
              <>
                <span className="mx-2 text-muted-foreground/50">|</span>
                <span className="text-muted-foreground/70">作者:</span>{" "}
                <span className="text-foreground">{work.author_name}</span>
              </>
            )}
          </div>

          {/* ファーストビュー大きなCTA */}
          <Card
            className={`overflow-hidden ${
              isOnSale
                ? "border-orange-500/50 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30"
                : "border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
            }`}
          >
            <CardContent className="p-4">
              {/* セール中の場合は緊急性を訴求 */}
              {isOnSale && (
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="sale" className="text-sm px-2 py-1">
                    {work.discount_rate}%OFF
                  </Badge>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    今だけの特別価格！
                  </span>
                </div>
              )}

              {/* 評価・レビュー数 */}
              {work.rating && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold text-foreground">
                      {formatRating(work.rating)}
                    </span>
                  </div>
                  {work.review_count && work.review_count > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({work.review_count.toLocaleString()}件のレビュー)
                    </span>
                  )}
                </div>
              )}

              {/* 価格表示 */}
              <div className="flex items-baseline gap-2 mb-3">
                {isOnSale && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(work.price)}
                  </span>
                )}
                <span
                  className={`text-2xl font-bold ${
                    isOnSale ? "text-red-500" : "text-foreground"
                  }`}
                >
                  {formatPrice(displayPrice)}
                </span>
                <span className="text-xs text-muted-foreground">(FANZA)</span>
              </div>

              {/* 大きなCTAボタン */}
              <FanzaLink
                url={fanzaUrl}
                workId={work.id}
                source="detail_top"
                className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-bold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] ${
                  isOnSale
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                立ち読みしてみる
              </FanzaLink>

              {/* 補足テキスト */}
              <p className="mt-2 text-center text-xs text-muted-foreground">
                無料の試し読み・サンプルで確認できます
              </p>
            </CardContent>
          </Card>

          {/* Genre tags */}
          {work.genre_tags && work.genre_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {work.genre_tags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
                  <Badge
                    variant="tag"
                    className="cursor-pointer hover:opacity-80"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Sample images（タグの後に表示） */}
          {work.sample_images && work.sample_images.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {work.sample_images.slice(0, 8).map((url, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src={url}
                      alt={`サンプル ${index + 1}`}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {work.ai_summary && (
            <Card className="bg-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  あらすじ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{work.ai_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* こんな人におすすめ */}
          {work.ai_target_audience && (
            <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  🎯 こんな人におすすめ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 dark:text-gray-200">
                  {work.ai_target_audience}
                </p>
              </CardContent>
            </Card>
          )}

          {/* おすすめポイント */}
          {work.ai_appeal_points && (
            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ✨ これが刺さる！
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 dark:text-gray-200">
                  {work.ai_appeal_points}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 注意点 */}
          {work.ai_warnings && (
            <Card className="bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ⚠️ 注意点
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 dark:text-gray-200">
                  {work.ai_warnings}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 編集部レビュー */}
          {work.ai_review && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  📝 DJ-ADB編集部レビュー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {work.ai_review}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 作品スペック */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-pink-500">
                作品スペック
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {work.page_count && (
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>ページ数</span>
                  </div>
                  <span className="font-medium text-foreground">{work.page_count}ページ</span>
                </div>
              )}
              {work.circle_name && (
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>サークル</span>
                  </div>
                  <span className="font-medium text-foreground">{work.circle_name}</span>
                </div>
              )}
              {work.author_name && (
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>作者</span>
                  </div>
                  <span className="font-medium text-foreground">{work.author_name}</span>
                </div>
              )}
              {work.genre_tags && work.genre_tags.length > 0 && (
                <div className="flex items-start justify-between pt-1">
                  <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>ジャンル</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end ml-4">
                    {work.genre_tags.map((tag) => (
                      <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
                        <Badge
                          variant="tag"
                          className="text-xs cursor-pointer hover:opacity-80"
                        >
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ユーザー評価 */}
          {work.rating && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className="text-yellow-500">★</span>
                  ユーザー評価
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">FANZA:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-2xl font-bold text-yellow-500">
                      {formatRating(work.rating)}
                    </span>
                  </div>
                  {work.review_count !== null && work.review_count !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      ({work.review_count}件のレビュー)
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* セール終了カウントダウン（2D-ADB風・白背景） */}
          {isOnSale && work.sale_end_date && (
            <Card className="overflow-hidden border border-gray-200 bg-white dark:bg-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-orange-500">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="sale" className="text-xs px-2 py-0.5">
                        {work.discount_rate}%OFF
                      </Badge>
                      <span className="text-sm text-gray-600">セール終了まで</span>
                    </div>
                    <SaleBannerCountdown endDate={work.sale_end_date} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 購入者の声から分かったこと */}
          {work.ai_appeal_points && (
            <Card className="border-amber-500/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-2">
                  購入者の声から分かったこと
                </h3>
                <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                  {work.ai_appeal_points}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 販売情報テーブル（2D-ADB風） */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-muted-foreground">
                      <span className="hidden sm:inline">プラットフォーム</span>
                      <span className="sm:hidden">販売</span>
                    </th>
                    <th className="flex px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-muted-foreground justify-center">
                      価格
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                      無料版あり
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-2 sm:px-4 py-3">
                      <span className="font-medium text-foreground">FANZA</span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-right">
                      <div className="flex items-end justify-center gap-4">
                        <div>
                          {isOnSale && (
                            <p className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(work.price)}
                            </p>
                          )}
                          <p className={`text-lg font-bold sm:text-xl ${isOnSale ? "text-red-500" : "text-foreground"}`}>
                            {formatPrice(displayPrice)}
                          </p>
                        </div>
                        <div className="flex items-end gap-1.5 justify-center mb-1">
                          {isOnSale && work.discount_rate > 0 && (
                            <Badge variant="sale" className="text-[9px] px-1">
                              {work.discount_rate}%OFF
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-center">
                      <FanzaLink
                        url={fanzaUrl}
                        workId={work.id}
                        source="detail_table"
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-bold text-white transition-all hover:scale-105 ${isOnSale ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
                      >
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        試し読み
                      </FanzaLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* 購入ボタン（大きめ） */}
          <Card
            className={`overflow-hidden ${
              isOnSale
                ? "border-orange-500/50 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30"
                : "border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
            }`}
          >
            <CardContent className="p-4 sm:p-6">
              {/* セール中の場合は緊急性を訴求 */}
              {isOnSale && (
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="sale" className="text-sm px-2 py-1">
                    {work.discount_rate}%OFF
                  </Badge>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    今だけの特別価格！
                  </span>
                </div>
              )}

              {/* 評価・レビュー数 */}
              {work.rating && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold text-foreground">
                      {formatRating(work.rating)}
                    </span>
                  </div>
                  {work.review_count && work.review_count > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({work.review_count.toLocaleString()}件のレビュー)
                    </span>
                  )}
                  {work.rating >= 4.5 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-amber-500 text-amber-600 dark:text-amber-400"
                    >
                      高評価
                    </Badge>
                  )}
                </div>
              )}

              {/* 価格表示 */}
              <div className="flex items-baseline gap-2 mb-4">
                {isOnSale && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(work.price)}
                  </span>
                )}
                <span
                  className={`text-3xl font-bold ${
                    isOnSale ? "text-red-500" : "text-foreground"
                  }`}
                >
                  {formatPrice(displayPrice)}
                </span>
                <span className="text-sm text-muted-foreground">(FANZA)</span>
              </div>

              {/* 大きなCTAボタン */}
              <FanzaLink
                url={fanzaUrl}
                workId={work.id}
                source="detail_bottom"
                className={`flex w-full items-center justify-center gap-2 rounded-full py-5 text-xl font-bold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] ${
                  isOnSale
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                }`}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                立ち読みしてみる
              </FanzaLink>

              {/* 補足テキスト */}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                無料の試し読み・サンプルで確認できます
              </p>
            </CardContent>
          </Card>

          {/* 発売日 */}
          {work.created_at && (
            <div className="text-sm text-muted-foreground">
              発売日: {new Date(work.created_at).toLocaleDateString("ja-JP")}
            </div>
          )}

          {/* サークル特集ページへのリンク */}
          {circleFeature && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-pink-500">🎨</span>
                {work.circle_name}の特集ページ
              </h2>
              <Link href={`/features/circle/${encodeURIComponent(circleFeature.slug)}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {circleFeature.thumbnail_url && (
                      <img
                        src={circleFeature.thumbnail_url}
                        alt={circleFeature.circle_name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Badge variant="sale" className="mb-2">
                        {circleFeature.circle_name}特集
                      </Badge>
                      <h3 className="text-white font-bold text-lg">
                        {circleFeature.headline}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        全{circleFeature.work_count}作品から厳選
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          )}

          {/* 同じサークルの他の作品 */}
          {circleWorks.length > 0 && (
            <section className="mt-8 space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                🎨 {work.circle_name}の他の人気作品
              </h2>
              <WorkGrid works={circleWorks} columns={2} />
            </section>
          )}

          {/* この作品が好きな人はこれも（タグベース） */}
          {relatedWorks.length > 0 && (
            <section className="mt-8 space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                🛒 この作品が好きな人はこれも
              </h2>
              <WorkGrid works={relatedWorks} columns={2} />
            </section>
          )}

          {/* こちらもおすすめ */}
          {recommendedWorks.length > 0 && (
            <section className="mt-10 space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                こちらもおすすめ
              </h2>
              <WorkGrid works={recommendedWorks} columns={2} />
            </section>
          )}

          {/* 人気サークル特集 */}
          {allCircleFeatures.length > 0 && (
            <section className="mt-10 space-y-3">
              <h2 className="text-lg font-bold text-foreground">🎨 人気サークル特集</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {allCircleFeatures.slice(0, 6).map((feature) => (
                  <Link key={feature.slug} href={`/features/circle/${encodeURIComponent(feature.slug)}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-pink-500/30 hover:border-pink-500/50 transition-all bg-card">
                      {feature.thumbnail_url && (
                        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={feature.thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-pink-500">{feature.circle_name}</span>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {feature.headline || `${feature.circle_name}のおすすめ作品`}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {/* スマホ固定購入ボタン */}
      <FixedPurchaseCta
        price={work.price}
        salePrice={work.sale_price}
        discountRate={work.discount_rate}
        fanzaUrl={fanzaUrl}
        saleEndDate={work.sale_end_date}
        workId={work.id}
      />
    </div>
  );
}
