(() => {
  'use strict';

  const FALLBACK_URL = '/assets/data/catalog-fallback.json';
  const LEGACY_LASER_URL = '/assets/data/laser-ecosystem.json';
  const FAMILY_BY_ROOT = {
    'laser-cutting-heads':'cutting-heads',
    'laser-spares-consumables':'consumables',
    'laser-chillers':'chillers',
    'laser-chiller-spares':'chiller-spares',
    'co2-laser-consumables':'co2',
    'laser-welding-consumables':'welding',
    'cnc-vmc-machine-spares':'cnc-vmc',
    'press-brake-tooling':'press-brake',
    'custom-obsolete-spares':'custom-obsolete'
  };
  const LIVE_QUERY_TIMEOUT_MS = 4500;
  const GENERIC_IMAGES = [
    'laser-components.webp','prod-spares-v23.webp','prod-laser-v23.webp','prod-chiller-v23.webp',
    'prod-pump-v23b.webp','project-co2-v23b.webp','service-laser-marking.webp','prod-cnc-v22.webp','prod-cnc-v23b.webp'
  ];

  let snapshotPromise = null;
  let fallbackPromise = null;

  const text = v => String(v ?? '').trim();
  const genericImage = url => {
    const value=String(url||'').toLowerCase();
    return !!value && GENERIC_IMAGES.some(name=>value.includes(name));
  };

  function getClient(){
    if(window.CG_SUPABASE) return window.CG_SUPABASE;
    const cfg=window.CG_CONFIG||{};
    if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey) return null;
    try{
      window.CG_SUPABASE=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
      return window.CG_SUPABASE;
    }catch(_){return null}
  }

  async function readJson(url){
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok) throw new Error('Catalogue cache unavailable');
    return response.json();
  }

  async function loadFallback(){
    if(fallbackPromise) return fallbackPromise;
    fallbackPromise=(async()=>{
      let data={categories:[],brands:[],models:[],products:[]};
      try{data=await readJson(FALLBACK_URL)}
      catch(_){
        try{
          const legacy=await readJson(LEGACY_LASER_URL);
          data.products=legacy.products||[];
        }catch(__){}
      }
      const categories=(data.categories||[]).map((x,i)=>({
        ...x,id:x.id||x.slug,slug:x.slug,name:x.name,parent_id:x.parent_id??x.parent??null,
        short_description:x.short_description||x.description||'',sort_order:x.sort_order??i
      }));
      const brands=(data.brands||[]).map((x,i)=>({
        ...x,id:x.id||x.slug||x.name,slug:x.slug||'',name:x.name,
        relationship_status:x.relationship_status||x.role||'',sort_order:x.sort_order??i
      }));
      const models=(data.models||[]).map((x,i)=>({
        ...x,id:x.id||('fallback-model-'+i),model_name:x.model_name||x.name||'Equipment model',
        model_code:x.model_code||x.code||'',aliases:x.aliases||x.keywords||[],
        brand_id:x.brand_id||x.brand||'',sort_order:x.sort_order??i
      }));
      const products=(data.products||[]).map((p,i)=>({
        ...p,id:p.id||('fallback-product-'+(p.slug||i)),source:'fallback-cache',
        name:p.name||p.title||'Catalogue reference',title:p.title||p.name||'Catalogue reference',
        short_description:p.short_description||p.description||'',description:p.description||p.short_description||'',
        image_url:genericImage(p.image_url||p.image)?'':(p.image_url||p.image||''),
        tags:p.tags||p.keywords||[],keywords:p.keywords||p.tags||[],
        specifications:p.specifications||p.specs||{},specs:p.specs||p.specifications||{},
        href:p.href||('/request-quote.html?requirement='+encodeURIComponent(p.name||p.title||'Industrial product')),
        sort_order:p.sort_order??i
      }));
      return {raw:data,categories,brands,models,products};
    })();
    return fallbackPromise;
  }

  async function queryPublished(client,table,limit){
    let timer=null;
    try{
      const query=client.from(table).select('*').eq('published',true).order('sort_order',{ascending:true}).limit(limit);
      const timeout=new Promise((_,reject)=>{
        timer=setTimeout(()=>reject(new Error(`Catalogue live query timed out: ${table}`)),LIVE_QUERY_TIMEOUT_MS);
      });
      const result=await Promise.race([query,timeout]);
      if(timer) clearTimeout(timer);
      return {ok:!result.error,data:result.error?[]:(result.data||[]),error:result.error||null};
    }catch(error){
      if(timer) clearTimeout(timer);
      return {ok:false,data:[],error};
    }
  }

  async function loadLive(){
    const client=getClient();
    if(!client) return {available:false,productsOk:false,categories:[],brands:[],models:[],products:[]};
    const [categories,brands,models,products]=await Promise.all([
      queryPublished(client,'product_categories',500),
      queryPublished(client,'product_brands',300),
      queryPublished(client,'equipment_models',500),
      queryPublished(client,'products',1000)
    ]);
    return {
      available:products.ok,
      productsOk:products.ok,
      categories:categories.data,
      brands:brands.data,
      models:models.data,
      products:products.data,
      errors:{categories:categories.error,brands:brands.error,models:models.error,products:products.error}
    };
  }

  function rootCategory(categoryId,categories){
    if(!categoryId) return null;
    const byId=new Map(categories.map(c=>[String(c.id),c]));
    let current=byId.get(String(categoryId))||null;
    const seen=new Set();
    while(current?.parent_id && !seen.has(String(current.id))){
      seen.add(String(current.id));
      current=byId.get(String(current.parent_id))||current;
      if(!current?.parent_id) break;
    }
    return current;
  }

  function inferFamily(product,categories){
    if(text(product.family)) return product.family;
    const root=rootCategory(product.category_id,categories);
    if(root?.slug && FAMILY_BY_ROOT[root.slug]) return FAMILY_BY_ROOT[root.slug];
    const hay=[product.category,product.subcategory,root?.slug,root?.name].filter(Boolean).join(' ').toLowerCase();
    if(hay.includes('co2')) return 'co2';
    if(hay.includes('welding')||hay.includes('cleaning')) return 'welding';
    if(hay.includes('chiller')&&(hay.includes('spare')||hay.includes('pump')||hay.includes('sensor'))) return 'chiller-spares';
    if(hay.includes('chiller')||hay.includes('cooling system')) return 'chillers';
    if(hay.includes('cutting head')) return 'cutting-heads';
    if(hay.includes('consumable')||hay.includes('nozzle')||hay.includes('optic')||hay.includes('ceramic')) return 'consumables';
    if(hay.includes('cnc')||hay.includes('vmc')||hay.includes('machine spare')) return 'cnc-vmc';
    if(hay.includes('press brake')||hay.includes('bending tool')) return 'press-brake';
    if(hay.includes('obsolete')||hay.includes('custom')) return 'custom-obsolete';
    return '';
  }

  function normalizeLiveProducts(rows,categories,brands,fallbackProducts=[]){
    const brandMap=new Map(brands.map(b=>[String(b.id),b.name]));
    const categoryMap=new Map(categories.map(c=>[String(c.id),c]));
    const fallbackImageBySlug=new Map((fallbackProducts||[]).map(p=>[
      text(p.slug),
      genericImage(p.image_url||p.image)?'':(p.image_url||p.image||'')
    ]));
    return (rows||[]).map((p,i)=>{
      const cat=categoryMap.get(String(p.category_id))||null;
      const liveImage=genericImage(p.image_url)?'':(p.image_url||'');
      const image=liveImage||fallbackImageBySlug.get(text(p.slug))||'';
      return {
        ...p,source:'supabase',family:inferFamily(p,categories),
        brand:p.brand||brandMap.get(String(p.brand_id))||'',
        model:p.model||p.model_number||'',
        category:p.category||p.subcategory||cat?.name||'Industrial Product',
        keywords:Array.isArray(p.tags)?p.tags:[],
        specs:(p.specifications&&typeof p.specifications==='object')?p.specifications:{},
        badge:p.badge||p.subcategory||p.category||cat?.name||'Live product',
        image_url:image,
        href:text(p.canonical_url)?(()=>{const u=new URL(p.canonical_url,location.origin);return u.pathname+u.search})():'/products/catalog/'+encodeURIComponent(p.slug||'')+'.html',
        sort_order:p.sort_order??i
      };
    });
  }

  function mergeCanonicalProducts(fallbackProducts,liveProducts){
    const fallbackRows=fallbackProducts||[];
    const liveRows=liveProducts||[];
    const liveBySlug=new Map(liveRows.filter(p=>text(p.slug)).map(p=>[text(p.slug),p]));
    const canonicalSlugs=new Set(fallbackRows.map(p=>text(p.slug)).filter(Boolean));
    const merged=fallbackRows.map((fallbackProduct,i)=>{
      const liveProduct=liveBySlug.get(text(fallbackProduct.slug));
      if(!liveProduct) return {...fallbackProduct,source:'fallback-cache',href:'/products/catalog/'+encodeURIComponent(fallbackProduct.slug||'')+'.html',sort_order:fallbackProduct.sort_order??i};
      const liveImage=genericImage(liveProduct.image_url)?'':text(liveProduct.image_url);
      return {
        ...fallbackProduct,
        ...liveProduct,
        source:'supabase',
        family:text(liveProduct.family)||text(fallbackProduct.family),
        image_url:liveImage||text(fallbackProduct.image_url||fallbackProduct.image),
        tags:Array.isArray(liveProduct.tags)&&liveProduct.tags.length?liveProduct.tags:(fallbackProduct.tags||fallbackProduct.keywords||[]),
        keywords:Array.isArray(liveProduct.search_keywords)&&liveProduct.search_keywords.length?liveProduct.search_keywords:(fallbackProduct.keywords||fallbackProduct.tags||[]),
        specifications:(liveProduct.specifications&&Object.keys(liveProduct.specifications).length)?liveProduct.specifications:(fallbackProduct.specifications||fallbackProduct.specs||{}),
        specs:(liveProduct.specifications&&Object.keys(liveProduct.specifications).length)?liveProduct.specifications:(fallbackProduct.specs||fallbackProduct.specifications||{}),
        href:'/products/catalog/'+encodeURIComponent(liveProduct.slug||fallbackProduct.slug||'')+'.html',
        sort_order:fallbackProduct.sort_order??liveProduct.sort_order??i
      };
    });
    const liveOnly=liveRows
      .filter(p=>text(p.slug)&&!canonicalSlugs.has(text(p.slug)))
      .map((p,i)=>({
        ...p,
        source:'supabase',
        href:text(p.canonical_url)?(()=>{const u=new URL(p.canonical_url,location.origin);return u.pathname+u.search})():'/products/catalog/'+encodeURIComponent(p.slug||'')+'.html',
        sort_order:p.sort_order??(fallbackRows.length+i)
      }));
    return [...merged,...liveOnly].sort((a,b)=>(Number(a.sort_order??999999)-Number(b.sort_order??999999))||text(a.name||a.title).localeCompare(text(b.name||b.title)));
  }

  async function buildSnapshot(){
    const [fallback,live]=await Promise.all([loadFallback(),loadLive()]);
    const liveProducts=normalizeLiveProducts(live.products,live.categories,live.brands,fallback.products);
    const products=mergeCanonicalProducts(fallback.products,liveProducts);
    const matchedLiveCount=products.filter(p=>p.source==='supabase').length;
    return {
      source:live.productsOk&&matchedLiveCount?'hybrid':'fallback-cache',
      categories:live.categories.length?live.categories:fallback.categories,
      brands:live.brands.length?live.brands:fallback.brands,
      models:live.models.length?live.models:fallback.models,
      products,
      live:{...live,products:liveProducts},
      fallback,
      status:{
        liveProductsReadable:live.productsOk,
        liveProductCount:liveProducts.length,
        liveCanonicalMatchCount:matchedLiveCount,
        fallbackProductCount:fallback.products.length,
        canonicalProductCount:products.length
      }
    };
  }

  async function getSnapshot(options={}){
    if(options.force) snapshotPromise=null;
    if(!snapshotPromise) snapshotPromise=buildSnapshot();
    return snapshotPromise;
  }

  async function getProducts(options={}){
    const snapshot=await getSnapshot();
    const family=text(options.family);
    const products=family?snapshot.products.filter(p=>p.family===family):snapshot.products;
    return {source:snapshot.source,products,snapshot};
  }

  async function getProductBySlug(slug){
    const wanted=text(slug);
    if(!wanted) return {source:'none',product:null,snapshot:await getSnapshot()};
    const snapshot=await getSnapshot();
    const canonical=snapshot.products.find(p=>p.slug===wanted);
    if(canonical) return {source:canonical.source||snapshot.source,product:canonical,snapshot};
    const live=snapshot.live.products.find(p=>p.slug===wanted);
    return {source:live?'supabase':'none',product:live||null,snapshot};
  }

  window.CG_CATALOG={getSnapshot,getProducts,getProductBySlug,refresh:()=>getSnapshot({force:true})};
})();