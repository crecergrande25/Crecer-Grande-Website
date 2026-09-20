
document.addEventListener('DOMContentLoaded',async()=>{
 const root=document.querySelector('[data-laser-catalog]'); if(!root)return;
 const family=root.dataset.laserCatalog||''; const input=document.getElementById('lz-search'),cat=document.getElementById('lz-category'),grid=document.getElementById('lz-catalog-grid'),count=document.getElementById('lz-count');
 let data={products:[]}; try{data=await (await fetch('/assets/data/laser-ecosystem.json')).json()}catch(_){return}
 let rows=(data.products||[]).filter(x=>x.family===family);
 const cats=[...new Set(rows.map(x=>x.category).filter(Boolean))].sort();
 if(cat)cat.innerHTML='<option value="">All types</option>'+cats.map(x=>`<option>${x}</option>`).join('');
 const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const norm=v=>String(v??'').toLowerCase().replace(/[×x]/g,' x ').replace(/[øØ]/g,' dia ').replace(/[^a-z0-9.+&/-]+/g,' ').replace(/\s+/g,' ').trim();
 const spriteKey=x=>{
   const family=norm(x.family||'');
   const text=norm([x.name,x.description,x.category,x.family,x.model,(x.keywords||[]).join(' ')].filter(Boolean).join(' '));

   if(family==='chiller-spares'||text.includes('chiller')){
     if(text.includes('circulation pump')||text.includes('chiller pump')||text.includes('water pump'))return 'sprite-chiller-part-pump';
     if(text.includes('flow sensor')||text.includes('flow switch'))return 'sprite-chiller-part-flow';
     if(text.includes('temperature sensor')||text.includes('thermistor')||text.includes('pt100')||text.includes('ntc'))return 'sprite-chiller-part-temp';
     if(text.includes('level sensor')||text.includes('float switch')||text.includes('water level'))return 'sprite-chiller-part-level';
     if(text.includes('filter')||text.includes('strainer'))return 'sprite-chiller-part-filter';
     if(text.includes('fan'))return 'sprite-chiller-part-fan';
     if(text.includes('compressor')||text.includes('refrigeration'))return 'sprite-chiller-part-compressor';
     if(text.includes('plate heat exchanger'))return 'sprite-chiller-part-plateheatx';
     if(text.includes('condenser')||text.includes('evaporator')||text.includes('heat exchanger')||text.includes('coil'))return 'sprite-chiller-part-heatx';
     if(text.includes('controller')||text.includes('display')||text.includes('control board')||text.includes('pcb'))return 'sprite-chiller-part-controller';
     if(text.includes('relay')||text.includes('contactor')||text.includes('capacitor')||text.includes('breaker')||text.includes('electrical'))return 'sprite-chiller-part-electrical';
     if(text.includes('solenoid')||text.includes('expansion valve')||text.includes('service valve')||text.includes(' valve'))return 'sprite-chiller-part-valve';
     if(text.includes('hose')||text.includes('fitting')||text.includes('quick connector')||text.includes('water pipe'))return 'sprite-chiller-part-hose';
     if(text.includes('coolant')||text.includes('deionized')||text.includes('distilled')||text.includes('antifreeze')||text.includes('additive')||text.includes('water quality'))return 'sprite-chiller-part-coolant';
     if(text.includes('pressure sensor')||text.includes('pressure transducer'))return 'sprite-chiller-part-pressure';
   }

   if(text.includes('qbh')||text.includes('qcs')||text.includes('fiber interface')||text.includes('fiber connector'))return 'sprite-qbh';
   if(text.includes('seal')||text.includes('o ring')||text.includes('o-ring')||text.includes('gasket'))return 'sprite-seal';
   if(text.includes('lens drawer')||text.includes('lens cartridge')||text.includes('drawer assembly'))return 'sprite-lens-drawer';
   if(text.includes('collimation')||text.includes('collimator'))return 'sprite-collimation';
   if(text.includes('focus lens')||text.includes('focusing lens'))return 'sprite-focus';
   if(text.includes('sensor body')||text.includes('capacitive sensor')||text.includes('nozzle holder')||text.includes('height sensor')||text.includes('sensor cable'))return 'sprite-sensor';
   if(text.includes('ceramic'))return 'sprite-ceramic';
   if(text.includes('double nozzle')||text.includes('double layer nozzle'))return 'sprite-double-nozzle';
   if(text.includes('nozzle'))return 'sprite-single-nozzle';
   if(text.includes('protective window')||text.includes('protective lens')||text.includes('cover glass')||text.includes('cover window')||text.includes('optic')||text.includes('cleaning'))return 'sprite-protective';
   return '';
 };
 const imageFor=x=>{
   const map={
     'teyu-cwfl-1000':'/assets/images/chiller.webp',
     'teyu-cwfl-1500':'/assets/images/prod-chiller.webp',
     'teyu-cwfl-2000':'/assets/images/prod-chiller-v22.webp',
     'teyu-cwfl-3000':'/assets/images/project-chiller.webp',
     'teyu-cwfl-4000':'/assets/images/project-chiller-v23.webp',
     'teyu-cwfl-6000':'/assets/images/project-chiller-v23b.webp',
     'fiber-laser-chiller-generic':'/assets/images/prod-chiller-v23.webp'
   };
   return map[String(x.slug||'')]||'';
 };
 const chillerUnitSprite=x=>{
   const map={
     'hanli-fiber-chiller':'sprite-chiller-unit-1',
     'tongfei-chiller':'sprite-chiller-unit-2',
     'co2-chiller':'sprite-chiller-unit-3',
     'handheld-laser-chiller':'sprite-chiller-unit-4'
   };
   return map[String(x.slug||'')]||'';
 };
 function render(){
  const q=(input?.value||'').trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean),cv=cat?.value||'';
  const out=rows.filter(x=>{if(cv&&x.category!==cv)return false;const hay=[x.name,x.description,x.brand,x.model,x.category,(x.keywords||[]).join(' '),Object.values(x.specs||{}).join(' ')].filter(Boolean).join(' ').toLowerCase();return !terms.length||terms.every(t=>hay.includes(t))});
  if(count)count.textContent=`${out.length} item${out.length===1?'':'s'}`;
  grid.innerHTML=out.length?out.map(x=>{const img=imageFor(x),sk=chillerUnitSprite(x)||spriteKey(x);return `<article class="lz-item">${img?`<div class="lz-media lz-photo"><img src="${safe(img)}" alt="${safe(x.name)}" loading="lazy" decoding="async"></div>`:(sk?`<div class="lz-media lz-sprite ${safe(sk)}" role="img" aria-label="${safe(x.name)}"></div>`:'')}<div class="lz-item-body"><span class="badge">${safe(x.badge||x.category)}</span><h3>${safe(x.name)}</h3><p>${safe(x.description)}</p><div class="lz-meta">${x.brand?`<span>${safe(x.brand)}</span>`:''}${x.model?`<span>${safe(x.model)}</span>`:''}<span>${safe(x.category)}</span></div><div class="lz-specs">${Object.entries(x.specs||{}).slice(0,4).map(([k,v])=>`<div><b>${safe(k)}</b><span>${safe(v)}</span></div>`).join('')}</div><div class="actions"><a class="btn dark" href="${x.href}">Send requirement →</a></div></div></article>`}).join(''):`<div class="lz-empty"><b>No exact item found.</b><p>Send the model, part number, dimensions, nameplate or photo and CG can help identify it.</p><a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent(input?.value||'Unidentified laser part')}">Send for identification →</a></div>`;
 }
 [input,cat].forEach(x=>x?.addEventListener('input',render)); document.getElementById('lz-clear')?.addEventListener('click',()=>{if(input)input.value='';if(cat)cat.value='';render()});
 document.querySelectorAll('[data-lz-filter]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();if(input)input.value=x.dataset.lzFilter||'';render();grid.scrollIntoView({behavior:'smooth'})}));
 const qs=new URLSearchParams(location.search); if(qs.get('q')&&input)input.value=qs.get('q'); render();
});
