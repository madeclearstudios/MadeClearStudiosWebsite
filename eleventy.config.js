export default function (eleventyConfig) {
  // Static assets exported from Webflow, copied as-is
  for (const dir of ["css", "js", "images", "fonts"]) {
    eleventyConfig.addPassthroughCopy(`src/${dir}`);
  }
  eleventyConfig.addPassthroughCopy("src/_redirects");

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
  eleventyConfig.addFilter("sortByOrder", (items = []) => [...items].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));

  // Webflow lightbox data for a Vimeo link, e.g. https://vimeo.com/882463366/148615107a?share=copy
  eleventyConfig.addFilter("lightboxJson", (url) => {
    const m = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/);
    const player = m ? `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ""}` : url;
    const html = `<iframe class="embedly-embed" src="${player}" width="940" height="529" scrolling="no" title="Vimeo embed" frameborder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture;" allowfullscreen="true"></iframe>`;
    // Escape "<" so the JSON can sit inside a <script> tag
    return JSON.stringify({ items: [{ url, originalUrl: url, width: 940, height: 529, html, type: "video" }], group: "" }, null, 2).replace(/</g, "\\u003c");
  });

  return {
    dir: { input: "src", output: "_site" },
    htmlTemplateEngine: "njk",
  };
}
