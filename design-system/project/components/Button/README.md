# Button

The one button: `primary` for the thing the view is for, `secondary` beside it, `link` for inline follow-ups.

- Use `primary` at most once per view ("Register interest"). Verb first, sentence case.
- `href` renders a link; without it, a `<button>` with `onClick`.
- `external` opens a new tab and swaps the → arrow for ↗. Set it for anything that leaves the site (the interest form, GitHub).
- On navy the primary inverts to white with navy text; nothing else changes.

Props: `children`, `variant` (`primary` | `secondary` | `link`), `href`, `external`, `arrow` (default true), `onClick`, `className`.
