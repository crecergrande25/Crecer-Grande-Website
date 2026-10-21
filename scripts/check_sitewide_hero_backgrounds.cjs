const { chromium } = require('playwright');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const base=process.env.SITE_BASE || 'http://127.0.0.1:8765';
const mobile=process.env.HERO_VIEWPORT==='mobile';
const paths=[];
function walk(dir){
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  if(item.name.startsWith('.')||['assets','scripts','node_modules','admin'].includes(item.name))continue;
  const p=path.join(dir,item.name);
  if(item.isDirectory())walk(p);
  else if(p.endsWith('.html')){
   const html=fs.readFileSync(p,'utf8');
   if(/<meta\b[^>]*http-equiv=["']refresh/i.test(html))continue;
   paths.push('/'+path.relative(root,p).replace(/\\/g,'/'));
  }
 }
}
walk(root);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,deviceScaleFactor:1});
 const errors=[],seenBg=new Map(),results=[];
 for(const route of paths.sort()){
  const page=await context.newPage();
  const networkErrors=[];
  page.on('response',res=>{if(res.request().resourceType()==='image'&&res.status()>=400)networkErrors.push(res.url()+' '+res.status())});
  try{
   const res=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:35000});
   if(!res||res.status()>=400){errors.push({route,issue:'page HTTP '+res?.status()});continue;}
   await page.waitForTimeout(500);
   const state=await page.evaluate(()=>{
    const hero=document.querySelector('main section.cg-image-backed-hero');
    if(!hero)return null;
    const cs=getComputedStyle(hero);
    const text=hero.querySelector('h1');
    const cards=[...hero.querySelectorAll('.pr-hero-media,.service-visual,.design-hero-visual,.print3d-visual,.ed5-hero-visual,.ins5-hero-visual,.mm5-visual,.tv4-contact-visual,.am3-hero-media,.insight-hero-grid > img')];
    const bgImage=cs.backgroundImage;
    const matches=[...bgImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(x=>new URL(x[1],document.baseURI).pathname);
    return {width:hero.getBoundingClientRect().width,windowWidth:window.innerWidth,
      title:text?.innerText?.slice(0,80)||'',
      bgImage:bgImage.slice(0,240),images:matches,
      h1Visible:!!text&&text.getClientRects().length>0,
      h1Color:text?getComputedStyle(text).color:null,
      cardTotal:cards.length,cardVisible:cards.filter(x=>x.getClientRects().length>0).length,
      computedBgSize:cs.backgroundSize,
      pageOverflow:document.documentElement.scrollWidth>window.innerWidth+5
    };
   });
   if(!state){errors.push({route,issue:'no hero class'});continue}
   const image=state.images[0];
   if(!image){errors.push({route,issue:'no effective background image',state});continue}
   if(seenBg.has(image))errors.push({route,issue:'reused hero background from '+seenBg.get(image),image});
   else seenBg.set(image,route);
   if(!state.h1Visible||!state.width||state.width<state.windowWidth*.92)
      errors.push({route,issue:'hero not visible/full width',state});
   if(state.cardVisible)errors.push({route,issue:'duplicated standalone hero image panel still visible',state});
   if(!/rgb\(255, 255, 255\)/.test(state.h1Color||''))
      errors.push({route,issue:'headline not white',color:state.h1Color});
   if(networkErrors.length)errors.push({route,issue:'broken images',networkErrors});
   if(state.pageOverflow && !mobile)errors.push({route,issue:'desktop horizontal overflow'});
   results.push({route,img:image,width:state.width,viewport:state.windowWidth,title:state.title});
  }catch(e){errors.push({route,issue:String(e).slice(0,240)})}
  finally{await page.close();}
 }
 await browser.close();
 console.log('HERO_VERIFY|'+JSON.stringify({viewport:mobile?'mobile':'desktop',pages:paths.length,checked:results.length,uniqueBackgrounds:seenBg.size,errors:errors.length}));
 for(const x of results)console.log('HERO_OK|'+JSON.stringify(x));
 for(const x of errors)console.log('HERO_ERROR|'+JSON.stringify(x));
 if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=2});
