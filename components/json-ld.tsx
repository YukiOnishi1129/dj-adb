import type { Work } from "@/types";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface WebsiteJsonLdProps {
  url: string;
  name: string;
  description: string;
}

export function WebsiteJsonLd({ url, name, description }: WebsiteJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ProductJsonLdProps {
  work: Work;
}

// ビルド時の日時を ISO 8601 形式で取得（schema.org の dateModified に使用）
// 価格・セール情報を毎日更新しているサイトであることを Google に伝える
function getBuildDateIso(): string {
  return new Date().toISOString();
}

export function ProductJsonLd({ work }: ProductJsonLdProps) {
  const isOnSale = work.sale_price !== null && work.sale_price < work.price;
  const displayPrice = isOnSale ? work.sale_price! : work.price;
  const buildDate = getBuildDateIso();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: work.title,
    description: work.ai_summary || work.ai_appeal_points || `${work.title}の詳細ページ`,
    image: work.thumbnail_url,
    brand: work.circle_name
      ? {
          "@type": "Brand",
          name: work.circle_name,
        }
      : undefined,
    category: "同人漫画",
    // 最終更新日（ビルド毎に自動更新、Google に「アクティブに更新中のサイト」と伝える）
    dateModified: work.updated_at || buildDate,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "JPY",
      lowPrice: displayPrice,
      highPrice: work.price,
      offerCount: 1,
      availability: "https://schema.org/InStock",
      // セール終了日が設定されていれば priceValidUntil として伝える
      ...(isOnSale && work.sale_end_date && { priceValidUntil: work.sale_end_date }),
    },
    ...(work.rating &&
      work.review_count && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: work.rating.toFixed(1),
          bestRating: "5",
          worstRating: "1",
          reviewCount: work.review_count,
        },
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ReviewJsonLd({ work }: ProductJsonLdProps) {
  const reviewBody = work.ai_review || work.ai_appeal_points || work.ai_summary;

  if (!reviewBody) return null;

  const buildDate = getBuildDateIso();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: work.title,
      ...(work.thumbnail_url && { image: work.thumbnail_url }),
    },
    author: {
      "@type": "Organization",
      name: "DJ-ADB",
    },
    reviewBody: reviewBody,
    // レビューの公開日 / 最終更新日（毎日のビルドで更新される）
    datePublished: work.updated_at || buildDate,
    dateModified: work.updated_at || buildDate,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

export function BreadcrumbJsonLd({
  items,
  baseUrl = "https://dj-adb.com",
}: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
