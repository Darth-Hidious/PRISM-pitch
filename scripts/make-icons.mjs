/**
 * Draws the site's icons from the PRISM mark: the tab icon (favicon.svg and favicon.ico), the iPhone
 * home-screen icon and the Android icons named in site.webmanifest. All are the mark on a navy tile, so
 * they read on light and dark tab bars alike.
 *
 *   node scripts/make-icons.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const PUBLIC = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// The mark, as in public/brand/prism-logo-dark-mode.svg: white edges and the spectrum face.
const EDGES = 'M298 88 87 267 238 392 426 353Z M298 88 290 297 M87 267 290 297 426 353';
const FACE = 'M112 266 262 195 226 349 189 280Z';
const SPECTRUM = `<linearGradient id="s" gradientUnits="userSpaceOnUse" x1="112" y1="0" x2="262" y2="0">
    <stop offset="0" stop-color="#6b4c9e"/>
    <stop offset="0.2" stop-color="#5f55ad"/>
    <stop offset="0.38" stop-color="#2f7ecf"/>
    <stop offset="0.56" stop-color="#86a23a"/>
    <stop offset="0.76" stop-color="#f6a21f"/>
    <stop offset="1" stop-color="#ec3f37"/>
  </linearGradient>`;

/** The mark on a 512-unit tile: `round` is the corner radius, `scale` the mark's size, `edge` its line width. */
function tile({ round, scale, edge }) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
  ${SPECTRUM}
  </defs>
  <rect width="512" height="512" rx="${round}" fill="#061832"/>
  <g transform="translate(256 262) scale(${scale}) translate(-256.5 -240)">
    <path d="${EDGES}" fill="none" stroke="#ffffff" stroke-width="${edge}" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${FACE}" fill="url(#s)"/>
  </g>
</svg>
`;
}

// Tabs: a rounded tile and a large mark, its edges thick enough to survive 16 px.
const TAB = { round: 96, scale: 1.16, edge: 32 };
const PNGS = [
    { size: 16, svg: tile({ ...TAB, edge: 40 }) },
    { size: 32, svg: tile(TAB) },
    { size: 48, svg: tile({ ...TAB, edge: 28 }) },
    // Home screens: square, with no transparent corners; iOS and Android round them themselves.
    { size: 180, file: 'apple-touch-icon.png', svg: tile({ round: 0, scale: 1, edge: 20 }) },
    { size: 192, file: 'icons/icon-192.png', svg: tile({ round: 0, scale: 1, edge: 20 }) },
    { size: 512, file: 'icons/icon-512.png', svg: tile({ round: 0, scale: 1, edge: 16 }) },
    // Android may crop to a circle; the mark stays inside its central 80 %.
    { size: 512, file: 'icons/icon-maskable-512.png', svg: tile({ round: 0, scale: 0.86, edge: 18 }) },
];

/** An .ico that holds PNGs: a header, one 16-byte entry per image, then the images. */
function ico(images) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(images.length, 4);
    let offset = 6 + 16 * images.length;
    const entries = images.map(({ size, png }) => {
        const e = Buffer.alloc(16);
        e.writeUInt8(size, 0);
        e.writeUInt8(size, 1);
        e.writeUInt16LE(1, 4);
        e.writeUInt16LE(32, 6);
        e.writeUInt32LE(png.length, 8);
        e.writeUInt32LE(offset, 12);
        offset += png.length;
        return e;
    });
    return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

async function main() {
    mkdirSync(resolve(PUBLIC, 'icons'), { recursive: true });
    writeFileSync(resolve(PUBLIC, 'favicon.svg'), tile(TAB));

    // PW_CHROMIUM points at a Chromium already on the machine, where Playwright's own is not installed.
    const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
    const forIco = [];
    for (const { size, file, svg } of PNGS) {
        const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
        await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`);
        const png = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
        await page.close();
        if (file) writeFileSync(resolve(PUBLIC, file), png);
        else forIco.push({ size, png });
    }
    await browser.close();
    writeFileSync(resolve(PUBLIC, 'favicon.ico'), ico(forIco));
    console.log('Icons saved to public/: favicon.svg, favicon.ico, apple-touch-icon.png, icons/');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
