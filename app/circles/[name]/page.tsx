import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { WorkGrid } from "@/components/work";
import { Card, CardContent } from "@/components/ui/card";
import { getWorksByCircleName, getAllCircleNames } from "@/lib/parquet";

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const works = await getWorksByCircleName(name);

  if (works.length === 0) {
    return {
      title: "サークルが見つかりません | DJ-ADB",
    };
  }

  const title = `${decodedName}の作品一覧（${works.length}作品） | DJ-ADB`;
  const description = `サークル「${decodedName}」の同人コミック・CG ${works.length}作品を掲載。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  const names = await getAllCircleNames();
  return names.map((name) => ({
    name: name,
  }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export default async function CircleDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const works = await getWorksByCircleName(name);

  if (works.length === 0) {
    notFound();
  }

  // 評価順にソート
  const sortedWorks = [...works].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* パンくずリスト */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            トップ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/circles" className="hover:text-foreground">
            サークル一覧
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{decodedName}</span>
        </nav>

        {/* ヘッダーカード */}
        <Card className="mb-6 border-border">
          <CardContent className="p-5">
            <h1 className="text-xl font-bold text-foreground">
              {decodedName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {works.length}作品
            </p>
          </CardContent>
        </Card>

        {/* 作品一覧 */}
        <h2 className="mb-4 text-lg font-bold text-foreground">作品一覧</h2>
        <WorkGrid works={sortedWorks} />
      </main>

      <Footer />
    </div>
  );
}
