document.addEventListener('DOMContentLoaded',()=>{
  const f=document.getElementById('rfq-form'),s=document.getElementById('rfq-status');
  if(!f)return;
  const type=f.dataset.formType||'rfq';
  const qs=new URLSearchParams(location.search);
  const refFile=f.querySelector('[name="reference_file"]');
  const help=f.querySelector('.form-help');
  const MAX=50*1024*1024;
  const allowed=new Set(['pdf','jpg','jpeg','png','webp','dxf','dwg','step','stp','ste','stl','3mf','obj','ply','amf','igs','iges','ige','brep','brp','sldprt','sldasm','ipt','iam','prt','x_t','x_b','sat','sab','catpart','catproduct','jt','3dm','f3d','f3z','zip','xlsx','xls','doc','docx']);
  if(refFile)refFile.accept=[...allowed].map(x=>'.'+x).join(',');
  if(help)help.textContent='Reference files up to 50 MB can be uploaded securely with the RFQ. Supported CAD formats include STEP/STP, STL, IGES, 3MF, OBJ, SLDPRT/SLDASM, IPT/IAM, Parasolid, CATIA, JT, Rhino, Fusion and common drawing/document formats.';

  const req=qs.get('requirement');
  if(req&&type==='rfq'){
    const sel=f.querySelector('[name="requirement_type"]');
    if(sel){
      const normalized=req.replaceAll('-',' ').toLowerCase();
      const opt=[...sel.options].find(o=>o.value===req||o.textContent.toLowerCase().includes(normalized));
      if(opt)sel.value=opt.value;
      else if(['laser-consumables','laser-chiller-pumps','sheet-metal-bending-tooling','plc-iot-housings','laser-chiller-spares','cnc-vmc-spares','custom-obsolete-spares','rapid-prototyping'].includes(req)){
        const p=[...sel.options].find(o=>o.textContent==='Products & Spares');if(p)sel.value=p.value;
      }else{const other=[...sel.options].find(o=>o.textContent==='Other');if(other)sel.value=other.value}
    }
  }
  if(type==='rfq'){
    const prefill={message:'message',material:'material',quantity:'quantity',machine_model:'machine_model',dimensions:'dimensions',location:'location'};
    Object.entries(prefill).forEach(([q,n])=>{const v=qs.get(q),field=f.querySelector(`[name="${n}"]`);if(v&&field)field.value=v});
  }

  const cleanName=name=>String(name||'file').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-180);
  const extOf=name=>(String(name||'').split('.').pop()||'').toLowerCase();
  const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;

  async function uploadAndRegister(c,enquiryId,file){
    if(!file||!file.name)return null;
    const ext=extOf(file.name);
    if(!allowed.has(ext))throw new Error('Unsupported file type');
    if(file.size>MAX)throw new Error('File exceeds 50 MB upload limit');
    const path=`public-rfq/${enquiryId}/${uid()}-${cleanName(file.name)}`;
    const up=await c.storage.from('rfq-files').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});
    if(up.error)throw up.error;
    const reg=await c.rpc('register_enquiry_attachment',{p_enquiry_id:enquiryId,p_object_path:path,p_original_name:file.name,p_mime_type:file.type||null,p_file_size:file.size});
    if(reg.error)throw reg.error;
    return path;
  }

  async function registerPending(c,enquiryId){
    const path=qs.get('attachment_path');
    if(!path)return false;
    const name=qs.get('attachment_name')||'CAD file';
    const size=Number(qs.get('attachment_size')||0)||null;
    const mime=qs.get('attachment_type')||null;
    const reg=await c.rpc('register_enquiry_attachment',{p_enquiry_id:enquiryId,p_object_path:path,p_original_name:name,p_mime_type:mime,p_file_size:size});
    if(reg.error)throw reg.error;
    return true;
  }

  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const submit=f.querySelector('button[type="submit"]');
    if(submit){submit.disabled=true;submit.dataset.oldText=submit.textContent;submit.textContent='Submitting…'}
    const fd=new FormData(f),d=Object.fromEntries(fd.entries());
    const file=fd.get('reference_file');
    const filename=file&&file.name?file.name:'';
    const requirement=type==='general'?'General Enquiry':(d.requirement_type||'Other');
    const extra=[];
    if(type==='general'&&d.subject)extra.push(`Subject: ${d.subject}`);
    if(type==='rfq'){
      if(d.material)extra.push(`Material/Grade: ${d.material}`);
      if(d.machine_model)extra.push(`Machine/Model/Part: ${d.machine_model}`);
      if(d.dimensions)extra.push(`Dimensions/Specification: ${d.dimensions}`);
      if(d.target_date)extra.push(`Target Date: ${d.target_date}`);
      if(d.location)extra.push(`Location: ${d.location}`);
      if(d.preferred_contact)extra.push(`Preferred Contact: ${d.preferred_contact}`);
      if(filename)extra.push(`Reference File Selected: ${filename}`);
      if(qs.get('attachment_name'))extra.push(`CAD File from Estimate: ${qs.get('attachment_name')}`);
    }
    const combinedMessage=[d.message||'',...extra].filter(Boolean).join('\n');

    let saved=false,enquiryId=null,c=null,attached=false,attachmentError='';
    const cfg=window.CG_CONFIG||{};
    if(window.supabase&&cfg.supabaseUrl&&cfg.supabasePublishableKey){
      try{
        c=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
        const ids=window.CGVisitorIds?window.CGVisitorIds():['',''];
        const r=await c.rpc('submit_enquiry',{
          p_name:d.name||null,p_company:d.company||null,p_phone:d.phone||null,p_email:d.email||null,
          p_requirement_type:requirement,p_product_id:null,p_variant_id:null,p_quantity:d.quantity||null,
          p_message:combinedMessage||null,p_source:type==='general'?'website-contact':'website-rfq',
          p_visitor_id:ids[0]||null,p_session_id:ids[1]||null
        });
        saved=!r.error;
        enquiryId=r.data?.enquiry_id||null;
        if(saved&&enquiryId){
          try{
            attached=await registerPending(c,enquiryId)||attached;
            const pendingName=qs.get('attachment_name')||'';
            if(filename&&filename!==pendingName)attached=!!(await uploadAndRegister(c,enquiryId,file))||attached;
          }catch(err){attachmentError=err?.message||String(err)}
        }
        if(saved&&window.CGTrack)window.CGTrack(type==='general'?'contact_submit':'rfq_submit',{requirement_type:requirement,attachment:attached});
      }catch(x){}
    }

    const lines=[
      `Hello Crecer Grande,`,``,
      `Name: ${d.name||''}`,`Company: ${d.company||''}`,`Phone: ${d.phone||''}`,`Email: ${d.email||''}`,
      `Type: ${requirement}`,
      ...(type==='rfq'?[`Quantity: ${d.quantity||''}`,`Material/Grade: ${d.material||''}`,`Machine/Model/Part: ${d.machine_model||''}`,`Dimensions/Specification: ${d.dimensions||''}`,`Target Date: ${d.target_date||''}`,`Location: ${d.location||''}`,`Preferred Contact: ${d.preferred_contact||''}`,filename?`Reference file: ${filename}`:``,qs.get('attachment_name')?`CAD estimate file: ${qs.get('attachment_name')}`:``]:[d.subject?`Subject: ${d.subject}`:``]),
      ``,`Details:`,d.message||''
    ].filter(Boolean);
    const text=encodeURIComponent(lines.join('\n'));
    const subject=encodeURIComponent(`${type==='general'?'Website Enquiry':'Website RFQ'} - ${requirement}`);
    let note='';
    if(attached)note='<br><small><b>Reference file securely attached to this enquiry.</b></small>';
    else if((filename||qs.get('attachment_name'))&&attachmentError)note=`<br><small>Automatic file upload could not be completed (${attachmentError.replace(/[<>]/g,'')}). Please attach the file in WhatsApp or email.</small>`;
    else if(filename||qs.get('attachment_name'))note='<br><small>Please attach the selected reference file manually in WhatsApp or email.</small>';
    s.innerHTML=(saved?'Your enquiry has been recorded in Crecer Grande Website Manager. ':'')+`<a href="https://wa.me/916291001781?text=${text}" target="_blank" rel="noopener"><b>Continue on WhatsApp →</b></a> or <a href="mailto:crecergrande@outlook.com?subject=${subject}&body=${text}"><b>send by email</b></a>.${note}`;
    if(submit){submit.disabled=false;submit.textContent=submit.dataset.oldText||'Submit RFQ'}
  });
});
