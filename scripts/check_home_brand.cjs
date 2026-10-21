const { chromium } = require('playwright');
const { readOnlyContext } = require('./browser-test-helpers.cjs');
const origin = process.env.SITE_BASE || 'http://127.0.0.1:8765';

(async () => {
  const browser = await chromium.launch({ headless:true, args:['--no-sandbox'] });
  const context = await readOnlyContext(browser);
  const tests=[
    {name:'desktop',width:1440,height:900,minHeadlinePx:44,maxHeadlinePx:56},
    {name:'laptop',width:992,height:820,minHeadlinePx:36,maxHeadlinePx:48},
    {name:'tablet',width:820,height:950,minHeadlinePx:30,maxHeadlinePx:56},
    {name:'mobile',width:390,height:844,minHeadlinePx:32,maxHeadlinePx:48}
  ];
  const failures=[];
  for (const t of tests){
    const page=await context.newPage();
    await page.setViewportSize({width:t.width,height:t.height});
    try {
      await page.goto(origin+'/', {waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>!!link.sheet),null,{timeout:10000});
      const state=await page.evaluate(async()=>{
        await Promise.allSettled([...document.querySelectorAll('.site-header img, .cg-footer-logo-link img')].map(im=>im.decode()));
        const h=document.querySelector('.cg-pr-home .pr-hero-copy h1');
        const header=document.querySelector('.site-header .brand img');
        const footer=document.querySelector('.cg-footer-logo-link img');
        const col=document.querySelector('.pr-hero-copy');
        return {
          px:parseFloat(getComputedStyle(h).fontSize),
          text:h.innerText.replace(/\s+/g,' ').trim(),
          brandHeader:header?.getAttribute('src'),
          brandFooter:footer?.getAttribute('src'),
          headerPixels:header?.naturalWidth,
          footerPixels:footer?.naturalWidth,
          headerBackground:getComputedStyle(header.closest('a')).backgroundColor,
          headerPadding:getComputedStyle(header.closest('a')).padding,
          logoCornerAlpha:(()=>{
            try{
              const c=document.createElement('canvas');c.width=1;c.height=1;
              const ctx=c.getContext('2d',{willReadFrequently:true});
              ctx.drawImage(header,0,0,1,1,0,0,1,1);
              return ctx.getImageData(0,0,1,1).data[3];
            }catch(e){return -1;}
          })(),
          headlineWidth:Math.round(h.getBoundingClientRect().width),
          copyWidth:Math.round(col.getBoundingClientRect().width),
          hasHorizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+3
        };
      });
      const okay=state.px>=t.minHeadlinePx && state.px<=t.maxHeadlinePx && state.brandHeader==='/assets/images/Logo-R01.png'
        && state.brandFooter==='/assets/images/Logo-R01.png'
        && state.headerPixels>0 && state.footerPixels>0
        && ['rgba(0, 0, 0, 0)','transparent'].includes(state.headerBackground)
        && state.headerPadding==='0px'
        && state.logoCornerAlpha===0
        && (!['laptop','tablet'].includes(t.name) || (state.copyWidth>=300 && !state.hasHorizontalOverflow));
      console.log('HOME_BRAND|'+JSON.stringify({viewport:t.name,okay,...state}));
      if(!okay)failures.push({viewport:t.name,state});
      if(t.name==='desktop'){
        const other=await context.newPage();
        await other.setViewportSize({width:1280,height:800});
        await other.goto(origin+'/services.html',{waitUntil:'domcontentloaded',timeout:30000});
        await other.waitForTimeout(900);
        const shared=await other.evaluate(()=>{
          const header=document.querySelector('.site-header .brand img'), footer=document.querySelector('.cg-footer-logo-link img');
          return {header:header?.getAttribute('src'),footer:footer?.getAttribute('src')};
        });
        console.log('SHARED_BRAND|'+JSON.stringify(shared));
        if(shared.header!=='/assets/images/Logo-R01.png'||shared.footer!=='/assets/images/Logo-R01.png')
          failures.push({viewport:'shared-header-footer',shared});
        await other.close();
      }
    } catch(e) { failures.push({viewport:t.name,error:String(e)});console.error('FAIL|'+t.name+'|'+String(e)); }
    finally {await page.close();}
  }
  await browser.close();
  if(failures.length){console.error('FAILURES|'+JSON.stringify(failures));process.exitCode=1}
  else console.log('RESULT|PASS all homepage headline sizes and authentic logo placements');
})().catch(e=>{console.error(e);process.exitCode=1;});
