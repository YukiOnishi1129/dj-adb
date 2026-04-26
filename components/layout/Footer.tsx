import Link from "next/link";
import { getWorks, getCirclesWithWorkCount } from "@/lib/parquet";

// 人気タグ・人気サークルをビルド時に取得して全ページのフッターから内部リンクを張る
// 目的: 全ページからクロール経路を作り、SEO的にサイト全体のリンクジュースを循環させる
async function getPopularData() {
  const [works, circles] = await Promise.all([getWorks(), getCirclesWithWorkCount()]);

  // 人気タグ: 全作品からタグ集計し上位を抽出
  const tagCounts = new Map<string, number>();
  works.forEach((w) => {
    w.genre_tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const popularTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([tag]) => tag);

  // 人気サークル: 作品数上位
  const popularCircles = circles.slice(0, 8).map((c) => c.name);

  return { popularTags, popularCircles };
}

export async function Footer() {
  const { popularTags, popularCircles } = await getPopularData();

  return (
    <footer className="mt-16 border-t border-border bg-secondary py-8">
      <div className="mx-auto max-w-7xl px-6 text-sm text-foreground/60">
        {/* 人気タグ・人気サークルの内部リンク群（SEO: 全ページからクロール経路を確保） */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {popularTags.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
                人気のジャンル・タグ
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="rounded-md bg-background px-2 py-1 text-xs hover:text-foreground hover:bg-pink-500/10"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {popularCircles.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
                人気のサークル
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularCircles.map((circle) => (
                  <Link
                    key={circle}
                    href={`/circles/${encodeURIComponent(circle)}`}
                    className="rounded-md bg-background px-2 py-1 text-xs hover:text-foreground hover:bg-pink-500/10"
                  >
                    {circle}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="mb-2">DJ-ADB - 同人コミック・CGデータベース</p>
          <div className="mb-4 flex flex-wrap justify-center gap-4">
            <Link href="/works" className="hover:text-foreground">
              作品一覧
            </Link>
            <Link href="/sale" className="hover:text-foreground">
              セール
            </Link>
            <Link href="/features/genre" className="hover:text-foreground">
              ジャンル特集
            </Link>
            <Link href="/features/circle" className="hover:text-foreground">
              サークル特集
            </Link>
            <Link href="/features/daily" className="hover:text-foreground">
              おすすめ
            </Link>
            <Link href="/circles" className="hover:text-foreground">
              サークル一覧
            </Link>
            <Link href="/tags" className="hover:text-foreground">
              タグ一覧
            </Link>
          </div>
          {/* 姉妹サイト */}
          <div className="mb-4">
            <p className="mb-2 text-xs text-foreground/40">姉妹サイト</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://2d-adb.com" className="hover:text-foreground" target="_blank" rel="noopener noreferrer">
                2D-ADB（二次元ASMR）
              </a>
            </div>
          </div>
          {/* FANZA API クレジット表記 */}
          <p className="mt-4 text-xs text-foreground/40">
            Powered by{" "}
            <a
              href="https://affiliate.dmm.com/api/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground/60"
            >
              FANZA Webサービス
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
