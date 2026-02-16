import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { CircleListContent } from "@/components/circle-list-content";
import { getCirclesWithWorkCount } from "@/lib/parquet";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "サークル一覧 | DJ-ADB",
  description: "同人コミック・CGを手掛けるサークル一覧。お気に入りのサークルを見つけよう。",
};

export default async function CirclesPage() {
  const circles = await getCirclesWithWorkCount();

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
          <span className="text-foreground">サークル一覧</span>
        </nav>

        <h1 className="mb-4 text-2xl font-bold text-foreground">
          サークル一覧
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {circles.length}サークル
        </p>

        <CircleListContent circles={circles} />
      </main>

      <Footer />
    </div>
  );
}
