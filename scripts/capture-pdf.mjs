/**
 * Capture all slides as screenshots and build a PDF with clickable links.
 *
 * Usage:  node scripts/capture-pdf.mjs
 * Requires: playwright, pdf-lib
 */

import { chromium } from 'playwright';
import { PDFDocument, PDFString } from 'pdf-lib';
import { writeFileSync } from 'fs';
import { spawn, execFileSync } from 'child_process';

const DEV_URL = 'http://localhost:5173/deck/';
// Links in the PDF point at the live site, not at the local server the slides were captured from.
const SITE = 'https://www.mirdyne.com';
const WIDTH = 1920;
const HEIGHT = 1080;
const OUTPUT = 'PRISM-Pitch-Deck.pdf';

async function main() {
    // 1. Check if dev server is already running
    let weStartedServer = false;
    let serverProc = null;
    try {
        const res = execFileSync('lsof', ['-ti', ':5173'], { encoding: 'utf-8' }).trim();
        if (!res) throw new Error('not running');
    } catch {
        console.log('Starting dev server…');
        serverProc = spawn('npx', ['vite', '--port', '5173'], {
            stdio: 'ignore',
            detached: true,
            cwd: process.cwd(),
        });
        serverProc.unref();
        weStartedServer = true;
        await new Promise((r) => setTimeout(r, 5000));
    }

    // PW_CHROMIUM points at a Chromium already on the machine, where Playwright's own is not installed.
    const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
    const context = await browser.newContext({
        viewport: { width: WIDTH, height: HEIGHT },
        deviceScaleFactor: 1, // 1x for smaller file size
        // Each slide as it looks once it has arrived: no entrance motion, no moving lights.
        reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    console.log('Loading deck…');
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const TOTAL_SLIDES = await page.evaluate(() => document.querySelectorAll('.deck-slide').length);

    const screenshots = [];
    const slideLinks = [];

    for (let i = 0; i < TOTAL_SLIDES; i++) {
        console.log(`Capturing slide ${i + 1}/${TOTAL_SLIDES}…`);
        await page.waitForTimeout(900);
        // Painted images lay their strokes on over ~2 s; wait until they are finished.
        await page
            .waitForFunction(
                () =>
                    [...document.querySelectorAll('.deck-slide--current .pm-painting')].every(
                        (p) => p.dataset.paintingDone === 'true',
                    ),
                null,
                { timeout: 15000 },
            )
            .catch(() => {});

        // JPEG at quality 85 — much smaller than PNG
        const buf = await page.screenshot({ type: 'jpeg', quality: 85 });
        screenshots.push(buf);

        // Extract link bounding boxes from the visible slide
        const links = await page.evaluate(() => {
            const visibleSlide = document.querySelector('.deck-slide--current');
            if (!visibleSlide) return [];

            const anchors = visibleSlide.querySelectorAll('a[href]');
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            return [...anchors].map((a) => {
                const rect = a.getBoundingClientRect();
                return {
                    x: rect.x / vw,
                    y: rect.y / vh,
                    w: rect.width / vw,
                    h: rect.height / vh,
                    href: a.href.startsWith(location.origin) ? a.href.slice(location.origin.length) : a.href,
                };
            });
        });
        slideLinks.push(links);

        if (i < TOTAL_SLIDES - 1) {
            await page.keyboard.press('ArrowRight');
        }
    }

    await browser.close();

    if (weStartedServer && serverProc) {
        try { process.kill(-serverProc.pid); } catch { /* ignore */ }
    }

    // 2. Build PDF
    console.log('Building PDF…');
    const pdf = await PDFDocument.create();
    const pageW = 960;
    const pageH = 540;

    for (let i = 0; i < TOTAL_SLIDES; i++) {
        const pdfPage = pdf.addPage([pageW, pageH]);

        // Embed JPEG
        const img = await pdf.embedJpg(screenshots[i]);
        pdfPage.drawImage(img, { x: 0, y: 0, width: pageW, height: pageH });

        // Add clickable link annotations
        for (const link of slideLinks[i]) {
            const x = link.x * pageW;
            const w = link.w * pageW;
            const y = pageH - (link.y * pageH) - (link.h * pageH);
            const h = link.h * pageH;

            const annot = pdf.context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: [x, y, x + w, y + h],
                Border: [0, 0, 0],
                A: {
                    Type: 'Action',
                    S: 'URI',
                    // A string, not a name: context.obj turns plain strings into names, which viewers ignore.
                    URI: PDFString.of(link.href.startsWith('/') ? SITE + link.href : link.href),
                },
            });

            const annotsRef = pdf.context.register(annot);
            const existing = pdfPage.node.lookup(
                pdf.context.obj('Annots'),
            );
            if (existing) {
                existing.push(annotsRef);
            } else {
                pdfPage.node.set(
                    pdf.context.obj('Annots'),
                    pdf.context.obj([annotsRef]),
                );
            }
        }
    }

    pdf.setTitle('PRISM by Mirdyne: investor briefing');
    pdf.setAuthor('Mirdyne');
    pdf.setSubject('Platform for Research in Intelligent Synthesis of Materials');
    pdf.setCreator('PRISM Pitch Generator');

    const pdfBytes = await pdf.save();
    writeFileSync(OUTPUT, pdfBytes);
    const sizeMB = (pdfBytes.length / 1024 / 1024).toFixed(1);
    console.log(`\n✅ Saved ${OUTPUT} (${sizeMB} MB)`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
