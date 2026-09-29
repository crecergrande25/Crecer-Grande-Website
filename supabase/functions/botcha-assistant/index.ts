import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL=Deno.env.get('SUPABASE_URL')||'';
function secretKey(){
  const modern=Deno.env.get('SUPABASE_SECRET_KEYS');
  if(modern){
    try{return JSON.parse(modern)?.default||''}catch{}
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||Deno.env.get('SUPABASE_SECRET_KEY')||'';
}
const SERVICE_KEY=secretKey();
const OPENAI_API_KEY=Deno.env.get('OPENAI_API_KEY')||'';
const OPENAI_MODEL=Deno.env.get('BOTCHA_OPENAI_MODEL')||'gpt-6-luna';
const embedder=new Supabase.ai.Session('gte-small');

const allowedOrigins=new Set([
  'https://crecergrande.in',
  'https://www.crecergrande.in',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

function cors(origin:string|null){
  const allow=origin&&allowedOrigins.has(origin)?origin:'https://crecergrande.in';
  return {
    'Access-Control-Allow-Origin':allow,
    'Access-Control-Allow-Headers':'authorization, apikey, x-client-info, content-type',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Vary':'Origin'
  };
}
function json(body:unknown,status=200,origin:string|null=null){
  return new Response(JSON.stringify(body),{status,headers:{...cors(origin),'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
}
const clean=(v:unknown,n=1200)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const cleanId=(v:unknown,n=120)=>clean(v,n).replace(/[^a-zA-Z0-9._:-]/g,'');
const uniq=<T>(xs:T[])=>[...new Set(xs)];

async function sha256(value:string){
  const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function extractOpenAIText(data:any){
  if(typeof data?.output_text==='string'&&data.output_text.trim())return data.output_text.trim();
  const parts:string[]=[];
  for(const item of data?.output||[]){
    if(item?.type!=='message')continue;
    for(const c of item?.content||[]){
      if((c?.type==='output_text'||c?.type==='text')&&typeof c?.text==='string')parts.push(c.text);
    }
  }
  return parts.join('\n').trim();
}
function normalized(v:string){
  return String(v||'')
    .toLowerCase()
    .replace(/[’']/g,"'")
    .replace(/\bwhos\b/g,"who's")
    .replace(/\bwher\b/g,'where')
    .replace(/\bwats?\b/g,'what')
    .replace(/\bwht\b/g,'what')
    .replace(/\bwat\b/g,'what')
    .replace(/\bowener\b/g,'owner')
    .replace(/\bownr\b/g,'owner')
    .replace(/\bservce\b/g,'service')
    .replace(/\bservies\b/g,'services')
    .replace(/\bprce\b/g,'price')
    .replace(/\bquotaton\b/g,'quotation')
    .replace(/\bmachne\b/g,'machine')
    .replace(/\bbrakedown\b/g,'breakdown')
    .replace(/\bppl\b/g,'people')
    .replace(/\bu\b/g,'you')
    .replace(/\br\b/g,'are')
    .replace(/\bwhere are you\b/g,'where are you')
    .replace(/\bwho are you\b/g,'who are you')
    .replace(/[^a-z0-9+.#/ -]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function directConversationAnswer(message:string){
  const q=normalized(message);

  if(/^(hi|hello|hey|namaste|good morning|good afternoon|good evening|hello botcha|hi botcha)[!. ]*$/.test(q)){
    return {
      answer:"Hello — I’m Botcha, Crecer Grande’s virtual engineering assistant. Tell me what you need to make, fix, design, verify or submit, and I’ll help you find the right route.",
      links:[{label:'Engineering Desk',url:'/engineering-desk.html'}],
      suggestions:['What services do you provide?','I have a machine problem','How do I get a quote?']
    };
  }

  if(/^(thanks|thank you|thankyou|thx|great|okay|ok|got it|understood)[!. ]*$/.test(q)){
    return {
      answer:"You’re welcome. If you want, tell me the actual requirement next — a drawing, machine problem, part, quality issue or business-support need — and I’ll help structure the next step.",
      links:[{label:'Request a Quote',url:'/request-quote.html'}],
      suggestions:['What should I send you?','I need engineering help','Contact Crecer Grande']
    };
  }

  if(/\b(who are you|what are you|are you a bot|are you ai|what is botcha|who is botcha)\b/.test(q)){
    return {
      answer:"I’m Botcha, Crecer Grande’s virtual engineering assistant. I can answer questions about CG services, help identify the right engineering route, explain what information or files to send, and guide you toward a quotation or human review. I don’t make binding commercial or technical commitments on my own.",
      links:[{label:'Engineering Desk',url:'/engineering-desk.html'}],
      suggestions:['What does Crecer Grande do?','What should I send for a quote?','Can I talk to a person?']
    };
  }

  if(/\b(who are these people|who is crecer grande|what is crecer grande|tell me about crecer grande|about crecer grande|what company is this)\b/.test(q)){
    return {
      answer:"Crecer Grande is an engineering and industrial-services business. It connects engineering design, manufacturing support, machine maintenance, automation, quality, inspection, tender support and selected business-support workflows through one Engineering Desk.",
      links:[{label:'About Crecer Grande',url:'/about.html'},{label:'Divisions',url:'/divisions.html'}],
      suggestions:['What services do you provide?','Where are you located?','How do I send a requirement?']
    };
  }

  if(/\b(owner|owners|owner's|founder|founders|proprietor|director|promoter|who runs|who started|who owns)\b/.test(q)){
    return {
      answer:"The current Crecer Grande website information available to me does not publish an owner or founder name, so I won’t guess or invent one. For an official company or commercial contact, you can reach the Crecer Grande team directly.",
      links:[{label:'Contact Crecer Grande',url:'/contact.html'}],
      suggestions:['How can I contact you?','What does Crecer Grande do?','Where are you located?']
    };
  }
  if(/\b(team member|team members|staff|employee|employees|engineer names|who works|your team|people working)\b/.test(q)){
    return {
      answer:"I can explain Crecer Grande’s service structure, but individual team-member names are not published in the website information I’m using. For a specific engineering or commercial contact, the best route is to contact Crecer Grande directly.",
      links:[{label:'About Crecer Grande',url:'/about.html'},{label:'Contact Crecer Grande',url:'/contact.html'}],
      suggestions:['What services do you provide?','How can I contact you?']
    };
  }

  if(/\b(gst|gstin|udyam|registration number|company registration|cin|certificate number|iso certified|certification number)\b/.test(q)){
    return {
      answer:"I don’t have a verified public registration or certification number in the current website information, so I won’t provide one from memory or guesswork. If you need company credentials for vendor onboarding, tendering or compliance, please request them from the Crecer Grande team.",
      links:[{label:'Contact Crecer Grande',url:'/contact.html'}],
      suggestions:['How can I contact you?','I need vendor onboarding support']
    };
  }

  if(/\b(when did you start|when was .*started|when was .*founded|how old is the company|company age|founded in|established in)\b/.test(q)){
    return {
      answer:"I don’t have a verified public founding date in the current Crecer Grande website information, so I won’t invent one. I can still help with the company’s services, engineering routes and contact details.",
      links:[{label:'About Crecer Grande',url:'/about.html'}],
      suggestions:['What does Crecer Grande do?','What services do you provide?']
    };
  }

  if(/\b(are you a manufacturer|are you manufacturer|manufacturing company|service company|what kind of company)\b/.test(q)){
    return {
      answer:"Crecer Grande is an engineering and industrial-services business with manufacturing-support capability. Depending on the requirement, work can involve design, reverse engineering, manufacturing routes, machine support, automation, inspection, quality systems or business-support workflows.",
      links:[{label:'About Crecer Grande',url:'/about.html'},{label:'Capabilities',url:'/services.html'}],
      suggestions:['Can you manufacture a custom part?','Can you reverse engineer a sample?']
    };
  }

  if(/\b(can i send|can i upload|how do i send|where do i send)\b.*\b(photo|photos|image|images|drawing|cad|file|files|pdf|stl|step|stp)\b/.test(q)){
    return {
      answer:"Yes. Send whatever technical evidence you already have — drawings, CAD files, STEP/STP/STL, PDFs, photographs, nameplates, alarm screenshots, part numbers or dimensions. The Engineering Desk can review the starting information and identify what else is needed.",
      links:[{label:'Request a Quote',url:'/request-quote.html'},{label:'Engineering Desk',url:'/engineering-desk.html'}],
      suggestions:['What file is best for 3D printing?','I only have photos of the part','I have a machine alarm']
    };
  }

  if(/\b(site visit|factory visit|plant visit|visit my factory|visit our factory|visit my plant|come to site|come to our site|onsite|on site)\b/.test(q)){
    return {
      answer:"Site support can depend on the type of work, location and engineering need. Send the machine or problem details together with your city or plant location, and Crecer Grande can confirm whether the requirement should be handled remotely, by shipment or through a site visit.",
      links:[{label:'Request a Quote',url:'/request-quote.html'},{label:'Contact Crecer Grande',url:'/contact.html'}],
      suggestions:['I have a machine breakdown','What information should I send?']
    };
  }

  if(/\b(outside kolkata|outside west bengal|other city|another city|pan india|all india|do you work in|service outside)\b/.test(q)){
    return {
      answer:"Crecer Grande is based in Rajarhat, West Bengal. Whether a requirement can be supported remotely, through shipment or with site support depends on the work and location, so include your city or plant location when you send the requirement.",
      links:[{label:'Contact Crecer Grande',url:'/contact.html'},{label:'Request a Quote',url:'/request-quote.html'}],
      suggestions:['Can you visit our factory?','How do I send a requirement?']
    };
  }


  if(/\b(what do you do|what services|which services|services do you provide|services you provide|what can you do|what does cg do|what does crecer grande do)\b/.test(q)){
    return {
      answer:"Crecer Grande supports eight connected areas: advanced manufacturing, engineering & design, machine maintenance, automation, quality & management systems, inspection & testing, tender/business-development support, and selected business-support/compliance work. If you tell me the problem instead of the department, I can route it for you.",
      links:[{label:'Capabilities',url:'/services.html'},{label:'Divisions',url:'/divisions.html'},{label:'Engineering Desk',url:'/engineering-desk.html'}],
      suggestions:['I need a part made','I have a machine breakdown','I need CAD or reverse engineering']
    };
  }

  if(/\b(where are you|where are you located|where you located|where is your office|location|office address|your address|company address)\b/.test(q)){
    return {
      answer:"Crecer Grande is based in Rajarhat, West Bengal. The correspondence address shown on the website is Plot No. LR-645, Mathpara Rd., Rajarhat, West Bengal – 700135, India.",
      links:[{label:'Contact Crecer Grande',url:'/contact.html'}],
      suggestions:['Can you support work outside Kolkata?','How can I contact you?','Send a requirement']
    };
  }

  if(/\b(phone|phone number|mobile|call you|contact number|whatsapp|email|email id|email address|how can i contact|how do i contact|contact you|speak to someone|talk to someone|human|person)\b/.test(q)){
    return {
      answer:"You can call Crecer Grande on +91 7003301781, WhatsApp +91 6291001781, or email crecergrande@outlook.com. For a technical requirement, sending the drawing, machine detail, part reference or photos along with your message will help the team review it faster.",
      links:[{label:'Contact Crecer Grande',url:'/contact.html'},{label:'Request a Quote',url:'/request-quote.html'}],
      suggestions:['What should I send for a quote?','Where are you located?','I have a technical requirement']
    };
  }

  if(/\b(open today|working hours|business hours|office hours|when are you open|when can i call)\b/.test(q)){
    return {
      answer:"I don’t have verified public business hours in the current website information, so I won’t make up a timing. You can call or WhatsApp the Crecer Grande team, or send your requirement online at any time.",
      links:[{label:'Contact Crecer Grande',url:'/contact.html'},{label:'Request a Quote',url:'/request-quote.html'}],
      suggestions:['What is your phone number?','Send a requirement','Where are you located?']
    };
  }

  if(/\b(job|jobs|career|careers|vacancy|vacancies|hiring|internship|join your team)\b/.test(q)){
    return {
      answer:"I don’t have a current public vacancy list in the Crecer Grande website information. If you want to enquire about work or collaboration, contact the team directly and mention your role, skills and experience.",
      links:[{label:'Contact Crecer Grande',url:'/contact.html'}],
      suggestions:['How can I contact you?','What does Crecer Grande do?']
    };
  }

  if(/\b(payment terms|credit terms|advance payment|payment method|how do i pay)\b/.test(q)){
    return {
      answer:"Payment terms can depend on the specific job and quotation. I don’t have a single public payment term that I can safely apply to every requirement, so the commercial terms should be confirmed in the quotation.",
      links:[{label:'Request a Quote',url:'/request-quote.html'}],
      suggestions:['How do I get a quote?','What should I send you?']
    };
  }

  return null;
}

function isFollowUp(message:string){
  const q=normalized(message);
  if(q.split(' ').length<=4 && /\b(it|this|that|them|those|same|delivery|price|cost|files?|photos?|drawing|time|when|where|how|why|which)\b/.test(q)) return true;
  return /^(and|also|what about|how about|then|okay and|ok and|can you do that|can you do it|what else|how much|how long|which one|what file)/.test(q);
}

function lexicalScore(q:string,k:any){
  const query=normalized(q);
  if(!query)return 0;
  let score=0;
  const title=normalized(k.title||'');
  if(title && query.includes(title)) score+=1.2;
  for(const raw of (k.keywords||[])){
    const kw=normalized(String(raw));
    if(!kw)continue;
    if(query===kw) score+=1.4;
    else if(query.includes(kw)) score+=kw.includes(' ')?0.9:0.45;
    else {
      const qt=new Set(query.split(' '));
      const kt=kw.split(' ').filter((x:string)=>x.length>2);
      const overlap=kt.filter((x:string)=>qt.has(x)).length;
      if(overlap)score+=0.16*overlap;
    }
  }
  return score;
}

function hybridRank(message:string,semantic:any[],all:any[]){
  const map=new Map<string,any>();
  for(const m of semantic||[]){
    map.set(m.slug,{...m,semantic:Number(m.similarity||0),lexical:0});
  }
  for(const k of all||[]){
    const lex=lexicalScore(message,k);
    const old=map.get(k.slug)||{...k,semantic:0,similarity:0};
    old.lexical=Math.max(old.lexical||0,lex);
    map.set(k.slug,old);
  }
  return [...map.values()]
    .map((x:any)=>({...x,rank:(x.semantic||0)*0.74+Math.min(1.4,x.lexical||0)*0.42}))
    .filter((x:any)=>x.rank>=0.20)
    .sort((a:any,b:any)=>b.rank-a.rank || Number(b.semantic||0)-Number(a.semantic||0))
    .slice(0,6)
    .map((x:any)=>({...x,similarity:Math.max(Number(x.semantic||0),Math.min(.96,(x.lexical||0)*.7))}));
}

function genericAnswer(){
  return 'I can help you find the right Crecer Grande route for design, manufacturing, machine maintenance, automation, quality, inspection, tender support or business-support work. Tell me what you are trying to make, fix, verify or submit — and include a machine model, drawing, part reference or other evidence if you have it.';
}
function fallbackAnswer(message:string,matches:any[]){
  const q=normalized(message);
  const strong=matches.filter(x=>Number(x.similarity||0)>=0.46);
  const top=strong[0];
  const parts:string[]=[];

  const capabilityQuestion=/\b(do you|can you|could you|are you able|do u|can u)\b.*\b(do|provide|offer|support|make|manufacture|design|repair|inspect|help|handle|work with|sell|supply|stock)\b/.test(q)
    || /\b(can|could) (crecer grande|cg)\b/.test(q);
  const productSupplyQuestion=/\b(sell|supply|stock|keep in stock|have in stock)\b/.test(q);

  if(capabilityQuestion){
    const explicitSupport=top && (
      productSupplyQuestion
        ? Number(top.lexical||0)>=0.45
        : (Number(top.lexical||0)>=0.45 || Number(top.semantic||0)>=0.68)
    );
    if(explicitSupport){
      parts.push('Yes — '+String(top.answer||'Crecer Grande supports that type of requirement.'));
    }else{
      return "I can’t confidently match that to a service currently listed by Crecer Grande, so I don’t want to give you a false yes. Tell me a little more about the part, machine, process or outcome you need, and I’ll try to route it correctly.";
    }
  }else if(top?.answer){
    parts.push(String(top.answer));
  }

  if(/quote|quotation|price|cost|how much|rate|lead time|delivery|turnaround/.test(q)){
    const quote='Pricing, delivery time and final scope depend on the actual requirement and are not guessed by Botcha. Send the drawing, part or machine reference, quantity, material/specification, target date and supporting files so Crecer Grande can review the requirement before a commercial response.';
    if(!parts.some(x=>x.includes('Pricing, delivery time')))parts.push(quote);
  }

  if(/what (file|files)|which (file|files)|what should i send|upload|attachment|drawing|cad file|photo|photos|image|images/.test(q)){
    const files='Useful evidence can include drawings, CAD files, STEP/STP/STL, PDFs, photographs, machine nameplates, alarm screenshots, part numbers and key dimensions. Send what you already have; the first review is used to identify what is still missing.';
    if(!parts.some(x=>x.includes('Useful evidence can include')))parts.push(files);
  }

  if(/outside kolkata|other city|another city|site visit|come to site|visit our plant|visit our factory/.test(q)){
    parts.push('Whether the requirement can be handled remotely, through shipment or with site support depends on the work and location. Include your city or plant location when you send the requirement so the route can be confirmed.');
  }

  if(!parts.length){
    return "I’m not confident enough to match that question to a Crecer Grande service yet. Tell me what you are trying to make, fix, design, verify or submit — even one extra detail like the machine, part, drawing or outcome will help me understand it correctly.";
  }

  if(!capabilityQuestion && parts.length===1 && strong.length>1 && Number(strong[1].similarity||0)>=0.67 && Math.abs(Number(strong[0].similarity)-Number(strong[1].similarity))<0.025){
    const second=String(strong[1].answer||'');
    if(second&&second!==parts[0])parts.push('Related: '+second);
  }

  return parts.slice(0,3).join('\n\n');
}

Deno.serve(async(req)=>{
  const origin=req.headers.get('Origin');
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors(origin)});
  if(!SUPABASE_URL||!SERVICE_KEY)return json({error:'Botcha backend configuration is incomplete.'},500,origin);

  const admin=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});

  if(req.method==='GET'){
    const url=new URL(req.url);
    const count=await admin.from('botcha_knowledge').select('id',{count:'exact',head:true}).eq('active',true).not('embedding','is',null);
    return json({ok:true,assistant:'Botcha',semanticKnowledge:count.count||0,aiConfigured:Boolean(OPENAI_API_KEY),model:OPENAI_API_KEY?OPENAI_MODEL:null},200,origin);
  }

  if(req.method!=='POST')return json({error:'POST required.'},405,origin);

  let body:any;
  try{body=await req.json()}catch{return json({error:'Invalid request.'},400,origin)}

  const message=clean(body?.message,900);
  const sessionId=cleanId(body?.session_id,120);
  const visitorId=cleanId(body?.visitor_id,120);
  const sourcePage=clean(body?.source_page,300)||'/';
  const history=(Array.isArray(body?.history)?body.history:[])
    .slice(-8)
    .map((m:any)=>({role:m?.role==='assistant'?'assistant':'user',content:clean(m?.content,900)}))
    .filter((m:any)=>m.content);

  if(message.length<2)return json({error:'Please type a question for Botcha.'},400,origin);

  const ip=(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||visitorId||'anonymous').trim();
  const ipHash=await sha256(ip+'|'+SERVICE_KEY.slice(-24));
  const since=new Date(Date.now()-60*60*1000).toISOString();
  const rate=await admin.from('botcha_messages').select('id',{count:'exact',head:true}).eq('role','user').eq('ip_hash',ipHash).gte('created_at',since);
  if((rate.count||0)>=30)return json({error:'Botcha has reached the hourly message limit for this connection. Please use Request a Quote or contact Crecer Grande directly.'},429,origin);

  await admin.from('botcha_messages').insert({
    session_id:sessionId||null,visitor_id:visitorId||null,ip_hash:ipHash,role:'user',content:message,source_page:sourcePage,answer_mode:null
  });

  const direct=directConversationAnswer(message);
  if(direct){
    const answer=direct.answer;
    const links=direct.links||[];
    const mode='conversation';
    await admin.from('botcha_messages').insert({
      session_id:sessionId||null,visitor_id:visitorId||null,ip_hash:ipHash,role:'assistant',content:answer,source_page:sourcePage,matched_slugs:[],answer_mode:mode
    });
    return json({ok:true,answer,engine:mode,semantic:false,links,suggestions:direct.suggestions||[]},200,origin);
  }

  let matches:any[]=[];
  let semanticOk=false;
  const allKnowledge=await admin.from('botcha_knowledge')
    .select('slug,title,answer,page_url,keywords,priority')
    .eq('active',true)
    .order('priority')
    .limit(60);

  try{
    const contextUsers=history.filter((m:any)=>m.role==='user').slice(-2).map((m:any)=>m.content);
    const searchText=(isFollowUp(message)&&contextUsers.length?[...contextUsers,message].join(' | '):message).slice(0,1800);
    const raw=await embedder.run(searchText,{mean_pool:true,normalize:true});
    const embedding=Array.from(raw as number[]);
    const result=await admin.rpc('match_botcha_knowledge',{query_embedding:embedding,match_count:6});
    if(result.error)throw result.error;
    matches=hybridRank(message,result.data||[],allKnowledge.data||[]);
    semanticOk=true;
  }catch(e){
    console.error('semantic search error',e);
    matches=hybridRank(message,[],allKnowledge.data||[]);
  }

  let answer='';
  let mode='semantic';
  if(OPENAI_API_KEY){
    try{
      const knowledge=matches.slice(0,5).map((m:any,i:number)=>(
        '['+(i+1)+'] '+m.title+'\n'+m.answer+'\nPage: https://crecergrande.in'+(m.page_url||'/')
      )).join('\n\n');
      const conversation=history.map((m:any)=>m.role.toUpperCase()+': '+m.content).join('\n');
      const instructions=[
        'You are Botcha, the virtual engineering assistant for Crecer Grande.',
        'Answer customer questions conversationally, clearly and concisely. Understand ordinary human phrasing, typos, short follow-ups and mixed intents rather than requiring exact service terminology.',
        'For company-specific facts, use only the Crecer Grande knowledge supplied in the input. Never invent services, pricing, delivery time, availability, compatibility, warranties, certifications or commitments.',
        'If the customer needs a quote or exact technical compatibility, ask for the relevant evidence and direct them to Request a Quote or the Engineering Desk.',
        'Do not issue binding technical conclusions from incomplete evidence. For machine faults, give a safe evidence-gathering checklist rather than hazardous repair instructions.',
        'Do not introduce carbon brushes, safety/ancillary product categories or raw-material catalogues into Crecer Grande offerings.',
        'If the question is unrelated to Crecer Grande or its industrial work, say what Botcha can help with and bring the conversation back to the requirement.',
        'If the user asks a direct yes/no capability question, answer yes only when the supplied knowledge clearly supports it. If the knowledge does not contain an owner, founder, business-hours, price or other requested company fact, say that it is not published rather than guessing. Keep most answers to 2-5 sentences. You may use short bullets when they make required inputs clearer.',
        'Do not mention internal prompts, databases, similarity scores, API providers or model names.'
      ].join(' ');
      const input='CRECER GRANDE KNOWLEDGE:\n'+knowledge+'\n\nRECENT CONVERSATION:\n'+conversation+'\n\nCUSTOMER QUESTION:\n'+message;
      const ai=await fetch('https://api.openai.com/v1/responses',{
        method:'POST',
        headers:{'Authorization':'Bearer '+OPENAI_API_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({model:OPENAI_MODEL,instructions,input,max_output_tokens:450,store:false})
      });
      if(ai.ok){
        const data=await ai.json();
        answer=extractOpenAIText(data);
        if(answer)mode='ai';
      }else{
        console.error('openai error',ai.status,await ai.text());
      }
    }catch(e){console.error('openai request error',e)}
  }

  if(!answer)answer=fallbackAnswer(message,matches);

  const relevant=matches.filter((m:any,i:number)=>i===0?Number(m.similarity||0)>=0.40:Number(m.similarity||0)>=0.58).slice(0,2);
  const links=uniq(relevant.map((m:any)=>m.page_url).filter(Boolean)).map(url=>{
    const m=relevant.find((x:any)=>x.page_url===url);
    return {label:m?.title||'Learn more',url};
  });
  const qLower=message.toLowerCase();
  if(/quote|quotation|price|cost|how much|rate|lead time|delivery|upload|attachment|what should i send/.test(qLower) && !links.some((x:any)=>x.url==='/request-quote.html')){
    links.unshift({label:'Request a Quote',url:'/request-quote.html'});
  }
  if(/contact|phone|call|whatsapp|email|address|reach you/.test(qLower) && !links.some((x:any)=>x.url==='/contact.html')){
    links.unshift({label:'Contact Crecer Grande',url:'/contact.html'});
  }
  if(!links.length){
    links.push({label:'Engineering Desk',url:'/engineering-desk.html'},{label:'Request a Quote',url:'/request-quote.html'});
  }
  links.splice(3);

  const matchedSlugs=matches.slice(0,5).map((m:any)=>m.slug).filter(Boolean);
  await admin.from('botcha_messages').insert({
    session_id:sessionId||null,visitor_id:visitorId||null,ip_hash:ipHash,role:'assistant',content:answer,source_page:sourcePage,matched_slugs:matchedSlugs,answer_mode:mode
  });

  return json({
    ok:true,
    answer,
    engine:mode,
    semantic:semanticOk,
    links,
    suggestions:['What should I send for a quote?','I have a machine breakdown','Can you help with CAD or reverse engineering?']
  },200,origin);
});