// Reads a CMS collection from content/<folder>/: one JSON file per item (edited in Pages CMS, see .pages.yml).
// Order: the drag-and-drop lists in content/ordering.json ("Ordering" in Pages CMS) decide the order of each
// collection. Items not in their list yet (e.g. just added) come after, by their old "order" number, then file name.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "content");

// content/ordering.json key for each collection folder
const ORDER_KEYS = {
  "case-studies": "caseStudies",
  "micro-case-studies": "microCaseStudies",
  insights: "insights",
  clients: "clients",
  "client-logos": "clientLogos",
  "service-categories": "serviceCategories",
  services: "services",
  faqs: "faqs",
  sectors: "sectors",
};

function readOrdering() {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, "ordering.json"), "utf8"));
  } catch {
    return {};
  }
}

export function loadCollection(folder) {
  const dir = path.join(root, folder);
  if (!fs.existsSync(dir)) return [];
  const list = (readOrdering()[ORDER_KEYS[folder]] || []).filter(Boolean);
  const rank = new Map(list.map((slug, i) => [slug, i]));
  const pos = (item) => (rank.has(item.slug) ? rank.get(item.slug) : list.length);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({ file: f, item: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }))
    .sort((a, b) =>
      pos(a.item) - pos(b.item) ||
      (a.item.order ?? 9999) - (b.item.order ?? 9999) ||
      a.file.localeCompare(b.file))
    .map(({ item }) => item);
}
