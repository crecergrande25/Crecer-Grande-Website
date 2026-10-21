const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { readOnlyContext } = require('./browser-test-helpers.cjs');
const base = process.env.SITE_BASE || 'http://127.0.0.1:8765';
const reference = '12345678-1234-4234-8234-123456789abc';
(async () => {
  const browser = await chromium.launch({ headless:true, args:['--no-sandbox'] });
  const context = await readOnlyContext(browser, { viewport:{width:390,height:844}, reducedMotion:'reduce' });
  const page = await context.newPage();
  const errors = [], results = [];
  page.on('pageerror', error => errors.push(error.message));
  const go = async route => {
    await page.goto(base + route, { waitUntil:'domcontentloaded' });
    await page.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].every(link => !!link.sheet));
  };
  const check = async (name, work) => {
    try { await work(); results.push({name,pass:true}); console.log('PASS ' + name); }
    catch(error) { results.push({name,pass:false,error:error.message}); console.error('FAIL ' + name + ': ' + error.message); }
  };
  const fillQuote = async () => {
    await page.locator('[name="name"]').fill('Local browser validation');
    await page.locator('[name="email"]').fill('validation@example.invalid');
    await page.locator('[name="message"]').fill('A controlled local test, never sent to production.');
    await page.locator('[name="consent"]').check();
  };
  try {
    await check('Mobile menu opens, closes with Escape and restores focus', async () => {
      await go('/');
      await page.locator('.menu-btn').click();
      assert.equal(await page.locator('.menu-btn').getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.menu-btn').getAttribute('aria-expanded'),'false');
      assert.ok(await page.locator('.menu-btn').evaluate(element => element === document.activeElement));
      await page.locator('.menu-btn').click();
      await page.locator('.nav a[href="/services.html"]').click();
      assert.equal(new URL(page.url()).pathname,'/services.html');
    });
    await check('Homepage search finds laser services and supports no-match fallback', async () => {
      await go('/');
      await page.locator('#cg-global-search').fill('laser cutting');
      await page.locator('#cg-search-results a[href="/laser-cutting-kolkata.html"]').waitFor();
      await page.locator('#cg-global-search').fill('zzunknownwidgetzz');
      assert.match(await page.locator('#cg-search-results').innerText(),/No exact match/);
      assert.ok((await page.locator('#cg-search-results a').last().getAttribute('href')).includes('zzunknownwidgetzz'));
      await page.locator('#cg-global-search').press('Escape');
      assert.ok(await page.locator('#cg-search-results').isHidden());
    });
    await check('Engineering Desk renders five working routes and preserves deep links', async () => {
      await go('/engineering-desk.html?route=quality');
      assert.equal(await page.locator('#engineering-routes button').count(),5);
      assert.equal(await page.locator('[data-route="quality"]').getAttribute('aria-pressed'),'true');
      await page.locator('[data-route="machine"]').click();
      assert.match(await page.locator('#engineering-route-detail').innerText(),/Troubleshoot or restore/);
      assert.equal(new URL(page.url()).searchParams.get('route'),'machine');
      assert.ok((await page.locator('#engineering-route-detail a').getAttribute('href')).startsWith('/request-quote.html?'));
    });
    for (const [route,category] of [['/projects.html','engineering'],['/insights.html','quality']]) {
      await check(route + ' category, search and empty state work together', async () => {
        await go(route);
        const all = await page.locator('[data-filter-item]:visible').count();
        await page.locator(`[data-filter="${category}"]`).click();
        const filtered = await page.locator('[data-filter-item]:visible').count();
        assert.ok(filtered > 0 && filtered < all);
        await page.locator('[data-content-search]').fill('zznoresultzz');
        assert.equal(await page.locator('[data-filter-item]:visible').count(),0);
        assert.ok(await page.locator('[data-filter-empty]').isVisible());
        await page.locator('[data-content-search]').fill('');
        await page.locator('[data-filter="all"]').click();
        assert.equal(await page.locator('[data-filter-item]:visible').count(),all);
      });
    }
    await check('Material advisor updates recommendations and passes material to RFQ', async () => {
      await go('/3d-printing-kolkata.html');
      await page.locator('[data-advisor-result] .mini').first().waitFor();
      await page.locator('[data-usecase="flexible"]').click();
      assert.match(await page.locator('[data-advisor-result]').innerText(),/TPU/);
      const link = page.locator('[data-advisor-result] .mini').filter({hasText:'TPU'}).locator('a').first();
      const expected = new URL(await link.getAttribute('href'),base).searchParams.get('requirement');
      await link.click(); await page.waitForLoadState('domcontentloaded');
      assert.equal(await page.locator('[name="requirement_type"]').inputValue(),expected);
    });
    await check('Weight calculation renders correct result and carries it to enquiry', async () => {
      await go('/estimate.html');
      const form = page.locator('[data-calculator="sheet"]');
      for (const [name,value] of Object.entries({length:100,width:100,thickness:1,quantity:1})) await form.locator(`[name="${name}"]`).fill(String(value));
      await form.locator('button').click();
      assert.match(await form.locator('[data-calculator-result]').innerText(),/0\.0785 kg per piece/);
      assert.ok((await form.locator('[data-calculator-rfq]').getAttribute('href')).includes('message='));
      await form.locator('[name="length"]').fill('200');
      assert.ok(await form.locator('[data-calculator-rfq]').isHidden());
    });
    await check('Invalid pipe geometry is rejected and temperature conversion supports negatives', async () => {
      await go('/estimate.html');
      const pipe = page.locator('[data-calculator="pipe"]');
      await pipe.locator('[name="wall_thickness"]').fill('30');
      await pipe.locator('button').click();
      assert.match(await pipe.locator('[data-calculator-result]').innerText(),/less than half/);
      const converter = page.locator('[data-calculator="convert"]');
      await converter.locator('[name="conversion"]').selectOption('c-f');
      await converter.locator('[name="value"]').fill('-40');
      await converter.locator('button').click();
      assert.match(await converter.locator('[data-calculator-result]').innerText(),/-40 °F/);
    });
    await check('Currency success and service failure are represented accurately', async () => {
      await page.route('https://api.frankfurter.dev/**', route => route.fulfill({status:200,json:{rate:83.2,date:'2026-10-20'}}));
      await go('/estimate.html');
      const form = page.locator('[data-calculator="currency"]');
      await form.locator('button').click();
      await page.waitForFunction(() => document.querySelector('[data-calculator="currency"] [data-calculator-result]').textContent.includes('8,320'));
      await page.unroute('https://api.frankfurter.dev/**');
      await page.route('https://api.frankfurter.dev/**', route => route.fulfill({status:503,json:{}}));
      await form.locator('button').click();
      await page.waitForFunction(() => document.querySelector('[data-calculator="currency"] [data-calculator-result]').classList.contains('error'));
      assert.match(await form.locator('[data-calculator-result]').innerText(),/No estimated rate has been substituted/);
      assert.ok(await form.locator('button').isEnabled());
      await page.unroute('https://api.frankfurter.dev/**');
    });
    await check('Contact requires a reply method before any submission', async () => {
      await go('/contact.html');
      await page.locator('[name="name"]').fill('Local validation');
      await page.locator('[name="message"]').fill('Local validation only');
      await page.locator('[name="consent"]').check();
      await page.locator('#rfq-form button[type="submit"]').click();
      assert.match(await page.locator('#rfq-status').innerText(),/Please provide a phone number or email address/);
    });
    await check('RFQ rejects unsupported attachments before network submission', async () => {
      await go('/request-quote.html?requirement=Laser%20Cutting');
      await fillQuote();
      await page.locator('[name="reference_file"]').setInputFiles({name:'bad.exe',mimeType:'application/octet-stream',buffer:Buffer.from('test')});
      await page.locator('#rfq-form button[type="submit"]').click();
      assert.match(await page.locator('#rfq-status').innerText(),/Unsupported file type: bad.exe/);
    });
    await check('Confirmed RFQ prevents duplicate submission and supports starting again', async () => {
      let submissions = 0;
      await page.route('**/rest/v1/rpc/submit_enquiry', route => { submissions++; return route.fulfill({status:200,json:{ok:true,enquiry_id:reference}}); });
      await go('/request-quote.html?requirement=Laser%20Cutting'); await fillQuote();
      await page.locator('#rfq-form button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#rfq-status').textContent.includes('Requirement recorded'));
      assert.match(await page.locator('#rfq-status').innerText(),/12345678/);
      assert.ok(await page.locator('#rfq-form button[type="submit"]').isDisabled());
      await page.locator('#rfq-form').dispatchEvent('submit');
      assert.equal(submissions,1);
      await page.getByRole('button',{name:'Start another enquiry'}).click();
      assert.ok(await page.locator('#rfq-form button[type="submit"]').isEnabled());
      assert.equal(await page.locator('[name="name"]').inputValue(),'');
      await page.unroute('**/rest/v1/rpc/submit_enquiry');
    });
    await check('RFQ service failure offers direct contact without false confirmation', async () => {
      await page.route('**/rest/v1/rpc/submit_enquiry', route => route.fulfill({status:503,json:{message:'Controlled service failure'}}));
      await go('/request-quote.html?requirement=Laser%20Cutting'); await fillQuote();
      await page.locator('#rfq-form button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#rfq-status').textContent.includes('could not confirm'));
      assert.equal(await page.locator('#rfq-status a[href^="mailto:"]').count(),1);
      assert.ok(await page.locator('#rfq-form button[type="submit"]').isEnabled());
      await page.unroute('**/rest/v1/rpc/submit_enquiry');
    });
    await check('Malformed service response is not presented as a confirmed enquiry', async () => {
      await page.route('**/rest/v1/rpc/submit_enquiry', route => route.fulfill({status:200,json:{ok:true}}));
      await go('/request-quote.html?requirement=Laser%20Cutting'); await fillQuote();
      await page.locator('#rfq-form button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#rfq-status').textContent.includes('could not confirm'));
      assert.equal(await page.getByRole('button',{name:'Start another enquiry'}).count(),0);
      await page.unroute('**/rest/v1/rpc/submit_enquiry');
    });
    await check('Saved RFQ with failed upload warns about missing files without duplication', async () => {
      await page.route('**/rest/v1/rpc/submit_enquiry', route => route.fulfill({status:200,json:{ok:true,enquiry_id:reference}}));
      await page.route('**/storage/v1/object/**', route => route.fulfill({status:503,json:{message:'Controlled upload failure'}}));
      await go('/request-quote.html?requirement=Laser%20Cutting'); await fillQuote();
      await page.locator('[name="reference_file"]').setInputFiles({name:'drawing.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 local test')});
      await page.locator('#rfq-form button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#rfq-status').textContent.includes('Some reference files may not have been attached'));
      assert.match(await page.locator('#rfq-status').innerText(),/0 of 1 uploaded/);
      assert.ok(await page.locator('#rfq-form button[type="submit"]').isDisabled());
      await page.unroute('**/rest/v1/rpc/submit_enquiry');
      await page.unroute('**/storage/v1/object/**');
    });
    await check('Feedback wizard limits selections and shows save failure for retry', async () => {
      await page.route('**/rest/v1/website_feedback*', route => route.fulfill({status:503,json:{message:'Controlled save failure'}}));
      await go('/feedback.html');
      await page.locator('[name="overall_rating"][value="4"]').locator('..').click();
      await page.locator('.fb-step[data-step="2"]').waitFor({state:'visible'});
      const words = page.locator('[name="experience_words"]');
      for(let i=0;i<3;i++) await words.nth(i).locator('..').click();
      assert.ok(await words.nth(3).isDisabled());
      await page.locator('.fb-step.active [data-next]').click();
      await page.locator('.fb-step.active [data-next]').click();
      await page.locator('[name="recommend_score"][value="8"]').locator('..').click();
      await page.locator('.fb-step[data-step="5"]').waitFor({state:'visible'});
      await page.locator('#feedback-form button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#feedback-status').textContent.includes('could not save'));
      assert.ok(await page.locator('#feedback-form button[type="submit"]').isEnabled());
      await page.unroute('**/rest/v1/website_feedback*');
    });
    await check('Botcha opens and answers from local guidance when service is unavailable', async () => {
      await go('/');
      await page.locator('.cg-botcha-launcher').click();
      await page.locator('.cg-botcha-input').fill('I have a machine breakdown');
      await page.locator('.cg-botcha-send').click();
      await page.waitForFunction(() => document.querySelector('.cg-botcha-messages').textContent.includes('exact alarm or symptom'));
      assert.ok(await page.locator('.cg-botcha-input').isEnabled());
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.cg-botcha-launcher').getAttribute('aria-expanded'),'false');
    });
    await check('Admin login loads without exposing an authenticated workspace', async () => {
      await go('/admin/');
      assert.ok(await page.locator('#login-shell').isVisible());
      assert.ok(await page.locator('#login-password').evaluate(element => element.required));
      assert.ok(!(await page.locator('#admin-app').getAttribute('class')).includes('open'));
      assert.ok(await page.evaluate(() => !!window.supabase && !!window.CG_CONFIG?.supabasePublishableKey));
    });
    await check('Password reset rejects a mismatch and explains missing recovery access', async () => {
      await go('/admin/reset-password.html');
      await page.locator('#p1').fill('LocalExample123!');
      await page.locator('#p2').fill('DifferentExample123!');
      await page.locator('#reset button[type="submit"]').click();
      assert.match(await page.locator('#reset-status').innerText(),/Passwords do not match/);
      await page.locator('#p2').fill('LocalExample123!');
      await page.locator('#reset button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#reset-status').textContent.includes('missing or has expired'));
      assert.ok(await page.locator('#reset button[type="submit"]').isEnabled());
    });
    await check('Key pages reflow at 320px without horizontal scrolling', async () => {
      await page.setViewportSize({width:320,height:800});
      for(const route of ['/','/engineering-desk.html','/estimate.html','/request-quote.html']) {
        await go(route);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 3), route);
      }
    });
    await check('No uncaught JavaScript errors occurred during the flows', async () => assert.deepEqual(errors,[]));
  } finally { await browser.close(); }
  const failed=results.filter(result=>!result.pass);
  console.log('FUNCTIONAL|' + JSON.stringify({tests:results.length,passed:results.length-failed.length,failed:failed.length,productionWrites:0}));
  if(failed.length)process.exitCode=1;
})().catch(error => { console.error(error); process.exitCode=1; });
