document.addEventListener('DOMContentLoaded',async()=>{
  const input=document.getElementById('cg-global-search');
  const box=document.getElementById('cg-search-results');
  if(!input||!box)return;
  const rows=[];
  const add=(name,kind,desc,href,keywords='')=>rows.push({name,kind,desc,href,hay:[name,kind,desc,keywords].join(' ').toLowerCase()});
  [
    ['Mechanical Design & CAD','Engineering service','3D CAD, 2D manufacturing drawings, BOM, DFM/DFA and reverse engineering.','/mechanical-design-services-kolkata.html','inventor cad drawing design reverse engineering dfm dfa bom'],
    ['3D Printing & Rapid Prototyping','Manufacturing','STL preliminary estimate, STEP/STP engineering review, FAI, inserts and finishing.','/products/3d-print-quote.html','stl step stp resin fdm pla petg abs nylon inserts prototype'],
    ['Industrial Machine Maintenance','Machine support','Breakdown, troubleshooting, preventive maintenance and restoration support.','/industrial-machine-maintenance-kolkata.html','breakdown alarm repair cnc vmc laser chiller machine maintenance'],
    ['Inspection / FAI / RCA / CAPA','Quality','Inspection, first article, NCR, root-cause and corrective-action support.','/industrial-inspection-qa-kolkata.html','quality inspection fai ncr rca capa sop audit'],
    ['Tender & GeM Support','Business support','Tender review, technical compliance, GeM and industrial business support.','/gem-tender-support-kolkata.html','gem tender bid procurement vendor compliance registration'],
    ['CG Engineering Desk','Engineering gateway','Start with a drawing, part, machine problem, quality issue or tender.','/engineering-desk.html','problem requirement drawing photo sample machine part issue']
  ].forEach(x=>add(...x));
  try{
    const data=await (await fetch('/assets/data/catalog-fallback.json',{cache:'no-store'})).json();
    (data.categories||[]).forEach(x=>add(x.name,'Product family',x.description||'','/products/laser-product-finder.html?q='+encodeURIComponent(x.name),(x.keywords||[]).join(' ')));
  }catch(_){ }
  try{
    const content=await (await fetch('/assets/data/content-index.json',{cache:'no-store'})).json();
    (content||[]).forEach(x=>add(x.name,x.kind||'Resource',x.desc||'',x.href||'/resources.html',x.keywords||''));
  }catch(_){ }
  const client=window.CG_SUPABASE;
  if(client){
    try{
      const {data,error}=await client.from('products').select('name,slug,short_description,category,subcategory,mpn,manufacturer_part_number,sku,tags').eq('published',true).limit(750);
      if(!error)(data||[]).forEach(x=>add(x.name,'Catalogue product',x.short_description||x.subcategory||x.category||'','/products/product-detail.html?slug='+encodeURIComponent(x.slug),[x.category,x.subcategory,x.mpn,x.manufacturer_part_number,x.sku,Array.isArray(x.tags)?x.tags.join(' '):x.tags].filter(Boolean).join(' ')));
    }catch(_){ }
  }
  const esc=s=>String(s||'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  function score(row,terms,q){let s=0;const name=row.name.toLowerCase();if(name===q)s+=12;if(name.startsWith(q))s+=7;if(name.includes(q))s+=5;for(const t of terms){if(name.includes(t))s+=4;if(row.hay.includes(t))s+=1}return s}
  function render(){
    const raw=input.value.trim(),q=raw.toLowerCase();
    if(q.length<2){box.classList.remove('open');box.innerHTML='';return}
    const terms=q.split(/\s+/).filter(Boolean);
    const matches=rows.map(r=>({r,s:score(r,terms,q)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s||a.r.name.localeCompare(b.r.name)).slice(0,8).map(x=>x.r);
    const fallback=`<article class="search-hit search-hit-fallback"><small>Can’t find it?</small><b>Send the part, drawing or problem to CG.</b><span>Upload a photo, nameplate, CAD file, drawing or description for engineering review.</span><a href="/request-quote.html?requirement=${encodeURIComponent(raw)}">Send requirement →</a></article>`;
    box.innerHTML=`<div class="search-result-head"><b>${matches.length?`${matches.length} relevant route${matches.length>1?'s':''}`:'No exact match'}</b><span>Search uses service routes, product families and the published catalogue.</span></div><div class="search-results-grid">${matches.map(x=>`<article class="search-hit"><small>${esc(x.kind)}</small><b>${esc(x.name)}</b><span>${esc(x.desc)}</span><a href="${esc(x.href)}">Open →</a></article>`).join('')}${fallback}</div>`;
    box.classList.add('open');
  }
  input.addEventListener('input',render);
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.classList.remove('open');input.blur()}});
  document.addEventListener('click',e=>{if(!e.target.closest('.search-card'))box.classList.remove('open')});
  const q=new URLSearchParams(location.search).get('q');if(q){input.value=q;render()}
});
