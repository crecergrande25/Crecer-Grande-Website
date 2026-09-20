(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const TOPBAR = `<div class="topbar"><div class="container topbar-in"><div class="topbar-meta"><span data-site-field="gstin" data-site-prefix="GSTIN: ">GSTIN: 19BBJPB4158H1ZM</span><span data-site-field="udyam" data-site-prefix="Udyam: ">Udyam: UDYAM-WB-14-0231207</span><span>West Bengal, India</span></div><a data-site-field="instagram_handle" data-site-link="instagram" href="https://www.instagram.com/crecer_grande/" target="_blank" rel="noopener">@crecer_grande</a></div></div>`;

  const HEADER = `<header class="site-header"><div class="container navrow"><a class="brand" href="/" aria-label="Crecer Grande home"><img src="/assets/images/logo.png" data-site-src="logo_url" alt="Crecer Grande" decoding="async" width="740" height="208"></a><button class="menu-btn" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button><nav class="nav" aria-label="Main navigation"><div class="nav-group"><button type="button">Solutions</button><div class="mega"><div class="mega-grid"><a href="/divisions/advanced-manufacturing.html"><b>Advanced Manufacturing</b><small>3D printing, laser, fabrication and machining</small></a><a href="/divisions/engineering-design.html"><b>Engineering &amp; Design</b><small>CAD, drawings, DFM/DFA and reverse engineering</small></a><a href="/divisions/machine-maintenance.html"><b>Machine Maintenance</b><small>Breakdown, PM and restoration support</small></a><a href="/divisions/automation-solutions.html"><b>Automation Solutions</b><small>PLC, HMI, I/O, sensors and control hardware</small></a><a href="/divisions/quality-management-systems.html"><b>Quality &amp; Management Systems</b><small>QMS, SOPs, RCA/CAPA and audit readiness</small></a><a href="/divisions/inspection-testing.html"><b>Inspection &amp; Testing</b><small>FAI, dimensional / visual verification and follow-up</small></a><a href="/divisions/tender-business-development.html"><b>Tender &amp; Business Development</b><small>GeM, tender review and submission support</small></a><a href="/divisions/business-support-compliance.html"><b>Business Support &amp; Compliance</b><small>Industrial registrations, employer-account and vendor support</small></a></div></div></div><a href="/engineering-desk.html">Engineering Desk</a><a href="/services.html">Services</a><a href="/products.html">Products</a><a href="/projects.html">Projects</a><a href="/resources.html">Resources</a><a href="/insights.html">Insights</a><a href="/about.html">About</a><a href="/contact.html">Contact</a><a class="quote-nav" href="/request-quote.html">Request a Quote</a></nav></div></header>`;

  const FOOTER_CTA = "<section class=\"cg-footer-cta\">\n<div class=\"container cg-footer-cta-inner\">\n<div>\n<h2>Have an engineering or industrial requirement?</h2>\n<p>Send a drawing, sample, photograph, machine model, part number or problem statement. We will identify the most practical next step.</p>\n</div>\n<a class=\"cg-footer-cta-btn\" href=\"/request-quote.html\">Send Requirement</a>\n</div>\n</section>";
  const FOOTER = "<footer class=\"cg-footer\">\n<div class=\"container cg-footer-grid\">\n<div class=\"cg-footer-brand\">\n<a aria-label=\"Crecer Grande home\" class=\"cg-footer-logo-link\" href=\"/\"><img alt=\"Crecer Grande\" src=\"/assets/images/logo.png\"/></a>\n<p class=\"cg-footer-tagline\">Engineering • Industrial Services • Business Support</p>\n<p class=\"cg-footer-desc\">Practical industrial support from requirement to execution.</p>\n</div>\n<div class=\"cg-footer-col\"><h4>Capabilities</h4><a href=\"/engineering-desk.html\">Engineering Desk</a><a href=\"/services.html\">Services</a><a href=\"/divisions.html\">Our Divisions</a><a href=\"/products.html\">Products &amp; Spares</a><a href=\"/products/laser-product-finder.html\">Laser Product Finder</a><a href=\"/products/3d-print-quote.html\">3D Printing / CAD Quote</a><a href=\"/estimate.html\">Estimate Tools</a></div>\n<div class=\"cg-footer-col\"><h4>Company</h4><a href=\"/about.html\">About</a><a href=\"/projects.html\">Projects &amp; Case Studies</a><a href=\"/industries.html\">Industries</a><a href=\"/resources.html\">Resources</a><a href=\"/contact.html\">Contact</a><a href=\"/privacy.html\">Privacy</a><a href=\"/disclaimer.html\">Disclaimer</a></div>\n<div class=\"cg-footer-col cg-footer-contact\"><h4>Contact</h4><a class=\"cg-contact-line\" href=\"tel:+917003301781\"><span>+91 7003301781</span></a><a class=\"cg-contact-line\" href=\"mailto:crecergrande@outlook.com\"><span>crecergrande@outlook.com</span></a><p class=\"cg-contact-address\">Plot No. LR-645, Mathpara Rd., Rajarhat, West Bengal - 700135</p><div class=\"cg-footer-socials cg-contact-socials\"><a aria-label=\"WhatsApp Crecer Grande\" class=\"cg-social-pill\" href=\"https://wa.me/916291001781\" rel=\"noopener\" target=\"_blank\"><span>WhatsApp</span></a><a aria-label=\"Instagram @crecer_grande\" class=\"cg-social-pill\" href=\"https://www.instagram.com/crecer_grande/\" rel=\"noopener\" target=\"_blank\"><span>@crecer_grande</span></a></div></div>\n</div>\n<div class=\"container cg-footer-bottom\"><span>© 2026 Crecer Grande. All rights reserved.</span><span class=\"cg-made-with-love\">Made with <span aria-label=\"love\" class=\"cg-heart\">♥</span></span></div>\n</footer>";

  function injectHeaderStyles(){
    if($('#cg-common-header-style')) return;
    const style = document.createElement('style');
    style.id = 'cg-common-header-style';
    style.textContent = `.nav .quote-nav{white-space:nowrap}.nav{gap:5px}@media(max-width:1220px){.nav>a,.nav-group>button{padding-left:8px!important;padding-right:8px!important;font-size:13px}.brand img{width:168px}}@media(max-width:1050px){.nav .quote-nav{width:100%;text-align:center;justify-content:center}.nav{gap:8px}}`;
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
    style.textContent = `.cg-footer{padding:36px 0 14px!important}.cg-footer-grid{gap:32px!important}.cg-footer-logo-link img{width:305px!important;max-width:100%!important;margin-bottom:14px!important}.cg-footer-tagline{margin-bottom:10px!important}.cg-footer-desc{margin-bottom:12px!important}.cg-footer-col h4{margin-bottom:12px!important}.cg-footer-col>a{margin-bottom:8px!important}.cg-footer-contact .cg-contact-line{margin-bottom:9px!important}.cg-contact-address{margin-top:2px!important}.cg-footer-socials{margin-top:12px!important}.cg-contact-socials .cg-social-pill[href*="wa.me"]{border-color:#25D366!important;background:rgba(37,211,102,.08)!important;color:#fff!important}.cg-contact-socials .cg-social-pill[href*="wa.me"] .cg-icon{color:#25D366!important}.cg-contact-socials .cg-social-pill[href*="instagram.com"]{border-color:#E1306C!important;background:linear-gradient(135deg,rgba(131,58,180,.14),rgba(225,48,108,.10),rgba(247,119,55,.10))!important;color:#fff!important}.cg-contact-socials .cg-social-pill[href*="instagram.com"] .cg-icon{color:#E1306C!important}.cg-social-pill:hover{filter:brightness(1.08)!important}.cg-heart{color:#25D366!important}.cg-footer-bottom{margin-top:24px!important;padding-top:14px!important}@media(max-width:760px){.cg-footer{padding:30px 0 18px!important}.cg-footer-grid{gap:26px!important}.cg-footer-logo-link img{width:250px!important}.cg-footer-bottom{grid-template-columns:1fr!important;text-align:left!important}.cg-footer-bottom span:nth-child(2),.cg-footer-bottom span:last-child{text-align:left!important}}`;
    document.head.appendChild(style);
  }

  function normalizeFooter(){
    injectFooterStyles();
    $('.cg-heart').forEach(x => x.style.color = '#25D366');
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