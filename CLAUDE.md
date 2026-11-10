# Made Clear Studios website: notes for Claude

The Made Clear Studios site, moved from Webflow to Netlify.
It is built with [Eleventy](https://www.11ty.dev/). Every push to `main` deploys automatically once the repo is connected to Netlify.

## Working on it

```bash
npm install
npm start        # local preview at http://localhost:8080
npm run build    # production build into _site/
```

## Where things live

| What | File |
| --- | --- |
| Navigation (the Services dropdown lists the Service Categories) | `src/_includes/nav.njk` |
| Footer (email, phone, LinkedIn, company details) | `src/_includes/footer.njk` |
| "Make it clear" enquiry form above the footer | `src/_includes/enquiry-form.njk` |
| Client testimonials slider | `src/_includes/testimonials.njk`, `testimonial-single.njk` (KOL Hub) |
| KOL card | `src/_includes/expert-card.njk` |
| Case study page design (`/case-study/...`) | `src/case-study.njk` |
| Insight page design (`/insights/...`) | `src/insight.njk` |
| Pages | `src/index.njk`, `about.njk`, `services.njk`, `case-studies.njk`, `kol.njk`, `kol-hub.njk`, `insights.njk`, `contact.njk`, `sectors.njk`, `terms-conditions.njk`, `privacy-policy.njk`, `womenasone.njk`, `404.njk` |
| Terms & Conditions and Privacy Policy text (clause numbers are written out, so update cross-references by hand if clauses move) | `src/_includes/legal/terms.njk`, `src/_includes/legal/privacy.njk` |
| Homepage hero blob: a WebGL water drop over the hero copy that magnifies it (`data-blob-mode="lens"`). The script also supports an "under" mode, where the copy sits on top and drifts with the blob | `src/js/fluid-blob.js`, sizing in `src/css/site.css` |
| The hero blob packaged as a standalone Webflow embed (rebuild with `node webflow-export/blob-lens/build.mjs`) | `webflow-export/blob-lens/` |
| KOL Hub surname filter (A–Z letter buttons, one at a time; click the same letter again or "Show all" to show everyone) and sort menu. Surnames come from each expert's `lastName` in `experts.json` | Markup in `src/kol-hub.njk`, behaviour in `src/js/kol-filter.js`, styles in `src/css/site.css` |
| Webflow's site-wide custom CSS embed | `src/_includes/global-styles.njk` |
| Styles | `src/css/made-clear-wip.webflow.css` (Webflow export), `src/css/site.css` (our additions) |
| Images and fonts | `src/images/`, `src/fonts/` |

## CMS content (formerly the Webflow CMS)

Each Webflow collection is a JSON file in `src/_data/`, converted from the CSV exports. Edit the file and push.

| Collection | File | Used on |
| --- | --- | --- |
| Case Studies | `caseStudies.json` | Case Studies list, a page each at `/case-study/<slug>`, KOL Hub, "Further case studies" |
| Insights | `insights.json` | Insights list, a page each at `/insights/<slug>` |
| Clients | `clients.json` | Testimonials sliders, KOL Hub client list |
| Experts | `experts.json` | "In safe hands" slider (Home), KOL list |
| Client Logos | `clientLogos.json` | Home logo sliders (`secondLine: true` puts a logo on the second row) |
| Services, Service Categories | `services.json`, `serviceCategories.json` | Services page, nav dropdown, case study "Services" list |
| FAQs | `faqs.json` | About |
| Sectors | `sectors.json` | Sectors |
| Case Study / Insight Categories | `caseStudyCategories.json`, `insightCategories.json` | Filters (currently hidden) |

- References to other items use the other item's `slug`, e.g. a case study's `"client": "ivascular"` or `"services": ["animation", ...]`.
- `order` sets the position in lists. `draft: true` or `archived: true` keeps an item out of the site.
- Rich text fields (`body`, `body1`–`body4`, `answer`, `description`) are HTML.
- A case study has up to 8 videos (`videoLink1`…`videoLink8`, Vimeo links). Videos 1–2 show under the intro. Videos 3–8 show in the gallery lower down, which becomes a slider with 3 or more. When `video<N>Thumbnail` is empty, the thumbnail is fetched from Vimeo.

To add a case study or insight, copy an existing entry in the JSON file and give it a new `slug`.

## Search engines

- `src/sitemap.njk` builds `/sitemap.xml` from every page plus the published case studies and insights. `src/robots.njk` builds `/robots.txt`. Both use the main address, `https://madeclearstudios.com` (`siteUrl` in `eleventy.config.js`).
- To keep a page out of search and the sitemap, add `noindex: true` to its front matter and a `<meta name="robots" content="noindex">` tag to its head. The Sectors page is hidden like this until its copy is written.
- Every page gets a canonical tag pointing at its `https://madeclearstudios.com` address, added at build time by the `canonical` transform in `eleventy.config.js` (skipped on the 404 page and noindex pages). The main address is the bare domain; `www` redirects to it.
- Redirects live in `src/_redirects` (Netlify format). Add one whenever a page or CMS slug is renamed.

## Service pages and micro case studies

**Service pages** live at `/services/<slug>`, built by `src/service.njk` (body in `src/_includes/service/`). A service gets a page when its entry in `src/_data/services.json` has `"hasPage": true`. The page fields:

- `metaTitle`, `metaDescription`: the search result title and description
- `shortDescription`: the line under the title
- `whyThisMatters` (HTML): the explainer under the hero. Start it with a one-sentence definition; search engines and AI assistants quote that line.
- `outcomesMainTitle`, `outcomesDescription`, `outcomesFirst…Third` `Title`/`Description`: the three outcomes
- `deliverables`: the "What we capture" list
- `process`: the "How it works" steps (`title`, `text`)
- `faqs`: questions and HTML answers. They also go into the page's FAQPage structured data.
- `relatedServices`: slugs of services to link at the bottom
- `gallery`: image URLs (or `{ "src": …, "alt": … }`); `videos`: `{ "link": "<Vimeo link>", "thumbnail": …, "title": … }`
- `hidden`: `true` while the page is being reviewed (see below)

Recent work on a service page lists the micro case studies and full case studies whose `services` include that service's slug.

**Micro case studies** are short project pages for smaller jobs, at `/work/<slug>`, built by `src/micro-case-study.njk` from `src/_data/microCaseStudies.json`. Fields: `title`, `slug`, `client` (a client slug), `clientLabel`, `event`, `year`, `services` (service slugs), `summary`, `body` (HTML), `captured` (list), `coverPhoto`, `gallery`, `videos`, `order`, `hidden`.

**Publishing:** `"hidden": true` keeps a page live at its address for review but out of search (noindex), out of the sitemap and unlinked, with a yellow review banner and placeholders for empty galleries. Set `"hidden": false` to publish it: the banner and placeholders go, it joins the sitemap, gets a canonical tag, and the Services page links to it.

## Contact form

The enquiry form uses **Netlify Forms** (form name `contact`). Submissions appear in the Netlify dashboard under *Forms*.
Set up email notifications there. `src/js/contact-form.js` sends the form and shows the thank-you message.

## Notes from the Webflow move

- The Webflow export doesn't include the case study page's video, image slider and testimonial sections, or the insight body. Their scripts were exported, so these sections were rebuilt in `case-study.njk` and `insight.njk` with the site's own classes. Check them against the Webflow site.
- Left out: the style guide (`design-system`), `womenasoneold`, the password page (`401`), and the empty Webflow detail pages for collections without their own pages. No service has page content yet, so services don't get their own pages.
- CMS images, and some images in page scripts and meta tags, still load from Webflow's CDN (`cdn.prod.website-files.com`). Move them into `src/images/` before the Webflow site is deleted.
- jQuery is now hosted with the site (`src/js/jquery-3.5.1.min.js`), the same file Webflow used. Splide, three.js, GSAP and Finsweet Attributes still load from public CDNs, as they did on Webflow.

## Rules for changes

- Keep the Webflow class names and `data-w-id` / `data-wf-page` attributes. `js/webflow.js` uses them for animations, the mobile menu, dropdowns and lightboxes.
- The page scripts rely on class names and IDs in the markup (`#testimonial-slider`, `.c_client-item`, `.case-study-wrapper`, `.lightbox-video`, `#images-slider`, `.video-gallery`, ...). Keep them when editing lists.
- Empty CMS fields get the `w-dyn-bind-empty` class (hidden), as in Webflow.
- Run `npm run build` before committing, and make sure it passes.
- Commit to `main` with a clear message. Netlify deploys it within about a minute.
