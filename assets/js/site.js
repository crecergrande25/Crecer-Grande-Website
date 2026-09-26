(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  function applyV5DesignSystem(){
    const path=(location.pathname||'/').toLowerCase();
    const isHome=(path==='/'||path==='/index.html');
    const isAdmin=path.includes('/admin/');

    document.querySelectorAll('link[href*="/assets/css/precision-site.css"],link[href*="/assets/css/site-v5.css"]').forEach(x=>x.remove());
    document.body.classList.remove('cg-v5');
    [...document.body.classList].filter(x=>x.startsWith('cg-page-')||x.startsWith('cg-body-')).forEach(x=>document.body.classList.remove(x));

    if(isHome||isAdmin) return;

    if(!document.querySelector('link[data-cg-body-polish]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='/assets/css/body-polish.css?v=1.0.0';
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

  const TOPBAR = `<div class="topbar"><div class="container topbar-in"><div class="topbar-meta"><span data-site-field="gstin" data-site-prefix="GSTIN: ">GSTIN: 19BBJPB4158H1ZM</span><span data-site-field="udyam" data-site-prefix="Udyam: ">Udyam: UDYAM-WB-14-0231207</span><span>West Bengal, India</span></div><a data-site-field="instagram_handle" data-site-link="instagram" href="https://www.instagram.com/crecer_grande/" target="_blank" rel="noopener">@crecer_grande</a></div></div>`;

  const HEADER_HOME = `<header class="site-header"><div class="container navrow"><a aria-label="Crecer Grande home" class="brand" href="/"><img alt="Crecer Grande" data-site-src="logo_url" decoding="async" src="/assets/images/logo.png"/></a><button aria-expanded="false" aria-label="Toggle navigation" class="menu-btn" type="button"><span></span><span></span><span></span></button><nav aria-label="Main navigation" class="nav"><a href="/about.html">About</a><a href="/divisions.html">Divisions</a><a href="/services.html">Capabilities</a><a href="/projects.html">Projects</a><a href="/insights.html">Insights</a><a href="/contact.html">Contact</a><a class="quote-nav" href="/request-quote.html">Get in Touch →</a></nav></div></header>`;

  const HEADER = `<header class="site-header"><div class="container navrow"><a aria-label="Crecer Grande home" class="brand" href="/"><img alt="Crecer Grande" data-site-src="logo_url" decoding="async" src="/assets/images/logo.png"/></a><button aria-expanded="false" aria-label="Toggle navigation" class="menu-btn" type="button"><span></span><span></span><span></span></button><nav aria-label="Main navigation" class="nav"><a href="/about.html">About</a><a href="/divisions.html">Divisions</a><a href="/services.html">Capabilities</a><a href="/projects.html">Projects</a><a href="/insights.html">Insights</a><a href="/contact.html">Contact</a><a class="quote-nav" href="/request-quote.html">Get in Touch →</a></nav></div></header>`;

  const FOOTER_CTA = "<section class=\"cg-footer-cta\">\n<div class=\"container cg-footer-cta-inner\">\n<div>\n<h2>Have an engineering, manufacturing or operational requirement?</h2>\n<p>Send a drawing, sample, photograph, machine model, part number, document or problem statement. We will structure the most practical service route.</p>\n</div>\n<a class=\"cg-footer-cta-btn\" href=\"/request-quote.html\">Send Requirement</a>\n</div>\n</section>";
  const FOOTER = "<footer class=\"cg-footer\">\n<div class=\"container cg-footer-grid\">\n<div class=\"cg-footer-brand\">\n<a aria-label=\"Crecer Grande home\" class=\"cg-footer-logo-link\" href=\"/\"><img alt=\"Crecer Grande\" src=\"/assets/images/logo.png\"/></a>\n<p class=\"cg-footer-tagline\">Engineering Services • Industrial Support • Business Support</p>\n<p class=\"cg-footer-desc\">A coordinated service network for design, manufacturing support, maintenance, automation, quality, inspection and business workflows.</p>\n</div>\n<div class=\"cg-footer-col\"><h4>Service Routes</h4><a href=\"/engineering-desk.html\">Engineering Desk</a><a href=\"/services.html\">Service Directory</a><a href=\"/divisions.html\">Capability Divisions</a><a href=\"/3d-printing-kolkata.html\">3D Printing Service</a></div>\n<div class=\"cg-footer-col\"><h4>Company</h4><a href=\"/about.html\">About</a><a href=\"/projects.html\">Projects &amp; Case Studies</a><a href=\"/industries.html\">Industries</a><a href=\"/insights.html\">Insights</a><a href=\"/contact.html\">Contact</a><a href=\"/privacy.html\">Privacy</a><a href=\"/disclaimer.html\">Disclaimer</a></div>\n<div class=\"cg-footer-col cg-footer-contact\"><h4>Contact</h4><a class=\"cg-contact-line\" href=\"tel:+917003301781\"><span>+91 7003301781</span></a><a class=\"cg-contact-line\" href=\"mailto:crecergrande@outlook.com\"><span>crecergrande@outlook.com</span></a><p class=\"cg-contact-address\">Plot No. LR-645, Mathpara Rd., Rajarhat, West Bengal - 700135</p><div class=\"cg-footer-socials cg-contact-socials\"><a aria-label=\"WhatsApp Crecer Grande\" class=\"cg-social-pill\" href=\"https://wa.me/916291001781\" rel=\"noopener\" target=\"_blank\"><span class=\"cg-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M20.5 3.5A11.7 11.7 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.2 1.6 6L.2 24l6.4-1.7a11.8 11.8 0 0 0 5.5 1.4h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.2-3.5-8.4ZM12.1 21.7h-.1c-1.7 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.5 4.7Zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.5-.5.3-.5c.1-.2.1-.4 0-.5-.1-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z\"></path></svg></span><span>WhatsApp</span></a><a aria-label=\"Instagram @crecer_grande\" class=\"cg-social-pill\" href=\"https://www.instagram.com/crecer_grande/\" rel=\"noopener\" target=\"_blank\"><span class=\"cg-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M7.5 0h9A7.5 7.5 0 0 1 24 7.5v9a7.5 7.5 0 0 1-7.5 7.5h-9A7.5 7.5 0 0 1 0 16.5v-9A7.5 7.5 0 0 1 7.5 0Zm0 2.3a5.2 5.2 0 0 0-5.2 5.2v9a5.2 5.2 0 0 0 5.2 5.2h9a5.2 5.2 0 0 0 5.2-5.2v-9a5.2 5.2 0 0 0-5.2-5.2h-9Zm10.8 1.8a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM12 5.8a6.2 6.2 0 1 1 0 12.4A6.2 6.2 0 0 1 12 5.8Zm0 2.3A3.9 3.9 0 1 0 12 16a3.9 3.9 0 0 0 0-7.8Z\"></path></svg></span><span>@crecer_grande</span></a></div></div>\n</div>\n<div class=\"container cg-footer-bottom\"><span>© 2026 Crecer Grande. All rights reserved.</span><span class=\"cg-made-with-love\">Made with <span aria-label=\"love\" class=\"cg-heart\">♥</span></span><a class=\"cg-admin-login\" href=\"/admin/\" rel=\"nofollow\">Admin Login</a></div>\n</footer>";

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
  "/assets/images/process-followup-v23.webp": "/assets/images/hero-engineering.webp",
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
    style.textContent = `.cg-footer{padding:36px 0 14px!important}.cg-footer-grid{gap:32px!important}.cg-footer-logo-link img{width:305px!important;max-width:100%!important;margin-bottom:14px!important}.cg-footer-tagline{margin-bottom:10px!important}.cg-footer-desc{margin-bottom:12px!important}.cg-footer-col h4{margin-bottom:12px!important}.cg-footer-col>a{margin-bottom:8px!important}.cg-footer-contact .cg-contact-line{margin-bottom:9px!important}.cg-contact-address{margin-top:2px!important}.cg-footer-socials{margin-top:12px!important}.cg-contact-socials .cg-social-pill[href*="wa.me"]{border-color:#128C7E!important;background:#128C7E!important;color:#fff!important}.cg-contact-socials .cg-social-pill[href*="wa.me"] .cg-icon{color:#25D366!important}.cg-contact-socials .cg-social-pill[href*="instagram.com"]{border-color:#D44C72!important;background:linear-gradient(135deg,#833AB4,#E1306C,#F77737)!important;color:#fff!important}.cg-contact-socials .cg-social-pill[href*="instagram.com"] .cg-icon{color:#E1306C!important}.cg-social-pill:hover{filter:brightness(1.08)!important}.cg-heart{color:#25D366!important}.cg-footer-bottom{margin-top:24px!important;padding-top:14px!important}@media(max-width:760px){.cg-footer{padding:30px 0 18px!important}.cg-footer-grid{gap:26px!important}.cg-footer-logo-link img{width:250px!important}.cg-footer-bottom{grid-template-columns:1fr!important;text-align:left!important}.cg-footer-bottom span:nth-child(2),.cg-footer-bottom span:last-child{text-align:left!important}}`;
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

  function boot(){
    applyV5DesignSystem();
    applyServiceFirstArt();
    upgradeRepositoryImages();
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
    document.addEventListener('click',(e)=>{const a=e.target.closest('a'); if(!a)return; if(/wa\.me/.test(a.href)) track('click_whatsapp',{href:a.href}); else if(a.href.startsWith('tel:')) track('click_phone',{href:a.href}); else if(a.href.startsWith('mailto:')) track('click_email',{href:a.href}); else if(/instagram\.com/.test(a.href)) track('outbound_instagram',{href:a.href});});
    setTimeout(()=>track('page_view'),300);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();