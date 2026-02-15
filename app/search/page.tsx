import { Header, Footer } from "@/components/layout";
import { SearchContent } from "@/components/search-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "作品検索",
  description: "同人コミック・CG作品を検索。タイトル、作者、サークル、タグで絞り込み。",
};

export const dynamic = "force-static";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-4">
        <SearchContent />
      </main>

      <Footer />
    </div>
  );
}
