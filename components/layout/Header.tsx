"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* ロゴ + タグライン */}
        <Link href="/" className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-primary md:text-xl">DJ</span>
            <span className="text-lg font-bold text-foreground md:text-xl">
              -ADB
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground md:text-[10px]">
            同人コミック・CGデータベース
          </span>
        </Link>

        {/* ナビゲーション */}
        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink href="/works">作品一覧</NavLink>
          <NavLink href="/features/circle">サークル特集</NavLink>
          <NavLink href="/features/daily">おすすめ</NavLink>
          <NavLink href="/features/sale" variant="accent">
            セール中
          </NavLink>
        </nav>

        {/* モバイル用シンプルリンク */}
        <div className="flex items-center gap-4 lg:hidden">
          <Link
            href="/features/sale"
            className="text-sm font-medium text-accent"
          >
            セール
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
  variant = "default",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "accent";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors",
        variant === "default"
          ? "text-muted-foreground hover:text-foreground"
          : "text-accent hover:text-accent/80"
      )}
    >
      {children}
    </Link>
  );
}
