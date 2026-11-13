// Edited in Pages CMS: one file per item in content/case-studies/
// Each case study has a client name and a project title; the full title ("Client | Project") is built from them
// here, so page titles, lists and cards stay in step. An older item with only a "title" still works.
import { loadCollection } from "../../lib/content.js";

export default () =>
  loadCollection("case-studies").map((cs) => ({
    ...cs,
    title: [cs.clientName, cs.projectTitle].filter(Boolean).join(" | ") || cs.title || "",
  }));
