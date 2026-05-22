import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PptxGenJS = require("C:/Users/cjk48/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs/dist/pptxgen.cjs.js");
const { chromium } = require("C:/Users/cjk48/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { imageSize } = require("C:/Users/cjk48/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/image-size");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "output", "codex-direct");
const assetDir = path.join(outDir, "assets");
const screenshotDir = path.join(assetDir, "browser-screenshots");

const W = 13.333;
const H = 7.5;
const fonts = {
  en: "AURA",
  zh: "中黑體",
  fallbackZh: "Noto Sans TC",
};

const palette = {
  paper: "F6F2EA",
  warm: "E7DED1",
  ink: "2B2A27",
  muted: "766F64",
  hair: "C9BDAE",
  clay: "B66A45",
  moss: "7A8A66",
  blue: "5F7E8C",
};

const decks = [
  {
    key: "gooood",
    title: "谷德設計網設計週報",
    siteLabel: "gooood / 谷德設計網",
    dateRange: "2026.05.01 - 2026.05.08",
    file: "Codex_Direct_Gooood_Design_Weekly_2026-05-08.pptx",
    sourceHome: "https://www.gooood.cn/",
    theme: "公共性、材料再生與城市縫隙正在成為本週建築敘事的核心。",
    accent: palette.moss,
    articles: [
      ["HALOS 裝置，義大利 / SpY", "光與反射組成動態星群，將裝置轉化為沉浸式公共經驗。", "藝術 / 裝置", "2026-05-06", "https://www.gooood.cn/"],
      ["比得哥什音樂學院新校區 / plus3 architects", "聲學、磚構與校園尺度結合，形成音樂教育的新地標。", "教育建築", "2026-05-06", "https://www.gooood.cn/"],
      ["Kiellandsstien 住宅 / Hoem + Folstad", "以圍合庭院回應田野與峽灣，住宅成為風景的邊界。", "住宅", "2026-05-06", "https://www.gooood.cn/"],
      ["鼓浪嶼新四海風物商店 / DEVOLUTION", "商業空間以在地風物與歷史街區建立新的日常敘事。", "改造 / 商業", "2026-05-06", "https://www.gooood.cn/new-four-seas-curios-shop-gulang-island-by-devolution.htm"],
      ["空中種植園，越南 / H&P Architects", "立體田園被置入城市，將農業、遮蔭與公共生活疊合。", "都市農業", "2026-05-06", "https://www.gooood.cn/"],
      ["杭州未來科技城新湖中心・光棱 / OMA", "梯田式高層探索辦公、城市景觀與退台公共性的關係。", "高層 / 辦公", "2026-05-06", "https://www.gooood.cn/"],
      ["CAIS 辦公樓，里斯本 / Contacto Atlântico", "健康與創造力成為新辦公空間的空間規格。", "辦公", "2026-05-06", "https://www.gooood.cn/"],
      ["Coop.M 住宅改造，東京 / note architects", "以多樣生活環境重組既有住宅，讓日常互相影響。", "住宅改造", "2026-05-06", "https://www.gooood.cn/"],
      ["奧斯汀滑鐵盧公園 / MVVA", "公共空間更新從通用設計切入，重塑市中心可達性。", "景觀 / 公共空間", "2026-05-05", "https://www.gooood.cn/"],
      ["卡特托俱樂部，西班牙 / Cateto Cateto", "圓柱語言塑造感官化空間，形式成為身體經驗。", "室內 / 休閒", "2026-05-04", "https://www.gooood.cn/"],
      ["知識之屋，河南信陽 / Christoph Hesse", "學習場域被放在城市與生態交界，教育建築回到地方關係。", "教育 / 生態", "2026-05-03", "https://www.gooood.cn/"],
      ["Today Design Workspace / Studio Edwards", "零廢棄工作空間讓材料再利用成為辦公設計主線。", "辦公 / 循環", "2026-05-01", "https://www.gooood.cn/"],
    ],
    trends: ["城市縫隙的再啟動", "低碳與材料再生", "公共空間的可達性", "辦公與健康創造力"],
  },
  {
    key: "wallpaper",
    title: "Wallpaper 設計週報",
    siteLabel: "Wallpaper*",
    dateRange: "2026.05.01 - 2026.05.08",
    file: "Codex_Direct_Wallpaper_Design_Weekly_2026-05-08.pptx",
    sourceHome: "https://www.wallpaper.com/",
    theme: "設計從物件擴張為體驗：聲音、展覽、旅行與再生建築交織成新的生活場景。",
    accent: palette.blue,
    articles: [
      ["NYCxDesign 2026 編輯精選", "紐約設計週把城市活動、展覽與品牌發布整合成設計路徑。", "活動", "2026-05-08", "https://www.wallpaper.com/design-interiors/design-events/nycxdesign-2026-things-to-see"],
      ["Edra Anywhere Sofa", "旋轉靠背讓模組沙發更像可變地景，家具從固定物件變成動態系統。", "家具", "2026-05-08", "https://www.wallpaper.com/design-interiors/furniture/edra-anywhere-sofa"],
      ["Joris Laarman：設計與自然共生", "家具被想像為非人生命的棲息處，物件設計進入生態尺度。", "展覽 / 家具", "2026-05-08", "https://www.wallpaper.com/design-interiors/design-events/joris-laarman-interview-symbio-friedman-benda"],
      ["Fornasetti 米蘭旗艦店", "品牌空間以觸覺與有機體概念重塑零售體驗。", "零售 / 品牌", "2026-05-07", "https://www.wallpaper.com/design-interiors/new-fornasetti-milan-flagship-store"],
      ["Pauline Deltour 展覽", "MADD Bordeaux 重新開館，以展覽回看簡約背後的設計精度。", "展覽", "2026-05-06", "https://www.wallpaper.com/design-interiors/design-events/pauline-deltour-exhibition-madd-bordeaux"],
      ["Andrea Branzi by Toyo Ito", "展覽以友人視角追索 Branzi 的連續當下與設計思想。", "展覽 / 設計史", "2026-05-06", "https://www.wallpaper.com/design-interiors/design-events/andrea-branzi-by-toyo-ito-continuous-present-triennale-milano"],
      ["Gropius House 浴室競圖", "現代主義住宅被補上一個符合 Bauhaus 精神的當代衛浴。", "建築保存", "2026-05-07", "https://www.wallpaper.com/architecture/gropius-house-bathroom-competition-winner"],
      ["Børsen 訪客中心", "火災後的歷史建築以臨時展館講述重生過程。", "保存 / 展示", "2026-05-07", "https://www.wallpaper.com/architecture/borsen-visitor-centre-jac-copenhagen-denmark"],
      ["Kendrick Bangs Kellogg 住宅上市", "有機現代主義住宅進入市場，建築價值被重新觀看。", "住宅 / 市場", "2026-05-06", "https://www.wallpaper.com/architecture/residential/kendrick-bangs-kellogg-house-on-the-market-usa"],
      ["Casa Pinhal 巴西林間度假屋", "永續構法與森林體驗結合，住宅像在樹間行走。", "住宅 / 永續", "2026-05-06", "https://www.wallpaper.com/architecture/residential/casa-pinhal-brazil"],
      ["厄瓜多建築新書", "被忽略的地域建築透過攝影與出版重新進入國際視野。", "出版 / 地域", "2026-05-05", "https://www.wallpaper.com/architecture/architecture-in-ecuador-book"],
      ["London Festival of Architecture 2026", "以 Belonging 為題，400 多場活動把建築變成城市對話工具。", "活動 / 城市", "2026-05-01", "https://www.wallpaper.com/architecture/architecture-events/london-festival-of-architecture-2026-guide"],
    ],
    trends: ["家具的可變系統", "展覽作為設計史更新", "保存敘事可視化", "設計活動城市化"],
  },
  {
    key: "ad",
    title: "Architectural Digest 設計週報",
    siteLabel: "Architectural Digest",
    dateRange: "2026.05.01 - 2026.05.08",
    file: "Codex_Direct_Architectural_Digest_Design_Weekly_2026-05-08.pptx",
    sourceHome: "https://www.architecturaldigest.com/",
    theme: "本週 AD 將室內設計、文化展場與住宅敘事放在同一條線上：空間正在承載身份與收藏。",
    accent: palette.clay,
    articles: [
      ["The Met Costume Institute 新展廳", "12,000 平方英尺展廳以建築更新支持服裝、身體與身份敘事。", "展場 / 文化", "2026-05-04", "https://www.architecturaldigest.com/story/the-met-costume-institute-unveils-its-new-cond%C3%A9-m-nast-galleries"],
      ["Laguna Beach Colonial", "Studio Gutow 以木作、收藏與親密空間重整家庭海邊住宅。", "住宅 / 室內", "2026-05-05", "https://www.architecturaldigest.com/story/a-laguna-beach-home-designed-by-studio-gutow"],
      ["Martha's Vineyard Home", "設計以在地採購與質樸島嶼氣質取代制式航海風。", "住宅 / 地方性", "2026-05", "https://www.architecturaldigest.com/story/this-marthas-vineyard-home-channels-the-islands-rustic-charm"],
      ["Brussels 355 平方英尺住宅", "小尺度住宅用粉色與 faux bois 面板放大性格與空間記憶。", "小宅 / 材料", "2026-05", "https://www.architecturaldigest.com/story/this-355-square-foot-brussels-home-makes-a-case-for-pink-and-wavy-wood-panels"],
      ["Maine 19 世紀住宅", "繼承物件成為改造核心，住宅在家族記憶中演化。", "住宅 / 歷史", "2026-05", "https://www.architecturaldigest.com/story/a-19th-century-maine-home-evolves-around-a-familys-inherited-treasures"],
      ["Loro Piana 高層主管紐約公寓", "經典材質與克制室內語彙延伸品牌的永恆感。", "室內 / 品牌氣質", "2026-05", "https://www.architecturaldigest.com/story/loro-piana-execs-nyc-apartment"],
      ["French Château", "古堡被轉化為家庭童話場景，歷史與當代生活並置。", "住宅 / 改造", "2026-05", "https://www.architecturaldigest.com/story/a-french-château-designed-by-brandon-quattrone-and-isadora-lim"],
      ["Miami Modernist Home", "屋主集結夢幻設計團隊，以現代主義住宅承載當代收藏。", "住宅 / 現代主義", "2026-05", "https://www.architecturaldigest.com/story/miami-modernist-home-designed-by-gachot"],
      ["Vintage-Obsessed Modern Showgirls", "拉斯維加斯 kitsch 文化進入居家敘事，舞台性轉成生活美學。", "生活風格", "2026-05", "https://www.architecturaldigest.com/"],
      ["Met Gala Art-Inspired Looks", "紅毯被重新解讀為移動博物館，服裝與藝術展示互相借位。", "文化 / 時尚", "2026-05", "https://www.architecturaldigest.com/"],
      ["AD Architecture + Design Homepage", "首頁顯示住宅、展場、小宅與收藏故事共同構成本週設計重點。", "首頁觀察", "2026-05-08", "https://www.architecturaldigest.com/architecture-design"],
      ["AD Design News", "創新設計欄目將展覽空間、居家敘事與設計師名單串接成趨勢入口。", "設計新聞", "2026-05-08", "https://www.architecturaldigest.com/architecture-design/design"],
    ],
    trends: ["身份敘事進入展場", "住宅收藏化", "地方性取代風格套版", "小宅以材質建立性格"],
  },
];

async function ensureDirs() {
  await fs.mkdir(assetDir, { recursive: true });
  await fs.mkdir(screenshotDir, { recursive: true });
}

function cleanText(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "’")
    .replace(/&#8212;/g, "—")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Codex design weekly" } });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

async function findImageUrl(url) {
  const html = await fetchText(url);
  if (!html) return undefined;
  const patterns = [
    /property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      let image = match[1].replace(/&amp;/g, "&");
      if (image.startsWith("//")) image = "https:" + image;
      if (image.startsWith("/")) image = new URL(image, url).toString();
      return image;
    }
  }
  return undefined;
}

async function downloadOgImage(url, outPath) {
  try {
    const imageUrl = await findImageUrl(url);
    if (!imageUrl) return undefined;
    const res = await fetch(imageUrl, { headers: { "user-agent": "Mozilla/5.0 Codex design weekly" } });
    if (!res.ok) return undefined;
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(outPath, buffer);
    return imageLooksUsable(outPath) ? outPath : undefined;
  } catch {
    return undefined;
  }
}

async function dismissPageChrome(page) {
  try {
    await page.addStyleTag({
      content: `
        [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i],
        [class*="newsletter" i], [id*="newsletter" i], [class*="modal" i], [role="dialog"],
        header[style*="fixed"], nav[style*="fixed"] { opacity: 0 !important; pointer-events: none !important; }
      `,
    });
  } catch {}
}

function imageLooksUsable(filePath) {
  try {
    const stat = fsSync.statSync(filePath);
    const dim = imageSize(filePath);
    const width = dim.width || 0;
    const height = dim.height || 0;
    return stat.size > 50_000 && width >= 700 && height >= 420;
  } catch {
    return false;
  }
}

async function captureBestPageVisual(page, url, outPath) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(2500);
    await dismissPageChrome(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);

    const candidates = await page.locator("main img, article img, picture img, figure img, img").evaluateAll((imgs) =>
      imgs
        .map((img, index) => {
          const rect = img.getBoundingClientRect();
          const style = window.getComputedStyle(img);
          return {
            index,
            x: rect.x,
            y: rect.y,
            w: rect.width,
            h: rect.height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            visible:
              rect.width > 240 &&
              rect.height > 160 &&
              rect.bottom > 0 &&
              rect.top < window.innerHeight * 2.5 &&
              style.visibility !== "hidden" &&
              style.display !== "none",
          };
        })
        .filter((item) => item.visible && item.naturalWidth >= 700 && item.naturalHeight >= 420)
        .sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight)
        .slice(0, 4)
    );

    for (const candidate of candidates) {
      const img = page.locator("main img, article img, picture img, figure img, img").nth(candidate.index);
      try {
        await img.scrollIntoViewIfNeeded({ timeout: 5000 });
        await page.waitForTimeout(500);
        await img.screenshot({ path: outPath, timeout: 10_000 });
        if (imageLooksUsable(outPath)) return outPath;
      } catch {}
    }

    await page.screenshot({ path: outPath, fullPage: false, timeout: 10_000 });
    return imageLooksUsable(outPath) ? outPath : undefined;
  } catch {
    return undefined;
  }
}

function svgData(title, accent, seed = 0) {
  const safe = cleanText(title).replace(/[<>&]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#${palette.warm}"/>
  <rect x="${80 + seed * 7}" y="${90 + seed * 3}" width="620" height="760" fill="#${accent}" opacity=".23"/>
  <rect x="${760 - seed * 5}" y="150" width="620" height="620" fill="#f8f5ee" opacity=".72"/>
  <circle cx="${1160 - seed * 13}" cy="${330 + seed * 8}" r="210" fill="#${accent}" opacity=".38"/>
  <path d="M120 820 C 420 610, 580 910, 880 700 S 1230 520, 1480 690" fill="none" stroke="#${palette.ink}" stroke-width="9" opacity=".3"/>
  <text x="120" y="145" font-family="Arial" font-size="38" fill="#${palette.ink}" opacity=".56">${safe.slice(0, 42)}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

function addText(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    margin: 0,
    breakLine: false,
    fit: "shrink",
    fontFace: opts.fontFace || fonts.zh,
    fontSize: opts.fontSize || 18,
    color: opts.color || palette.ink,
    bold: opts.bold || false,
    italic: opts.italic || false,
    valign: opts.valign || "top",
    align: opts.align || "left",
    paraSpaceAfterPt: 0,
    ...opts,
  });
}

function addFooter(slide, deck, n) {
  slide.addShape("line", { x: 0.55, y: 7.05, w: 12.2, h: 0, line: { color: palette.hair, width: 0.7 } });
  addText(slide, deck.siteLabel, 0.58, 7.15, 4.5, 0.18, { fontFace: fonts.en, fontSize: 7.8, color: palette.muted });
  addText(slide, deck.dateRange, 5.1, 7.15, 3, 0.18, { fontFace: fonts.en, fontSize: 7.8, color: palette.muted, align: "center" });
  addText(slide, String(n).padStart(2, "0"), 11.8, 7.12, 0.9, 0.2, { fontFace: fonts.en, fontSize: 8.5, color: palette.muted, align: "right" });
}

function addImagePanel(slide, imagePath, fallbackTitle, accent, x, y, w, h, seed) {
  if (imagePath && fsSync.existsSync(imagePath)) {
    slide.addShape("rect", { x, y, w, h, fill: { color: palette.warm }, line: { color: palette.warm } });
    slide.addImage({ path: imagePath, x, y, w, h, sizing: { type: "contain", x, y, w, h } });
  } else {
    slide.addImage({ data: svgData(fallbackTitle, accent, seed), x, y, w, h });
  }
}

function baseSlide(pptx, deck, n) {
  const slide = pptx.addSlide();
  slide.background = { color: palette.paper };
  addFooter(slide, deck, n);
  return slide;
}

function sourceLine(article) {
  return `${article[2]} · ${article[3]}`;
}

async function prepareImages(deck) {
  const images = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 Codex direct design weekly",
  });
  const page = await context.newPage();
  for (let i = 0; i < deck.articles.length; i++) {
    const article = deck.articles[i];
    const imgPath = path.join(screenshotDir, `${deck.key}-${String(i + 1).padStart(2, "0")}.png`);
    let image = fsSync.existsSync(imgPath) && imageLooksUsable(imgPath) ? imgPath : undefined;
    if (!image) image = await captureBestPageVisual(page, article[4] || deck.sourceHome, imgPath);
    if (!image) image = await downloadOgImage(article[4] || deck.sourceHome, imgPath);
    images.push(image);
  }
  await context.close();
  await browser.close();
  return images;
}

function addCover(pptx, deck, images) {
  const slide = baseSlide(pptx, deck, 1);
  addImagePanel(slide, images[0], deck.title, deck.accent, 6.85, 0, 6.48, 7.5, 0);
  slide.addShape("rect", { x: 0, y: 0, w: 6.95, h: 7.5, fill: { color: palette.paper }, line: { color: palette.paper } });
  slide.addShape("rect", { x: 0.75, y: 0.7, w: 0.08, h: 1.25, fill: { color: deck.accent }, line: { color: deck.accent } });
  addText(slide, "CODEX DIRECT WEEKLY", 0.95, 0.72, 3.3, 0.25, { fontFace: fonts.en, fontSize: 9, color: palette.muted, charSpace: 1.5 });
  addText(slide, deck.title, 0.92, 1.45, 5.35, 1.45, { fontSize: 34, bold: true, color: palette.ink, fit: "shrink" });
  addText(slide, deck.theme, 0.95, 3.18, 4.9, 1.0, { fontSize: 17, color: palette.ink, breakLine: false, fit: "shrink" });
  addText(slide, deck.dateRange, 0.95, 5.85, 3.5, 0.26, { fontFace: fonts.en, fontSize: 11, color: palette.muted });
}

function addTrendMap(pptx, deck) {
  const slide = baseSlide(pptx, deck, 2);
  addText(slide, "本週趨勢", 0.72, 0.55, 2.2, 0.28, { fontSize: 13, color: deck.accent, bold: true });
  addText(slide, deck.theme, 0.72, 1.0, 6.2, 0.9, { fontSize: 25, bold: true, fit: "shrink" });
  const xs = [0.85, 4.0, 7.15, 10.3];
  deck.trends.forEach((t, i) => {
    slide.addShape("arc", { x: xs[i], y: 2.55, w: 1.6, h: 1.6, adjustPoint: 0.4, line: { color: deck.accent, width: 2.2 }, rotate: i * 22 });
    slide.addShape("rect", { x: xs[i] - 0.05, y: 4.45, w: 2.25, h: 0.03, fill: { color: deck.accent, transparency: 15 }, line: { color: deck.accent } });
    addText(slide, t, xs[i] - 0.05, 4.75, 2.25, 0.55, { fontSize: 18, bold: true, align: "center", fit: "shrink" });
  });
  addText(slide, "閱讀方式：先看議題，再看案例；把圖片當作方法線索，而不是風格圖庫。", 0.75, 6.15, 7.6, 0.35, { fontSize: 14, color: palette.muted });
}

function addArticleSlide(pptx, deck, article, image, n, layout) {
  const slide = baseSlide(pptx, deck, n);
  if (layout % 3 === 0) {
    addImagePanel(slide, image, article[0], deck.accent, 0, 0, 7.3, 7.5, layout);
    slide.addShape("rect", { x: 7.0, y: 0, w: 6.33, h: 7.5, fill: { color: palette.paper, transparency: 0 }, line: { color: palette.paper } });
    addText(slide, sourceLine(article), 7.55, 0.72, 4.6, 0.28, { fontFace: fonts.en, fontSize: 9, color: deck.accent, charSpace: 1 });
    addText(slide, article[0], 7.52, 1.22, 4.7, 1.35, { fontSize: 25, bold: true, fit: "shrink" });
    addText(slide, article[1], 7.55, 3.0, 4.35, 0.8, { fontSize: 16, color: palette.ink, fit: "shrink" });
    slide.addShape("rect", { x: 7.55, y: 5.25, w: 3.25, h: 0.04, fill: { color: deck.accent }, line: { color: deck.accent } });
    addText(slide, "設計判讀", 7.55, 5.5, 1.7, 0.24, { fontSize: 11, color: palette.muted });
    addText(slide, deck.trends[layout % deck.trends.length], 7.55, 5.85, 3.2, 0.38, { fontSize: 18, bold: true, fit: "shrink" });
  } else if (layout % 3 === 1) {
    addImagePanel(slide, image, article[0], deck.accent, 0.75, 0.7, 11.8, 4.35, layout);
    slide.addShape("rect", { x: 0.75, y: 4.7, w: 11.8, h: 1.15, fill: { color: palette.paper, transparency: 4 }, line: { color: palette.paper } });
    addText(slide, sourceLine(article), 0.95, 4.95, 2.8, 0.22, { fontFace: fonts.en, fontSize: 8.5, color: deck.accent });
    addText(slide, article[0], 3.35, 4.84, 4.75, 0.55, { fontSize: 20, bold: true, fit: "shrink" });
    addText(slide, article[1], 8.35, 4.85, 3.75, 0.65, { fontSize: 13.5, color: palette.ink, fit: "shrink" });
  } else {
    addText(slide, sourceLine(article), 0.75, 0.62, 3, 0.2, { fontFace: fonts.en, fontSize: 8.5, color: deck.accent });
    addText(slide, article[0], 0.75, 1.02, 4.15, 1.3, { fontSize: 26, bold: true, fit: "shrink" });
    addText(slide, article[1], 0.78, 2.68, 3.7, 0.9, { fontSize: 15, fit: "shrink" });
    addImagePanel(slide, image, article[0], deck.accent, 5.25, 0.62, 6.85, 5.8, layout);
    slide.addShape("rect", { x: 4.75, y: 5.45, w: 2.2, h: 0.72, fill: { color: deck.accent, transparency: 4 }, line: { color: deck.accent } });
    addText(slide, deck.trends[layout % deck.trends.length], 4.92, 5.68, 1.85, 0.25, { fontSize: 11, color: "FFFFFF", align: "center", fit: "shrink" });
  }
}

function addAnalysisSlide(pptx, deck, n, title, points, variant = 0) {
  const slide = baseSlide(pptx, deck, n);
  addText(slide, "ANALYSIS", 0.72, 0.62, 1.6, 0.22, { fontFace: fonts.en, fontSize: 8.5, color: deck.accent, charSpace: 1.4 });
  addText(slide, title, 0.72, 1.05, 5.8, 0.85, { fontSize: 26, bold: true, fit: "shrink" });
  const x0 = variant ? 6.7 : 0.95;
  const y0 = 2.45;
  points.forEach((p, i) => {
    const x = x0 + (i % 2) * 2.85;
    const y = y0 + Math.floor(i / 2) * 1.45;
    slide.addShape("rect", { x, y, w: 2.25, h: 0.06, fill: { color: deck.accent }, line: { color: deck.accent } });
    addText(slide, p[0], x, y + 0.28, 2.2, 0.3, { fontSize: 15, bold: true, fit: "shrink" });
    addText(slide, p[1], x, y + 0.68, 2.35, 0.48, { fontSize: 10.5, color: palette.muted, fit: "shrink" });
  });
  const gx = variant ? 0.75 : 6.72;
  for (let i = 0; i < 5; i++) {
    slide.addShape("rect", {
      x: gx + i * 0.72,
      y: 2.38 + i * 0.42,
      w: 3.6 - i * 0.28,
      h: 0.32,
      fill: { color: i % 2 ? palette.warm : deck.accent, transparency: i % 2 ? 0 : 35 },
      line: { color: palette.paper },
    });
  }
}

function addSourcesSlide(pptx, deck, n) {
  const slide = baseSlide(pptx, deck, n);
  addText(slide, "來源與下一步", 0.75, 0.72, 3.2, 0.3, { fontSize: 20, bold: true });
  addText(slide, "本簡報由 Codex 直接整理公開網站內容生成，未經 NotebookLM。建議下一步把高價值案例拆成單篇研究卡片。", 0.75, 1.25, 6.5, 0.55, { fontSize: 14, color: palette.muted });
  deck.articles.slice(0, 10).forEach((a, i) => {
    const x = i < 5 ? 0.85 : 6.75;
    const y = 2.15 + (i % 5) * 0.72;
    slide.addShape("rect", { x, y: y + 0.08, w: 0.1, h: 0.1, fill: { color: deck.accent }, line: { color: deck.accent } });
    addText(slide, a[0], x + 0.25, y, 4.7, 0.32, { fontSize: 10.5, color: palette.ink, fit: "shrink" });
    addText(slide, a[4], x + 0.25, y + 0.32, 4.7, 0.18, { fontFace: fonts.en, fontSize: 6.2, color: palette.muted, fit: "shrink" });
  });
}

async function buildDeck(deck) {
  const images = await prepareImages(deck);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Codex";
  pptx.subject = `${deck.siteLabel} weekly design report`;
  pptx.title = deck.title;
  pptx.company = "Codex Direct";
  pptx.lang = "zh-TW";
  pptx.theme = {
    headFontFace: fonts.en,
    bodyFontFace: fonts.zh,
    lang: "zh-TW",
  };
  pptx.defineLayout({ name: "CUSTOM_WIDE", width: W, height: H });
  pptx.layout = "CUSTOM_WIDE";

  addCover(pptx, deck, images);
  addTrendMap(pptx, deck);
  deck.articles.forEach((article, i) => addArticleSlide(pptx, deck, article, images[i], i + 3, i));
  addAnalysisSlide(pptx, deck, 15, "哪些設計訊號值得帶回專案？", [
    ["尺度", "從物件到城市活動都在重寫使用者經驗。"],
    ["材料", "再利用、低碳與地方材料不再只是附加價值。"],
    ["展演", "展覽與零售把品牌故事變成可走入的空間。"],
    ["公共性", "設計週、節慶與公共空間共同形成城市介面。"],
  ]);
  addAnalysisSlide(pptx, deck, 16, "新聞摘要如何轉成設計研究？", [
    ["擷取問題", "先問案例解決什麼，而不是長什麼樣。"],
    ["拆解方法", "把平面、材料、光線與動線拆成可轉用策略。"],
    ["建立索引", "以議題而非網站分類保存案例。"],
    ["回到專案", "將週報輸入概念草圖與材料討論。"],
  ], 1);
  addAnalysisSlide(pptx, deck, 17, "活動與研討會觀察", [
    ["設計週", "品牌與城市活動變成內容生產平台。"],
    ["展覽", "設計史、保存與策展提供長尾研究線索。"],
    ["論壇", "可追蹤關鍵講者與機構，而不只看單一作品。"],
    ["出版", "書籍與特刊是地域建築重新被看見的入口。"],
  ]);
  addAnalysisSlide(pptx, deck, 18, "下週追蹤清單", [
    ["補來源", "優先追具體文章與官方圖片，不使用入口頁。"],
    ["拆卡片", "把重要案例轉成 Obsidian 研究卡。"],
    ["找方法", "每週至少抽出三個可操作設計方法。"],
    ["比對網站", "觀察各媒體對同一事件的敘事差異。"],
  ], 1);
  addAnalysisSlide(pptx, deck, 19, "給建築工作的應用", [
    ["概念", "把趨勢轉譯成空間命題。"],
    ["材料", "建立可追蹤的低碳與再生材料清單。"],
    ["簡報", "用大圖 + 短句讓設計判讀更容易被討論。"],
    ["知識庫", "每週固定沉澱到第二大腦。"],
  ]);
  addSourcesSlide(pptx, deck, 20);

  const outPath = path.join(outDir, deck.file);
  await pptx.writeFile({ fileName: outPath });
  return outPath;
}

await ensureDirs();
const outputs = [];
for (const deck of decks) {
  outputs.push(await buildDeck(deck));
}
console.log(outputs.join("\n"));
