import Fuse, { type IFuseOptions } from "fuse.js";

export type SearchItem = {
  id: number;
  t: string; // タイトル
  c: string; // サークル名
  a: string; // 作者名
  tg: string[]; // タグ名リスト
  p: number; // 現在価格
  dp: number; // 定価
  dr: number | null; // 割引率
  img: string; // サムネイルURL
  pg: number; // ページ数
  rt: number | null; // 評価
  rc: number | null; // レビュー数
  rk: number | null; // ランキング
  saleEnd: string | null; // セール終了日
};

export type SortType = "rank" | "new" | "discount" | "price" | "rating";
export type PriceFilter = "all" | "500" | "1000" | "1500" | "2000";

// Fuse.js設定
const fuseOptions: IFuseOptions<SearchItem> = {
  keys: [
    { name: "t", weight: 1.0 }, // タイトル
    { name: "a", weight: 0.8 }, // 作者
    { name: "c", weight: 0.5 }, // サークル
    { name: "tg", weight: 0.3 }, // タグ
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
};

// 検索実行
export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  if (!query.trim()) {
    return items;
  }

  const fuse = new Fuse(items, fuseOptions);

  // スペース区切りでAND検索
  const terms = query.trim().split(/\s+/);

  if (terms.length === 1) {
    return fuse.search(terms[0]).map((r) => r.item);
  }

  // 複数ワードの場合はAND検索
  let results = items;
  for (const term of terms) {
    const termFuse = new Fuse(results, fuseOptions);
    results = termFuse.search(term).map((r) => r.item);
  }
  return results;
}

// ソート
export function sortItems(items: SearchItem[], sortType: SortType): SearchItem[] {
  const sorted = [...items];

  switch (sortType) {
    case "rank":
      // ランキング順（なければ末尾）
      return sorted.sort((a, b) => {
        const rankA = a.rk ?? Infinity;
        const rankB = b.rk ?? Infinity;
        return rankA - rankB;
      });
    case "new":
      // ID降順（新しい順）
      return sorted.sort((a, b) => b.id - a.id);
    case "discount":
      return sorted.sort((a, b) => (b.dr ?? 0) - (a.dr ?? 0));
    case "price":
      return sorted.sort((a, b) => a.p - b.p);
    case "rating":
      return sorted.sort((a, b) => (b.rt ?? 0) - (a.rt ?? 0));
    default:
      return sorted;
  }
}

// フィルター
export function filterItems(
  items: SearchItem[],
  onSaleOnly: boolean,
  maxPrice: PriceFilter = "all"
): SearchItem[] {
  let filtered = items;

  if (onSaleOnly) {
    filtered = filtered.filter((item) => item.dr !== null && item.dr > 0);
  }

  if (maxPrice !== "all") {
    const limit = parseInt(maxPrice, 10);
    filtered = filtered.filter((item) => item.p <= limit);
  }

  return filtered;
}

// 単価計算（円/ページ）
export function getUnitPrice(item: SearchItem): string | null {
  if (item.pg > 0) {
    const unitPrice = Math.round(item.p / item.pg);
    return `${unitPrice}円/P`;
  }
  return null;
}
