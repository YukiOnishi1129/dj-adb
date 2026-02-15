/**
 * データローダー
 *
 * prebuild-data.mjsで生成されたJSONキャッシュからデータを読み込む。
 * ビルド時に一度だけ読み込んでメモリにキャッシュする。
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type {
  Work,
  Circle,
  CircleFeature,
  DailyRecommendation,
  SaleFeature,
} from "@/types";

// キャッシュディレクトリのパス
const CACHE_DIR = join(process.cwd(), ".cache/data");

// キャッシュ用
let worksCache: Work[] | null = null;
let circlesCache: Circle[] | null = null;
let circlesFeaturesCache: CircleFeature[] | null = null;
let dailyRecommendationsCache: DailyRecommendation[] | null = null;
let saleFeaturesCache: SaleFeature[] | null = null;

/**
 * JSONキャッシュファイルを読み込む
 */
function loadJson<T>(filename: string): T[] {
  const filePath = join(CACHE_DIR, filename);
  if (!existsSync(filePath)) {
    console.warn(`Cache file not found: ${filePath}`);
    return [];
  }
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T[];
}

/**
 * 作品データを取得（キャッシュ付き）
 */
export async function getWorks(): Promise<Work[]> {
  if (worksCache === null) {
    worksCache = loadJson<Work>("works.json");
    console.log(`Loaded ${worksCache.length} works from cache`);
  }
  return worksCache;
}

/**
 * IDで作品を取得
 */
export async function getWorkById(id: number): Promise<Work | undefined> {
  const works = await getWorks();
  return works.find((w) => w.id === id);
}

/**
 * サークルデータを取得（キャッシュ付き）
 */
export async function getCircles(): Promise<Circle[]> {
  if (circlesCache === null) {
    circlesCache = loadJson<Circle>("circles.json");
    console.log(`Loaded ${circlesCache.length} circles from cache`);
  }
  return circlesCache;
}

/**
 * サークル特集一覧を取得
 */
export async function getCircleFeatures(): Promise<CircleFeature[]> {
  if (circlesFeaturesCache === null) {
    circlesFeaturesCache = loadJson<CircleFeature>("circle_features.json");
    console.log(
      `Loaded ${circlesFeaturesCache.length} circle features from cache`
    );
  }
  return circlesFeaturesCache;
}

/**
 * スラッグでサークル特集を取得
 */
export async function getCircleFeatureBySlug(
  slug: string
): Promise<CircleFeature | undefined> {
  const features = await getCircleFeatures();
  // URLエンコードされた日本語スラッグをデコードして比較
  const decodedSlug = decodeURIComponent(slug);
  return features.find((f) => f.slug === decodedSlug);
}

/**
 * 今日のおすすめ一覧を取得
 */
export async function getDailyRecommendations(): Promise<
  DailyRecommendation[]
> {
  if (dailyRecommendationsCache === null) {
    dailyRecommendationsCache = loadJson<DailyRecommendation>(
      "daily_recommendations.json"
    );
    console.log(
      `Loaded ${dailyRecommendationsCache.length} daily recommendations from cache`
    );
  }
  return dailyRecommendationsCache;
}

/**
 * 最新の今日のおすすめを取得
 */
export async function getLatestDailyRecommendation(): Promise<
  DailyRecommendation | undefined
> {
  const recommendations = await getDailyRecommendations();
  if (recommendations.length === 0) return undefined;

  // 日付でソートして最新を返す
  return recommendations.sort(
    (a, b) =>
      new Date(b.target_date).getTime() - new Date(a.target_date).getTime()
  )[0];
}

/**
 * セール特集一覧を取得
 */
export async function getSaleFeatures(): Promise<SaleFeature[]> {
  if (saleFeaturesCache === null) {
    saleFeaturesCache = loadJson<SaleFeature>("sale_features.json");
    console.log(`Loaded ${saleFeaturesCache.length} sale features from cache`);
  }
  return saleFeaturesCache;
}

/**
 * 最新のセール特集を取得
 */
export async function getLatestSaleFeature(): Promise<SaleFeature | undefined> {
  const features = await getSaleFeatures();
  if (features.length === 0) return undefined;

  return features.sort(
    (a, b) =>
      new Date(b.target_date).getTime() - new Date(a.target_date).getTime()
  )[0];
}

/**
 * キャッシュをクリアする（テスト用）
 */
export function clearCache(): void {
  worksCache = null;
  circlesCache = null;
  circlesFeaturesCache = null;
  dailyRecommendationsCache = null;
  saleFeaturesCache = null;
}
