/**
 * Bundles the PRISM component library (src/ds) for the design-system artifact.
 *
 * Usage:  node scripts/build-design-system.mjs <out-dir>
 * Writes: <out-dir>/components/bundle.js   one classic script, window.Prism,
 *                                          reading window.React / window.ReactDOM
 *         <out-dir>/components/bundle.css  base rules + src/styles/prism.css
 *         <out-dir>/fonts/*.woff2          Manrope and Geist Mono (latin)
 */
import { build } from 'esbuild';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] ?? 'design-system');
mkdirSync(join(out, 'components'), { recursive: true });
mkdirSync(join(out, 'fonts'), { recursive: true });

const COMPONENTS = [
    'Button', 'Kicker', 'StatusPill', 'MaturityPill', 'Stat', 'ProcessChain', 'Timeline', 'StatusTable',
    'SourceLine', 'FooterBand', 'CapabilityStack', 'RightsState', 'ObjectCard', 'EvidenceLineage',
    'RightsManifest', 'WindowPlot', 'Painting', 'MirdyneMark',
];

// react, react-dom and the automatic JSX runtime resolve to the page's globals.
const reactGlobals = {
    name: 'react-globals',
    setup(b) {
        b.onResolve({ filter: /^react(-dom)?(\/jsx-runtime)?$/ }, (a) => ({ path: a.path, namespace: 'react-globals' }));
        b.onLoad({ filter: /.*/, namespace: 'react-globals' }, (a) => {
            if (a.path === 'react-dom') return { contents: 'module.exports = window.ReactDOM;', loader: 'js' };
            if (a.path === 'react/jsx-runtime')
                return {
                    contents: `const R = window.React;
export const Fragment = R.Fragment;
export function jsx(type, props, key) { return R.createElement(type, key === undefined ? props : Object.assign({}, props, { key })); }
export const jsxs = jsx;`,
                    loader: 'js',
                };
            return { contents: 'module.exports = window.React;', loader: 'js' };
        });
    },
};

const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: 'Prism', components: COMPONENTS.map((name) => ({ name })) })} */`;
const result = await build({
    entryPoints: [join(root, 'src/ds/index.ts')],
    bundle: true,
    format: 'iife',
    globalName: 'Prism',
    jsx: 'automatic',
    minify: true,
    target: 'es2019',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [reactGlobals],
    write: false,
    logLevel: 'warning',
});
let js = result.outputFiles[0].text;
if (/<\/script|<!--/i.test(js)) throw new Error('bundle contains </script or <!-- and cannot be inlined');
js = `${header}\n${js}window.Prism = Prism;\n`;
writeFileSync(join(out, 'components/bundle.js'), js);

// Base rules the site gets from tokens.css, minus the variables (the design system compiles those from tokens.json).
const base = `/* Base: the ground and ink follow data-theme; body copy is Manrope. */
[data-theme] { background-color: var(--ground); color: var(--ink); }
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-sans); font-size: 18px; line-height: 1.55; -webkit-font-smoothing: antialiased; }
h1, h2, h3, h4, p, ol, ul, figure, dl, dd { margin: 0; }
img, video, svg { display: block; max-width: 100%; }
:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
`;
writeFileSync(join(out, 'components/bundle.css'), base + '\n' + readFileSync(join(root, 'src/styles/prism.css'), 'utf8'));

copyFileSync(join(root, 'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2'), join(out, 'fonts/Manrope-Variable-latin.woff2'));
copyFileSync(join(root, 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'), join(out, 'fonts/GeistMono-Variable-latin.woff2'));

console.log(`bundle.js ${(js.length / 1024).toFixed(1)} kB, bundle.css written, fonts copied → ${out}`);
