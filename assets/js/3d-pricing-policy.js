(()=>{
  const $=id=>document.getElementById(id);
  const fileInput=$('q3d-file'),calcBtn=$('calculate-quote'),sendBtn=$('send-rfq'),materialSel=$('material'),processSel=$('process'),qtyEl=$('quantity'),qualityEl=$('quality'),infillEl=$('infill'),complexityEl=$('complexity');
  const quotePrice=$('quote-price'),quoteGst=$('quote-gst'),quoteBreakdown=$('quote-breakdown');
  const insertOpt=$('opt-inserts'),finishOpt=$('opt-finish'),paintOpt=$('opt-paint'),faiOpt=$('opt-fai');
  if(!fileInput||!calcBtn||!sendBtn||!quoteBreakdown)return;

  const fallback={
    gst:18,
    addons:{brass_insert_each:10,finish:80,paint:120,fai:150},
    discounts:[{min_qty:10,percent:5},{min_qty:25,percent:10},{min_qty:50,percent:15}],
    materials:{
      fdm:{PLA:{rate:8},PETG:{rate:12},ABS:{rate:15},ASA:{rate:16},TPU:{rate:18},Nylon:{rate:23},'PA-CF':{rate:30}},
      resin:{'Standard Resin':{rate:16},'ABS-like Resin':{rate:18},'Tough Resin':{rate:25},'Clear Resin':{rate:35},'High-Temp Resin':{rate:40}},
      sls:{PA12:{rate:36},PA11:{rate:48},'PA12 GF':{rate:57}},
      mjf:{PA12:{rate:51},PA11:{rate:53},TPU:{rate:58}}
    }
  };
  let policy=structuredClone(fallback),writing=false,lastAdjusted=null;

  const extOf=f=>(f?.name?.split('.').pop()||'').toLowerCase();
  const isSTL=()=>extOf(fileInput.files?.[0])==='stl';
  const money=n=>Math.round(Number(n||0)).toLocaleString('en-IN');
  const numText=s=>Number(String(s||'').replace(/[^0-9.]/g,''))||0;

  async function loadPolicy(){
    try{
      const cfg=window.CG_CONFIG||{};
      if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey)return;
      const c=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
      const {data,error}=await c.from('estimate_rules').select('configuration').eq('rule_key','3d-print-quote-v1').eq('active',true).maybeSingle();
      if(!error&&data?.configuration){
        policy={...fallback,...data.configuration,addons:{...fallback.addons,...(data.configuration.addons||{})},materials:{...fallback.materials,...(data.configuration.materials||{})}};
      }
    }catch(_){ }
  }

  function addInsertCount(){
    if(!insertOpt||$('insert-count'))return;
    const wrap=document.createElement('span');
    wrap.style.cssText='display:inline-flex;align-items:center;gap:6px;margin-left:8px;font-size:.88em';
    wrap.innerHTML='Qty/part <input id="insert-count" type="number" min="1" step="1" value="1" disabled style="width:68px;padding:6px 8px">';
    insertOpt.closest('label')?.appendChild(wrap);
    const count=$('insert-count');
    insertOpt.addEventListener('change',()=>{count.disabled=!insertOpt.checked;if(insertOpt.checked&&Number(count.value)<1)count.value='1';scheduleReprice()});
    count.addEventListener('input',scheduleReprice);
  }

  function discountPct(q){
    const tiers=[...(policy.discounts||fallback.discounts)].sort((a,b)=>Number(a.min_qty)-Number(b.min_qty));
    let pct=0;for(const t of tiers)if(q>=Number(t.min_qty||0))pct=Number(t.percent||0);return pct;
  }

  function readBaseMetrics(){
    const rows=[...quoteBreakdown.querySelectorAll('div')];
    let grams=0,hours=0;
    for(const row of rows){
      const text=row.innerText||'';
      if(/Material \/ part/i.test(text))grams=numText(row.querySelector('b')?.textContent);
      if(/Machine time \/ part/i.test(text))hours=numText(row.querySelector('b')?.textContent);
    }
    return{grams,hours};
  }

  function reprice(){
    if(writing||!isSTL())return;
    const {grams,hours}=readBaseMetrics();if(!grams)return;
    const process=processSel?.value||'fdm',material=materialSel?.value||'',q=Math.max(1,Number(qtyEl?.value||1));
    const rate=Number(policy.materials?.[process]?.[material]?.rate||0);if(!rate)return;
    const insertCount=insertOpt?.checked?Math.max(1,Number($('insert-count')?.value||1)):0;
    const materialAmount=grams*rate*q;
    const insertAmount=insertCount*Number(policy.addons?.brass_insert_each||10)*q;
    const finishing=finishOpt?.checked?Number(policy.addons?.finish||80):0;
    const painting=paintOpt?.checked?Number(policy.addons?.paint||120):0;
    const fai=faiOpt?.checked?Number(policy.addons?.fai||150):0;
    const beforeDiscount=materialAmount+insertAmount+finishing+painting+fai;
    const pct=discountPct(q),subtotal=beforeDiscount*(1-pct/100),gst=subtotal*Number(policy.gst||18)/100,total=subtotal+gst;
    lastAdjusted={process,material,q,grams,hours,rate,insertCount,insertAmount,finishing,painting,fai,pct,subtotal,gst,total,quality:qualityEl?.value||'',infill:process==='fdm'?Number(infillEl?.value||0):null,complexity:complexityEl?.value||'',file:fileInput.files?.[0]?.name||''};
    sessionStorage.setItem('cg_3d_pricing_adjusted',JSON.stringify(lastAdjusted));
    writing=true;
    quotePrice.textContent=`₹ ${money(subtotal)}`;
    quoteGst.textContent=`Approx. ₹${money(total)} incl. ${policy.gst||18}% GST`;
    const lines=[
      `<div><span>Estimated material / part</span><b>${grams.toFixed(1)} g</b></div>`,
      `<div><span>Material rate</span><b>₹${rate}/g</b></div>`,
      `<div><span>Material value (${q} pc)</span><b>₹${money(materialAmount)}</b></div>`,
      `<div><span>Machine time / part</span><b>${hours.toFixed(2)} h · no charge</b></div>`,
      insertAmount?`<div><span>Brass inserts</span><b>${insertCount}/part × ${q} × ₹${policy.addons.brass_insert_each} = ₹${money(insertAmount)}</b></div>`:'',
      finishing?`<div><span>Sanding / finishing</span><b>₹${money(finishing)}</b></div>`:'',
      painting?`<div><span>Primer / painting</span><b>₹${money(painting)}</b></div>`:'',
      fai?`<div><span>First Article Inspection</span><b>₹${money(fai)}</b></div>`:'',
      `<div><span>Quantity discount</span><b>${pct?`${pct}%`:'None'}</b></div>`,
      `<div><span>Setup / machine charge</span><b>₹0</b></div>`
    ].filter(Boolean).join('');
    quoteBreakdown.innerHTML=lines;
    const warning=document.querySelector('.q3d-warning');
    if(warning)warning.innerHTML='<b>Pricing basis:</b> estimated printable material weight × selected material rate, plus selected add-ons, less the applicable quantity discount. There is no setup charge and no machine-time charge. GST is added separately. Final production suitability is subject to engineering review.';
    writing=false;
  }

  function scheduleReprice(){setTimeout(reprice,80);setTimeout(reprice,500);setTimeout(reprice,1400)}
  const obs=new MutationObserver(()=>{if(!writing&&isSTL())scheduleReprice()});obs.observe(quoteBreakdown,{subtree:true,childList:true,characterData:true});
  [qtyEl,materialSel,processSel,qualityEl,infillEl,complexityEl,finishOpt,paintOpt,faiOpt].forEach(e=>e?.addEventListener('change',scheduleReprice));
  calcBtn.addEventListener('click',scheduleReprice);
  fileInput.addEventListener('change',()=>{lastAdjusted=null;if(isSTL())scheduleReprice()});

  const cleanName=name=>String(name||'cad-file').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-180);
  const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  async function upload(file){
    if(!file||file.size>50*1024*1024)return null;
    const cfg=window.CG_CONFIG||{};if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey)return null;
    const c=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey),month=new Date().toISOString().slice(0,7),path=`public-rfq/pending/${month}/${uid()}-${cleanName(file.name)}`;
    const up=await c.storage.from('rfq-files').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});if(up.error)throw up.error;
    return{path,name:file.name,size:file.size,type:file.type||''};
  }

  sendBtn.addEventListener('click',async e=>{
    if(!isSTL()||!lastAdjusted)return;
    e.preventDefault();e.stopImmediatePropagation();
    const x=lastAdjusted,file=fileInput.files?.[0],old=sendBtn.textContent;sendBtn.disabled=true;sendBtn.textContent='Preparing RFQ…';
    let attachment=null;try{attachment=await upload(file)}catch(_){ }
    const msg=[
      '3D Printing Instant STL Estimate from CG website',
      `File: ${x.file}`,
      `Process: ${x.process.toUpperCase()}`,
      `Material: ${x.material} @ ₹${x.rate}/g`,
      `Quantity: ${x.q}`,
      `Estimated material: ${x.grams.toFixed(1)} g/pc`,
      `Estimated machine time: ${x.hours.toFixed(2)} h/pc (informational only; no machine-time charge)`,
      x.insertCount?`Brass inserts: ${x.insertCount}/part @ ₹${policy.addons.brass_insert_each} each`:null,
      x.finishing?`Sanding / finishing: ₹${x.finishing}`:null,
      x.painting?`Primer / painting: ₹${x.painting}`:null,
      x.fai?`First Article Inspection: ₹${x.fai}`:null,
      `Quantity discount: ${x.pct}%`,
      'Setup charge: ₹0',
      'Machine charge: ₹0',
      `Approx subtotal: ₹${money(x.subtotal)}`,
      `Approx total incl. GST: ₹${money(x.total)}`,
      'Please review printability, orientation/supports, tolerances and finish before final quotation.'
    ].filter(Boolean);
    const u=new URL('../request-quote.html',location.href);u.searchParams.set('requirement','3D Printing');u.searchParams.set('message',msg.join('\n'));u.searchParams.set('material',x.material);u.searchParams.set('quantity',String(x.q));
    if(attachment){u.searchParams.set('attachment_path',attachment.path);u.searchParams.set('attachment_name',attachment.name);u.searchParams.set('attachment_size',String(attachment.size));if(attachment.type)u.searchParams.set('attachment_type',attachment.type)}
    location.href=u.toString();sendBtn.textContent=old;sendBtn.disabled=false;
  },true);

  addInsertCount();loadPolicy().then(scheduleReprice);
})();
