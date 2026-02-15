/**
 * 検索インデックスJSON生成スクリプト
 * ビルド前に実行して public/data/search-index.json を生成する
 *
 * R2のParquetファイルからデータを取得
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readParquet } from "parquet-wasm";
import { tableFromIPC } from "apache-arrow";

// .env.local を手動で読み込む
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=");
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

// R2の公開ドメイン
const R2_PUBLIC_DOMAIN =
  process.env.R2_PUBLIC_DOMAIN ||
  "https://pub-4cc814a862024d6fa782c016e12c13ed.r2.dev";

const OUTPUT_PATH = join(__dirname, "../public/data/search-index.json");

/**
 * ParquetファイルをR2からダウンロードしてパースする
 */
async function fetchParquet(filename) {
  const url = `${R2_PUBLIC_DOMAIN}/parquet/${filename}`;
  console.log(`Fetching: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();

  // parquet-wasmでParquetを読み込み、IPC形式に変換
  const wasmTable = readParquet(new Uint8Array(buffer));
  const ipcBuffer = wasmTable.intoIPCStream();

  // apache-arrowでIPCを読み込み
  const arrowTable = tableFromIPC(ipcBuffer);

  const rows = [];

  for (let i = 0; i < arrowTable.numRows; i++) {
    const row = {};
    for (const field of arrowTable.schema.fields) {
      const column = arrowTable.getChild(field.name);
      if (column) {
        let value = column.get(i);
        if (typeof value === "bigint") {
          value = Number(value);
        }
        if (
          typeof value === "string" &&
          (value.startsWith("[") || value.startsWith("{"))
        ) {
          try {
            value = JSON.parse(value);
          } catch {
            // パース失敗時はそのまま
          }
        }
        row[field.name] = value;
      }
    }
    rows.push(row);
  }

  return rows;
}

/**
 * Work → SearchItem 変換（同人コミック/CG用）
 */
function convertToSearchItem(work) {
  const currentPrice = work.sale_price || work.price || 0;
  const originalPrice = work.price || currentPrice;
  const discountRate = work.discount_rate || null;

  return {
    id: work.id,
    t: work.title,
    c: work.circle_name || "",
    a: work.author_name || "", // 作者名
    tg: work.genre_tags || [],
    p: currentPrice,
    dp: originalPrice,
    dr: discountRate,
    img: work.thumbnail_url || "",
    pg: work.page_count || 0, // ページ数
    rt: work.rating || null,
    rk: work.ranking || null,
  };
}

async function main() {
  console.log("Fetching works from R2 Parquet...");

  // 作品データとサークルデータを取得
  const [works, circles] = await Promise.all([
    fetchParquet("works.parquet"),
    fetchParquet("circles.parquet"),
  ]);

  console.log(`Found ${works.length} works, ${circles.length} circles`);

  // サークル名を付与
  const circleMap = new Map(circles.map((c) => [c.id, c.name]));
  const enrichedWorks = works
    .map((w) => ({
      ...w,
      circle_name: w.circle_id ? circleMap.get(w.circle_id) || w.circle_name : w.circle_name,
    }))
    .sort((a, b) => {
      // ランキング順（なければIDの降順＝新しい順）
      if (a.ranking && b.ranking) return a.ranking - b.ranking;
      if (a.ranking) return -1;
      if (b.ranking) return 1;
      return b.id - a.id;
    });

  const searchIndex = enrichedWorks.map(convertToSearchItem);

  // ディレクトリ作成
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  // JSON出力
  writeFileSync(OUTPUT_PATH, JSON.stringify(searchIndex, null, 2), "utf-8");

  console.log(`✓ Generated ${searchIndex.length} items → ${OUTPUT_PATH}`);
}

main().catch(console.error);
