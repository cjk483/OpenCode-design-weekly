import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/cjk48/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { imageSize } = require("C:/Users/cjk48/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/image-size");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const stamp = new Date().toISOString().slice(0, 10);
const outDir = path.join(root, "output", "research-pack", stamp);
const imageDir = path.join(outDir, "images");

const sites = [
  {
    key: "gooood",
    label: "gooood / 谷德設計網",
    home: "https://www.gooood.cn/",
    indexPages: ["https://www.gooood.cn/", "https://www.gooood.cn/category/type/architecture", "https://www.gooood.cn/category/type/design"],
    include: /gooood\.cn\/(?!category|job|submissions|ad-|filter|find-designer|get-project-designer)[^#?]+\.htm/i,
  },
  {
    key: "wallpaper",
    label: "Wallpaper*",
    home: "https://www.wallpaper.com/",
    indexPages: ["https://www.wallpaper.com/design-interiors", "https://www.wallpaper.com/architecture"],
    include: /wallpaper\.com\/(design-interiors|architecture)\//i,
  },
  {
    key: "ad",
    label: "Architectural Digest",
    home: "https://www.architecturaldigest.com/",
    indexPages: ["https://www.architecturaldigest.com/architecture-design", "https://www.architecturaldigest.com/architecture-design/design"],
    include: /architecturaldigest\.com\/(story|gallery)\//i,
  },
];

function cleanText(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "'")
    .replace(/&#8212;/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function safeName(value) {
  return String(value || "item").replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 80);
}

function qualityOf(filePath) {
  try {
    const stat = fsSync.statSync(filePath);
    const size = imageSize(filePath);
    const w = size.width || 0;
    const h = size.height || 0;
    const ratio = w && h ? Math.max(w / h, h / w) : 99;
    const blank = stat.size < 40_000;
    const small = w < 900 || h < 520;
    return {
      ok: !blank && !small && ratio < 4.2,
      width: w,
      height: h,
      bytes: stat.size,
      warnings: [blank ? "可能是空白或阻擋頁" : "", small ? "解析度偏低" : "", ratio >= 4.2 ? "比例過長" : ""].filter(Boolean),
    };
  } catch {
    return { ok: false, width: 0, height: 0, bytes: 0, warnings: ["無法讀取圖片"] };
  }
}

async function ensureDirs() {
  await fs.mkdir(imageDir, { recursive: true });
}

async function collectLinks(page, site) {
  const found = [];
  for (const indexPage of site.indexPages) {
    try {
      await page.goto(indexPage, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(1500);
      const links = await page.locator("a[href]").evaluateAll((anchors) =>
        anchors.map((a) => ({
          href: a.href,
          title: (a.innerText || a.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim(),
        }))
      );
      for (const link of links) {
        if (!site.include.test(link.href)) continue;
        if (!link.title || link.title.length < 8) continue;
        found.push({ title: cleanText(link.title), url: link.href });
      }
    } catch {}
  }
  const unique = [];
  const seen = new Set();
  for (const item of found) {
    const key = item.url.split("#")[0].split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ ...item, url: key });
  }
  return unique.slice(0, 12);
}

async function articleMeta(page) {
  return page.evaluate(() => {
    const meta = (selector) => document.querySelector(selector)?.getAttribute("content") || "";
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((node) => {
        try { return JSON.parse(node.textContent); } catch { return undefined; }
      })
      .filter(Boolean);
    const date =
      meta('meta[property="article:published_time"]') ||
      meta('meta[name="date"]') ||
      meta('meta[property="og:updated_time"]') ||
      jsonLd.map((x) => x.datePublished || x.dateModified).find(Boolean) ||
      "";
    const description =
      meta('meta[name="description"]') ||
      meta('meta[property="og:description"]') ||
      "";
    return { date, description };
  });
}

async function dismissOverlays(page) {
  try {
    await page.addStyleTag({
      content: `
      [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i],
      [id*="newsletter" i], [class*="newsletter" i], [role="dialog"], iframe,
      .ad, [class*="advert" i], [id*="advert" i] {
        opacity: 0 !important; pointer-events: none !important;
      }`,
    });
  } catch {}
}

async function captureCandidates(page, site, article, index) {
  const candidates = [];
  const pageDir = path.join(imageDir, site.key);
  await fs.mkdir(pageDir, { recursive: true });
  try {
    await page.goto(article.url, { waitUntil: "domcontentloaded", timeout: 55_000 });
    await page.waitForTimeout(2200);
    await dismissOverlays(page);
    const meta = await articleMeta(page);
    article.description = cleanText(meta.description);
    article.date = cleanText(meta.date);

    const handles = await page.locator("main img, article img, picture img, figure img, img").elementHandles();
    const scored = [];
    for (let i = 0; i < handles.length; i++) {
      const box = await handles[i].boundingBox().catch(() => undefined);
      const natural = await handles[i].evaluate((img) => ({ w: img.naturalWidth, h: img.naturalHeight })).catch(() => ({ w: 0, h: 0 }));
      if (!box || box.width < 260 || box.height < 160 || natural.w < 700 || natural.h < 420) continue;
      scored.push({ handle: handles[i], score: natural.w * natural.h, natural });
    }
    scored.sort((a, b) => b.score - a.score);
    for (let i = 0; i < Math.min(3, scored.length); i++) {
      const file = path.join(pageDir, `${String(index + 1).padStart(2, "0")}-${i + 1}-${safeName(article.title)}.png`);
      try {
        await scored[i].handle.scrollIntoViewIfNeeded({ timeout: 5000 });
        await page.waitForTimeout(500);
        await scored[i].handle.screenshot({ path: file, timeout: 12_000 });
        candidates.push({ path: path.relative(outDir, file).replaceAll("\\", "/"), quality: qualityOf(file) });
      } catch {}
    }
    if (candidates.length === 0) {
      const file = path.join(pageDir, `${String(index + 1).padStart(2, "0")}-page-${safeName(article.title)}.png`);
      await page.screenshot({ path: file, fullPage: false, timeout: 12_000 });
      candidates.push({ path: path.relative(outDir, file).replaceAll("\\", "/"), quality: qualityOf(file) });
    }
  } catch (error) {
    article.error = String(error.message || error);
  }
  return candidates;
}

function scoreArticle(article) {
  const title = article.title.toLowerCase();
  const desc = (article.description || "").toLowerCase();
  let score = 0;
  for (const term of ["architecture", "design", "interior", "exhibition", "landscape", "home", "furniture", "milan", "event"]) {
    if (title.includes(term) || desc.includes(term)) score += 1;
  }
  if ((article.candidates || []).some((c) => c.quality.ok)) score += 3;
  if (article.error) score -= 2;
  return score;
}

function htmlEscape(value) {
  return String(value || "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

async function writeOutputs(results) {
  await fs.writeFile(path.join(outDir, "research-pack.json"), JSON.stringify(results, null, 2), "utf8");
  const cards = results.flatMap((site) => site.articles.map((article, idx) => {
    const imageHtml = (article.candidates || []).map((candidate, i) => `
      <figure class="${candidate.quality.ok ? "ok" : "warn"}">
        <img src="${htmlEscape(candidate.path)}" />
        <figcaption>候選圖 ${i + 1} · ${candidate.quality.width}x${candidate.quality.height} · ${(candidate.quality.bytes / 1024).toFixed(0)}KB${candidate.quality.warnings.length ? " · " + htmlEscape(candidate.quality.warnings.join(" / ")) : ""}</figcaption>
      </figure>`).join("");
    return `
      <section class="card">
        <div class="meta">${htmlEscape(site.label)} · #${idx + 1} · score ${article.score}</div>
        <h2>${htmlEscape(article.title)}</h2>
        <p>${htmlEscape(article.description || "尚未擷取到摘要，需人工判讀。")}</p>
        <a href="${htmlEscape(article.url)}" target="_blank">${htmlEscape(article.url)}</a>
        <div class="images">${imageHtml}</div>
      </section>`;
  })).join("\n");
  const html = `<!doctype html>
<html lang="zh-Hant">
<meta charset="utf-8">
<title>設計週報素材包 ${stamp}</title>
<style>
body{margin:0;background:#f6f2ea;color:#2b2a27;font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif}
header{padding:48px 64px 28px;border-bottom:1px solid #c9bdae}
h1{font-size:34px;margin:0 0 12px} header p{color:#766f64;margin:0;max-width:850px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:22px;padding:30px 44px 60px}
.card{background:#fffaf2;border:1px solid #d8cfc1;padding:22px}
.meta{font-size:12px;color:#7a8a66;letter-spacing:.04em;text-transform:uppercase}
h2{font-size:22px;line-height:1.25;margin:12px 0}.card p{line-height:1.6;color:#554f46}.card a{font-size:12px;color:#5f7e8c;word-break:break-all}
.images{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}
figure{margin:0;border:1px solid #d8cfc1;background:#eee6da}figure.warn{outline:3px solid #b66a45}
img{width:100%;height:170px;object-fit:contain;background:#e7ded1;display:block}
figcaption{font-size:11px;line-height:1.35;color:#766f64;padding:8px}
</style>
<header>
  <h1>設計週報素材包 · ${stamp}</h1>
  <p>這是正式簡報前的選題與選圖面板。請先挑選要進入週報的新聞與候選圖；只有通過人工確認的素材才進入 20 頁正式簡報。</p>
</header>
<main class="grid">${cards}</main>
</html>`;
  await fs.writeFile(path.join(outDir, "selection-board.html"), html, "utf8");
}

await ensureDirs();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
  userAgent: "Mozilla/5.0 Codex research pack",
});
const page = await context.newPage();
const results = [];
for (const site of sites) {
  const articles = await collectLinks(page, site);
  for (let i = 0; i < articles.length; i++) {
    articles[i].candidates = await captureCandidates(page, site, articles[i], i);
    articles[i].score = scoreArticle(articles[i]);
  }
  articles.sort((a, b) => b.score - a.score);
  results.push({ key: site.key, label: site.label, home: site.home, articles });
}
await context.close();
await browser.close();
await writeOutputs(results);
console.log(path.join(outDir, "selection-board.html"));
console.log(path.join(outDir, "research-pack.json"));
