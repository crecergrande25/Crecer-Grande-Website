
(() => {
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const cfg=window.CG_CONFIG||{};
  let client=null, profile=null, roles=[], permissions=new Set(), currentView='dashboard', currentTable=null, tableRows=[], editing=null, creating=false, renderTicket=0, authTicket=0, userDialogTicket=0, signingIn=false;

  const tableDefs={
    settings:{label:'Website Settings',table:'site_settings',icon:'⚙',preferred:['id','company_name','tagline','email_primary','phone_primary','instagram_url','logo_url','website_version']},
    homepage:{label:'Homepage Content',table:'homepage_content',icon:'⌂',preferred:['id','section_key','title','subtitle','body','published','sort_order']},
    pagecontent:{label:'Page Content',table:'page_content',icon:'▤',preferred:['id','page_key','section_key','title','subtitle','body','published','sort_order']},
    pagetext:{label:'Page Texts',table:'page_texts',pk:'page_key',icon:'T',preferred:['id','page_key','text_key','content','published']},
    divisions:{label:'Divisions',table:'divisions',icon:'◫',preferred:['id','slug','name','title','published','sort_order']},
    resources:{label:'Resource records',table:'resources',icon:'▦',preferred:['id','slug','title','name','published','sort_order']},
    media:{label:'Media Assets',table:'media_assets',icon:'▧',preferred:['id','title','name','url','file_url','alt_text','published']},
    enquiries:{label:'Enquiries',table:'enquiries',icon:'✉',preferred:['id','created_at','name','company','phone','email','requirement_type','status']},
    analytics:{label:'Analytics',table:'analytics_events',icon:'→',preferred:['id','created_at','event_type','page_path','product_slug','division_slug','device_type']},
    audit:{label:'Audit Log',table:'audit_log',icon:'✓',preferred:['id','occurred_at','actor_display_name','actor_username','action','module','record_label']}
  };

  const createDefs={
    divisions:{slug:'',title:'',name:'',summary:'',description:'',image_url:'',published:false,sort_order:100,bullets:[]},
    resources:{title:'',description:'',file_url:'',resource_type:'pdf',published:false,sort_order:100},
    pagecontent:{page_slug:'',page_name:'',title:'',intro:'',body:{},published:false},
    pagetext:{page_key:'',title:'',h1:'',intro:'',meta_description:''}
  };
  const readOnlyTables=new Set(['analytics_events','audit_log']);
  const noEdit=new Set(['id','created_at','updated_at','occurred_at','user_id']);
  const escape=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const status=(msg,type='')=>{const el=$('#global-notice');if(!el)return;el.className='notice '+type;el.textContent=msg;el.hidden=!msg};
  const fmt=v=>{
    if(v===null||v===undefined)return '';
    if(typeof v==='boolean')return v?'Yes':'No';
    if(Array.isArray(v))return v.join(', ');
    if(typeof v==='object')return JSON.stringify(v);
    const s=String(v);return s.length>130?s.slice(0,127)+'…':s;
  };
  function aliasToEmail(v){
    v=String(v||'').trim().toLowerCase();
    if(v.includes('@'))return v;
    v=v.replace(/\s+/g,'.').replace(/[^a-z0-9._-]/g,'');
    return `${v}@${cfg.adminAuthDomain||'admin.crecergrande.in'}`;
  }
  async function initClient(){
    if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey)throw new Error('Sign-in is temporarily unavailable. Please refresh or contact your administrator.');
    client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    window.CG_SUPABASE=client;
  }
  async function loadProfile(){
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError||!user)throw new Error('An authenticated administrator session is required.');
    const {data,error}=await client.from('user_profiles').select('*').eq('user_id',user.id).maybeSingle();
    if(error)throw error;if(!data?.is_active)throw new Error('This administrator profile is inactive.');
    return data;
  }
  async function loadPermissions(){
    const {data,error}=await client.rpc('get_my_permissions');
    if(error){permissions=new Set();return}
    permissions=new Set((data||[]).filter(x=>x.allowed).map(x=>x.permission_key));
  }
  const can=key=>Boolean(profile?.is_root||permissions.has(key));
  async function login(e){
    e.preventDefault();if(signingIn)return;signingIn=true;const ticket=authTicket,b=$('#login-btn');b.disabled=true;$('#login-form').setAttribute('aria-busy','true');$('#login-status').className='login-status';$('#login-status').textContent='Signing in…';
    try{
      const email=aliasToEmail($('#login-alias').value),password=$('#login-password').value;
      const {error}=await client.auth.signInWithPassword({email,password}); if(error)throw error;
      const activeProfile=await loadProfile();await loadPermissions();if(ticket!==authTicket)throw new Error('Session ended.');profile=activeProfile;showApp();
    }catch(err){
      clearWorkspace('Sign-in failed. Check your credentials and administrator access.');
      try{await client.auth.signOut()}catch(_){}
    }
    finally{signingIn=false;b.disabled=false;$('#login-form').removeAttribute('aria-busy')}
  }
  function clearWorkspace(message='Your session has ended. Sign in again.'){
    profile=null;permissions=new Set();renderTicket++;authTicket++;window.CGAdminUI?.closeNavigation(false);
    const app=$('#admin-app');app.hidden=true;app.inert=true;app.classList.remove('open');
    $('#content').replaceChildren();
    $('#login-shell').classList.remove('hidden');
    $('#login-status').className='login-status'+(message.startsWith('Sign-in failed')?' bad':'');$('#login-status').textContent=message;$('#login-password').value='';
    closeDrawer();closeUserModal();$('#drawer-body').replaceChildren();$('#user-modal-body').replaceChildren();$('#profile-name').textContent='Administrator';$('#profile-initials').textContent='CG';$('#profile-role').textContent='';
  }
  function showApp(){
    if(!profile?.is_active)throw new Error('An active administrator profile is required.');
    $('#admin-app').hidden=false;$('#admin-app').inert=false;
    $('#login-shell').classList.add('hidden');$('#admin-app').classList.add('open');
    $('#profile-name').textContent=profile.display_name||profile.login_slug||'Administrator';
    $('#profile-initials').textContent=(profile.display_name||profile.login_slug||'Administrator').split(/[ .]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
    $('#profile-role').textContent=(profile.role_key||'administrator')+(profile.is_root?' • Root':'');
    const usersNav=$('[data-view="users"]');
    if(usersNav)usersNav.hidden=!(can('users.view')||can('users.manage'));
    if(profile.must_change_password){status('This account is marked to change its password. Use Account → Change Password.','warn')}
    view('dashboard');
  }
  async function logout(){const button=$('#logout-btn');button.disabled=true;try{const {error}=await client.auth.signOut();if(error)throw error;clearWorkspace('You have signed out.');}catch(_){status('Sign out could not finish. Please try again.','bad')}finally{button.disabled=false}}
  async function count(table){try{const {count,error}=await client.from(table).select('*',{count:'exact',head:true});return error?null:count}catch(_){return null}}
  async function analyticsSummary(days=30){
    const {data,error}=await client.rpc('get_analytics_summary',{p_days:days});
    if(error)throw error;
    return data||{};
  }
  const number=v=>v==null||!Number.isFinite(Number(v))?'—':new Intl.NumberFormat('en-IN').format(Number(v));
  const label=k=>String(k).replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()).replace(/\bId\b/g,'ID').replace(/\bUrl\b/g,'URL');
  let guideRecords=null;
  async function loadGuides(){if(guideRecords)return guideRecords;const response=await fetch('/assets/data/insights.json',{cache:'no-cache'});if(!response.ok)throw new Error('The published guide library could not be loaded.');const data=await response.json();if(!Array.isArray(data))throw new Error('The published guide library could not be loaded.');guideRecords=data;return data;}
  async function dashboard(){
    const ticket=++renderTicket;const content=$('#content');content.innerHTML='<div class="notice" role="status">Preparing your overview…</div>';
    const results=await Promise.allSettled([count('enquiries'),loadGuides(),client.from('enquiries').select('*').order('submitted_at',{ascending:false}).limit(5),analyticsSummary(30)]);
    if(ticket!==renderTicket||!profile?.is_active)return;
    const enq=results[0].status==='fulfilled'?results[0].value:null,guides=results[1].status==='fulfilled'?results[1].value:[];
    const recent=results[2].status==='fulfilled'&&!results[2].value.error?(results[2].value.data||[]):[];
    const analyticsReady=results[3].status==='fulfilled',summary=analyticsReady?(results[3].value||{}):{};
    const topPages=Array.isArray(summary.top_pages)?summary.top_pages:[],max=Math.max(1,...topPages.map(x=>Number(x.count)||0));
    const name=escape((profile.display_name||'Administrator').split(' ')[0]);
    content.innerHTML=`<section class="dashboard-welcome"><div><p class="eyebrow">YOUR WEBSITE, AT A GLANCE</p><h2>Welcome back, ${name}.</h2><p>Follow up on enquiries, review your content and keep the next step moving.</p></div><a class="btn outline" href="/" target="_blank" rel="noopener">Open website →</a></section>
    <div class="metric-grid"><div class="metric"><span>Published guides</span><strong>${results[1].status==='fulfilled'?number(guides.length):'—'}</strong><small>Articles on your website</small></div><div class="metric"><span>Enquiries</span><strong>${number(summary.enquiries??enq)}</strong><small>${summary.enquiries!=null?'Last 30 days':'Total records'}</small></div><div class="metric"><span>Page views</span><strong>${number(summary.page_views)}</strong><small>Last 30 days</small></div><div class="metric"><span>Unique visitors</span><strong>${number(summary.unique_visitors)}</strong><small>${summary.sessions!=null?number(summary.sessions)+' sessions':'Last 30 days'}</small></div></div>
    <div class="quick-actions"><button class="quick-action" data-open-view="enquiries"><b>Review enquiries</b><small>Follow up on incoming requirements</small><span aria-hidden="true">→</span></button><button class="quick-action" data-open-view="guides"><b>Browse your Insights</b><small>Review the published guide library</small><span aria-hidden="true">→</span></button><button class="quick-action" data-open-view="media"><b>Manage media</b><small>Find and upload website assets</small><span aria-hidden="true">→</span></button></div>
    <div class="grid2"><section class="panel"><div class="panel-heading"><h2>Recent enquiries</h2><button class="mini" data-open-view="enquiries">View all →</button></div>${recent.length?`<div class="table-shell" tabindex="0" role="region" aria-label="Recent enquiries"><table><thead><tr><th scope="col">Name</th><th scope="col">Requirement</th><th scope="col">Status</th></tr></thead><tbody>${recent.map(x=>`<tr><td>${escape(x.name||'')}</td><td>${escape(x.requirement_type||'')}</td><td><span class="tag">${escape(x.status||'new')}</span></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-state"><b>A place for your next conversation.</b>New enquiries will appear here when they are available.</div>'}</section>
    <section class="panel"><div class="panel-heading"><h2>Popular pages</h2><span class="tag">30 days</span></div><div class="chart-bars">${topPages.length?topPages.map(x=>`<div class="chart-row"><span>${escape(x.page||'/')}</span><div class="chart-track"><div class="chart-fill" style="width:${Math.max(0,Math.min(100,Math.round((Number(x.count)||0)/max*100)))}%"></div></div><b>${number(x.count)}</b></div>`).join(''):`<div class="empty-state">${analyticsReady?'Visitor activity will appear here when it is available.':'Analytics is unavailable right now. You can continue working with content and enquiries.'}</div>`}</div></section></div>`;
  }
  async function guidesView(){
    const ticket=++renderTicket;const content=$('#content');content.innerHTML='<div class="notice" role="status">Loading your published guides…</div>';
    try{const [records,mediaResponse]=await Promise.all([loadGuides(),fetch('/assets/data/photography.json')]);const media=mediaResponse.ok?await mediaResponse.json():{entries:[]};const pictures=new Map((media.entries||[]).map(e=>[e.id,e]));if(ticket!==renderTicket||!profile?.is_active)return;
      content.innerHTML='<section class="panel section-intro"><div class="panel-heading"><h2>Published Insights</h2><a class="btn outline" href="/insights.html" target="_blank" rel="noopener">Open library →</a></div><p class="guide-information">These articles are published from your website files. Review them here; update their text in the source. Resource records are managed separately.</p><div class="toolbar"><label class="sr-only" for="guide-search">Search published guides</label><input id="guide-search" type="search" placeholder="Search topics or titles…"><span class="tag" id="guide-count" role="status" aria-live="polite"></span><div class="spacer"></div><a class="btn outline" href="https://github.com/crecergrande25/Crecer-Grande-Website/blob/main/assets/data/insights.json" target="_blank" rel="noopener">Edit source in GitHub →</a></div></section><div class="admin-guide-grid section-gap" id="published-guides"></div>';
      const render=query=>{const matches=records.filter(x=>(x.title+' '+x.summary+' '+x.category).toLowerCase().includes(query));$('#guide-count').textContent=matches.length+' '+(matches.length===1?'guide':'guides');$('#published-guides').innerHTML=matches.length?matches.map(a=>{const image=pictures.get(a.image);const src=image?.src&&/^\/assets\/images\/generated\/[a-z0-9-]+\.webp$/i.test(image.src)?image.src.replace('.webp','-480.webp'):null;return `<article class="admin-guide-card">${src?`<img src="${escape(src)}" alt="${escape(image.alt)}" width="480" height="320" loading="lazy" decoding="async">`:''}<div><span class="tag">${escape(label(a.category))}</span><h3>${escape(a.title)}</h3><a href="${escape(a.href)}" target="_blank" rel="noopener">Open guide →</a></div></article>`}).join(''):'<div class="empty-state"><b>No matching guides.</b>Try another word or clear your search.</div>'};render('');$('#guide-search').addEventListener('input',e=>render(e.target.value.trim().toLowerCase()));
    }catch(e){if(ticket===renderTicket&&profile?.is_active)content.innerHTML='<div class="notice bad">The published library could not be loaded. Refresh to try again.</div>'}
  }
  function preferredCols(rows,def){
    if(!rows.length)return def.preferred.slice(0,7);
    const keys=Object.keys(rows[0]),out=[];
    def.preferred.forEach(k=>{if(keys.includes(k)&&!out.includes(k))out.push(k)});
    keys.forEach(k=>{if(out.length<8&&!out.includes(k)&&!['metadata','search_keywords'].includes(k))out.push(k)});
    return out;
  }
  async function tableView(key){
    const ticket=++renderTicket;const def=tableDefs[key];currentTable=def.table;const c=$('#content');
    c.innerHTML='<div class="notice">Loading '+escape(def.label)+'…</div>';
    let result=await client.from(def.table).select('*').limit(150);
    if(ticket!==renderTicket||!profile?.is_active)return;
    if(result.error){c.innerHTML=`<div class="panel"><h2>${escape(def.label)}</h2><div class="notice bad">${escape(result.error.message)}</div><p>This usually means the current admin role does not have access through RLS, or this table is not present in this Supabase version.</p></div>`;return}
    tableRows=result.data||[];renderTable(key,tableRows);
  }
  function renderTable(key,rows){
    const def=tableDefs[key],cols=preferredCols(rows,def),readonly=readOnlyTables.has(def.table);
    $('#content').innerHTML=`<div class="toolbar"><input id="table-search" type="search" aria-label="Search records" placeholder="Search ${escape(def.label.toLowerCase())}…"><span class="tag" id="table-result-count" role="status" aria-live="polite">${rows.length} ${rows.length===1?'record':'records'}</span><div class="spacer"></div>${createDefs[key]?`<button class="btn primary" id="new-record">New</button>`:''}<button class="btn outline" id="refresh-table">Refresh</button></div>
    <div class="table-shell" tabindex="0" role="region" aria-label="Records"><table><thead><tr>${cols.map(c=>`<th scope="col">${escape(label(c))}</th>`).join('')}<th>Actions</th></tr></thead><tbody id="table-body">${renderRows(rows,cols,readonly)}</tbody></table></div>`;
    $('#table-search').addEventListener('input',e=>{const q=e.target.value.toLowerCase();renderTableBody(rows.filter(x=>JSON.stringify(x).toLowerCase().includes(q)),cols,readonly)});
    $('#refresh-table').onclick=()=>tableView(key);if($('#new-record'))$('#new-record').onclick=()=>openCreateDrawer(key);bindRowActions(readonly);
  }
  function renderRows(rows,cols,readonly){
    if(!rows.length)return `<tr><td class="table-empty" colspan="${cols.length+1}">No records match this search.</td></tr>`;
    return rows.map((r,i)=>`<tr data-row="${i}">${cols.map(c=>`<td>${escape(fmt(r[c]))}</td>`).join('')}<td><div class="row-actions"><button class="mini" data-viewrow="${i}">View</button>${readonly?'':`<button class="mini" data-editrow="${i}">Edit</button>`}${currentTable==='enquiries'&&'status' in r?`<button class="mini" data-statusrow="${i}">Status</button>`:''}</div></td></tr>`).join('');
  }
  function renderTableBody(rows,cols,readonly){$('#table-body').innerHTML=renderRows(rows,cols,readonly);tableRows=rows;if($('#table-result-count'))$('#table-result-count').textContent=rows.length+' '+(rows.length===1?'record':'records');bindRowActions(readonly)}
  function bindRowActions(readonly){
    $$('[data-viewrow]').forEach(b=>b.onclick=()=>openDrawer(tableRows[+b.dataset.viewrow],true));
    if(!readonly)$$('[data-editrow]').forEach(b=>b.onclick=()=>openDrawer(tableRows[+b.dataset.editrow],false));
    $$('[data-statusrow]').forEach(b=>b.onclick=()=>quickStatus(tableRows[+b.dataset.statusrow]));
  }
  function fieldInput(k,v,ro){
    const inputId='record-'+String(k).replace(/[^a-zA-Z0-9_-]/g,'-');
    const isObject=v&&typeof v==='object';
    const val=isObject?JSON.stringify(v,null,2):v==null?'':String(v);
    const disabled=ro||noEdit.has(k);
    if(typeof v==='boolean'&&!disabled)return `<div class="edit-field"><label for="${inputId}">${escape(label(k))}</label><select id="${inputId}" data-field="${escape(k)}"><option value="true" ${v?'selected':''}>true</option><option value="false" ${!v?'selected':''}>false</option></select></div>`;
    const wide=isObject||val.length>100||/body|description|notes|metadata|keywords|content/i.test(k);
    return `<div class="edit-field ${wide?'wide':''}"><label for="${inputId}">${escape(label(k))}</label>${wide?`<textarea id="${inputId}" ${disabled?'disabled class="readonly"':''} data-field="${escape(k)}">${escape(val)}</textarea>`:`<input id="${inputId}" ${disabled?'disabled class="readonly"':''} data-field="${escape(k)}" value="${escape(val)}">`}</div>`;
  }
  function openCreateDrawer(key){
    currentTable=tableDefs[key].table;creating=true;editing=structuredClone(createDefs[key]);
    $('#drawer-title').textContent='Create '+tableDefs[key].label.replace(/s$/,'');
    $('#drawer-body').innerHTML='<div class="edit-grid">'+Object.entries(editing).map(([k,v])=>fieldInput(k,v,false)).join('')+'</div>';
    $('#drawer-save').hidden=false;$('#drawer-status').hidden=true;window.CGAdminUI.openDialog('drawer');
  }
  function openDrawer(row,viewOnly){
    creating=false;editing=row;$('#drawer-title').textContent=(viewOnly?'View ':'Edit ')+(currentTable||'record');
    $('#drawer-body').innerHTML='<div class="edit-grid">'+Object.entries(row).map(([k,v])=>fieldInput(k,v,viewOnly)).join('')+'</div>';
    $('#drawer-save').hidden=viewOnly;$('#drawer-status').hidden=true;window.CGAdminUI.openDialog('drawer');
  }
  function closeDrawer(){window.CGAdminUI?.closeDialog('drawer');editing=null;creating=false}
  async function saveDrawer(){
    if(!editing||$('#drawer-save').disabled)return;const record=editing,table=currentTable,isNew=creating,ticket=renderTicket,patch={};
    $$('[data-field]',$('#drawer-body')).forEach(el=>{
      const k=el.dataset.field;if(noEdit.has(k)&&!creating)return;
      const old=editing[k];let v=el.value;
      if(typeof old==='boolean')v=v==='true';
      else if(typeof old==='number'&&v!=='')v=Number(v);
      else if(old&&typeof old==='object'){try{v=JSON.parse(v||(/\[/.test(JSON.stringify(old))?'[]':'{}'))}catch(_){throw new Error(`${k} must be valid JSON`)}} else if(v==='')v=null;
      if(creating||JSON.stringify(v)!==JSON.stringify(old))patch[k]=v;
    });
    Object.keys(patch).forEach(k=>{if(patch[k]===null&&creating)delete patch[k]});
    if(creating&&currentTable==='divisions'){
      if(patch.slug)patch.slug=String(patch.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    }
    if(creating&&currentTable==='divisions'&&(!patch.slug||!patch.title))throw new Error('Division slug and title are required.');
    if(creating&&currentTable==='resources'&&!patch.title)throw new Error('Resource title is required.');
    if(creating&&currentTable==='page_content'&&(!patch.page_slug||!patch.page_name))throw new Error('Page slug and page name are required.');
    if(creating&&currentTable==='page_texts'&&!patch.page_key)throw new Error('Page key is required.');
    $('#drawer-save').disabled=true;
    try{
      if(isNew){
        const {data,error}=await client.from(table).insert(patch).select().maybeSingle();if(error)throw error;
        try{await client.rpc('log_admin_event',{p_action:'CREATE',p_module:table,p_record_id:String(data?.id||data?.page_key||''),p_record_label:data?.name||data?.title||data?.slug||data?.page_key||'',p_metadata:{fields:Object.keys(patch)}})}catch(_){}
        if(editing!==record||ticket!==renderTicket||!profile?.is_active)return;closeDrawer();status('Created '+table+' record.','ok');
      }else{
        if(!Object.keys(patch).length){closeDrawer();return}
        const def=Object.values(tableDefs).find(x=>x.table===table)||{};
        const idKey=def.pk||('id' in record?'id':null);if(!idKey)throw new Error('This row has no editable primary key.');
        if('updated_at' in record)patch.updated_at=new Date().toISOString();const {error}=await client.from(table).update(patch).eq(idKey,record[idKey]);if(error)throw error;
        try{await client.rpc('log_admin_event',{p_action:'UPDATE',p_module:table,p_record_id:String(record[idKey]),p_record_label:record.name||record.title||record.slug||String(record[idKey]),p_metadata:{fields:Object.keys(patch)}})}catch(_){}
        if(editing!==record||ticket!==renderTicket||!profile?.is_active)return;closeDrawer();status('Saved '+table+' record.','ok');
      }
      const key=Object.keys(tableDefs).find(k=>tableDefs[k].table===table);if(key)tableView(key);
    }finally{$('#drawer-save').disabled=false}
  }
  async function quickStatus(row){
    currentTable='enquiries';openDrawer({id:row.id,status:row.status||'new',...(row.updated_at?{updated_at:row.updated_at}:{})},false);$('#drawer-title').textContent='Update enquiry status';$('#record-status')?.focus();
  }
  async function mediaView(){
    const ticket=++renderTicket;currentTable='media_assets';const c=$('#content');c.innerHTML='<div class="notice">Loading media library…</div>';
    const {data,error}=await client.from('media_assets').select('*').order('created_at',{ascending:false}).limit(200);
    if(ticket!==renderTicket||!profile?.is_active)return;
    if(error){c.innerHTML=`<div class="notice bad">${escape(error.message)}</div>`;return}
    const rows=data||[];
    c.innerHTML=`<div class="toolbar"><button class="btn primary" id="choose-media" type="button">Upload media</button><input id="media-upload" type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" hidden><span class="tag">${rows.length} ${rows.length===1?'asset':'assets'}</span><div class="spacer"></div><button class="btn outline" id="refresh-media">Refresh</button></div>
    <h2 class="sr-only">Media assets</h2><div class="user-grid">${rows.length?rows.map(x=>`<div class="user-card">${x.kind==='image'&&/\.(png|jpe?g|webp)(?:[?#]|$)/i.test(x.public_url||'')?`<img class="media-preview" src="${escape(x.public_url)}" alt="" width="480" height="320" loading="lazy">`:''}<h3>${escape(x.title||x.storage_path)}</h3><p>${escape(x.kind||'file')}</p><p><a href="${escape(x.public_url)}" target="_blank" rel="noopener">Open asset →</a></p><div class="row-actions"><button class="mini" data-copyurl="${escape(x.public_url)}">Copy URL</button></div></div>`).join(''):'<div class="notice">No media assets yet. Use Upload Media to add the first one.</div>'}</div>`;
    $('#refresh-media').onclick=mediaView;$('#choose-media').onclick=()=>$('#media-upload').click();
    $('#media-upload').onchange=async(e)=>{
      const file=e.target.files?.[0];if(!file)return;
      if(!/\.(png|jpe?g|webp|pdf)$/i.test(file.name)||file.type==='image/svg+xml'){status('Use a PNG, JPG or WebP image, or a PDF document.','bad');e.target.value='';return}
      if(file.size>20*1024*1024){status('Media file exceeds 20 MB.','bad');return}
      const clean=String(file.name||'file').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-160);
      const path=`media/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID?crypto.randomUUID():Date.now()}-${clean}`;
      status('Uploading media…','warn');
      const up=await client.storage.from('site-assets').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});
      if(up.error){status(up.error.message,'bad');return}
      const pub=client.storage.from('site-assets').getPublicUrl(path).data.publicUrl;
      const {data:{user}}=await client.auth.getUser();
      const ins=await client.from('media_assets').insert({title:file.name,kind:file.type?.startsWith('image/')?'image':'document',storage_path:path,public_url:pub,uploaded_by:user?.id||null});
      if(ins.error){status(ins.error.message,'bad');return}
      try{await client.rpc('log_admin_event',{p_action:'UPLOAD_MEDIA',p_module:'media_assets',p_record_id:path,p_record_label:file.name,p_metadata:{size:file.size,type:file.type}})}catch(_){}
      status('Media uploaded.','ok');mediaView();
    };
    $$('[data-copyurl]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copyurl);status('Media URL copied.','ok')}catch(_){status('Copy unavailable.','bad')}});
  }
  async function analyticsView(){
    const ticket=++renderTicket;const c=$('#content');c.innerHTML='<div class="notice" role="status">Loading analytics…</div>';
    try{
      const s=await analyticsSummary(30);if(ticket!==renderTicket||!profile?.is_active)return;
      const pages=Array.isArray(s.top_pages)?s.top_pages:[];
      const sources=Array.isArray(s.top_sources)?s.top_sources:[];
      const visitors=Array.isArray(s.recent_visitors)?s.recent_visitors:[];
      c.innerHTML=`<div class="metric-grid">
        <div class="metric"><span>Page Views</span><strong>${s.page_views??0}</strong><small>Last 30 days</small></div>
        <div class="metric"><span>Unique Visitors</span><strong>${s.unique_visitors??0}</strong><small>${s.active_visitors??0} active now</small></div>
        <div class="metric"><span>Sessions</span><strong>${s.sessions??0}</strong><small>Browser sessions</small></div>
        <div class="metric"><span>Enquiries</span><strong>${s.enquiries??0}</strong><small>${s.whatsapp_clicks??0} WhatsApp clicks</small></div>
      </div>
      <div class="grid2 section-gap">
        <div class="panel"><h2>Top pages</h2>${pages.length?`<div class="table-shell"><table><thead><tr><th>Page</th><th>Views</th></tr></thead><tbody>${pages.map(x=>`<tr><td>${escape(x.page||'/')}</td><td>${Number(x.count)||0}</td></tr>`).join('')}</tbody></table></div>`:'<p>No page data yet.</p>'}</div>
        <div class="panel"><h2>Top sources</h2>${sources.length?`<div class="table-shell"><table><thead><tr><th>Source</th><th>Events</th></tr></thead><tbody>${sources.map(x=>`<tr><td>${escape(x.source||'Direct / Unknown')}</td><td>${Number(x.count)||0}</td></tr>`).join('')}</tbody></table></div>`:'<p>No source data yet.</p>'}</div>
      </div>
      <div class="panel section-gap"><h2>Recent visitors</h2>${visitors.length?`<div class="table-shell"><table><thead><tr><th>Visitor</th><th>Page Views</th><th>Source</th><th>Last Seen</th></tr></thead><tbody>${visitors.map(x=>`<tr><td>${escape(String(x.visitor_id||'').slice(0,12))}…</td><td>${Number(x.page_views)||0}</td><td>${escape(x.source||'Direct / Unknown')}</td><td>${escape(x.last_seen||'')}</td></tr>`).join('')}</tbody></table></div>`:'<p>No recent visitor data.</p>'}</div>`;
    }catch(e){if(ticket!==renderTicket||!profile?.is_active)return;c.innerHTML=`<div class="notice bad">${escape(e.message||String(e))}</div>`}
  }
  async function userView(){
    const ticket=++renderTicket;const c=$('#content');
    if(!(can('users.view')||can('users.manage'))){c.innerHTML='<div class="notice bad">Your role does not have permission to manage users.</div>';return}
    c.innerHTML='<div class="notice">Loading users and roles…</div>';
    const [u,r]=await Promise.all([client.from('user_profiles').select('*').order('display_name'),client.from('app_roles').select('*')]);
    if(ticket!==renderTicket||!profile?.is_active)return;
    if(u.error){c.innerHTML=`<div class="notice bad">${escape(u.error.message)}</div>`;return}
    roles=r.data||[];const users=u.data||[];
    c.innerHTML=`<div class="toolbar">${can('users.manage')?'<button class="btn primary" id="new-user">Create User</button>':''}<span class="tag">${users.length} ${users.length===1?'profile':'profiles'}</span><div class="spacer"></div><span class="tag">Administrator accounts</span></div><h2 class="sr-only">Administrator profiles</h2><div class="user-grid">${users.map(x=>`<div class="user-card"><h3>${escape(x.display_name||x.login_slug||'User')}</h3><p>${escape(x.login_slug||'')} • ${escape(x.role_key||'administrator')}</p><p>${x.is_root?'Root • ':''}${x.is_active?'Active':'Inactive'} • ${x.show_on_login?'Shown on login':'Hidden on login'}${x.must_change_password?' • Must change password':''}</p><div class="row-actions"><button class="mini" data-useredit="${escape(x.user_id)}">Edit</button><button class="mini" data-userpass="${escape(x.user_id)}">Reset password</button></div></div>`).join('')}</div>`;
    if($('#new-user'))$('#new-user').onclick=()=>userModal('create',null);
    $$('[data-useredit]').forEach(b=>{b.hidden=!can('users.manage');b.onclick=()=>userModal('update',users.find(x=>x.user_id===b.dataset.useredit))});
    $$('[data-userpass]').forEach(b=>{b.hidden=!can('users.manage');b.onclick=()=>userModal('reset_password',users.find(x=>x.user_id===b.dataset.userpass))});
  }
  function roleOptions(value){return roles.map(r=>`<option value="${escape(r.role_key)}" ${r.role_key===value?'selected':''}>${escape(r.name||r.role_key)}</option>`).join('')}
  function userModal(action,u){
    userDialogTicket++;
    $('#user-modal-title').textContent=action==='create'?'Create administrator':action==='update'?'Edit administrator':'Reset temporary password';
    let body='';
    if(action==='create')body=`<label class="field">Display name<input required id="um-name"></label><label class="field">Login alias<input required id="um-slug" placeholder="first.last"></label><label class="field">Role<select id="um-role">${roleOptions('administrator')}</select></label><label class="field">Temporary password<input required id="um-pass" type="password" autocomplete="new-password" minlength="10"></label><label class="field"><input id="um-show" type="checkbox" checked> Show on login list (where supported)</label>`;
    if(action==='update')body=`<label class="field">Display name<input required id="um-name" value="${escape(u.display_name||'')}"></label><label class="field">Login alias<input value="${escape(u.login_slug||'')}" disabled></label><label class="field">Role<select id="um-role">${roleOptions(u.role_key)}</select></label><label class="field"><input id="um-active" type="checkbox" ${u.is_active?'checked':''}> Active</label><label class="field"><input id="um-show" type="checkbox" ${u.show_on_login?'checked':''}> Show on login list</label>`;
    if(action==='reset_password')body=`<p>Set a temporary password for <b>${escape(u.display_name||u.login_slug)}</b>. They will be flagged to change it.</p><label class="field">Temporary password<input required id="um-pass" type="password" autocomplete="new-password" minlength="10"></label>`;
    $('#user-modal-status').hidden=true;$('#user-modal-body').innerHTML=body;$('#user-modal-save').onclick=()=>saveUserAction(action,u);window.CGAdminUI.openDialog('user-modal');
  }
  function closeUserModal(){userDialogTicket++;window.CGAdminUI?.closeDialog('user-modal')}
  async function edgeUser(body){
    const {data:{session}}=await client.auth.getSession();if(!session)throw new Error('Session expired.');
    const url=cfg.adminUsersFunctionUrl||`${cfg.supabaseUrl.replace(/\/$/,'')}/functions/v1/admin-users`;
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`,'apikey':cfg.supabasePublishableKey},body:JSON.stringify(body)});
    let out={};try{out=await res.json()}catch(_){}
    if(!res.ok||out.error)throw new Error(out.error||`Admin function returned ${res.status}`);return out;
  }
  async function saveUserAction(action,u){
    const b=$('#user-modal-save');if(b.disabled||$$('input,select',$('#user-modal-body')).some(field=>!field.reportValidity()))return;const ticket=renderTicket,dialogTicket=userDialogTicket;b.disabled=true;$('#user-modal-status').hidden=true;
    try{
      let payload={action};
      if(action==='create')payload={...payload,display_name:$('#um-name').value.trim(),login_slug:$('#um-slug').value.trim().toLowerCase().replace(/\s+/g,'.'),role_key:$('#um-role').value,temporary_password:$('#um-pass').value,show_on_login:$('#um-show').checked};
      if(action==='update')payload={...payload,user_id:u.user_id,display_name:$('#um-name').value.trim(),role_key:$('#um-role').value,is_active:$('#um-active').checked,show_on_login:$('#um-show').checked};
      if(action==='reset_password')payload={...payload,user_id:u.user_id,temporary_password:$('#um-pass').value};
      await edgeUser(payload);if(!profile?.is_active||ticket!==renderTicket||dialogTicket!==userDialogTicket)return;closeUserModal();status('User action completed.','ok');userView();
    }catch(e){if(profile?.is_active&&dialogTicket===userDialogTicket&&!$('#user-modal').hidden){$('#user-modal-status').textContent=e.message||'The user could not be saved.';$('#user-modal-status').hidden=false}}finally{b.disabled=false}
  }
  async function accountView(){
    const ticket=++renderTicket;const {data:{user}}=await client.auth.getUser();
    if(ticket!==renderTicket||!profile?.is_active)return;
    $('#content').innerHTML=`<div class="grid2"><div class="panel"><h2>My Account</h2><p><b>${escape(profile.display_name||'Administrator')}</b></p><p>${escape(profile.login_slug||'')} • ${escape(profile.role_key||'')}</p><p>${escape(user?.email||'')}</p><p>${profile.is_root?'Root administrator':''}</p></div><div class="panel"><h2>Change Password</h2><label class="field">New password<input id="self-pass" type="password" autocomplete="new-password" minlength="10"></label><button class="btn primary" id="self-pass-save" style="margin-top:10px">Update password</button><div id="self-pass-status" role="status" aria-live="polite"></div></div></div>`;
    $('#self-pass-save').onclick=async()=>{
      const button=$('#self-pass-save'),feedback=$('#self-pass-status'),input=$('#self-pass');if(button.disabled)return;
      const password=input.value;if(password.length<10){feedback.textContent='Use at least 10 characters.';return}
      button.disabled=true;feedback.textContent='Updating password…';let updated=false;
      try{const {error}=await client.auth.updateUser({password});if(error)throw error;updated=true;const completion=await client.rpc('complete_password_change');if(ticket!==renderTicket||!profile?.is_active)return;input.value='';feedback.textContent=completion.error?'Your password was updated, but account confirmation could not finish. Contact your administrator if necessary.':'Password updated.';if(!completion.error)profile.must_change_password=false;}
      catch(_){if(ticket===renderTicket&&profile?.is_active)feedback.textContent=updated?'Your password was updated, but account confirmation could not finish. Contact your administrator if necessary.':'The password could not be updated. Please try again.';}
      finally{button.disabled=false}
    };
  }
  async function view(key){
    currentView=key;const wasNavigationOpen=window.CGAdminUI?.isNavigationOpen();window.CGAdminUI?.closeNavigation(false);$$('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===key);if(b.dataset.view===key)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    const label=key==='dashboard'?'Overview':key==='guides'?'Insights library':key==='users'?'Users & Access':key==='account'?'My Account':(tableDefs[key]?.label||key);
    $('#view-title').textContent=label;$('#view-subtitle').textContent='Crecer Grande / Workspace';if(wasNavigationOpen)$('#view-title').focus();
    status('');
    if(key==='dashboard')return dashboard();
    if(key==='guides')return guidesView();
    if(key==='users'){if(!(can('users.view')||can('users.manage'))){status('Your role does not have permission to access Users & Access.','bad');return view('dashboard')}return userView();}
    if(key==='account')return accountView();
    if(key==='analytics')return analyticsView();
    if(key==='media')return mediaView();
    if(tableDefs[key])return tableView(key);
  }
  async function boot(){
    try{
      await initClient();
      client.auth.onAuthStateChange(event=>{
        if(event==='SIGNED_OUT'||event==='USER_DELETED')clearWorkspace(signingIn?'Sign-in failed. Check your credentials and administrator access.':'Your session has ended. Sign in again.');
      });
      $('#login-form').addEventListener('submit',login);
      $('#logout-btn').onclick=logout;$('#refresh-btn').onclick=()=>{if(['dashboard','guides'].includes(currentView))guideRecords=null;view(currentView)};$('#drawer-close').onclick=closeDrawer;$('#drawer-cancel').onclick=closeDrawer;$('#drawer-save').onclick=()=>saveDrawer().catch(e=>{const n=$('#drawer-status');if(!$('#drawer').hidden&&profile?.is_active){n.textContent=e.message||'The record could not be saved.';n.hidden=false}});
      $('#user-modal-cancel').onclick=closeUserModal;
      $$('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
      const ticket=authTicket,{data:{session}}=await client.auth.getSession();
      if(session){try{const activeProfile=await loadProfile();await loadPermissions();if(ticket!==authTicket)return;profile=activeProfile;showApp()}catch(e){clearWorkspace('Sign-in failed. Check your administrator access.');await client.auth.signOut()}}
    }catch(e){$('#login-status').textContent=e.message||String(e)}
  }
  window.CGAdminCloseDialog=id=>id==='drawer'?closeDrawer():closeUserModal();
  document.addEventListener('click',e=>{const button=e.target.closest('[data-open-view]');if(button&&!$('#admin-app').hidden)view(button.dataset.openView)});
  document.addEventListener('DOMContentLoaded',boot);
})();
