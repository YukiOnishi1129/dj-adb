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
 * circle_nameがnullの場合はcirclesデータから補完する
 */
export async function getWorks(): Promise<Work[]> {
  if (worksCache === null) {
    const rawWorks = loadJson<Work>("works.json");
    const circles = loadJson<Circle>("circles.json");

    // circle_idからcircle_nameをマッピング
    const circleMap = new Map(circles.map((c) => [c.id, c.name]));

    // circle_nameを補完
    worksCache = rawWorks.map((work) => ({
      ...work,
      circle_name: work.circle_name || circleMap.get(work.circle_id) || "不明",
    }));

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
 * サークル名で作品を取得
 */
export async function getWorksByCircleName(circleName: string): Promise<Work[]> {
  const works = await getWorks();
  const decodedName = decodeURIComponent(circleName);
  return works.filter((w) => w.circle_name === decodedName);
}

/**
 * 全サークル名の一覧を取得（作品があるサークルのみ）
 */
export async function getAllCircleNames(): Promise<string[]> {
  const works = await getWorks();
  const circleNames = new Set(works.map((w) => w.circle_name));
  return [...circleNames].sort();
}

/**
 * サークル一覧を作品数付きで取得（作品数順）
 */
export async function getCirclesWithWorkCount(): Promise<
  { name: string; workCount: number }[]
> {
  const works = await getWorks();
  const countMap = new Map<string, number>();

  works.forEach((w) => {
    countMap.set(w.circle_name, (countMap.get(w.circle_name) || 0) + 1);
  });

  return [...countMap.entries()]
    .map(([name, workCount]) => ({ name, workCount }))
    .sort((a, b) => b.workCount - a.workCount);
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
 * 同じサークルの他の作品を取得（現在の作品を除く）
 */
export async function getRelatedWorksByCircle(
  circleName: string,
  excludeWorkId: number,
  limit: number = 6
): Promise<Work[]> {
  const works = await getWorks();
  return works
    .filter((w) => w.circle_name === circleName && w.id !== excludeWorkId)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}

/**
 * 同じジャンルのおすすめ作品を取得（現在の作品を除く）
 */
export async function getRelatedWorksByGenre(
  genreTags: string[],
  excludeWorkId: number,
  limit: number = 6
): Promise<Work[]> {
  if (!genreTags || genreTags.length === 0) return [];

  const works = await getWorks();
  const tagSet = new Set(genreTags);

  // ジャンルタグの一致数でスコアリング
  const scoredWorks = works
    .filter((w) => w.id !== excludeWorkId && w.genre_tags && w.genre_tags.length > 0)
    .map((w) => {
      const matchCount = w.genre_tags!.filter((tag) => tagSet.has(tag)).length;
      return { work: w, score: matchCount };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      // まずスコア、次に評価でソート
      if (b.score !== a.score) return b.score - a.score;
      return (b.work.rating ?? 0) - (a.work.rating ?? 0);
    });

  return scoredWorks.slice(0, limit).map((item) => item.work);
}

/**
 * サークル特集を名前で取得
 */
export async function getCircleFeatureByName(
  circleName: string
): Promise<CircleFeature | undefined> {
  const features = await getCircleFeatures();
  return features.find((f) => f.circle_name === circleName);
}

/**
 * こちらもおすすめ（評価の高い作品からランダムに取得）
 */
export async function getRecommendedWorks(
  excludeWorkId: number,
  limit: number = 4
): Promise<Work[]> {
  const works = await getWorks();

  // 評価4.0以上の作品を候補にする
  const candidates = works
    .filter((w) => w.id !== excludeWorkId && (w.rating ?? 0) >= 4.0)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  // 上位20件からランダムに選ぶ
  const top = candidates.slice(0, 20);
  const shuffled = top.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
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
