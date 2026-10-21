(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  function removeLegacyStyleOverrides(){
    document.querySelectorAll('link[href*="/assets/css/precision-site.css"],link[href*="/assets/css/site-v5.css"]').forEach(node=>node.remove());
    document.body.classList.remove('cg-v5','cg-body-polish');
  }

  const TOPBAR = `<div class="topbar"><div class="container topbar-in"><div class="topbar-meta"><span data-site-field="gstin" data-site-prefix="GSTIN: ">GSTIN: 19BBJPB4158H1ZM</span><span data-site-field="udyam" data-site-prefix="Udyam: ">Udyam: UDYAM-WB-14-0231207</span><span>West Bengal, India</span></div><a data-site-field="instagram_handle" data-site-link="instagram" href="https://www.instagram.com/crecer_grande/" target="_blank" rel="noopener">@crecer_grande</a></div></div>`;

  const HEADER_HOME = "<header class=\"site-header\"><div class=\"container navrow\"><a class=\"brand\" href=\"/\" aria-label=\"Crecer Grande home\"><img class=\"cg-original-brand-logo\" src=\"/assets/images/Logo-R01.png\" alt=\"Crecer Grande\" width=\"2048\" height=\"786\" decoding=\"async\"></a><button class=\"menu-btn\" type=\"button\" aria-label=\"Toggle navigation\" aria-expanded=\"false\" aria-controls=\"site-navigation\"><span></span><span></span><span></span></button><nav class=\"nav\" id=\"site-navigation\" aria-label=\"Main navigation\"><a href=\"/engineering-desk.html\">Engineering Desk</a><a href=\"/services.html\">Services</a><a href=\"/projects.html\">Projects</a><a href=\"/insights.html\">Insights</a><a href=\"/about.html\">About</a><a href=\"/contact.html\">Contact Us</a><a class=\"quote-nav\" href=\"/request-quote.html\">Request a Quote \u2192</a></nav></div></header>";

  const HEADER = "<header class=\"site-header\"><div class=\"container navrow\"><a class=\"brand\" href=\"/\" aria-label=\"Crecer Grande home\"><img class=\"cg-original-brand-logo\" src=\"/assets/images/Logo-R01.png\" alt=\"Crecer Grande\" width=\"2048\" height=\"786\" decoding=\"async\"></a><button class=\"menu-btn\" type=\"button\" aria-label=\"Toggle navigation\" aria-expanded=\"false\" aria-controls=\"site-navigation\"><span></span><span></span><span></span></button><nav class=\"nav\" id=\"site-navigation\" aria-label=\"Main navigation\"><a href=\"/engineering-desk.html\">Engineering Desk</a><a href=\"/services.html\">Services</a><a href=\"/projects.html\">Projects</a><a href=\"/insights.html\">Insights</a><a href=\"/about.html\">About</a><a href=\"/contact.html\">Contact Us</a><a class=\"quote-nav\" href=\"/request-quote.html\">Request a Quote \u2192</a></nav></div></header>";

  const FOOTER_CTA = "<section class=\"cg-footer-cta\">\n<div class=\"container cg-footer-cta-inner\">\n<div>\n<h2>Have an engineering, manufacturing or operational requirement?</h2>\n<p>Send a drawing, sample, photograph, machine model, part number, document or problem statement. We will structure the most practical service route.</p>\n</div>\n<a class=\"cg-footer-cta-btn\" href=\"/request-quote.html\">Send Requirement</a>\n</div>\n</section>";
  const FOOTER = "<footer class=\"cg-footer\"><div class=\"container cg-footer-grid\"><div class=\"cg-footer-brand\"><a class=\"cg-footer-logo-link\" href=\"/\" aria-label=\"Crecer Grande home\"><img class=\"cg-original-brand-logo\" src=\"/assets/images/Logo-R01.png\" alt=\"Crecer Grande\" width=\"2048\" height=\"786\" decoding=\"async\"></a><p class=\"cg-footer-tagline\">Engineering ideas. Practical outcomes.</p><p class=\"cg-footer-desc\">Design, manufacturing and industrial support from Kolkata, West Bengal.</p></div><div class=\"cg-footer-col\"><h2 class=\"cg-footer-heading\">Explore</h2><a href=\"/engineering-desk.html\">Engineering Desk</a><a href=\"/services.html\">Services</a><a href=\"/divisions.html\">Capability divisions</a><a href=\"/projects.html\">Projects &amp; approaches</a><a href=\"/estimate.html\">Engineering tools</a><a href=\"/insights.html\">Insights &amp; guides</a></div><div class=\"cg-footer-col\"><h2 class=\"cg-footer-heading\">Company</h2><a href=\"/about.html\">About Crecer Grande</a><a href=\"/industries.html\">Industries</a><a href=\"/contact.html\">Contact Us</a><a href=\"/feedback.html\">Give feedback</a><a href=\"/privacy.html\">Privacy</a><a href=\"/disclaimer.html\">Disclaimer</a></div><div class=\"cg-footer-col cg-footer-contact\"><h2 class=\"cg-footer-heading\">Let\u2019s talk about your requirement.</h2><a class=\"cg-contact-line\" data-site-field=\"phone_primary\" data-site-link=\"tel\" href=\"tel:+917003301781\">+91 7003301781</a><a class=\"cg-contact-line\" data-site-field=\"email_primary\" data-site-link=\"mailto\" href=\"mailto:crecergrande@outlook.com\">crecergrande@outlook.com</a><p class=\"cg-contact-address\" data-site-field=\"address\">Plot No. LR-645, Mathpara Rd., Rajarhat, West Bengal \u2013 700135</p><div class=\"cg-footer-socials\"><a class=\"cg-social-pill\" aria-label=\"WhatsApp Crecer Grande\" href=\"https://wa.me/916291001781\" target=\"_blank\" rel=\"noopener\">WhatsApp \u2192</a><a class=\"cg-social-pill\" aria-label=\"Instagram Crecer Grande\" href=\"https://www.instagram.com/crecer_grande/\" target=\"_blank\" rel=\"noopener\">Instagram \u2192</a></div></div></div><div class=\"container cg-footer-bottom\"><span>\u00a9 2026 Crecer Grande. All rights reserved.</span><span>From the first question to the next practical step.</span><a class=\"cg-admin-login\" href=\"/admin/\" rel=\"nofollow\">Admin login</a></div></footer>";

  function injectHeaderStyles(){
    if($('#cg-common-header-style')) return;
    const style = document.createElement('style');
    style.id = 'cg-common-header-style';
    style.textContent = `
      .topbar{display:none!important}
      .site-header{
        position:sticky!important;
        top:0!important;
        z-index:90!important;
        background:rgba(255,255,255,.96)!important;
        border-bottom:1px solid #e5e1d8!important;
        box-shadow:0 4px 20px rgba(10,36,64,.05)!important;
        backdrop-filter:blur(14px)!important;
      }
      .site-header .navrow{
        min-height:82px!important;
        width:min(1180px,calc(100% - 44px))!important;
        margin:0 auto!important;
        padding:0!important;
      }
      .site-header .brand img{
        width:205px!important;
        height:auto!important;
        max-height:58px!important;
        object-fit:contain!important;
        object-position:left center!important;
      }
      .site-header .nav{
        gap:4px!important;
        align-items:center!important;
      }
      .site-header .nav>a{
        color:#17324e!important;
        font-size:12px!important;
        font-weight:700!important;
        padding:10px 11px!important;
        border-radius:0!important;
        background:transparent!important;
      }
      .site-header .nav>a:hover{color:#b88420!important}
      .site-header .nav .quote-nav{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:48px!important;
        margin-left:10px!important;
        padding:0 19px!important;
        border:1px solid #b98a2f!important;
        border-radius:2px!important;
        background:#f0b400!important;
        color:#071a36!important;
        box-shadow:none!important;
        white-space:nowrap!important;
        font-size:12px!important;
        font-weight:800!important;
      }
      .site-header .nav .quote-nav:hover{
        background:#ffc51a!important;
        border-color:#ffc51a!important;
        color:#071a36!important;
      }
      @media(max-width:1050px){
        .site-header .navrow{min-height:70px!important}
        .site-header .brand img{width:180px!important}
        .site-header .nav{
          top:70px!important;
          gap:8px!important;
          padding:12px 20px 20px!important;
          background:#fff!important;
        }
        .site-header .nav>a{
          display:block!important;
          width:100%!important;
          text-align:left!important;
          padding:11px 8px!important;
        }
        .site-header .nav .quote-nav{
          width:100%!important;
          margin:8px 0 0!important;
          text-align:center!important;
        }
      }
      @media(max-width:680px){
        .site-header .navrow{width:min(100% - 28px,1180px)!important}
        .site-header .brand img{width:154px!important}
      }`;
    document.head.appendChild(style);
  }

  // Page markup now references validated image assets directly.
  function applyServiceFirstArt(){ /* Keep page hero artwork image-free. */ }

  function removeDuplicateTerminalCta(){
    const sharedCta=document.querySelector('.cg-footer-cta');
    const main=document.querySelector('main');
    if(!sharedCta||!main) return;
    let last=main.lastElementChild;
    if(!last) return;

    const isTerminalCta=(el)=>{
      const cls=String(el.className||'');
      const classLooksLikeCta=/(^|[\s_-])(cta|final|close|band)([\s_-]|$)/i.test(cls) ||
        /(pr-final|pr-band|ed-home-cta|am-final|am2-final|am3-final|dv4-detail-close|elite-final|service-final)/i.test(cls);
      if(!classLooksLikeCta) return false;
      if(el.querySelector('form')) return false;
      const links=[...el.querySelectorAll('a[href]')];
      const hasRequirementLink=links.some(a=>/request-quote|contact\.html|engineering-desk/i.test(a.getAttribute('href')||''));
      const text=(el.textContent||'').replace(/\s+/g,' ').trim();
      return hasRequirementLink && text.length<900;
    };

    while(last && isTerminalCta(last)){
      const prev=last.previousElementSibling;
      last.remove();
      last=prev;
    }
  }

  function syncCommonFooter(){
    const path = location.pathname.toLowerCase();
    if(path.includes('/admin/')||path==='/'||path==='/index.html') return;
    const oldFooter = $('.cg-footer');
    if(!oldFooter) return;
    const oldCta = $('.cg-footer-cta');
    if(oldCta) oldCta.outerHTML = FOOTER_CTA;
    else oldFooter.insertAdjacentHTML('beforebegin', FOOTER_CTA);
    $('.cg-footer').outerHTML = FOOTER;
    document.body.classList.add('cg-common-footer-applied');
  }

  function syncCommonHeader(){
    const path = location.pathname.toLowerCase();
    if(path.includes('/admin/')||path==='/'||path==='/index.html') return;
    const oldHeader = $('.site-header');
    if(!oldHeader) return;
    const oldTopbar = $('.topbar');
    if(oldTopbar) oldTopbar.outerHTML = TOPBAR;
    else oldHeader.insertAdjacentHTML('beforebegin', TOPBAR);
    $('.site-header').outerHTML = (path==='/'||path==='/index.html') ? HEADER_HOME : HEADER;
    document.body.classList.add('cg-common-header-applied');
    injectHeaderStyles();
  }




  const CG_FEEDBACK_TAB = `<a class="cg-feedback-tab" href="/feedback.html" aria-label="Give us your feedback"><span>Give us your Feedback!</span></a>`;

  function normalizeFeedbackTab(){
    const path=(location.pathname||'/').toLowerCase();
    if(path.includes('/admin/') || path==='/feedback.html') return;
    document.querySelectorAll('.cg-feedback-tab').forEach(x=>x.remove());
  }

  const BOTCHA = `<div class="ask cg-botcha" data-botcha-root>
    <button class="cg-botcha-launcher" type="button" aria-expanded="false" aria-controls="cg-botcha-panel" aria-label="Open Botcha virtual assistant">
      <span class="cg-botcha-mark" aria-hidden="true">B</span>
      <span class="cg-botcha-launch-copy"><b>Ask Botcha</b><small>Engineering service guide</small></span>
      <span class="cg-botcha-live-dot" aria-hidden="true"></span>
    </button>
    <section class="cg-botcha-chat" id="cg-botcha-panel" role="dialog" aria-label="Botcha virtual assistant" aria-hidden="true">
      <header class="cg-botcha-head">
        <span class="cg-botcha-mark" aria-hidden="true">B</span>
        <div class="cg-botcha-head-copy"><h2 class="cg-botcha-title">Botcha !</h2><p>Virtual engineering assistant</p></div>
        <span class="cg-botcha-ai-badge">AI ASSIST</span>
        <button class="cg-botcha-close" type="button" aria-label="Close Botcha">×</button>
      </header>
      <div class="cg-botcha-context"><strong>Ask about CG services, machines, drawings or quotations</strong><span class="cg-botcha-status">Service guide</span></div>
      <div class="cg-botcha-messages" aria-live="polite" aria-relevant="additions text"></div>
      <div class="cg-botcha-quick" aria-label="Suggested questions"></div>
      <form class="cg-botcha-form">
        <textarea class="cg-botcha-input" rows="1" maxlength="900" placeholder="Ask Botcha a question…" aria-label="Message Botcha"></textarea>
        <button class="cg-botcha-send" type="submit" aria-label="Send message">→</button>
      </form>
      <footer class="cg-botcha-foot">
        <a href="https://wa.me/916291001781" target="_blank" rel="noopener">Human help →</a>
        <span>Guidance only. Final scope and technical commitments are reviewed by the CG team.</span>
      </footer>
    </section>
  </div>`;

  function ensureBotchaAssets(){
    if(!document.querySelector('link[data-cg-botcha-css]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='/assets/css/botcha.css?v=2.0.0';
      link.dataset.cgBotchaCss='1';
      document.head.appendChild(link);
    }
    if(!document.querySelector('script[src^="/assets/js/botcha.js"]')){
      const script=document.createElement('script');
      script.src='/assets/js/botcha.js?v=2.0.0';
      script.dataset.cgBotchaJs='1';
      script.defer=true;
      document.body.appendChild(script);
    }
  }

  function normalizeBotcha(){
    const path=(location.pathname||'/').toLowerCase();
    if(path.includes('/admin/')) return;
    document.querySelectorAll('.ask').forEach(x=>x.remove());
    document.body.insertAdjacentHTML('beforeend',BOTCHA);
    ensureBotchaAssets();
    document.dispatchEvent(new Event('cg:botcha-ready'));
  }

  function normalizeAdminLogin(){
    const path=(location.pathname||'/').toLowerCase();
    if(path.includes('/admin/')) return;
    const bottom=$('.cg-footer-bottom');
    if(!bottom) return;
    let admin=bottom.querySelector('.cg-admin-login');
    if(!admin){
      admin=document.createElement('a');
      admin.className='cg-admin-login';
      admin.href='/admin/';
      admin.rel='nofollow';
      admin.textContent='Admin Login';
      bottom.appendChild(admin);
    }
  }

  function enhanceCreativeExperience(){
    const path=(location.pathname||'/').toLowerCase();
    if(path.includes('/admin/')) return;

    const nav=$('.site-header .nav');
    if(nav){
      const seen=new Set();
      [...nav.querySelectorAll('a[href]')].forEach(a=>{
        const href=(a.getAttribute('href')||'').split('#')[0];
        const key=href+'|'+(a.textContent||'').trim().toLowerCase();
        if(seen.has(key)){a.remove();return}
        seen.add(key);
        const target=href.toLowerCase();
        const active=(path===target) ||
          (path==='/' && target==='/') ||
          (path.startsWith('/divisions/') && target==='/divisions.html') ||
          (path.startsWith('/projects/') && target==='/projects.html') ||
          (path.startsWith('/insights/') && target==='/insights.html');
        if(active){a.classList.add('active');a.setAttribute('aria-current','page')}
      });
    }

    const heroSelectors='.pr-hero,.page-hero,.content-hero,.service-hero,.dv4-detail-hero,.ed5-hero,.am3-hero,.elite-detail-hero,.contact-v27-hero,.quote-v27-hero';
    $$(heroSelectors).forEach(hero=>hero.classList.add('cg-creative-hero'));

    const motionTargets=$$('main .section,main .pr-section,main .pr-card,main .visual-card,main .case-card,main .case-study-card,main .resource-card,main .insight-related-card,main .dv4-cap-grid article,main .ed5-cap-grid article');
    motionTargets.forEach((el,i)=>{
      el.classList.add('cg-reveal');
      el.style.setProperty('--cg-reveal-delay',Math.min((i%5)*45,180)+'ms');
    });
    document.body.classList.add('cg-motion-ready');

    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!reduce && 'IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}
        });
      },{rootMargin:'0px 0px -7% 0px',threshold:.06});
      motionTargets.forEach(el=>io.observe(el));
    }else{
      motionTargets.forEach(el=>el.classList.add('is-visible'));
    }

    $$('main img:not([loading])').forEach((img,i)=>{
      const inHero=!!img.closest(heroSelectors);
      if(!inHero) img.loading='lazy';
      img.decoding='async';
      if(i>0 && !img.fetchPriority) img.fetchPriority='low';
    });
  }

  function id(storageKey,storage){
    try{let v=storage.getItem(storageKey);if(!v){v=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;storage.setItem(storageKey,v)}return v}catch(_){return ''}
  }
  window.CGVisitorIds=()=>[id('cg_visitor_id',localStorage),id('cg_session_id',sessionStorage)];

  async function track(eventType, metadata={}){
    const cfg=window.CG_CONFIG||{}, client=window.CG_SUPABASE;
    if(!client||!cfg.supabaseUrl)return;
    try{
      const qs=new URLSearchParams(location.search),ids=window.CGVisitorIds();
      await client.rpc('track_event',{p_visitor_id:ids[0]||null,p_session_id:ids[1]||null,p_event_type:eventType,p_page_path:location.pathname,p_page_title:document.title,p_product_slug:document.body.dataset.productSlug||null,p_division_slug:document.body.dataset.divisionSlug||null,p_referrer:document.referrer||null,p_source:qs.get('utm_source'),p_medium:qs.get('utm_medium'),p_campaign:qs.get('utm_campaign'),p_term:qs.get('utm_term'),p_content:qs.get('utm_content'),p_device_type:innerWidth<700?'mobile':innerWidth<1050?'tablet':'desktop',p_browser_family:(navigator.userAgent||'').slice(0,100),p_os_family:navigator.platform||'',p_language:navigator.language||null,p_screen_size:`${screen.width}x${screen.height}`,p_metadata:metadata||{}});
    }catch(_){}
  }
  window.CGTrack=track;

  function normalizeContactLabels(){
    document.querySelectorAll('header a[href="/contact.html"], footer a[href="/contact.html"], .site-header a[href="/contact.html"], .cg-footer a[href="/contact.html"]').forEach(a=>{
      if((a.textContent||'').trim().toLowerCase()==='contact') a.textContent='Contact Us';
    });
    document.querySelectorAll('.cg-footer-contact h4').forEach(h=>{
      if((h.textContent||'').trim().toLowerCase()==='contact') h.textContent='Contact Us';
    });
  }

  function ensureExperienceStyles(){
    const path=(location.pathname||'/').toLowerCase();
    if(path.includes('/admin/')) return;
    let link=document.querySelector('link[data-cg-experience]');
    if(!link){
      link=document.createElement('link');
      link.rel='stylesheet';
      link.href='/assets/css/experience.css?v=1.0.0';
      link.dataset.cgExperience='1';
    }
    document.head.appendChild(link);
  }

  function boot(){
    removeLegacyStyleOverrides();
    applyServiceFirstArt();
    syncCommonHeader();
    syncCommonFooter();
    removeDuplicateTerminalCta();
    normalizeAdminLogin();
    normalizeFeedbackTab();
    normalizeBotcha();
    normalizeContactLabels();
    ensureExperienceStyles();
    enhanceCreativeExperience();
    const header=$('.site-header'); const scroll=()=>header?.classList.toggle('scrolled',scrollY>8);
    scroll(); addEventListener('scroll',scroll,{passive:true});
    const btn=$('.menu-btn'),nav=$('.nav');
    if(btn&&nav){
      nav.id='site-navigation';
      btn.setAttribute('aria-controls',nav.id);
      const closeMenu=()=>{nav.classList.remove('open');btn.setAttribute('aria-expanded','false')};
      btn.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open))});
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();btn.focus()}});
      document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu()});
      nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu()});
      matchMedia('(min-width:1051px)').addEventListener('change',closeMenu);
    }
    $$('.nav-group>button').forEach(b=>b.addEventListener('click',(e)=>{if(innerWidth<=1050){e.preventDefault();b.parentElement.classList.toggle('open')}}));
    $$('[data-copy-search]').forEach(x=>x.addEventListener('click',()=>{const q=$('#cg-global-search');if(q){q.value=x.dataset.copySearch||x.textContent.trim();q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}}));
    document.addEventListener('click',(e)=>{const a=e.target.closest('a'); if(!a)return; if(/wa\.me/.test(a.href)) track('click_whatsapp',{href:a.href}); else if(a.href.startsWith('tel:')) track('click_phone',{href:a.href}); else if(a.href.startsWith('mailto:')) track('click_email',{href:a.href}); else if(/instagram\.com/.test(a.href)) track('outbound_instagram',{href:a.href});});
    setTimeout(()=>track('page_view'),300);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();

