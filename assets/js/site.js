(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const CG_VERSION = 'V2.8.1';

  const TOPBAR = `<div class="topbar"><div class="container topbar-in"><div class="topbar-meta"><span data-site-field="gstin" data-site-prefix="GSTIN: ">GSTIN: 19BBJPB4158H1ZM</span><span data-site-field="udyam" data-site-prefix="Udyam: ">Udyam: UDYAM-WB-14-0231207</span><span>West Bengal, India</span></div><a data-site-field="instagram_handle" data-site-link="instagram" href="https://www.instagram.com/crecer_grande/" target="_blank" rel="noopener">@crecer_grande</a></div></div>`;

  const HEADER = `<header class="site-header"><div class="container navrow"><a class="brand" href="/" aria-label="Crecer Grande home"><img src="/assets/images/logo.png" data-site-src="logo_url" alt="Crecer Grande" decoding="async" width="740" height="208"></a><button class="menu-btn" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button><nav class="nav" aria-label="Main navigation"><div class="nav-group"><button type="button">Solutions</button><div class="mega"><div class="mega-grid"><a href="/divisions/advanced-manufacturing.html"><b>Advanced Manufacturing</b><small>3D printing, laser, fabrication and machining</small></a><a href="/divisions/engineering-design.html"><b>Engineering &amp; Design</b><small>CAD, drawings, DFM/DFA and reverse engineering</small></a><a href="/divisions/machine-maintenance.html"><b>Machine Maintenance</b><small>Breakdown, PM and restoration support</small></a><a href="/divisions/automation-solutions.html"><b>Automation Solutions</b><small>PLC, HMI, I/O, sensors and control hardware</small></a><a href="/divisions/quality-management-systems.html"><b>Quality &amp; Management Systems</b><small>QMS, SOPs, RCA/CAPA and audit readiness</small></a><a href="/divisions/inspection-testing.html"><b>Inspection &amp; Testing</b><small>FAI, dimensional / visual verification and follow-up</small></a><a href="/divisions/tender-business-development.html"><b>Tender &amp; Business Development</b><small>GeM, tender review and submission support</small></a><a href="/divisions/business-support-compliance.html"><b>Business Support &amp; Compliance</b><small>Industrial registrations, employer-account and vendor support</small></a></div></div></div><a href="/engineering-desk.html">Engineering Desk</a><a href="/products.html">Products</a><a href="/resources.html">Resources</a><a href="/insights.html">Insights</a><a href="/about.html">About</a><a class="quote-nav" href="/request-quote.html">Request a Quote</a><a class="contact-nav" href="/contact.html">Contact Us</a><a class="admin-nav" href="/admin/" rel="nofollow">Admin Login</a></nav></div></header>`;

  function injectHeaderStyles(){
    if($('#cg-common-header-style')) return;
    const style = document.createElement('style');
    style.id = 'cg-common-header-style';
    style.textContent = `.nav .contact-nav,.nav .contact-nav-link{border:1px solid rgba(7,26,54,.22)!important;background:#fff!important;color:#071a36!important;padding-inline:17px!important;border-radius:12px!important;box-shadow:0 8px 20px rgba(7,26,54,.05);white-space:nowrap}.nav .contact-nav:hover,.nav .contact-nav-link:hover{background:#071a36!important;color:#fff!important;border-color:#071a36!important}.nav .admin-nav{border:1px solid rgba(7,26,54,.24)!important;background:#fff!important;color:#071a36!important;padding-inline:17px!important;border-radius:12px!important;white-space:nowrap}.nav .admin-nav:hover{background:#f4f7fb!important;color:#071a36!important}.nav .quote-nav{white-space:nowrap}.nav{gap:5px}@media(max-width:1180px){.nav>a,.nav-group>button{padding-left:9px!important;padding-right:9px!important}.brand img{width:175px}}@media(max-width:1050px){.nav .contact-nav,.nav .contact-nav-link,.nav .admin-nav,.nav .quote-nav{width:100%;text-align:center;justify-content:center}.nav{gap:8px}}`;
    document.head.appendChild(style);
  }

  function injectFooterStyles(){
    if($('#cg-footer-compact-style')) return;
    const style = document.createElement('style');
    style.id = 'cg-footer-compact-style';
    style.textContent = `.cg-footer{padding:36px 0 14px!important}.cg-footer-grid{gap:32px!important}.cg-footer-logo-link img{width:200px!important;margin-bottom:14px!important}.cg-footer-tagline{margin-bottom:10px!important}.cg-footer-desc{margin-bottom:12px!important}.cg-footer-col h4{margin-bottom:12px!important}.cg-footer-col>a{margin-bottom:8px!important}.cg-footer-contact .cg-contact-line{margin-bottom:9px!important}.cg-contact-address{margin-top:2px!important}.cg-footer-socials{margin-top:12px!important}.cg-footer-bottom{margin-top:24px!important;padding-top:14px!important}.cg-footer-versionblock{display:flex!important;flex-direction:column!important;align-items:flex-end!important;gap:0!important}.cg-footer-versionblock .cg-footer-version,.cg-footer-versionblock .version-mark{display:none!important}@media(max-width:760px){.cg-footer{padding:30px 0 18px!important}.cg-footer-grid{gap:26px!important}.cg-footer-bottom{grid-template-columns:1fr!important;text-align:left!important}.cg-footer-versionblock{align-items:flex-start!important}.cg-footer-bottom span:nth-child(2),.cg-footer-bottom span:last-child{text-align:left!important}}`;
    document.head.appendChild(style);
  }

  function normalizeFooter(){
    injectFooterStyles();
    const label = `Site maintained by Crecer Grande Website Suite ${CG_VERSION}`;
    $$('.cg-suite-maintained').forEach(x => x.textContent = label);
    $$('.cg-footer-version,.version-mark').forEach(x => x.textContent = CG_VERSION);
    $$('.cg-footer-versionblock').forEach(block => {
      const suite = block.querySelector('.cg-suite-maintained');
      if(suite) suite.textContent = label;
      [...block.children].forEach(child => {
        if(child !== suite && (child.classList.contains('cg-footer-version') || child.classList.contains('version-mark'))) child.setAttribute('aria-hidden','true');
      });
    });
  }

  function syncCommonHeader(){
    const path = location.pathname.toLowerCase();
    if(path.includes('/admin/')) return;
    const oldHeader = $('.site-header');
    if(!oldHeader) return;
    const oldTopbar = $('.topbar');
    if(oldTopbar) oldTopbar.outerHTML = TOPBAR;
    else oldHeader.insertAdjacentHTML('beforebegin', TOPBAR);
    $('.site-header').outerHTML = HEADER;
    document.body.classList.add('cg-common-header-applied');
    injectHeaderStyles();
  }

  function id(storageKey){
    try{let v=localStorage.getItem(storageKey);if(!v){v=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;localStorage.setItem(storageKey,v)}return v}catch(_){return ''}
  }
  window.CGVisitorIds=()=>[id('cg_visitor_id'),id('cg_session_id')];

  async function track(eventType, metadata={}){
    const cfg=window.CG_CONFIG||{}, client=window.CG_SUPABASE;
    if(!client||!cfg.supabaseUrl)return;
    try{
      const qs=new URLSearchParams(location.search),ids=window.CGVisitorIds();
      await client.rpc('track_event',{p_visitor_id:ids[0]||null,p_session_id:ids[1]||null,p_event_type:eventType,p_page_path:location.pathname,p_page_title:document.title,p_product_slug:document.body.dataset.productSlug||null,p_division_slug:document.body.dataset.divisionSlug||null,p_referrer:document.referrer||null,p_source:qs.get('utm_source'),p_medium:qs.get('utm_medium'),p_campaign:qs.get('utm_campaign'),p_term:qs.get('utm_term'),p_content:qs.get('utm_content'),p_device_type:innerWidth<700?'mobile':innerWidth<1050?'tablet':'desktop',p_browser_family:(navigator.userAgent||'').slice(0,100),p_os_family:navigator.platform||'',p_language:navigator.language||null,p_screen_size:`${screen.width}x${screen.height}`,p_metadata:metadata||{}});
    }catch(_){}
  }
  window.CGTrack=track;

  function boot(){
    syncCommonHeader();
    normalizeFooter();
    const header=$('.site-header'); const scroll=()=>header?.classList.toggle('scrolled',scrollY>8);
    scroll(); addEventListener('scroll',scroll,{passive:true});
    const btn=$('.menu-btn'),nav=$('.nav');
    btn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open))});
    $$('.nav-group>button').forEach(b=>b.addEventListener('click',(e)=>{if(innerWidth<=1050){e.preventDefault();b.parentElement.classList.toggle('open')}}));
    const ab=$('.ask-btn'),ap=$('.ask-panel');
    ab?.addEventListener('click',()=>ap.classList.toggle('open'));
    document.addEventListener('click',(e)=>{if(ap?.classList.contains('open')&&!e.target.closest('.ask'))ap.classList.remove('open')});
    $$('[data-copy-search]').forEach(x=>x.addEventListener('click',()=>{const q=$('#cg-global-search');if(q){q.value=x.dataset.copySearch||x.textContent.trim();q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}}));
    document.addEventListener('click',(e)=>{const a=e.target.closest('a'); if(!a)return; if(/wa\.me/.test(a.href)) track('whatsapp_click',{href:a.href}); else if(a.href.startsWith('mailto:')) track('email_click',{href:a.href}); else if(/request-quote/.test(a.href)) track('quote_click',{href:a.href}); else if(/contact\.html/.test(a.href)) track('contact_click',{href:a.href});});
    setTimeout(()=>track('page_view'),300);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();