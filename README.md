# PRISM — website and investor briefing

`prism.mirdyne.com`: what PRISM is, how it works and where it stands.

| Path | What | Source |
| --- | --- | --- |
| `/` | The website: the problem PRISM solves, a precedent, why Europe, the loop, the five stacks, live exhibits of the method, evidence and IP, the business, progress, open research, the company and news | `src/site/` |
| `/deck/` | The investor briefing: 12 slides on a 1440 × 810 stage, `/deck/#5` opens slide 5 | `src/deck/` |

Both are built from the same component library in `src/ds/` and the tokens in
`src/styles/`, which are also published as the PRISM design system.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/ and /deck/
npm run build      # type-check and build both pages into dist/
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
- **Live paintings** (`src/ds/livepaint.ts`, `src/ds/LivePainting.tsx`): real
  photographs painted on the GPU every frame (structure tensor, anisotropic
  Kuwahara filter, strokes swept along the forms, paint relief), with the
  photograph's fine detail carried through. They resolve from noise as you
  scroll, like a diffusion model, and the scenes move: the furnace photograph
  drifts slowly, gas runs along the Raptor plume, light moves on the sample. Scenes are
  in `src/site/scenes.ts`; the globe that turns to Europe is `src/site/globe.ts`.
  On devices without a real GPU they fall back to the stroke painter
  (`src/ds/paint.ts`, `src/ds/Painting.tsx`); `?paint=live` forces the live
  renderer for testing.
- **Brand**: the PRISM mark is `src/ds/PrismMark.tsx` (follows the text colour)
  and `public/brand/prism-logo-light-mode.svg` / `prism-logo-dark-mode.svg`.
- **Website** (`src/site/`): one component per section. The web type scale,
  sticky scroll stages and exhibit styles are in `site.css`. The live pieces
  compute in the browser: the dot field in `Gap.tsx` (one dot per 20,000
  possible alloys, from plain arithmetic), the process map and the Gaussian-process loop in
  `Method.tsx`, the rights explorer in `Evidence.tsx` and the event cascade in
  `Roadmap.tsx`. Each says on the page what is illustrative.
- **Fonts**: Manrope and Geist Mono, self-hosted through Fontsource (no calls
  to Google Fonts).

## Images and their rights

| File | What | Rights |
| --- | --- | --- |
| `spark-*.webp` | Project SPARK photographs (furnace, sample, lab) | Bimo Tech, project photographs |
| `raptor-test.webp` | Raptor's first test firing, 25 September 2016 | SpaceX, CC0 1.0 (Wikimedia Commons: Raptor-test-9-25-2016.jpg) |
| `earth-blue-marble.webp`, `globe-europe.webp` | Blue Marble with topography and bathymetry, and a render of it | NASA, public domain (via the three-globe package) |
| `src/site/europe-outline.ts` | EU and ESA member-state outlines | Natural Earth 1:110m, public domain (via world-atlas) |
| `search-manifold.webp`, `event-network.webp` | Illustrations from the Mirdyne briefing deck | Mirdyne |
| `news-hessen-ideen-2026.webp` | Team PRISM receiving the KI-Sonderpreis at Hessen Ideen 2026 | Supplied by the team; confirm the photographer's credit before launch |

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
