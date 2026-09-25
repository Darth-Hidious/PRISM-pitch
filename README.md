# PRISM — website and investor briefing

`prism.mirdyne.com`: what PRISM is, how it works and where it stands.

| Path | What | Source |
| --- | --- | --- |
| `/` | The website: the gap PRISM closes, the loop, the five stacks, live exhibits of the method, evidence and IP, the business, the roadmap, the company and news | `src/site/` |
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
- **Paintings** (`src/ds/paint.ts`, `src/ds/Painting.tsx`): photographs and
  scenes repainted as brush strokes in the browser, deterministic per seed.
  Scenes drawn in code live in `src/site/illustrations.ts`.
- **Website** (`src/site/`): one component per section. The web type scale,
  sticky scroll stages and exhibit styles are in `site.css`. The live pieces
  compute in the browser: the dot field in `Gap.tsx` (one dot per 100
  predicted structures), the process map and the Gaussian-process loop in
  `Method.tsx`, the rights explorer in `Evidence.tsx` and the event cascade in
  `Roadmap.tsx`. Each says on the page what is illustrative.
- **Fonts**: Manrope and Geist Mono, self-hosted through Fontsource (no calls
  to Google Fonts).

## Writing for the site

Every number carries a source line. Every capability carries its maturity:
*In use*, *Prototype* (working software, being matured), *In development* or
*Target*. Illustrative graphics say so. Partners under NDA are not named.
Data from ongoing projects (schedules, benchmarks, candidate counts, test
conditions, consortium roles) stays off the website; programmes appear only
as short news items.
