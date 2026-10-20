/**
 * Live-site image audit using Chromium. Read-only: no form submissions or writes.
 * Checks HTML <img>, lazily loaded images, picture sources, CSS background
 * images (including pseudo-elements) and failed browser image requests.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const origin = process.env.SITE_BASE || 'https://crecergrande.in';
const root = path.resolve(__dirname, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const paths = new Set(['/']);
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['assets', 'scripts', 'node_modules'].includes(entry.name)) continue;
      walk(p);
    } else if (p.endsWith('.html')) {
      const url = '/' + path.relative(root, p).replace(/\\/g, '/');
      paths.add(url);
    }
  }
}
walk(root);

const browserErrors = [];
const routeFailures = [];
const brokenByUrl = new Map();
const imageDetails = [];
const pages = Array.from(paths).sort();

function mark(url, reason, page) {
  if (!url) return;
  let absolute = url;
  try { absolute = new URL(url, origin).href; } catch { }
  const entry = brokenByUrl.get(absolute) || { url: absolute, reasons: new Set(), pages: new Set() };
  entry.reasons.add(reason);
  entry.pages.add(page);
  brokenByUrl.set(absolute, entry);
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage', '--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: false });
  let next = 0;
  const seenBackgrounds = new Map();

  async function inspect(pagePath) {
    const page = await context.newPage();
    const imagesFailed = [];
    page.on('response', (res) => {
      if (res.request().resourceType() === 'image' && res.status() >= 400) {
        imagesFailed.push({ url: res.url(), reason: 'HTTP ' + res.status() });
      }
    });
    page.on('requestfailed', (req) => {
      if (req.resourceType() === 'image') {
        imagesFailed.push({ url: req.url(), reason: req.failure()?.errorText || 'request failed' });
      }
    });
    try {
      let response = await page.goto(origin + pagePath, { waitUntil: 'domcontentloaded', timeout: 35000 });
      if (!response || response.status() >= 400) {
        routeFailures.push({ page: pagePath, error: 'HTTP ' + (response?.status() || 'no response') });
        return;
      }
      await page.waitForTimeout(800);
      // Force lazy images to load and scroll over the full document, triggering viewport-based imagery.
      await page.evaluate(() => {
        document.querySelectorAll('img[loading="lazy"]').forEach(el => el.loading = 'eager');
      });
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let pos = 0; pos < Math.min(height, 24000); pos += 1100) {
        await page.evaluate(y => window.scrollTo(0, y), pos);
        await page.waitForTimeout(100);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(950);
      const snapshot = await page.evaluate(async () => {
        await Promise.race([
          Promise.allSettled(Array.from(document.images, im => im.decode())),
          new Promise(r => setTimeout(r, 4000))
        ]);
        const imageStates = Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.currentSrc || img.src || img.getAttribute('src') || '',
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete,
          alt: img.getAttribute('alt') || ''
        }));
        const backgroundURLs = new Set();
        const addCssUrls = (style) => {
          if (!style) return;
          for (let property of ['backgroundImage', 'maskImage', 'borderImageSource', 'content']) {
            const text = String(style[property] || '');
            for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
              let s = m[1];
              try { s = new URL(s, document.baseURI).href; } catch {}
              if (s.startsWith('http')) backgroundURLs.add(s);
            }
          }
        };
        for (const el of document.querySelectorAll('*')) {
          addCssUrls(getComputedStyle(el));
          if (el.matches('body, main, header, footer, section, div, article, a, figure, button, img')) {
            addCssUrls(getComputedStyle(el, '::before'));
            addCssUrls(getComputedStyle(el, '::after'));
          }
        }
        return { title: document.title, url: location.href, imageStates, backgroundURLs: Array.from(backgroundURLs), documentHeight: document.documentElement.scrollHeight };
      });
      for (const im of snapshot.imageStates) {
        if (!im.naturalWidth && im.src) mark(im.src, im.complete ? 'rendered image has zero naturalWidth' : 'image never finished loading', pagePath);
      }
      for (const im of imagesFailed) mark(im.url, im.reason, pagePath);
      imageDetails.push({ page: pagePath, finalUrl: snapshot.url, imgs: snapshot.imageStates.length, backgrounds: snapshot.backgroundURLs.length, documentHeight: snapshot.documentHeight });
      for (const bg of snapshot.backgroundURLs) {
        if (!seenBackgrounds.has(bg)) seenBackgrounds.set(bg, new Set());
        seenBackgrounds.get(bg).add(pagePath);
      }
    } catch (e) {
      routeFailures.push({ page: pagePath, error: String(e.message || e).slice(0, 240) });
    } finally {
      await page.close();
    }
  }

  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < pages.length) await inspect(pages[next++]);
  }));
  // Fetch CSS background image assets explicitly (not all are actually visible).
  let bgIndex = 0;
  const backgrounds = Array.from(seenBackgrounds.entries());
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (bgIndex < backgrounds.length) {
      const [url, referencingPages] = backgrounds[bgIndex++];
      try {
        const res = await context.request.get(url, { timeout: 18000, maxRedirects: 5 });
        if (res.status() >= 400) for (const p of referencingPages) mark(url, 'CSS background HTTP ' + res.status(), p);
        else {
          const contentType = res.headers()['content-type'] || '';
          if (!contentType.startsWith('image/') && !url.endsWith('.svg')) {
            for (const p of referencingPages) mark(url, 'CSS background returned ' + contentType, p);
          }
        }
      } catch (e) {
        for (const p of referencingPages) mark(url, 'CSS background fetch ' + String(e.message || e).slice(0, 120), p);
      }
    }
  }));
  await browser.close();
  console.log('SUMMARY|' + JSON.stringify({ pages: pages.length, visited: imageDetails.length, failedRoutes: routeFailures.length, brokenImageUrls: brokenByUrl.size, cssBackgroundUrls: backgrounds.length, imgInstances: imageDetails.reduce((n,p)=>n+p.imgs,0) }));
  for (const p of imageDetails) console.log('PAGE|' + JSON.stringify(p));
  for (const r of routeFailures) console.log('ROUTE_FAIL|' + JSON.stringify(r));
  for (const item of brokenByUrl.values()) {
    console.log('BROKEN|' + JSON.stringify({ url: item.url, reasons: Array.from(item.reasons), pages: Array.from(item.pages) }));
  }
  if (routeFailures.length || brokenByUrl.size) process.exitCode = 1;
}
main().catch((e) => { console.error('FATAL|', e); process.exitCode = 2; });
