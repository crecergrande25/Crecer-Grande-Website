document.addEventListener('DOMContentLoaded', async () => {
  const $=s=>document.querySelector(s);
  const els={
    search:$('#lpf-search'),
    clearSearch:$('#lpf-clear-search'),
    families:$('#lpf-families'),
    brand:$('#lpf-brand'),
    sort:$('#lpf-sort'),
    results:$('#lpf-results'),
    resultCount:$('#lpf-result-count'),
    resultHint:$('#lpf-result-hint'),
    active:$('#lpf-active-filters'),
    reset:$('#lpf-reset'),
    load:$('#lpf-load-more'),
    filterToggle:$('#lpf-filter-toggle'),
    filterPanel:$('#lpf-filter-panel'),
    source:$('#lpf-source')
  };
  if(!els.search||!els.results)return;

  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=v=>String(v??'').toLowerCase()
    .replace(/[×x]/g,' x ')
    .replace(/[øØ]/g,' dia ')
    .replace(/[^a-z0-9.+&/-]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();

  const FAMILY_DEFS=[
    {id:'all',label:'All laser products',short:'Everything in the laser ecosystem'},
    {id:'cutting-heads',label:'Cutting heads',short:'RayTools, Precitec and other head references'},
    {id:'nozzles',label:'Nozzles',short:'Single, double and application-specific nozzles'},
    {id:'optics',label:'Optics & lenses',short:'Protective, focus, collimation and CO₂ optics'},
    {id:'ceramics-sensors',label:'Ceramics & head spares',short:'Ceramics, sensor bodies, drawers, seals and interfaces'},
    {id:'chillers',label:'Complete chillers',short:'Fiber, CO₂ and handheld laser cooling systems'},
    {id:'chiller-spares',label:'Chiller spares',short:'Pumps, sensors, filters, controls, valves and refrigeration'},
    {id:'welding-cleaning',label:'Welding & cleaning',short:'Heads, optics, nozzles and wire-feeder parts'},
    {id:'co2',label:'CO₂ laser parts',short:'Tubes, PSU, mirrors, lenses, heads and controls'}
  ];

  const aliases={
    lens:['window','glass','optic','optics'],
    window:['lens','glass','optic'],
    glass:['lens','window','optic'],
    optic:['lens','window','glass'],
    ceramic:['ceramic ring','insulator'],
    pump:['circulation pump','water pump','chiller pump'],
    chiller:['cooling','cooler','water chiller'],
    head:['cutting head','laser head'],
    nozzle:['cutting nozzle','tip'],
    sensor:['flow sensor','height sensor','temperature sensor','level sensor','probe'],
    filter:['filtration','strainer','filter element'],
    controller:['control board','display','pcb'],
    seal:['o ring','o-ring','gasket'],
    qbh:['fiber interface','connector'],
    qcs:['fiber interface','connector'],
    raytools:['ray tools'],
    teyu:['s&a','s and a'],
    licheng:['li cheng','leicheng']
  };

  const approvedFinderImage=(url)=>{
    const u=String(url||'').trim();
    const lower=u.toLowerCase();
    if(!u)return '';
    if(/\.svg(?:$|\?)/.test(lower))return '';
    if(!/\.(webp|png|jpe?g)(?:$|\?)/.test(lower))return '';
    const dedicated=
      lower.includes('/assets/images/catalog/') ||
      lower.includes('/assets/images/laser-consumables/generated-') ||
      lower.includes('/assets/images/laser-consumables/protective-window');
    return dedicated?u:'';
  };

  const productText=p=>norm([
    p.name,p.title,p.slug,p.category,p.subcategory,p.family,p.short_description,p.description,
    p.manufacturer_part_number,p.mpn,p.model,p.model_number,p.cg_product_code,p.sku,p.brand,
    Array.isArray(p.tags)?p.tags.join(' '):p.tags,
    Array.isArray(p.keywords)?p.keywords.join(' '):p.keywords,
    Array.isArray(p.search_keywords)?p.search_keywords.join(' '):p.search_keywords
  ].filter(Boolean).join(' '));

  const isLaserProduct=p=>{
    const t=productText(p);
    return /(laser|chiller|cutting head|nozzle|protective lens|protective window|focus lens|collimation|ceramic ring|sensor body|height sensor|qbh|qcs|raytools|ray tools|precitec|wsx|boci|ospri|au3tech|teyu|s&a|hanli|tongfei|tonfy|licheng|li cheng|leicheng|co2|co₂|welding|cleaning head|znse)/.test(t);
  };

  const familyFor=p=>{
    const t=productText(p);
    const cat=norm(p.category+' '+(p.subcategory||''));
    if(/co2|co₂|znse/.test(t))return 'co2';
    if(/welding|cleaning head|wire feeder/.test(t))return 'welding-cleaning';
    if(/chiller|cwfl|hanli|tongfei|tonfy|licheng|leicheng/.test(t)){
      if(/pump|sensor|switch|probe|filter|strainer|fan|compressor|refriger|controller|display|pcb|relay|contactor|capacitor|valve|hose|fitting|connector|coolant|spare/.test(t) || /chiller spares|chiller pumps/.test(cat))return 'chiller-spares';
      return 'chillers';
    }
    if(/nozzle/.test(t) && !/holder|sensor body/.test(t))return 'nozzles';
    if(/lens|optic|window|glass|mirror|collimation|focus/.test(t))return 'optics';
    if(/ceramic|sensor body|height sensor|holder|drawer|cartridge|seal|o ring|o-ring|gasket|qbh|qcs|fiber interface/.test(t))return 'ceramics-sensors';
    if(/cutting head|laser head|raytools|ray tools|precitec|wsx|boci|ospri|au3tech/.test(t))return 'cutting-heads';
    return 'ceramics-sensors';
  };

  const brandFor=p=>{
    if(String(p.brand||'').trim())return String(p.brand).trim();
    const t=productText(p);
    if(/raytools|ray tools/.test(t))return 'RayTools';
    if(/precitec/.test(t))return 'Precitec';
    if(/teyu|s&a|s and a/.test(t))return 'TEYU / S&A';
    if(/hanli/.test(t))return 'Hanli';
    if(/tongfei|tonfy/.test(t))return 'Tongfei / TONFY';
    if(/licheng|li cheng|leicheng/.test(t))return 'LiCheng';
    if(/wsx/.test(t))return 'WSX';
    if(/boci/.test(t))return 'BOCI';
    if(/ospri/.test(t))return 'OSPRI';
    if(/au3tech/.test(t))return 'Au3Tech';
    return '';
  };

  const termsFor=q=>norm(q).split(/\s+/).filter(Boolean);
  const termMatch=(hay,t)=>{
    if(hay.includes(t))return true;
    return (aliases[t]||[]).some(a=>hay.includes(norm(a)));
  };
  const allTermsMatch=(hay,terms)=>terms.every(t=>termMatch(hay,t));

  const scoreFor=(p,query)=>{
    const terms=termsFor(query);
    if(!terms.length)return 0;
    const name=norm(p.name||p.title||'');
    const model=norm([p.model,p.model_number,p.manufacturer_part_number,p.mpn,p.cg_product_code,p.sku].filter(Boolean).join(' '));
    const hay=productText(p);
    let score=0;
    for(const t of terms){
      if(model===t)score+=30;
      else if(model.includes(t))score+=20;
      if(name===t)score+=20;
      else if(name.startsWith(t))score+=12;
      else if(name.includes(t))score+=8;
      if(hay.includes(t))score+=3;
      for(const a of aliases[t]||[])if(hay.includes(norm(a)))score+=2;
    }
    return score;
  };

  let products=[];
  let state={family:'all',brand:'all',sort:'relevance',visible:24};

  try{
    if(!window.CG_CATALOG)throw new Error('Catalogue service unavailable');
    const snapshot=await window.CG_CATALOG.getSnapshot();
    products=(snapshot.products||[]).filter(isLaserProduct).map(p=>({
      ...p,
      familyKey:familyFor(p),
      displayBrand:brandFor(p),
      image:approvedFinderImage(p.image_url||p.image||''),
      href:p.href||('/products/catalog/'+encodeURIComponent(p.slug||'')+'.html')
    }));
    els.source.textContent=`${products.length} laser products & references`;
    document.documentElement.dataset.catalogSource=snapshot.source||'';
  }catch(err){
    els.source.textContent='Catalogue unavailable';
    els.results.innerHTML=`<div class="lpf-empty"><h3>Catalogue temporarily unavailable</h3><p>Send a part photo, model, nameplate or drawing and Crecer Grande can review it directly.</p><a class="btn primary" href="/request-quote.html?requirement=Laser%20Part%20Identification">Send requirement →</a></div>`;
    return;
  }

  const brands=[...new Set(products.map(p=>p.displayBrand).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  els.brand.innerHTML='<option value="all">All brand references</option>'+brands.map(b=>`<option value="${safe(b)}">${safe(b)}</option>`).join('');

  function familyCount(id){
    return id==='all'?products.length:products.filter(p=>p.familyKey===id).length;
  }

  function renderFamilies(){
    els.families.innerHTML=FAMILY_DEFS.map(f=>`<button class="lpf-family${state.family===f.id?' active':''}" type="button" data-family="${f.id}">
      <span class="num">${familyCount(f.id)}</span>
      <b>${safe(f.label)}</b>
      <small>${safe(f.short)}</small>
    </button>`).join('');
  }

  function quoteHref(p){
    const name=p.name||p.title||'Laser product';
    const model=p.model_number||p.model||p.manufacturer_part_number||'';
    return '/request-quote.html?requirement='+encodeURIComponent(name)+(model?'&machine_model='+encodeURIComponent(model):'');
  }

  function filtered(){
    const query=els.search.value.trim();
    const terms=termsFor(query);
    let rows=products.filter(p=>{
      if(state.family!=='all'&&p.familyKey!==state.family)return false;
      if(state.brand!=='all'&&p.displayBrand!==state.brand)return false;
      return !terms.length||allTermsMatch(productText(p),terms);
    });
    if(state.sort==='az')rows.sort((a,b)=>String(a.name||a.title||'').localeCompare(String(b.name||b.title||'')));
    else if(state.sort==='brand')rows.sort((a,b)=>(a.displayBrand||'ZZZ').localeCompare(b.displayBrand||'ZZZ')||String(a.name||'').localeCompare(String(b.name||'')));
    else if(terms.length)rows.sort((a,b)=>scoreFor(b,query)-scoreFor(a,query)||String(a.name||'').localeCompare(String(b.name||'')));
    else rows.sort((a,b)=>(a.familyKey||'').localeCompare(b.familyKey||'')||String(a.name||a.title||'').localeCompare(String(b.name||b.title||'')));
    return rows;
  }

  function techBadges(p){
    const vals=[];
    [p.model_number,p.model,p.manufacturer_part_number,p.mpn,p.cg_product_code,p.subcategory||p.category].forEach(v=>{
      const x=String(v||'').trim();
      if(x&&!vals.includes(x))vals.push(x);
    });
    return vals.slice(0,3);
  }

  function imageHtml(p){
    if(!p.image)return '<div class="lpf-img-fallback"><span>Image under verification<br>Use model / part number for identification</span></div>';
    return `<img src="${safe(p.image)}" alt="${safe(p.name||p.title||'Laser product')}" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'lpf-img-fallback',innerHTML:'<span>Image under verification<br>Use model / part number for identification</span>'}))">`;
  }

  function renderActive(){
    const chips=[];
    if(state.family!=='all'){
      const f=FAMILY_DEFS.find(x=>x.id===state.family);
      if(f)chips.push(`<span class="lpf-filter-chip">${safe(f.label)} <button type="button" data-remove="family">×</button></span>`);
    }
    if(state.brand!=='all')chips.push(`<span class="lpf-filter-chip">${safe(state.brand)} <button type="button" data-remove="brand">×</button></span>`);
    if(els.search.value.trim())chips.push(`<span class="lpf-filter-chip">“${safe(els.search.value.trim())}” <button type="button" data-remove="search">×</button></span>`);
    els.active.innerHTML=chips.join('');
  }

  function syncUrl(){
    const u=new URL(location.href);
    const q=els.search.value.trim();
    q?u.searchParams.set('q',q):u.searchParams.delete('q');
    state.family!=='all'?u.searchParams.set('family',state.family):u.searchParams.delete('family');
    history.replaceState(null,'',u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():'')+u.hash);
  }

  function render(){
    const rows=filtered();
    const shown=rows.slice(0,state.visible);
    els.resultCount.textContent=`${rows.length} match${rows.length===1?'':'es'}`;
    els.resultHint.textContent=rows.length?(`Showing ${Math.min(shown.length,rows.length)} of ${rows.length}`):'Try another model, part number or family';
    renderFamilies();
    renderActive();
    els.results.innerHTML=shown.length?shown.map(p=>{
      const badges=techBadges(p);
      const family=FAMILY_DEFS.find(f=>f.id===p.familyKey)?.label||'Laser product';
      return `<article class="lpf-card${p.image?'':' no-image'}">
        <a class="lpf-card-media" href="${safe(p.href)}" aria-label="Open ${safe(p.name||p.title||'product')}">
          ${imageHtml(p)}
          <span class="lpf-card-badge">${safe(family)}</span>
        </a>
        <div class="lpf-card-body">
          <div class="lpf-brand">${safe(p.displayBrand||'Crecer Grande catalogue')}</div>
          <h3>${safe(p.name||p.title||'Laser product')}</h3>
          <p>${safe(p.short_description||p.description||'Technical suitability is confirmed against the actual machine, model and interface before quotation.')}</p>
          <div class="lpf-tech">${badges.map(v=>`<span>${safe(v)}</span>`).join('')}</div>
          <div class="lpf-card-actions">
            <a class="lpf-open" href="${safe(p.href)}">View details</a>
            <a class="lpf-quote" href="${safe(quoteHref(p))}">Request quote</a>
          </div>
        </div>
      </article>`;
    }).join(''):`<div class="lpf-empty">
      <h3>No exact catalogue match</h3>
      <p>That does not mean the part is unavailable. Send a clear photo, head/chiller model, part number, dimensions or nameplate and we can identify the requirement manually.</p>
      <a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent(els.search.value.trim()||'Unidentified Laser Part')}">Send for identification →</a>
    </div>`;
    els.load.hidden=rows.length<=shown.length;
    syncUrl();
  }

  let searchTimer;
  els.search.addEventListener('input',()=>{
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>{state.visible=24;render()},120);
  });
  els.clearSearch.addEventListener('click',()=>{els.search.value='';state.visible=24;render();els.search.focus()});
  els.brand.addEventListener('change',()=>{state.brand=els.brand.value;state.visible=24;render()});
  els.sort.addEventListener('change',()=>{state.sort=els.sort.value;render()});
  els.reset.addEventListener('click',()=>{state={family:'all',brand:'all',sort:'relevance',visible:24};els.search.value='';els.brand.value='all';els.sort.value='relevance';render()});
  els.load.addEventListener('click',()=>{state.visible+=24;render()});
  els.filterToggle?.addEventListener('click',()=>els.filterPanel?.classList.toggle('open'));

  els.families.addEventListener('click',e=>{
    const b=e.target.closest('[data-family]');if(!b)return;
    state.family=b.dataset.family||'all';state.visible=24;render();
    document.querySelector('#lpf-results-anchor')?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  els.active.addEventListener('click',e=>{
    const b=e.target.closest('[data-remove]');if(!b)return;
    const key=b.dataset.remove;
    if(key==='family')state.family='all';
    if(key==='brand'){state.brand='all';els.brand.value='all'}
    if(key==='search')els.search.value='';
    state.visible=24;render();
  });

  document.querySelectorAll('[data-lpf-query]').forEach(b=>b.addEventListener('click',()=>{
    els.search.value=b.dataset.lpfQuery||'';state.family='all';state.visible=24;render();
    document.querySelector('#lpf-results-anchor')?.scrollIntoView({behavior:'smooth',block:'start'});
  }));

  const params=new URLSearchParams(location.search);
  if(params.get('q'))els.search.value=params.get('q');
  if(params.get('family')&&FAMILY_DEFS.some(f=>f.id===params.get('family')))state.family=params.get('family');

  render();
});