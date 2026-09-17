document.addEventListener('DOMContentLoaded',()=>{
  const f=document.getElementById('rfq-form'),status=document.getElementById('rfq-status'); if(!f)return;
  const type=f.dataset.formType||'rfq',qs=new URLSearchParams(location.search),fileEl=f.querySelector('[name="reference_file"]');
  const MAX=50*1024*1024,allowed=new Set(['pdf','jpg','jpeg','png','webp','dxf','dwg','step','stp','ste','stl','3mf','obj','ply','amf','igs','iges','ige','brep','brp','sldprt','sldasm','ipt','iam','prt','x_t','x_b','sat','sab','catpart','catproduct','jt','3dm','f3d','f3z','zip','xlsx','xls','doc','docx','csv']);
  if(fileEl)fileEl.accept=[...allowed].map(x=>'.'+x).join(',');
  const pref={requirement:'requirement_type',message:'message',material:'material',quantity:'quantity',machine_model:'machine_model',dimensions:'dimensions',location:'location'};
  Object.entries(pref).forEach(([q,n])=>{const v=qs.get(q),el=f.querySelector(`[name="${n}"]`);if(v&&el){if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;o.textContent=v;el.appendChild(o)}el.value=v}});
  const clean=n=>String(n||'file').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-180),ext=n=>(String(n||'').split('.').pop()||'').toLowerCase(),uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;

  async function upload(client,enquiryId,file){
    if(!file?.name)return false;
    if(!allowed.has(ext(file.name)))throw new Error('Unsupported file type.');
    if(file.size>MAX)throw new Error('File exceeds the 50 MB upload limit.');
    const path=`public-rfq/${enquiryId}/${uid()}-${clean(file.name)}`;
    const up=await client.storage.from('rfq-files').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});
    if(up.error)throw up.error;
    const reg=await client.rpc('register_enquiry_attachment',{p_enquiry_id:enquiryId,p_object_path:path,p_original_name:file.name,p_mime_type:file.type||null,p_file_size:file.size});
    if(reg.error)throw reg.error;
    return true;
  }

  f.addEventListener('submit',async(e)=>{
    e.preventDefault(); const btn=f.querySelector('button[type="submit"]'),old=btn?.textContent; if(btn){btn.disabled=true;btn.textContent='Submitting…'}
    const fd=new FormData(f),d=Object.fromEntries(fd.entries()),file=fd.get('reference_file');
    const requirement=type==='general'?'General Enquiry':(d.requirement_type||'Other');
    const extra=[]; ['material','machine_model','dimensions','target_date','location'].forEach(k=>{if(d[k])extra.push(`${({material:'Material / Grade',machine_model:'Machine / Model / Part',dimensions:'Dimensions / Specification',target_date:'Target Date',location:'Location'})[k]}: ${d[k]}`)});
    const combined=[d.message||'',...extra].filter(Boolean).join('\n');
    let saved=false,attached=false,enquiryId=null,errText='';
    const cfg=window.CG_CONFIG||{}; let client=window.CG_SUPABASE;
    if(!client&&window.supabase&&cfg.supabaseUrl&&cfg.supabasePublishableKey){client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);window.CG_SUPABASE=client}
    if(client){
      try{
        const ids=window.CGVisitorIds?window.CGVisitorIds():['',''];
        const r=await client.rpc('submit_enquiry',{p_name:d.name||null,p_company:d.company||null,p_phone:d.phone||null,p_email:d.email||null,p_requirement_type:requirement,p_product_id:null,p_variant_id:null,p_quantity:d.quantity||null,p_message:combined||null,p_source:type==='general'?'website-contact-v26':'website-rfq-v26',p_visitor_id:ids[0]||null,p_session_id:ids[1]||null});
        if(r.error)throw r.error; saved=true; enquiryId=r.data?.enquiry_id||null;
        if(enquiryId&&file?.name)attached=await upload(client,enquiryId,file);
        window.CGTrack?.(type==='general'?'contact_submit':'rfq_submit',{requirement_type:requirement,attachment:attached});
      }catch(e){errText=e?.message||String(e)}
    }
    const lines=[`Hello Crecer Grande`,``,`Name: ${d.name||''}`,`Company: ${d.company||''}`,`Phone: ${d.phone||''}`,`Email: ${d.email||''}`,`Requirement: ${requirement}`,d.quantity?`Quantity: ${d.quantity}`:'',d.machine_model?`Machine / Model / Part: ${d.machine_model}`:'',``,`Details:`,d.message||''].filter(Boolean);
    const wa=`https://wa.me/916291001781?text=${encodeURIComponent(lines.join('\n'))}`, mail=`mailto:crecergrande@outlook.com?subject=${encodeURIComponent('Website RFQ - '+requirement)}&body=${encodeURIComponent(lines.join('\n'))}`;
    status.className='status'+(errText?' error':'');
    status.innerHTML=saved?`<b>Requirement recorded${enquiryId?` — Ref. ${String(enquiryId).slice(0,8).toUpperCase()}`:''}.</b>${attached?' Reference file attached securely.':''} <a target="_blank" rel="noopener" href="${wa}"><b>Continue on WhatsApp →</b></a>`:`The website backend could not record the enquiry automatically${errText?`: ${errText.replace(/[<>]/g,'')}`:'.'} <a target="_blank" rel="noopener" href="${wa}"><b>Continue on WhatsApp</b></a> or <a href="${mail}"><b>email CG</b></a>.`;
    if(btn){btn.disabled=false;btn.textContent=old||'Submit Requirement'}
  });
});