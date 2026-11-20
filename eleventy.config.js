import { execSync } from "node:child_process";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default function (eleventyConfig) {
  // Static assets exported from Webflow, copied as-is
  for (const dir of ["css", "js", "images", "fonts"]) {
    eleventyConfig.addPassthroughCopy(`src/${dir}`);
  }
  eleventyConfig.addPassthroughCopy("src/_redirects");

  // Resize images on build: every <img> pointing at a local image gets smaller copies (in _site/img/)
  // and a srcset, so phones download a phone-sized file. The original file stays as passthrough.
  // SVGs are left alone. Add eleventy:ignore to an <img> to skip it.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "svg"], // "svg" + svgShortCircuit keeps SVGs as they are; everything else becomes WebP
    widths: [480, 960, 1600],
    svgShortCircuit: true,
    failOnError: false,
    cacheOptions: { duration: "1y" },
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async", sizes: "(max-width: 767px) 100vw, 60vw" },
    },
  });
  // CMS content (one JSON file per item, edited in Pages CMS) lives in content/; rebuild the preview when it changes
  eleventyConfig.addWatchTarget("content/");

  // Used by the footer copyright line and the sitemap
  eleventyConfig.addGlobalData("year", () => new Date().getFullYear());
  const siteUrl = "https://madeclearstudios.com";

  // Sitemap lastmod: the date of the last commit that changed a file (falls back to today if git has no history
  // for it, e.g. a file that isn't committed yet).
  const lastModCache = {};
  eleventyConfig.addFilter("lastModified", (file) => {
    if (!file) return new Date().toISOString().slice(0, 10);
    if (!(file in lastModCache)) {
      let d = "";
      try { d = execSync(`git log -1 --format=%cs -- "${file.replace(/^\.\//, "")}"`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch {}
      lastModCache[file] = d || new Date().toISOString().slice(0, 10);
    }
    return lastModCache[file];
  });
  eleventyConfig.addGlobalData("siteUrl", siteUrl);

  // Canonical tag on every page: tells search engines the real address is the clean madeclearstudios.com
  // one (not www, the .netlify.app address, or /page.html). Skipped on the 404 page and noindex pages.
  eleventyConfig.addTransform("canonical", function (content) {
    const out = this.page.outputPath;
    if (!out || !out.endsWith(".html") || this.page.url === "/404.html" || /name="robots" content="noindex"/.test(content)) return content;
    const path = this.page.url === "/" ? "/" : this.page.url.replace(/\.html$/, "");
    return content.replace("</head>", `  <link rel="canonical" href="${siteUrl}${path}">\n</head>`);
  });

  // /llms.txt is plain text: undo the HTML escaping templates apply (&amp; &#39; ...)
  eleventyConfig.addTransform("llms-plain-text", function (content) {
    if (!(this.page.outputPath || "").endsWith("llms.txt")) return content;
    return content.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  });

  // Share images (og:image / twitter:image) must be full addresses; turn site-relative ones into absolute ones
  eleventyConfig.addTransform("absolute-share-images", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(
      /(<meta content=")(\/[^"]+)(" (?:property="og:image"|name="twitter:image")>)/g,
      (m, a, url, b) => a + siteUrl + url + b
    );
  });

  // CMS helpers. The collections live in src/_data/*.json (exported from the Webflow CMS).
  // Items with "draft": true or "archived": true are left off the site, like in Webflow.
  const published = (items = []) => items.filter((i) => !i.draft && !i.archived);
  eleventyConfig.addFilter("published", published);
  // Rich text from Webflow and Pages CMS: drop empty paragraphs (including ones holding only Webflow's invisible
  // zero-width joiner, a space or <br>), line breaks at the start or end of a paragraph, and turn runs of <br> into
  // a paragraph break, so copy keeps the normal paragraph spacing instead of double or triple gaps.
  eleventyConfig.addFilter("tidyHtml", (html = "") => String(html || "")
    .replace(/\u200d/g, "")
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)+/g, "<p>")
    .replace(/(?:\s|&nbsp;|<br\s*\/?>)+<\/p>/g, "</p>")
    .replace(/(?:<br\s*\/?>\s*){2,}/g, "</p><p>")
    .replace(/<p>\s*<\/p>/g, ""));

  eleventyConfig.addFilter("where", (items = [], key, value) => items.filter((i) => i[key] === value));
  eleventyConfig.addFilter("whereIn", (items = [], key, values = []) => items.filter((i) => values.includes(i[key])));
  eleventyConfig.addFilter("whereIncludes", (items = [], key, value) => items.filter((i) => (i[key] || []).includes(value)));
  eleventyConfig.addFilter("whereIncludesAny", (items = [], key, values = []) => items.filter((i) => (i[key] || []).some((v) => values.includes(v))));

  // Service families: smaller services are folded into a main service page with "partOf" (e.g. 3D model development
  // is part of Animation). The Services page lists only main services; a main page's Recent work includes projects
  // tagged with any service in its family; lists of a project's services show the main services.
  eleventyConfig.addFilter("mainServices", (items = []) => items.filter((s) => !s.partOf));
  eleventyConfig.addFilter("serviceFamily", (all = [], slug) => [slug, ...all.filter((s) => s.partOf === slug).map((s) => s.slug)]);
  eleventyConfig.addFilter("toMainServices", (slugs = [], all = []) => {
    const out = [];
    for (const slug of slugs || []) {
      const s = all.find((x) => x.slug === slug && !x.draft && !x.archived);
      if (!s) continue;
      const main = s.partOf ? all.find((x) => x.slug === s.partOf) || s : s;
      if (!out.includes(main)) out.push(main);
    }
    return out;
  });
  // FAQ structured data (schema.org FAQPage) from [{ question, answer (HTML) }]
  eleventyConfig.addFilter("faqSchema", (faqs = []) =>
    faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: String(f.answer).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim() },
    }))
  );
  // Meta descriptions: plain text, at most ~155 characters, cut at a word boundary
  eleventyConfig.addFilter("metaDescription", (text = "", max = 155) => {
    const plain = String(text || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    if (plain.length <= max) return plain;
    return plain.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[,;:.\s]+$/, "") + "…";
  });
  // "2026-05-15" -> "15 May 2026"
  eleventyConfig.addFilter("readableDate", (d) => {
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  });
  // What kind of project this is, in the words people search with, from its services (case study titles, meta
  // descriptions and structured data). First match wins.
  // Search titles: the first candidate that fits in about 62 characters (Google cuts longer ones short), else the
  // last (shortest) one. Pages list their preferred title first, e.g. with " | Made Clear", then shorter versions.
  eleventyConfig.addFilter("fitTitle", (candidates = [], max = 62) => {
    const list = (candidates || []).filter(Boolean);
    return list.find((t) => t.length <= max) || list[list.length - 1] || "";
  });
  eleventyConfig.addFilter("projectType", (services = []) => {
    const has = (...slugs) => slugs.some((x) => (services || []).includes(x));
    if (has("vr-experiences", "vr-and-immersive-experiences")) return "VR medical education";
    if (has("campaign-strategy", "campaign-creative-and-concepts")) return "medical awareness campaign";
    if (has("live-cases")) return "live case production";
    if (has("on-site-congress-and-event-production")) return "congress filming";
    const film = has("film-and-video-content", "medical-film-and-documentary", "kol-content");
    const anim = has("animation", "3d-model-development", "medical-illustration-and-infographics");
    if (film && anim) return "medical film and animation";
    if (anim) return "medical animation";
    if (film) return "medical film";
    return "cardiology content";
  });
  // Search description for a case study: its overview, plus (if that is short) the longest of a few sentences about
  // the kind of work and the client that still fits in 155 characters
  eleventyConfig.addFilter("seoDescription", function (overview = "", type = "", client = "") {
    const md = eleventyConfig.getFilter("metaDescription");
    const base = md(overview, 400);
    if (base.length >= 110) return md(base);
    const T = type.charAt(0).toUpperCase() + type.slice(1);
    const who = client || "a cardiology client";
    const options = [
      `${T} for ${who} by Made Clear, the award-winning cardiology content agency.`,
      `${T} for ${who} by Made Clear, cardiology content agency.`,
      `${T} for ${who} by Made Clear.`,
      `${T} for ${who}.`,
    ];
    for (const o of options) { const t = (base ? base + " " : "") + o; if (t.length <= 155) return t; }
    return md(base);
  });
  // Body of work timeline (Case Studies page): published, non-hidden micro case studies grouped by year, newest
  // first, then by month (the "Month" dropdown in Pages CMS) within each year
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // Micro case studies newest first (year, then the Month dropdown), for the horizontal work rails
  eleventyConfig.addFilter("newestFirst", (items = []) =>
    [...items].sort((a, b) => (b.year || 0) - (a.year || 0) || (MONTHS.indexOf(b.month) + 1) - (MONTHS.indexOf(a.month) + 1))
  );
  // Work rails: micro case studies and full case studies in one row, newest first by year and month. Each entry is
  // { kind: "micro" | "case", item }. Undated items go last; undated case studies after undated micro case studies.
  eleventyConfig.addFilter("workRailMix", (micros = [], cases = []) => {
    const monthNo = (m) => MONTHS.indexOf(m) + 1; // 0 when not set
    const all = [
      ...micros.map((item, i) => ({ kind: "micro", item, i })),
      ...cases.map((item, i) => ({ kind: "case", item, i: 1000 + i })),
    ];
    return all.sort((a, b) =>
      (b.item.year || 0) - (a.item.year || 0) ||
      monthNo(b.item.month) - monthNo(a.item.month) ||
      a.i - b.i
    );
  });
  eleventyConfig.addFilter("workTimeline", (items = []) => {
    const monthNo = (m) => MONTHS.indexOf(m) + 1; // 0 when not set
    const sorted = published(items)
      .filter((m) => !m.hidden)
      .sort((a, b) => (b.year || 0) - (a.year || 0) || monthNo(b.month) - monthNo(a.month));
    const years = [];
    for (const m of sorted) {
      const y = m.year || "";
      if (!years.length || years[years.length - 1].year !== y) years.push({ year: y, items: [] });
      years[years.length - 1].items.push(m);
    }
    return years;
  });
  eleventyConfig.addFilter("findBy", (items = [], key, value) => items.find((i) => i[key] === value));
  eleventyConfig.addFilter("except", (items = [], item) => items.filter((i) => i !== item));
  // Service page gallery, filled automatically from the projects tagged with the service: the hero (cover)
  // image of each micro case study and case study first, then, if that gives fewer than `max`, their other
  // photos (micro case study gallery, case study gallery/imageSlider). No duplicates; hidden projects are skipped.
  eleventyConfig.addFilter("workGallery", (projects = [], max = 3) => {
    const live = projects.filter((p) => p && !p.hidden);
    const src = (img) => (img && typeof img === "object" ? img.src : img);
    const out = [];
    const add = (img) => { const s = src(img); if (s && !out.includes(s) && out.length < max) out.push(s); };
    live.forEach((p) => add(p.coverPhoto));
    live.forEach((p) => (p.gallery || p.imageSlider || []).forEach(add));
    return out;
  });
  eleventyConfig.addFilter("sortBy", (items = [], key) =>
    [...items].sort((a, b) => String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "en", { sensitivity: "base" }))
  );
  // KOL names: surname from the CMS "Last Name" field (else the last word of the name); first name without titles
  const surname = (e = {}) => (e.lastName || String(e.name || "").trim().split(/\s+/).pop() || "").trim();
  eleventyConfig.addFilter("surname", surname);
  eleventyConfig.addFilter("surnameInitial", (e) => surname(e).charAt(0).toUpperCase());
  eleventyConfig.addFilter("firstName", (e = {}) =>
    String(e.name || "").replace(/^(dr|prof|sir|mr|mrs|ms|miss)\.?\s+/i, "").trim().split(/\s+/)[0] || "");
  // Collections already arrive in the order set in Pages CMS ("Ordering", content/ordering.json; see lib/content.js),
  // and filtering keeps that order, so this keeps the list as it is. Kept so templates read clearly.
  eleventyConfig.addFilter("sortByOrder", (items = []) => [...items]);

  // Videos are YouTube links (any form: youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID).
  // Older Vimeo links still play until they're replaced; any other link is left out (see the "videos" filter).
  const youtubeId = (url) => {
    const m = String(url || "").match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  };
  const vimeoMatch = (url) => String(url || "").match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/);
  eleventyConfig.addFilter("youtubeId", youtubeId);

  // Keeps the videos the site can play, and warns at build time about any other link
  eleventyConfig.addFilter("playableVideos", function (videos = []) {
    return (videos || []).filter((v) => {
      if (!v || !v.link) return true; // empty slots keep their place in the layout
      if (youtubeId(v.link) || vimeoMatch(v.link)) return true;
      console.warn(`[videos] Not a YouTube link, left out of ${this.page && this.page.inputPath}: ${v.link}`);
      return false;
    });
  });

  // Thumbnail: the uploaded one, else YouTube's own (maxres, falling back to hq in the template)
  eleventyConfig.addFilter("videoThumbnail", (video = {}) => {
    if (video.thumbnail) return video.thumbnail;
    const id = youtubeId(video.link);
    return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : "";
  });

  // VideoObject structured data for a list of videos (YouTube only), for case study and project pages
  eleventyConfig.addFilter("videoSchema", (videos = [], fallbackName = "", description = "") =>
    (videos || []).filter((v) => v && youtubeId(v.link)).map((v) => {
      const id = youtubeId(v.link);
      const thumb = v.thumbnail ? (v.thumbnail.startsWith("http") ? v.thumbnail : siteUrl + encodeURI(v.thumbnail)) : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      return {
        "@type": "VideoObject",
        name: v.title || fallbackName,
        description: description || v.title || fallbackName,
        thumbnailUrl: thumb,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        contentUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    })
  );

  // Webflow lightbox data for a video link
  eleventyConfig.addFilter("lightboxJson", (url) => {
    let player = url, width = 940, height = 529, title = "Video";
    const id = youtubeId(url);
    const vm = vimeoMatch(url);
    if (id) {
      // youtube-nocookie: YouTube sets no cookies until the visitor plays the video
      player = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
      title = "YouTube video player";
      if (/youtube\.com\/shorts\//.test(url)) { width = 405; height = 720; } // Shorts are portrait
    } else if (vm) {
      player = `https://player.vimeo.com/video/${vm[1]}${vm[2] ? `?h=${vm[2]}` : ""}`;
      title = "Vimeo video player";
    }
    const html = `<iframe class="embedly-embed" src="${player}" width="${width}" height="${height}" scrolling="no" title="${title}" frameborder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture;" allowfullscreen="true"></iframe>`;
    // Escape "<" so the JSON can sit inside a <script> tag
    return JSON.stringify({ items: [{ url, originalUrl: url, width, height, html, type: "video" }], group: "" }, null, 2).replace(/</g, "\\u003c");
  });

  return {
    dir: { input: "src", output: "_site" },
    htmlTemplateEngine: "njk",
  };
}
