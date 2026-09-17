(()=>{
  const $=id=>document.getElementById(id);
  const fileInput=$('q3d-file'),calcBtn=$('calculate-quote'),sendBtn=$('send-rfq'),fileState=$('q3d-file-state'),slicerStatus=$('q3d-slicer-status');
  const quotePrice=$('quote-price'),quoteGst=$('quote-gst'),quoteBreakdown=$('quote-breakdown');
  if(!fileInput||!calcBtn||!sendBtn)return;

  const reviewBtn=document.createElement('button');
  reviewBtn.type='button';reviewBtn.id='submit-24hr-review';reviewBtn.className='btn primary';reviewBtn.textContent='Submit for result within 24 hrs';reviewBtn.style.display='none';
  sendBtn.insertAdjacentElement('afterend',reviewBtn);

  const MAX_UPLOAD=50*1024*1024;
  const allowed=new Set(['step','stp','ste','3mf','obj','ply','amf','igs','iges','ige','brep','brp','sldprt','sldasm','ipt','iam','prt','x_t','x_b','sat','sab','catpart','catproduct','jt','3dm','f3d','f3z','dwg','dxf','zip']);
  let reviewMode=false;
  let enforcing=false;

  const cleanName=name=>String(name||'cad-file').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-180);
  const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const extOf=f=>(f?.name?.split('.').pop()||'').toLowerCase();

  function enforceReviewUI(){
    if(!reviewMode||enforcing)return;enforcing=true;
    calcBtn.style.display='none';sendBtn.style.display='none';reviewBtn.style.display='inline-flex';
    quotePrice.textContent='Within 24 hrs';
    quoteGst.textContent='Engineering-reviewed result after successful file submission.';
    quoteBreakdown.innerHTML='<div><span>Turnaround</span><b>Within 24 hrs</b></div><div><span>Review</span><b>CAD + manufacturability</b></div><div><span>Output</span><b>Approx. price / recommendation</b></div>';
    if(fileState)fileState.textContent='File accepted for Crecer Grande engineering review. Your result will be provided within 24 hrs of successful submission.';
    if(slicerStatus)slicerStatus.textContent='This format is handled through the 24-hour engineering-review route. STL remains the instant-result format.';
    enforcing=false;
  }

  function setMode(){
    const file=fileInput.files?.[0];
    if(!file){reviewMode=false;calcBtn.style.display='';sendBtn.style.display='';reviewBtn.style.display='none';return;}
    const ext=extOf(file);
    reviewMode=ext!=='stl';
    if(reviewMode){
      calcBtn.style.display='none';sendBtn.style.display='none';reviewBtn.style.display='inline-flex';
      setTimeout(enforceReviewUI,0);setTimeout(enforceReviewUI,500);setTimeout(enforceReviewUI,1800);
    }else{
      calcBtn.style.display='inline-flex';sendBtn.style.display='inline-flex';reviewBtn.style.display='none';
      if(fileState)fileState.textContent='STL selected. Instant geometry analysis and FDM slicing are available.';
      if(slicerStatus)slicerStatus.textContent='STL instant-result mode: configure the print and calculate.';
    }
  }

  new MutationObserver(()=>{if(reviewMode)setTimeout(enforceReviewUI,0)}).observe(document.querySelector('.q3d-summary')||document.body,{subtree:true,childList:true,characterData:true});
  fileInput.addEventListener('change',setMode);
  document.getElementById('q3d-drop')?.addEventListener('drop',()=>setTimeout(setMode,0));

  async function upload(file){
    if(!file||!file.name)return null;
    const ext=extOf(file);if(!allowed.has(ext))throw new Error('Unsupported review-file format');
    if(file.size>MAX_UPLOAD)throw new Error('File exceeds the 50 MB secure upload limit');
    const cfg=window.CG_CONFIG||{};if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey)throw new Error('Secure upload service is unavailable');
    const c=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey),month=new Date().toISOString().slice(0,7),path=`public-rfq/pending/${month}/${uid()}-${cleanName(file.name)}`;
    const up=await c.storage.from('rfq-files').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});if(up.error)throw up.error;
    return{path,name:file.name,size:file.size,type:file.type||''};
  }

  reviewBtn.addEventListener('click',async()=>{
    const file=fileInput.files?.[0];if(!file)return;
    const ext=extOf(file);if(ext==='stl')return;
    reviewBtn.disabled=true;const old=reviewBtn.textContent;reviewBtn.textContent=file.size<=MAX_UPLOAD?'Uploading CAD file…':'Preparing review request…';
    const process=$('process')?.value||'',material=$('material')?.value||'',qty=$('quantity')?.value||'1',quality=$('quality')?.value||'',complexity=$('complexity')?.value||'',infill=$('infill')?.value||'';
    const opts=[['opt-support','Auto supports'],['opt-inserts','Brass inserts'],['opt-finish','Finishing'],['opt-paint','Primer/painting'],['opt-fai','FAI']].filter(([id])=>$(id)?.checked).map(([,label])=>label);
    const msg=[
      '3D Printing / CAD Review Request from CG website',
      `File: ${file.name} (${ext.toUpperCase()})`,
      'Service level: Result within 24 hrs of successful submission',
      process?`Process: ${process.toUpperCase()}`:null,
      material?`Material: ${material}`:null,
      quality?`Quality: ${quality}`:null,
      process==='fdm'&&infill?`Infill: ${infill}%`:null,
      complexity?`Complexity: ${complexity}`:null,
      `Quantity: ${qty}`,
      opts.length?`Options: ${opts.join(', ')}`:null,
      'Please review file integrity, geometry, printability, orientation/supports, material suitability and provide the approximate pricing/recommendation within 24 hrs.'
    ].filter(Boolean);
    let attachment=null;
    try{if(file.size<=MAX_UPLOAD)attachment=await upload(file);else msg.push('File is above the 50 MB website upload limit; customer will share it separately by email/cloud link.');}
    catch(err){msg.push(`Automatic secure upload note: ${err?.message||'upload unavailable'}; customer will re-attach/share the file manually.`);}
    const u=new URL('../request-quote.html',location.href);u.searchParams.set('requirement','3D Printing');u.searchParams.set('message',msg.join('\n'));if(material)u.searchParams.set('material',material);u.searchParams.set('quantity',qty);
    if(attachment){u.searchParams.set('attachment_path',attachment.path);u.searchParams.set('attachment_name',attachment.name);u.searchParams.set('attachment_size',String(attachment.size));if(attachment.type)u.searchParams.set('attachment_type',attachment.type)}
    location.href=u.toString();reviewBtn.textContent=old;reviewBtn.disabled=false;
  });
})();
