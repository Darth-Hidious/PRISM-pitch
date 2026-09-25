# PRISM — website and investor briefing

`prism.mirdyne.com`: what PRISM is, how it works and where it stands.

| Path | What | Source |
| --- | --- | --- |
| `/` | The website: a scrolling page from the problem to the stacks, evidence and IP, programmes, business model and company | `src/site/` |
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
- **Fonts**: Manrope and Geist Mono, self-hosted through Fontsource (no calls
  to Google Fonts).

## Writing for the site

Every number carries a source line. Every capability carries its maturity:
*In use*, *Prototype* (PRISM software at TRL 3 → 4), *In development* or
*Target*. Illustrative graphics say so. Partners under NDA are not named.
