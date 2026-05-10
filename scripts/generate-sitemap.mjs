/**
 * サイトマップ生成スクリプト
 * prebuildで生成したJSONキャッシュからデータを取得
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://dj-adb.com";

function loadJson(filename) {
  const CACHE_DIR = join(__dirname, "../.cache/data");
  const path = join(CACHE_DIR, filename);
  if (!existsSync(path)) {
    console.warn(`Warning: ${filename} not found, using empty array`);
    return [];
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function main() {
  console.log("Loading data from prebuild cache...");

  const works = loadJson("works.json");
  const circles = loadJson("circles.json");
  const genreFeatures = loadJson("genre_features.json");
  const circleFeatures = loadJson("circle_features.json");
  const authorFeatures = loadJson("author_features.json");

  // 利用可能な作品のみ
  const availableWorks = works.filter((w) => w.is_available !== false);

  // 作品ID一覧
  const workIds = availableWorks.map((w) => w.id);

  // タグ一覧
  const tagNames = new Set();
  for (const work of availableWorks) {
    if (work.ai_tags) {
      for (const tag of work.ai_tags) {
        tagNames.add(tag);
      }
    }
  }

  // サークル一覧（作品があるもののみ）
  const circleIdsWithWorks = new Set(
    availableWorks.map((w) => w.circle_id).filter((id) => id !== null)
  );
  const circleNames = circles
    .filter((c) => circleIdsWithWorks.has(c.id))
    .map((c) => c.name);

  // 作家一覧（works.author_name から、空でないもの）
  const authorNamesSet = new Set();
  for (const w of availableWorks) {
    const name = (w.author_name || "").trim();
    if (name) authorNamesSet.add(name);
  }
  const authorNames = [...authorNamesSet];

  console.log(
    `[Sitemap] Works: ${workIds.length}, Tags: ${tagNames.size}, Circles: ${circleNames.length}, Authors: ${authorNames.length}`
  );

  const today = new Date().toISOString().split("T")[0];

  // XMLを生成
  const urls = [];

  // 静的ページ
  const staticPages = [
    { path: "", priority: "1.0", changefreq: "daily" },
    { path: "/works/", priority: "0.9", changefreq: "daily" },
    { path: "/sale/", priority: "0.9", changefreq: "daily" },
    { path: "/features/daily/", priority: "0.8", changefreq: "daily" },
    { path: "/features/sale/", priority: "0.8", changefreq: "daily" },
    { path: "/features/genre/", priority: "0.8", changefreq: "weekly" },
    { path: "/features/circle/", priority: "0.8", changefreq: "weekly" },
    { path: "/features/author/", priority: "0.8", changefreq: "weekly" },
    { path: "/search/", priority: "0.7", changefreq: "weekly" },
    { path: "/tags/", priority: "0.7", changefreq: "weekly" },
    { path: "/circles/", priority: "0.7", changefreq: "weekly" },
    { path: "/authors/", priority: "0.7", changefreq: "weekly" },
  ];

  for (const page of staticPages) {
    urls.push(`
    <url>
      <loc>${BASE_URL}${page.path}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`);
  }

  // 作品ページ（サムネ画像を <image:image> で含めて画像検索からの流入を狙う）
  // works.json から id → thumbnail_url, title のマップを作る
  const workMap = new Map();
  for (const w of availableWorks) {
    workMap.set(w.id, { thumbnail_url: w.thumbnail_url, title: w.title });
  }

  for (const id of workIds) {
    const w = workMap.get(id) || {};
    let imageBlock = "";
    if (w.thumbnail_url) {
      imageBlock = `
      <image:image>
        <image:loc>${escapeXml(w.thumbnail_url)}</image:loc>
        <image:title>${escapeXml(w.title || "")}</image:title>
      </image:image>`;
    }
    urls.push(`
    <url>
      <loc>${BASE_URL}/works/${id}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>${imageBlock}
    </url>`);
  }

  // タグページ
  for (const name of tagNames) {
    urls.push(`
    <url>
      <loc>${BASE_URL}/tags/${encodeURIComponent(name)}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
  }

  // サークルページ
  for (const name of circleNames) {
    urls.push(`
    <url>
      <loc>${BASE_URL}/circles/${encodeURIComponent(name)}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
  }

  // 作家ページ
  for (const name of authorNames) {
    urls.push(`
    <url>
      <loc>${BASE_URL}/authors/${encodeURIComponent(name)}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
  }

  // ジャンル特集ページ
  for (const feature of genreFeatures) {
    if (feature.slug) {
      urls.push(`
    <url>
      <loc>${BASE_URL}/features/genre/${encodeURIComponent(feature.slug)}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
    }
  }

  // サークル特集ページ
  for (const feature of circleFeatures) {
    if (feature.slug) {
      urls.push(`
    <url>
      <loc>${BASE_URL}/features/circle/${encodeURIComponent(feature.slug)}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
    }
  }

  // 作家特集ページ
  for (const feature of authorFeatures) {
    if (feature.slug) {
      urls.push(`
    <url>
      <loc>${BASE_URL}/features/author/${encodeURIComponent(feature.slug)}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
    }
  }

  // image namespace を追加（画像サイトマップ機能）
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls.join("")}
</urlset>
`;

  writeFileSync("public/sitemap.xml", sitemap);
  console.log(`[Sitemap] Generated with ${urls.length} URLs`);
}

main().catch(console.error);
