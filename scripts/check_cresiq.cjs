const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('fs');
(async()=>{const browser=await chromium.launch({headless:true});const results=[];try{
for(const width of [1440,390,320]){
 const context=await browser.newContext({viewport:{width,height:900}});await context.route('https://**/*',r=>r.abort());const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/');await p.waitForSelector('[data-botcha-root][data-ready="1"]');
 const state=await p.locator('.cg-footer').evaluate(e=>({logo:e.querySelector('.cg-original-brand-logo').getBoundingClientRect().width,bottom:e.querySelector('.cg-footer-bottom').innerText,overflow:document.documentElement.scrollWidth>innerWidth+2,background:getComputedStyle(e).backgroundImage}));
 assert.ok(state.logo>=240);assert.match(state.bottom,/GSTIN: 19BBJPB4158H1ZM/);assert.ok(!state.bottom.includes('Kolkata'));assert.ok(!state.overflow);assert.match(state.background,/03-manufacturing/);
 await p.locator('.cg-footer').scrollIntoViewIfNeeded();await p.locator('.cg-footer').evaluate(async e=>{await Promise.all([...e.querySelectorAll('img')].map(im=>im.decode()))});await p.screenshot({path:`/workspace/website-audit-v15/footer-${width}.png`});
 await p.locator('.cg-botcha-launcher').click();
 async function ask(q){await p.locator('.cg-botcha-input').fill(q);await p.locator('.cg-botcha-send').click();return await p.locator('.cg-botcha-message.is-bot').last().innerText()}
 assert.match(await ask('STEP vs STL for 3D printing'),/STEP|STL/);
 assert.match(await ask('What about its cost?'),/earlier requirement.*STEP/s);
 assert.match(await ask('What is the weather tomorrow?'),/don’t have a reliable answer/);
 assert.match(await ask('Can you provide automation?'),/not currently listed/);
 assert.match(await ask('What services do you offer?'),/laser cutting/);
 await p.screenshot({path:`/workspace/website-audit-v15/cresiq-${width}.png`});
 await p.reload();await p.locator('.cg-botcha-launcher').click();assert.ok(await p.locator('.cg-botcha-message.is-user').count()>0);
 await p.locator('.cg-botcha-reset').click();assert.equal(await p.locator('.cg-botcha-message.is-user').count(),0);
 await p.keyboard.press('Escape');assert.equal(await p.locator('.cg-botcha-launcher').getAttribute('aria-expanded'),'false');
 assert.deepEqual(errors,[]);results.push({width,...state,conversation:'passed'});await context.close();
}
 console.log(JSON.stringify(results,null,2));fs.writeFileSync('/workspace/website-audit-v15/results.json',JSON.stringify(results,null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
