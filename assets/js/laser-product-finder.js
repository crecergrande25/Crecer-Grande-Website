document.addEventListener('DOMContentLoaded', async () => {
  const $=s=>document.querySelector(s);
  const q=$('#finder-search'),brand=$('#brand-filter'),model=$('#model-filter'),category=$('#category-filter'),results=$('#finder-results'),count=$('#result-count'),cats=$('#finder-categories');
  if(!q||!results)return;

  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=v=>String(v??'').toLowerCase().replace(/[×x]/g,' x ').replace(/[øØ]/g,' dia ').replace(/[^a-z0-9.+&/-]+/g,' ').replace(/\s+/g,' ').trim();

  const aliases={
    'lens':['window','glass','optic'],
    'glass':['window','lens','optic'],
    'window':['lens','glass','optic'],
    'ceramic':['ceramic ring','ceramic body','nozzle ceramic'],
    'pump':['circulation pump','water pump','chiller pump'],
    'chiller':['cooling','water chiller'],
    'head':['cutting head','laser head'],
    'nozzle':['cutting nozzle'],
    'sensor':['flow sensor','height sensor','temperature sensor','level sensor'],
    'filter':['filtration','strainer'],
    'controller':['control board','display'],
    'seal':['o ring','gasket'],
    'o-ring':['seal','gasket'],
    'qbh':['fiber interface','connector'],
    'qcs':['fiber interface','connector']
  };
  const termMatch=(hay,t)=>hay.includes(t)||(aliases[t]||[]).some(a=>hay.includes(norm(a)));
  const termsMatch=(hay,terms)=>terms.every(t=>termMatch(hay,t));

  let fallback={categories:[],brands:[],models:[],products:[]},live={categories:[],brands:[],models:[],products:[]};
  try{
    const rr=await fetch('/assets/data/catalog-fallback.json');
    if(rr.ok)fallback=await rr.json();
    else throw new Error('fallback unavailable');
  }catch(_){
    try{
      const rr=await fetch('/assets/data/laser-ecosystem.json');
      if(rr.ok)fallback.products=(await rr.json()).products||[];
    }catch(__){}
  }

  const client=window.CG_SUPABASE;
  if(client){
    try{
      const [cr,br,mr,pr]=await Promise.all([
        client.from('product_categories').select('id,slug,name,parent_id,short_description,sort_order').eq('published',true).order('sort_order').limit(500),
        client.from('product_brands').select('id,slug,name,brand_role,relationship_status,sort_order').eq('published',true).order('sort_order').limit(300),
        client.from('equipment_models').select('id,model_name,model_code,aliases,brand_id,equipment_type_id,sort_order').eq('published',true).order('sort_order').limit(500),
        client.from('products').select('id,name,title,slug,short_description,description,category,subcategory,category_id,brand_id,manufacturer_part_number,model_number,cg_product_code,tags,stock_status,lead_time,lead_time_note,price_mode,image_url,sort_order').eq('published',true).order('sort_order').limit(1000)
      ]);
      if(!cr.error)live.categories=cr.data||[];
      if(!br.error)live.brands=br.data||[];
      if(!mr.error)live.models=mr.data||[];
      if(!pr.error)live.products=pr.data||[];
    }catch(_){}
  }

  const categories=live.categories.length
    ? live.categories
    : (fallback.categories||[]).map((x,i)=>({id:x.slug,slug:x.slug,name:x.name,parent_id:x.parent,short_description:x.description,sort_order:i}));
  const brands=live.brands.length
    ? live.brands
    : (fallback.brands||[]).map((x,i)=>({id:x.slug,slug:x.slug,name:x.name,relationship_status:x.role,sort_order:i}));
  const models=live.models.length
    ? live.models
    : (fallback.models||[]).map((x,i)=>({id:'f'+i,model_name:x.name,model_code:'',aliases:x.keywords,brand_id:x.brand,sort_order:i}));

  const brandNameById=Object.fromEntries(brands.map(x=>[String(x.id),x.name]));
  brand.innerHTML='<option value="">All brands</option>'+brands.map(x=>`<option value="${safe(String(x.id))}">${safe(x.name)}</option>`).join('');
  model.innerHTML='<option value="">All models</option>'+models.map(x=>`<option value="${safe(String(x.id))}">${safe(x.model_name)}</option>`).join('');
  category.innerHTML='<option value="">All categories</option>'+categories.map(x=>`<option value="${safe(String(x.id))}">${safe(x.name)}</option>`).join('');

  cats.innerHTML=categories.filter(x=>!x.parent_id).slice(0,14).map(x=>`<button class="finder-cat" data-cat="${safe(String(x.id))}"><b>${safe(x.name)}</b><small>${safe(x.short_description||'Browse compatible requirements')}</small></button>`).join('');

  function modelBrand(m){return brandNameById[String(m?.brand_id)]||(typeof m?.brand_id==='string'?m.brand_id:'')}
  function categoryIdsUnder(id){
    if(!id)return new Set();
    const out=new Set([String(id)]);
    let changed=true;
    while(changed){
      changed=false;
      categories.forEach(c=>{
        if(c.parent_id&&out.has(String(c.parent_id))&&!out.has(String(c.id))){
          out.add(String(c.id)); changed=true;
        }
      });
    }
    return out;
  }

  const topFamilyMap={
    'laser-cutting-heads':['cutting-heads'],
    'laser-spares-consumables':['consumables','co2','welding'],
    'laser-chillers':['chillers'],
    'laser-chiller-spares':['chiller-spares']
  };
  const categoryLabelMap={
    'manual-focus-cutting-heads':['manual-focus cutting head'],
    'autofocus-cutting-heads':['autofocus cutting head','autofocus / variable-beam cutting head'],
    'smart-cutting-heads':['high-power / intelligent cutting head'],
    'tube-3d-cutting-heads':['3d cutting head','medium-power 2d / 3d cutting head'],
    'cutting-nozzles':['cutting nozzles'],
    'protective-lenses':['protective windows'],
    'focus-collimation-lenses':['focus & collimation optics'],
    'ceramic-components':['ceramic rings'],
    'cutting-head-spares':['sensor bodies & holders','sensors & cables','lens drawers & cartridges','seals & service parts','fiber interfaces','cleaning & service'],
    'nozzle-holders-sensor-bodies':['sensor bodies & holders'],
    'height-sensors-cables':['sensors & cables'],
    'lens-cartridges-drawers':['lens drawers & cartridges'],
    'seals-o-rings':['seals & service parts'],
    'qbh-qcs-connectors':['fiber interfaces'],
    'cleaning-consumables':['cleaning & service'],
    'co2-laser-consumables':['co2'],
    'laser-welding-consumables':['welding'],
    'chiller-pumps':['circulation pumps'],
    'chiller-flow-sensors':['flow sensing'],
    'chiller-temperature-sensors':['temperature sensing'],
    'chiller-level-sensors':['level sensing'],
    'chiller-filters':['filtration'],
    'chiller-fans':['fans'],
    'chiller-compressors':['refrigeration'],
    'chiller-heat-exchangers':['heat exchange'],
    'chiller-controllers-displays':['controls'],
    'chiller-electrical-spares':['electrical'],
    'chiller-valves-fittings':['valves','hoses & fittings'],
    'chiller-coolant-additives':['coolant & maintenance']
  };

  function fallbackCategoryMatch(p,catIds){
    if(!category.value)return true;
    const selected=categories.filter(c=>catIds.has(String(c.id)));
    for(const c of selected){
      if(!c.parent_id && (topFamilyMap[c.slug]||[]).includes(p.family))return true;
      const labels=categoryLabelMap[c.slug]||[];
      const pcat=norm(p.category),pfam=norm(p.family);
      if(labels.some(label=>pcat.includes(norm(label))||pfam===norm(label)))return true;
      if(norm(c.name)===pcat)return true;
    }
    return false;
  }

  function render(){
    const text=norm(q.value),terms=text.split(/\s+/).filter(Boolean),catIds=categoryIdsUnder(category.value);
    const selectedBrand=brand.value;
    const selectedBrandName=brands.find(b=>String(b.id)===selectedBrand)?.name||'';
    const selectedModel=models.find(x=>String(x.id)===model.value);
    let rows=[];

    rows.push(...live.products.filter(p=>{
      if(category.value&&!catIds.has(String(p.category_id)))return false;
      if(selectedBrand&&String(p.brand_id)!==selectedBrand)return false;
      const hay=norm([
        p.name,p.title,p.short_description,p.description,p.category,p.subcategory,
        p.manufacturer_part_number,p.model_number,p.cg_product_code,
        Array.isArray(p.tags)?p.tags.join(' '):p.tags
      ].filter(Boolean).join(' '));
      return !terms.length||termsMatch(hay,terms);
    }).map(p=>({
      kind:'Live product',
      name:p.name||p.title||'Product',
      desc:p.short_description||p.description||p.subcategory||p.category||'',
      href:'/products/product-detail.html?slug='+encodeURIComponent(p.slug),
      brand:brandNameById[String(p.brand_id)]||'',
      meta:[p.manufacturer_part_number,p.model_number,p.cg_product_code,p.stock_status,p.lead_time||p.lead_time_note].filter(Boolean)
    })));

    rows.push(...((fallback.products||[]).filter(p=>{
      const catMatch=fallbackCategoryMatch(p,catIds);
      const brandMatch=!selectedBrand||norm(p.brand)===norm(selectedBrandName);
      const modelMatch=!model.value||norm(p.model)===norm(selectedModel?.model_name)||termMatch(norm([p.name,p.model,(p.keywords||[]).join(' ')].join(' ')),norm(selectedModel?.model_name));
      const hay=norm([p.name,p.description,p.category,p.family,p.brand,p.model,(p.keywords||[]).join(' '),Object.values(p.specs||{}).join(' ')].filter(Boolean).join(' '));
      return catMatch&&brandMatch&&modelMatch&&(!terms.length||termsMatch(hay,terms));
    }).map(p=>({
      kind:'Catalogue reference',
      name:p.name,
      desc:p.description,
      href:p.href,
      brand:p.brand||'',
      meta:[p.model,p.category].filter(Boolean)
    }))));

    if(!rows.length||terms.length){
      rows.push(...categories.filter(c=>{
        if(category.value&&!catIds.has(String(c.id)))return false;
        const hay=norm(c.name+' '+(c.short_description||''));
        return !terms.length||termsMatch(hay,terms);
      }).map(c=>({
        kind:'Product family',
        name:c.name,
        desc:c.short_description||'',
        href:'/request-quote.html?requirement='+encodeURIComponent(c.name),
        brand:'',
        meta:[]
      })));

      rows.push(...models.filter(m=>{
        if(model.value&&String(m.id)!==model.value)return false;
        if(selectedBrand&&String(m.brand_id)!==selectedBrand&&norm(modelBrand(m))!==norm(selectedBrandName))return false;
        const hay=norm([m.model_name,m.model_code,Array.isArray(m.aliases)?m.aliases.join(' '):m.aliases,modelBrand(m)].filter(Boolean).join(' '));
        return !terms.length||termsMatch(hay,terms);
      }).map(m=>({
        kind:'Equipment model',
        name:m.model_name,
        desc:'Search compatibility / send requirement',
        href:'/request-quote.html?requirement='+encodeURIComponent(m.model_name),
        brand:modelBrand(m),
        meta:[m.model_code].filter(Boolean)
      })));
    }

    const seen=new Set();
    rows=rows.filter(x=>{const k=x.kind+'|'+x.name;if(seen.has(k))return false;seen.add(k);return true}).slice(0,72);
    count.textContent=`${rows.length} match${rows.length===1?'':'es'}`;
    results.innerHTML=rows.length?rows.map(x=>`<article class="finder-item"><span class="badge">${safe(x.kind)}</span><h3>${safe(x.name)}</h3><p>${safe(x.desc||'Technical details are confirmed before quotation.')}</p><div class="finder-meta">${x.brand?`<span>${safe(x.brand)}</span>`:''}${(x.meta||[]).map(v=>`<span>${safe(v)}</span>`).join('')}</div><div class="actions"><a class="btn dark" href="${safe(x.href)}">${x.kind==='Live product'?'View details':'Send requirement'} →</a></div></article>`).join(''):`<div class="empty" style="grid-column:1/-1"><b>No exact match found.</b><p>Use a photo, nameplate, drawing, dimensions or part number. CG can help identify the requirement.</p><a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent(q.value||'Unidentified Laser Part')}">Send for identification →</a></div>`;
  }

  [q,brand,model,category].forEach(x=>x.addEventListener('input',render));
  $('#finder-clear')?.addEventListener('click',()=>{q.value='';brand.value='';model.value='';category.value='';render()});
  cats.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;category.value=b.dataset.cat;render();results.scrollIntoView({behavior:'smooth'})});
  const qs=new URLSearchParams(location.search);
  if(qs.get('q'))q.value=qs.get('q');
  render();
});