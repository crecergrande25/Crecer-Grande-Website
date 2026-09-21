
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
 function render(){
  const q=(input?.value||'').trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean),cv=cat?.value||'';
  const out=rows.filter(x=>{if(cv&&x.category!==cv)return false;const hay=[x.name,x.description,x.brand,x.model,x.category,(x.keywords||[]).join(' '),Object.values(x.specs||{}).join(' ')].filter(Boolean).join(' ').toLowerCase();return !terms.length||terms.every(t=>hay.includes(t))});
  if(count)count.textContent=`${out.length} item${out.length===1?'':'s'}`;
  grid.innerHTML=out.length?out.map(x=>{const dedicated=!!x.image_url; const img=x.image_url||''; const generated=window.CG_GENERATED_VISUAL_CLASS?.(x.slug)||'';return `<article class="lz-item">${img?`<div class="lz-media lz-photo"><img src="${safe(img)}" alt="${safe(x.name)}" loading="lazy" decoding="async">${dedicated?'':'<span class="lz-visual-note">Reference visual</span>'}</div>`:(generated?`<div class="lz-media ${safe(generated)}" role="img" aria-label="${safe(x.name)}"></div>`:`<div class="lz-media lz-image-pending"><span><b>Image pending</b><small>Send part photo / model for identification.</small></span></div>`)}<div class="lz-item-body"><span class="badge">${safe(x.badge||x.category)}</span><h3>${safe(x.name)}</h3><p>${safe(x.description)}</p><div class="lz-meta">${x.brand?`<span>${safe(x.brand)}</span>`:''}${x.model?`<span>${safe(x.model)}</span>`:''}<span>${safe(x.category)}</span></div><div class="lz-specs">${Object.entries(x.specs||{}).slice(0,4).map(([k,v])=>`<div><b>${safe(k)}</b><span>${safe(v)}</span></div>`).join('')}</div><div class="actions"><a class="btn dark" href="${x.href}">Send requirement →</a></div></div></article>`}).join(''):`<div class="lz-empty"><b>No exact item found.</b><p>Send the model, part number, dimensions, nameplate or photo and CG can help identify it.</p><a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent(input?.value||'Unidentified laser part')}">Send for identification →</a></div>`;
 }
 [input,cat].forEach(x=>x?.addEventListener('input',render)); document.getElementById('lz-clear')?.addEventListener('click',()=>{if(input)input.value='';if(cat)cat.value='';render()});
 document.querySelectorAll('[data-lz-filter]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();if(input)input.value=x.dataset.lzFilter||'';render();grid.scrollIntoView({behavior:'smooth'})}));
 const qs=new URLSearchParams(location.search); if(qs.get('q')&&input)input.value=qs.get('q'); else if(input&&root.dataset.defaultQuery)input.value=root.dataset.defaultQuery; render();
});
