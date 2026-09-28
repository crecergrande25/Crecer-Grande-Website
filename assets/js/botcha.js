/* Crecer Grande — Botcha quick-assist widget
   Standalone by design so it remains functional even if another page script fails. */
(() => {
  "use strict";

  const STYLE_ID = "cg-botcha-style";
  const PANEL_ID = "cg-botcha-panel";

  const markup = `
    <div class="ask cg-botcha" data-botcha-widget>
      <button class="ask-btn cg-botcha-btn" type="button" aria-expanded="false" aria-controls="${PANEL_ID}">
        <span class="cg-botcha-gem" aria-hidden="true">◆</span>
        <span>Botcha !</span>
      </button>
      <div class="ask-panel cg-botcha-panel" id="${PANEL_ID}" role="dialog" aria-label="Botcha quick help">
        <div class="cg-botcha-head">
          <div>
            <small>CRECER GRANDE QUICK ASSIST</small>
            <h3>How can Botcha help?</h3>
          </div>
          <button class="cg-botcha-close" type="button" aria-label="Close Botcha">×</button>
        </div>
        <p>Choose what you need and Botcha will take you to the right route.</p>
        <div class="cg-botcha-routes">
          <a href="/request-quote.html?requirement=Industrial%20Spare%20Identification">Identify a Part</a>
          <a href="/request-quote.html?requirement=Upload%20a%20Drawing">Upload a Drawing</a>
          <a href="/request-quote.html?requirement=Manufacture%20a%20Component">Manufacture a Component</a>
          <a href="/request-quote.html?requirement=Machine%20Breakdown">Machine Breakdown</a>
          <a href="/3d-printing-kolkata.html">3D Printing</a>
          <a href="/request-quote.html">Request a Quote</a>
        </div>
      </div>
    </div>`;

  const css = `
    .cg-botcha{position:fixed;right:20px;bottom:20px;z-index:9999}
    .cg-botcha .cg-botcha-btn{
      display:inline-flex!important;align-items:center!important;gap:8px!important;
      min-height:52px!important;padding:13px 20px!important;
      border:1px solid rgba(244,176,0,.34)!important;border-radius:999px!important;
      background:#173d63!important;color:#f4b000!important;
      font-weight:900!important;font-size:16px!important;letter-spacing:.01em!important;
      cursor:pointer!important;
      box-shadow:0 16px 38px rgba(2,15,34,.34),0 6px 18px rgba(244,176,0,.12)!important;
      transition:transform .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease!important
    }
    .cg-botcha .cg-botcha-btn *{color:#f4b000!important}
    .cg-botcha .cg-botcha-btn:hover,.cg-botcha .cg-botcha-btn:focus-visible{
      background:#0f3154!important;color:#ffd05a!important;border-color:rgba(244,176,0,.65)!important;
      transform:translateY(-2px)!important;outline:none!important;
      box-shadow:0 20px 46px rgba(2,15,34,.40),0 8px 22px rgba(244,176,0,.18)!important
    }
    .cg-botcha .cg-botcha-btn:hover *,.cg-botcha .cg-botcha-btn:focus-visible *{color:#ffd05a!important}
    .cg-botcha-gem{font-size:12px;line-height:1}
    .cg-botcha .cg-botcha-panel{
      position:absolute!important;right:0!important;bottom:64px!important;
      display:none!important;width:min(370px,calc(100vw - 28px))!important;
      padding:18px!important;border:1px solid rgba(23,61,99,.16)!important;border-radius:18px!important;
      background:#fff!important;color:#102a43!important;
      box-shadow:0 26px 70px rgba(2,15,34,.28)!important
    }
    .cg-botcha .cg-botcha-panel.open{display:block!important;animation:cgBotchaPop .16s ease-out both}
    .cg-botcha-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:4px}
    .cg-botcha-head small{display:block;color:#9a6a00!important;font-size:8px!important;font-weight:900!important;letter-spacing:.12em!important}
    .cg-botcha-head h3{margin:4px 0 0!important;color:#102a43!important;font-size:20px!important;line-height:1.15!important}
    .cg-botcha .cg-botcha-panel>p{margin:8px 0 14px!important;color:#62758a!important;font-size:11px!important;line-height:1.55!important}
    .cg-botcha-close{
      width:31px;height:31px;border:1px solid #dce4eb;border-radius:50%;background:#f7f9fb;color:#173d63;
      cursor:pointer;font-size:20px;line-height:1
    }
    .cg-botcha-routes{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .cg-botcha-routes a{
      display:flex!important;align-items:center!important;min-height:48px!important;margin:0!important;padding:10px 11px!important;
      border:1px solid #e1e7ed!important;border-radius:10px!important;background:#f7f9fb!important;
      color:#173d63!important;font-size:11px!important;font-weight:800!important;text-decoration:none!important
    }
    .cg-botcha-routes a:hover,.cg-botcha-routes a:focus-visible{
      background:#fff7df!important;border-color:#e4bd58!important;color:#765100!important;outline:none!important
    }
    @keyframes cgBotchaPop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
    @media(max-width:600px){
      .cg-botcha{right:12px;bottom:12px}
      .cg-botcha .cg-botcha-btn{min-height:48px!important;padding:11px 16px!important;font-size:14px!important}
      .cg-botcha .cg-botcha-panel{bottom:58px!important}
      .cg-botcha-routes{grid-template-columns:1fr}
    }
  `;

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=css;
    document.head.appendChild(style);
  }

  function ensureWidget(){
    let root=document.querySelector("[data-botcha-widget], .ask");
    if(!root){
      document.body.insertAdjacentHTML("beforeend",markup);
      root=document.querySelector("[data-botcha-widget]");
    }else{
      root.classList.add("cg-botcha");
      root.setAttribute("data-botcha-widget","");
      root.innerHTML=markup.match(/<div class="ask cg-botcha" data-botcha-widget>([\s\S]*)<\/div>\s*$/)[1];
    }
    return root;
  }

  function init(){
    ensureStyle();
    const root=ensureWidget();
    if(!root || root.dataset.botchaReady==="1") return;
    root.dataset.botchaReady="1";

    /* Clone the button to remove any legacy iKNOW click listener from old site.js versions. */
    const oldButton=root.querySelector(".ask-btn");
    const button=oldButton.cloneNode(true);
    oldButton.replaceWith(button);

    const panel=root.querySelector(".ask-panel");
    const close=root.querySelector(".cg-botcha-close");

    const setOpen=(open)=>{
      panel.classList.toggle("open",open);
      button.setAttribute("aria-expanded",String(open));
      if(open) close?.focus({preventScroll:true});
    };

    button.addEventListener("click",(event)=>{
      event.preventDefault();
      event.stopPropagation();
      setOpen(!panel.classList.contains("open"));
    });
    close?.addEventListener("click",(event)=>{
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      button.focus({preventScroll:true});
    });
    panel.addEventListener("click",(event)=>event.stopPropagation());
    document.addEventListener("click",(event)=>{
      if(!root.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown",(event)=>{
      if(event.key==="Escape" && panel.classList.contains("open")){
        setOpen(false);
        button.focus({preventScroll:true});
      }
    });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();