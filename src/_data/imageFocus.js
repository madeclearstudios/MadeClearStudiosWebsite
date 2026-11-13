// Where to crop each photo shown in a fixed-shape grid (the 4:3 top galleries on case studies, micro case studies
// and service pages), so heads and the main subject stay in frame: { "/images/...": "x% y%" }, used as the
// photo's CSS object-position. Worked out at build time by lib/focal-point.js and cached in .cache/ by file
// size and date, so only new or changed photos are checked. A photo given as { "src": …, "focus": "50% 20%" }
// in the content uses that position instead.
import fs from "node:fs";
import path from "node:path";
import { loadCollection } from "../../lib/content.js";
import { focalPoint } from "../../lib/focal-point.js";

const CACHE = ".cache/focal-points.json";
const live = (items) => items.filter((i) => !i.draft && !i.archived);
const srcOf = (img) => (img && typeof img === "object" ? img.src : img);

export default async function () {
  const images = new Set();
  const add = (img) => { const s = srcOf(img); if (s && s.startsWith("/images/")) images.add(s); };
  for (const cs of live(loadCollection("case-studies"))) { add(cs.coverPhoto); (cs.imageSlider || []).forEach(add); }
  for (const m of live(loadCollection("micro-case-studies"))) { add(m.coverPhoto); (m.gallery || []).forEach(add); }
  for (const s of live(loadCollection("services"))) (s.gallery || []).forEach(add);

  let cache = {};
  try { cache = JSON.parse(fs.readFileSync(CACHE, "utf8")); } catch {}
  const out = {};
  let checked = 0;
  for (const src of images) {
    const file = path.join("src", decodeURI(src));
    let stat;
    try { stat = fs.statSync(file); } catch { continue; }
    const key = `${src}|${stat.size}|${Math.round(stat.mtimeMs)}`;
    if (!cache[key]) {
      try { cache[key] = await focalPoint(file); checked++; } catch (e) { console.warn(`[imageFocus] Could not check ${src}: ${e.message}`); }
    }
    if (cache[key]) out[src] = cache[key];
  }
  try { fs.mkdirSync(path.dirname(CACHE), { recursive: true }); fs.writeFileSync(CACHE, JSON.stringify(cache)); } catch {}
  if (checked) console.log(`[imageFocus] Checked ${checked} photo(s) for heads and points of interest`);
  return out;
}
