import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const packDate = process.argv[2] || "2026-05-08";
const packDir = path.join(root, "output", "research-pack", packDate);
const assetRoot = path.join(root, "html-slide-assets");
const pack = JSON.parse(await fs.readFile(path.join(packDir, "research-pack.json"), "utf8"));

const commonTrends = [
  {
    title: "本週共同趨勢",
    body: "三個網站都指向同一件事：設計報導正在從單一造型轉向生活場景、材料策略與展覽脈絡。好的週報不應只是列新聞，而是把案例放回方法與趨勢中閱讀。",
    points: ["住宅案例更重視日常尺度", "展覽與品牌空間成為設計敘事場域", "自然材料與在地記憶仍是主線"],
  },
  {
    title: "圖片使用原則",
    body: "每張圖片只取自同一篇文章，不混用不同來源；HTML 中使用原比例顯示，留白比變形更好。這樣雖然不會每頁都鋪滿，但能避免錯誤的拉伸與誤導。",
    points: ["同文同圖", "不裁切主體", "不用低解析圖湊頁數"],
  },
  {
    title: "閱讀方法",
    body: "每則新聞都被整理成一個設計問題，而不是一段網站介紹。閱讀時先看空間要解決什麼，再看形式、材料與影像如何支持這個問題。",
    points: ["先判斷問題", "再看方法", "最後整理可引用觀點"],
  },
];

const configs = {
  gooood: {
    title: "gooood 設計週報",
    eyebrow: "2026.05.01 - 2026.05.08 / 編輯版",
    accent: "#7b8b69",
    file: "Gooood_Design_Weekly_HTML_2026-05-08.html",
    assetSlug: "gooood-editorial-2026-05-08",
    thesis: "本週只保留具備空間設計判讀價值的案例，排除招募、站方推廣與專案媒合內容。主軸放在住宅厚度、基地氣候、景觀介入與材料表情。",
    cases: [
      {
        match: "casa-balma-murada",
        title: "Casa Balma Murada：以厚牆重整地中海住宅",
        tag: "住宅 / 材料厚度",
        body: "這個案例的重點不是造型，而是牆體、開口與庭院如何共同控制光線、私密性與生活節奏。它適合作為討論「厚度如何生成空間秩序」的住宅案例。",
        points: ["厚牆作為氣候與生活界面", "外部景觀被轉譯成室內節奏", "材質語彙安靜但有辨識度"],
      },
      {
        match: "house-in-kusatsu",
        title: "草津住宅：把日常生活壓縮成清晰剖面",
        tag: "住宅 / 剖面",
        body: "這類小尺度住宅的價值在於剖面與動線安排，而非表面裝飾。圖片呈現出垂直關係與屋頂形態，適合觀察住宅如何在有限基地中創造開放感。",
        points: ["以剖面補足平面限制", "開口服務於生活而非單純取景", "木構與白色牆面維持輕盈感"],
      },
      {
        match: "spa-xcanatun",
        title: "Xcanatun SPA：以拱、陰影與水氣組成感官空間",
        tag: "旅宿 / 氣候",
        body: "SPA 空間最值得看的不是豪華感，而是光線、材質與濕度如何建立慢節奏。這個案例以拱形與陰影提供可感知的降溫效果。",
        points: ["拱形建立連續空間秩序", "陰影成為主要設計材料", "水體與石材強化身體感受"],
      },
      {
        match: "house-of-greens",
        title: "House of Greens：讓綠意成為住宅的內部骨架",
        tag: "住宅 / 景觀",
        body: "這個住宅的重點在於植物不是後加裝飾，而是介入動線、視線與居住邊界。它提供一種把庭園轉成室內結構的閱讀方式。",
        points: ["景觀不是背景，而是空間主角", "開放與遮蔽之間取得平衡", "住宅表情由植栽與光影共同完成"],
      },
      {
        match: "topic-mission-bay-uber-headquarters",
        title: "Uber 總部回看：大型辦公如何處理城市界面",
        tag: "辦公 / 城市界面",
        body: "雖然這不是一般住宅案例，但它能補足本週對公共性與工作場域的討論。重點應放在立面、街道與共享空間如何協調，而不是品牌宣傳。",
        points: ["大型辦公需要回應街道尺度", "立面成為光線與公共性的調節器", "工作場域正在向城市客廳靠攏"],
      },
    ],
  },
  wallpaper: {
    title: "Wallpaper* 設計週報",
    eyebrow: "2026.05.01 - 2026.05.08 / 編輯版",
    accent: "#587f8e",
    file: "Wallpaper_Design_Weekly_HTML_2026-05-08.html",
    assetSlug: "wallpaper-editorial-2026-05-08",
    thesis: "本週 Wallpaper* 的有效內容集中在展覽、家具與品牌空間：設計不再只是物件，而是透過展場、商店與城市活動被重新敘事。",
    cases: [
      {
        match: "joris-laarman",
        title: "Joris Laarman：家具作為自然共生的實驗",
        tag: "展覽 / 生態設計",
        body: "報導把家具從物件推向棲地的概念，值得追蹤的是設計如何容納其他生命，而不是只服務人的觀看與使用。",
        points: ["家具被視為生態介面", "自然不只是造型靈感", "展覽讓研究變成可閱讀物件"],
      },
      {
        match: "andrea-branzi",
        title: "Andrea Branzi 展：以朋友視角重讀設計史",
        tag: "展覽 / 設計史",
        body: "這篇的價值在於策展視角：Toyo Ito 的閱讀讓 Branzi 不只是歷史人物，而是仍能影響當代設計想像的方法集合。",
        points: ["策展視角比年表更重要", "設計史被轉成當代對話", "展覽可作為方法論整理"],
      },
      {
        match: "edra-anywhere-sofa",
        title: "Edra Anywhere Sofa：模組沙發的可轉向生活",
        tag: "家具 / 模組",
        body: "旋轉靠背讓沙發不再只面向一個中心，反映客廳正在變成閱讀、交談、工作與休息混合的場域。",
        points: ["家具回應多方向生活", "模組化不等於冷冰冰", "品牌以結構細節創造自由度"],
      },
      {
        match: "new-fornasetti-milan",
        title: "Fornasetti 米蘭店：把工藝轉成可觸摸的品牌空間",
        tag: "零售 / 工藝",
        body: "這間店不是只展示產品，而是讓圖像、材質與工藝形成沉浸式品牌語言。它適合觀察零售空間如何避免空洞打卡化。",
        points: ["工藝成為空間敘事核心", "品牌記憶透過材質被延伸", "商店也能像小型展覽"],
      },
      {
        match: "pauline-deltour",
        title: "Pauline Deltour 回顧展：簡單不是空白",
        tag: "展覽 / 物件設計",
        body: "Deltour 的作品提醒我們，簡潔設計仍需要細節密度。這篇可作為檢查『素雅』與『單薄』差別的參考。",
        points: ["簡潔來自精準決定", "物件尺度需要耐看細節", "回顧展提供風格之外的脈絡"],
      },
      {
        match: "chandigarh-furniture",
        title: "Chandigarh 家具：城市計畫中的日常物件",
        tag: "家具 / 現代主義",
        body: "Chandigarh 家具之所以重要，是因為它連接城市規劃、公共建築與日常使用。這類報導適合放在週報中作為設計史背景。",
        points: ["家具承載城市現代性", "日常物件可成為歷史證據", "形式價值來自使用脈絡"],
      },
      {
        match: "nycxdesign-2026",
        title: "NYCxDesign 2026：城市型設計週的選看方式",
        tag: "活動 / 城市設計週",
        body: "活動預覽不應只是行程表，而要判斷哪些展覽、展會與展間能反映產業方向。這頁整理成觀展線索，而不是廣告清單。",
        points: ["大型活動需要主題式篩選", "展會與畫廊共同定義趨勢", "城市本身也是設計平台"],
      },
      {
        match: "best-residential-architecture-april-2026",
        title: "本月住宅精選：把住宅當作趨勢樣本閱讀",
        tag: "住宅 / 趨勢",
        body: "雖然文章發布在四月底，但仍可作為本週住宅趨勢背景。它的價值在於比較不同基地與住宅類型如何回應生活想像。",
        points: ["住宅案例適合橫向比較", "形式背後是生活假設", "月度精選可作趨勢索引"],
      },
    ],
  },
  ad: {
    title: "Architectural Digest 設計週報",
    eyebrow: "2026.05.01 - 2026.05.08 / 編輯版",
    accent: "#b06d52",
    file: "Architectural_Digest_Design_Weekly_HTML_2026-05-08.html",
    assetSlug: "ad-editorial-2026-05-08",
    thesis: "本週 AD 的有效線索集中在住宅敘事：記憶、收藏、地景與歷史建築如何變成可居住的室內語言。",
    cases: [
      {
        match: "this-minnesota-cabin",
        title: "Minnesota Cabin：在鄉野與電影感之間找平衡",
        tag: "住宅 / 度假屋",
        body: "這個木屋案例值得看的地方，是如何把業主記憶、色彩與自然環境整理成不過度鄉村化的室內語言。",
        points: ["記憶被轉化為色彩與家具", "自然感不等於粗糙感", "小屋尺度需要精準的層次"],
      },
      {
        match: "a-laguna-beach-home",
        title: "Laguna Beach 住宅：海景之外的室內節制",
        tag: "住宅 / 海岸",
        body: "海景住宅很容易只剩窗景，這個案例的重點在於牆面、暗色空間與私密角落如何補足度假生活的厚度。",
        points: ["景觀不是唯一主角", "牆面細節建立室內秩序", "休閒空間也需要私密性"],
      },
      {
        match: "met-costume-institute",
        title: "Met Costume Institute：展覽空間作為敘事基礎設施",
        tag: "展覽 / 文化空間",
        body: "這則新聞可從展示基礎設施來看：大型文化機構如何讓空間支撐未來展覽，而不是只服務單一展期。",
        points: ["展示空間需要長期彈性", "機構品牌與空間命名相互作用", "展覽設計依賴後台尺度"],
      },
      {
        match: "loro-piana-execs-nyc-apartment",
        title: "Loro Piana 紐約公寓：經典感來自材料控制",
        tag: "公寓 / 材質",
        body: "這類公寓案例的重點不是奢華，而是柔軟材料、家具比例與收藏物如何共同建立穩定而耐看的居住氣質。",
        points: ["經典感依賴材質克制", "收藏物需被納入空間節奏", "舒適與精緻可以並存"],
      },
      {
        match: "french-ch%C3%A2teau",
        title: "French Château：歷史建築的親密化改造",
        tag: "歷史建築 / 住宅",
        body: "古堡住宅若只強調戲劇性會失去生活感。本案可觀察設計如何把大尺度歷史建築轉成可日常居住的親密場景。",
        points: ["歷史感需要被日常化", "大尺度空間要重新分段", "家具與織物負責降低距離感"],
      },
      {
        match: "miami-modernist-home",
        title: "Miami Modernist Home：收藏、建築與團隊協作",
        tag: "住宅 / 現代主義",
        body: "這個案例適合放在週報中討論協作：建築、室內與收藏如何同時被整理，而不是互相搶焦點。",
        points: ["收藏決定空間節奏", "建築與室內需要共同語言", "現代主義可以保持生活溫度"],
      },
    ],
  },
};

function siteData(key) {
  return pack.find((site) => site.key === key);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function clipText(value, max = 68) {
  const chars = [...String(value ?? "").replace(/\s+/g, " ").trim()];
  return chars.length > max ? `${chars.slice(0, max - 1).join("")}。` : chars.join("");
}

function firstPoints(item, count = 2) {
  return item.points.slice(0, count);
}

function titleMarkup(title) {
  const value = String(title ?? "");
  const match = value.match(/^([A-Za-z* ]+)(.*)$/);
  if (!match) return `<span>${escapeHtml(value)}</span>`;
  return `<span class="latin">${escapeHtml(match[1].trim())}</span><span>${escapeHtml(match[2].trim())}</span>`;
}

function sanitizeFileName(value) {
  return value.replace(/[^\w.-]+/g, "_").slice(0, 90);
}

function findArticle(site, item) {
  const article = site.articles.find((candidate) => candidate.url.includes(item.match));
  if (!article) throw new Error(`Missing article for ${site.key}: ${item.match}`);
  return article;
}

function pickImage(article) {
  const candidates = [...(article.candidates || [])]
    .filter((candidate) => candidate.quality?.ok)
    .sort((a, b) => {
      const areaA = (a.quality.width || 0) * (a.quality.height || 0);
      const areaB = (b.quality.width || 0) * (b.quality.height || 0);
      const ratioA = Math.abs((a.quality.width || 1) / (a.quality.height || 1) - 1.55);
      const ratioB = Math.abs((b.quality.width || 1) / (b.quality.height || 1) - 1.55);
      return ratioA - ratioB || areaB - areaA;
    });
  const chosen = candidates[0];
  if (!chosen) throw new Error(`No usable image for ${article.url}`);
  return chosen;
}

async function copyImage(article, item, cfg, index) {
  const chosen = pickImage(article);
  const source = path.join(packDir, chosen.path);
  const ext = path.extname(chosen.path) || ".png";
  const folder = path.join(assetRoot, cfg.assetSlug);
  await fs.mkdir(folder, { recursive: true });
  const file = `${String(index + 1).padStart(2, "0")}-${sanitizeFileName(item.match)}${ext}`;
  const target = path.join(folder, file);
  await fs.copyFile(source, target);
  return `html-slide-assets/${cfg.assetSlug}/${file}`.replaceAll("\\", "/");
}

function imgFigure(slide) {
  return `<figure class="visual"><img src="${escapeHtml(slide.image)}" alt="${escapeHtml(slide.title)}" loading="eager"></figure>`;
}

function coverSlide(ctx) {
  return `<section class="slide cover">
    <div class="copy">
      <p class="eyebrow">${escapeHtml(ctx.cfg.eyebrow)}</p>
      <h1>${titleMarkup(ctx.cfg.title)}</h1>
      <p>${escapeHtml(ctx.cfg.thesis)}</p>
    </div>
    ${imgFigure(ctx.cases[0])}
  </section>`;
}

function thesisSlide(ctx) {
  return `<section class="slide thesis">
    <div class="copy wide-copy">
      <p class="eyebrow">EDITORIAL FILTER</p>
      <h2>這一版先做篩選，再做排版</h2>
      <p>刪除招募、站方介紹、分類頁與過舊文章；每則新聞只使用同篇文章的圖片，並改寫成繁體中文的設計判讀。這份週報的任務是提供可閱讀的設計線索，不是替網站導流或堆滿新聞標題。</p>
    </div>
    <div class="filters">
      <span>去除廣告</span>
      <span>去除招募</span>
      <span>繁體改寫</span>
      <span>同文同圖</span>
    </div>
  </section>`;
}

function overviewSlide(ctx) {
  return `<section class="slide overview">
    <div class="copy">
      <p class="eyebrow">THIS WEEK</p>
      <h2>本週保留的重點</h2>
      <p>這一份週報保留 ${ctx.cases.length} 則主要案例，並用趨勢頁補足脈絡。若來源品質不足，寧可說明篩選限制，也不把廣告或分類頁硬塞進簡報。</p>
    </div>
    <div class="cards">
      ${ctx.cases.slice(0, 6).map((item) => `<article><strong>${escapeHtml(item.tag)}</strong><span>${escapeHtml(item.title)}</span></article>`).join("")}
    </div>
  </section>`;
}

function caseSlide(item, index) {
  const reverse = index % 2 === 1 ? " reverse" : "";
  return `<section class="slide case${reverse}">
    ${index % 2 === 0 ? imgFigure(item) : ""}
    <div class="copy">
      <p class="eyebrow">${escapeHtml(item.tag)}</p>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(clipText(item.body, 72))}</p>
      <ul>${firstPoints(item).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      <a href="${escapeHtml(item.url)}" target="_blank">原始文章</a>
    </div>
    ${index % 2 === 1 ? imgFigure(item) : ""}
  </section>`;
}

function detailSlide(item, index) {
  const focus = item.points[index % item.points.length];
  return `<section class="slide detail">
    <div class="copy">
      <p class="eyebrow">DESIGN READING</p>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(focus)}</p>
      <ul>${firstPoints(item).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
    </div>
    ${imgFigure(item)}
  </section>`;
}

function trendSlide(item, imageItem, index) {
  const points = item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
  return `<section class="slide trend">
    <div class="copy">
      <p class="eyebrow">EDITORIAL NOTE ${String(index + 1).padStart(2, "0")}</p>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.body)}</p>
      <ul>${points}</ul>
    </div>
    ${imgFigure(imageItem)}
  </section>`;
}

function sourceSlide(ctx) {
  return `<section class="slide sources">
    <div class="copy">
      <p class="eyebrow">SOURCES</p>
      <h2>來源與後續整理</h2>
      <p>這一版 HTML 可直接用滑鼠滾輪閱讀。若要輸出 PDF，請先在瀏覽器檢查圖片與文字是否吻合，再使用列印功能另存。</p>
    </div>
    <ol>
      ${ctx.cases.map((item) => `<li><a href="${escapeHtml(item.url)}" target="_blank">${escapeHtml(item.title)}</a></li>`).join("")}
    </ol>
  </section>`;
}

function buildHtml(ctx) {
  const slides = [
    coverSlide(ctx),
    thesisSlide(ctx),
    overviewSlide(ctx),
    ...ctx.cases.map(caseSlide),
    ...ctx.cases.map(detailSlide),
  ];
  let noteIndex = 0;
  while (slides.length < 19) {
    const note = commonTrends[noteIndex % commonTrends.length];
    const imageItem = ctx.cases[noteIndex % ctx.cases.length];
    slides.push(trendSlide(note, imageItem, noteIndex));
    noteIndex += 1;
  }
  slides.push(sourceSlide(ctx));
  const numberedSlides = slides.map((slide, index) => slide.replace("<section class=\"slide", `<section data-page="${String(index + 1).padStart(2, "0")} / 20" class="slide`));
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(ctx.cfg.title)}</title>
<style>
:root {
  --paper: #f7f4ed;
  --ink: #27231f;
  --muted: #756c60;
  --line: #d4c8b9;
  --wash: #e8e0d4;
  --accent: ${ctx.cfg.accent};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: #141414;
  color: var(--ink);
  font-family: "中黑體", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
  font-synthesis: none;
  overflow-y: auto;
  scroll-snap-type: y proximity;
}
.deck {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4vh;
  padding: 3vh 0;
}
.slide {
  width: min(100vw, 177.777vh);
  height: min(56.25vw, 100vh);
  aspect-ratio: 16 / 9;
  background: var(--paper);
  position: relative;
  overflow: hidden;
  flex: 0 0 auto;
  scroll-snap-align: start;
  box-shadow: 0 24px 72px #0008;
  padding: 4.8%;
}
.slide::after {
  content: attr(data-page);
  position: absolute;
  right: 4.2%;
  bottom: 3.2%;
  color: var(--muted);
  font: 600 .72rem "AURA", Arial, sans-serif;
  letter-spacing: .08em;
}
.copy { display: flex; flex-direction: column; justify-content: center; min-width: 0; max-height: 100%; overflow: hidden; }
.eyebrow {
  margin: 0 0 .72rem;
  color: var(--accent);
  font: 700 .66rem "AURA", Arial, sans-serif;
  letter-spacing: .12em;
  text-transform: uppercase;
}
h1, h2 { margin: 0; line-height: 1.08; letter-spacing: 0; font-weight: 600; }
h1 { display: grid; gap: .25rem; font-size: clamp(1.9rem, 3.6vw, 3.8rem); }
h1 .latin { font-family: "AURA", Arial, sans-serif; font-weight: 700; }
h2 { font-size: clamp(1.2rem, 2.15vw, 2.25rem); max-width: 12em; }
p, li { font-size: clamp(.76rem, .92vw, .98rem); line-height: 1.52; }
p { margin: .95rem 0 0; }
ul { margin: .95rem 0 0; padding: 0; list-style: none; display: grid; gap: .48rem; }
li { padding-left: 1rem; border-left: 3px solid var(--accent); }
a { width: max-content; margin-top: .85rem; color: var(--accent); text-decoration: none; font-weight: 650; font-size: clamp(.72rem, .85vw, .9rem); }
.visual { margin: 0; width: 100%; height: 100%; min-height: 0; background: var(--wash); display: grid; place-items: center; overflow: hidden; }
.visual img { width: 100%; height: 100%; object-fit: contain; display: block; }
.cover { display: grid; grid-template-columns: 39% 55%; gap: 6%; align-items: stretch; }
.cover .copy { padding-right: 4%; }
.cover p:last-child { max-width: 34rem; color: var(--muted); }
.thesis { display: grid; grid-template-columns: 56% 36%; gap: 8%; align-items: center; }
.wide-copy p { max-width: 46rem; }
.filters { display: grid; gap: 1rem; }
.filters span {
  border-top: 1px solid var(--line);
  padding: .85rem 0;
  font-size: clamp(.85rem, 1.15vw, 1.18rem);
  color: var(--ink);
}
.overview { display: grid; grid-template-columns: 38% 56%; gap: 6%; align-items: center; }
.cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: .78rem; }
.cards article { border-top: 2px solid var(--accent); padding: .72rem 0 0; min-height: 5.2rem; overflow: hidden; }
.cards strong { display: block; color: var(--accent); font-size: .7rem; margin-bottom: .38rem; }
.cards span { display: block; font-size: clamp(.78rem, 1vw, 1rem); line-height: 1.32; }
.case { display: grid; grid-template-columns: 54% 38%; gap: 8%; align-items: stretch; }
.case.reverse { grid-template-columns: 38% 54%; }
.trend, .detail { display: grid; grid-template-columns: 44% 48%; gap: 8%; align-items: stretch; }
.sources { display: grid; grid-template-columns: 36% 56%; gap: 8%; align-items: start; }
.sources ol { margin: 0; padding-left: 1.25rem; }
.sources li { border-left: 0; padding-left: .2rem; margin-bottom: .7rem; }
@media (max-width: 760px) {
  .deck { gap: 3vh; padding: 2vh 0; }
  .slide { width: 100vw; height: auto; min-height: 100svh; aspect-ratio: auto; padding: 7%; box-shadow: none; }
  .cover,
  .thesis,
  .overview,
  .case,
  .case.reverse,
  .trend,
  .detail,
  .sources {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.15rem;
    align-items: start;
  }
  .visual { height: 42svh; }
  p, li { font-size: .9rem; line-height: 1.5; }
  h1 { font-size: 2.2rem; }
  h2 { font-size: 1.5rem; max-width: none; }
  .eyebrow { font-size: .64rem; margin-bottom: .65rem; }
  p, ul, a { margin-top: .75rem; }
  .cards { grid-template-columns: 1fr; }
  .cards article { min-height: auto; padding-top: .6rem; }
  .slide::after { bottom: 1rem; }
}
@media print {
  body { background: white; overflow: visible; }
  .deck { display: block; padding: 0; }
  .slide { width: 100vw; height: 56.25vw; page-break-after: always; box-shadow: none; }
}
</style>
</head>
<body>
<main class="deck">
${numberedSlides.join("\n")}
</main>
<script>
const slides = [...document.querySelectorAll(".slide")];
function nearestSlideIndex() {
  return slides
    .map((slide, index) => ({ index, top: Math.abs(slide.getBoundingClientRect().top) }))
    .sort((a, b) => a.top - b.top)[0]?.index || 0;
}
function go(delta) {
  slides[Math.max(0, Math.min(slides.length - 1, nearestSlideIndex() + delta))]
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
document.addEventListener("keydown", (event) => {
  if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(event.key)) go(1);
  if (["ArrowUp", "ArrowLeft", "PageUp", "Backspace"].includes(event.key)) go(-1);
});
const initial = Number(location.hash.replace("#", ""));
if (initial) requestAnimationFrame(() => slides[initial - 1]?.scrollIntoView({ block: "start" }));
</script>
</body>
</html>`;
}

const outputs = [];
for (const [key, cfg] of Object.entries(configs)) {
  const site = siteData(key);
  const cases = [];
  for (const item of cfg.cases) {
    const article = findArticle(site, item);
    cases.push({
      ...item,
      url: article.url,
      image: await copyImage(article, item, cfg, cases.length),
    });
  }
  const html = buildHtml({ cfg, cases });
  const output = path.join(root, cfg.file);
  await fs.writeFile(output, html, "utf8");
  outputs.push(output);
}

console.log(outputs.join("\n"));
