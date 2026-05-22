import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlDir = path.join(root, "output", "html-slides", "2026-05-08");
const portableAssetRoot = path.join(root, "html-slide-assets");

const files = [
  "Gooood_Design_Weekly_HTML_2026-05-08.html",
  "Wallpaper_Design_Weekly_HTML_2026-05-08.html",
  "Architectural_Digest_Design_Weekly_HTML_2026-05-08.html",
];

function decodeSrc(src) {
  return src.replace(/&amp;/g, "&");
}

for (const file of files) {
  const sourceHtmlPath = path.join(htmlDir, file);
  let html = await fs.readFile(sourceHtmlPath, "utf8");
  const slug = path.basename(file, ".html");
  const assetDir = path.join(portableAssetRoot, slug);
  await fs.mkdir(assetDir, { recursive: true });

  const srcs = [...html.matchAll(/<img\s+src="([^"]+)"/g)].map((match) => decodeSrc(match[1]));
  const replacements = new Map();
  for (const src of srcs) {
    if (replacements.has(src)) continue;
    const absolute = path.resolve(htmlDir, src);
    if (!fsSync.existsSync(absolute)) continue;
    const ext = path.extname(absolute) || ".png";
    const targetName = `${String(replacements.size + 1).padStart(2, "0")}${ext}`;
    const target = path.join(assetDir, targetName);
    await fs.copyFile(absolute, target);
    replacements.set(src, `html-slide-assets/${slug}/${targetName}`);
  }

  for (const [from, to] of replacements) {
    html = html.split(`src="${from}"`).join(`src="${to}"`);
  }

  await fs.writeFile(path.join(root, file), html, "utf8");
  console.log(`${file}: copied ${replacements.size} images`);
}
