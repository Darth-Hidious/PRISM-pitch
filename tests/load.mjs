/**
 * Loads a TypeScript module of the site's server side (middleware.ts, api/, server/) the way Vercel
 * builds it: bundled by esbuild, which resolves the `.js` specifiers to the `.ts` sources. Packages stay
 * outside the bundle and load from node_modules.
 */
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'node_modules/.cache/tests');

export async function load(entry) {
    const result = await build({
        entryPoints: [resolve(ROOT, entry)],
        bundle: true,
        format: 'esm',
        platform: 'node',
        packages: 'external',
        write: false,
        logLevel: 'silent',
    });
    await mkdir(OUT, { recursive: true });
    const file = resolve(OUT, `${basename(entry).replace(/\.ts$/, '')}-${process.pid}-${Date.now()}.mjs`);
    await writeFile(file, result.outputFiles[0].text);
    return import(pathToFileURL(file).href);
}
