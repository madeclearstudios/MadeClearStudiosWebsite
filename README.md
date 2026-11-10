# Made Clear Studios website

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

## CMS content (edited in Pages CMS)

The content that used to live in the Webflow CMS is in `content/`, one folder per collection and one JSON file per item, named after its slug. Edit it in **[Pages CMS](https://app.pagescms.org)**: saving there commits to GitHub, and Netlify publishes the change within about a minute. The editing forms are defined in `.pages.yml`; uploaded images go to `src/images/uploads/`.

| Collection | Folder | Used on |
| --- | --- | --- |
| Case studies | `content/case-studies/` | Case Studies list, a page each at `/case-study/<slug>`, KOL Hub, "Further case studies" |
| Micro case studies | `content/micro-case-studies/` | Short project pages at `/work/<slug>`, and Recent work on service pages |
| Insights | `content/insights/` | Insights list, a page each at `/insights/<slug>` |
| KOLs | `content/experts/` | Home page slider, KOL Hub |
| Clients | `content/clients/` | Testimonial sliders, KOL page client list |
| Client logos | `content/client-logos/` | Home page logo rows (`secondLine` puts a logo on the second row) |
| Services, service categories | `content/services/`, `content/service-categories/` | Services page, nav dropdown, service pages, case study "Services" list |
| FAQs | `content/faqs/` | About |
| Sectors | `content/sectors/` | Sectors (hidden from search) |
| Case study / insight categories | `content/case-study-categories/`, `content/insight-categories/` | Filters (currently hidden) |

- `src/_data/<name>.js` reads each folder (via `lib/content.js`), so templates still see `caseStudies`, `experts` and so on as lists, sorted by `order`.
- References to other items use the other item's `slug`, e.g. a case study's `"client": "ivascular"`. Pages CMS shows these as dropdowns.
- `order` sets the position in lists. `draft: true` or `archived: true` keeps an item off the site; `hidden: true` (service pages, micro case studies) keeps a page live for review but out of search.
- Rich text fields are HTML.
- A case study's `videos` list holds up to 8 Vimeo videos: the first two show under the intro, the rest in the gallery lower down (a slider with 3 or more). When a video has no thumbnail, it is fetched from Vimeo.
- If you add a field to the content, add it to `.pages.yml` too, so it shows in the editor.

### Setting up Pages CMS

1. Go to [app.pagescms.org](https://app.pagescms.org) and sign in with the GitHub account that owns the repository.
2. Install the Pages CMS GitHub app when asked, and give it access to this repository.
3. Open the repository and the `main` branch. The collections appear in the sidebar.
4. To add editors, use **Collaborators** in Pages CMS and invite them by email. They sign in with a code sent to their inbox; they don't need a GitHub account.

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
- Images that were on Webflow's CDN are moved into `src/images/uploads/webflow/` by the one-off \"Move Webflow images into the site\" GitHub Action (`scripts/migrate-webflow-images.mjs`). Run it before cancelling Webflow.
- jQuery is now hosted with the site (`src/js/jquery-3.5.1.min.js`), the same file Webflow used. Splide, three.js, GSAP and Finsweet Attributes still load from public CDNs, as they did on Webflow.
