const { chromium } = require('playwright');
const { readOnlyContext } = require('./browser-test-helpers.cjs');
const SITE = process.env.SITE_BASE || 'http://127.0.0.1:8765';
const PAGE = '/laser-welding-kolkata.html';
const hero='/assets/images/process-drawing-v23.webp';
const gallery=[
 '/assets/images/process-drawing-v23.webp',
 '/assets/images/process-cad-v23.webp',
 '/assets/images/process-cad-v23b.webp'
];
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const context=await readOnlyContext(browser);
  const errors=[];
  for (const [size, width, height] of [['desktop',1440,900],['mobile',390,844]]) {
    const page=await context.newPage();
    await page.setViewportSize({width,height});
    const failed=[];
    page.on('response', r=>{if(r.request().resourceType()==='image'&&r.status()>=400)failed.push(r.url()+' '+r.status());});
    try {
      const response=await page.goto(SITE+PAGE,{waitUntil:'domcontentloaded',timeout:35000});
      if(response?.status()!==200)errors.push(size+': page status '+response?.status());
      await page.evaluate(()=>{document.querySelectorAll('img[loading="lazy"]').forEach(im=>im.loading='eager')});
      await page.evaluate(async()=>{await Promise.race([
        Promise.allSettled(Array.from(document.images,im=>im.decode())),
        new Promise(r=>setTimeout(r,10000))
      ]);});
      const data=await page.evaluate(()=>{
        const main=document.querySelector('main'), heroEl=document.querySelector('.service-hero.cg-image-backed-hero');
        const pics=[...document.querySelectorAll('.cg-service-gallery img')];
        return {
          title:main?.querySelector('h1')?.textContent.trim(),
          heroBg:getComputedStyle(heroEl).backgroundImage,
          heroHeight:Math.round(heroEl.getBoundingClientRect().height),
          headings:[...main.querySelectorAll('h1,h2')].map(x=>x.textContent.trim()).slice(0,8),
          gallery:pics.map(im=>({src:new URL(im.currentSrc||im.src).pathname,loaded:im.complete&&im.naturalWidth>0,alt:im.alt})),
          galleryNote:document.querySelector('.cg-service-visual-story .section-head > p')?.textContent||'',
          overflow:document.documentElement.scrollWidth>window.innerWidth+4,
          oldGalleryImages:[...document.querySelectorAll('img[src="/assets/images/laser.webp"],img[src="/assets/images/process-make-v23.webp"],img[src="/assets/images/am-approved-laser.webp"]')].length
        };
      });
      if(!data.heroBg.includes(hero))errors.push(size+': wrong hero background '+data.heroBg.slice(0,140));
      if(data.heroBg.includes('am-approved-laser.webp'))errors.push(size+': old laser-cutting background remains');
      if(data.gallery.length!==gallery.length)errors.push(size+': gallery image count '+data.gallery.length);
      for(let i=0;i<gallery.length;i++)if(data.gallery[i]?.src!==gallery[i]||!data.gallery[i]?.loaded)errors.push(size+': unavailable/wrong gallery '+JSON.stringify(data.gallery[i]));
      if(data.oldGalleryImages)errors.push(size+': old cutting images remain');
      if(!data.galleryNote.includes('Representative engineering-review imagery'))errors.push(size+': missing representative-image disclosure');
      if(data.overflow)errors.push(size+': horizontal overflow');
      if(failed.length)errors.push(size+': broken assets '+failed.join(';'));
      if(data.heroHeight<180)errors.push(size+': hero collapsed');
      console.log('WELDING_MEDIA|'+JSON.stringify({viewport:size,heroOK:data.heroBg.includes(hero),gallery:data.gallery.map(x=>({src:x.src,loaded:x.loaded})),disclosed:data.galleryNote.includes('Representative engineering-review imagery'),horizontalOverflow:data.overflow,failures:errors.length}));
    }catch(err){errors.push(size+': '+String(err).slice(0,350));}
    finally{await page.close();}
  }
  await browser.close();
  for(const err of errors)console.error('WELDING_ERROR|'+err);
  if(errors.length)process.exitCode=1;
  else console.log('WELDING_CHECK|PASS');
})().catch(e=>{console.error('WELDING_FATAL|'+String(e));process.exitCode=2});
