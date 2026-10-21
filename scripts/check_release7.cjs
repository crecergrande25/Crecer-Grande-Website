// Scope and stale-content regressions for the four-division release.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {readOnlyContext}=require('./browser-test-helpers.cjs');
const base=process.env.SITE_BASE||'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});let passed=0;
 const check=async(name,fn)=>{await fn();passed++;console.log('PASS '+name)};
 try{
  const context=await readOnlyContext(browser,{viewport:{width:390,height:844}});
  await context.route('https://**/*',r=>r.abort());
  const page=await context.newPage();
  const go=async route=>{await page.goto(base+route,{waitUntil:'networkidle'});};
  await check('Homepage and Services offer exactly four divisions, with current labels',async()=>{
   for(const route of ['/','/services.html']){
    await go(route);assert.equal(await page.locator('.cg-capability-card').count(),4);
    assert.equal(await page.locator('a[href*="automation"]').count(),0);
    assert.equal(await page.locator('.topbar').count(),0);
    assert.equal(await page.locator('.nav a[href="/services.html"]').innerText(),'Services');
    assert.equal(await page.locator('main img').count(),0);
   }
   await go('/');assert.equal(await page.locator('.cg-botcha-launch-copy b').innerText(),'Ask us a question');
   assert.equal(await page.locator('main a[href="/services.html"]').innerText(),'Explore Services');
  });
  await check('Six unique project guides load with real headings and no invented photos',async()=>{
   await go('/projects.html');const links=await page.locator('[data-filter-item]').evaluateAll(a=>a.map(e=>e.getAttribute('href')));
   assert.equal(links.length,6);assert.equal(new Set(links).size,6);
   for(const href of links){await go(href);assert.equal(new URL(page.url()).pathname,href,'Project link must open its own guide');assert.equal(await page.locator('main h1').count(),1);assert.equal(await page.locator('main img').count(),0)}
  });
  await check('Retired directory, Automation and duplicate project routes redirect correctly',async()=>{
   const redirects=[['/divisions.html','/services.html'],['/industrial-automation-kolkata.html','/services.html'],['/divisions/automation-solutions.html','/services.html'],['/projects/co2-laser-components-support.html','/projects/laser-machine-rca.html#component-identification'],['/projects/custom-keychain-laser-marking.html','/projects/precision-marked-components.html#artwork'],['/projects/ss304-qr-code-laser-marking.html','/projects/precision-marked-components.html#qr-plates']];
   for(const [from,to] of redirects){await page.goto(base+from,{waitUntil:'domcontentloaded'});await page.waitForURL(base+to);if(to.includes('#'))assert.ok(await page.locator(to.slice(to.indexOf('#'))).isVisible())}
  });
  await check('Removed Automation download returns 404',async()=>{
   const res=await context.request.get(base+'/assets/downloads/Automation_Solutions_Profile.pdf');assert.equal(res.status(),404);
  });
  await context.close();
  // The production SDK is replaced by a controlled local fixture; no backend writes.
  const cms=await readOnlyContext(browser);
  await cms.route('https://**/*',r=>r.abort());
  await cms.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({contentType:'application/javascript',body:`window.supabase={createClient(){return {rpc:async()=>({data:[]}),from(table){const data=table==='homepage_content'?{updated_at:'2026-09-23T00:00:00Z',hero_line1:'OLD AUTOMATION CLAIM',hero_description:'Old description',divisions_heading:'5 Service divisions'}:table==='page_content'?{published:true,updated_at:'2026-09-23T00:00:00Z',title:'OLD HERO',seo_description:'Old social share'}:{};return{select(){return this},eq(){return this},or(){return this},order(){return this},limit(){return this},maybeSingle:async()=>({data})}}}}};`}));
  const cp=await cms.newPage();
  await check('Old CMS rows cannot overwrite the new headline, division count or metadata',async()=>{
   await cp.goto(base+'/',{waitUntil:'networkidle'});
   assert.equal(await cp.locator('main h1').innerText(),'CAD drawings, custom parts & machine support.');
   assert.equal(await cp.locator('.cg-capability-card').count(),4);
   assert.doesNotMatch(await cp.locator('body').innerText(),/OLD AUTOMATION CLAIM|5 Service divisions/);
   assert.notEqual(await cp.locator('meta[name="description"]').getAttribute('content'),'Old social share');
  });
  await cms.close();
  const admin=await readOnlyContext(browser);await admin.route('https://**/*',r=>r.abort());
  await admin.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({contentType:'application/javascript',body:`window.supabase={createClient(){return {auth:{onAuthStateChange(fn){window.testAuthEvent=fn},getSession:async()=>({data:{session:{}}}),getUser:async()=>({data:{user:{id:'local-validation'}}}),signOut:async()=>{window.testAuthEvent('SIGNED_OUT')}},rpc:async()=>({data:[]}),from(table){return {select(){return this},eq(){return this},order(){return this},limit(){return this},maybeSingle:async()=>({data:{is_active:true,display_name:'Local validation'}}),then(resolve){resolve({data:[],count:0})}}}}}};`}));
  const ap=await admin.newPage();
  await check('Admin workspace clears and becomes inaccessible when its session signs out',async()=>{
   await ap.goto(base+'/admin/',{waitUntil:'networkidle'});assert.ok(await ap.locator('#admin-app').isVisible(),await ap.locator('#login-status').innerText());
   await ap.evaluate(()=>window.testAuthEvent('SIGNED_OUT'));
   assert.ok(await ap.locator('#admin-app').isHidden());assert.equal(await ap.locator('#admin-app').evaluate(e=>e.inert),true);
   assert.equal(await ap.locator('#content').innerText(),'');assert.ok(await ap.locator('#login-shell').isVisible());
  });
  await admin.close();
  console.log('RELEASE7|'+JSON.stringify({passed,productionWrites:0}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
