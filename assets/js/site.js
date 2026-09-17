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
    document.addEventListener('click',(e)=>{
      const a=e.target.closest('a'); if(!a)return;
      if(/wa\.me/.test(a.href)) track('whatsapp_click',{href:a.href});
      else if(a.href.startsWith('mailto:')) track('email_click',{href:a.href});
      else if(a.classList.contains('quote-nav')||/request-quote/.test(a.href)) track('quote_click',{href:a.href});
    });
    setTimeout(()=>track('page_view'),300);
  });
})();