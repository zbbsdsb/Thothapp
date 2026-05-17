const { chromium } = require('playwright');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'store-assets', 'screenshots');

async function takeScreenshots() {
    console.log('🚀 Starting screenshot capture...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 393, height: 852 }, // Pixel 8 Pro
        deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    const screenshots = [];

    try {
        // 1. Dream List (Home)
        console.log('📸 Capturing Dream List...');
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'screenshot-05-homelist.png'),
            fullPage: true
        });
        screenshots.push('screenshot-05-homelist.png');
        console.log('✅ Dream List captured');

        // 2. Record Screen
        console.log('📸 Capturing Record Screen...');
        const recordBtn = await page.$('button:has-text("Record"), button:has-text("Start"), [data-testid="record-btn"], .record-btn, button[class*="record"]');
        if (recordBtn) {
            await recordBtn.click();
        } else {
            // Try clicking FAB or plus button
            const fab = await page.$('button[class*="fab"], [class*="fab"]');
            if (fab) await fab.click();
        }
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'screenshot-06-record.png'),
            fullPage: true
        });
        screenshots.push('screenshot-06-record.png');
        console.log('✅ Record Screen captured');

        // 3. Dream Detail
        console.log('📸 Capturing Dream Detail...');
        const dreamCard = await page.$('[class*="dream"], [class*="card"], [data-testid="dream-item"]');
        if (dreamCard) {
            await dreamCard.click();
            await page.waitForTimeout(1000);
            await page.screenshot({
                path: path.join(OUTPUT_DIR, 'screenshot-07-detail.png'),
                fullPage: true
            });
            screenshots.push('screenshot-07-detail.png');
            console.log('✅ Dream Detail captured');
        }

        // 4. Settings
        console.log('📸 Capturing Settings...');
        await page.goto('http://localhost:3000/settings', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'screenshot-08-settings.png'),
            fullPage: true
        });
        screenshots.push('screenshot-08-settings.png');
        console.log('✅ Settings captured');

        console.log('\n🎉 All screenshots captured!');
        console.log('Files:', screenshots.join(', '));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

takeScreenshots();
