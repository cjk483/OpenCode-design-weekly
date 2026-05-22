import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "output");
const statusRoot = path.join(outputRoot, "_HTML_STATUS");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const frameTemplatePath = path.join(root, "templates", "frame-weekly-template.html");
const args = process.argv.slice(2);
const frameTemplate = await fs.readFile(frameTemplatePath, "utf8");
const SLIDE_COUNT = 15;
const PROJECT_SLIDE_COUNT = 9;
const MIN_REAL_IMAGE_COUNT = 6;

let chromium = null;
let sharedBrowser = null;
try {
  ({ chromium } = require("D:/OPENCODE/node_modules/playwright"));
} catch {
  try {
    ({ chromium } = require(path.resolve(__dirname, "..", "node_modules", "playwright")));
  } catch {}
}

const requestedSites = new Set(readArg("--site").map((value) => normalizeKey(value)));
const skipPdf = args.includes("--no-pdf");
const force = args.includes("--force");
const today = readSingleArg("--date") || new Date().toISOString().slice(0, 10);
const issueDate = today;
const windowEnd = new Date(`${today}T10:00:00+08:00`);
const windowStart = new Date(windowEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

const sites = [
  {
    key: "ARCHDAILY",
    label: "ArchDaily",
    domain: "archdaily.com",
    feeds: ["https://www.archdaily.com/rss"],
    indexPages: ["https://www.archdaily.com/"],
    include: /archdaily\.com\/\d+/i,
  },
  {
    key: "FRAME",
    label: "FRAME",
    domain: "frameweb.com",
    feeds: [],
    indexPages: ["https://frameweb.com/", "https://frameweb.com/articles", "https://frameweb.com/article/retail", "https://frameweb.com/article/hospitality"],
    include: /frameweb\.com\/article\//i,
  },
  {
    key: "GOOOOD",
    label: "gooood / 谷德設計網",
    domain: "gooood.cn",
    feeds: [],
    indexPages: ["https://www.gooood.cn/", "https://www.gooood.cn/category/type/architecture", "https://www.gooood.cn/category/type/design"],
    include: /gooood\.cn\/(?!category|job|submissions|ad-|feed|filter|find-designer|get-project-designer|static|css|js)[^#?]+\.htm/i,
  },
  {
    key: "WALLPAPER",
    label: "Wallpaper*",
    domain: "wallpaper.com",
    feeds: ["https://www.wallpaper.com/feed/rss"],
    indexPages: ["https://www.wallpaper.com/design-interiors", "https://www.wallpaper.com/architecture"],
    include: /wallpaper\.com\/(design-interiors|architecture)\//i,
  },
  {
    key: "ARCHITECTURAL_DIGEST",
    label: "Architectural Digest",
    domain: "architecturaldigest.com",
    feeds: ["https://www.architecturaldigest.com/feed/rss"],
    indexPages: ["https://www.architecturaldigest.com/architecture-design"],
    include: /architecturaldigest\.com\/(story|gallery)\//i,
  },
  {
    key: "DEZEEN",
    label: "Dezeen",
    domain: "dezeen.com",
    feeds: ["https://www.dezeen.com/feed/"],
    indexPages: ["https://www.dezeen.com/", "https://www.dezeen.com/architecture/", "https://www.dezeen.com/interiors/"],
    include: /dezeen\.com\/\d{4}\/\d{2}\/\d{2}\//i,
  },
  {
    key: "DESIGNBOOM",
    label: "Designboom",
    domain: "designboom.com",
    feeds: ["https://www.designboom.com/feed/"],
    indexPages: ["https://www.designboom.com/", "https://www.designboom.com/architecture/", "https://www.designboom.com/design/"],
    include: /designboom\.com\/(architecture|design|art|technology)\//i,
  },
];

await fs.mkdir(statusRoot, { recursive: true });

const targetSites = sites.filter((site) => requestedSites.size === 0 || requestedSites.has(site.key));
if (targetSites.length === 0) {
  throw new Error(`No site matched --site. Available: ${sites.map((site) => site.key).join(", ")}`);
}

for (const site of targetSites) {
  await buildSite(site);
}

if (sharedBrowser) {
  await sharedBrowser.close().catch(() => {});
}

function readArg(name) {
  const values = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === name && args[index + 1]) values.push(args[index + 1]);
  }
  return values;
}

function readSingleArg(name) {
  return readArg(name)[0];
}

function normalizeKey(value) {
  return String(value || "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toUpperCase();
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function escapeCssUrl(value) {
  return String(value || "").replace(/['")\\]/g, "\\$&");
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function cleanText(value) {
  return decodeEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function clip(value, maxLength) {
  const chars = [...cleanText(value)];
  if (chars.length <= maxLength) return chars.join("");
  return `${chars.slice(0, maxLength - 1).join("")}…`;
}

async function buildSite(site) {
  const siteOut = path.join(outputRoot, site.key);
  await fs.mkdir(siteOut, { recursive: true });

  const htmlPath = path.join(siteOut, `${site.key}_Weekly_Design_News_${issueDate}_${SLIDE_COUNT}p.html`);
  const pdfPath = path.join(siteOut, `${site.key}_Weekly_Design_News_${issueDate}_${SLIDE_COUNT}p.pdf`);
  const tempHtmlPath = `${htmlPath}.tmp`;
  const tempPdfPath = `${pdfPath}.tmp`;
  const latestPath = path.join(statusRoot, `${site.key}_latest.txt`);
  const historyPath = path.join(statusRoot, "weekly-html-history.log");

  if (!force && fsSync.existsSync(htmlPath) && (skipPdf || fsSync.existsSync(pdfPath))) {
    writeStatus(latestPath, historyPath, site, "DONE", "Skipped; current issue already exists.", htmlPath, skipPdf ? "" : pdfPath);
    return;
  }

  writeStatus(latestPath, historyPath, site, "RUNNING", `Collecting ${formatDate(windowStart)} to ${formatDate(windowEnd)}.`, "", "");
  try {
    const articles = normalizeArticleCount(await collectArticles(site), PROJECT_SLIDE_COUNT);
    const html = renderDeck(site, articles);
    validateDeckQuality(html, articles);
    await fs.writeFile(tempHtmlPath, html, "utf8");
    if (!skipPdf) {
      await printPdf(tempHtmlPath, tempPdfPath);
      await fs.copyFile(tempPdfPath, pdfPath);
      await fs.rm(tempPdfPath, { force: true });
    }
    await fs.copyFile(tempHtmlPath, htmlPath);
    await fs.rm(tempHtmlPath, { force: true });
    writeStatus(latestPath, historyPath, site, "DONE", `Generated FRAME-template HTML with ${countSlides(html)} slides and ${realImageCount(articles)} real images.`, htmlPath, skipPdf ? "" : pdfPath);
  } catch (error) {
    await fs.rm(tempHtmlPath, { force: true }).catch(() => {});
    await fs.rm(tempPdfPath, { force: true }).catch(() => {});
    writeStatus(latestPath, historyPath, site, "FAILED", String(error?.stack || error?.message || error), htmlPath, "");
    throw error;
  }
}

function writeStatus(latestPath, historyPath, site, status, message, htmlPath, pdfPath) {
  const stamp = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }).replace(" ", "T");
  const line = `${stamp}+08:00 | ${site.label} | ${status} | ${message.replace(/\s+/g, " ").slice(0, 700)} | HTML: ${htmlPath || ""} | PDF: ${pdfPath || ""}`;
  fsSync.writeFileSync(latestPath, `${line}\n`, "utf8");
  fsSync.appendFileSync(historyPath, `${line}\n`, "utf8");
}

async function collectArticles(site) {
  const feedItems = (await Promise.all(site.feeds.map((feed) => collectFeed(feed, site)))).flat();
  const indexItems = await collectIndexPages(site);
  const merged = dedupe([...feedItems, ...indexItems]).slice(0, 24);
  const enriched = [];

  for (const item of merged) {
    const meta = await readArticleMeta(item.url);
    const finalImage = isRealImageUrl(meta.image) ? meta.image : (item.image || "");
    enriched.push({
      ...item,
      ...meta,
      title: cleanText(meta.title || item.title),
      description: cleanText(meta.description || item.description || item.title),
      image: finalImage,
      date: meta.date || item.date || "",
    });
  }

  const recent = enriched.filter((article) => {
    const date = parseDate(article.date);
    if (!date) return true;
    return date >= windowStart && date <= new Date(windowEnd.getTime() + 24 * 60 * 60 * 1000);
  });

  return dedupe(recent).slice(0, PROJECT_SLIDE_COUNT);
}

async function collectFeed(feedUrl, site) {
  try {
    const xml = await fetchText(feedUrl);
    return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((match) => {
      const block = match[0];
      return {
        title: cleanText(tag(block, "title")),
        url: cleanText(tag(block, "link")) || cleanText(tag(block, "guid")),
        description: cleanText(tag(block, "description") || tag(block, "content:encoded")),
        date: cleanText(tag(block, "pubDate") || tag(block, "dc:date")),
        image: rssImage(block),
      };
    }).filter((item) => item.title && item.url && item.url.includes(site.domain));
  } catch {
    return [];
  }
}

function tag(block, name) {
  const escapedName = name.replace(":", "\\:");
  const match = block.match(new RegExp(`<${escapedName}[^>]*>([\\s\\S]*?)<\\/${escapedName}>`, "i"));
  return match ? match[1] : "";
}

function rssImage(block) {
  const media = block.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i);
  if (media) return decodeEntities(media[1]);
  const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image\//i);
  if (enclosure) return decodeEntities(enclosure[1]);
  const htmlImage = block.match(/<img[^>]+src=["']([^"']+)["']/i);
  return htmlImage ? decodeEntities(htmlImage[1]) : "";
}

async function collectIndexPages(site) {
  const items = [];
  for (const pageUrl of site.indexPages) {
    try {
      const html = await fetchText(pageUrl);
      for (const match of html.matchAll(/<a\b[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
        const href = absolutize(match[1], pageUrl);
        if (!href || !site.include.test(href)) continue;
        const title = cleanText(match[2]);
        if (title.length >= 8) items.push({ title, url: href });
      }
    } catch {}
  }

  if (items.length >= 4 || !chromium) return dedupe(items);
  return dedupe([...items, ...(await collectIndexPagesWithBrowser(site))]);
}

async function collectIndexPagesWithBrowser(site) {
  const items = [];
  try {
    const browser = await getBrowser();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    try {
      for (const pageUrl of site.indexPages) {
        try {
          await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
          await page.waitForTimeout(2500);
          const links = await page.locator("a[href]").evaluateAll((anchors) =>
            anchors.map((anchor) => ({
              href: anchor.href,
              title: (anchor.innerText || anchor.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim(),
            })),
          );
          for (const link of links) {
            if (link.href && site.include.test(link.href) && link.title.length >= 8) {
              items.push({ title: cleanText(link.title), url: link.href.split("#")[0].split("?")[0] });
            }
          }
        } catch {}
      }
    } finally {
      await page.close().catch(() => {});
    }
  } catch (e) {
    return items;
  }
  return items;
}

function absolutize(href, base) {
  try {
    return new URL(href, base).toString().split("#")[0].split("?")[0];
  } catch {
    return "";
  }
}

async function readArticleMeta(url) {
  let html;
  try {
    html = await fetchText(url);
  } catch {
    html = "";
  }
  const result = {
    title: meta(html, "property", "og:title") || meta(html, "name", "twitter:title"),
    description: meta(html, "property", "og:description") || meta(html, "name", "description"),
    image: meta(html, "property", "og:image") || meta(html, "name", "twitter:image"),
    date: meta(html, "property", "article:published_time") || meta(html, "property", "article:modified_time") || meta(html, "name", "date"),
  };
  if (!result.image && chromium) {
    try {
      result.image = await fetchOgImageWithBrowser(url);
    } catch {}
  }
  return result;
}

async function getBrowser() {
  if (!sharedBrowser) {
    const launchOptions = fsSync.existsSync(chromePath)
      ? { headless: true, executablePath: chromePath }
      : { headless: true };
    sharedBrowser = await chromium.launch(launchOptions);
  }
  return sharedBrowser;
}

async function fetchOgImageWithBrowser(url) {
  const browser = await getBrowser();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);
    const ogImage = await page.evaluate(() => {
      const m = document.querySelector('meta[property="og:image"]');
      return m ? m.getAttribute("content") : null;
    });
    return ogImage || "";
  } finally {
    await page.close().catch(() => {});
  }
}

async function fetchText(url, attempts = 2) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 design-weekly-reporter",
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "zh-TW,zh;q=0.9,en;q=0.8",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    }
  }
  throw lastError;
}

function meta(html, key, value) {
  const escapedValue = value.replace(":", "\\:");
  const forward = new RegExp(`<meta[^>]+${key}=["']${escapedValue}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const reverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${key}=["']${escapedValue}["'][^>]*>`, "i");
  const match = html.match(forward) || html.match(reverse);
  return match ? decodeEntities(match[1]) : "";
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dedupe(items) {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    const key = String(item.url || "").replace(/\/$/, "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push({ ...item, url: key });
  }
  return unique;
}

function normalizeArticleCount(articles, targetCount) {
  const usable = articles.filter((article) => article.title && article.url && isRealImageUrl(article.image));
  if (usable.length === 0) {
    return Array.from({ length: targetCount }, (_, index) => ({
      title: "本週尚未取得足夠公開文章",
      description: "排程會在下次執行時重新抓取；若網站阻擋或 RSS 暫時無資料，此頁保留為狀態說明。",
      date: issueDate,
      url: "",
      image: "",
      placeholder: true,
      repeated: false,
      index,
    }));
  }
  return Array.from({ length: targetCount }, (_, index) => ({
    ...usable[index % usable.length],
    repeated: index >= usable.length,
    index,
  }));
}

function countSlides(html) {
  return (html.match(/<section class="slide/g) || []).length;
}

function realImageCount(articles) {
  return articles.filter((article) => isRealImageUrl(article.image)).length;
}

function isRealImageUrl(value) {
  return /^https?:\/\/.+\.(?:jpg|jpeg|png|webp)(?:[?#].*)?$/i.test(String(value || ""));
}

function validateDeckQuality(html, articles) {
  const slideCount = countSlides(html);
  const projectCount = (html.match(/class="slide project"/g) || []).length;
  const placeholders = (html.match(/<div class="p-placeholder"|data:image\/svg|\{\{[A-Z0-9_]+\}\}/g) || []).length;
  const images = realImageCount(articles);

  const failures = [];
  if (slideCount !== SLIDE_COUNT) failures.push(`expected ${SLIDE_COUNT} slides, got ${slideCount}`);
  if (projectCount !== PROJECT_SLIDE_COUNT) failures.push(`expected ${PROJECT_SLIDE_COUNT} project slides, got ${projectCount}`);
  if (images < MIN_REAL_IMAGE_COUNT) failures.push(`expected at least ${MIN_REAL_IMAGE_COUNT} real images, got ${images}`);
  if (placeholders > 0) failures.push(`found ${placeholders} placeholders or unreplaced template tokens`);

  if (failures.length > 0) {
    throw new Error(`Quality check failed: ${failures.join("; ")}`);
  }
}

function articleDate(value) {
  const date = parseDate(value);
  return date ? formatDate(date) : "近週";
}

function articleBrief(article) {
  if (article.placeholder) return article.description;
  return `本頁整理此則近週內容：${clip(article.description || article.title, 120)}`;
}

function articleTake(article) {
  if (article.placeholder) return "請檢查網站是否暫時阻擋、RSS 是否變更，或等待下次排程重新補抓。";
  if (article.repeated) return `此頁為補足 ${SLIDE_COUNT} 頁版型的延伸觀察；原始來源已在前頁出現。`;
  return "設計觀察：此案例可作為空間趨勢、材料語彙、品牌體驗或城市脈絡的後續追蹤線索。";
}

function renderDeck(site, articles) {
  const coverImage = articles.find((article) => article.image)?.image || "";
  const indexRows = articles.map((article, index) => `
      <article class="idx-row" onclick="goto(${index + 4})">
        <span class="num">${String(index + 1).padStart(2, "0")}</span>
        <span class="idx-title">${escapeHtml(clip(article.title, 84))}</span>
        <span class="idx-type">${article.repeated ? "REVISIT" : "WEEKLY"}</span>
        <span class="idx-date">${escapeHtml(articleDate(article.date).slice(5))}</span>
      </article>`).join("");
  const detailSlides = articles.map((article, index) => renderProjectSlide(article, index + 4)).join("\n");
  const sourceRows = articles.slice(0, PROJECT_SLIDE_COUNT).map((article, index) => `
        <tr><td>${String(index + 1).padStart(2, "0")}</td><td>${escapeHtml(clip(article.title, 58))}</td><td>${escapeHtml(articleDate(article.date))}</td><td>${article.repeated ? "版型補足" : "近週來源"}</td></tr>`).join("");

  return fillTemplate(frameTemplate, {
    PAGE_TITLE: `${escapeHtml(site.label)} 設計週報 ${issueDate}`,
    COVER_IMAGE_CSS: escapeCssUrl(coverImage),
    SITE_LABEL: escapeHtml(site.label),
    DATE_RANGE: `${formatDate(windowStart)}–${formatDate(windowEnd)}`,
    ISSUE_DATE: issueDate,
    SITE_DOMAIN: escapeHtml(site.domain),
    SOURCE_COUNT: String(articles.filter((article) => !article.repeated && !article.placeholder).length),
    SLIDE_COUNT: String(SLIDE_COUNT),
    PROJECT_COUNT: String(PROJECT_SLIDE_COUNT),
    INDEX_ROWS: indexRows,
    DETAIL_SLIDES: detailSlides,
    SOURCE_ROWS: sourceRows,
    SITE_KEY: escapeHtml(site.key),
  });
}

function fillTemplate(template, values) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  ));
}

function renderProjectSlide(article, slideNumber) {
  const image = article.image ? `<div class="p-img" style="background-image:url('${escapeCssUrl(article.image)}')"></div>` : `<div class="p-placeholder"></div>`;
  const link = article.url ? `<a class="p-link-btn" href="${escapeHtml(article.url)}" target="_blank">READ SOURCE</a>` : "";
  return `<section class="slide project" data-section="CASE NOTES">
    ${image}<div class="p-overlay"></div>
    <div class="p-cat-top">${article.repeated ? "REVISIT" : "WEEKLY ITEM"}</div><div class="p-num-top">${String(slideNumber).padStart(2, "0")}</div>
    <div class="p-caption"><div class="p-cap-l"><div class="p-proj-num">PROJECT ${String(slideNumber - 3).padStart(2, "0")}</div><h2 class="p-name">${escapeHtml(clip(article.title, 74))}</h2><div class="p-loc">${escapeHtml(articleDate(article.date))}</div></div><div class="p-cap-r"><p class="p-desc">${escapeHtml(articleBrief(article))}</p><p class="p-desc" style="color:var(--warm-light)">${escapeHtml(articleTake(article))}</p>${link}</div></div>
  </section>`;
}

async function printPdf(htmlPath, pdfPath) {
  if (!fsSync.existsSync(chromePath)) throw new Error(`Chrome not found: ${chromePath}`);
  await new Promise((resolve, reject) => {
    const child = spawn(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--allow-file-access-from-files",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).toString(),
    ], { stdio: "pipe" });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("exit", (code) => {
      if (code === 0 && fsSync.existsSync(pdfPath)) resolve();
      else reject(new Error(`Chrome PDF export failed with code ${code}: ${stderr}`));
    });
  });
}
