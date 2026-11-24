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
| Navigation: a yellow MENU button (left; square, with a 2px black outline and a hard black shadow that shifts on hover, white outline and shadow on the black menu panel and in night mode, "New look, site-wide parts" in `site.css`), the logo (centre) and the night mode switch (right). MENU drops down a black full-screen panel with its own Close button in the same place, in the same style: the pages on the left in the page-title style, white, turning yellow on hover (Services lists the Service Categories under it; an indented tree on phones and tablets), and our email (bold), address, phone, a Contact us button and LinkedIn on the right. Escape or a link closes it | `src/_includes/nav.njk`, behaviour `src/js/site-menu.js`, styles in the "Menu" block of `src/css/site.css` |
| "Your content partner" banner above the footer on every page: black, with a yellow eyebrow chip and accents, the title in Borna (sentence case, "medtech" on a yellow block), the intro in Clearface, stat cards with a yellow left rule ("New look, site-wide parts" in `site.css`); headline, intro, a checklist of what we do (each linking to its service page) and a Contact us button (to /contact; the brain booking page is not linked for now), beside four stat cards. Every claim is checkable on the site: the KOL and client counts are worked out from the CMS (rounded down to 10s and 5s), 6 congresses, and a card with a yellow heart icon (deep roots in cardiology, trusted by big names in healthcare and medtech marketing). Keep it that way: no unverifiable numbers | `src/_includes/partner-banner.njk` (included at the top of `footer.njk`), "Partner banner" styles in `src/css/site.css` |
| Footer: email and phone, link columns (Case studies: every published one; Services: those with a published page; Insights: the latest 4 by Published on; Made Clear: core pages), company details; the YouTube and LinkedIn icons and the Rx Club award sit in the left column under the email and phone. Each column shows 6 links; a longer one gets a centred chevron that expands it (`src/js/footer-links.js`; without JS every link shows) | `src/_includes/footer.njk`, "Footer links" styles in `src/css/site.css` |
| "Make it clear" enquiry form above the footer | `src/_includes/enquiry-form.njk` |
| Client testimonials slider. Every testimonial (the sliders, the KOL Hub quote and case study quotes) is styled as on Home: Clearface Bold Italic, left-aligned, with a yellow rule, the name and role underneath on the left ("Testimonials" in "New look, site-wide parts", `site.css`) | `src/_includes/testimonials.njk`, `testimonial-single.njk` (KOL Hub) |
| KOL card | `src/_includes/expert-card.njk` |
| Case study page design (`/case-study/...`), in the new look shared with micro case studies (`src/css/case-look.css`, loaded only on those pages, service pages and the home page via the `case-look` wrapper class; Home adds `home-look` for its own rules: a wider one-line headline, sentence-case section headings with a yellow word, outlined service panels with black number badges, Clearface testimonial quotes and outlined KOL cards; Borna headings in sentence case on yellow highlight blocks, Clearface Std Bold for intros (licensed Bold/Heavy/Black only, `src/fonts/`), framed photos with hard shadows, outlined buttons, the client logo above the title with the client name kept in the `h1` for search but visually hidden; its night mode block keeps text on yellow black): a top bar with the breadcrumb back to Case Studies on the left and the previous / next arrows on the right, then on desktop the header (the "Client name", then the highlighted "Project title", both fields in Pages CMS, then the overview; the full "Client \| Project" title is built from them in `src/_data/caseStudies.js`), cover photo and services stay in place, left-aligned, in the left third while one row of up to three photos (the first three from the `imageSlider` field, labelled Gallery in Pages CMS) and the story scroll past in the right two thirds, then the full gallery as a scrolling strip, the testimonial and all the videos, two to a row. Case studies, micro case studies and service pages share the same columns (4 and 8 of 12) (`.case-page` gives the page wrapper `overflow: clip` so sticky works) . The previous / next arrows (under the breadcrumb on phones; the left and right arrow keys work too) step through the published case studies in their Ordering order, wrapping round, and once they scroll away a compact copy stays on screen (in the side margins on desktop, the bottom corners on phones), with a slide between pages (a cross-page view transition). Photos, videos and copy fade and rise in as they scroll into view (skipped for reduced motion) | `src/case-study.njk`, `src/js/case-study-nav.js`, styles in `src/css/site.css` |
| About page: on desktop the "About" and "Our philosophy" titles stay in place while their copy scrolls past (`.about-title`; `.about-page` gives the page wrapper `overflow: clip`); the FAQ sits in a grey band, each question an outlined card with a hard shadow and a yellow +/- box, as on service pages and the medical device marketing agency page (the FAQ block in "New look, site-wide parts" in `site.css`; `.bg-brand` is only used for FAQ bands). The water bubbles were removed | `src/about.njk`, styles in `src/css/site.css` |
| Insight page design (`/insights/...`): a breadcrumb back to Insights (with BreadcrumbList structured data), then the header: the date (`publishedOn`), author, title and overview on the left with the cover photo beside them in the right half (stacked, photo last, below 992px; "Insight header" styles in `site.css`), BlogPosting structured data, and "More insights" cards linking the other articles before the enquiry form | `src/insight.njk` |
| Medical device marketing agency page (`/medical-device-marketing-agency`): indexed, not in the main menu, linked from the Home "Our services" intro, the About page, the Case Studies intro, the Services intro and `/llms.txt` (not the footer, at the site owner's request). For buyers comparing agencies; targets "medical device marketing agency", "medtech marketing agency UK" and similar, so the home page keeps the brand. Hero, client logos (Client logos collection), what we do (four boxes linking to service pages), how we work, three case studies, why Made Clear (KOL count from the CMS), FAQs (`src/_data/mdmaFaqs.js`, also FAQPage data), Service and BreadcrumbList data. Every claim must stay checkable on the site | `src/medical-device-marketing-agency.njk`, "MDMA page" styles in `src/css/site.css` |
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
| Night mode (switch in the nav; choice remembered in `localStorage` as `mc-theme`) | Set before paint by `src/_includes/theme.njk` (in every page's `<head>`), switch markup `src/_includes/night-toggle.njk` (on the right of the nav bar), behaviour `src/js/night-mode.js`, colours in the "Night mode" block at the end of `src/css/site.css`. It swaps the colour variables (`--dark`, `--light`, greys, cream); anything with a fixed colour needs its own `html.night-mode` rule there. Text on solid yellow stays black; highlighter strokes and the yellow nav-link underlines are removed |
| Organization structured data (every page, via `schema/site.njk`): description, address, areas served (United Kingdom, Europe, United States), `sameAs` profiles (LinkedIn, YouTube) and `knowsAbout` topics | `src/_includes/schema/organization.njk`; keep it in step with the footer's contact details and social links |

## CMS content (edited in Pages CMS)

The content that used to live in the Webflow CMS is in `content/`, one folder per collection and one JSON file per item, named after its slug. Edit it in **[Pages CMS](https://app.pagescms.org)**: saving there commits to GitHub, and Netlify publishes the change within about a minute. The editing forms are defined in `.pages.yml`; uploaded images go to `src/images/uploads/`.

| Collection | Folder | Used on |
| --- | --- | --- |
| Case studies | `content/case-studies/` | "Our work" rail on Home (every published case study, in Ordering order, as bold cards that drag or swipe sideways, with yellow previous / next arrows and a See all case studies button; `work-rail.njk` with `railHideYear` and `railArrows`), "Featured work" on the Case Studies page (each row: the client's logo from Clients, the title, cover photo, overview and the service lines as tags linking to each service page; the title link covers the row; each row is a bold panel, a 2px outline with a hard shadow that lifts and turns yellow on hover, with square 2px service tags; `featured-row` styles in `site.css`), a page each at `/case-study/<slug>`, Recent work on service pages (after the micro case studies, with no date), KOL Hub, "Further case studies" |
| Micro case studies | `content/micro-case-studies/` | Short project pages at `/work/<slug>`, Recent work on service pages, and the "Body of work" rail on the Case Studies page (newest first by `year`, then the `month` dropdown; `newestFirst` filter in `eleventy.config.js`) |
| Insights | `content/insights/` | Insights list (each row a bold panel, like Featured work: `.panel-row` in `site.css`), a page each at `/insights/<slug>` (its More insights cards are `.work-tile` panels) |
| KOLs | `content/experts/` | Home page slider, KOL Hub |
| Clients | `content/clients/` | Testimonial sliders, KOL page client list |
| Client logos | `content/client-logos/` | Home page logo rows (`secondLine` puts a logo on the second row) |
| Services, service categories | `content/services/`, `content/service-categories/` | Services page, nav dropdown, service pages, case study "Services" list; each category's `teaser` ("Home page panel text") fills its panel under Our services on Home (square bordered boxes, text centred top to bottom, that turn yellow on hover, like How it works on service pages; four in a row on desktop, two on tablets, stacked on phones; no button, the whole box links to `/services#<slug>`). The section has no top padding and the showreel gap is one section gap plus 2rem (`.home-showreel-gap`), so the block sits centred between the logo rows and the showreel |
| FAQs | `content/faqs/` | About |
| Sectors | `content/sectors/` | Sectors (hidden from search) |
| Case study / insight categories | `content/case-study-categories/`, `content/insight-categories/` | Filters (currently hidden) |

- `src/_data/<name>.js` reads each folder (via `lib/content.js`), so templates still see `caseStudies`, `experts` and so on as lists, sorted by `order`.
- References to other items use the other item's `slug`, e.g. a case study's `"client": "ivascular"`. Pages CMS shows these as dropdowns.
- **Order** is set by dragging in **Ordering** in Pages CMS (`content/ordering.json`: one list of slugs per collection). `lib/content.js` sorts each collection by its list; items not in the list yet (e.g. just added) come last, by their old `order` number, then file name. The `order` fields are hidden in the CMS and only used as that fallback. The `sortByOrder` template filter keeps the collection's order.
- The project pipeline was loaded as drafts (Nov 2026): 9 hero case studies and 17 micro case studies with client, title and services filled in, everything else empty. Fill one in and untick Draft (and, for micro case studies, Hidden for review) to publish it.
- Draft insights are built only on Netlify deploy previews (`CONTEXT=deploy-preview`), at their normal address with a "Draft preview" banner and noindex, unlisted, so they can be read before publishing; the live site never builds them (`src/insight.njk`). Five SEO articles were drafted this way (Nov 2026): what-is-kol-marketing, how-to-engage-key-opinion-leaders, how-much-does-medical-animation-cost (cost drivers only, no prices), how-to-communicate-clinical-trial-results-to-physicians, how-to-make-a-medical-device-video. To publish one, untick Draft and set Published on.
- `draft: true` or `archived: true` keeps an item off the site; `hidden: true` (service pages, micro case studies) keeps a page live for review but out of search.
- Rich text fields are HTML.
- Videos are **YouTube** links (any form: `youtu.be/…`, `youtube.com/watch?v=…`, `/embed/…`, `/shorts/…`). They play in YouTube's privacy-enhanced mode (`youtube-nocookie.com`), Shorts in a portrait player. With no uploaded thumbnail, YouTube's own is used. A few older Vimeo links still play until they're replaced; any other link is left out, with a warning in the build log (`playableVideos` filter in `eleventy.config.js`).
- A case study's `videos` list holds up to 8 videos, shown two to a row below the story (one video runs full width).
- Hero case studies show no date anywhere on the site (Nov 2026); their `year` and `month` are kept in the content but only micro case studies show dates.
- Case studies list only the 15 main service lines in `services` (folded services were replaced by their main service, Nov 2026).
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
- Each sitemap entry has a `<lastmod>`: the date of the last commit that changed the page's file (`lastModified` filter in `eleventy.config.js`). Pages with no address (`permalink: false`) and the 404 page are left out.
- `/llms.txt` (`src/llms.njk`) is a plain-text summary of the site for AI assistants and answer engines: who we are, every service (linked where it has a page), case studies, projects, insights and key pages, built from the CMS data.
- Structured data on every page: `src/_includes/schema/site.njk` (Organization from `schema/organization.njk`, plus WebSite), included next to `analytics.njk` in each page's `<head>`. Keep the Organization `knowsAbout` list in step with the search terms we target.
- Share images: case studies, micro case studies, insights and service pages get a 1200×630 JPEG made from their cover photo, cropped around its point of interest (`src/_data/ogImages.js`, written to `_site/og/`), because LinkedIn and Facebook don't show AVIF or WebP. A service page uses its first gallery photo, or the cover of its first project.
- Headings: each page has one `h1`. The "Make it clear" enquiry form's title is styled like a heading but is plain text, except on Contact, where it is the page's `h1` (`formHeadingTag`).

## Service pages and micro case studies

**Service pages** live at `/services/<slug>`, built by `src/service.njk` (body in `src/_includes/service/`). They use the same new look as case studies (`case-look.css`, "Service pages" block): a yellow chip above the title with the service's category, framed gallery photos, How it works boxes with black number badges, outlined Related services rows, and the FAQ as outlined plus/minus boxes. Layout: a breadcrumb, then on desktop the title, `shortDescription` and a Contact us button stay in place in the left third while the `gallery`, `whyThisMatters` and How it works (a 2×2 grid; each box turns yellow on hover) scroll past in the right two thirds. "What you leave with" is folded into How it works: the three outcome titles are a ticked "You leave with:" list under the last step (or under the explainer if a page has no steps) (`.service-page` gives the page wrapper `overflow: clip` so sticky works); then Recent work, the FAQ (heading inside the yellow box) and Related services. A service gets a page when its entry in `src/_data/services.json` has `"hasPage": true`. The page fields:

- `metaTitle`, `metaDescription`: the search result title and description
- `shortDescription`: the line under the title
- `whyThisMatters` (HTML): the explainer under the hero. Start it with a one-sentence definition; search engines and AI assistants quote that line.
- `outcomesFirst…Third` `Title`: the three outcomes, shown as the ticked list under the last How it works step. `outcomesMainTitle`, `outcomesDescription` and the outcome descriptions are no longer shown (the data is kept)
- `deliverables`: the "What we capture" list. No longer shown on the page (removed to keep service pages short) and hidden in Pages CMS; the data is kept
- `process`: the "How it works" steps (`title`, `text`)
- `faqs`: questions and HTML answers. They also go into the page's FAQPage structured data.
- `recentWorkIntro`: the line under the Recent work heading (default "Projects we have delivered with this service.")
- `relatedServices`: slugs of services to link at the bottom
- `gallery`: image URLs (or `{ "src": …, "alt": … }`). Leave empty and the page fills it automatically with up to three photos from the projects in Recent work: each one's hero (cover) image first, then their other photos if there are fewer than three projects (`workGallery` filter in `eleventy.config.js`); `videos`: `{ "link": "<YouTube link>", "thumbnail": …, "title": … }`
- `hidden`: `true` while the page is being reviewed (see below)

**Service structure (Nov 2026):** 15 main services, each meant to get its own page; the other services are folded into one of them with `partOf` (the "Part of" field in Pages CMS):
- Strategy: Content and channel strategy (`content-and-channel-strategy`; includes channel strategy, marketing strategy, audience insight), Campaign strategy (narrative development, messaging frameworks, team workshops), Brand strategy and identity (`brand-strategy`; brand architecture, naming, brand identity design, design and visual systems)
- Creative: Campaign creative and concepts, Congress and event creative (stand and booth design and build; separate from filming)
- Production: On-site congress and event production, VR experiences (VR and immersive experiences), Animation & Illustration (3D model development, medical illustration and infographics), Medical film and documentary (`medical-film-and-documentary`; film and video content), Live cases, Live webinars and broadcasts (`live-webinars`), KOL content, Web and interactive content (AI-assisted production)
- Distribution: Distribution strategy and channel planning, Platform distribution and performance (`platform-distribution-and-performance`; performance tracking)

A folded service isn't listed on the Services page or in `/llms.txt` on its own (the main service's entry names it); projects tagged with it count towards the main service's Recent work and gallery (`serviceFamily`, `whereIncludesAny` filters); and lists of a project's services show the main service (`toMainServices`). Every main service's `shortDescription` is the summary behind its chevron on the Services page, written keyword-rich and naming the services folded into it; the name links, and a "Read more" button shows, only once its page is published.

Pages so far: all 14 written pages are published (Nov 2026): On-site congress and event production, VR experiences, Animation & Illustration, Medical film and documentary, Live webinars and broadcasts, Campaign strategy, Campaign creative and concepts, KOL content, Distribution strategy and channel planning, Congress and event creative, Live cases, Content and channel strategy, Web and interactive content, Platform distribution and performance. Their `metaTitle` and `metaDescription` target the search phrases agreed with the site owner (e.g. "medical device video production", "mechanism of action animation", "KOL video", "medical device sales enablement"); keep those phrases when editing. Still to write: Brand strategy and identity. When using SoWs, never publish fees, rates or contact details, and don't name clients, products, trials, patients or suppliers that aren't already public on the site; describe the work instead. Which SoWs may be used, on which service pages, and which become micro case studies is decided by the site owner in the SoW review board (a private claude.ai artifact: https://claude.ai/artifact/H8AFDqc33c2y5Y2iUqWwd6); only use approved ones. Nov 2026: 7 approved (CALC Agency stand and EuroPCR 2026 content for Shockwave, HCA SACT parts 1 and 2, Why HCA production, Women As One RISE 2026, the Rampart sales tool); the rest were struck. Micro case studies drafted from them (`draft: true`, `hidden: true`): shockwave-calc-agency-europcr-2026, shockwave-medical-europcr-2026, hca-sact-patient-education, hca-why-hca-content-series, women-as-one-at-esc, rampart-radiation-room-sales-tool.

Recent work on a service page lists the micro case studies and full case studies whose `services` include that service's slug, the micro case studies newest first by `year` and `month`, then the case studies in their Ordering order (`workRailMix` filter; case study cards say "Case study" with no date), in a work rail (`src/_includes/work-rail.njk`, `src/js/work-rail.js`, "Work rail" styles in `site.css`; also used for Body of work on the Case Studies page): one continuous row of cards, newest first, running off the right edge of the screen (about two and a half cards in view) so it can be dragged or swiped, with the year on the left following the cards in view ("Case study" over the case study cards). When the row spans more than one year, the script adds space after the last card so it can be dragged right up to the left edge, which brings up the oldest year at the end of the row. Each card has a photo, date, title, summary, and a "Find out more" link that gets the yellow highlighter on hover (as service names do on the Services page). The client name is left out, as the title already says it. Further Case Studies at the bottom of case study pages use the same cards (`.work-tile`). Every `.work-tile` card, on any page, is a bold panel: a 2px outline with a hard shadow that lifts on hover ("New look, site-wide parts" in `site.css`; it uses `--dark` / `--light`, so night mode swaps it).

**Micro case studies** are short project pages for smaller jobs, at `/work/<slug>`, in the same new look as case studies (`case-look.css`, client logo above the title), built by `src/micro-case-study.njk` from `src/_data/microCaseStudies.json`. On desktop the intro (date, title, summary, client, date, service) stays in place in the left column; the right column has the photo gallery (no heading) then the write-up, scrolling past it; the videos follow at full width (the shared `service/media.njk` skips its gallery here via `skipGallery`) (`src/_includes/service/micro.njk`; the page wrapper uses `overflow: clip` via `.micro-page` so `position: sticky` works). Fields: `title`, `slug`, `client` (a client slug), `clientLabel`, `month`, `year` (shown as the date; there is no event field, as not every project is at an event), `services` (service slugs), `summary`, `body` (HTML), `captured` (list), `coverPhoto`, `gallery`, `videos`, `order`, `hidden`.

The services listed on case studies and micro case studies link to the service page, or to their category's section of `/services` when the service has no page yet.

**On the Services page**, each main service is an expandable row (`src/_includes/services/service-row.njk`, `src/js/service-expand.js`): a chevron opens its `shortDescription`, and every name gets the yellow highlighter on hover and while its summary is open. Once its page is published, the name also links to the page and the summary gets a "Read more" button.

**Publishing:** `"hidden": true` keeps a page live at its address for review but out of search (noindex), out of the sitemap and unlinked, with a yellow review banner and placeholders for empty galleries. Set `"hidden": false` to publish it: the banner and placeholders go, it joins the sitemap, gets a canonical tag, and the Services page links to it.

## Contact form

The enquiry form uses **Netlify Forms** (form name `contact`). Submissions appear in the Netlify dashboard under *Forms*.
Set up email notifications there. `src/js/contact-form.js` sends the form, shows the thank-you message and sends the GA4 event `generate_lead` (with `form_name` and `form_location`) when the visitor has accepted cookies. Mark `generate_lead` as a key event in GA to count enquiries as conversions.

## Images

Images are resized at build time by `@11ty/eleventy-img` (set up in `eleventy.config.js`). Every `<img>` pointing at a local file gets WebP copies at 480, 960 and 1600px in `_site/img/`, with `srcset`, `sizes`, `width` and `height` added. Upload images at full quality; there is no need to resize them first. SVGs are left alone. Add `eleventy:ignore` to an `<img>` to skip it (for example when a script changes its `src`). Images set in CSS (`background-image`) are not resized, so save those as WebP at a sensible size.

**Smart cropping:** the top galleries on case studies, micro case studies and service pages crop each photo to 4:3. The build checks every photo for faces and points of interest (`lib/focal-point.js`, using sharp's attention detection) and sets where the crop sits (`object-position`), keeping the subject in the middle and leaving headroom; on tall photos it never goes below the top third, so heads stay in. Results are in `src/_data/imageFocus.js`, cached in `.cache/`, so only new photos are checked. To set a crop by hand, give the photo as `{ "src": "/images/…", "focus": "50% 20%" }` in the content JSON.

## Structured data

- Organization and WebSite: `src/_includes/schema/site.njk` on every page, with the id `https://madeclearstudios.com/#organization`. Other blocks point at that id.
- FAQPage: About (from the FAQs collection) and each service page (from its `faqs`), built with the `faqSchema` filter.
- Service and BreadcrumbList: service pages; CreativeWork: micro case studies and case studies.
- Page titles end in `| Made Clear` and every indexed page has its own meta description (about 155 characters at most). Case study, insight and micro case study descriptions come from their overview or summary, trimmed by the `metaDescription` filter.
- Search titles are kept to about 62 characters so Google doesn't cut them short: the `fitTitle` filter (`eleventy.config.js`) takes the first of several candidates that fits. Case studies try "<Project title>: <Client> <kind of work> | Made Clear" (e.g. "HTN:RDN: Medtronic medical awareness campaign | Made Clear"), then without "| Made Clear", then "<Project> | <Client> | Made Clear", and so on; the kind of work comes from the case study's services (`projectType` filter). Insights, micro case studies and service pages drop " | Made Clear" when the title would be too long. Social share titles keep the full version. Their descriptions are the overview, plus a short generated sentence when the overview is under 110 characters (`seoDescription` filter); the page text is unchanged.
- CreativeWork on case studies: the project, the kind of work, its services as keywords, the client as sponsor, made by us, with a VideoObject for each YouTube video (`videoSchema` filter).
- Photos on case studies, micro case studies and service pages get alt text automatically when the content has none: "<project> for <client>, photo 3" in galleries, the project title on cards.

## Notes from the Webflow move

- The Webflow export doesn't include the case study page's video, image slider and testimonial sections, or the insight body. Their scripts were exported, so these sections were rebuilt in `case-study.njk` and `insight.njk` with the site's own classes. Check them against the Webflow site.
- Left out: the style guide (`design-system`), `womenasoneold`, the password page (`401`), and the empty Webflow detail pages for collections without their own pages. No service has page content yet, so services don't get their own pages.
- Images that were on Webflow's CDN are moved into `src/images/uploads/webflow/` by the one-off \"Move Webflow images into the site\" GitHub Action (`scripts/migrate-webflow-images.mjs`). Run it before cancelling Webflow.
- jQuery is now hosted with the site (`src/js/jquery-3.5.1.min.js`), the same file Webflow used. Splide, three.js, GSAP and Finsweet Attributes still load from public CDNs, as they did on Webflow.
- three.js (about 600KB) only loads on pages with water-bubble canvases (KOL Hub, the hidden KOL page, Women As One). The home page drop (`js/fluid-blob.js`) is plain WebGL and doesn't need it; Home loads three.js only for the `?blob=classic` test version. If you add bubbles to a page, add the three.js script tag there too.
- The cookie banner (`js/consent.js`, loaded without `defer` from `analytics.njk`) is added as soon as `<body>` exists, so it appears with the first frame instead of becoming a late Largest Contentful Paint. The hero placeholder image on Home loads eagerly with high priority, as it is the largest element on phones.

## Rules for changes

- Keep the Webflow class names and `data-w-id` / `data-wf-page` attributes. `js/webflow.js` uses them for animations, the mobile menu, dropdowns and lightboxes.
- The page scripts rely on class names and IDs in the markup (`#testimonial-slider`, `.c_client-item`, `.case-study-wrapper`, `.lightbox-video`, `#images-slider`, `.video-gallery`, ...). Keep them when editing lists.
- Empty CMS fields get the `w-dyn-bind-empty` class (hidden), as in Webflow.
- Run `npm run build` before committing, and make sure it passes.
- **Type scale:** use the existing heading levels rather than new sizes, so text stays consistent across pages (the full list is in the "Type scale" block at the end of `src/css/site.css`):
  1. Page title: `h1`, 20px bold capitals. Service, case study and micro case study titles use it too.
  2. Section heading: `h2`, 18px bold capitals.
  3. Item title: `h3`, 16px bold. Used for card, step, outcome and FAQ titles.
  4. Small heading: `h4` / `.h4`, 14px bold.
  5. Lead: 18px regular, for the opening paragraph only.
  6. Body: `p`, 14px regular.
  7. Small: `.text-size-xsmall font-600 text-color-grey-4`, 12px, for dates, numbers and eyebrows.
  Buttons and the navigation keep their own styles.

## Team workflow: branches, pull requests and deploy previews

The repo lives in the `madeclearstudios` GitHub organisation. `main` is the live site: every push to it deploys to madeclearstudios.com.

- **Never commit or push straight to `main`.** Start a branch from the latest `main` (e.g. `fix/kol-nav-links`, `content/new-case-study`).
- Commit there with clear messages, push the branch and open a **pull request** into `main`. Say what changed and why, and which pages to check.
- Netlify builds a **deploy preview** for every pull request and posts its link on the PR. Check the change on that preview, on desktop and phone.
- **The site owner (GitHub `olly-mcs`) decides what goes live**, except for Lizzie's pull requests (below). Other pull requests are merged (squash merge) only when they say so and the Netlify checks are green. No second reviewer is needed.
- Keep PRs small and about one thing, so they are quick to check.
- Pages CMS edits are the exception: editors save content straight to `main`, as described above.
- **Lizzie (GitHub `LizzieMCS`) is the other exception (Olly, Nov 2026):** her pull requests merge themselves without the site owner's review. When Netlify reports her deploy preview as successful, `.github/workflows/auto-merge-lizzie.yml` squash-merges the pull request, which deploys it. It only acts on open pull requests into `main` that she opened from a branch in this repo; a failed preview never merges. To stop it, delete that workflow file (or change `AUTHOR` in it).
- Claude follows the same rules: work on a branch, open a PR with a deploy preview, and merge only when the site owner explicitly asks for it (e.g. "merge and push live"), after the Netlify checks pass.
