document.addEventListener('DOMContentLoaded',()=>{
  const f=document.getElementById('rfq-form'),s=document.getElementById('rfq-status');
  if(!f)return;
  const type=f.dataset.formType||'rfq';
  const qs=new URLSearchParams(location.search);
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

  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(f); const d=Object.fromEntries(fd.entries());
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
    }
    const combinedMessage=[d.message||'',...extra].filter(Boolean).join('\n');

    let saved=false;
    const cfg=window.CG_CONFIG||{};
    if(window.supabase&&cfg.supabaseUrl&&cfg.supabasePublishableKey){
      try{
        const c=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
        const ids=window.CGVisitorIds?window.CGVisitorIds():['',''];
        const r=await c.rpc('submit_enquiry',{
          p_name:d.name||null,p_company:d.company||null,p_phone:d.phone||null,p_email:d.email||null,
          p_requirement_type:requirement,p_product_id:null,p_variant_id:null,p_quantity:d.quantity||null,
          p_message:combinedMessage||null,p_source:type==='general'?'website-contact':'website-rfq',
          p_visitor_id:ids[0]||null,p_session_id:ids[1]||null
        });
        saved=!r.error;
        if(saved&&window.CGTrack)window.CGTrack(type==='general'?'contact_submit':'rfq_submit',{requirement_type:requirement});
      }catch(x){}
    }

    const lines=[
      `Hello Crecer Grande,`,``,
      `Name: ${d.name||''}`,`Company: ${d.company||''}`,`Phone: ${d.phone||''}`,`Email: ${d.email||''}`,
      `Type: ${requirement}`,
      ...(type==='rfq'?[`Quantity: ${d.quantity||''}`,`Material/Grade: ${d.material||''}`,`Machine/Model/Part: ${d.machine_model||''}`,`Dimensions/Specification: ${d.dimensions||''}`,`Target Date: ${d.target_date||''}`,`Location: ${d.location||''}`,`Preferred Contact: ${d.preferred_contact||''}`,filename?`Reference file selected: ${filename} (please attach separately)`:``]:[d.subject?`Subject: ${d.subject}`:``]),
      ``,`Details:`,d.message||''
    ].filter(Boolean);
    const text=encodeURIComponent(lines.join('\n'));
    const subject=encodeURIComponent(`${type==='general'?'Website Enquiry':'Website RFQ'} - ${requirement}`);
    const attachNote=filename?'<br><small>Please attach the selected reference file manually in WhatsApp or email.</small>':'';
    s.innerHTML=(saved?'Your enquiry has been recorded in Crecer Grande Website Manager. ':'')+`<a href="https://wa.me/916291001781?text=${text}" target="_blank" rel="noopener"><b>Continue on WhatsApp →</b></a> or <a href="mailto:crecergrande@outlook.com?subject=${subject}&body=${text}"><b>send by email</b></a>.${attachNote}`;
  });
});
