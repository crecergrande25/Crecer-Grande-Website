// Real welding photographs are pending. Do not render mismatched process photos.
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const {readOnlyContext} = require('./browser-test-helpers.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  for(const width of [1440,390]){
   const context=await readOnlyContext(browser,{viewport:{width,height:900}});
   const page=await context.newPage();
   await page.goto((process.env.SITE_BASE||'http://127.0.0.1:8765')+'/laser-welding-kolkata.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(l=>!!l.sheet));
   assert.match(await page.locator('main h1').innerText(),/LASER WELDING/i);
   assert.equal(await page.locator('main img').count(),0,'Unverified process photographs must not be restored');
   assert.ok(await page.locator('main').getByText('Joint Review',{exact:true}).isVisible());
   assert.ok(await page.locator('main a[href*="request-quote"]').first().isVisible());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false);
   console.log('WELDING_MEDIA|PASS '+width+'px; no mismatched photos, joint-review content and quote link visible');
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
