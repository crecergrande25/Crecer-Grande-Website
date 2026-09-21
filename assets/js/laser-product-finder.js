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

  const isGenericImage=(url='')=>{
    const u=String(url||'').toLowerCase();
    if(!u)return false;
    return [
      'laser-components.webp','prod-spares-v23.webp','prod-laser-v23.webp','prod-chiller-v23.webp',
      'prod-pump-v23b.webp','project-co2-v23b.webp','service-laser-marking.webp','prod-cnc-v22.webp','prod-cnc-v23b.webp'
    ].some(name=>u.includes(name));
  };

  const familyImage=(p={})=>{
    const family=norm(p.family||'');
    const category=norm(p.category||p.subcategory||'');
    const text=family+' '+category+' '+norm(p.name||p.title||'');
    if(text.includes('chiller pump')||text.includes('circulation pump')||text.includes('water pump'))return '/assets/images/prod-pump-v23b.webp';
    if(text.includes('chiller')||text.includes('cooling'))return '/assets/images/prod-chiller-v23.webp';
    if(text.includes('co2'))return '/assets/images/project-co2-v23b.webp';
    if(text.includes('welding')||text.includes('cleaning'))return '/assets/images/service-laser-marking.webp';
    if(text.includes('nozzle')||text.includes('lens')||text.includes('optic')||text.includes('ceramic')||text.includes('consumable')||text.includes('spare'))return '/assets/images/laser-components.webp';
    if(text.includes('head')||text.includes('cutting'))return '/assets/images/prod-laser-v23.webp';
    if(text.includes('cnc')||text.includes('vmc')||text.includes('machine spare')||text.includes('spindle')||text.includes('servo'))return '/assets/images/prod-cnc-v22.webp';
    return '/assets/images/laser-components.webp';
  };

  const productSpriteKey=(p={})=>{
    const family=norm(p.family||'');
    const text=norm([p.name,p.title,p.category,p.subcategory,p.family,p.description,Array.isArray(p.tags)?p.tags.join(' '):p.tags].filter(Boolean).join(' '));
    const slug=String(p.slug||'');
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
    const part6={
      'pb-standard-punch':'p6-tool-01','pb-v-die':'p6-tool-02','pb-gooseneck':'p6-tool-03','pb-offset-hemming':'p6-tool-04','pb-radius':'p6-tool-05',
      'pb-air-bend':'p6-tool-06','pb-holder-clamp':'p6-tool-07','pb-custom':'p6-tool-08','pb-crowning':'p6-tool-09','pb-accessories':'p6-tool-10',
      'custom-reverse-engineering':'p6-custom-01','custom-machined-components':'p6-custom-02','custom-legacy-parts':'p6-custom-03','custom-prototype-fit':'p6-custom-04'
    };
    if(part6[slug])return part6[slug];

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
    if(text.includes('sensor body')||text.includes('capacitive sensor')||text.includes('nozzle holder')||text.includes('height sensor'))return 'sprite-sensor';
    if(text.includes('ceramic'))return 'sprite-ceramic';
    if(text.includes('double nozzle')||text.includes('double layer nozzle'))return 'sprite-double-nozzle';
    if(text.includes('nozzle'))return 'sprite-single-nozzle';
    if(text.includes('protective window')||text.includes('protective lens')||text.includes('cover glass')||text.includes('cover window')||text.includes('optic'))return 'sprite-protective';
    return '';
  };

  const chillerReferenceImage=(p={})=>{
    const slug=String(p.slug||'');
    const map={
      'teyu-cwfl-1000':'/assets/images/chiller.webp',
      'teyu-cwfl-1500':'/assets/images/prod-chiller.webp',
      'teyu-cwfl-2000':'/assets/images/prod-chiller-v22.webp',
      'teyu-cwfl-3000':'/assets/images/project-chiller.webp',
      'teyu-cwfl-4000':'/assets/images/project-chiller-v23.webp',
      'teyu-cwfl-6000':'/assets/images/project-chiller-v23b.webp',
      'fiber-laser-chiller-generic':'/assets/images/prod-chiller-v23.webp'
    };
    return map[slug]||'';
  };

  const chillerReferenceSprite=(p={})=>{
    const slug=String(p.slug||'');
    const map={
      'hanli-fiber-chiller':'sprite-chiller-unit-1',
      'tongfei-chiller':'sprite-chiller-unit-2',
      'co2-chiller':'sprite-chiller-unit-3',
      'handheld-laser-chiller':'sprite-chiller-unit-4'
    };
    return map[slug]||'';
  };

  let fallback={categories:[],brands:[],models:[],products:[]},live={categories:[],brands:[],models:[],products:[]};
  let categories=[],brands=[],models=[];
  try{
    if(!window.CG_CATALOG) throw new Error('Catalogue service unavailable');
    const snapshot=await window.CG_CATALOG.getSnapshot();
    categories=snapshot.categories||[];
    brands=snapshot.brands||[];
    models=snapshot.models||[];
    fallback.products=snapshot.fallback?.products||[];
    live.products=snapshot.live?.products||[];
    if(!live.products.length && snapshot.source==='supabase') live.products=snapshot.products||[];
    if(!fallback.products.length && snapshot.source!=='supabase') fallback.products=snapshot.products||[];
    document.documentElement.dataset.catalogSource=snapshot.source||'';
  }catch(_){
    count.textContent='Catalogue unavailable';
    results.innerHTML='<div class="empty" style="grid-column:1/-1"><b>Catalogue temporarily unavailable.</b><p>Send a part photo, nameplate, model or requirement and CG can review it directly.</p><a class="btn primary" href="/request-quote.html?requirement=Product%20Identification">Send requirement →</a></div>';
    return;
  }

  const brandNameById=Object.fromEntries(brands.map(x=>[String(x.id),x.name]));
  brand.innerHTML='<option value="">All brands</option>'+brands.map(x=>`<option value="${safe(String(x.id))}">${safe(x.name)}</option>`).join('');
  model.innerHTML='<option value="">All models</option>'+models.map(x=>`<option value="${safe(String(x.id))}">${safe(x.model_name)}</option>`).join('');
  category.innerHTML='<option value="">All categories</option>'+categories.map(x=>`<option value="${safe(String(x.id))}">${safe(x.name)}</option>`).join('');

  cats.innerHTML=categories.filter(x=>!x.parent_id).slice(0,24).map(x=>`<button class="finder-cat" data-cat="${safe(String(x.id))}"><b>${safe(x.name)}</b><small>${safe(x.short_description||'Browse compatible requirements')}</small></button>`).join('');

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
    'laser-chiller-spares':['chiller-spares'],
    'cnc-vmc-machine-spares':['cnc-vmc'],
    'press-brake-tooling':['press-brake'],
    'custom-obsolete-spares':['custom-obsolete']
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

  const fallbackImageBySlug=new Map((fallback.products||[]).map(p=>[
    String(p.slug||''),
    p.image_url||p.image||''
  ]));

  const resolveProductImage=(p={})=>{
    const liveCandidate=p.image_url||p.image||'';
    if(liveCandidate && !isGenericImage(liveCandidate)) return liveCandidate;
    const fallbackCandidate=fallbackImageBySlug.get(String(p.slug||''))||'';
    return fallbackCandidate||liveCandidate||'';
  };

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
      slug:p.slug||'',
      name:p.name||p.title||'Product',
      desc:p.short_description||p.description||p.subcategory||p.category||'',
      href:'/products/product-detail.html?slug='+encodeURIComponent(p.slug),
      brand:brandNameById[String(p.brand_id)]||'',
      meta:[p.manufacturer_part_number,p.model_number,p.cg_product_code,p.stock_status,p.lead_time||p.lead_time_note].filter(Boolean),
      image:resolveProductImage(p),
      sprite:''
    })));

    rows.push(...((fallback.products||[]).filter(p=>{
      const catMatch=fallbackCategoryMatch(p,catIds);
      const brandMatch=!selectedBrand||norm(p.brand)===norm(selectedBrandName);
      const modelMatch=!model.value||norm(p.model)===norm(selectedModel?.model_name)||termMatch(norm([p.name,p.model,(p.keywords||[]).join(' ')].join(' ')),norm(selectedModel?.model_name));
      const hay=norm([p.name,p.description,p.category,p.family,p.brand,p.model,(p.keywords||[]).join(' '),Object.values(p.specs||{}).join(' ')].filter(Boolean).join(' '));
      return catMatch&&brandMatch&&modelMatch&&(!terms.length||termsMatch(hay,terms));
    }).map(p=>({
      kind:'Catalogue reference',
      slug:p.slug||'',
      name:p.name,
      desc:p.description,
      href:p.href,
      brand:p.brand||'',
      meta:[p.model,p.category].filter(Boolean),
      image:resolveProductImage(p),
      sprite:''
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
        meta:[],
        image:'',
        sprite:''
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
        meta:[m.model_code].filter(Boolean),
        image:'',
        sprite:''
      })));
    }

    const seen=new Set();
    rows=rows.filter(x=>{const k=x.kind+'|'+x.name;if(seen.has(k))return false;seen.add(k);return true}).slice(0,72);
    count.textContent=`${rows.length} match${rows.length===1?'':'es'}`;
    results.innerHTML=rows.length?rows.map(x=>`<article class="finder-item">
      <a class="finder-media${x.image?'':' finder-media-pending'}" href="${safe(x.href)}" aria-label="Open ${safe(x.name)}">
        ${x.image?`<img src="${safe(x.image)}" alt="${safe(x.name)}" loading="lazy" decoding="async" onerror="this.closest('.finder-media').classList.add('finder-media-pending');this.replaceWith(Object.assign(document.createElement('span'),{className:'finder-image-pending',innerHTML:'<b>Image unavailable</b><small>Send the product reference to CG for identification.</small>'}))">`:`<span class="finder-image-pending"><b>Image pending</b><small>Send a clear part photo or model reference for identification.</small></span>`}
        <span class="finder-kind">${safe(x.kind)}</span>
      </a>
      <div class="finder-item-body">
        <h3>${safe(x.name)}</h3>
        <p>${safe(x.desc||'Technical details are confirmed before quotation.')}</p>
        <div class="finder-meta">${x.brand?`<span>${safe(x.brand)}</span>`:''}${(x.meta||[]).map(v=>`<span>${safe(v)}</span>`).join('')}</div>
        <div class="actions"><a class="btn dark" href="${safe(x.href)}">${x.kind==='Live product'?'View details':'Send requirement'} →</a></div>
      </div>
    </article>`}).join(''):`<div class="empty" style="grid-column:1/-1"><b>No exact match found.</b><p>Use a photo, nameplate, drawing, dimensions or part number. CG can help identify the requirement.</p><a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent(q.value||'Unidentified Laser Part')}">Send for identification →</a></div>`;
  }

  [q,brand,model,category].forEach(x=>x.addEventListener('input',render));
  $('#finder-clear')?.addEventListener('click',()=>{q.value='';brand.value='';model.value='';category.value='';render()});
  cats.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;category.value=b.dataset.cat;render();results.scrollIntoView({behavior:'smooth'})});
  const qs=new URLSearchParams(location.search);
  if(qs.get('q'))q.value=qs.get('q');
  render();
});