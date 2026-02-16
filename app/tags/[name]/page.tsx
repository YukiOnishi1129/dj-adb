import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { WorkGrid } from "@/components/work";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getWorks } from "@/lib/parquet";

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const works = await getWorks();
  const tagWorks = works.filter((w) => w.genre_tags?.includes(decodedName));

  if (tagWorks.length === 0) {
    return {
      title: "タグが見つかりません | DJ-ADB",
    };
  }

  const title = `「${decodedName}」タグの作品一覧（${tagWorks.length}作品） | DJ-ADB`;
  const description = `「${decodedName}」タグが付いた同人コミック・CG集${tagWorks.length}作品を掲載。`;

  return {
    title,
    description,
  };
}

export async function generateStaticParams(): Promise<{ name: string }[]> {
  const works = await getWorks();

  // 全タグを収集
  const tagSet = new Set<string>();
  works.forEach((w) => {
    w.genre_tags?.forEach((tag) => tagSet.add(tag));
  });

  console.log(`[Tag Page] generateStaticParams: ${tagSet.size} tags found`);

  if (tagSet.size === 0) {
    return [{ name: "__placeholder__" }];
  }

  return Array.from(tagSet).map((name) => ({ name }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export default async function TagDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const allWorks = await getWorks();

  // このタグを持つ作品を取得
  const tagWorks = allWorks.filter((w) => w.genre_tags?.includes(decodedName));

  if (tagWorks.length === 0) {
    notFound();
  }

  // 評価順でソート
  const sortedWorks = tagWorks.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  // 関連タグを収集（このタグの作品に付いている他のタグ）
  const relatedTagCounts = new Map<string, number>();
  tagWorks.forEach((w) => {
    w.genre_tags?.forEach((tag) => {
      if (tag !== decodedName) {
        relatedTagCounts.set(tag, (relatedTagCounts.get(tag) || 0) + 1);
      }
    });
  });
  const relatedTags = Array.from(relatedTagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

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
          <Link href="/tags" className="hover:text-foreground">
            タグ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{decodedName}</span>
        </nav>

        {/* ヘッダーカード */}
        <Card className="mb-6 border-border">
          <CardContent className="p-5">
            <h1 className="text-xl font-bold text-foreground">#{decodedName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {sortedWorks.length}作品
            </p>
          </CardContent>
        </Card>

        {/* 関連タグ */}
        {relatedTags.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">関連タグ</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map(([tagName, count]) => (
                <Link key={tagName} href={`/tags/${encodeURIComponent(tagName)}`}>
                  <Badge variant="tag" className="cursor-pointer text-sm hover:opacity-80">
                    {tagName}
                    <span className="ml-1 opacity-70">({count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 作品一覧 */}
        <h2 className="mb-4 text-lg font-bold text-foreground">作品一覧</h2>
        <WorkGrid works={sortedWorks} />
      </main>

      <Footer />
    </div>
  );
}
