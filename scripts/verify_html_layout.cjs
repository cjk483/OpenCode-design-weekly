const { chromium } = require("playwright");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const file = process.argv[2] || "Wallpaper_Design_Weekly_HTML_2026-05-08.html";
const sizes = [
  [1366, 768],
  [1024, 768],
  [390, 844],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: "load" });
    const result = await page.evaluate(() => {
      const slides = [...document.querySelectorAll(".slide")];
      const problems = [];
      for (const [index, slide] of slides.entries()) {
        const frame = slide.getBoundingClientRect();
        const elems = [...slide.querySelectorAll("h1,h2,p,li,a,.cards article")];
        let overflow = 0;
        for (const el of elems) {
          const box = el.getBoundingClientRect();
          if (
            box.bottom > frame.bottom - 24 ||
            box.top < frame.top + 4 ||
            box.right > frame.right - 4 ||
            box.left < frame.left + 4
          ) {
            overflow += 1;
          }
        }
        if (overflow) problems.push({ slide: index + 1, overflow });
      }
      return {
        slides: slides.length,
        images: document.images.length,
        loaded: [...document.images].filter((img) => img.complete && img.naturalWidth > 0).length,
        objectFit: getComputedStyle(document.querySelector("img")).objectFit,
        problems,
      };
    });
    await page.screenshot({
      path: `output/${path.basename(file, ".html")}-${width}x${height}.png`,
      fullPage: false,
    });
    console.log(`${width}x${height} ${JSON.stringify(result)}`);
    await page.close();
  }
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
