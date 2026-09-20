
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
     'fiber-laser-chiller-generic':'/assets/images/prod-chiller-v23.webp',
     'custom-reverse-engineering':'/assets/images/project-reverse.webp',
     'custom-machined-components':'/assets/images/am-approved-machined.webp',
     'custom-legacy-parts':'/assets/images/am-approved-spares.webp',
     'custom-prototype-fit':'/assets/images/am-approved-prototype.webp'
   };
   return map[String(x.slug||'')]||'';
 };
 function render(){
  const q=(input?.value||'').trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean),cv=cat?.value||'';
  const out=rows.filter(x=>{if(cv&&x.category!==cv)return false;const hay=[x.name,x.description,x.brand,x.model,x.category,(x.keywords||[]).join(' '),Object.values(x.specs||{}).join(' ')].filter(Boolean).join(' ').toLowerCase();return !terms.length||terms.every(t=>hay.includes(t))});
  if(count)count.textContent=`${out.length} item${out.length===1?'':'s'}`;
  grid.innerHTML=out.length?out.map(x=>{const dedicated=!!x.image_url; const img=x.image_url||imageFor(x);return `<article class="lz-item">${img?`<div class="lz-media lz-photo"><img src="${safe(img)}" alt="${safe(x.name)}" loading="lazy" decoding="async">${dedicated?'':'<span class="lz-visual-note">Reference visual</span>'}</div>`:`<div class="lz-media lz-image-pending"><span><b>Image pending</b><small>Send part photo / model for identification.</small></span></div>`}<div class="lz-item-body"><span class="badge">${safe(x.badge||x.category)}</span><h3>${safe(x.name)}</h3><p>${safe(x.description)}</p><div class="lz-meta">${x.brand?`<span>${safe(x.brand)}</span>`:''}${x.model?`<span>${safe(x.model)}</span>`:''}<span>${safe(x.category)}</span></div><div class="lz-specs">${Object.entries(x.specs||{}).slice(0,4).map(([k,v])=>`<div><b>${safe(k)}</b><span>${safe(v)}</span></div>`).join('')}</div><div class="actions"><a class="btn dark" href="${x.href}">Send requirement →</a></div></div></article>`}).join(''):`<div class="lz-empty"><b>No exact item found.</b><p>Send the model, part number, dimensions, nameplate or photo and CG can help identify it.</p><a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent(input?.value||'Unidentified laser part')}">Send for identification →</a></div>`;
 }
 [input,cat].forEach(x=>x?.addEventListener('input',render)); document.getElementById('lz-clear')?.addEventListener('click',()=>{if(input)input.value='';if(cat)cat.value='';render()});
 document.querySelectorAll('[data-lz-filter]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();if(input)input.value=x.dataset.lzFilter||'';render();grid.scrollIntoView({behavior:'smooth'})}));
 const qs=new URLSearchParams(location.search); if(qs.get('q')&&input)input.value=qs.get('q'); else if(input&&root.dataset.defaultQuery)input.value=root.dataset.defaultQuery; render();
});
