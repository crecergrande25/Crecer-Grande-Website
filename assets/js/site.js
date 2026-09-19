(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const CG_VERSION = 'V2.8.1';

  const TOPBAR = `<div class="topbar"><div class="container topbar-in"><div class="topbar-meta"><span data-site-field="gstin" data-site-prefix="GSTIN: ">GSTIN: 19BBJPB4158H1ZM</span><span data-site-field="udyam" data-site-prefix="Udyam: ">Udyam: UDYAM-WB-14-0231207</span><span>West Bengal, India</span></div><a data-site-field="instagram_handle" data-site-link="instagram" href="https://www.instagram.com/crecer_grande/" target="_blank" rel="noopener">@crecer_grande</a></div></div>`;

  const HEADER = `<header class="site-header"><div class="container navrow"><a class="brand" href="/" aria-label="Crecer Grande home"><img src="/assets/images/logo.png" data-site-src="logo_url" alt="Crecer Grande" decoding="async" width="740" height="208"></a><button class="menu-btn" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button><nav class="nav" aria-label="Main navigation"><div class="nav-group"><button type="button">Solutions</button><div class="mega"><div class="mega-grid"><a href="/divisions/advanced-manufacturing.html"><b>Advanced Manufacturing</b><small>3D printing, laser, fabrication and machining</small></a><a href="/divisions/engineering-design.html"><b>Engineering &amp; Design</b><small>CAD, drawings, DFM/DFA and reverse engineering</small></a><a href="/divisions/machine-maintenance.html"><b>Machine Maintenance</b><small>Breakdown, PM and restoration support</small></a><a href="/divisions/automation-solutions.html"><b>Automation Solutions</b><small>PLC, HMI, I/O, sensors and control hardware</small></a><a href="/divisions/quality-management-systems.html"><b>Quality &amp; Management Systems</b><small>QMS, SOPs, RCA/CAPA and audit readiness</small></a><a href="/divisions/inspection-testing.html"><b>Inspection &amp; Testing</b><small>FAI, dimensional / visual verification and follow-up</small></a><a href="/divisions/tender-business-development.html"><b>Tender &amp; Business Development</b><small>GeM, tender review and submission support</small></a><a href="/divisions/business-support-compliance.html"><b>Business Support &amp; Compliance</b><small>Industrial registrations, employer-account and vendor support</small></a></div></div></div><a href="/engineering-desk.html">Engineering Desk</a><a href="/products.html">Products</a><a href="/resources.html">Resources</a><a href="/insights.html">Insights</a><a href="/about.html">About</a><a href="/contact.html">Contact Us</a><a class="quote-nav" href="/request-quote.html">Request a Quote</a><a class="admin-nav" href="/admin/" rel="nofollow">Admin Login</a></nav></div></header>`;

  const FOOTER_CTA = "<section class=\"cg-footer-cta\">\n<div class=\"container cg-footer-cta-inner\">\n<div>\n<h2>Have an engineering or industrial requirement?</h2>\n<p>Send a drawing, sample, photograph, machine model, part number or problem statement. We will identify the most practical next step.</p>\n</div>\n<a class=\"cg-footer-cta-btn\" href=\"/request-quote.html\">Send Requirement</a>\n</div>\n</section>";
  const FOOTER = "<footer class=\"cg-footer\">\n<div class=\"container cg-footer-grid\">\n<div class=\"cg-footer-brand\">\n<a aria-label=\"Crecer Grande home\" class=\"cg-footer-logo-link\" href=\"/\">\n<img alt=\"Crecer Grande\" src=\"/assets/images/logo.png\"/>\n</a>\n<p class=\"cg-footer-tagline\">Engineering • Industrial Services • Business Support</p>\n<p class=\"cg-footer-desc\">Practical industrial support from requirement to execution.</p>\n</div>\n<div class=\"cg-footer-col\">\n<h4>Capabilities</h4>\n<a href=\"/engineering-desk.html\">Engineering Desk</a>\n<a href=\"/services.html\">Service Pages</a>\n<a href=\"/divisions.html\">Our Divisions</a>\n<a href=\"/products.html\">Products &amp; Spares</a>\n<a href=\"/products/laser-product-finder.html\">Laser Product Finder</a>\n<a href=\"/products/3d-print-quote.html\">3D Printing / CAD Quote</a>\n<a href=\"/estimate.html\">Estimate Tools</a>\n\n</div>\n<div class=\"cg-footer-col\">\n<h4>Company</h4>\n<a href=\"/about.html\">About</a>\n<a href=\"/industries.html\">Industries</a>\n<a href=\"/resources.html\">Resources</a>\n<a href=\"/privacy.html\">Privacy</a>\n<a href=\"/disclaimer.html\">Disclaimer</a>\n</div>\n<div class=\"cg-footer-col cg-footer-contact\">\n<h4>Contact</h4>\n<a class=\"cg-contact-line\" href=\"tel:+917003301781\">\n<span aria-hidden=\"true\" class=\"cg-icon\">\n<svg viewbox=\"0 0 24 24\"><path d=\"M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4.1.8-.2 1l-2.2 2.2Z\"></path></svg>\n</span>\n<span>+91 7003301781</span>\n</a>\n<a class=\"cg-contact-line\" href=\"mailto:crecergrande@outlook.com\">\n<span aria-hidden=\"true\" class=\"cg-icon\">\n<svg viewbox=\"0 0 24 24\"><path d=\"M2.5 4h19A2.5 2.5 0 0 1 24 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-19A2.5 2.5 0 0 1 0 17.5v-11A2.5 2.5 0 0 1 2.5 4Zm0 2.1 9.5 7.2 9.5-7.2h-19Zm19 11.8V8.8L12 16 2.5 8.8v9.1h19Z\"></path></svg>\n</span>\n<span>crecergrande@outlook.com</span>\n</a>\n<p class=\"cg-contact-address\">Plot No. LR-645, Mathpara Rd., Rajarhat, West Bengal - 700135</p>\n<div class=\"cg-footer-socials cg-contact-socials\">\n<a aria-label=\"WhatsApp Crecer Grande\" class=\"cg-social-pill\" href=\"https://wa.me/916291001781\" rel=\"noopener\" target=\"_blank\">\n<span aria-hidden=\"true\" class=\"cg-icon\">\n<svg viewbox=\"0 0 24 24\"><path d=\"M20.5 3.5A11.7 11.7 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.2 1.6 6L.2 24l6.4-1.7a11.8 11.8 0 0 0 5.5 1.4h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.2-3.5-8.4ZM12.1 21.7h-.1c-1.7 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.5 4.7Zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.5-.5.3-.5c.1-.2.1-.4 0-.5-.1-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z\"></path></svg>\n</span>\n<span>6291001781</span>\n</a>\n<a aria-label=\"Instagram @crecer_grande\" class=\"cg-social-pill\" href=\"https://www.instagram.com/crecer_grande/\" rel=\"noopener\" target=\"_blank\">\n<span aria-hidden=\"true\" class=\"cg-icon\">\n<svg viewbox=\"0 0 24 24\"><path d=\"M7.5 0h9A7.5 7.5 0 0 1 24 7.5v9a7.5 7.5 0 0 1-7.5 7.5h-9A7.5 7.5 0 0 1 0 16.5v-9A7.5 7.5 0 0 1 7.5 0Zm0 2.3a5.2 5.2 0 0 0-5.2 5.2v9a5.2 5.2 0 0 0 5.2 5.2h9a5.2 5.2 0 0 0 5.2-5.2v-9a5.2 5.2 0 0 0-5.2-5.2h-9Zm10.8 1.8a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM12 5.8a6.2 6.2 0 1 1 0 12.4A6.2 6.2 0 0 1 12 5.8Zm0 2.3A3.9 3.9 0 1 0 12 16a3.9 3.9 0 0 0 0-7.8Z\"></path></svg>\n</span>\n<span>@crecer_grande</span>\n</a>\n</div>\n</div>\n</div>\n<div class=\"container cg-footer-bottom\">\n<span>© 2026 Crecer Grande. All rights reserved.</span>\n<span class=\"cg-made-with-love\">Made with <span aria-label=\"love\" class=\"cg-heart\">♥</span></span>\n<div class=\"cg-footer-versionblock\"><span class=\"cg-suite-maintained\">Site maintained by Crecer Grande Website Suite V2.6.2</span><span class=\"cg-footer-version\">V2.6</span></div>\n</div>\n</footer>";

  function injectHeaderStyles(){
    if($('#cg-common-header-style')) return;
    const style = document.createElement('style');
    style.id = 'cg-common-header-style';
    style.textContent = `.nav .admin-nav{border:1px solid rgba(7,26,54,.24)!important;background:#fff!important;color:#071a36!important;padding-inline:17px!important;border-radius:12px!important;white-space:nowrap}.nav .admin-nav:hover{background:#f4f7fb!important;color:#071a36!important}.nav .quote-nav{white-space:nowrap}.nav{gap:5px}@media(max-width:1180px){.nav>a,.nav-group>button{padding-left:9px!important;padding-right:9px!important}.brand img{width:175px}}@media(max-width:1050px){.nav .admin-nav,.nav .quote-nav{width:100%;text-align:center;justify-content:center}.nav{gap:8px}}`;
    document.head.appendChild(style);
  }

  function syncCommonFooter(){
    const path = location.pathname.toLowerCase();
    if(path.includes('/admin/')) return;
    const oldFooter = $('.cg-footer');
    if(!oldFooter) return;
    const oldCta = $('.cg-footer-cta');
    if(oldCta) oldCta.outerHTML = FOOTER_CTA;
    else oldFooter.insertAdjacentHTML('beforebegin', FOOTER_CTA);
    $('.cg-footer').outerHTML = FOOTER;
    document.body.classList.add('cg-common-footer-applied');
  }

  function injectFooterStyles(){
    if($('#cg-footer-compact-style')) return;
    const style = document.createElement('style');
    style.id = 'cg-footer-compact-style';
    style.textContent = `.cg-footer{padding:36px 0 14px!important}.cg-footer-grid{gap:32px!important}.cg-footer-logo-link img{width:305px!important;max-width:100%!important;margin-bottom:14px!important}.cg-footer-tagline{margin-bottom:10px!important}.cg-footer-desc{margin-bottom:12px!important}.cg-footer-col h4{margin-bottom:12px!important}.cg-footer-col>a{margin-bottom:8px!important}.cg-footer-contact .cg-contact-line{margin-bottom:9px!important}.cg-contact-address{margin-top:2px!important}.cg-footer-socials{margin-top:12px!important}.cg-contact-socials .cg-social-pill[href*="wa.me"]{border-color:#25D366!important;background:rgba(37,211,102,.08)!important;color:#fff!important}.cg-contact-socials .cg-social-pill[href*="wa.me"] .cg-icon{color:#25D366!important}.cg-contact-socials .cg-social-pill[href*="instagram.com"]{border-color:#E1306C!important;background:linear-gradient(135deg,rgba(131,58,180,.14),rgba(225,48,108,.10),rgba(247,119,55,.10))!important;color:#fff!important}.cg-contact-socials .cg-social-pill[href*="instagram.com"] .cg-icon{color:#E1306C!important}.cg-social-pill:hover{filter:brightness(1.08)!important}.cg-heart{color:#25D366!important}.cg-footer-bottom{margin-top:24px!important;padding-top:14px!important}.cg-footer-versionblock{display:flex!important;flex-direction:column!important;align-items:flex-end!important;gap:0!important}.cg-footer-versionblock .cg-footer-version,.cg-footer-versionblock .version-mark{display:none!important}@media(max-width:760px){.cg-footer{padding:30px 0 18px!important}.cg-footer-grid{gap:26px!important}.cg-footer-logo-link img{width:250px!important}.cg-footer-bottom{grid-template-columns:1fr!important;text-align:left!important}.cg-footer-versionblock{align-items:flex-start!important}.cg-footer-bottom span:nth-child(2),.cg-footer-bottom span:last-child{text-align:left!important}}`;
    document.head.appendChild(style);
  }

  function normalizeFooter(){
    injectFooterStyles();
    const label = `Site maintained by Crecer Grande Website Suite ${CG_VERSION}`;
    $$('.cg-suite-maintained').forEach(x => x.textContent = label);
    $$('.cg-footer-version,.version-mark').forEach(x => x.textContent = CG_VERSION);
    $$('.cg-heart').forEach(x => x.style.color = '#25D366');
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
    syncCommonFooter();
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