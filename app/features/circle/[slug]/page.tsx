import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Users } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { getCircleFeatures, getCircleFeatureBySlug } from "@/lib/parquet";
import { FeatureWorkCard } from "@/components/work";
import { formatRating } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = await getCircleFeatureBySlug(slug);

  if (!feature) {
    return { title: "サークル特集が見つかりません" };
  }

  return {
    title: feature.headline,
    description: feature.description,
    openGraph: {
      images: feature.thumbnail_url ? [feature.thumbnail_url] : [],
    },
  };
}

export async function generateStaticParams() {
  const features = await getCircleFeatures();
  return features.map((feature) => ({
    slug: feature.slug,
  }));
}

export const dynamic = "force-static";

export default async function CircleFeatureDetailPage({ params }: Props) {
  const { slug } = await params;
  const feature = await getCircleFeatureBySlug(slug);

  if (!feature) {
    notFound();
  }

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
          <Link href="/features/circle" className="hover:text-foreground">
            サークル特集
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{feature.headline}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-2xl font-bold text-foreground">{feature.headline}</h1>
          <p className="text-muted-foreground">{feature.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{feature.work_count}作品</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>平均 {formatRating(feature.avg_rating)}</span>
            </div>
          </div>
        </div>

        {/* Works */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">掲載作品</h2>
          <div className="grid gap-4">
            {feature.works.map((work) => (
              <FeatureWorkCard key={work.work_id} work={work} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
