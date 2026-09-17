(()=>{
  const cfg=window.CG_CONFIG||{};
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const state={brands:[],models:[],categories:[],products:[],filters:{q:'',brand:'',equipment:'',category:''}};

  function qs(obj){return Object.entries(obj).filter(([,v])=>v).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}
  function requirementUrl(extra={}){
    const p={requirement:'Laser Products & Spares',...extra};
    return `../request-quote.html?${qs(p)}`;
  }
  function fillSelect(el,items,placeholder,valueKey='id',labelKey='name'){
    if(!el)return;
    el.innerHTML=`<option value="">${esc(placeholder)}</option>`+items.map(x=>`<option value="${esc(x[valueKey])}">${esc(x[labelKey])}</option>`).join('');
  }
  function catTree(){
    const byId=Object.fromEntries(state.categories.map(x=>[x.id,x]));
    return state.categories.map(x=>({...x,parent_name:x.parent_id&&byId[x.parent_id]?byId[x.parent_id].name:''}));
  }
  function renderCategories(){
    const host=$('#cg-category-grid'); if(!host)return;
    const roots=state.categories.filter(c=>!c.parent_id);
    const preferred=['laser-cutting-heads','laser-spares-consumables','laser-chillers','laser-chiller-spares','rapid-prototyping'];
    const sorted=[...roots].sort((a,b)=>{
      const ai=preferred.indexOf(a.slug),bi=preferred.indexOf(b.slug);
      if(ai!==-1||bi!==-1)return (ai===-1?999:ai)-(bi===-1?999:bi);
      return (a.sort_order||100)-(b.sort_order||100);
    });
    host.innerHTML=sorted.map(c=>{
      const children=state.categories.filter(x=>x.parent_id===c.id).slice(0,6);
      return `<button class="finder-category" data-category="${esc(c.id)}"><span class="finder-category-kicker">${children.length?`${children.length} sub-groups`:'Product group'}</span><strong>${esc(c.name)}</strong><small>${esc(c.short_description||'Search and send your exact requirement to Crecer Grande.')}</small><span class="finder-chips">${children.map(x=>`<i>${esc(x.name)}</i>`).join('')}</span></button>`;
    }).join('');
    $$('.finder-category',host).forEach(b=>b.addEventListener('click',()=>{state.filters.category=b.dataset.category;$('#category-filter').value=b.dataset.category;renderResults();document.querySelector('#finder-results')?.scrollIntoView({behavior:'smooth'});}));
  }
  function renderResults(){
    const host=$('#finder-results'); if(!host)return;
    const q=state.filters.q.trim().toLowerCase();
    const brandId=state.filters.brand;
    const equipmentId=state.filters.equipment;
    const categoryId=state.filters.category;
    const categoryMap=Object.fromEntries(state.categories.map(c=>[c.id,c]));
    let rows=state.products.filter(p=>p.published!==false);
    if(q) rows=rows.filter(p=>[p.name,p.title,p.description,p.short_description,p.model_number,p.manufacturer_part_number,p.cg_product_code,(p.search_keywords||[]).join(' '),(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(q));
    if(brandId) rows=rows.filter(p=>p.brand_id===brandId);
    if(categoryId){
      const childIds=new Set(state.categories.filter(c=>c.parent_id===categoryId).map(c=>c.id));
      rows=rows.filter(p=>p.category_id===categoryId||childIds.has(p.category_id));
    }
    if(equipmentId){
      const model=state.models.find(m=>m.id===equipmentId);
      if(model){
        const keys=[model.model_name,model.model_code,...(model.aliases||[])].filter(Boolean).map(x=>String(x).toLowerCase());
        rows=rows.filter(p=>keys.some(k=>[p.name,p.title,p.description,p.short_description,(p.search_keywords||[]).join(' '),(p.compatibility||[]).join(' ')].join(' ').toLowerCase().includes(k)));
      }
    }
    const count=$('#result-count'); if(count)count.textContent=`${rows.length} catalogue item${rows.length===1?'':'s'} found`;
    if(!rows.length){
      host.innerHTML=`<div class="finder-empty"><h3>Couldn’t find the exact part?</h3><p>That is expected for model-dependent industrial spares. Send a photo, nameplate, part number or drawing and Crecer Grande will review the requirement.</p><a class="btn primary" href="${requirementUrl({note:state.filters.q})}">Send requirement</a></div>`;return;
    }
    host.innerHTML=rows.slice(0,60).map(p=>{
      const cat=categoryMap[p.category_id];
      const brand=state.brands.find(b=>b.id===p.brand_id);
      return `<article class="finder-result-card"><div class="finder-result-top"><span>${esc(cat?.name||p.category||'Industrial product')}</span><span>${esc(p.stock_status||'RFQ')}</span></div><h3>${esc(p.name||p.title||'Product')}</h3><p>${esc(p.short_description||p.description||'Compatibility and exact specification confirmed before quotation.')}</p><div class="finder-meta">${brand?`<b>Brand reference:</b> ${esc(brand.name)}`:''}${p.model_number?`<b>Model:</b> ${esc(p.model_number)}`:''}${p.manufacturer_part_number?`<b>Part no.:</b> ${esc(p.manufacturer_part_number)}`:''}${p.cg_product_code?`<b>CG code:</b> ${esc(p.cg_product_code)}`:''}</div><div class="finder-result-actions"><a class="btn primary" href="${requirementUrl({product:p.name||p.title||'',model:p.model_number||'',part:p.manufacturer_part_number||''})}">Request price</a><a class="btn outline" href="${requirementUrl({product:p.name||p.title||'',check:'compatibility'})}">Check compatibility</a></div></article>`;
    }).join('');
  }
  function bind(){
    $('#finder-search')?.addEventListener('input',e=>{state.filters.q=e.target.value;renderResults()});
    $('#brand-filter')?.addEventListener('change',e=>{state.filters.brand=e.target.value;renderResults()});
    $('#equipment-filter')?.addEventListener('change',e=>{state.filters.equipment=e.target.value;renderResults()});
    $('#category-filter')?.addEventListener('change',e=>{state.filters.category=e.target.value;renderResults()});
    $('#finder-clear')?.addEventListener('click',()=>{state.filters={q:'',brand:'',equipment:'',category:''};['finder-search','brand-filter','equipment-filter','category-filter'].forEach(id=>{const el=$('#'+id);if(el)el.value=''});renderResults()});
  }
  async function init(){
    bind();
    if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey){$('#finder-results').innerHTML='<div class="finder-empty"><h3>Catalogue connection unavailable</h3><p>Please send your requirement directly and we will identify the correct part.</p><a class="btn primary" href="../request-quote.html?requirement=Laser%20Products%20%26%20Spares">Send requirement</a></div>';return;}
    const c=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
    try{
      const [cats,brands,models,products]=await Promise.all([
        c.from('product_categories').select('id,parent_id,slug,name,short_description,sort_order,published').eq('published',true).order('sort_order'),
        c.from('product_brands').select('id,slug,name,relationship_status,published').eq('published',true).order('sort_order'),
        c.from('equipment_models').select('id,equipment_type_id,brand_id,model_name,model_code,aliases,published,sort_order').eq('published',true).order('sort_order'),
        c.from('products').select('id,slug,name,title,category,category_id,brand_id,description,short_description,model_number,manufacturer_part_number,cg_product_code,compatibility,tags,search_keywords,stock_status,published,sort_order').eq('published',true).order('sort_order')
      ]);
      state.categories=cats.data||[];state.brands=brands.data||[];state.models=models.data||[];state.products=products.data||[];
      fillSelect($('#brand-filter'),state.brands,'All brands');
      fillSelect($('#equipment-filter'),state.models,'All head / chiller models','id','model_name');
      fillSelect($('#category-filter'),catTree().map(c=>({...c,label:c.parent_name?`${c.parent_name} → ${c.name}`:c.name})),'All categories','id','label');
      renderCategories();renderResults();
    }catch(err){console.error(err);$('#finder-results').innerHTML='<div class="finder-empty"><h3>Catalogue temporarily unavailable</h3><p>You can still send a requirement with a photograph, nameplate, drawing or part number.</p><a class="btn primary" href="../request-quote.html?requirement=Laser%20Products%20%26%20Spares">Send requirement</a></div>';}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();