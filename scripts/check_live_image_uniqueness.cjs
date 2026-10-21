/**
 * Fail when any content image (including matching visual copies with another
 * filename) is displayed more than once anywhere across the public site.
 * Icons in head metadata / favicons are intentionally not page content.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const base = process.env.SITE_BASE || 'http://127.0.0.1:8765';
const mobile = process.env.AUDIT_VIEWPORT === 'mobile';
const manifest = JSON.parse(fs.readFileSync(path.join(root,'scripts/unique_image_placements.json'),'utf8'));
const groups=manifest.pixelGroups || {};
// Branding and functional app icons are intentionally reusable across pages.
const REUSABLE_BRANDING = new Set([
  '/assets/images/Logo-R01.png',
  '/assets/images/logo.png',
  '/assets/images/logo-icon.png',
  '/assets/images/favicon.png',
  '/assets/images/apple-touch-icon.png'
]);
const pages=['/'];
const excluded = new Set();
function walk(dir) {
  for (const item of fs.readdirSync(dir,{withFileTypes:true})) {
    if(item.name.startsWith('.') || ['assets','scripts','node_modules'].includes(item.name))continue;
    const p=path.join(dir,item.name);
    if(item.isDirectory())walk(p);
    else if(p.endsWith('.html'))pages.push('/'+path.relative(root,p).replace(/\\/g,'/'));
  }
}
walk(root);
async function main(){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile});
  const seen=new Map(), pageSet=new Set(), duplicate=[], broken=[];
  let inspected=0,images=0,backgrounds=0;
  for(const route of pages){
    if(excluded.has(route))continue;
    const page=await context.newPage();
    try{
      const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
      if(!response||response.status()>=400){broken.push({route,http:response?.status()});continue}
      await page.waitForTimeout(350);
      const canonical=new URL(page.url()).pathname.replace(/\/index\.html$/,'/') || '/';
      if(pageSet.has(canonical))continue;
      pageSet.add(canonical);
      await page.evaluate(()=>{document.querySelectorAll('img[loading="lazy"]').forEach(im=>im.loading='eager')});
      // Live sites may load SVG images slower than the 350ms local-test delay.
      // Decode all images before judging naturalWidth, but keep a bounded timeout.
      await page.evaluate(async()=>{
        await Promise.race([
          Promise.allSettled(Array.from(document.images, img => img.decode())),
          new Promise(resolve=>setTimeout(resolve, 12000))
        ]);
      });
      const snap=await page.evaluate(()=>{
        const urls=[];
        const take=(url,role)=>{
          if(!url)return;
          try{
            const u=new URL(url,document.baseURI);
            if(!u.pathname.startsWith('/assets/images/'))return;
            urls.push({url:u.pathname,role});
          }catch{}
        };
        for(const el of document.querySelectorAll('img')){
          // A picture moved to the hero's CSS background is hidden on purpose;
          // count what is actually displayed, not a hidden HTML fallback image.
          if(!el.getClientRects().length)continue;
          if(el.src && el.naturalWidth===0)urls.push({url:el.getAttribute('src'),role:'BROKEN'});
          else take(el.currentSrc||el.src,'img');
        }
        function styleURLs(style){
          if(!style)return;
          for(const property of ['backgroundImage','maskImage','borderImageSource','content']){
            const s=String(style[property]||'');
            for(const m of s.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g))take(m[1],property);
          }
        }
        for(const el of document.querySelectorAll('*')){
          styleURLs(getComputedStyle(el));
          if(el.matches('body,main,header,footer,section,div,a,figure,article,button')) {
            styleURLs(getComputedStyle(el,'::before'));styleURLs(getComputedStyle(el,'::after'))
          }
        }
        return urls;
      });
      inspected++;
      for(const info of snap){
        const key=info.url.startsWith('/')? info.url:'/'+info.url;
        if(info.role==='BROKEN'){broken.push({route,image:key});continue}
        if(REUSABLE_BRANDING.has(key))continue;
        const id=groups[key]===undefined?key:String(groups[key]);
        const entry={route,image:key,role:info.role};
        if(seen.has(id))duplicate.push({first:seen.get(id),repeat:entry,group:id});
        else seen.set(id,entry);
        if(info.role==='img')images++;else backgrounds++;
      }
    }catch(e){broken.push({route,error:String(e).slice(0,210)})}
    finally{await page.close()}
  }
  await browser.close();
  console.log('UNIQUENESS|'+JSON.stringify({viewport:mobile?'mobile':'desktop',pages:inspected,uniqueVisuals:seen.size,renderedImages:images,backgrounds,duplicates:duplicate.length,errors:broken.length}));
  for(const d of duplicate.slice(0,100))console.log('DUPLICATE|'+JSON.stringify(d));
  for(const d of broken.slice(0,100))console.log('ERROR|'+JSON.stringify(d));
  if(duplicate.length||broken.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=2});
