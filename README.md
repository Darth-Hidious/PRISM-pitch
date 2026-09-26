# PRISM — website and investor briefing

`mirdyne.com`: what PRISM is, how it works and where it stands. It replaces `prism.mirdyne.com`.

The old addresses redirect here (`redirects` in `vercel.json`): `prism.mirdyne.com`,
and `prism.marc27.com` through it, to the same page on `www.mirdyne.com`, except
`/api/`, so the form and the daily clean-up keep working there; `mirdyne.eu` and
`www.mirdyne.eu` to the home page.

| Path | What | Source |
| --- | --- | --- |
| `/` | Home: the problem PRISM solves, why Europe, the loop, links to the other pages | `src/site/pages/home.tsx` |
| `/platform/` | The five stacks, taken apart as you scroll (`/platform/#autonomy` goes to one), and progress | `src/site/pages/platform.tsx` |
| `/method/` | Four live demos of the method (`/method/#al` opens one), open research, and Proof, built in (`#proof`): a live map of who sees what, a real lineage (NIST's CAMEO), what a part gives away | `src/site/pages/method.tsx` |
| `/company/` | Mirdyne and Bimo Tech, the founders, working with us | `src/site/pages/company.tsx` |
| `/news/` | News, with the photographs | `src/site/pages/news.tsx` |
| `/interest/` | Register interest: our own form (`/interest/?topic=investment` starts with a topic chosen) | `src/site/pages/interest.tsx`, `api/interest.ts` |
| `/contact/` | Every way to reach us: email, the form by topic, the investor room, post. `/about` redirects to `/company/` | `src/site/ContactDetails.tsx` |
| `/impressum/`, `/privacy/` | Legal notice and privacy policy, in English and German | `src/site/Legal.tsx`, facts in `src/site/legal.ts` |
| `/de/`, `/de/platform/`, … | Every page above in German, from the same components (see [German](#german)) | `de/**/index.html`, `src/site/i18n-de.ts` |
| any other address | Page not found: `404.html`, status 404 | `src/site/NotFound.tsx`, `api/not-found.ts` |
| `/deck/` | The investor room: 14 slides on a 1440 × 810 stage, scaled to any screen; `/deck/#5` opens slide 5; phones get the slides as one scrolling page | `src/deck/` |

Each page is its own HTML file (`index.html`, `platform/index.html`, …), listed
in `vite.config.ts`; `vercel.json` also serves them without the trailing slash,
and sends the old `/evidence/` address to `/method/#proof`. Files under
`/assets/` are cached for a year: Vite names each one after its content, so a
changed file gets a new name. Files in `public/` keep their names, so they are
not cached that way.

Both are built from the same component library in `src/ds/` and the tokens in
`src/styles/`, which are also published as the PRISM design system.

The **Register interest** button in the bar opens two ways in: the form at
`/interest/` and the investor room (`/deck/`). On phones both are at the foot of
the menu.

## Legal pages

`/impressum/` and `/privacy/` are built from the company facts in
`src/site/legal.ts`: legal name, address, managing directors, phone,
register court and number, VAT ID and the person responsible for content.
Any fact still `null` is marked on both pages, and both carry a Draft
notice until every required fact is in. Do not publish them in that state.
The footer on every page, the form and the deck's bottom bar link to both.
The privacy policy describes exactly what the site does (Vercel hosting,
the form, email through Zoho, no cookies or tracking); change it whenever
that changes.

## Register interest: where submissions go

- `api/interest.ts` (a Vercel Function, run in Frankfurt: `regions` in
  `vercel.json`) checks each submission and saves it as one private JSON file
  in the project's Blob store `prism-interest` (Frankfurt), under
  `interest/<year-month>/`. It keeps what the form asks for and the page the
  visitor came from; no IP address and no cookies.
- **Email:** each submission is also emailed to info@mirdyne.com, sent through
  our own Zoho mailbox (`smtppro.zoho.eu`, port 465). Reply to the email to
  answer the visitor. It needs one setting in Vercel: `SMTP_PASS`, an app
  password for info@mirdyne.com (Zoho → My Account → Security → App
  Passwords). Until it is set, submissions are stored but not emailed. On
  Zoho's free plan use `SMTP_HOST=smtp.zoho.eu`. `SMTP_USER`,
  `INTEREST_MAIL_TO` and `INTEREST_MAIL_FROM` change the sender and recipient.
  If the store fails, the email is sent before the visitor is thanked, so a
  submission is never lost silently.
- **Reading them:** Vercel dashboard → Storage → `prism-interest` → Browser.
- **Spam:** a hidden field that only bots fill in, a two-second minimum, our
  own pages only (`Origin`), 20 kB at most.
- **Retention:** the form says details are deleted after twelve months.
  `api/interest-cleanup.ts` does that for the store once a day (`crons` in
  `vercel.json`, production only), authorised by the `CRON_SECRET`
  environment variable. The emails in the inbox have to be deleted there.
- **QR code for print:** `public/prism-qr.png` (a card, 1890 px square) and
  `public/prism-qr.svg` (the code alone, as a vector) open
  https://www.mirdyne.com/interest/. They replace the Microsoft Forms code;
  printed copies of that one still lead to the old form.
- Locally, `npm run dev` does not run `api/`; the form then shows its error
  message. `vercel dev` runs both.

## For AI agents and other software

Every page reads without JavaScript, and in Markdown:

- **Plain HTML:** the build renders each page with React into its HTML file
  (`scripts/prerender.mjs`, from `src/site/prerender.ts`), minus what needs
  JavaScript or only decorates: drawings become their one-line description,
  the form becomes the email address. In a browser that runs the page's
  script, this copy is hidden from the first paint and removed before React
  draws the page, so visitors see exactly what they saw before.
- **Markdown:** beside each page, `index.html.md` (`/company/index.html.md`),
  as llmstxt.org proposes. A request with `Accept: text/markdown` gets it at
  the page's own address: `middleware.ts` (Vercel Routing Middleware) chooses,
  by the rules of HTTP content negotiation (`server/negotiate.ts`), and marks
  both answers `Vary: Accept`. Browsers always get HTML.
- **Missing addresses:** `404.html` with status 404; clients that ask for
  Markdown get a Markdown 404 from `api/not-found.ts` (the last rewrite in
  `vercel.json`), with links to the site map and `llms.txt`.
- **Structured data:** JSON-LD for the Organization (contact point, postal
  address) and the WebSite on `/`, `/company/` (About) and `/contact/`, built
  from the Impressum's facts in `src/site/legal.ts` by
  `src/site/structured-data.ts`.
- **`llms.txt`** (`public/llms.txt`): what the site covers, when to come to
  Mirdyne, and how agents get the Markdown.

Adding a page means adding it, in both languages, in these places: its HTML
file and its German twin under `de/`, `vite.config.ts`, `src/site/prerender.ts`,
`PAGE_PATHS` in `src/site/i18n.ts`, `MARKDOWN_PAGES` in `server/negotiate.ts`
(with the middleware's `matcher`), and the rewrites in `vercel.json` that serve
it without the trailing slash. The build writes `sitemap.xml` from the list in
`src/site/prerender.ts`. List the page in `public/llms.txt` if agents should
find it. The tests check that these agree.

## German

Every page is also in German, under `/de/` (`/de/company/`), built from the
same components. A page knows its language from `<html lang>`; each German
page has its own HTML file under `de/` with the German title and
descriptions. The switch in the bar and the footer ("DE" / "EN") goes to the
same page in the other language, and every page names both versions in its
`<head>` (`hreflang`) and in the site map. The deck stays in English.

- **Text:** every piece of text on the site goes through `t` (`useT()` from
  `src/site/i18n.ts`), including labels, alt text and what the canvases
  draw. On English pages `t` returns the text as written; on German pages it
  looks it up in `src/site/i18n-de.ts`, keyed by the exact English. Text
  with a link or emphasis inside uses `t.rich` ("Write to `<0>`us`</0>`");
  addresses inside the site use `t.link`, numbers `t.num` (474.311.376).
  The browser loads the German only on German pages.
- **Nothing left in English:** the build renders every German page and stops
  if a text has no German, or if a German page shows a text exactly as its
  English twin does (names and words that are the same in German are kept
  on purpose by mapping them to themselves). The browser test does the same
  after scrolling through each page and opening every tab and menu, and it
  checks the form's messages, including every answer from the server.
- **Changing English text** changes its key: change the key in
  `src/site/i18n-de.ts` too, with the German. The build names any text it
  cannot find.

## Icons and link previews

- **Icons:** the PRISM mark on a navy tile, so it reads on light and dark tab
  bars: `favicon.svg` and `favicon.ico` for browser tabs, `apple-touch-icon.png`
  for iPhone home screens, and the Android icons in `icons/`, listed in
  `site.webmanifest`. `node scripts/make-icons.mjs` draws them all again.
- **Link previews:** what WhatsApp, LinkedIn, Slack and iMessage show when a
  link is shared. Every page names its image and its address on
  `www.mirdyne.com` (`og:` tags and `rel="canonical"`, so search engines count
  every copy of a page as one). The deck has its own picture and stays out of
  search (`noindex`, no canonical). `node scripts/make-previews.mjs` draws the
  pictures again; change the words there.
- `robots.txt` keeps crawlers out of `/api/` and points them at `sitemap.xml`,
  which lists every page except the deck.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/, /platform/, … and /deck/
npm run build      # type-check, build every page into dist/, then the plain HTML and Markdown copies
npm run lint
npm test           # build, then every test in tests/ (npm run test:only skips the build)
node scripts/check-agents.mjs [url]   # check a deployed site as an agent meets it (default www.mirdyne.com)
node scripts/capture-pdf.mjs   # rebuild PRISM-Pitch-Deck.pdf from /deck/ (links point at www.mirdyne.com)
node scripts/build-design-system.mjs <dir>   # bundle src/ds for the design system
```

## How the pieces fit

- **Tokens** (`src/styles/tokens.css`): colours, type families, spacing and
  radii from the Professor Briefing deck. Two themes, `paper` and `navy`; set
  `data-theme` on any section.
- **Components** (`src/ds/`): kicker, button, status and maturity pills, stat,
  process chain, timeline, status table, source line, footer band, and the
  evidence components (rights state, object card, evidence lineage, rights
  manifest, manufacturing window, capability stack).
- **Photographs**: the website and the deck show real photographs as taken,
  cropped but never painted or retouched: DLR engine tests, the materials lab
  at WUST in Wrocław where our alloys are melted (we rent its equipment; it is
  run by the university), our own photos of raw metals, melting and parts, the
  Hessen Ideen award and ESA's mosaic of Europe. The painters in `src/ds/`
  (`LivePainting`, `Painting`) stay in the design system but are used nowhere.
- **Credits and sources**: credits for other people's images are listed once, in
  the Impressum under Picture credits (`/impressum/#credits`, data in
  `src/site/credits-data.ts`), linked from every footer; our own photos need
  none. Adding someone else's picture means adding a line there. Sources for facts and
  "illustrative" notes fold away under a small toggle (`Note` in `ui.tsx`).
- **Brand**: the PRISM mark is `src/ds/PrismMark.tsx` (follows the text colour)
  and `public/brand/prism-logo-light-mode.svg` / `prism-logo-dark-mode.svg`.
- **Website** (`src/site/`): one component per section, composed into pages
  in `src/site/pages/` with the shared shell in `SitePage.tsx`. The web type
  scale, tabs and exhibit styles are in `site.css`. The live pieces
  compute in the browser: the dot field in `Gap.tsx` (one dot per 20,000
  possible alloys, from plain arithmetic), the process map and the Gaussian-process loop in
  `Method.tsx`, the record map in `RecordMap.tsx` and the event cascade in
  `Roadmap.tsx`. Each says on the page what is illustrative.
- **Engraved drawings** (`src/site/engrave.tsx`, styles in
  `src/styles/engrave.css`): the ink-on-paper diagrams. The deck's Proof slide
  plays the website's CAMEO drawings (`src/site/Cameo.tsx`) step by step.
- **Fonts**: Manrope and Geist Mono, self-hosted through Fontsource (no calls
  to Google Fonts).

## Images and their rights

| File | What | Rights |
| --- | --- | --- |
| `spark-furnace.webp` | Project SPARK photograph: vacuum-arc melting, seen through the viewport (the deck and the Register interest page) | Our own photograph |
| `spark-charge.webp`, `spark-hearth-charge*.webp`, `spark-hearth-column*.webp`, `spark-furnace-wide.webp`, `spark-melt.webp`, `spark-button*.webp`, `machining.webp` | Raw metals, the loaded hearth, the arc furnace, an alloy melting, a cast button, machining; cropped only (an equipment label and a reflection cropped out). No element or composition is named anywhere they are used | Our own photographs |
| `lab-arc-melter.webp`, `lab-melt-spinner*.webp` | The arc melter and the melt spinner in the materials science lab at WUST, Wrocław (run by the university; we rent the equipment); cropped only, the arc melter's ignition-current label cropped out | Our own photographs |
| `markets/space.webp` | Aestus engine in ESA's altitude test stand P4.2, DLR Lampoldshausen; cropped square (the DLR signs left out) | DLR, CC BY 3.0 ([source](https://www.dlr.de/de/bilder/2016/4/triebwerkstests-beim-dlr_25044)) |
| `markets/defence.webp` | Afterburner of a Eurojet EJ200 engine, ILA Berlin 2016; cropped square | Julian Herzog, CC BY 4.0 ([source](https://commons.wikimedia.org/wiki/File:Afterburner_Eurojet_EJ200_turbofan_engine_for_Eurofighter_Typhoon_ILA_Berlin_2016_01.jpg)) |
| `markets/fusion.webp` | Carbon wall tiles being fitted in Wendelstein 7-X; cropped square | Christopher Roux, EUROfusion, CC BY 4.0 ([source](https://commons.wikimedia.org/wiki/File:W7-X_tile_installation.jpg)) |
| `markets/supply.webp` | Tungsten rods with grown crystals; cropped square | Alchemist-hp (pse-mendelejew.de), Free Art License 1.3 ([source](https://commons.wikimedia.org/wiki/File:Wolfram_evaporated_crystals_and_1cm3_cube.jpg)); the crop is under the same licence |
| `markets/pfas.webp` | PTFE lab parts: a moulding block and two rolls of tape; cropped square | Public domain, Cjp24 ([source](https://commons.wikimedia.org/wiki/File:Teflon_items.jpg)) |
| `markets/tech.webp` | A 300 mm test wafer under magnification; cropped square | CC0, ISCIX-Ex ([source](https://commons.wikimedia.org/wiki/File:Wafer300mm-LargeIC-testset.jpg)) |
| `partners/*` | The PRISM Alpha consortium's logos: ESA, Bimo Tech, ArianeGroup, Fraunhofer IAPT, amsight, each from its own website, shown in one colour (Fraunhofer's mark as its one-colour version) | The partners' trademarks, shown as members of PRISM Alpha |
| `esa-europe-1280.webp` | Envisat MERIS true-colour mosaic of Europe, resized; shown only where WebGL 2 is unavailable, in place of the globe | ESA, CC BY-SA 3.0 IGO ([source](https://www.esa.int/ESA_Multimedia/Images/2010/09/MERIS_mosaic_of_Europe)) |
| `earth-s2cloudless-4096.webp` | The whole Earth, cloudless, for the globe in "Why Europe" (the 2016 edition, the only CC BY one that covers the world; 2018 onwards is non-commercial) | EOxCloudless by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016), CC BY 4.0 ([source](https://cloudless.eox.at)); credited on the globe itself, as EOX asks |
| `news-hessen-ideen-2026.webp` | Team PRISM receiving the KI-Sonderpreis at Hessen Ideen 2026 | Hessen Ideen (the organisers' photograph), supplied by the team |
| `dlr-vulcain2-p5.webp` | Vulcain 2 engine on test stand P5, DLR Lampoldshausen (the home page's first screen) | DLR, CC BY 3.0 ([source](https://www.dlr.de/en/images/2011/3/vulcain-2-engine-on-test-facility-p5-at-dlr-lampoldshausen_3149)) |
| `dlr-vinci-p41-1200.webp`, `dlr-vinci-p41-2000.webp`, `dlr-vinci-p41-wide.webp` | Vinci engine in altitude test stand P4.1, resized (the `-wide` card version also cropped to 3:2) | DLR, CC BY 3.0 ([source](https://www.dlr.de/de/bilder/2016/2/vinci-triebwerk-im-pruefstand-p4-1_23249)) |
| `public/og/prism.jpg`, `public/og/investor-room.jpg` | The link previews: `spark-melt.webp` and `spark-hearth-charge.webp` beside the site's own words. Previews travel without a credit line, so they use only our own photographs | Our own photographs |

ESA images: use only those whose page says **CC BY-SA 3.0 IGO**, credit them
as the page says, link the licence and say if they were changed. Images under
the ESA Standard Licence only (most launch and engine photographs, such as
Ariane 6 liftoffs and Prometheus tests) need ESA's written permission for
commercial use (spaceinimages@esa.int). No image may suggest that ESA endorses
PRISM.

DLR images: those credited "DLR (CC-BY 3.0)" may be used commercially with the
credit and a licence link; many newer ones are "CC BY-NC-ND 3.0" (no commercial
use). Check the credit line under the image on its own DLR page.

## Writing for the site

Write so that anyone can follow: short sentences, everyday words, and the
precise terms in the source lines. Every number carries a source line. Numbers
that are not ours (for example other groups' published results) do not
headline the site. Every capability carries its maturity:
*In use*, *Prototype* (working software, being matured), *In development* or
*Target*. Illustrative graphics say so. Partners under NDA are not named.
Data from ongoing projects (schedules, benchmarks, candidate counts, test
conditions, consortium roles) stays off the website; programmes appear only
as short news items.

The German says the same as the English, in plain German for engineers and
investors, addressing the reader as *Sie*. Names stay as they are (PRISM,
Mirdyne, Bimo Tech, CAMEO, Forager).
