document.addEventListener('DOMContentLoaded',()=>{
  const routeGrid=document.getElementById('ed-route-grid'),workspace=document.getElementById('ed-workspace'),formCard=document.getElementById('ed-form-card'),aside=document.getElementById('ed-aside'),isoQuiz=document.getElementById('ed-iso-quiz'),isoScore=document.getElementById('ed-iso-score');
  if(!routeGrid||!workspace||!formCard)return;
  const MAX=50*1024*1024,MAX_FILES=5;
  const allowed=new Set(['pdf','jpg','jpeg','png','webp','dxf','dwg','step','stp','ste','stl','3mf','obj','ply','amf','igs','iges','ige','brep','brp','sldprt','sldasm','ipt','iam','prt','x_t','x_b','sat','sab','catpart','catproduct','jt','3dm','f3d','f3z','zip','xlsx','xls','csv','doc','docx','txt','mp4','mov']);
  const routes={
    design:{icon:'D',title:'Design Something',requirement:'Engineering Design / DFM',intro:'Start with a sketch, CAD file, drawing, sample part or just the function you need. CG can review the design route before manufacturing.',tags:['CAD & drawings','DFM / DFA','Reverse engineering','BOM'],quick:[['Instant STL estimate','products/3d-print-quote.html'],['Mechanical design services','mechanical-design-services-kolkata.html'],['Reverse engineering','reverse-engineering-kolkata.html']],check:['Upload the latest CAD/drawing revision','Mention material and intended process if known','State critical dimensions, fits or tolerances','Tell us what output you need: model, drawing, BOM, DFM review or manufactured part'],fields:[
      {name:'service',label:'What do you need?',type:'select',options:['Design review / DFM','3D CAD modelling','2D manufacturing drawing','Reverse engineering','BOM preparation / BOM review','Drawing & BOM consistency check','Design modification','Value engineering / cost reduction','Jig / fixture / tooling design','3D printing design preparation','Other']},
      {name:'file_format',label:'Current file / information available',type:'select',options:['STEP / STP','STL / 3MF','IPT / IAM (Inventor)','SLDPRT / SLDASM (SolidWorks)','DWG / DXF','PDF drawing','Physical sample / photos only','Sketch / dimensions only','No design yet']},
      {name:'deliverable',label:'Required deliverable',placeholder:'e.g. STEP + PDF drawing + BOM'},
      {name:'material_process',label:'Material / intended manufacturing process',placeholder:'e.g. SS304, CNC machining / sheet metal'},
      {name:'tolerance',label:'Critical tolerance / fit / performance',placeholder:'e.g. ±0.05 mm, H7 fit, load requirement'},
      {name:'quantity',label:'Expected quantity',placeholder:'Prototype, 5 pcs, 100 pcs, etc.'},
      {name:'target_date',label:'Target date',type:'date'},
      {name:'details',label:'Describe the design requirement',type:'textarea',placeholder:'What should the part/system do? What exists today? What is the problem with the current design?'}
    ]},
    manufacture:{icon:'M',title:'Manufacture Something',requirement:'Manufacturing / Prototyping',intro:'Send the part geometry and production intent. CG will route it through the appropriate process instead of forcing you to choose a machine first.',tags:['3D printing','Laser cutting','CNC / VMC','Sheet metal'],quick:[['Instant STL estimate','products/3d-print-quote.html'],['Laser cutting','laser-cutting-kolkata.html'],['Sheet-metal bending','sheet-metal-bending-kolkata.html']],check:['Upload STEP/STP, STL, DXF, drawing or sample photos','Mention material, quantity and finish','State inspection or tolerance requirements','For STL, use the instant quote tool for immediate 3D-print pricing'],fields:[
      {name:'process',label:'Preferred process',type:'select',options:['Not sure — recommend a process','3D printing — FDM/FFF','3D printing — Resin','3D printing — SLS/MJF','Laser cutting','Laser marking','CNC / VMC machining','Sheet-metal bending / fabrication','Welding / fabrication','Prototype development','Assembly / inserts / finishing','Other']},
      {name:'material',label:'Material / grade',placeholder:'e.g. SS304, EN8, PETG, resin'},
      {name:'quantity',label:'Quantity',placeholder:'e.g. 1 prototype / 25 pcs'},
      {name:'dimensions',label:'Approx. overall size',placeholder:'L × W × H or thickness'},
      {name:'tolerance',label:'Tolerance / critical features',placeholder:'If applicable'},
      {name:'finish',label:'Finish / post-processing',placeholder:'Painting, sanding, inserts, plating, etc.'},
      {name:'inspection',label:'Inspection requirement',type:'select',options:['Standard visual/dimensional check','FAI required','Inspection report required','Material certificate required','Customer-defined inspection plan','Not specified']},
      {name:'target_date',label:'Required delivery / target date',type:'date'},
      {name:'details',label:'Manufacturing notes',type:'textarea',placeholder:'Application, mating parts, special requirements, packaging, site constraints, etc.'}
    ]},
    part:{icon:'P',title:'Find a Part',requirement:'Part Identification / Industrial Sourcing',intro:'If you know the part number, send it. If you do not, send the machine, nameplate, dimensions and clear photographs. CG will work from the evidence you have.',tags:['Part identification','Equivalent sourcing','Obsolete spares','Compatibility'],quick:[['Laser Product Finder','products/laser-product-finder.html'],['Custom machine spares','custom-machine-spares.html'],['Products & spares','products.html']],check:['Photograph the part from multiple sides','Include machine and component nameplates','Measure key dimensions where possible','State voltage, flow, pressure, power, thread or connector details if relevant'],fields:[
      {name:'category',label:'Part category',type:'select',options:['Laser cutting head / consumable','Laser chiller / cooling','CNC / VMC spare','Pump / motor / fan','Sensor / switch / electrical','PLC / HMI / automation','Mechanical component','Bearing / seal / coupling','Custom / obsolete component','Unknown']},
      {name:'machine',label:'Machine make & model',placeholder:'e.g. HSG HS-C3015'},
      {name:'brand',label:'Part brand / manufacturer',placeholder:'If visible'},
      {name:'part_number',label:'Part / model number',placeholder:'Exact number if available'},
      {name:'specification',label:'Rating / dimensions / specification',placeholder:'Voltage, power, flow, OD, thread, size, etc.'},
      {name:'quantity',label:'Required quantity',placeholder:'e.g. 2 pcs'},
      {name:'condition',label:'What do you currently have?',type:'select',options:['Failed original part','Old working sample','Only photo/nameplate','Only part number','Machine manual/drawing','No reference part']},
      {name:'urgency',label:'Urgency',type:'select',options:['Normal sourcing','Required this week','Machine breakdown / urgent','Planning / future requirement']},
      {name:'details',label:'Describe the requirement',type:'textarea',placeholder:'What does the part do? Why are you replacing it? Any known compatibility constraints?'}
    ]},
    machine:{icon:'F',title:'Fix a Machine',requirement:'Machine Troubleshooting / Maintenance',intro:'Describe the symptom, not just the service you think you need. CG will structure the evidence for troubleshooting, maintenance or a site visit.',tags:['Breakdown','Laser / chiller','CNC / VMC','RCA'],quick:[['Machine maintenance','industrial-machine-maintenance-kolkata.html'],['Laser cutting defects guide','insights/laser-cutting-defects.html'],['Preventive maintenance guide','insights/preventive-maintenance-basics.html']],check:['Capture the exact alarm code or screen photo','Photograph the machine/nameplate and affected area','Note what changed immediately before the failure','Do not bypass interlocks or safety devices to test the machine'],fields:[
      {name:'machine_type',label:'Machine / system type',type:'select',options:['Fiber laser cutting machine','CO₂ laser machine','Laser welding / cleaning','Industrial chiller','CNC / VMC','Pump / motor / rotating equipment','PLC / HMI / control panel','Fabrication / production machine','Other']},
      {name:'machine_model',label:'Make / model / serial',placeholder:'Brand, model and serial if available'},
      {name:'rating',label:'Power / capacity / electrical rating',placeholder:'e.g. 3 kW laser, 220 V pump'},
      {name:'alarm',label:'Alarm / error code',placeholder:'Exact code and wording'},
      {name:'started',label:'When did the problem start?',placeholder:'Date/time or after what event?'},
      {name:'impact',label:'Production impact',type:'select',options:['Machine stopped','Severe quality issue','Reduced output','Intermittent problem','Preventive concern / no breakdown']},
      {name:'action_taken',label:'What has already been tried?',type:'textarea',placeholder:'Parts changed, cleaning, reset, parameter changes, technician actions, etc.'},
      {name:'details',label:'Describe the symptom',type:'textarea',placeholder:'What exactly happens? What was normal before? Include noise, heat, pressure, cut quality, flow, motion or sequence details.'}
    ]},
    quality:{icon:'Q',title:'Solve a Quality Problem',requirement:'Quality / RCA / CAPA / ISO',intro:'Turn a complaint or recurring defect into a structured problem statement. CG can support containment, evidence review, RCA, CAPA, 8D, inspection and QMS readiness.',tags:['NCR / CAPA','8D / 5 Why','FAI / inspection','ISO readiness'],quick:[['Run ISO readiness check','#iso-readiness'],['NCR–RCA–CAPA guide','insights/ncr-rca-capa.html'],['Inspection / QA services','industrial-inspection-qa-kolkata.html']],check:['Define the problem with measurable facts where possible','Separate immediate containment from root cause','Upload NCR, drawing, inspection data and photos','Do not close CAPA until corrective action effectiveness is verified'],fields:[
      {name:'quality_type',label:'Quality support required',type:'select',options:['Customer NCR response','RCA / 5 Why','8D problem solving','CAPA / corrective action','Supplier quality issue','FAI / inspection planning','Drawing/spec compliance review','ISO 9001 documentation / implementation','Internal audit / management review support','Calibration / quality records','Other']},
      {name:'reference',label:'NCR / PO / drawing / complaint reference',placeholder:'If applicable'},
      {name:'problem',label:'Problem statement — what is wrong?',type:'textarea',placeholder:'What failed or did not conform? Include specification vs actual where possible.'},
      {name:'when_where',label:'When / where was it detected?',placeholder:'Process stage, site, customer, date'},
      {name:'extent',label:'How many / how much is affected?',placeholder:'Quantity, batch, frequency, downtime, impact'},
      {name:'containment',label:'Immediate containment already taken',type:'textarea',placeholder:'Segregation, replacement, 100% inspection, machine stop, etc.'},
      {name:'suspected_cause',label:'Known or suspected cause',placeholder:'Leave blank if unknown'},
      {name:'required_output',label:'Required output',type:'select',options:['Engineering review only','Formal RCA report','8D report','CAPA / corrective action plan','Inspection / FAI report','ISO readiness / documentation plan','Customer response support']}
    ]},
    business:{icon:'B',title:'Business / Tender Support',requirement:'Tender / Business / Process Support',intro:'Use CG for technical-commercial coordination too — tender compliance, GeM support, vendor development, business process improvement and practical workflow automation.',tags:['Tender / GeM','Vendor development','Compliance','Process automation'],quick:[['Tender / GeM support','gem-tender-support-kolkata.html'],['Estimate tools','estimate.html'],['Business support services','services.html']],check:['For tenders, upload the complete tender document and amendments','State the closing date and portal clearly','For process automation, show the current manual workflow and desired output','For vendor development, include technical specification, annual quantity and quality expectations'],fields:[
      {name:'support_type',label:'Support required',type:'select',options:['Tender eligibility / compliance review','GeM bid support','Technical compliance matrix','Tender document preparation','Vendor registration / documentation','Vendor / supplier development','Industrial sourcing / cost-down','Excel / VBA workflow automation','ERP / BOM / process improvement','SOP / documentation workflow','EPF / ESIC employer-account support','Other business support']},
      {name:'authority',label:'Authority / customer / portal',placeholder:'GeM, CPPP, state portal, OEM, etc.'},
      {name:'reference',label:'Tender / enquiry / project reference',placeholder:'Tender ID, bid number or internal reference'},
      {name:'closing_date',label:'Closing date / target date',type:'date'},
      {name:'value_requirement',label:'Key commercial / eligibility point',placeholder:'EMD, turnover, experience, certification, quantity, etc.'},
      {name:'current_process',label:'Current process / software / workflow',placeholder:'For automation or process-improvement requests'},
      {name:'desired_output',label:'What outcome do you need?',type:'textarea',placeholder:'Compliance check, submission support, vendor shortlist, automated workbook, SOP, workflow redesign, etc.'}
    ]}
  };
  const routeOrder=['design','manufacture','part','machine','quality','business'];
  const routeDescriptions={design:'CAD, drawings, reverse engineering and DFM.',manufacture:'Prototype or production from your design.',part:'Identify, match or source an industrial component.',machine:'Troubleshoot breakdowns and recurring machine issues.',quality:'RCA, CAPA, 8D, inspection and QMS support.',business:'Tender, vendor, compliance and workflow support.'};
  routeGrid.innerHTML=routeOrder.map(k=>{const r=routes[k];return `<article class="ed-route"><div class="ed-route-icon">${r.icon}</div><h3>${r.title}</h3><p>${routeDescriptions[k]}</p><div class="ed-route-tags">${r.tags.map(t=>`<span>${t}</span>`).join('')}</div><button class="btn outline" type="button" data-ed-route="${k}">Start here →</button></article>`}).join('');
  let activeRoute=null,prefillMessage='';
  function fieldHTML(f){
    const required=f.required?' required':'';
    if(f.type==='select')return `<label>${f.label}<select name="${f.name}"${required}>${f.options.map(o=>`<option>${o}</option>`).join('')}</select></label>`;
    if(f.type==='textarea')return `<label class="ed-full">${f.label}<textarea name="${f.name}" placeholder="${f.placeholder||''}"${required}></textarea></label>`;
    return `<label>${f.label}<input name="${f.name}" type="${f.type||'text'}" placeholder="${f.placeholder||''}"${required}></label>`;
  }
  function renderRoute(key){
    const r=routes[key];if(!r)return;activeRoute=key;
    formCard.innerHTML=`<div class="ed-form-title"><div class="ed-route-icon">${r.icon}</div><div><h2>${r.title}</h2><p>${r.intro}</p></div></div><form class="ed-form" id="ed-intake-form"><div class="ed-form-grid"><label>Name<input name="name" required></label><label>Company<input name="company"></label><label>Phone / WhatsApp<input name="phone" inputmode="tel" required></label><label>Email<input name="email" type="email"></label>${r.fields.map(fieldHTML).join('')}<label class="ed-full ed-filebox">Reference files<input name="files" id="ed-files" type="file" multiple accept="${[...allowed].map(x=>'.'+x).join(',')}"><small>Up to ${MAX_FILES} files, maximum 50 MB each. CAD, drawings, photos, spreadsheets, documents and short troubleshooting videos are accepted.</small></label><label class="ed-full">Anything else we should know?<textarea name="notes" placeholder="Site constraints, confidentiality needs, customer expectations, previous attempts, contact preference, etc.">${prefillMessage}</textarea></label></div><div class="ed-actions"><button class="btn primary" type="submit">Send to CG Engineering</button><a class="btn outline" href="request-quote.html">Use general RFQ instead</a></div><div class="ed-status" id="ed-form-status"></div></form>`;
    aside.innerHTML=`<div class="ed-card"><h3>Prepare these details</h3><div class="ed-checklist">${r.check.map(x=>`<div class="ed-checkitem">${x}</div>`).join('')}</div><div class="ed-quicklinks">${r.quick.map(([t,h])=>`<a href="${h}">${t}<span>→</span></a>`).join('')}</div><div class="ed-confidential"><b>Confidential engineering files:</b> uploads are tied to the enquiry and stored through the existing secure RFQ-file workflow. Share only information you are authorized to disclose.</div></div>`;
    workspace.scrollIntoView({behavior:'smooth',block:'start'});
    document.getElementById('ed-intake-form').addEventListener('submit',submitIntake);
    prefillMessage='';
  }
  routeGrid.addEventListener('click',e=>{const b=e.target.closest('[data-ed-route]');if(b)renderRoute(b.dataset.edRoute)});
  function cleanName(name){return String(name||'file').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-180)}
  function extOf(name){return (String(name||'').split('.').pop()||'').toLowerCase()}
  function uid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`}
  function clientRef(){const d=new Date(),p=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('');return `CGD-${p}-${Math.random().toString(36).slice(2,6).toUpperCase()}`}
  async function uploadFile(c,enquiryId,file){
    const ext=extOf(file.name);if(!allowed.has(ext))throw new Error(`${file.name}: unsupported file type`);if(file.size>MAX)throw new Error(`${file.name}: exceeds 50 MB`);
    const path=`public-rfq/${enquiryId}/${uid()}-${cleanName(file.name)}`;
    const up=await c.storage.from('rfq-files').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});if(up.error)throw up.error;
    const reg=await c.rpc('register_enquiry_attachment',{p_enquiry_id:enquiryId,p_object_path:path,p_original_name:file.name,p_mime_type:file.type||null,p_file_size:file.size});if(reg.error)throw reg.error;return path;
  }
  async function submitIntake(e){
    e.preventDefault();const form=e.currentTarget,status=document.getElementById('ed-form-status'),submit=form.querySelector('button[type="submit"]'),r=routes[activeRoute];
    const fd=new FormData(form),files=[...form.querySelector('#ed-files').files];if(files.length>MAX_FILES){status.className='ed-status show warn';status.textContent=`Please attach no more than ${MAX_FILES} files.`;return}
    for(const f of files){if(f.size>MAX||!allowed.has(extOf(f.name))){status.className='ed-status show warn';status.textContent=`Check ${f.name}. Each file must be a supported type and no larger than 50 MB.`;return}}
    submit.disabled=true;submit.textContent='Submitting…';const d=Object.fromEntries([...fd.entries()].filter(([k])=>k!=='files')),ref=clientRef();
    const coreKeys=new Set(['name','company','phone','email','notes']);const lines=[`CG Engineering Desk Reference: ${ref}`,`Route: ${r.title}`];
    for(const f of r.fields){const v=d[f.name];if(v)lines.push(`${f.label}: ${v}`)}if(d.notes)lines.push(`Additional notes: ${d.notes}`);if(files.length)lines.push(`Files selected: ${files.map(f=>f.name).join(', ')}`);
    let saved=false,enquiryId=null,attached=0,errText='';const cfg=window.CG_CONFIG||{};
    try{
      if(window.supabase&&cfg.supabaseUrl&&cfg.supabasePublishableKey){
        const c=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey),ids=window.CGVisitorIds?window.CGVisitorIds():['',''];
        const res=await c.rpc('submit_enquiry',{p_name:d.name||null,p_company:d.company||null,p_phone:d.phone||null,p_email:d.email||null,p_requirement_type:r.requirement,p_product_id:null,p_variant_id:null,p_quantity:d.quantity||null,p_message:lines.join('\n'),p_source:'website-engineering-desk',p_visitor_id:ids[0]||null,p_session_id:ids[1]||null});
        if(res.error)throw res.error;saved=true;enquiryId=res.data?.enquiry_id||null;
        if(enquiryId)for(const f of files){await uploadFile(c,enquiryId,f);attached++}
        if(window.CGTrack)window.CGTrack('engineering_desk_submit',{route:activeRoute,requirement:r.requirement,attachments:attached});
      }
    }catch(err){errText=err?.message||String(err)}
    const msg=encodeURIComponent([`Hello Crecer Grande,`,`Engineering Desk Ref: ${ref}`,`Route: ${r.title}`,`Name: ${d.name||''}`,`Company: ${d.company||''}`,`Phone: ${d.phone||''}`,`Email: ${d.email||''}`,...lines.slice(2)].join('\n'));
    status.className='ed-status show '+(saved?'ok':'warn');
    status.innerHTML=saved?`<b>Requirement recorded.</b> Reference <b>${ref}</b>${enquiryId?` · Enquiry ID ${enquiryId}`:''}. ${attached?`${attached} file${attached===1?'':'s'} securely attached. `:''}<a href="https://wa.me/916291001781?text=${msg}" target="_blank" rel="noopener"><b>Continue on WhatsApp →</b></a>`:`The structured brief is ready, but the website record could not be completed${errText?` (${String(errText).replace(/[<>]/g,'')})`:''}. <a href="https://wa.me/916291001781?text=${msg}" target="_blank" rel="noopener"><b>Send it on WhatsApp →</b></a>`;
    submit.disabled=false;submit.textContent='Send to CG Engineering';
  }
  const machineInfo={
    'Fiber laser cutting machine':['Alarm screen / code','Laser source status','Cutting head/nozzle details','Protective lens condition','Assist-gas pressure','Chiller alarms / temperatures','Material, thickness and cut defect photo'],
    'CO₂ laser machine':['Tube power and age','Chiller model / water temperature','Mirror/lens condition','Air-assist condition','Controller/alarm screen','Material and cut-quality photo'],
    'Industrial chiller':['Chiller model and rated capacity','Inlet/outlet temperatures','Flow/pressure indication','Pump nameplate','Alarm code','Coolant condition','Laser/machine load connected'],
    'CNC / VMC':['Controller make/model','Exact alarm','Axis/spindle affected','Recent maintenance or crash','Tool/workpiece condition','Servo/spindle drive indication'],
    'PLC / HMI / control panel':['PLC/HMI make and model','I/O state or fault LED','Electrical drawing if available','Sequence step where it stops','Recent program/hardware change'],
    'Pump / motor / rotating equipment':['Nameplate data','Supply voltage/current','Flow/head or speed','Noise/vibration/temperature','Coupling/alignment condition']
  };
  document.addEventListener('change',e=>{if(e.target?.name==='machine_type'&&activeRoute==='machine'){const list=machineInfo[e.target.value];if(list){const box=aside.querySelector('.ed-checklist');box.innerHTML=list.map(x=>`<div class="ed-checkitem">${x}</div>`).join('')}}});
  const isoQuestions=[
    'Is the QMS scope, key processes and responsibilities clearly defined?',
    'Are controlled procedures, forms and records identifiable by revision/status?',
    'Are employee competence, training and authorization records maintained?',
    'Are customer requirements reviewed before accepting work or orders?',
    'Are suppliers evaluated/approved and purchasing requirements controlled?',
    'Are incoming materials identified and inspected where required?',
    'Are production/service activities planned with suitable work instructions or criteria?',
    'Is identification and traceability maintained where customer/product risk requires it?',
    'Are measuring instruments calibrated or verified at defined intervals where needed?',
    'Are inspection/test results and acceptance criteria recorded?',
    'Are nonconforming outputs identified, controlled and dispositioned?',
    'Are corrective actions based on cause analysis and effectiveness verification?',
    'Are risks/opportunities and quality objectives reviewed and updated?',
    'Is customer feedback/complaint information monitored and acted upon?',
    'Are internal audits planned, performed and followed up?',
    'Does top management conduct documented management reviews of QMS performance?'
  ];
  if(isoQuiz){isoQuiz.innerHTML=isoQuestions.map((q,i)=>`<div class="ed-q"><b>${i+1}. ${q}</b><div class="ed-q-options"><label><input type="radio" name="iso-${i}" value="2"><span>Yes</span></label><label><input type="radio" name="iso-${i}" value="1"><span>Partly</span></label><label><input type="radio" name="iso-${i}" value="0"><span>No</span></label></div></div>`).join('')+`<div class="ed-actions"><button class="btn primary" type="button" id="ed-score-iso">Calculate readiness</button></div>`;
    document.getElementById('ed-score-iso').addEventListener('click',()=>{
      let score=0,answered=0,gaps=[];isoQuestions.forEach((q,i)=>{const x=isoQuiz.querySelector(`input[name="iso-${i}"]:checked`);if(x){answered++;score+=Number(x.value);if(Number(x.value)<2)gaps.push(q)}});
      if(answered<isoQuestions.length){isoScore.innerHTML=`<strong>${answered}/${isoQuestions.length}</strong><p>Answer all questions to calculate the preliminary readiness indicator.</p>`;return}
      const pct=Math.round(score/(isoQuestions.length*2)*100);const band=pct>=85?'Strong documented foundation':pct>=65?'Moderate readiness — gaps remain':pct>=40?'Significant implementation gaps':'Early-stage QMS development';
      isoScore.innerHTML=`<strong>${pct}%</strong><p><b>${band}.</b> This is a preliminary planning indicator, not an ISO certification decision or conformity assessment.</p><button class="btn outline" type="button" id="ed-send-iso">Send gaps to CG →</button>`;
      document.getElementById('ed-send-iso').addEventListener('click',()=>{prefillMessage=`Preliminary ISO 9001 readiness check: ${pct}%.\nAreas marked Partly/No:\n- ${gaps.join('\n- ')}`;renderRoute('quality')},{once:true});
    });
  }
  const params=new URLSearchParams(location.search),initial=params.get('route');if(initial&&routes[initial])renderRoute(initial);
});