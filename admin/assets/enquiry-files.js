(()=>{
  const cfg=window.CG_CONFIG||{};
  if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey)return;
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const fmtBytes=n=>{n=Number(n||0);if(!n)return '—';if(n<1024)return `${n} B`;if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`;return `${(n/1024/1024).toFixed(2)} MB`};
  let busy=false,timer=null;

  async function render(){
    const title=document.getElementById('view-title'),host=document.getElementById('content');
    if(!title||!host||title.textContent.trim()!=='Enquiries'||busy)return;
    busy=true;
    try{
      document.getElementById('enquiry-files-panel')?.remove();
      const {data,error}=await client.from('enquiry_attachments').select('id,enquiry_id,object_path,original_name,mime_type,file_size,created_at,enquiries(name,company,requirement_type)').order('created_at',{ascending:false}).limit(100);
      if(error||!data?.length)return;
      const card=document.createElement('div');card.className='card';card.id='enquiry-files-panel';
      card.innerHTML=`<h2>RFQ / CAD Attachments</h2><p class="muted">Private customer files. Download links are temporary and available only to signed-in Website Manager users.</p><div class="table-wrap"><table><thead><tr><th>Date</th><th>Enquiry</th><th>File</th><th>Size</th><th></th></tr></thead><tbody>${data.map((x,i)=>{const e=x.enquiries||{};return `<tr><td>${esc(x.created_at||'')}</td><td><b>${esc(e.name||'Enquiry')}</b><br><small>${esc(e.company||e.requirement_type||'')}</small></td><td>${esc(x.original_name||'File')}</td><td>${esc(fmtBytes(x.file_size))}</td><td><button class="primary small" type="button" data-cg-file="${i}">Open</button></td></tr>`}).join('')}</tbody></table></div>`;
      host.appendChild(card);
      card.querySelectorAll('[data-cg-file]').forEach(b=>b.addEventListener('click',async()=>{
        const x=data[Number(b.dataset.cgFile)];if(!x)return;const old=b.textContent;b.disabled=true;b.textContent='Preparing…';
        try{const {data:signed,error}=await client.storage.from('rfq-files').createSignedUrl(x.object_path,300);if(error)throw error;if(signed?.signedUrl)window.open(signed.signedUrl,'_blank','noopener')}catch(err){alert(err?.message||'Could not open attachment')}finally{b.disabled=false;b.textContent=old}
      }));
    }finally{busy=false}
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(render,450)}
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="enquiries"]')||e.target.closest('#refresh'))schedule()});
  const title=document.getElementById('view-title');if(title)new MutationObserver(schedule).observe(title,{childList:true,subtree:true,characterData:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();
