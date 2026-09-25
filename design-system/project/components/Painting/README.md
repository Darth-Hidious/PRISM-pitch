# Painting

A photograph, or a scene drawn in code, repainted as brush strokes in the browser: seeded, so the same image, size and seed always paint the same way.

- Give `src` for a same-origin photograph, or `source` for a function that returns a canvas of the requested size (keep it a stable, module-level function).
- `seed` picks the stroke pattern, `direction` the global motion angle in degrees, `motion` (0–1) how strongly open areas smear, `detail` multiplies the fine strokes.
- Size it with CSS; it paints at the size it is shown and repaints on large resizes.
- Caption it "Repainted in code". Keep `alt` as you would for the photograph.

Props: `src`, `source`, `alt`, `seed`, `direction`, `motion`, `detail`, `focusX`, `focusY`, `animate`, `className`, `style`.
