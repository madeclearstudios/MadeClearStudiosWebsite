# Made Clear Studios website: notes for Claude

The Made Clear Studios site, moved from Webflow to Netlify.
It is built with [Eleventy](https://www.11ty.dev/). Every merge to `main` deploys automatically; pull requests get a Netlify deploy preview (see *Team workflow* below).

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
| Case study page design (`/case-study/...`): a breadcrumb back to Case Studies, then a centred header (the "Client name", then the highlighted "Project title", both fields in Pages CMS; the full "Client \| Project" title is built from them in `src/_data/caseStudies.js`), then on desktop the cover photo and services stay in place on the left while the featured videos and story scroll past on the right (`.case-page` gives the page wrapper `overflow: clip` so sticky works) | `src/case-study.njk`, styles in `src/css/site.css` |
| Insight page design (`/insights/...`) | `src/insight.njk` |
| Pages | `src/index.njk`, `about.njk`, `services.njk`, `case-studies.njk`, `kol-hub.njk` (the KOL Hub; `kol.njk` is hidden and `/kol` redirects to `/kol-hub`), `insights.njk`, `contact.njk`, `sectors.njk`, `terms-conditions.njk`, `privacy-policy.njk`, `womenasone.njk`, `404.njk` |
| Terms & Conditions and Privacy Policy text (clause numbers are written out, so update cross-references by hand if clauses move) | `src/_includes/legal/terms.njk`, `src/_includes/legal/privacy.njk` |
| Homepage hero blob: a WebGL water drop over the hero copy that magnifies it (`data-blob-mode="lens"`). The script also supports an "under" mode, where the copy sits on top and drifts with the blob. On phones (≤767px) the lens is gentler (`SMALL` in the script: less magnification and rim bending), the drop is a little larger and the copy narrower, so the text stays readable | `src/js/fluid-blob.js`, sizing in `src/css/site.css` |
| The hero blob packaged as a standalone Webflow embed (rebuild with `node webflow-export/blob-lens/build.mjs`) | `webflow-export/blob-lens/` |
| KOL Hub surname filter (A–Z letter buttons, one at a time; click the same letter again or "Show all" to show everyone) and sort menu. Surnames come from each expert's `lastName` in `experts.json` | Markup in `src/kol-hub.njk`, behaviour in `src/js/kol-filter.js`, styles in `src/css/site.css` |
| Webflow's site-wide custom CSS embed | `src/_includes/global-styles.njk` |
| Styles | `src/css/made-clear-wip.webflow.css` (Webflow export), `src/css/site.css` (our additions) |
| Images and fonts | `src/images/`, `src/fonts/` |
| Google Analytics (GA4, `G-F6SX5N28QT`), loaded only after cookie consent | `src/_includes/analytics.njk`, included in every page's `<head>` |
| Cookie consent banner and the footer's "Cookie settings" link | `src/js/consent.js`, styles at the end of `src/css/site.css`; described in clause 5 of the privacy policy |
| Night mode (switch in the nav; choice remembered in `localStorage` as `mc-theme`) | Set before paint by `src/_includes/theme.njk` (in every page's `<head>`), switch markup `src/_includes/night-toggle.njk` (in `nav.njk`), behaviour `src/js/night-mode.js`, colours in the "Night mode" block at the end of `src/css/site.css`. It swaps the colour variables (`--dark`, `--light`, greys, cream); anything with a fixed colour needs its own `html.night-mode` rule there. Text on solid yellow stays black; highlighter strokes and the yellow nav-link underlines are removed |
| Organization structured data (Home, About, Contact) | `src/_includes/schema/organization.njk`; keep it in step with the footer's contact details |

## CMS content (edited in Pages CMS)

The content that used to live in the Webflow CMS is in `content/`, one folder per collection and one JSON file per item, named after its slug. Edit it in **[Pages CMS](https://app.pagescms.org)**: saving there commits to GitHub, and Netlify publishes the change within about a minute. The editing forms are defined in `.pages.yml`; uploaded images go to `src/images/uploads/`.

| Collection | Folder | Used on |
| --- | --- | --- |
| Case studies | `content/case-studies/` | "Featured work" on the Case Studies page, a page each at `/case-study/<slug>`, KOL Hub, "Further case studies" |
| Micro case studies | `content/micro-case-studies/` | Short project pages at `/work/<slug>`, Recent work on service pages, and the "Body of work" timeline on the Case Studies page (grouped by `year`, newest first, then by the `month` dropdown; `workTimeline` filter in `eleventy.config.js`) |
| Insights | `content/insights/` | Insights list, a page each at `/insights/<slug>` |
| KOLs | `content/experts/` | Home page slider, KOL Hub |
| Clients | `content/clients/` | Testimonial sliders, KOL page client list |
| Client logos | `content/client-logos/` | Home page logo rows (`secondLine` puts a logo on the second row) |
| Services, service categories | `content/services/`, `content/service-categories/` | Services page, nav dropdown, service pages, case study "Services" list; each category's `teaser` ("Home page panel text") fills its panel under Our services on Home, which links to `/services#<slug>` |
| FAQs | `content/faqs/` | About |
| Sectors | `content/sectors/` | Sectors (hidden from search) |
| Case study / insight categories | `content/case-study-categories/`, `content/insight-categories/` | Filters (currently hidden) |

- `src/_data/<name>.js` reads each folder (via `lib/content.js`), so templates still see `caseStudies`, `experts` and so on as lists, sorted by `order`.
- References to other items use the other item's `slug`, e.g. a case study's `"client": "ivascular"`. Pages CMS shows these as dropdowns.
- **Order** is set by dragging in **Ordering** in Pages CMS (`content/ordering.json`: one list of slugs per collection). `lib/content.js` sorts each collection by its list; items not in the list yet (e.g. just added) come last, by their old `order` number, then file name. The `order` fields are hidden in the CMS and only used as that fallback. The `sortByOrder` template filter keeps the collection's order.
- The project pipeline was loaded as drafts (Nov 2026): 9 hero case studies and 17 micro case studies with client, title and services filled in, everything else empty. Fill one in and untick Draft (and, for micro case studies, Hidden for review) to publish it.
- `draft: true` or `archived: true` keeps an item off the site; `hidden: true` (service pages, micro case studies) keeps a page live for review but out of search.
- Rich text fields are HTML.
- Videos are **YouTube** links (any form: `youtu.be/…`, `youtube.com/watch?v=…`, `/embed/…`, `/shorts/…`). They play in YouTube's privacy-enhanced mode (`youtube-nocookie.com`), Shorts in a portrait player. With no uploaded thumbnail, YouTube's own is used. A few older Vimeo links still play until they're replaced; any other link is left out, with a warning in the build log (`playableVideos` filter in `eleventy.config.js`).
- A case study's `videos` list holds up to 8 videos: the first two show under the intro, the rest in the gallery lower down (a slider with 3 or more).
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
- `deliverables`: the "What we capture" list. No longer shown on the page (removed to keep service pages short) and hidden in Pages CMS; the data is kept
- `process`: the "How it works" steps (`title`, `text`)
- `faqs`: questions and HTML answers. They also go into the page's FAQPage structured data.
- `relatedServices`: slugs of services to link at the bottom
- `gallery`: image URLs (or `{ "src": …, "alt": … }`); `videos`: `{ "link": "<YouTube link>", "thumbnail": …, "title": … }`
- `hidden`: `true` while the page is being reviewed (see below)

Recent work on a service page lists the micro case studies and full case studies whose `services` include that service's slug.

**Micro case studies** are short project pages for smaller jobs, at `/work/<slug>`, built by `src/micro-case-study.njk` from `src/_data/microCaseStudies.json`. On desktop the intro (event, title, summary, client, event, service) stays in place in the left column while the write-up scrolls up past it; the gallery and videos follow at full width (`src/_includes/service/micro.njk`; the page wrapper uses `overflow: clip` via `.micro-page` so `position: sticky` works). Fields: `title`, `slug`, `client` (a client slug), `clientLabel`, `event`, `year`, `services` (service slugs), `summary`, `body` (HTML), `captured` (list), `coverPhoto`, `gallery`, `videos`, `order`, `hidden`.

**On the Services page**, a published service page gets an expandable row (`src/_includes/services/service-row.njk`, `src/js/service-expand.js`): the name links to the page and gets the yellow highlighter on hover, and a chevron opens its `shortDescription` with a "Read more" button. Services without a page are just their name.

**Publishing:** `"hidden": true` keeps a page live at its address for review but out of search (noindex), out of the sitemap and unlinked, with a yellow review banner and placeholders for empty galleries. Set `"hidden": false` to publish it: the banner and placeholders go, it joins the sitemap, gets a canonical tag, and the Services page links to it.

## Contact form

The enquiry form uses **Netlify Forms** (form name `contact`). Submissions appear in the Netlify dashboard under *Forms*.
Set up email notifications there. `src/js/contact-form.js` sends the form, shows the thank-you message and sends the GA4 event `generate_lead` (with `form_name` and `form_location`) when the visitor has accepted cookies. Mark `generate_lead` as a key event in GA to count enquiries as conversions.

## Images

Images are resized at build time by `@11ty/eleventy-img` (set up in `eleventy.config.js`). Every `<img>` pointing at a local file gets WebP copies at 480, 960 and 1600px in `_site/img/`, with `srcset`, `sizes`, `width` and `height` added. Upload images at full quality; there is no need to resize them first. SVGs are left alone. Add `eleventy:ignore` to an `<img>` to skip it (for example when a script changes its `src`). Images set in CSS (`background-image`) are not resized, so save those as WebP at a sensible size.

## Structured data

- Organization: `src/_includes/schema/organization.njk` on Home, About and Contact, with the id `https://madeclearstudios.com/#organization`. Other blocks point at that id.
- FAQPage: About (from the FAQs collection) and each service page (from its `faqs`), built with the `faqSchema` filter.
- Service and BreadcrumbList: service pages; CreativeWork: micro case studies.
- Page titles end in `| Made Clear` and every indexed page has its own meta description (about 155 characters at most). Case study, insight and micro case study descriptions come from their overview or summary, trimmed by the `metaDescription` filter.

## Notes from the Webflow move

- The Webflow export doesn't include the case study page's video, image slider and testimonial sections, or the insight body. Their scripts were exported, so these sections were rebuilt in `case-study.njk` and `insight.njk` with the site's own classes. Check them against the Webflow site.
- Left out: the style guide (`design-system`), `womenasoneold`, the password page (`401`), and the empty Webflow detail pages for collections without their own pages. No service has page content yet, so services don't get their own pages.
- Images that were on Webflow's CDN are moved into `src/images/uploads/webflow/` by the one-off \"Move Webflow images into the site\" GitHub Action (`scripts/migrate-webflow-images.mjs`). Run it before cancelling Webflow.
- jQuery is now hosted with the site (`src/js/jquery-3.5.1.min.js`), the same file Webflow used. Splide, three.js, GSAP and Finsweet Attributes still load from public CDNs, as they did on Webflow.

## Rules for changes

- Keep the Webflow class names and `data-w-id` / `data-wf-page` attributes. `js/webflow.js` uses them for animations, the mobile menu, dropdowns and lightboxes.
- The page scripts rely on class names and IDs in the markup (`#testimonial-slider`, `.c_client-item`, `.case-study-wrapper`, `.lightbox-video`, `#images-slider`, `.video-gallery`, ...). Keep them when editing lists.
- Empty CMS fields get the `w-dyn-bind-empty` class (hidden), as in Webflow.
- Run `npm run build` before committing, and make sure it passes.

## Team workflow: branches, pull requests and deploy previews

The repo lives in the `madeclearstudios` GitHub organisation. `main` is the live site: every push to it deploys to madeclearstudios.com.

- **Never commit or push straight to `main`.** Start a branch from the latest `main` (e.g. `fix/kol-nav-links`, `content/new-case-study`).
- Commit there with clear messages, push the branch and open a **pull request** into `main`. Say what changed and why, and which pages to check.
- Netlify builds a **deploy preview** for every pull request and posts its link on the PR. Check the change on that preview, on desktop and phone.
- **The site owner (GitHub `olly-mcs`) is the only person who decides what goes live.** A pull request is merged (squash merge) only when they say so and the Netlify checks are green. No second reviewer is needed.
- Keep PRs small and about one thing, so they are quick to check.
- Pages CMS edits are the exception: editors save content straight to `main`, as described above.
- Claude follows the same rules: work on a branch, open a PR with a deploy preview, and merge only when the site owner explicitly asks for it (e.g. "merge and push live"), after the Netlify checks pass.
