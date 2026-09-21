document.addEventListener('DOMContentLoaded',async()=>{
  const host=document.getElementById('product-detail'); if(!host)return;
  const slug=new URLSearchParams(location.search).get('slug');
  if(!slug){host.innerHTML='<div class="empty">No product selected.</div>';return}
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const service=window.CG_CATALOG;
  if(!service){host.innerHTML='<div class="empty">Product catalogue is temporarily unavailable. Please send your requirement directly.</div>';return}
  try{
    const resolved=await service.getProductBySlug(slug);
    const p=resolved.product;
    if(!p){host.innerHTML='<div class="empty">This product is not published or could not be found.</div>';return}
    const client=window.CG_SUPABASE;
    let brand=p.brand?{name:p.brand}:null,compat=[];
    if(resolved.source==='supabase'&&client&&p.brand_id){
      const r=await client.from('product_brands').select('name,relationship_status,trademark_notice,authorization_note').eq('id',p.brand_id).maybeSingle();
      if(!r.error&&r.data)brand=r.data;
    }
    if(resolved.source==='supabase'&&client&&p.id){
      const cr=await client.from('product_compatibility').select('notes,equipment_models(model_name,model_code)').eq('product_id',p.id).eq('published',true).limit(100);
      if(!cr.error)compat=cr.data||[];
    }
    const specs=(p.specifications&&typeof p.specifications==='object')?p.specifications:((p.specs&&typeof p.specs==='object')?p.specs:{});
    const image=p.image_url||p.image||'';
    document.body.dataset.productSlug=p.slug||slug;
    document.body.dataset.catalogSource=resolved.source||'';
    const metaTitle=(p.seo_title||p.name)+' | Crecer Grande';
    const metaDescription=p.seo_description||p.short_description||p.description||'Technical catalogue product details and compatibility information from Crecer Grande.';
    const canonicalUrl=location.origin+'/products/product-detail.html?slug='+encodeURIComponent(p.slug||slug);
    document.title=metaTitle;
    const setMeta=(selector,attr,value)=>{const node=document.querySelector(selector);if(node&&value)node.setAttribute(attr,value)};
    setMeta('meta[name="description"]','content',metaDescription);
    setMeta('link[rel="canonical"]','href',canonicalUrl);
    setMeta('meta[property="og:title"]','content',metaTitle);
    setMeta('meta[property="og:description"]','content',metaDescription);
    setMeta('meta[property="og:url"]','content',canonicalUrl);
    setMeta('meta[name="twitter:title"]','content',metaTitle);
    setMeta('meta[name="twitter:description"]','content',metaDescription);
    if(image){
      const absoluteImage=new URL(image,location.origin).href;
      setMeta('meta[property="og:image"]','content',absoluteImage);
      setMeta('meta[name="twitter:image"]','content',absoluteImage);
    }
    host.innerHTML=`<div class="product-detail"><div class="product-gallery">${image?`<img src="${esc(image)}" alt="${esc(p.name)}">`:`<div class="finder-media-pending" style="min-height:360px"><span class="finder-image-pending"><b>Image pending</b><small>Send a clear part photo or model reference for identification.</small></span></div>`}</div><div><span class="badge">${esc(p.subcategory||p.category||'Industrial Product')}</span><h1>${esc(p.name)}</h1><p class="product-lede">${esc(p.short_description||p.description||'Technical product requirement available for review and quotation.')}</p>
      <div class="data-list">${brand?`<div class="data-row"><b>Brand reference</b><span>${esc(brand.name)}${brand.relationship_status==='reference_only'?' — compatibility/search reference':''}</span></div>`:''}${p.mpn||p.manufacturer_part_number?`<div class="data-row"><b>Part / MPN</b><span>${esc(p.mpn||p.manufacturer_part_number)}</span></div>`:''}${p.sku||p.cg_product_code?`<div class="data-row"><b>CG SKU</b><span>${esc(p.sku||p.cg_product_code)}</span></div>`:''}${p.stock_status?`<div class="data-row"><b>Status</b><span>${esc(p.stock_status)}</span></div>`:''}${p.lead_time_text||p.lead_time_note?`<div class="data-row"><b>Lead time</b><span>${esc(p.lead_time_text||p.lead_time_note)}</span></div>`:''}</div>
      <div class="product-actions"><a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent(p.name)}&machine_model=${encodeURIComponent(p.mpn||p.manufacturer_part_number||p.model||'')}">Request Price →</a><a class="btn outline" href="/products/laser-product-finder.html">Back to Finder</a></div>
      <div class="notice">Model-dependent components are checked against the actual equipment/head/chiller before quotation. Brand references do not imply authorization unless specifically stated.</div></div></div>
      ${Object.keys(specs).length?`<section class="section" style="padding-bottom:0"><div class="section-head"><div><div class="subhead">Technical data</div><h2>Specifications</h2></div></div><table class="spec-table">${Object.entries(specs).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(typeof v==='object'?JSON.stringify(v):v)}</td></tr>`).join('')}</table></section>`:''}
      ${compat.length?`<section class="section" style="padding-bottom:0"><div class="section-head"><div><div class="subhead">Compatibility</div><h2>Known catalogue relationships</h2></div></div><div class="compat-grid">${compat.map(x=>`<span>${esc(x.equipment_models?.model_name||'Equipment')}${x.equipment_models?.model_code?' · '+esc(x.equipment_models.model_code):''}</span>`).join('')}</div></section>`:''}`;
    const ld={"@context":"https://schema.org","@type":"Product","name":p.name,"description":p.short_description||p.description||undefined,"sku":p.sku||p.cg_product_code||undefined,"mpn":p.mpn||p.manufacturer_part_number||undefined,"image":image?[image]:undefined,"brand":brand?{"@type":"Brand","name":brand.name}:undefined};
    const s=document.createElement('script');s.type='application/ld+json';s.textContent=JSON.stringify(ld);document.head.appendChild(s);
  }catch(e){
    host.innerHTML=`<div class="empty">Could not load product details. <a href="/request-quote.html?requirement=${encodeURIComponent(slug)}">Send the requirement to CG →</a></div>`;
  }
});