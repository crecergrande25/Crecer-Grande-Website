/** Compatibility command: validate rendered media and layout.
 * Only the owner-requested generated set is permitted as content imagery.
 * Generated images must be disclosed; retired legacy assets remain blocked.
 * Do not enforce image counts or substitute synthetic artwork for missing photos.
 */
const { chromium } = require('playwright');
const { readOnlyContext } = require('./browser-test-helpers.cjs');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const approved = JSON.parse(fs.readFileSync(path.join(root,'assets/data/photography.json'),'utf8')).entries;
const expectedImages=Object.fromEntries(approved.map(e=>[e.id,{src:e.src,alt:e.alt}]));
const seen=new Set();
const base = process.env.SITE_BASE || 'http://127.0.0.1:8765';
const mobile = (process.env.AUDIT_VIEWPORT || process.env.HERO_VIEWPORT) === 'mobile';
const pages = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['assets', 'scripts', 'node_modules', 'docs', 'supabase'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      if (!/<meta\b[^>]*http-equiv=["']refresh/i.test(html)) pages.push('/' + path.relative(root, file).replaceAll('\\', '/'));
    }
  }
}
walk(root);
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await readOnlyContext(browser, { viewport: { width: mobile ? 390 : 1440, height: 900 }, reducedMotion: 'reduce' });
  const failures = [];
  let images = 0, heroes = 0;
  try {
    for (const route of pages.sort()) {
      const page = await context.newPage();
      page.on('pageerror', error => failures.push({ route, issue: 'Uncaught JavaScript error', detail: error.message }));
      try {
        const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (response?.status() !== 200) throw new Error('Page HTTP ' + response?.status());
        await page.evaluate(async () => {
          document.querySelectorAll('img').forEach(image => image.loading = 'eager');
          await Promise.race([Promise.allSettled([...document.images].map(image => image.decode())), new Promise(resolve => setTimeout(resolve, 8000))]);
        });
        const state = await page.evaluate(expectedImages => {
          const issues = [];
          if (document.querySelector('svg,img[src*=".svg"],object[type="image/svg+xml"]')) issues.push('SVG image or inline artwork remains');
          if (document.querySelector('.cg-art-placeholder')) issues.push('Synthetic image placeholder remains');
          if (document.documentElement.scrollWidth > innerWidth + 3) issues.push('Horizontal page overflow');
          for (const image of document.images) {
            if (!image.complete || !image.naturalWidth) issues.push('Image did not decode: ' + image.getAttribute('src'));
            if (!image.alt.trim()) issues.push('Image has no useful alternative text: ' + image.getAttribute('src'));
          }
          for (const image of document.querySelectorAll('main img')) {
            const id=image.dataset.generatedImage;
            if(!id){if(!/logo|qr-code|website-qr/i.test(image.getAttribute('src')||''))issues.push('Unregistered image: '+image.getAttribute('src'));continue;}
            const expected=expectedImages[id];
            if(!expected||expected.src!==image.getAttribute('src'))issues.push('Image not in the approved generated set: '+id);
            if(expected&&expected.alt!==image.alt)issues.push('Generated image has mismatched alternative text: '+id);
            if(!image.getClientRects().length||!image.clientWidth)issues.push('Placed image is hidden: '+id);
            if(getComputedStyle(image).objectFit==='fill'&&Math.abs(image.clientWidth/image.clientHeight-1.5)>.03)issues.push('Image is stretched: '+id);
            if(!document.querySelector('.cg-media-disclosure,.cg-generated-note'))issues.push('Generated-image disclosure is missing');
          }
          const hero = document.querySelector('main section.cg-image-backed-hero');
          if (hero) {
            const background = getComputedStyle(hero).backgroundImage;
            if (/url\(/i.test(background)) issues.push('Unverified hero image is rendered');
            if (/\.svg/i.test(background)) issues.push('SVG hero background remains');
            const heading = hero.querySelector('h1');
            if (!heading || !heading.getClientRects().length || getComputedStyle(heading).color !== 'rgb(255, 255, 255)') issues.push('Hero heading is not visible and legible');
            if (hero.getBoundingClientRect().height < 180) issues.push('Hero has collapsed');
          }
          return { issues, images: document.images.length, hero: !!hero, ids:[...document.querySelectorAll('[data-generated-image]')].map(i=>i.dataset.generatedImage) };
        },expectedImages);
        images += state.images;
        state.ids.forEach(id=>seen.add(id));
        if (state.hero) heroes++;
        failures.push(...state.issues.map(issue => ({ route, issue })));
      } catch (error) { failures.push({ route, issue: error.message }); }
      finally { await page.close(); }
    }
  } finally { await browser.close(); }
  if(seen.size!==50)failures.push({issue:'Expected all 50 generated images across the site',actual:seen.size});
  console.log('MEDIA_INTEGRITY|' + JSON.stringify({ viewport: mobile ? 'mobile' : 'desktop', pages: pages.length, images, heroes, uniqueGenerated:seen.size, failures: failures.length }));
  for (const failure of failures) console.error(JSON.stringify(failure));
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
