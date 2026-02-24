import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const htmlPath = resolve(__dirname, 'banner.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
        path: resolve(__dirname, '..', 'public', 'prism-forms-banner.png'),
        type: 'png',
    });
    await browser.close();
    console.log('Banner saved to public/prism-forms-banner.png');
}

main().catch(console.error);
