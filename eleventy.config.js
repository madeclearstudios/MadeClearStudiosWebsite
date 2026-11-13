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
  eleventyConfig.addGlobalData("siteUrl", siteUrl);

  // Canonical tag on every page: tells search engines the real address is the clean madeclearstudios.com
  // one (not www, the .netlify.app address, or /page.html). Skipped on the 404 page and noindex pages.
  eleventyConfig.addTransform("canonical", function (content) {
    const out = this.page.outputPath;
    if (!out || !out.endsWith(".html") || this.page.url === "/404.html" || /name="robots" content="noindex"/.test(content)) return content;
    const path = this.page.url === "/" ? "/" : this.page.url.replace(/\.html$/, "");
    return content.replace("</head>", `  <link rel="canonical" href="${siteUrl}${path}">\n</head>`);
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
  eleventyConfig.addFilter("where", (items = [], key, value) => items.filter((i) => i[key] === value));
  eleventyConfig.addFilter("whereIn", (items = [], key, values = []) => items.filter((i) => values.includes(i[key])));
  eleventyConfig.addFilter("whereIncludes", (items = [], key, value) => items.filter((i) => (i[key] || []).includes(value)));
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
  // Body of work timeline (Case Studies page): published, non-hidden micro case studies grouped by year, newest
  // first, then by month (the "Month" dropdown in Pages CMS) within each year
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
