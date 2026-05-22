import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const packDate = process.argv[2] || "2026-05-08";
const packDir = path.join(root, "output", "research-pack", packDate);
const outDir = path.join(root, "output", "html-slides", packDate);

const siteConfig = {
  gooood: {
    title: "Gooood Design Weekly",
    site: "gooood",
    accent: "#758765",
    file: "Gooood_Design_Weekly_HTML_2026-05-08.html",
    thesis: "A curated weekly view of public space, workplace renewal, housing adaptation, and material experiments.",
  },
  wallpaper: {
    title: "Wallpaper Design Weekly",
    site: "Wallpaper*",
    accent: "#5C7D8C",
    file: "Wallpaper_Design_Weekly_HTML_2026-05-08.html",
    thesis: "A refined weekly thread across design events, exhibitions, homes, and architectural preservation.",
  },
  ad: {
    title: "Architectural Digest Design Weekly",
    site: "Architectural Digest",
    accent: "#B36A48",
    file: "Architectural_Digest_Design_Weekly_HTML_2026-05-08.html",
    thesis: "Homes, collections, identity, and interiors form this week's editorial focus.",
  },
};

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
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
  const chosen = candidates[0] || article.candidates?.[0];
  if (!chosen) return undefined;
  const absolute = path.join(packDir, chosen.path);
  return fsSync.existsSync(absolute) ? path.relative(outDir, absolute).replaceAll("\\", "/") : undefined;
}

function keepArticles(site) {
  return site.articles
    .filter((article) => pickImage(article))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 12);
}

function trendLabels(articles) {
  const text = articles.map((a) => `${a.title} ${a.description}`).join(" ").toLowerCase();
  const groups = [
    ["Events", ["exhibition", "event", "festival", "design week", "milan", "nyc"]],
    ["Homes", ["home", "house", "residential", "apartment", "cabin", "interior"]],
    ["Materials", ["material", "sustainable", "reuse", "wood", "zero", "carbon"]],
    ["Urban", ["public", "city", "urban", "park", "landscape", "architecture"]],
  ];
  return groups.map(([label, keys]) => ({
    label,
    strength: Math.max(1, keys.filter((key) => text.includes(key)).length),
  }));
}

function imageFigure(article, className = "") {
  const img = pickImage(article);
  return `<figure class="image ${className}">
    <img src="${escapeHtml(img)}" alt="${escapeHtml(article.title)}" loading="eager">
  </figure>`;
}

function articleSlide(article, index) {
  const desc = clean(article.description) || "Summary not available. Open the source link before turning this item into a research note.";
  const layout = index % 3;
  if (layout === 0) {
    return `<section class="slide split">
      ${imageFigure(article, "image-left")}
      <div class="copy">
        <p class="kicker">${escapeHtml(new URL(article.url).hostname)}</p>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(desc)}</p>
        <div class="rule"></div>
        <p class="note">Design read: use the image as a clue to method, not as decoration.</p>
      </div>
    </section>`;
  }
  if (layout === 1) {
    return `<section class="slide image-top">
      ${imageFigure(article, "wide")}
      <div class="bottom-band">
        <div>
          <p class="kicker">${escapeHtml(new URL(article.url).hostname)}</p>
          <h2>${escapeHtml(article.title)}</h2>
        </div>
        <p>${escapeHtml(desc)}</p>
      </div>
    </section>`;
  }
  return `<section class="slide split reverse">
    <div class="copy">
      <p class="kicker">${escapeHtml(new URL(article.url).hostname)}</p>
      <h2>${escapeHtml(article.title)}</h2>
      <p>${escapeHtml(desc)}</p>
      <a href="${escapeHtml(article.url)}" target="_blank">Source</a>
    </div>
    ${imageFigure(article, "image-right")}
  </section>`;
}
function analysisSlide(title, points, article) {
  return `<section class="slide analysis">
    <div class="copy">
      <p class="kicker">EDITORIAL NOTE</p>
      <h2>${escapeHtml(title)}</h2>
      <ul>${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
    </div>
    ${imageFigure(article, "analysis-image")}
  </section>`;
}

function sourceSlide(articles) {
  return `<section class="slide sources">
    <div>
      <p class="kicker">SOURCES</p>
      <h2>靘???蝥?/h2>
      <p>??HTML 蝪∪雿輻蝝??葉???釭瑼Ｘ??迤撘飛瑼?嚗遣霅啣???獢????桃? Obsidian ?弦?～?/p>
    </div>
    <ol>
      ${articles.slice(0, 10).map((article) => `<li><a href="${escapeHtml(article.url)}" target="_blank">${escapeHtml(article.title)}</a></li>`).join("")}
    </ol>
  </section>`;
}

function buildHtml(site) {
  const cfg = siteConfig[site.key];
  const articles = keepArticles(site);
  const trends = trendLabels(articles);
  const articleSlides = articles.map(articleSlide).join("\n");
  const totalSlides = 20;
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(cfg.title)}</title>
<style>
:root {
  --paper: #f7f3ea;
  --wash: #e8dfd2;
  --ink: #292724;
  --muted: #746c60;
  --hair: #c9bdae;
  --accent: ${cfg.accent};
}
* { box-sizing: border-box; }
html, body { margin: 0; background: #111; color: var(--ink); font-family: "銝剝?擃?, "Noto Sans TC", "Microsoft JhengHei", sans-serif; }
body { overflow-y: auto; scroll-snap-type: y proximity; }
.deck { width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; gap: 6vh; padding: 4vh 0; }
.slide {
  width: min(100vw, 177.777vh);
  height: min(56.25vw, 100vh);
  aspect-ratio: 16 / 9;
  background: var(--paper);
  position: relative;
  overflow: hidden;
  display: block;
  padding: 6.2% 5.8%;
  flex: 0 0 auto;
  scroll-snap-align: start;
  box-shadow: 0 20px 80px #0008;
}
.slide.active { display: block; }
.slide::after {
  content: attr(data-page);
  position: absolute;
  right: 4.2%;
  bottom: 3.4%;
  color: var(--muted);
  font: 500 0.72rem "AURA", Arial, sans-serif;
  letter-spacing: .08em;
}
.slide::before {
  content: "${escapeHtml(cfg.site)} 繚 2026.05.01 - 2026.05.08";
  position: absolute;
  left: 4.2%;
  bottom: 3.4%;
  color: var(--muted);
  font: 500 0.7rem "AURA", Arial, sans-serif;
  letter-spacing: .06em;
}
h1, h2 { margin: 0; line-height: 1.08; letter-spacing: 0; }
h1 { font-size: clamp(2.2rem, 5vw, 4.4rem); max-width: 52%; }
h2 { font-size: clamp(1.55rem, 3vw, 3.1rem); }
p { margin: 0; line-height: 1.55; font-size: clamp(.86rem, 1.15vw, 1.12rem); }
a { color: var(--accent); text-decoration: none; }
.kicker { font: 600 .72rem "AURA", Arial, sans-serif; color: var(--accent); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.05rem; }
.cover { display: grid; grid-template-columns: 1fr 1fr; gap: 5.5%; align-items: center; }
.cover.active { display: grid; grid-template-columns: 1fr 1fr; gap: 5.5%; align-items: center; }
.cover .hero { width: 100%; height: 100%; min-height: 27rem; }
.cover .intro { padding-left: 3%; }
.cover .intro p:last-child { margin-top: 2.6rem; color: var(--muted); max-width: 28rem; }
.image { margin: 0; background: var(--wash); display: grid; place-items: center; overflow: hidden; }
.image img { width: 100%; height: 100%; object-fit: contain; display: block; }
.split { grid-template-columns: 58% 34%; gap: 6%; align-items: center; }
.split { display: grid; }
.split.active { display: grid; }
.split.reverse { grid-template-columns: 34% 58%; }
.split .image { height: 100%; min-height: 29rem; }
.copy p { margin-top: 1.2rem; }
.rule { width: 46%; height: 2px; background: var(--accent); margin: 2.2rem 0 1.2rem; }
.note { color: var(--muted); }
.image-top { display: grid; grid-template-rows: 68% auto; padding: 4.2% 5.2% 6.3%; }
.image-top.active { display: grid; grid-template-rows: 68% auto; padding: 4.2% 5.2% 6.3%; }
.image-top .wide { width: 100%; height: 100%; }
.bottom-band { display: grid; grid-template-columns: 45% 42%; gap: 8%; align-items: start; padding-top: 1.1rem; }
.trends { display: grid; grid-template-columns: 50% 42%; gap: 8%; align-items: center; }
.trends.active { display: grid; grid-template-columns: 50% 42%; gap: 8%; align-items: center; }
.trend-bars { height: 63%; display: grid; grid-template-columns: repeat(4, 1fr); align-items: end; gap: 1.2rem; }
.trend { display: grid; align-content: end; gap: .9rem; height: 100%; }
.trend span { display: block; background: color-mix(in srgb, var(--accent) 68%, white); min-height: 18%; }
.trend strong { font-size: clamp(.9rem, 1.35vw, 1.25rem); text-align: center; }
.analysis { display: grid; grid-template-columns: 46% 46%; gap: 8%; align-items: center; }
.analysis.active { display: grid; grid-template-columns: 46% 46%; gap: 8%; align-items: center; }
.analysis ul { margin: 2rem 0 0; padding: 0; list-style: none; display: grid; gap: 1rem; }
.analysis li { line-height: 1.55; font-size: clamp(.9rem, 1.2vw, 1.12rem); padding-left: 1.1rem; border-left: 3px solid var(--accent); }
.analysis-image { height: 31rem; }
.sources { display: grid; grid-template-columns: 38% 54%; gap: 8%; align-items: start; }
.sources.active { display: grid; grid-template-columns: 38% 54%; gap: 8%; align-items: start; }
.sources ol { margin: 0; padding-left: 1.4rem; columns: 1; }
.sources li { margin-bottom: .7rem; line-height: 1.4; font-size: clamp(.82rem, 1.05vw, 1rem); }
.controls { display: none; }
button { display: none; }
@media print {
  body { overflow: visible; background: white; }
  .deck { display: block; width: auto; height: auto; }
  .slide { display: block !important; position: relative; width: 100vw; height: 56.25vw; page-break-after: always; }
  .controls { display: none; }
}
</style>
</head>
<body>
<main class="deck">
  <section class="slide cover active">
    <div class="intro">
      <p class="kicker">HTML DESIGN WEEKLY</p>
      <h1>${escapeHtml(cfg.title)}</h1>
      <p>${escapeHtml(cfg.thesis)}</p>
      <p>Images are loaded from the vetted research pack and displayed at their original proportions.</p>
    </div>
    ${imageFigure(articles[0], "hero")}
  </section>
  <section class="slide trends">
    <div>
      <p class="kicker">WEEKLY SIGNALS</p>
      <h2>This weekly report is designed for scrolling review, not button-by-button playback.</h2>
      <p style="margin-top:1.4rem;color:var(--muted)">Use the mouse wheel or trackpad to move through the full deck. Each slide keeps a 16:9 frame.</p>
    </div>
    <div class="trend-bars">
      ${trends.map((trend) => `<div class="trend"><span style="height:${20 + trend.strength * 18}%"></span><strong>${escapeHtml(trend.label)}</strong></div>`).join("")}
    </div>
  </section>
  ${articleSlides}
  ${analysisSlide("Why HTML works better here", [
    "Images keep their original ratio in the browser.",
    "Scrolling review is faster than previous and next controls.",
    "Source links remain directly accessible.",
    "The deck can still be printed to PDF from the browser."
  ], articles[1] || articles[0])}
  ${analysisSlide("Image rules", [
    "Use only images that passed the research-pack quality check.",
    "Use object-fit: contain to prevent stretching.",
    "Keep whitespace when the image ratio does not match the slide.",
    "Do not use weak images simply to fill a page."
  ], articles[2] || articles[0])}
  ${analysisSlide("Research workflow", [
    "Read the design problem before the form.",
    "Keep one key interpretation per slide.",
    "Group events and exhibitions into trend signals.",
    "Move the best cases into Obsidian as deeper notes."
  ], articles[3] || articles[0])}
  ${analysisSlide("Next step", [
    "Scroll this HTML deck directly in the browser.",
    "Print to PDF only after visual review.",
    "Return to selection-board.html if an image should be replaced.",
    "Archive the HTML, images, and source JSON together."
  ], articles[4] || articles[0])}
  ${analysisSlide("Editorial conclusion", [
    "HTML is better for image-led weekly design reports.",
    "PPT remains useful for final handoff, but not for first review.",
    "Quality depends on source curation before slide generation.",
    "This should become the default Codex-direct report format."
  ], articles[5] || articles[0])}
  ${sourceSlide(articles)}
</main><script>
const slides = [...document.querySelectorAll('.slide')];
slides.forEach((slide, index) => slide.dataset.page = String(index + 1).padStart(2, '0') + ' / ${totalSlides}');
function scrollToSlide(index) {
  const slide = slides[Math.max(0, Math.min(slides.length - 1, index))];
  slide?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.addEventListener('keydown', (event) => {
  const centers = slides.map((slide, index) => ({ index, delta: Math.abs(slide.getBoundingClientRect().top) }));
  centers.sort((a, b) => a.delta - b.delta);
  const current = centers[0]?.index || 0;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) scrollToSlide(current + 1);
  if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) scrollToSlide(current - 1);
});
const initial = Number(location.hash.replace('#', ''));
if (initial) requestAnimationFrame(() => scrollToSlide(initial - 1));
</script>
</body>
</html>`;
}

await fs.mkdir(outDir, { recursive: true });
const data = JSON.parse(await fs.readFile(path.join(packDir, "research-pack.json"), "utf8"));
const outputs = [];
for (const site of data) {
  const cfg = siteConfig[site.key];
  const html = buildHtml(site);
  const output = path.join(outDir, cfg.file);
  await fs.writeFile(output, html, "utf8");
  outputs.push(output);
}
console.log(outputs.join("\n"));



