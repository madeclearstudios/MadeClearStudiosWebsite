// Reads a CMS collection from content/<folder>/: one JSON file per item (edited in Pages CMS, see .pages.yml).
// Returns the items as an array, sorted by their "order" field, then by file name.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "content");

export function loadCollection(folder) {
  const dir = path.join(root, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({ file: f, item: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }))
    .sort((a, b) => (a.item.order ?? 9999) - (b.item.order ?? 9999) || a.file.localeCompare(b.file))
    .map(({ item }) => item);
}
