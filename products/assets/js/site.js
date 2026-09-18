(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const TOPBAR = `<div class="topbar"><div class="container topbar-in"><div class="topbar-meta"><span data-site-field="gstin" data-site-prefix="GSTIN: ">GSTIN: 19BBJPB4158H1ZM</span><span data-site-field="udyam" data-site-prefix="Udyam: ">Udyam: UDYAM-WB-14-0231207</span><span>West Bengal, India</span></div><a data-site-field="instagram_handle" data-site-link="instagram" href="https://www.instagram.com/crecer_grande/" target="_blank" rel="noopener">@crecer_grande</a></div></div>`;

  const HEADER = `<header class="site-header"><div class="container navrow"><a class="brand" href="/" aria-label="Crecer Grande home"><img src="/assets/images/logo.png" data-site-src="logo_url" alt="Crecer Grande" decoding="async" width="740" height="208"></a><button class="menu-btn" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button><nav class="nav" aria-label="Main navigation"><div class="nav-group"><button type="button">Solutions</button><div class="mega"><div class="mega-grid"><a href="/divisions/advanced-manufacturing.html"><b>Advanced Manufacturing</b><small>3D printing, laser, fabrication and machining</small></a><a href="/divisions/engineering-design.html"><b>Engineering &amp; Design</b><small>CAD, drawings, DFM/DFA and reverse engineering</small></a><a href="/divisions/machine-maintenance.html"><b>Machine Maintenance</b><small>Breakdown, PM and restoration support</small></a><a href="/divisions/automation-solutions.html"><b>Automation Solutions</b><small>PLC, HMI, I/O, sensors and control hardware</small></a><a href="/divisions/quality-management-systems.html"><b>Quality &amp; Management Systems</b><small>QMS, SOPs, RCA/CAPA and audit readiness</small></a><a href="/divisions/inspection-testing.html"><b>Inspection &amp; Testing</b><small>FAI, dimensional / visual verification and follow-up</small></a><a href="/divisions/tender-business-development.html"><b>Tender &amp; Business Development</b><small>GeM, tender review and submission support</small></a><a href="/divisions/business-support-compliance.html"><b>Business Support &amp; Compliance</b><small>Industrial registrations, employer-account and vendor support</small></a></div></div></div><a href="/engineering-desk.html">Engineering Desk</a><a href="/products.html">Products</a><a href="/resources.html">Resources</a><a href="/insights.html">Insights</a><a href="/about.html">About</a><a class="quote-nav" href="/request-quote.html">Request a Quote</a><a class="contact-nav" href="/contact.html">Contact Us</a><a class="admin-nav" href="/admin/" rel="nofollow">Admin Login</a></nav></div></header>`;

  function injectHeaderStyles(){
    if($('#cg-common-header-style')) return;
    const style = document.createElement('style');
    style.id = 'cg-common-header-style';
    style.textContent = `.nav .contact-nav,.nav .contact-nav-link{border:1px solid rgba(7,26,54,.22)!important;background:#fff!important;color:#071a36!important;padding-inline:17px!important;border-radius:12px!important;box-shadow:0 8px 20px rgba(7,26,54,.05);white-space:nowrap}.nav .contact-nav:hover,.nav .contact-nav-link:hover{background:#071a36!important;color:#fff!important;border-color:#071a36!important}.nav .admin-nav{border:1px solid rgba(7,26,54,.24)!important;background:#fff!important;color:#071a36!important;padding-inline:17px!important;border-radius:12px!important;white-space:nowrap}.nav .admin-nav:hover{background:#f4f7fb!important;color:#071a36!important}.nav .quote-nav{white-space:nowrap}.nav{gap:5px}@media(max-width:1180px){.nav>a,.nav-group>button{padding-left:9px!important;padding-right:9px!important}.brand img{width:175px}}@media(max-width:1050px){.nav .contact-nav,.nav .contact-nav-link,.nav .admin-nav,.nav .quote-nav{width:100%;text-align:center;justify-content:center}.nav{gap:8px}}`;
    document.head.appendChild(style);
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

  function ids(){let v=localStorage.getItem('cg_vid');if(!v){v=crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2);localStorage.setItem('cg_vid',v)}let s=sessionStorage.getItem('cg_sid');if(!s){s=crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2);sessionStorage.setItem('cg_sid',s)}return[v,s]}
  async function track(type,meta={}){const cfg=window.CG_CONFIG||{};if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey)return;try{const c=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey),[v,s]=ids(),u=new URL(location.href),main=document.querySelector('main'),product=main?.dataset.productSlug||'',division=main?.dataset.divisionSlug||'';await c.rpc('track_event',{p_visitor_id:v,p_session_id:s,p_event_type:type,p_page_path:location.pathname,p_page_title:document.title,p_product_slug:product||null,p_division_slug:division||null,p_referrer:document.referrer,p_source:u.searchParams.get('utm_source')||'',p_medium:u.searchParams.get('utm_medium')||'',p_campaign:u.searchParams.get('utm_campaign')||'',p_term:u.searchParams.get('utm_term')||'',p_content:u.searchParams.get('utm_content')||'',p_device_type:innerWidth<768?'mobile':innerWidth<1100?'tablet':'desktop',p_browser_family:navigator.userAgent.slice(0,100),p_os_family:navigator.platform||'',p_language:navigator.language||'',p_screen_size:`${screen.width}x${screen.height}`,p_metadata:meta})}catch(e){}}

  function boot(){syncCommonHeader();const b=$('.menu-btn'),n=$('.nav');if(b&&n)b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false')});$$('.nav-group>button').forEach(x=>x.addEventListener('click',e=>{if(innerWidth<=1050){e.preventDefault();x.parentElement.classList.toggle('open')}}));track('page_view');const main=$('main');if(main?.dataset.productSlug)track('product_view');if(main?.dataset.divisionSlug)track('division_view');document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const h=a.href||'';if(a.dataset.track)track(a.dataset.track);else if(h.includes('wa.me'))track('click_whatsapp');else if(h.startsWith('tel:'))track('click_phone');else if(h.startsWith('mailto:'))track('click_email');else if(h.includes('contact.html'))track('contact_click');else if(h.includes('instagram.com'))track('outbound_instagram')});window.CGTrack=track;window.CGVisitorIds=ids;}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
