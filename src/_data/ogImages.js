// Share images (og:image / twitter:image) for case studies, micro case studies, insights and service pages:
// { "/images/...": "/og/<name>.jpg" }. LinkedIn and Facebook don't show AVIF or WebP and prefer 1200x630, so each
// cover photo gets a 1200x630 JPEG copy, cropped around its point of interest (sharp's attention detection, as for
// the gallery crops). Written to _site/og/ and kept in .cache/og/ so unchanged photos aren't redone.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { loadCollection } from "../../lib/content.js";

const live = (items) => items.filter((i) => !i.draft && !i.archived);
const srcOf = (img) => (img && typeof img === "object" ? img.src : img);

export default async function () {
  const want = new Set();
  const add = (img) => { const s = srcOf(img); if (s && s.startsWith("/images/")) want.add(s); };
  const micros = live(loadCollection("micro-case-studies"));
  for (const cs of live(loadCollection("case-studies"))) add(cs.coverPhoto);
  for (const m of micros) add(m.coverPhoto);
  for (const i of live(loadCollection("insights"))) add(i.coverPhoto);
  for (const s of live(loadCollection("services"))) {
    if (!s.hasPage) continue;
    const first = (s.gallery || [])[0] || (micros.find((m) => !m.hidden && (m.services || []).includes(s.slug)) || {}).coverPhoto;
    add(s.image || first);
  }

  const out = {};
  fs.mkdirSync(".cache/og", { recursive: true });
  fs.mkdirSync("_site/og", { recursive: true });
  for (const src of want) {
    const file = path.join("src", decodeURI(src));
    let stat;
    try { stat = fs.statSync(file); } catch { continue; }
    const name = crypto.createHash("md5").update(`${src}|${stat.size}|${Math.round(stat.mtimeMs)}`).digest("hex").slice(0, 12) + ".jpg";
    const cached = path.join(".cache/og", name);
    try {
      if (!fs.existsSync(cached)) {
        await sharp(file).resize(1200, 630, { fit: "cover", position: sharp.strategy.attention }).jpeg({ quality: 82, mozjpeg: true }).toFile(cached);
      }
      fs.copyFileSync(cached, path.join("_site/og", name));
      out[src] = `/og/${name}`;
    } catch (e) {
      console.warn(`[ogImages] Could not make a share image for ${src}: ${e.message}`);
    }
  }
  return out;
}
