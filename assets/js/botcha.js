(() => {
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const root=$('[data-botcha-root]');
  if(!root || root.dataset.ready==='1') return;
  root.dataset.ready='1';

  const launcher=$('.cg-botcha-launcher',root);
  const panel=$('.cg-botcha-chat',root);
  const close=$('.cg-botcha-close',root);
  const form=$('.cg-botcha-form',root);
  const input=$('.cg-botcha-input',root);
  const send=$('.cg-botcha-send',root);
  const messages=$('.cg-botcha-messages',root);
  const quick=$('.cg-botcha-quick',root);
  const status=$('.cg-botcha-status',root);
  const STORAGE='cg_botcha_history_v2';
  const MAX_HISTORY=10;

  const starter=[
    'What services does Crecer Grande provide?',
    'I have a machine breakdown',
    'Can you help with CAD or reverse engineering?',
    'What should I send for a quotation?'
  ];

  let history=[];
  let busy=false;

  try{
    const saved=JSON.parse(sessionStorage.getItem(STORAGE)||'[]');
    if(Array.isArray(saved)) history=saved.filter(x=>x&&['user','assistant'].includes(x.role)&&x.content).slice(-MAX_HISTORY);
  }catch(_){}

  const escUrl=(url)=>{
    const v=String(url||'');
    return /^\/[a-zA-Z0-9_./?%=&-]*$/.test(v)?v:null;
  };
  const persist=()=>{
    try{sessionStorage.setItem(STORAGE,JSON.stringify(history.slice(-MAX_HISTORY)))}catch(_){}
  };
  const scrollBottom=()=>requestAnimationFrame(()=>{messages.scrollTop=messages.scrollHeight});
  const clearQuick=()=>{quick.innerHTML=''};

  function addMessage(role,content,links=[],meta=''){
    const row=document.createElement('div');
    row.className='cg-botcha-message '+(role==='user'?'is-user':'is-bot');
    const avatar=document.createElement('div');
    avatar.className='cg-botcha-avatar';
    avatar.textContent=role==='user'?'You':'B';
    const bubble=document.createElement('div');
    bubble.className='cg-botcha-bubble';

    String(content||'').split(/\n{2,}/).filter(Boolean).forEach(part=>{
      const p=document.createElement('p');
      p.textContent=part;
      bubble.appendChild(p);
    });

    const safeLinks=(Array.isArray(links)?links:[]).map(x=>({label:String(x?.label||'Learn more').slice(0,80),url:escUrl(x?.url)})).filter(x=>x.url);
    if(safeLinks.length){
      const wrap=document.createElement('div');
      wrap.className='cg-botcha-answer-links';
      safeLinks.slice(0,3).forEach(x=>{
        const a=document.createElement('a');
        a.href=x.url;
        a.textContent=x.label+' →';
        wrap.appendChild(a);
      });
      bubble.appendChild(wrap);
    }

    if(meta&&role==='assistant'){
      const small=document.createElement('small');
      small.className='cg-botcha-answer-meta';
      small.textContent=meta;
      bubble.appendChild(small);
    }
    row.append(avatar,bubble);
    messages.appendChild(row);
    scrollBottom();
    return row;
  }

  function renderHistory(){
    messages.innerHTML='';
    if(!history.length){
      addMessage('assistant',
        'Hi — I’m Botcha, Crecer Grande’s virtual engineering assistant. Tell me what you need to make, fix, design, verify or submit. I can explain the right service route and what information will help our team review it.',
        [{label:'Engineering Desk',url:'/engineering-desk.html'}],
        'CG knowledge assistant'
      );
    }else{
      history.forEach(m=>addMessage(m.role,m.content,m.links||[],m.role==='assistant'?(m.meta||''):''));
    }
    renderQuick(starter);
  }

  function renderQuick(items){
    clearQuick();
    (Array.isArray(items)&&items.length?items:starter).slice(0,4).forEach(text=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='cg-botcha-chip';
      b.textContent=text;
      b.addEventListener('click',()=>ask(text));
      quick.appendChild(b);
    });
  }

  function typing(on){
    $('.cg-botcha-typing',messages)?.remove();
    if(!on)return;
    const row=document.createElement('div');
    row.className='cg-botcha-message is-bot cg-botcha-typing';
    const avatar=document.createElement('div');
    avatar.className='cg-botcha-avatar';avatar.textContent='B';
    const bubble=document.createElement('div');
    bubble.className='cg-botcha-bubble';
    bubble.innerHTML='<span></span><span></span><span></span>';
    row.append(avatar,bubble);
    messages.appendChild(row);
    scrollBottom();
  }

  function localFallback(q){
    const s=q.toLowerCase();
    if(/quote|quotation|price|cost|how much|delivery|lead time/.test(s))return {
      answer:'Pricing, delivery time and final scope depend on the actual requirement. Send the drawing, part or machine reference, quantity, specification and target date so Crecer Grande can review it before issuing a commercial response.',
      links:[{label:'Request a Quote',url:'/request-quote.html'}]
    };
    if(/machine|breakdown|cnc|vmc|maintenance|alarm|repair/.test(s))return {
      answer:'For a machine issue, start with the make/model, exact alarm or symptom, photographs, recent intervention and what changed before the problem appeared. Crecer Grande can use that evidence to structure the maintenance or troubleshooting route.',
      links:[{label:'Machine Maintenance',url:'/divisions/machine-maintenance.html'},{label:'Engineering Desk',url:'/engineering-desk.html'}]
    };
    if(/cad|drawing|design|reverse|draft/.test(s))return {
      answer:'Crecer Grande supports CAD, drafting, production drawings, DFM/DFA and reverse engineering. Send the drawing, sketch, sample, dimensions or CAD data you already have and describe the required output.',
      links:[{label:'Engineering & Design',url:'/divisions/engineering-design.html'}]
    };
    if(/3d|print|stl|prototype/.test(s))return {
      answer:'For 3D printing, send the model/file, intended use, dimensions, quantity, material preference and finish. STL is useful for print geometry; STEP/STP can be reviewed where engineering definition is needed.',
      links:[{label:'3D Printing',url:'/3d-printing-kolkata.html'}]
    };
    if(/plc|hmi|sensor|automation|control/.test(s))return {
      answer:'Automation support covers PLC, HMI, I/O, sensors and machine controls. Share the machine model, control hardware, wiring/I/O information, alarm or symptom and the operating change you need.',
      links:[{label:'Automation Solutions',url:'/divisions/automation-solutions.html'}]
    };
    if(/iso|qms|rca|capa|ncr|quality|audit/.test(s))return {
      answer:'Crecer Grande supports QMS documentation, SOPs, RCA/CAPA and audit-readiness work. For a quality issue, share the requirement, evidence, measured result, containment status and available records.',
      links:[{label:'Quality & Management Systems',url:'/divisions/quality-management-systems.html'}]
    };
    if(/contact|phone|whatsapp|email|address/.test(s))return {
      answer:'You can call +91 7003301781, WhatsApp +91 6291001781, or email crecergrande@outlook.com. Crecer Grande is based in Rajarhat, West Bengal.',
      links:[{label:'Contact Crecer Grande',url:'/contact.html'}]
    };
    return {
      answer:'I can help route Crecer Grande enquiries across design, manufacturing, machine maintenance, automation, quality, inspection, tender support and business support. Tell me what you are trying to make, fix, verify or submit and what evidence you already have.',
      links:[{label:'Engineering Desk',url:'/engineering-desk.html'},{label:'Request a Quote',url:'/request-quote.html'}]
    };
  }

  async function ask(raw){
    const question=String(raw||input.value||'').trim().slice(0,900);
    if(!question||busy)return;
    const prior=history.slice(-8).map(({role,content})=>({role,content}));
    history.push({role:'user',content:question});
    history=history.slice(-MAX_HISTORY);
    persist();
    addMessage('user',question);
    input.value='';
    input.style.height='auto';
    clearQuick();
    busy=true;
    send.disabled=true;
    input.disabled=true;
    status.textContent='Thinking…';
    typing(true);
    window.CGTrack?.('botcha_question',{length:question.length});

    let result=null;
    const cfg=window.CG_CONFIG||{};
    if(cfg.supabaseUrl&&cfg.supabasePublishableKey){
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),22000);
      try{
        const ids=window.CGVisitorIds?window.CGVisitorIds():['',''];
        const res=await fetch(cfg.supabaseUrl+'/functions/v1/botcha-assistant',{
          method:'POST',
          signal:controller.signal,
          headers:{
            'Content-Type':'application/json',
            'apikey':cfg.supabasePublishableKey
          },
          body:JSON.stringify({
            message:question,
            history:prior,
            visitor_id:ids[0]||null,
            session_id:ids[1]||null,
            source_page:location.pathname
          })
        });
        const data=await res.json().catch(()=>({}));
        if(res.ok&&data?.answer)result=data;
        else if(res.status===429)result={answer:data?.error||'I have reached the message limit for this connection. Please use Request a Quote or contact Crecer Grande directly.',links:[{label:'Request a Quote',url:'/request-quote.html'},{label:'Contact',url:'/contact.html'}],suggestions:[]};
      }catch(_){}
      clearTimeout(timer);
    }

    if(!result){
      const fallback=localFallback(question);
      result={...fallback,suggestions:starter,engine:'local'};
    }

    typing(false);
    const meta=result.engine==='ai'?'AI-assisted • grounded in CG information':result.engine==='semantic'?'Matched from CG knowledge':'CG quick guidance';
    addMessage('assistant',result.answer,result.links||[],meta);
    history.push({role:'assistant',content:result.answer,links:result.links||[],meta});
    history=history.slice(-MAX_HISTORY);
    persist();
    renderQuick(result.suggestions||starter);
    busy=false;
    send.disabled=false;
    input.disabled=false;
    status.textContent='Online';
    input.focus();
    window.CGTrack?.('botcha_answer',{engine:result.engine||'fallback'});
  }

  function openPanel(){
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    launcher.setAttribute('aria-expanded','true');
    root.classList.add('is-open');
    setTimeout(()=>input.focus(),120);
    window.CGTrack?.('botcha_open');
  }
  function closePanel(){
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    launcher.setAttribute('aria-expanded','false');
    root.classList.remove('is-open');
    launcher.focus();
  }

  launcher.addEventListener('click',()=>panel.classList.contains('open')?closePanel():openPanel());
  close.addEventListener('click',closePanel);
  form.addEventListener('submit',e=>{e.preventDefault();ask()});
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}
  });
  input.addEventListener('input',()=>{
    input.style.height='auto';
    input.style.height=Math.min(input.scrollHeight,104)+'px';
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('open'))closePanel()});

  renderHistory();
})();