"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import type { SearchItem } from "@/lib/search";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 検索結果は導出状態として計算
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return searchIndex
      .filter((item) => {
        return (
          item.t.toLowerCase().includes(q) ||
          item.c.toLowerCase().includes(q) ||
          item.a.toLowerCase().includes(q) ||
          item.tg.some((t) => t.toLowerCase().includes(q))
        );
      })
      .slice(0, 5);
  }, [query, searchIndex]);

  // isOpenは導出状態として計算
  const isOpen = isFocused && query.trim() !== "" && results.length > 0;

  // 検索インデックスを読み込み
  useEffect(() => {
    fetch("/data/search-index.json")
      .then((res) => res.json())
      .then((data) => setSearchIndex(data))
      .catch(() => {});
  }, []);

  // クリック外で閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsFocused(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="作品名・サークル名で検索"
            className="h-9 w-40 rounded-md border border-input bg-secondary pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring md:w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
        </div>
      </form>

      {/* 検索結果ドロップダウン */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-full min-w-72 rounded-md border border-border bg-background shadow-lg">
          <ul className="py-1">
            {results.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/works/${item.id}`}
                  className="block px-4 py-2 hover:bg-secondary"
                  onClick={() => {
                    setIsFocused(false);
                    setQuery("");
                  }}
                >
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.t}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.c}
                    {item.a && ` / ${item.a}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          {query.trim() && (
            <div className="border-t border-border px-4 py-2">
              <button
                type="button"
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                  setIsFocused(false);
                  setQuery("");
                }}
                className="text-sm text-primary hover:underline"
              >
                「{query}」で全件検索 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
