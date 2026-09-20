
document.addEventListener('DOMContentLoaded',async()=>{
 const root=document.querySelector('[data-laser-catalog]'); if(!root)return;
 const family=root.dataset.laserCatalog||''; const input=document.getElementById('lz-search'),cat=document.getElementById('lz-category'),grid=document.getElementById('lz-catalog-grid'),count=document.getElementById('lz-count');
 let rows=[];
 try{
   if(!window.CG_CATALOG)throw new Error('Catalogue service unavailable');
   const catalogue=await window.CG_CATALOG.getProducts({family});
   rows=catalogue.products||[];
   root.dataset.catalogSource=catalogue.source||'';
 }catch(_){
   grid.innerHTML='<div class="lz-empty"><b>Catalogue temporarily unavailable.</b><p>Send the part/model details and CG can review the requirement directly.</p></div>';
   if(count)count.textContent='Catalogue unavailable';
   return;
 }
 const cats=[...new Set(rows.map(x=>x.category).filter(Boolean))].sort();
 if(cat)cat.innerHTML='<option value="">All types</option>'+cats.map(x=>`<option>${x}</option>`).join('');
 const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const norm=v=>String(v??'').toLowerCase().replace(/[×x]/g,' x ').replace(/[øØ]/g,' dia ').replace(/[^a-z0-9.+&/-]+/g,' ').replace(/\s+/g,' ').trim();
 const spriteKey=x=>{
   const family=norm(x.family||'');
   const text=norm([x.name,x.description,x.category,x.family,x.model,(x.keywords||[]).join(' ')].filter(Boolean).join(' '));
   const slug=String(x.slug||'');
   const part4={
     'raytools-bm111':'part4-head-01','raytools-bm110':'part4-head-02','raytools-bm114':'part4-head-03','raytools-bt240s':'part4-head-04',
     'precitec-procutter-2':'part4-head-05','precitec-procutter-prime':'part4-head-06','precitec-procutter-zoom':'part4-head-07','precitec-procutter-thunder':'part4-head-08',
     'precitec-minicutter':'part4-head-09','precitec-solidcutter':'part4-head-10','wsx-cutting-head':'part4-head-11','boci-cutting-head':'part4-head-12',
     'ospri-cutting-head':'part4-head-13','au3tech-cutting-head':'part4-head-14',
     'co2-laser-tube':'part4-misc-01','co2-psu':'part4-misc-02','znse-focus-lens':'part4-misc-03','co2-mirror':'part4-misc-04',
     'co2-mirror-mount':'part4-misc-05','co2-head-nozzle':'part4-misc-06','co2-motion':'part4-misc-07','co2-controller':'part4-misc-08',
     'welding-nozzle':'part4-misc-09','welding-protective-lens':'part4-misc-10','welding-ceramic':'part4-misc-11',
     'wire-feeder-spare':'part4-misc-12','cleaning-head-consumable':'part4-misc-13'
   };
   if(part4[slug])return part4[slug];

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
     'single-layer-nozzles':'/assets/images/laser-consumables/generated-single-layer-nozzles.webp',
     'double-layer-nozzles':'/assets/images/laser-consumables/generated-double-layer-nozzles.webp',
     'high-speed-nozzles':'/assets/images/laser-consumables/generated-high-speed-nozzles.webp',
     'protective-window-279-41':'/assets/images/laser-consumables/generated-protective-windows.webp',
     'protective-window-249-15':'/assets/images/laser-consumables/generated-protective-windows.webp',
     'protective-windows-other':'/assets/images/laser-consumables/generated-protective-windows.webp',
     'focus-lens-group':'/assets/images/laser-consumables/generated-focus-optics.webp',
     'collimation-lens-group':'/assets/images/laser-consumables/generated-collimation-optics.webp',
     'ceramic-ring':'/assets/images/laser-consumables/generated-ceramic-ring.webp',
     'sensor-body':'/assets/images/laser-consumables/generated-sensor-body.webp',
     'height-sensor-cable':'/assets/images/laser-consumables/generated-height-sensor.webp',
     'lens-drawer':'/assets/images/laser-consumables/generated-lens-drawer.webp',
     'head-seal-kit':'/assets/images/laser-consumables/generated-seals.webp',
     'qbh-qcs-interface':'/assets/images/laser-consumables/generated-qbh-qcs.webp',
     'optics-cleaning':'/assets/images/laser-consumables/generated-optics-cleaning.webp',
     'leicheng-600w-pump':'/assets/images/prod-pump-v22.webp',
     'chiller-pump-other':'/assets/images/prod-pump-v23.webp',
     'flow-switch':'/assets/images/chiller-components.webp',
     'water-filter':'/assets/images/prod-chiller-spares-v23.webp',
     'temperature-sensor':'/assets/images/project-chiller-v23b.webp',
     'level-sensor':'/assets/images/am-approved-sparekit.webp',
     'chiller-fan':'/assets/images/div-maintenance-v23.webp',
     'chiller-compressor':'/assets/images/prod-chiller-v22.webp',
     'chiller-condenser':'/assets/images/project-chiller-v23.webp',
     'chiller-controller':'/assets/images/prod-chiller-v23.webp',
     'chiller-electrical':'/assets/images/prod-spares-v23.webp',
     'chiller-valve':'/assets/images/prod-custom-spares-v23.webp',
     'chiller-hose-fitting':'/assets/images/resource-maintenance-v23.webp',
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
  grid.innerHTML=out.length?out.map(x=>{const img=x.image_url||imageFor(x);return `<article class="lz-item">${img?`<div class="lz-media lz-photo"><img src="${safe(img)}" alt="${safe(x.name)}" loading="lazy" decoding="async"></div>`:`<div class="lz-media lz-image-pending"><span><b>Image pending</b><small>Send part photo / model for identification.</small></span></div>`}<div class="lz-item-body"><span class="badge">${safe(x.badge||x.category)}</span><h3>${safe(x.name)}</h3><p>${safe(x.description)}</p><div class="lz-meta">${x.brand?`<span>${safe(x.brand)}</span>`:''}${x.model?`<span>${safe(x.model)}</span>`:''}<span>${safe(x.category)}</span></div><div class="lz-specs">${Object.entries(x.specs||{}).slice(0,4).map(([k,v])=>`<div><b>${safe(k)}</b><span>${safe(v)}</span></div>`).join('')}</div><div class="actions"><a class="btn dark" href="${x.href}">Send requirement →</a></div></div></article>`}).join(''):`<div class="lz-empty"><b>No exact item found.</b><p>Send the model, part number, dimensions, nameplate or photo and CG can help identify it.</p><a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent(input?.value||'Unidentified laser part')}">Send for identification →</a></div>`;
 }
 [input,cat].forEach(x=>x?.addEventListener('input',render)); document.getElementById('lz-clear')?.addEventListener('click',()=>{if(input)input.value='';if(cat)cat.value='';render()});
 document.querySelectorAll('[data-lz-filter]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();if(input)input.value=x.dataset.lzFilter||'';render();grid.scrollIntoView({behavior:'smooth'})}));
 const qs=new URLSearchParams(location.search); if(qs.get('q')&&input)input.value=qs.get('q'); else if(input&&root.dataset.defaultQuery)input.value=root.dataset.defaultQuery; render();
});
