// Verify the eight requested release changes against rendered pages.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {readOnlyContext}=require('./browser-test-helpers.cjs');
const base=process.env.SITE_BASE||'http://127.0.0.1:8765';
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true});let passed=0;
 const check=async(name,fn)=>{await fn();passed++;console.log('PASS '+name)};
 try{
 const context=await readOnlyContext(browser,{viewport:{width:1440,height:1000}});await context.route('https://**/*',r=>r.abort());const page=await context.newPage();
 const go=async r=>{await page.goto(base+r,{waitUntil:'networkidle'})};
 await check('Projects files, navigation, search and sitemap entries are removed',async()=>{
  assert.ok(!fs.existsSync(path.join(root,'projects.html')));
  assert.equal(fs.readdirSync(path.join(root,'projects')).filter(f=>f.endsWith('.html')).length,0);
  for(const file of ['assets/data/content-index.json','sitemap.xml'])assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'),/\/projects(?:\.html|\/)/);
  await go('/');assert.equal(await page.locator('a[href^="/projects"]').count(),0);
 });
 await check('Home keeps its hero treatment; other heroes retain foreground and add backgrounds',async()=>{
  for(const route of ['/','/contact.html','/services.html','/insights/bearing-failure-evidence.html']){
   await go(route);assert.equal(await page.locator('.cg-hero-foreground img').count(),1);
   const bg=await page.locator('section.cg-foreground-hero').evaluate(e=>getComputedStyle(e).backgroundImage);
   if(route==='/')assert.doesNotMatch(bg,/url\(/);else assert.match(bg,/generated\/.+\.webp/);
  }
 });
 await check('Contact routes have three aligned image cards with working enquiry destinations',async()=>{
  await go('/contact.html');const cards=page.locator('.cg-contact-route-grid>a');assert.equal(await cards.count(),3);
  const boxes=await cards.evaluateAll(es=>es.map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,href:e.getAttribute('href'),loaded:!!e.querySelector('img')?.naturalWidth})));
  assert.ok(boxes.every(b=>b.loaded&&b.href.startsWith('/request-quote.html?')));
  assert.ok(Math.max(...boxes.map(b=>b.top))-Math.min(...boxes.map(b=>b.top))<2);
  assert.ok(Math.max(...boxes.map(b=>b.bottom))-Math.min(...boxes.map(b=>b.bottom))<2);
 });
 await check('Contact uses original branding, a visible QR and white Scan Connect heading',async()=>{
  assert.equal(await page.locator('.contact-premium-brandrow img').getAttribute('src'),'/assets/images/Logo-R01.png');
  assert.equal(await page.locator('.contact-premium-copy h3').evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
  assert.equal(await page.locator('.contact-premium-qr').getAttribute('href'),'https://wa.me/916291001781');
  const qr=page.locator('.contact-premium-qr img');await qr.scrollIntoViewIfNeeded();assert.ok(await qr.isVisible());
  const size=await qr.boundingBox();assert.ok(size.width>=112&&size.height>=112);assert.ok(await qr.evaluate(i=>i.naturalWidth>0));
  if(process.env.QR_CAPTURE_DIR){fs.mkdirSync(process.env.QR_CAPTURE_DIR,{recursive:true});await qr.screenshot({path:path.join(process.env.QR_CAPTURE_DIR,'qr-desktop.png')});}
  await page.setViewportSize({width:320,height:900});await qr.scrollIntoViewIfNeeded();assert.ok((await qr.boundingBox()).width>=112);
  if(process.env.QR_CAPTURE_DIR)await qr.screenshot({path:path.join(process.env.QR_CAPTURE_DIR,'qr-mobile.png')});
  assert.ok(await page.locator('#rfq-form [name="consent"]').isVisible());await page.setViewportSize({width:1440,height:1000});
 });
 await check('Fit Case Study is absent',async()=>{await go('/custom-machine-spares.html');assert.doesNotMatch(await page.locator('main').innerText(),/Fit Case Study/)});
 await check('The shared footer is compact and uses Contact Us plus raster brand marks',async()=>{
  for(const route of ['/','/contact.html','/insights.html','/insights/bearing-failure-evidence.html']){
   await go(route);const footer=page.locator('footer.cg-footer');assert.equal(await footer.locator('.cg-footer-contact h2').innerText(),'Contact Us');
   assert.equal(await footer.locator('.cg-footer-socials img').count(),2);assert.ok((await footer.boundingBox()).height<400);
   assert.equal(await footer.locator('svg').count(),0);
   for(const a of await footer.locator('.cg-footer-socials a').all())assert.ok(await a.getAttribute('aria-label'));
  }
 });
 await check('Insights exposes 50 distinct articles, four filters and no Downloads area',async()=>{
  await go('/insights.html');const cards=page.locator('[data-filter-item]');assert.equal(await cards.count(),50);
  const links=await cards.evaluateAll(es=>es.map(e=>e.getAttribute('href')));assert.equal(new Set(links).size,50);
  assert.doesNotMatch(await page.locator('main').innerText(),/Downloads|Division capability profiles/);
  assert.equal(await page.locator('main a[href*="/assets/downloads/"]').count(),0);
  for(const category of ['design','manufacturing','maintenance','quality']){
   await page.locator(`[data-filter="${category}"]`).click();assert.ok(await page.locator('[data-filter-item]:visible').count()>0);
   assert.ok(await page.locator('[data-filter-item]:visible').evaluateAll((es,c)=>es.every(e=>e.dataset.filterItem===c),category));
  }
  await page.locator('[data-filter="all"]').click();await page.locator('[data-content-search]').fill('bearing');assert.ok(await page.locator('[data-filter-item]:visible').count()>0);
  await page.locator('[data-content-search]').fill('zz-no-match-zz');assert.ok(await page.locator('[data-filter-empty]').isVisible());await page.locator('[data-content-search]').fill('');
  const articles=JSON.parse(fs.readFileSync(path.join(root,'assets/data/insights.json')));
  for(const a of articles){const html=fs.readFileSync(path.join(root,a.href.slice(1)),'utf8');assert.match(html,/<h1/);if(a.new){assert.ok(a.checks.length>=4);assert.ok(a.mistakes.length>=2);assert.ok(a.decision.length>100)}}
 });
 await check('All Insights cards have images and a full-height readable overlay',async()=>{
  const cards=page.locator('a.cg-insight-tile');assert.equal(await cards.count(),53);
  assert.ok(await cards.evaluateAll(es=>es.every(e=>{const im=e.querySelector('img'),after=getComputedStyle(e,'::after');return im?.loading==='lazy'&&after.backgroundImage.includes('linear-gradient')&&parseFloat(after.height)>e.clientHeight-2&&getComputedStyle(e.querySelector('h3')).color==='rgb(255, 255, 255)'})));
 });
 await context.close();console.log('RELEASE10|'+JSON.stringify({passed,productionWrites:0}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
