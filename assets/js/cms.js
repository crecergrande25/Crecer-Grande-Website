(() => {
  const RELEASE_CUTOFF = new Date('2026-09-22T07:00:00Z').getTime();
  const text = v => String(v ?? '').trim();
  const setMeta = (selector, attr, value) => {
    const node=document.querySelector(selector);
    if(node && text(value)) node.setAttribute(attr,text(value));
  };
  const setText = (selector,value) => {
    const node=document.querySelector(selector);
    if(node && text(value)) node.textContent=value;
  };

  function applySiteSettings(data){
    const navy=data.color_navy||data.theme_navy;
    const gold=data.color_gold||data.theme_gold;
    if(navy)document.documentElement.style.setProperty('--navy',navy);
    if(gold)document.documentElement.style.setProperty('--gold',gold);
    document.querySelectorAll('[data-site-field]').forEach(el=>{
      const key=el.dataset.siteField,value=data[key];
      if(value==null||value==='')return;
      el.textContent=(el.dataset.sitePrefix||'')+value;
      if(el.dataset.siteLink==='tel')el.href='tel:'+String(value).replace(/[^\d+]/g,'');
      if(el.dataset.siteLink==='mailto')el.href='mailto:'+value;
      if(el.dataset.siteLink==='instagram')el.href=data.instagram_url||String(value);
      if(el.dataset.siteLink==='whatsapp')el.href='https://wa.me/'+String(value).replace(/\D/g,'');
    });
    if(data.logo_url)document.querySelectorAll('[data-site-src="logo_url"]').forEach(img=>img.src=data.logo_url);
  }

  function applyHomepage(data){
    if(!data)return;
    setText('.cg-home-copy .eyebrow',data.hero_eyebrow);
    const h1=document.querySelector('.cg-home-copy h1');
    if(h1&&(text(data.hero_line1)||text(data.hero_line2)||text(data.hero_line3))){
      h1.textContent='';
      const prefix=document.createTextNode([data.hero_line1,data.hero_line3].filter(Boolean).join(' ')+(data.hero_line2?' ':''));
      h1.appendChild(prefix);
      if(data.hero_line2){
        const em=document.createElement('em');
        em.textContent=data.hero_line2;
        h1.appendChild(em);
      }
    }
    setText('.cg-home-copy > p',data.hero_description);
    setText('.cg-home-quick-links-section .section-head h2',data.start_heading);
    setText('.cg-home-quick-links-section .section-head > p',data.start_description);
    setText('.cg-home-divisions-section .section-head h2',data.divisions_heading);
    setText('.cg-home-divisions-section .section-head > p',data.divisions_description);
    setText('.cg-home-why-section .section-head h2',data.why_heading);
    setText('.cg-home-why-section .section-head > p',data.why_description);
    setText('.cg-home-featured-section .section-head h2',data.featured_heading);
    setText('.cg-home-featured-section .section-head > p',data.featured_description);
    setText('.cg-home-final-cta-box h2',data.cta_heading);
    setText('.cg-home-final-cta-box p',data.cta_description);
  }

  function applyFreshPageContent(data){
    if(!data||!data.published)return;
    const updated=new Date(data.updated_at||0).getTime();
    if(!updated||updated<RELEASE_CUTOFF)return;
    if(text(data.seo_title))document.title=data.seo_title;
    setMeta('meta[name="description"]','content',data.seo_description);
    setMeta('link[rel="canonical"]','href',data.canonical_url);
    const hero=document.querySelector('main .page-hero, main .cg-premium-hero');
    if(hero){
      const h1=hero.querySelector('h1');
      const p=hero.querySelector('p');
      if(h1&&text(data.title))h1.textContent=data.title;
      if(p&&text(data.intro))p.textContent=data.intro;
    }
  }

  async function applyFreshDivision(client){
    const match=location.pathname.match(/^\/divisions\/([^/]+)\.html$/i);
    if(!match)return;
    const slug=decodeURIComponent(match[1]);
    const {data}=await client.from('divisions').select('*').eq('slug',slug).eq('published',true).maybeSingle();
    if(!data)return;
    const updated=new Date(data.updated_at||0).getTime();
    if(!updated||updated<RELEASE_CUTOFF)return;
    const hero=document.querySelector('main .page-hero, main .cg-premium-hero, main section:first-of-type');
    if(hero){
      const h1=hero.querySelector('h1');
      const p=hero.querySelector('p');
      if(h1&&text(data.title||data.name))h1.textContent=data.title||data.name;
      if(p&&text(data.short_description||data.summary||data.description))p.textContent=data.short_description||data.summary||data.description;
    }
    if(text(data.image_url)){
      const img=hero?.querySelector('img');
      if(img)img.src=data.image_url;
    }
  }

  async function boot(){
    const cfg=window.CG_CONFIG||{};
    if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey)return;
    try{
      const client=window.CG_SUPABASE||window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
      window.CG_SUPABASE=client;
      const {data:settings}=await client.from('site_settings').select('*').eq('id','main').maybeSingle();
      if(settings)applySiteSettings(settings);

      const pageSlug=document.body.dataset.pageSlug||'';
      if(pageSlug==='home'||location.pathname==='/'||location.pathname==='/index.html'){
        const {data:home}=await client.from('homepage_content').select('*').eq('id','main').maybeSingle();
        if(home)applyHomepage(home);
      }

      const canonical=location.origin+location.pathname;
      const {data:page}=await client.from('page_content')
        .select('*')
        .eq('published',true)
        .or(`canonical_url.eq.${canonical},canonical_url.eq.${canonical.replace(/\/$/,'')}`)
        .order('updated_at',{ascending:false})
        .limit(1)
        .maybeSingle();
      if(page)applyFreshPageContent(page);
      await applyFreshDivision(client);
    }catch(_){}
  }
  document.addEventListener('DOMContentLoaded',boot);
})();