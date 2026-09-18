(() => {
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  function id(storageKey){
    try{
      let v=localStorage.getItem(storageKey);
      if(!v){v=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;localStorage.setItem(storageKey,v)}
      return v;
    }catch(_){return ''}
  }
  window.CGVisitorIds=()=>[id('cg_visitor_id'),id('cg_session_id')];

  function deviceType(){
    const w=window.innerWidth; return w<700?'mobile':w<1050?'tablet':'desktop';
  }
  function browserFamily(){
    const u=navigator.userAgent;
    if(/Edg\//.test(u)) return 'Edge'; if(/Chrome\//.test(u)) return 'Chrome'; if(/Firefox\//.test(u)) return 'Firefox'; if(/Safari\//.test(u)) return 'Safari'; return 'Other';
  }
  function osFamily(){
    const u=navigator.userAgent;
    if(/Windows/.test(u))return 'Windows'; if(/Android/.test(u))return 'Android'; if(/iPhone|iPad|iPod/.test(u))return 'iOS'; if(/Mac OS/.test(u))return 'macOS'; if(/Linux/.test(u))return 'Linux'; return 'Other';
  }
  async function track(eventType, metadata={}){
    const cfg=window.CG_CONFIG||{}, client=window.CG_SUPABASE;
    if(!client||!cfg.supabaseUrl)return;
    try{
      const qs=new URLSearchParams(location.search),ids=window.CGVisitorIds();
      await client.rpc('track_event',{
        p_visitor_id:ids[0]||null,p_session_id:ids[1]||null,p_event_type:eventType,
        p_page_path:location.pathname,p_page_title:document.title,
        p_product_slug:document.body.dataset.productSlug||null,p_division_slug:document.body.dataset.divisionSlug||null,
        p_referrer:document.referrer||null,p_source:qs.get('utm_source'),p_medium:qs.get('utm_medium'),p_campaign:qs.get('utm_campaign'),
        p_term:qs.get('utm_term'),p_content:qs.get('utm_content'),p_device_type:deviceType(),p_browser_family:browserFamily(),
        p_os_family:osFamily(),p_language:navigator.language||null,p_screen_size:`${screen.width}x${screen.height}`,p_metadata:metadata||{}
      });
    }catch(_){}
  }
  window.CGTrack=track;


  function ensureContactNav(){
    const nav=$('.nav'); if(!nav)return;
    const current=location.pathname.toLowerCase();
    const existing=$('.nav>a',nav).find(a=>{
      try{
        const p=new URL(a.getAttribute('href')||'',location.href).pathname.toLowerCase();
        return p==='/contact.html'||p==='/contact'||p.endsWith('/contact.html');
      }catch(_){return false}
    });
    if(existing){
      if(current==='/contact.html'||current.endsWith('/contact.html')){existing.classList.add('active');existing.setAttribute('aria-current','page')}
      return;
    }
    const a=document.createElement('a');
    a.href='/contact.html';a.textContent='Contact Us';a.className='contact-nav-link';
    if(current==='/contact.html'||current.endsWith('/contact.html')){a.classList.add('active');a.setAttribute('aria-current','page')}
    const quote=nav.querySelector('.quote-nav');
    if(quote)nav.insertBefore(a,quote);else nav.appendChild(a);
  }

  function enhanceDesignJobWork(){
    const path=location.pathname;
    const designUrl='/design-job-work.html';

    const designMega=$('.mega-grid a[href="/divisions/engineering-design.html"] small');
    if(designMega)designMega.textContent='2D/3D CAD, piping, drawings, DFM/DFA and reverse engineering';

    if(path==='/'||path.endsWith('/index.html')){
      const card=$$('.route-card').find(a=>/Design Something/i.test(a.querySelector('h3')?.textContent||'')||/Design%20Something/.test(a.getAttribute('href')||''));
      if(card){
        card.href=designUrl;
        const h=card.querySelector('h3'),p=card.querySelector('p'),tags=card.querySelector('.tags'),link=card.querySelector('.route-link');
        if(h)h.textContent='Mechanical Design Job Work';
        if(p)p.textContent='2D drafting, 3D modelling, piping layouts, manufacturing drawings, BOM and reverse engineering.';
        if(tags)tags.innerHTML='<span class="tag">2D / 3D CAD</span><span class="tag">Piping</span><span class="tag">Drawings</span>';
        if(link)link.textContent='Send design work →';
      }
      const chips=$('.quick-chips');
      if(chips&&!chips.querySelector('[data-copy-search="2D 3D piping design job work"]')){
        const b=document.createElement('button');b.type='button';b.dataset.copySearch='2D 3D piping design job work';b.textContent='2D / 3D / piping design';chips.prepend(b);
        b.addEventListener('click',()=>{const q=$('#cg-global-search');if(q){q.value=b.dataset.copySearch;q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}});
      }
    }

    if(path.endsWith('/mechanical-design-services-kolkata.html')){
      const primary=$('.service-hero .actions .btn.primary');
      if(primary){primary.href=designUrl;primary.textContent='Start a Design Job →'}
      const hero=$('.service-hero h1');if(hero)hero.textContent='MECHANICAL DESIGN, 2D / 3D CAD & PIPING';
      const hp=$('.service-hero h1 + p');if(hp)hp.textContent='Outsourced mechanical design job work covering 2D drafting, 3D part and assembly modelling, piping layouts, manufacturing drawings, BOM, revisions and reverse engineering.';
    }

    if(path.endsWith('/divisions/engineering-design.html')){
      const actions=$('.service-hero .actions');
      if(actions&&!actions.querySelector(`a[href="${designUrl}"]`)){
        const a=document.createElement('a');a.className='btn primary';a.href=designUrl;a.textContent='Start Design Job →';actions.prepend(a);
      }
    }

    const panel=$('.ask-panel');
    if(panel&&!panel.querySelector(`a[href="${designUrl}"]`)){
      const firstLink=panel.querySelector('a');
      const a=document.createElement('a');a.href=designUrl;a.textContent='2D / 3D / Piping Design';
      if(firstLink)panel.insertBefore(a,firstLink);else panel.appendChild(a);
    }
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const header=$('.site-header'); const scroll=()=>header?.classList.toggle('scrolled',scrollY>8);
    scroll(); addEventListener('scroll',scroll,{passive:true});
    const btn=$('.menu-btn'),nav=$('.nav');
    btn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open))});
    $$('.nav-group>button').forEach(b=>b.addEventListener('click',(e)=>{if(innerWidth<=1050){e.preventDefault();b.parentElement.classList.toggle('open')}}));
    const ab=$('.ask-btn'),ap=$('.ask-panel');
    ab?.addEventListener('click',()=>ap.classList.toggle('open'));
    document.addEventListener('click',(e)=>{if(ap?.classList.contains('open')&&!e.target.closest('.ask'))ap.classList.remove('open')});
    $$('[data-copy-search]').forEach(x=>x.addEventListener('click',()=>{const q=$('#cg-global-search');if(q){q.value=x.dataset.copySearch||x.textContent.trim();q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}}));

    const suite=$('.cg-suite-maintained');
    if(suite) suite.textContent='Site Maintained by Crecer Grande Website Suite V2.7.2';
    $('.cg-footer-version,.version-mark').forEach(x=>x.textContent='V2.7.2');

    ensureContactNav();
    enhanceDesignJobWork();

    document.addEventListener('click',(e)=>{
      const a=e.target.closest('a'); if(!a)return;
      if(/wa\.me/.test(a.href)) track('whatsapp_click',{href:a.href});
      else if(a.href.startsWith('mailto:')) track('email_click',{href:a.href});
      else if(/design-job-work\.html/.test(a.href)) track('design_job_click',{href:a.href});
      else if(a.classList.contains('quote-nav')||/request-quote/.test(a.href)) track('quote_click',{href:a.href});
    });
    setTimeout(()=>track('page_view'),300);
  });
})();