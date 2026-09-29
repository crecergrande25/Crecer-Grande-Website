(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  function applyV5DesignSystem(){
    const path=(location.pathname||'/').toLowerCase();
    const isHome=(path==='/'||path==='/index.html');
    const isAdmin=path.includes('/admin/');
    const premiumPages=new Set(['/','/index.html','/about.html','/divisions.html','/services.html','/projects.html','/insights.html','/contact.html','/request-quote.html','/feedback.html']);
    const isPremium=premiumPages.has(path);

    document.querySelectorAll('link[href*="/assets/css/precision-site.css"],link[href*="/assets/css/site-v5.css"]').forEach(x=>x.remove());
    document.body.classList.remove('cg-v5');
    [...document.body.classList].filter(x=>x.startsWith('cg-page-')||x.startsWith('cg-body-')).forEach(x=>document.body.classList.remove(x));

    if(isPremium||isAdmin){
      document.querySelectorAll('link[data-cg-body-polish]').forEach(x=>x.remove());
      return;
    }

    if(!document.querySelector('link[data-cg-body-polish]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='/assets/css/body-polish.css?v=1.1.0';
      link.dataset.cgBodyPolish='1';
      document.head.appendChild(link);
    }

    document.body.classList.add('cg-body-polish');
    const pageMap={
      '/about.html':'cg-body-about',
      '/services.html':'cg-body-services',
      '/divisions.html':'cg-body-divisions',
      '/engineering-desk.html':'cg-body-engineering',
      '/projects.html':'cg-body-projects',
      '/insights.html':'cg-body-insights',
      '/industries.html':'cg-body-industries',
      '/contact.html':'cg-body-contact',
      '/request-quote.html':'cg-body-rfq'
    };
    if(pageMap[path]) document.body.classList.add(pageMap[path]);
    if(path.startsWith('/divisions/')) document.body.classList.add('cg-body-division-detail');
    if(path.startsWith('/projects/')) document.body.classList.add('cg-body-project-detail');
    if(path.startsWith('/insights/')) document.body.classList.add('cg-body-insight-detail');
    if(path.endsWith('-kolkata.html')||path==='/custom-machine-spares.html'||path==='/design-job-work.html') document.body.classList.add('cg-body-service-detail');
  }

  function applyContrastFix(){
    const path=(location.pathname||'/').toLowerCase();
    if(path.includes('/admin/')) return;
    if(document.querySelector('link[data-cg-contrast-fix]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/assets/css/contrast-fix.css?v=1.1.0';
    link.dataset.cgContrastFix='1';
    document.head.appendChild(link);
  }

  const TOPBAR = `<div class="topbar"><div class="container topbar-in"><div class="topbar-meta"><span data-site-field="gstin" data-site-prefix="GSTIN: ">GSTIN: 19BBJPB4158H1ZM</span><span data-site-field="udyam" data-site-prefix="Udyam: ">Udyam: UDYAM-WB-14-0231207</span><span>West Bengal, India</span></div><a data-site-field="instagram_handle" data-site-link="instagram" href="https://www.instagram.com/crecer_grande/" target="_blank" rel="noopener">@crecer_grande</a></div></div>`;

  const HEADER_HOME = `<header class="site-header"><div class="container navrow"><a aria-label="Crecer Grande home" class="brand" href="/"><img alt="Crecer Grande" data-site-src="logo_url" decoding="async" src="/assets/images/logo.png"/></a><button aria-expanded="false" aria-label="Toggle navigation" class="menu-btn" type="button"><span></span><span></span><span></span></button><nav aria-label="Main navigation" class="nav"><a href="/about.html">About</a><a href="/divisions.html">Divisions</a><a href="/services.html">Capabilities</a><a href="/projects.html">Projects</a><a href="/insights.html">Insights</a><a href="/contact.html">Contact Us</a><a class="quote-nav" href="/request-quote.html">Get in Touch →</a></nav></div></header>`;

  const HEADER = `<header class="site-header"><div class="container navrow"><a aria-label="Crecer Grande home" class="brand" href="/"><img alt="Crecer Grande" data-site-src="logo_url" decoding="async" src="/assets/images/logo.png"/></a><button aria-expanded="false" aria-label="Toggle navigation" class="menu-btn" type="button"><span></span><span></span><span></span></button><nav aria-label="Main navigation" class="nav"><a href="/about.html">About</a><a href="/divisions.html">Divisions</a><a href="/services.html">Capabilities</a><a href="/projects.html">Projects</a><a href="/insights.html">Insights</a><a href="/contact.html">Contact Us</a><a class="quote-nav" href="/request-quote.html">Get in Touch →</a></nav></div></header>`;

  const FOOTER_CTA = "<section class=\"cg-footer-cta\">\n<div class=\"container cg-footer-cta-inner\">\n<div>\n<h2>Have an engineering, manufacturing or operational requirement?</h2>\n<p>Send a drawing, sample, photograph, machine model, part number, document or problem statement. We will structure the most practical service route.</p>\n</div>\n<a class=\"cg-footer-cta-btn\" href=\"/request-quote.html\">Send Requirement</a>\n</div>\n</section>";
  const FOOTER = "<footer class=\"cg-footer\">\n<div class=\"container cg-footer-grid\">\n<div class=\"cg-footer-brand\">\n<a aria-label=\"Crecer Grande home\" class=\"cg-footer-logo-link\" href=\"/\"><img alt=\"Crecer Grande\" src=\"/assets/images/logo.png\"/></a>\n<p class=\"cg-footer-tagline\">Engineering Services • Industrial Support • Business Support</p>\n<p class=\"cg-footer-desc\">A coordinated service network for design, manufacturing support, maintenance, automation, quality, inspection and business workflows.</p>\n</div>\n<div class=\"cg-footer-col\"><h4>Service Routes</h4><a href=\"/engineering-desk.html\">Engineering Desk</a><a href=\"/services.html\">Service Directory</a><a href=\"/divisions.html\">Capability Divisions</a><a href=\"/3d-printing-kolkata.html\">3D Printing Service</a></div>\n<div class=\"cg-footer-col\"><h4>Company</h4><a href=\"/about.html\">About</a><a href=\"/projects.html\">Projects &amp; Case Studies</a><a href=\"/industries.html\">Industries</a><a href=\"/insights.html\">Insights</a><a href=\"/contact.html\">Contact</a><a href=\"/privacy.html\">Privacy</a><a href=\"/disclaimer.html\">Disclaimer</a></div>\n<div class=\"cg-footer-col cg-footer-contact\"><h4>Contact Us</h4><a class=\"cg-contact-line\" href=\"tel:+917003301781\"><span>+91 7003301781</span></a><a class=\"cg-contact-line\" href=\"mailto:crecergrande@outlook.com\"><span>crecergrande@outlook.com</span></a><p class=\"cg-contact-address\">Plot No. LR-645, Mathpara Rd., Rajarhat, West Bengal - 700135</p><div class=\"cg-footer-socials cg-contact-socials\"><a aria-label=\"WhatsApp Crecer Grande\" class=\"cg-social-pill\" href=\"https://wa.me/916291001781\" rel=\"noopener\" target=\"_blank\"><span class=\"cg-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M20.5 3.5A11.7 11.7 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.2 1.6 6L.2 24l6.4-1.7a11.8 11.8 0 0 0 5.5 1.4h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.2-3.5-8.4ZM12.1 21.7h-.1c-1.7 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.5 4.7Zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.5-.5.3-.5c.1-.2.1-.4 0-.5-.1-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z\"></path></svg></span><span>WhatsApp</span></a><a aria-label=\"Instagram @crecer_grande\" class=\"cg-social-pill\" href=\"https://www.instagram.com/crecer_grande/\" rel=\"noopener\" target=\"_blank\"><span class=\"cg-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M7.5 0h9A7.5 7.5 0 0 1 24 7.5v9a7.5 7.5 0 0 1-7.5 7.5h-9A7.5 7.5 0 0 1 0 16.5v-9A7.5 7.5 0 0 1 7.5 0Zm0 2.3a5.2 5.2 0 0 0-5.2 5.2v9a5.2 5.2 0 0 0 5.2 5.2h9a5.2 5.2 0 0 0 5.2-5.2v-9a5.2 5.2 0 0 0-5.2-5.2h-9Zm10.8 1.8a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM12 5.8a6.2 6.2 0 1 1 0 12.4A6.2 6.2 0 0 1 12 5.8Zm0 2.3A3.9 3.9 0 1 0 12 16a3.9 3.9 0 0 0 0-7.8Z\"></path></svg></span><span>@crecer_grande</span></a></div></div>\n</div>\n<div class=\"container cg-footer-bottom\"><span>© 2026 Crecer Grande. All rights reserved.</span><span class=\"cg-footer-motto\">We are Mechanicals. We can build anything.</span><a class=\"cg-admin-login\" href=\"/admin/\" rel=\"nofollow\">Admin Login</a></div>\n</footer>";

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

  const IMAGE_UPGRADES = {
  "/assets/images/catalog/chiller-spares/temperature-sensor.webp": "/assets/images/prod-automation-v22.webp",
  "/assets/images/catalog/co2/co2-controller.webp": "/assets/images/prod-automation-v22.webp",
  "/assets/images/am-approved-machined.webp": "/assets/images/manufacturing.webp",
  "/assets/images/am-approved-laser.webp": "/assets/images/laser.webp",
  "/assets/images/am-approved-prototype.webp": "/assets/images/printing.webp",
  "/assets/images/am-approved-bracket.webp": "/assets/images/manufacturing.webp",
  "/assets/images/am-approved-enclosure.webp": "/assets/images/manufacturing.webp",
  "/assets/images/am-approved-fixture.webp": "/assets/images/design.webp",
  "/assets/images/am-approved-shaft.webp": "/assets/images/project-reverse.webp",
  "/assets/images/am-approved-spares.webp": "/assets/images/sourcing.webp",
  "/assets/images/am-approved-sparekit.webp": "/assets/images/sourcing.webp",
  "/assets/images/cg-advanced-manufacturing.webp": "/assets/images/div-manufacturing.webp",
  "/assets/images/advanced-manufacturing-scope-unique.webp": "/assets/images/manufacturing.webp",
  "/assets/images/home-v5/advanced-manufacturing.webp": "/assets/images/div-manufacturing.webp",
  "/assets/images/home-v5/engineering-design.webp": "/assets/images/design.webp",
  "/assets/images/home-v5/industrial-automation.webp": "/assets/images/prod-automation-v22.webp",
  "/assets/images/home-v5/machine-maintenance.webp": "/assets/images/maintenance.webp",
  "/assets/images/div-manufacturing-v23.webp": "/assets/images/div-manufacturing.webp",
  "/assets/images/div-engineering-v23.webp": "/assets/images/design.webp",
  "/assets/images/div-maintenance-v23.webp": "/assets/images/div-maintenance.webp",
  "/assets/images/div-automation-v23.webp": "/assets/images/prod-automation-v22.webp",
  "/assets/images/div-inspection-v23.webp": "/assets/images/quality.webp",
  "/assets/images/div-inspection-v23b.webp": "/assets/images/quality.webp",
  "/assets/images/div-quality-v23.webp": "/assets/images/quality.webp",
  "/assets/images/div-quality-v23b.webp": "/assets/images/quality.webp",
  "/assets/images/div-tender-v23.webp": "/assets/images/tender.webp",
  "/assets/images/div-tender-v23b.webp": "/assets/images/tender.webp",
  "/assets/images/resource-engineering-v23.webp": "/assets/images/design.webp",
  "/assets/images/resource-maintenance-v23.webp": "/assets/images/maintenance.webp",
  "/assets/images/resource-manufacturing-v23.webp": "/assets/images/manufacturing.webp",
  "/assets/images/resource-automation-v23.webp": "/assets/images/prod-automation-v22.webp",
  "/assets/images/resource-inspection-v23.webp": "/assets/images/quality.webp",
  "/assets/images/resource-quality-v23.webp": "/assets/images/quality.webp",
  "/assets/images/resource-tender-v23.webp": "/assets/images/tender.webp",
  "/assets/images/resource-products-v23.webp": "/assets/images/sourcing.webp",
  "/assets/images/process-drawing-v23.webp": "/assets/images/process-drawing.webp",
  "/assets/images/process-cad-v23.webp": "/assets/images/design.webp",
  "/assets/images/process-cad-v23b.webp": "/assets/images/design.webp",
  "/assets/images/process-maintain-v23.webp": "/assets/images/process-maintain.webp",
  "/assets/images/process-make-v23.webp": "/assets/images/process-make.webp",
  "/assets/images/process-make-v23b.webp": "/assets/images/process-make.webp",
  "/assets/images/process-supply-v23.webp": "/assets/images/sourcing.webp",
  "/assets/images/process-validate-v23.webp": "/assets/images/quality.webp",
  "/assets/images/process-validate-v23b.webp": "/assets/images/quality.webp",
  "/assets/images/process-verify-v23.webp": "/assets/images/quality.webp",
  "/assets/images/process-verify-v23b.webp": "/assets/images/quality.webp",
  "/assets/images/process-followup-v23.webp": "/assets/images/process-drawing.webp",
  "/assets/images/project-chiller-v23.webp": "/assets/images/chiller-components.webp",
  "/assets/images/project-chiller-v23b.webp": "/assets/images/chiller-components.webp",
  "/assets/images/project-co2-v22.webp": "/assets/images/laser-components.webp",
  "/assets/images/project-co2-v23.webp": "/assets/images/laser-components.webp",
  "/assets/images/project-co2-v23b.webp": "/assets/images/laser-components.webp",
  "/assets/images/project-keychain-v23.webp": "/assets/images/laser.webp",
  "/assets/images/project-qr-v23.webp": "/assets/images/laser.webp",
  "/assets/images/project-qr-v23b.webp": "/assets/images/laser.webp",
  "/assets/images/prod-3d-v23.webp": "/assets/images/printing.webp",
  "/assets/images/prod-bending-v23.webp": "/assets/images/prod-bending.webp",
  "/assets/images/prod-chiller-v23.webp": "/assets/images/chiller-components.webp",
  "/assets/images/prod-cnc-v23.webp": "/assets/images/maintenance.webp",
  "/assets/images/prod-cnc-v23b.webp": "/assets/images/maintenance.webp",
  "/assets/images/prod-custom-spares-v23.webp": "/assets/images/sourcing.webp",
  "/assets/images/prod-laser-v23.webp": "/assets/images/laser-components.webp",
  "/assets/images/prod-plc-v23.webp": "/assets/images/prod-automation-v22.webp",
  "/assets/images/prod-plc-v23b.webp": "/assets/images/prod-automation-v22.webp",
  "/assets/images/prod-pump-v23.webp": "/assets/images/chiller-components.webp",
  "/assets/images/prod-pump-v23b.webp": "/assets/images/chiller-components.webp",
  "/assets/images/prod-spares-v23.webp": "/assets/images/sourcing.webp",
  "/assets/images/service-3d-printing.webp": "/assets/images/printing.webp",
  "/assets/images/part6-tooling-hero.webp": "/assets/images/prod-bending.webp",
  "/assets/images/laser-consumables/generated-protective-windows.webp": "/assets/images/laser-components.webp"
};

  function upgradeRepositoryImages(){
    const path=(location.pathname||'/').toLowerCase();
    const premiumPages=new Set(['/','/index.html','/about.html','/divisions.html','/services.html','/projects.html','/insights.html','/request-quote.html']);
    if(premiumPages.has(path)) return;
    const swap=(img)=>{
      const raw=img.getAttribute('src');
      if(!raw) return;
      let path=raw;
      try{ path=new URL(raw,location.origin).pathname; }catch(_){}
      const next=IMAGE_UPGRADES[path];
      if(next && raw!==next){
        img.removeAttribute('srcset');
        img.setAttribute('src',next);
      }
    };
    document.querySelectorAll('img[src]').forEach(swap);
    const observer=new MutationObserver((mutations)=>{
      mutations.forEach(m=>m.addedNodes.forEach(n=>{
        if(n.nodeType!==1) return;
        if(n.matches?.('img[src]')) swap(n);
        n.querySelectorAll?.('img[src]').forEach(swap);
      }));
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  function applyServiceFirstArt(){
    const path=(location.pathname||'/').toLowerCase();
    const art={
      '/engineering-desk.html':'/assets/images/design.webp',
      '/projects.html':'/assets/images/project-reverse.webp',
      '/insights.html':'/assets/images/process-drawing.webp',
      '/industries.html':'/assets/images/manufacturing.webp',
      '/3d-printing-kolkata.html':'/assets/images/printing.webp',
      '/mechanical-design-services-kolkata.html':'/assets/images/design.webp',
      '/industrial-machine-maintenance-kolkata.html':'/assets/images/maintenance.webp',
      '/industrial-automation-kolkata.html':'/assets/images/prod-automation-v22.webp',
      '/industrial-inspection-qa-kolkata.html':'/assets/images/quality.webp',
      '/iso-9001-consultant-kolkata.html':'/assets/images/quality.webp',
      '/laser-cutting-kolkata.html':'/assets/images/service-laser-cutting.webp',
      '/laser-marking-kolkata.html':'/assets/images/service-laser-marking.webp',
      '/reverse-engineering-kolkata.html':'/assets/images/project-reverse.webp',
      '/sheet-metal-bending-kolkata.html':'/assets/images/prod-bending.webp',
      '/gem-tender-support-kolkata.html':'/assets/images/tender.webp',
      '/business-support-compliance-kolkata.html':'/assets/images/tender.webp',
      '/custom-machine-spares.html':'/assets/images/service-machine-spares.webp',
      '/design-job-work.html':'/assets/images/process-drawing.webp',
      '/divisions/advanced-manufacturing.html':'/assets/images/div-manufacturing.webp',
      '/divisions/engineering-design.html':'/assets/images/design.webp',
      '/divisions/machine-maintenance.html':'/assets/images/div-maintenance.webp',
      '/divisions/automation-solutions.html':'/assets/images/prod-automation-v22.webp',
      '/divisions/inspection-testing.html':'/assets/images/quality.webp',
      '/divisions/quality-management-systems.html':'/assets/images/quality.webp',
      '/divisions/tender-business-development.html':'/assets/images/tender.webp',
      '/divisions/business-support-compliance.html':'/assets/images/sourcing.webp',
      '/projects/laser-machine-rca.html':'/assets/images/laser-components.webp',
      '/projects/laser-chiller-pump-replacement.html':'/assets/images/chiller-components.webp',
      '/projects/fit-correction-replacement-component.html':'/assets/images/project-reverse.webp',
      '/projects/3d-print-fai-batch.html':'/assets/images/printing.webp'
    };
    const insightArt=path.includes('/insights/3d-printing')?'/assets/images/printing.webp':
      path.includes('/insights/chiller')?'/assets/images/chiller-components.webp':
      path.includes('/insights/cnc-vmc')?'/assets/images/manufacturing.webp':
      path.includes('/insights/gdt')||path.includes('/insights/metric-tap')||path.includes('/insights/surface-roughness')||path.includes('/insights/vernier')?'/assets/images/quality.webp':
      path.includes('/insights/holes-near')||path.includes('/insights/sheet-metal')||path.includes('/insights/stainless-steel')?'/assets/images/div-manufacturing.webp':
      path.includes('/insights/identify-laser')||path.includes('/insights/laser-cutting')||path.includes('/insights/laser-nozzle')?'/assets/images/laser-components.webp':
      path.includes('/insights/machine-breakdown')||path.includes('/insights/preventive-maintenance')?'/assets/images/maintenance.webp':
      path.includes('/insights/ncr-rca-capa')?'/assets/images/quality.webp':null;
    const selectedArt=art[path]||insightArt;
    if(selectedArt) document.body.style.setProperty('--cg-page-art',`url("${selectedArt}")`);
  }

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

  function injectFooterStyles(){
    if($('#cg-footer-compact-style')) return;
    const style = document.createElement('style');
    style.id = 'cg-footer-compact-style';
    style.textContent = `.cg-footer{padding:36px 0 14px!important}.cg-footer-grid{gap:32px!important}.cg-footer-logo-link img{width:305px!important;max-width:100%!important;margin-bottom:14px!important}.cg-footer-tagline{margin-bottom:10px!important}.cg-footer-desc{margin-bottom:12px!important}.cg-footer-col h4{margin-bottom:12px!important}.cg-footer-col>a{margin-bottom:8px!important}.cg-footer-contact .cg-contact-line{margin-bottom:9px!important}.cg-contact-address{margin-top:2px!important}.cg-footer-socials{margin-top:12px!important}.cg-contact-socials .cg-social-pill[href*="wa.me"]{border-color:#128C7E!important;background:#128C7E!important;color:#fff!important}.cg-contact-socials .cg-social-pill[href*="wa.me"] .cg-icon{color:#25D366!important}.cg-contact-socials .cg-social-pill[href*="instagram.com"]{border-color:#D44C72!important;background:linear-gradient(135deg,#833AB4,#E1306C,#F77737)!important;color:#fff!important}.cg-contact-socials .cg-social-pill[href*="instagram.com"] .cg-icon{color:#E1306C!important}.cg-social-pill:hover{filter:brightness(1.08)!important}.cg-heart{color:#25D366!important}.cg-footer-bottom{margin-top:24px!important;padding-top:14px!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;align-items:center!important;column-gap:24px!important}.cg-footer-bottom .cg-footer-motto{justify-self:center!important;text-align:center!important;white-space:nowrap!important}.cg-footer-bottom .cg-admin-login{justify-self:end!important;margin-left:0!important;text-align:right!important}@media(max-width:760px){.cg-footer{padding:30px 0 18px!important}.cg-footer-grid{gap:26px!important}.cg-footer-logo-link img{width:250px!important}.cg-footer-bottom{grid-template-columns:1fr!important;text-align:left!important}.cg-footer-bottom span:nth-child(2),.cg-footer-bottom span:last-child{text-align:left!important}}`;
    document.head.appendChild(style);
  }

  function normalizeFooter(){
    injectFooterStyles();
    document.querySelectorAll('.cg-heart').forEach(x => x.style.color = '#25D366');
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
    document.body.insertAdjacentHTML('beforeend',CG_FEEDBACK_TAB);
  }

  const BOTCHA = `<div class="ask cg-botcha" data-botcha-root>
    <button class="cg-botcha-launcher" type="button" aria-expanded="false" aria-controls="cg-botcha-panel" aria-label="Open Botcha virtual assistant">
      <span class="cg-botcha-mark" aria-hidden="true">B</span>
      <span class="cg-botcha-launch-copy"><b>Botcha !</b><small>AI virtual assistant</small></span>
      <span class="cg-botcha-live-dot" aria-hidden="true"></span>
    </button>
    <section class="cg-botcha-chat" id="cg-botcha-panel" role="dialog" aria-label="Botcha virtual assistant" aria-hidden="true">
      <header class="cg-botcha-head">
        <span class="cg-botcha-mark" aria-hidden="true">B</span>
        <div class="cg-botcha-head-copy"><h3>Botcha !</h3><p>Virtual engineering assistant</p></div>
        <span class="cg-botcha-ai-badge">AI ASSIST</span>
        <button class="cg-botcha-close" type="button" aria-label="Close Botcha">×</button>
      </header>
      <div class="cg-botcha-context"><strong>Ask about CG services, machines, drawings or quotations</strong><span class="cg-botcha-status">Online</span></div>
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
    if(!document.querySelector('script[data-cg-botcha-js]')){
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

  function ensureCompactLayout(){
    const path=(location.pathname||'/').toLowerCase();
    if(path.includes('/admin/')) return;
    let link=document.querySelector('link[data-cg-compact-layout]');
    if(!link){
      link=document.createElement('link');
      link.rel='stylesheet';
      link.href='/assets/css/compact-layout.css?v=1.4.0';
      link.dataset.cgCompactLayout='1';
      document.head.appendChild(link);
    }
  }

  function boot(){
    applyV5DesignSystem();
    applyContrastFix();
    applyServiceFirstArt();
    upgradeRepositoryImages();
    syncCommonHeader();
    syncCommonFooter();
    removeDuplicateTerminalCta();
    normalizeFooter();
    normalizeAdminLogin();
    normalizeFeedbackTab();
    normalizeBotcha();
    normalizeContactLabels();
    ensureCompactLayout();
    enhanceCreativeExperience();
    const header=$('.site-header'); const scroll=()=>header?.classList.toggle('scrolled',scrollY>8);
    scroll(); addEventListener('scroll',scroll,{passive:true});
    const btn=$('.menu-btn'),nav=$('.nav');
    btn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open))});
    $$('.nav-group>button').forEach(b=>b.addEventListener('click',(e)=>{if(innerWidth<=1050){e.preventDefault();b.parentElement.classList.toggle('open')}}));
    $$('[data-copy-search]').forEach(x=>x.addEventListener('click',()=>{const q=$('#cg-global-search');if(q){q.value=x.dataset.copySearch||x.textContent.trim();q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}}));
    document.addEventListener('click',(e)=>{const a=e.target.closest('a'); if(!a)return; if(/wa\.me/.test(a.href)) track('click_whatsapp',{href:a.href}); else if(a.href.startsWith('tel:')) track('click_phone',{href:a.href}); else if(a.href.startsWith('mailto:')) track('click_email',{href:a.href}); else if(/instagram\.com/.test(a.href)) track('outbound_instagram',{href:a.href});});
    setTimeout(()=>track('page_view'),300);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();

/* ==========================================================================
   CG UNIQUE HERO ART MAP — 2026-09-28
   One relevant, non-repeated hero photograph per active public page.
   ========================================================================== */
(() => {
  const HERO_ART = {
    "/": "/assets/images/hero-collage.webp",
    "/index.html": "/assets/images/hero-collage.webp",
    "/about.html": "/assets/images/resource-engineering-v23.webp",
    "/services.html": "/assets/images/manufacturing.webp",
    "/divisions.html": "/assets/images/hero-engineering.webp",
    "/projects.html": "/assets/images/project-reverse.webp",
    "/insights.html": "/assets/images/cnc/cnc-spindle-generated.webp",
    "/industries.html": "/assets/images/div-manufacturing-v23.webp",
    "/engineering-desk.html": "/assets/images/process-drawing-v23.webp",
    "/contact.html": "/assets/images/catalog/custom/custom-machined-components.webp",
    "/request-quote.html": "/assets/images/process-cad-v23.webp",
    "/estimate.html": "/assets/images/resource-products-v23.webp",
    "/404.html": "/assets/images/process-supply-v23.webp",
    "/privacy.html": "/assets/images/resource-quality-v23.webp",
    "/disclaimer.html": "/assets/images/process-validate-v23.webp",

    "/3d-printing-kolkata.html": "/assets/images/am-approved-prototype.webp",
    "/business-support-compliance-kolkata.html": "/assets/images/div-tender-v22.webp",
    "/custom-machine-spares.html": "/assets/images/am-approved-spares.webp",
    "/design-job-work.html": "/assets/images/part6-tooling-hero.webp",
    "/gem-tender-support-kolkata.html": "/assets/images/process-supply.webp",
    "/industrial-automation-kolkata.html": "/assets/images/prod-plc-v23b.webp",
    "/industrial-inspection-qa-kolkata.html": "/assets/images/div-inspection-v23.webp",
    "/industrial-machine-maintenance-kolkata.html": "/assets/images/cnc/cnc-bearings-generated.webp",
    "/iso-9001-consultant-kolkata.html": "/assets/images/div-quality-v23.webp",
    "/laser-cutting-kolkata.html": "/assets/images/catalog/cutting-heads/raytools-bm114.webp",
    "/laser-marking-kolkata.html": "/assets/images/catalog/welding-cleaning/cleaning-head-consumable.webp",
    "/mechanical-design-services-kolkata.html": "/assets/images/div-engineering-v23.webp",
    "/reverse-engineering-kolkata.html": "/assets/images/am-approved-shaft.webp",
    "/sheet-metal-bending-kolkata.html": "/assets/images/catalog/press-brake/pb-custom.webp",

    "/divisions/advanced-manufacturing.html": "/assets/images/cg-advanced-manufacturing.webp",
    "/divisions/automation-solutions.html": "/assets/images/catalog/co2/co2-controller.webp",
    "/divisions/business-support-compliance.html": "/assets/images/div-products-v23.webp",
    "/divisions/engineering-design.html": "/assets/images/div-engineering.webp",
    "/divisions/inspection-testing.html": "/assets/images/process-verify.webp",
    "/divisions/machine-maintenance.html": "/assets/images/cnc/cnc-lubrication-generated.webp",
    "/divisions/quality-management-systems.html": "/assets/images/process-validate.webp",
    "/divisions/tender-business-development.html": "/assets/images/sourcing.webp",

    "/insights/3d-printing-file-formats.html": "/assets/images/prod-3d.webp",
    "/insights/3d-printing-tolerances.html": "/assets/images/am-approved-fixture.webp",
    "/insights/chiller-pump-equivalent-selection.html": "/assets/images/prod-pump-v23b.webp",
    "/insights/cnc-vmc-speeds-feeds-basics.html": "/assets/images/prod-cnc-v23.webp",
    "/insights/gdt-datum-basics.html": "/assets/images/process-verify-v23.webp",
    "/insights/holes-near-sheet-metal-bends.html": "/assets/images/prod-bending.webp",
    "/insights/identify-laser-consumables.html": "/assets/images/laser-consumables-sprite.webp",
    "/insights/laser-cutting-defects.html": "/assets/images/laser.webp",
    "/insights/laser-nozzle-focus-basics.html": "/assets/images/laser-components.webp",
    "/insights/machine-breakdown-data-checklist.html": "/assets/images/resource-maintenance-v23.webp",
    "/insights/metric-tap-drill-clearance-hole-chart.html": "/assets/images/am-approved-machined.webp",
    "/insights/ncr-rca-capa-guide.html": "/assets/images/process-validate-v23b.webp",
    "/insights/preventive-maintenance-basics.html": "/assets/images/process-maintain-v23.webp",
    "/insights/sheet-metal-bending-basics.html": "/assets/images/am-approved-bracket.webp",
    "/insights/stainless-steel-handling.html": "/assets/images/am-approved-enclosure.webp",
    "/insights/surface-roughness-ra-rz.html": "/assets/images/div-inspection-v23b.webp",
    "/insights/vernier-caliper-guide.html": "/assets/images/process-verify-v23b.webp",

    "/projects/3d-print-fai-batch.html": "/assets/images/part6-tooling-sprite.webp",
    "/projects/co2-laser-components-support.html": "/assets/images/catalog/co2/co2-laser-tube.webp",
    "/projects/custom-keychain-laser-marking.html": "/assets/images/laser-consumables/generated-focus-optics.webp",
    "/projects/fit-correction-replacement-component.html": "/assets/images/process-cad.webp",
    "/projects/laser-chiller-pump-replacement.html": "/assets/images/project-chiller-v23b.webp",
    "/projects/laser-machine-rca.html": "/assets/images/service-maintenance.webp",
    "/projects/precision-marked-components.html": "/assets/images/project-qr-v23.webp",
    "/projects/qms-audit-readiness.html": "/assets/images/resource-manufacturing-v23.webp",
    "/projects/ss304-qr-code-laser-marking.html": "/assets/images/am-approved-laser.webp"
  };

  function applyUniqueHeroArt(){
    if(!document.body) return;
    let path=(location.pathname||"/").toLowerCase();
    if(path.length>1 && path.endsWith("/")) path=path.slice(0,-1);
    const image=HERO_ART[path];
    if(!image) return;
    document.body.style.setProperty("--cg-hero-art", `url("${image}")`);
    document.body.dataset.cgHeroArt=image;
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",applyUniqueHeroArt,{once:true});
  } else {
    applyUniqueHeroArt();
  }
})();
