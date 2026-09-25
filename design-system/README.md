# PRISM design system: source

The files published to the PRISM Design System artifact, kept here so they are
versioned with the code that renders them.

- `project/README.md`, `project/guidelines/`: the brand book and writing guide
- `project/tokens.json`: colours (paper and navy), type, spacing, radii
- `project/components/<Name>/`: guidelines and live preview for each component
- `project/components/Cover/preview.html`: the cover
- `project/assets/*/README.md`: notes for the Logos and Imagery groups (the
  image files themselves live in `public/` and in the artifact's asset store)

Generated, not committed: `components/bundle.js`, `components/bundle.css` and
`fonts/` come from `node scripts/build-design-system.mjs design-system/project`;
`components/lib/` holds React 18.3.1 from the Design System type's demo. The
artifact's index (`design-system.json`) lives only in the artifact: read it
fresh before any republish.
