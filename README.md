# PRISM — website and investor briefing

`prism.mirdyne.com`: what PRISM is, how it works and where it stands.

| Path | What | Source |
| --- | --- | --- |
| `/` | Home: the problem PRISM solves, why Europe, the loop, links to the other pages | `src/site/pages/home.tsx` |
| `/platform/` | The five stacks (one at a time, `/platform/#autonomy` opens one) and progress | `src/site/pages/platform.tsx` |
| `/method/` | Four live demos of the method (`/method/#al` opens one) and open research | `src/site/pages/method.tsx` |
| `/evidence/` | Evidence and IP: who sees what, a real lineage (NIST's CAMEO), what a part gives away | `src/site/pages/evidence.tsx` |
| `/company/` | Mirdyne and Bimo Tech, the founders, working with us | `src/site/pages/company.tsx` |
| `/news/` | News, with the photographs | `src/site/pages/news.tsx` |
| `/deck/` | The investor briefing: 12 slides on a 1440 × 810 stage, `/deck/#5` opens slide 5 | `src/deck/` |

Each page is its own HTML file (`index.html`, `platform/index.html`, …), listed
in `vite.config.ts`; `vercel.json` also serves them without the trailing slash.

Both are built from the same component library in `src/ds/` and the tokens in
`src/styles/`, which are also published as the PRISM design system.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/, /platform/, … and /deck/
npm run build      # type-check and build every page into dist/
npm run lint
node scripts/capture-pdf.mjs   # rebuild PRISM-Pitch-Deck.pdf from /deck/
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
- **Credits and sources**: photo credits sit once per page in the footer
  (`src/site/credits.tsx`), not under each picture. Sources for facts and
  "illustrative" notes fold away under a small toggle (`Note` in `ui.tsx`).
- **Brand**: the PRISM mark is `src/ds/PrismMark.tsx` (follows the text colour)
  and `public/brand/prism-logo-light-mode.svg` / `prism-logo-dark-mode.svg`.
- **Website** (`src/site/`): one component per section, composed into pages
  in `src/site/pages/` with the shared shell in `SitePage.tsx`. The web type
  scale, tabs and exhibit styles are in `site.css`. The live pieces
  compute in the browser: the dot field in `Gap.tsx` (one dot per 20,000
  possible alloys, from plain arithmetic), the process map and the Gaussian-process loop in
  `Method.tsx`, the rights explorer in `Evidence.tsx` and the event cascade in
  `Roadmap.tsx`. Each says on the page what is illustrative.
- **Fonts**: Manrope and Geist Mono, self-hosted through Fontsource (no calls
  to Google Fonts).

## Images and their rights

| File | What | Rights |
| --- | --- | --- |
| `spark-furnace.webp` | Project SPARK photograph: vacuum-arc melting, seen through the viewport (deck cover only) | Project photograph; photographer to be confirmed |
| `spark-charge.webp`, `spark-hearth-charge*.webp`, `spark-hearth-column*.webp`, `spark-furnace-wide.webp`, `spark-melt.webp`, `spark-button*.webp`, `machining.webp` | Raw metals, the loaded hearth, the arc furnace, an alloy melting, a cast button, machining; cropped only (an equipment label and a reflection cropped out). No element or composition is named anywhere they are used | Our own photographs, supplied by the team |
| `lab-arc-melter.webp`, `lab-melt-spinner*.webp` | The arc melter and the melt spinner in the materials science lab at WUST, Wrocław (run by the university; we rent the equipment); cropped only, the arc melter's ignition-current label cropped out | Our own photographs, supplied by the team |
| `esa-europe-1280.webp`, `esa-europe-2400.webp` | Envisat MERIS true-colour mosaic of Europe, resized | ESA, CC BY-SA 3.0 IGO ([source](https://www.esa.int/ESA_Multimedia/Images/2010/09/MERIS_mosaic_of_Europe)) |
| `news-hessen-ideen-2026.webp` | Team PRISM receiving the KI-Sonderpreis at Hessen Ideen 2026 | Hessen Ideen (the organisers' photograph), supplied by the team |
| `dlr-vulcain2-p5.webp` | Vulcain 2 engine on test stand P5, DLR Lampoldshausen (the home page's first screen) | DLR, CC BY 3.0 ([source](https://www.dlr.de/en/images/2011/3/vulcain-2-engine-on-test-facility-p5-at-dlr-lampoldshausen_3149)) |
| `dlr-vinci-p41-1200.webp`, `dlr-vinci-p41-2000.webp`, `dlr-vinci-p41-wide.webp` | Vinci engine in altitude test stand P4.1, resized (the `-wide` card version also cropped to 3:2) | DLR, CC BY 3.0 ([source](https://www.dlr.de/de/bilder/2016/2/vinci-triebwerk-im-pruefstand-p4-1_23249)) |

The earlier powder-metallurgy and coupon-in-hand photos were taken at IPPT PAN
(Warsaw), not by Bimo Tech as first credited. They are no longer used anywhere.

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
