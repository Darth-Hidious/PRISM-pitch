PRISM is Mirdyne's closed-loop materials platform, and this system is how it looks and speaks on the website, in the investor briefing and in slide decks. It is built from the Professor Briefing deck of 29 August 2026 (960 × 540 pt slides, mapped × 1.5 onto a 1440 px canvas) and extended for the web. Two themes: `paper` carries the narrative, `navy` carries dark slides, the evidence console and closing sections.

## Voice

The message in one line: **Specify the capability. We deliver the material.** Everything else is evidence for it.

- Write headlines as full sentences with a full stop: "Materials decide what engineers are free to build." Never a label ("Our Solution").
- State maturity exactly, never ahead of it. Every capability carries one of four words: *In use* (runs in current programmes), *Prototype* (working software, being matured), *In development* (being built), *Target* (where the platform is going, not claimed today). Write "Prototype, being matured", not "production-ready".
- Every figure and every photograph gets a source line: "Source: Kusne et al., Nature Communications 11, 5966 (2020)." Arithmetic says "Arithmetic" and shows the sum. Illustrative graphics say "Illustrative" in the line.
- "We" is Mirdyne. "PRISM" is the platform. Say "PRISM designs candidate alloys", never "our AI".
- British spelling: programme, characterisation, organisation. Non-breaking space before units: 1,200 °C, 12 months. Figures as €48M, 474M, 23,716.
- No exclamation marks, no emoji, no hype words (revolutionary, cutting-edge, game-changing, unlock).
- Partners under NDA are "an industrial partner". Competitors are not named on the website.
- Confident comes from specifics: "Eight refractory high-entropy alloy candidates taken to two physical down-selections" beats "proven results".

The writing section has the full rules with before-and-after examples.

## Colour

- Set every page on `ground` with `ink`; raise cards and steps on `surface`. Body copy is `ink-2`. Borders are `rule` hairlines; rows inside a table use `rule-soft`.
- `accent` (deck blue) marks what is established: kickers, links, the Awarded and In-use pills, the base case. `teal` marks what is agreed but early: Contracted, Prototype, the upside case. `crimson` is the signal: the current dot, the optimum, the zero that matters, In development. Use crimson once or twice per view, never as decoration.
- `emphasis` fills exactly one element in a group, the one the group is for: the Evidence step, the decision node, the primary button. Text on it is `on-emphasis`.
- Small text in teal or crimson uses `teal-text` or `crimson-text`. The deck's own teal (3.9:1) and crimson (4.4:1) miss 4.5:1 on their tints; they stay exact for borders, dots and fills.
- The deck's source-line grey `ink-3` measures 4.0:1 on paper. Keep it for marks and large text; set source lines in `ink-2`.
- In charts: base = `accent` with `accent-tint` area, upside = `teal` with `teal-tint` area, the point that matters = `crimson`, everything else `steel` and `rule`.
- Keyboard focus is a 2 px solid `focus` outline, offset 3 px, on every interactive element in both themes.

## Type

- **Manrope** for everything a person reads; **Geist Mono** only for what a machine reads: object IDs, rights manifests, hashes, data labels.
- Headlines are `title` (Bold 54 px at stage size) or `display` (Bold 88 px, one per page). Under each: `lead` in `ink-2`. Above each: a `kicker` in capitals, `accent`, numbered on the website: "02 · The platform".
- Figures use `numeral`: Light 300, tabular lining numerals, always with a label under them and a source line nearby.
- The website scales the large styles with the viewport and caps them at the stage size: `display` clamp(44px, 6.1vw, 88px), `title` clamp(32px, 3.75vw, 54px), `lead` clamp(19px, 1.9vw, 27px). Slides use the stage sizes as they are.
- `column` heads tables in capitals; `pill` labels status; `chrome` sets the footer band; `source` sets source lines.

## Layout

- **Deck**: a 1440 × 810 stage scaled to fit the screen, `space-16` side margins, and the navy footer band (`chrome`, `chrome-height`) on every slide: MIRDYNE left, PRISM · FREEDOM TO BUILD centre in `on-chrome-2`, position right ("03 / 12").
- **Website**: content up to `layout-max`, `layout-gutter` at the sides. A section opens with its kicker across the full width, then the headline on the left and the lead on the right. Paper sections carry the story; navy sections (`data-theme="navy"`) carry the platform internals, evidence and IP, the roadmap and the call to action.
- Borders and hairlines separate things. There are no drop shadows and no coloured side-stripes on cards.
- Corners are near-square: `radius-card` for cards and buttons, `radius-panel` for images and panels, `radius-pill` for pills. Only dots are round.

## Imagery

- **Real project photographs** first: vacuum-arc melting, powder preparation, polishing, coupons. Credit each ("Project SPARK. Real project photographs.").
- **Painted images**: the Painting component repaints a photograph, or a scene drawn in code, as brush strokes in the browser. Use it where atmosphere matters more than detail: heroes, stack illustrations, cover slides. Caption it "Repainted in code" or "Drawn and painted in code". Diagrams that must be read stay crisp.
- **Illustrations** (the search landscape, the event network) are labelled Illustrative.
- Never show a candidate composition. Coupon bags carry alloy labels; crop or leave them out, since candidate compositions are export-controlled deliverables.
- No stock photographs of people, and no generated images presented as real.

## Iconography

There is no icon set. Marks are geometric and typographic:

- Arrows are drawn inside Button: → to navigate within the site, ↗ for anything that opens elsewhere.
- Rights states have their own glyphs so they read without colour: filled square (private), half square (computable), ring (released), dashed ring (public).
- Timeline dots: `steel` filled for done, `crimson` for current, hollow for next.
- Status is always a word in a pill, never colour alone.
- Logos are the Mirdyne mark and lockups in the Logos group. Partners are set in plain type; partner logos appear only with their permission.

## Motion

- Sections rise 18 px and fade in over 700 ms on `ease-rise`, once, as they enter the viewport.
- Paintings lay their strokes over about 1.8 s the first time they are seen.
- Slides crossfade over 420 ms.
- Under reduced motion, everything appears at once and videos hold their first frame.

## Evidence and IP components

The system's Palantir-style layer: claims are shown as objects with lineage and rights, not as prose.

- **CapabilityStack** and **MaturityPill** show the platform as layers, each with its maturity.
- **ObjectCard** shows one object of the PRISM ontology (a Requirement, a Specimen, a Module) with its type, properties and rights state.
- **EvidenceLineage** walks one engineering decision back to its requirement, naming each link (motivates, instantiated as, measured by, justifies).
- **RightsState** gives the four visibility states: Private, Computable, Released, Public. States never change implicitly.
- **RightsManifest** shows the machine-readable rights that travel with evidence. Example manifests are captioned Illustrative and use placeholder parties ("Customer A").

## Intentional additions

Not in the Briefing deck, added for the website and the evidence layer:

- Geist Mono and the `data` styles, so identifiers read as identifiers.
- `teal-text`, `crimson-text` and the navy tints, so every text pair meets 4.5:1 in both themes.
- Button: the deck has no controls.
- Painting and its procedural scenes.
- The evidence components, from the PRISM trust architecture: an ontology of objects, lineage, four visibility states and rights manifests.
- Fluid website type sizes, capped at the deck's stage sizes.
