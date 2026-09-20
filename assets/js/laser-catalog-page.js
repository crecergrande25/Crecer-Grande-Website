
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
   const text=norm([x.name,x.description,x.category,x.family,x.model,(x.keywords||[]).join(' ')].filter(Boolean).join(' '));
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
 function render(){
  const q=(input?.value||'').trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean),cv=cat?.value||'';
  const out=rows.filter(x=>{if(cv&&x.category!==cv)return false;const hay=[x.name,x.description,x.brand,x.model,x.category,(x.keywords||[]).join(' '),Object.values(x.specs||{}).join(' ')].filter(Boolean).join(' ').toLowerCase();return !terms.length||terms.every(t=>hay.includes(t))});
  if(count)count.textContent=`${out.length} item${out.length===1?'':'s'}`;
  grid.innerHTML=out.length?out.map(x=>{const sk=spriteKey(x);return `<article class="lz-item">${sk?`<div class="lz-media lz-sprite ${safe(sk)}" role="img" aria-label="${safe(x.name)}"></div>`:''}<div class="lz-item-body"><span class="badge">${safe(x.badge||x.category)}</span><h3>${safe(x.name)}</h3><p>${safe(x.description)}</p><div class="lz-meta">${x.brand?`<span>${safe(x.brand)}</span>`:''}${x.model?`<span>${safe(x.model)}</span>`:''}<span>${safe(x.category)}</span></div><div class="lz-specs">${Object.entries(x.specs||{}).slice(0,4).map(([k,v])=>`<div><b>${safe(k)}</b><span>${safe(v)}</span></div>`).join('')}</div><div class="actions"><a class="btn dark" href="${x.href}">Send requirement →</a></div></div></article>`}).join(''):`<div class="lz-empty"><b>No exact item found.</b><p>Send the model, part number, dimensions, nameplate or photo and CG can help identify it.</p><a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent(input?.value||'Unidentified laser part')}">Send for identification →</a></div>`;
 }
 [input,cat].forEach(x=>x?.addEventListener('input',render)); document.getElementById('lz-clear')?.addEventListener('click',()=>{if(input)input.value='';if(cat)cat.value='';render()});
 document.querySelectorAll('[data-lz-filter]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();if(input)input.value=x.dataset.lzFilter||'';render();grid.scrollIntoView({behavior:'smooth'})}));
 const qs=new URLSearchParams(location.search); if(qs.get('q')&&input)input.value=qs.get('q'); render();
});
