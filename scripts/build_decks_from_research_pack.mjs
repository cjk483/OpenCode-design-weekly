import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PptxGenJS = require("C:/Users/cjk48/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs/dist/pptxgen.cjs.js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const packDate = process.argv[2] || "2026-05-08";
const packDir = path.join(root, "output", "research-pack", packDate);
const outDir = path.join(root, "output", "codex-curated");

const W = 13.333;
const H = 7.5;
const fonts = { en: "AURA", zh: "中黑體" };
const palette = {
  paper: "F7F3EA",
  wash: "E8DFD2",
  ink: "292724",
  muted: "746C60",
  hair: "C9BDAE",
  moss: "758765",
  blue: "5C7D8C",
  clay: "B36A48",
};

const siteConfig = {
  gooood: {
    title: "谷德設計網設計週報",
    site: "gooood / 谷德設計網",
    accent: palette.moss,
    file: "Curated_Gooood_Design_Weekly_2026-05-08.pptx",
    thesis: "本週 gooood 的線索集中在城市公共性、辦公更新、住宅改造與材料實驗。",
  },
  wallpaper: {
    title: "Wallpaper 設計週報",
    site: "Wallpaper*",
    accent: palette.blue,
    file: "Curated_Wallpaper_Design_Weekly_2026-05-08.pptx",
    thesis: "Wallpaper 本週把設計事件、展覽、住宅與建築保存串成一條精緻生活線索。",
  },
  ad: {
    title: "Architectural Digest 設計週報",
    site: "Architectural Digest",
    accent: palette.clay,
    file: "Curated_Architectural_Digest_Design_Weekly_2026-05-08.pptx",
    thesis: "AD 本週以住宅、收藏、身份與室內敘事為主，空間成為生活故事的容器。",
  },
};

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function pickImage(article) {
  const candidates = [...(article.candidates || [])]
    .filter((c) => c.quality?.ok)
    .sort((a, b) => {
      const aq = (a.quality.width || 0) * (a.quality.height || 0);
      const bq = (b.quality.width || 0) * (b.quality.height || 0);
      const ar = Math.abs((a.quality.width || 1) / (a.quality.height || 1) - 1.55);
      const br = Math.abs((b.quality.width || 1) / (b.quality.height || 1) - 1.55);
      return br - ar || bq - aq;
    });
  const chosen = candidates[0] || article.candidates?.[0];
  return chosen ? path.join(packDir, chosen.path) : undefined;
}

function keepArticles(site) {
  const withImages = site.articles
    .filter((a) => pickImage(a) && fsSync.existsSync(pickImage(a)))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  return withImages.slice(0, 12);
}

function addText(slide, text, x, y, w, h, opts = {}) {
  slide.addText(clean(text), {
    x, y, w, h,
    margin: opts.margin ?? 0,
    fontFace: opts.fontFace || fonts.zh,
    fontSize: opts.fontSize || 15,
    color: opts.color || palette.ink,
    bold: opts.bold || false,
    fit: "shrink",
    valign: opts.valign || "top",
    align: opts.align || "left",
    breakLine: false,
    ...opts,
  });
}

function addFooter(slide, cfg, n) {
  slide.addShape("line", { x: 0.55, y: 7.08, w: 12.25, h: 0, line: { color: palette.hair, width: 0.6 } });
  addText(slide, cfg.site, 0.58, 7.17, 4.0, 0.18, { fontFace: fonts.en, fontSize: 7.5, color: palette.muted });
  addText(slide, "2026.05.01 - 2026.05.08", 5.1, 7.17, 3.0, 0.18, { fontFace: fonts.en, fontSize: 7.5, color: palette.muted, align: "center" });
  addText(slide, String(n).padStart(2, "0"), 12.05, 7.14, 0.6, 0.18, { fontFace: fonts.en, fontSize: 8, color: palette.muted, align: "right" });
}

function base(pptx, cfg, n) {
  const slide = pptx.addSlide();
  slide.background = { color: palette.paper };
  addFooter(slide, cfg, n);
  return slide;
}

function addImage(slide, img, x, y, w, h) {
  slide.addShape("rect", { x, y, w, h, fill: { color: palette.wash }, line: { color: palette.wash } });
  slide.addImage({ path: img, x, y, w, h, sizing: { type: "contain", x, y, w, h } });
}

function trendWords(articles) {
  const text = articles.map((a) => `${a.title} ${a.description}`).join(" ").toLowerCase();
  const terms = [
    ["展覽與活動", ["exhibition", "event", "festival", "design week", "展覽", "活动"]],
    ["住宅與生活敘事", ["home", "house", "residential", "住宅", "apartment"]],
    ["材料與永續", ["material", "sustainable", "reuse", "zero", "wood", "材料"]],
    ["城市與公共性", ["public", "city", "urban", "park", "城市", "公共"]],
  ];
  return terms.map(([label, keys]) => {
    const count = keys.reduce((sum, key) => sum + (text.includes(key) ? 1 : 0), 0);
    return { label, count: Math.max(count, 1) };
  });
}

function slideCover(pptx, cfg, articles) {
  const slide = base(pptx, cfg, 1);
  const img = pickImage(articles[0]);
  addImage(slide, img, 6.8, 0, 6.53, 7.5);
  slide.addShape("rect", { x: 0, y: 0, w: 6.85, h: 7.5, fill: { color: palette.paper }, line: { color: palette.paper } });
  slide.addShape("rect", { x: 0.72, y: 0.68, w: 0.08, h: 1.16, fill: { color: cfg.accent }, line: { color: cfg.accent } });
  addText(slide, "CURATED DESIGN WEEKLY", 0.95, 0.72, 3.4, 0.22, { fontFace: fonts.en, fontSize: 8.5, color: palette.muted, charSpace: 1.4 });
  addText(slide, cfg.title, 0.92, 1.35, 5.35, 1.35, { fontSize: 34, bold: true });
  addText(slide, cfg.thesis, 0.95, 3.05, 4.95, 0.75, { fontSize: 17 });
  addText(slide, "以人工策展邏輯挑選素材包中最穩定的圖面與新聞，避免低品質圖片直接進入簡報。", 0.95, 5.75, 4.9, 0.45, { fontSize: 12.5, color: palette.muted });
}

function slideTrends(pptx, cfg, articles) {
  const slide = base(pptx, cfg, 2);
  addText(slide, "本週趨勢", 0.72, 0.62, 2, 0.26, { fontSize: 13, color: cfg.accent, bold: true });
  addText(slide, cfg.thesis, 0.72, 1.05, 6.6, 0.82, { fontSize: 25, bold: true });
  const trends = trendWords(articles);
  trends.forEach((trend, i) => {
    const x = 0.95 + i * 3.0;
    const barH = 0.45 + trend.count * 0.25;
    slide.addShape("rect", { x, y: 5.55 - barH, w: 1.6, h: barH, fill: { color: cfg.accent, transparency: 15 }, line: { color: cfg.accent } });
    addText(slide, trend.label, x - 0.25, 5.85, 2.1, 0.38, { fontSize: 14, bold: true, align: "center" });
  });
  addText(slide, "判讀：本頁不是統計圖，而是用本週標題與摘要建立的策展方向，供後續選題與專案研究使用。", 0.82, 6.45, 8.3, 0.3, { fontSize: 11.5, color: palette.muted });
}

function slideArticle(pptx, cfg, article, n, i) {
  const slide = base(pptx, cfg, n);
  const img = pickImage(article);
  const desc = article.description || "此篇來源摘要不足，建議閱讀原文後再拆成研究卡片。";
  if (i % 3 === 0) {
    addImage(slide, img, 0.55, 0.55, 7.05, 5.95);
    addText(slide, article.title, 8.0, 0.85, 4.2, 1.05, { fontSize: 24, bold: true });
    addText(slide, desc, 8.03, 2.25, 3.9, 0.9, { fontSize: 14 });
    slide.addShape("rect", { x: 8.05, y: 4.52, w: 2.5, h: 0.04, fill: { color: cfg.accent }, line: { color: cfg.accent } });
    addText(slide, "設計判讀", 8.05, 4.82, 1.2, 0.22, { fontSize: 10.5, color: palette.muted });
    addText(slide, "把圖面視為方法線索，而不是單純案例圖片。", 8.05, 5.18, 3.2, 0.45, { fontSize: 13, color: palette.ink });
  } else if (i % 3 === 1) {
    addImage(slide, img, 0.7, 0.65, 11.95, 4.75);
    slide.addShape("rect", { x: 0.72, y: 5.0, w: 11.9, h: 0.9, fill: { color: palette.paper, transparency: 5 }, line: { color: palette.paper } });
    addText(slide, article.title, 0.95, 5.18, 4.7, 0.46, { fontSize: 19, bold: true });
    addText(slide, desc, 6.05, 5.18, 5.6, 0.48, { fontSize: 12.5 });
  } else {
    addText(slide, article.title, 0.78, 0.88, 4.2, 1.1, { fontSize: 24, bold: true });
    addText(slide, desc, 0.8, 2.42, 3.75, 0.85, { fontSize: 14 });
    addImage(slide, img, 5.15, 0.62, 7.15, 5.85);
    slide.addShape("rect", { x: 0.8, y: 5.48, w: 2.0, h: 0.04, fill: { color: cfg.accent }, line: { color: cfg.accent } });
    addText(slide, new URL(article.url).hostname, 0.8, 5.75, 3.3, 0.22, { fontFace: fonts.en, fontSize: 8, color: palette.muted });
  }
}

function slideAnalysis(pptx, cfg, n, title, points, image) {
  const slide = base(pptx, cfg, n);
  addImage(slide, image, 7.0, 0.75, 5.35, 4.8);
  addText(slide, "EDITORIAL NOTE", 0.75, 0.68, 2.4, 0.2, { fontFace: fonts.en, fontSize: 8, color: cfg.accent, charSpace: 1.2 });
  addText(slide, title, 0.75, 1.12, 5.3, 0.82, { fontSize: 25, bold: true });
  points.forEach((point, i) => {
    const y = 2.45 + i * 0.82;
    slide.addShape("rect", { x: 0.78, y: y + 0.08, w: 0.1, h: 0.1, fill: { color: cfg.accent }, line: { color: cfg.accent } });
    addText(slide, point, 1.02, y, 4.85, 0.35, { fontSize: 13.5 });
  });
}

function slideSources(pptx, cfg, articles) {
  const slide = base(pptx, cfg, 20);
  addText(slide, "來源與後續", 0.75, 0.72, 3.1, 0.3, { fontSize: 21, bold: true });
  addText(slide, "本版簡報使用素材包中通過品質檢查的候選圖。正式歸檔時，建議將重要案例拆成單篇 Obsidian 研究卡。", 0.75, 1.2, 7.3, 0.45, { fontSize: 13.5, color: palette.muted });
  articles.slice(0, 10).forEach((a, i) => {
    const x = i < 5 ? 0.9 : 6.85;
    const y = 2.1 + (i % 5) * 0.74;
    slide.addShape("rect", { x, y: y + 0.08, w: 0.1, h: 0.1, fill: { color: cfg.accent }, line: { color: cfg.accent } });
    addText(slide, a.title, x + 0.24, y, 4.8, 0.28, { fontSize: 10.5 });
    addText(slide, a.url, x + 0.24, y + 0.31, 4.8, 0.16, { fontFace: fonts.en, fontSize: 5.8, color: palette.muted });
  });
}

async function build(site) {
  const cfg = siteConfig[site.key];
  const articles = keepArticles(site);
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "CUSTOM_WIDE", width: W, height: H });
  pptx.layout = "CUSTOM_WIDE";
  pptx.author = "Codex";
  pptx.company = "Codex";
  pptx.subject = cfg.title;
  pptx.title = cfg.title;
  pptx.lang = "zh-TW";
  pptx.theme = { headFontFace: fonts.en, bodyFontFace: fonts.zh, lang: "zh-TW" };

  slideCover(pptx, cfg, articles);
  slideTrends(pptx, cfg, articles);
  articles.slice(0, 12).forEach((article, i) => slideArticle(pptx, cfg, article, i + 3, i));
  slideAnalysis(pptx, cfg, 15, "本週圖面如何轉成設計判斷？", [
    "只保留能看清空間、物件或展場關係的圖片。",
    "避免把網站截圖當成裝飾，圖片必須支撐該頁判讀。",
    "小圖、空白圖與廣告感素材不進正式簡報。",
    "圖面不足時寧可留白或改摘要，不硬塞圖片。",
  ], pickImage(articles[1] || articles[0]));
  slideAnalysis(pptx, cfg, 16, "新聞摘要如何整理？", [
    "先抓設計問題，再寫案例名稱。",
    "每頁只保留一個判讀，不堆疊多個議題。",
    "活動、展覽與研討會放在趨勢脈絡，不單獨列流水帳。",
    "每個案例都保留來源連結，方便回查。",
  ], pickImage(articles[2] || articles[0]));
  slideAnalysis(pptx, cfg, 17, "可帶回建築工作的線索", [
    "材料與永續議題可轉成材料庫條目。",
    "住宅案例可轉成平面、收納、光線與材質研究。",
    "展覽活動可追蹤策展方法與展示構造。",
    "城市公共性案例可轉成基地分析參考。",
  ], pickImage(articles[3] || articles[0]));
  slideAnalysis(pptx, cfg, 18, "下週追蹤", [
    "補齊沒有高品質圖片但題目重要的案例。",
    "把同一議題跨網站比較，避免單一媒體視角。",
    "將高分候選新聞拆成 Obsidian 研究卡。",
    "建立可長期追蹤的設計趨勢索引。",
  ], pickImage(articles[4] || articles[0]));
  slideAnalysis(pptx, cfg, 19, "正式歸檔建議", [
    "簡報只作為閱讀入口，不取代來源文章。",
    "保留素材包，讓未來可以回頭重選圖片。",
    "對每週最值得研究的 3 個案例做深度筆記。",
    "將圖片品質檢查保留為固定流程。",
  ], pickImage(articles[5] || articles[0]));
  slideSources(pptx, cfg, articles);

  await fs.mkdir(outDir, { recursive: true });
  const out = path.join(outDir, cfg.file);
  await pptx.writeFile({ fileName: out });
  return out;
}

const data = JSON.parse(await fs.readFile(path.join(packDir, "research-pack.json"), "utf8"));
const outputs = [];
for (const site of data) outputs.push(await build(site));
console.log(outputs.join("\n"));
