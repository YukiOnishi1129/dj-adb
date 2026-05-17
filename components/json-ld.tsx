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

// =============================================================================
// Organization JSON-LD（サイト全体の運営主体を Google / AI に伝える）
// =============================================================================
// SEO目的:
// - E-E-A-T の「権威性・信頼性」を構造化データとして提示
// - AI（AIによる概要 / AIモード）への引用時の責任主体識別
// - 匿名アフィリエイトサイトとの差別化
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DJ-ADB",
    alternateName: "DJ-ADB編集部",
    url: "https://dj-adb.com",
    logo: "https://dj-adb.com/ogp/recommendation_ogp.png",
    description:
      "FANZA同人コミック・CG・商業電子書籍の厳選レビューサイト。評価・ランキング・セール情報をAIによる分析と人手の編集で整理してお届けします。",
    sameAs: [
      "https://x.com/dj_adb",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// =============================================================================
// WebSite JSON-LD（サイト内検索のサジェスト + サイト名統一）
// =============================================================================
export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DJ-ADB",
    alternateName: "DJ-ADB | 同人コミック・CGの厳選レビューサイト",
    url: "https://dj-adb.com",
    inLanguage: "ja",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://dj-adb.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// =============================================================================
// Person JSON-LD（作家ページ用）
// =============================================================================
// SEO目的:
// - 作家を「人物エンティティ」として Google / AI に明示
// - 作家名でのナレッジパネル候補化、AIモード引用時の精度向上
// - E-E-A-T の「専門性」を作家単位で表現
interface PersonJsonLdProps {
  name: string;
  /** 作品数 */
  workCount: number;
  /** 平均評価（1-5） */
  avgRating?: number | null;
  /** 代表作のサムネURL */
  thumbnailUrl?: string | null;
  /** ページURL（絶対URL） */
  pageUrl: string;
}

export function PersonJsonLd({
  name,
  workCount,
  avgRating,
  thumbnailUrl,
  pageUrl,
}: PersonJsonLdProps) {
  const description = `同人コミック・CG・商業電子書籍を手がける作家「${name}」の作品${workCount}件をまとめたページ。レビュー・評価・人気作・セール情報をDJ-ADB編集部が整理しています。`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: pageUrl,
    description,
    jobTitle: "漫画家",
    knowsAbout: ["同人コミック", "CG集", "商業電子書籍"],
  };

  if (thumbnailUrl) {
    jsonLd.image = thumbnailUrl;
  }

  if (avgRating && avgRating > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(2),
      reviewCount: workCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// =============================================================================
// Circle (Organization) JSON-LD（サークルページ用）
// =============================================================================
interface CircleOrganizationJsonLdProps {
  name: string;
  /** 作品数 */
  workCount: number;
  /** メインジャンル */
  mainGenre?: string | null;
  pageUrl: string;
}

export function CircleOrganizationJsonLd({
  name,
  workCount,
  mainGenre,
  pageUrl,
}: CircleOrganizationJsonLdProps) {
  const genreText = mainGenre ? `（${mainGenre}）` : "";
  const description = `同人サークル「${name}」${genreText}の作品${workCount}件をまとめたページ。サークルの代表作・人気作・セール情報をDJ-ADB編集部が整理しています。`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: pageUrl,
    description,
    additionalType: "https://schema.org/CreativeWork",
  };

  if (mainGenre) {
    jsonLd.knowsAbout = [mainGenre, "同人作品"];
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// =============================================================================
// Article JSON-LD（特集ページ用 / 編集部記事として明示）
// =============================================================================
interface ArticleJsonLdProps {
  headline: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  datePublished?: string;
}

export function ArticleJsonLd({
  headline,
  description,
  url,
  imageUrl,
  datePublished,
}: ArticleJsonLdProps) {
  const buildDate = getBuildDateIso();
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: headline.slice(0, 110),
    description,
    url,
    inLanguage: "ja",
    datePublished: datePublished ?? buildDate,
    dateModified: buildDate,
    author: {
      "@type": "Organization",
      name: "DJ-ADB編集部",
      url: "https://dj-adb.com/editorial/",
    },
    publisher: {
      "@type": "Organization",
      name: "DJ-ADB",
      url: "https://dj-adb.com",
      logo: {
        "@type": "ImageObject",
        url: "https://dj-adb.com/ogp/recommendation_ogp.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  if (imageUrl) {
    jsonLd.image = imageUrl;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
