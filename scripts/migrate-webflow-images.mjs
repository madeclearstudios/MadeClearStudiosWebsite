// One-off: moves every image still loaded from Webflow's CDN into the site, so nothing breaks when Webflow is
// cancelled and so the images can be edited in Pages CMS (which only accepts images stored in the repo).
//
// Finds Webflow CDN links in content/ (CMS data) and src/ (templates, scripts, styles), downloads each image to
// src/images/uploads/webflow/, and rewrites the links to /images/uploads/webflow/<file>. If any download fails it
// changes nothing, so the site never ends up with broken images.
//
// Run by the "Move Webflow images into the site" GitHub Action (Actions tab > Run workflow), because Webflow's CDN
// may not be reachable from everywhere. Locally: node scripts/migrate-webflow-images.mjs
// Add --dry-run to list what would change without downloading or editing anything.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT_DIR = path.join(ROOT, "src/images/uploads/webflow");
const PUBLIC_PREFIX = "/images/uploads/webflow/";
const DRY_RUN = process.argv.includes("--dry-run");

// Webflow CDN hosts. A link ends at a quote, whitespace or angle bracket; brackets inside file names
// such as "Logo (1).png" are kept, and an unmatched ")" (the end of a CSS url(...)) ends the link.
const URL_RE = /https:\/\/(?:cdn\.prod\.website-files\.com|uploads-ssl\.webflow\.com|assets-global\.website-files\.com)\/[^"'\s<>]+/g;

function cleanUrl(raw) {
  // Cut at the first ")" with no matching "(" (the end of a CSS url(...), even if "!important" follows)
  let depth = 0, end = raw.length;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "(") depth++;
    else if (raw[i] === ")" && depth-- === 0) { end = i; break; }
  }
  return raw.slice(0, end).replace(/[,;]+$/, "");
}

function localName(url) {
  const base = decodeURIComponent(url.split("?")[0].split("/").pop());
  const ext = path.extname(base).toLowerCase();
  const stem = base.slice(0, base.length - ext.length)
    .normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return stem + ext;
}

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["images", "fonts", "node_modules"].includes(entry.name)) walk(p, exts, out);
    } else if (exts.includes(path.extname(entry.name))) out.push(p);
  }
  return out;
}

const files = [...walk(path.join(ROOT, "content"), [".json"]), ...walk(path.join(ROOT, "src"), [".njk", ".js", ".css", ".html", ".json"])];

// Collect every link and the local file it maps to
const urls = new Map();
for (const file of files) {
  for (const raw of fs.readFileSync(file, "utf8").match(URL_RE) || []) {
    const url = cleanUrl(raw);
    if (!urls.has(url)) urls.set(url, localName(url));
  }
}
const names = new Map();
for (const [url, name] of urls) {
  if (names.has(name) && names.get(name) !== url) throw new Error(`Two different images would be saved as ${name}`);
  names.set(name, url);
}
console.log(`${urls.size} Webflow images found in ${files.length} files`);
if (!urls.size) process.exit(0);

// Download everything first; stop before changing any file if a download fails
if (!DRY_RUN) fs.mkdirSync(OUT_DIR, { recursive: true });
let failed = 0;
for (const [url, name] of urls) {
  const dest = path.join(OUT_DIR, name);
  if (DRY_RUN) { console.log(`  ${name}  <-  ${url}`); continue; }
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) continue;
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      ok = true;
    } catch (err) {
      if (attempt === 3) console.error(`  FAILED ${url}: ${err.message}`);
      else await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  if (!ok) failed++;
}
if (failed) {
  console.error(`${failed} downloads failed, so no files were changed.`);
  process.exit(1);
}

// Rewrite the links. Share images (og:image / twitter:image) need a full address, which the build adds.
let changedFiles = 0;
for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(URL_RE, (raw) => {
    const url = cleanUrl(raw);
    return PUBLIC_PREFIX + urls.get(url) + raw.slice(url.length);
  });
  if (after !== before) {
    changedFiles++;
    if (DRY_RUN) console.log(`  would update ${path.relative(ROOT, file)}`);
    else fs.writeFileSync(file, after);
  }
}
console.log(`${DRY_RUN ? "Would update" : "Updated"} ${changedFiles} files${DRY_RUN ? "" : `; images saved in ${path.relative(ROOT, OUT_DIR)}/`}`);
