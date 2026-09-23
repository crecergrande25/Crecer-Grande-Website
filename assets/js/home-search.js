document.addEventListener('DOMContentLoaded',async()=>{
  const input=document.getElementById('cg-global-search');
  const box=document.getElementById('cg-search-results');
  if(!input||!box)return;
  const rows=[],rowMap=new Map();
  const add=(name,kind,desc,href,keywords='')=>{const key=(String(href||'')+'|'+String(name||'').toLowerCase());const row={name,kind,desc,href,hay:[name,kind,desc,keywords].join(' ').toLowerCase()};if(rowMap.has(key))Object.assign(rowMap.get(key),row);else{rows.push(row);rowMap.set(key,row)}};
  [
    ['Mechanical Design Job Work','Engineering service','2D drafting, 3D part and assembly modelling, piping layouts, manufacturing drawings, BOM, revisions and reverse engineering.','/design-job-work.html','mechanical engineer senior design engineer 2d drafting 3d modelling piping design layout inventor autocad dwg dxf step stp assembly drawing manufacturing drawing bom ga isometric reverse engineering dfm dfa job work outsourced cad'],
    ['Mechanical Design & CAD','Engineering service','Mechanical CAD, manufacturing drawings, BOM, DFM/DFA and reverse engineering.','/mechanical-design-services-kolkata.html','inventor cad drawing design reverse engineering dfm dfa bom'],
    ['3D Printing & Rapid Prototyping','Manufacturing','FDM/resin routes, file review, FAI-first workflows and low-volume prototyping.','/3d-printing-kolkata.html','stl step stp resin fdm pla petg abs nylon inserts prototype'],
    ['Industrial Machine Maintenance','Machine support','Breakdown, troubleshooting, preventive maintenance and restoration support.','/industrial-machine-maintenance-kolkata.html','breakdown alarm repair cnc vmc laser chiller machine maintenance'],
    ['Inspection / FAI / RCA / CAPA','Quality','Inspection, first article, NCR, root-cause and corrective-action support.','/industrial-inspection-qa-kolkata.html','quality inspection fai ncr rca capa sop audit'],
    ['Tender & GeM Support','Business support','Tender review, technical compliance, GeM and industrial business support.','/gem-tender-support-kolkata.html','gem tender bid procurement vendor compliance registration'],
    ['CG Engineering Desk','Engineering gateway','Start with a drawing, part, machine problem, quality issue or tender.','/engineering-desk.html','problem requirement drawing photo sample machine part issue']
  ].forEach(x=>add(...x));
  try{
    const content=await (await fetch('/assets/data/content-index.json',{cache:'no-store'})).json();
    (content||[]).forEach(x=>add(x.name,x.kind||'Resource',x.desc||'',x.href||'/resources.html',x.keywords||''));
  }catch(_){ }
  const esc=s=>String(s||'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  function score(row,terms,q){let s=0;const name=row.name.toLowerCase();if(name===q)s+=12;if(name.startsWith(q))s+=7;if(name.includes(q))s+=5;for(const t of terms){if(name.includes(t))s+=4;if(row.hay.includes(t))s+=1}return s}
  function render(){
    const raw=input.value.trim(),q=raw.toLowerCase();
    if(q.length<2){box.classList.remove('open');box.innerHTML='';return}
    const terms=q.split(/\s+/).filter(Boolean);
    const matches=rows.map(r=>({r,s:score(r,terms,q)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s||a.r.name.localeCompare(b.r.name)).slice(0,8).map(x=>x.r);
    const fallback=`<article class="search-hit search-hit-fallback"><small>Can’t find it?</small><b>Send the part, drawing or problem to CG.</b><span>Upload a photo, nameplate, CAD file, drawing or description for engineering review.</span><a href="/request-quote.html?requirement=${encodeURIComponent(raw)}">Send requirement →</a></article>`;
    box.innerHTML=`<div class="search-result-head"><b>${matches.length?`${matches.length} relevant route${matches.length>1?'s':''}`:'No exact match'}</b><span>Search uses service routes and engineering resources.</span></div><div class="search-results-grid">${matches.map(x=>`<article class="search-hit"><small>${esc(x.kind)}</small><b>${esc(x.name)}</b><span>${esc(x.desc)}</span><a href="${esc(x.href)}">Open →</a></article>`).join('')}${fallback}</div>`;
    box.classList.add('open');
  }
  input.addEventListener('input',render);
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.classList.remove('open');input.blur()}});
  document.addEventListener('click',e=>{if(!e.target.closest('.search-card'))box.classList.remove('open')});
  const q=new URLSearchParams(location.search).get('q');if(q){input.value=q;render()}
});