
(() => {
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const cfg=window.CG_CONFIG||{};
  let client=null, profile=null, roles=[], permissions=new Set(), currentView='dashboard', currentTable=null, tableRows=[], editing=null, creating=false;

  const tableDefs={
    settings:{label:'Website Settings',table:'site_settings',icon:'⚙',preferred:['id','company_name','tagline','email_primary','phone_primary','instagram_url','logo_url','website_version']},
    homepage:{label:'Homepage Content',table:'homepage_content',icon:'⌂',preferred:['id','section_key','title','subtitle','body','published','sort_order']},
    pagecontent:{label:'Page Content',table:'page_content',icon:'▤',preferred:['id','page_key','section_key','title','subtitle','body','published','sort_order']},
    pagetext:{label:'Page Texts',table:'page_texts',pk:'page_key',icon:'T',preferred:['id','page_key','text_key','content','published']},
    divisions:{label:'Divisions',table:'divisions',icon:'◫',preferred:['id','slug','name','title','published','sort_order']},
    projects:{label:'Projects',table:'projects',icon:'◆',preferred:['id','slug','title','name','published','sort_order']},
    resources:{label:'Resources',table:'resources',icon:'▦',preferred:['id','slug','title','name','published','sort_order']},
    products:{label:'Products',table:'products',icon:'▣',preferred:['id','slug','name','title','product_code','manufacturer_part_no','published','stock_status']},
    variants:{label:'Product Variants',table:'product_variants',icon:'◇',preferred:['id','product_id','sku','name','price','gst_rate','published','stock_status']},
    categories:{label:'Product Categories',table:'product_categories',icon:'◈',preferred:['id','slug','name','parent_id','published','sort_order']},
    brands:{label:'Product Brands',table:'product_brands',icon:'B',preferred:['id','slug','name','brand_role','relationship_status','published']},
    media:{label:'Media Assets',table:'media_assets',icon:'▧',preferred:['id','title','name','url','file_url','alt_text','published']},
    enquiries:{label:'Enquiries',table:'enquiries',icon:'✉',preferred:['id','created_at','name','company','phone','email','requirement_type','status']},
    analytics:{label:'Analytics',table:'analytics_events',icon:'↗',preferred:['id','created_at','event_type','page_path','product_slug','division_slug','device_type']},
    audit:{label:'Audit Log',table:'audit_log',icon:'✓',preferred:['id','occurred_at','actor_display_name','actor_username','action','module','record_label']}
  };

  const createDefs={
    products:{slug:'',category:'Industrial Product',title:'',name:'',short_description:'',image_url:'',published:false,featured:false,stock_status:'unknown',rfq_enabled:true,canonical_url:'',seo_title:'',seo_description:''},
    variants:{product_id:'',name:'',sku:'',price:null,published:false,specifications:{}},
    categories:{slug:'',name:'',short_description:'',image_url:'',published:true,sort_order:100},
    brands:{slug:'',name:'',description:'',website_url:'',logo_url:'',published:true,sort_order:100},
    divisions:{slug:'',title:'',name:'',summary:'',description:'',image_url:'',published:false,sort_order:100,bullets:[]},
    projects:{slug:'',title:'',summary:'',details:'',image_url:'',published:false,sort_order:100,tags:[],gallery:[]},
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
    if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey)throw new Error('Public Supabase configuration is missing.');
    client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    window.CG_SUPABASE=client;
  }
  async function loadProfile(){
    const {data:{user}}=await client.auth.getUser(); if(!user)return null;
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
    e.preventDefault(); const b=$('#login-btn');b.disabled=true;$('#login-status').textContent='Signing in…';
    try{
      const email=aliasToEmail($('#login-alias').value),password=$('#login-password').value;
      const {error}=await client.auth.signInWithPassword({email,password}); if(error)throw error;
      profile=await loadProfile(); await loadPermissions(); showApp();
    }catch(err){$('#login-status').textContent=err.message||String(err)}
    finally{b.disabled=false}
  }
  function showApp(){
    $('#login-shell').classList.add('hidden');$('#admin-app').classList.add('open');
    $('#profile-name').textContent=profile.display_name||profile.login_slug||'Administrator';
    $('#profile-role').textContent=(profile.role_key||'administrator')+(profile.is_root?' • Root':'');
    const usersNav=$('[data-view="users"]');
    if(usersNav)usersNav.hidden=!(can('users.view')||can('users.manage'));
    if(profile.must_change_password){status('This account is marked to change its password. Use Account → Change Password.','warn')}
    view('dashboard');
  }
  async function logout(){await client.auth.signOut();location.reload()}
  async function count(table){try{const {count,error}=await client.from(table).select('*',{count:'exact',head:true});return error?null:count}catch(_){return null}}
  async function analyticsSummary(days=30){
    const {data,error}=await client.rpc('get_analytics_summary',{p_days:days});
    if(error)throw error;
    return data||{};
  }
  async function dashboard(){
    const content=$('#content');content.innerHTML='<div class="notice">Loading dashboard…</div>';
    const [prod,enq,proj]=await Promise.all([count('products'),count('enquiries'),count('projects')]);
    let recent=[],summary={};
    try{
      const [recentResult,analytics]=await Promise.all([
        client.from('enquiries').select('*').order('submitted_at',{ascending:false}).limit(8),
        analyticsSummary(30)
      ]);
      recent=recentResult.data||[];summary=analytics||{};
    }catch(_){}
    const topPages=Array.isArray(summary.top_pages)?summary.top_pages:[];
    const max=Math.max(1,...topPages.map(x=>Number(x.count)||0));
    content.innerHTML=`<div class="metric-grid">
      <div class="metric"><span>Products</span><strong>${prod??'—'}</strong><small>Catalogue records</small></div>
      <div class="metric"><span>Enquiries</span><strong>${summary.enquiries??enq??'—'}</strong><small>Last 30 days</small></div>
      <div class="metric"><span>Page Views</span><strong>${summary.page_views??'—'}</strong><small>Last 30 days</small></div>
      <div class="metric"><span>Unique Visitors</span><strong>${summary.unique_visitors??'—'}</strong><small>${summary.sessions??'—'} sessions</small></div></div>
      <div class="grid2 section-gap"><div class="panel"><h3>Recent Enquiries</h3>${recent.length?`<div class="table-shell"><table><thead><tr><th>Name</th><th>Requirement</th><th>Status</th></tr></thead><tbody>${recent.map(x=>`<tr><td>${escape(x.name||'')}</td><td>${escape(x.requirement_type||'')}</td><td><span class="tag">${escape(x.status||'new')}</span></td></tr>`).join('')}</tbody></table></div>`:'<p>No recent enquiries.</p>'}</div>
      <div class="panel"><h3>Top Pages · 30 days</h3><div class="chart-bars">${topPages.length?topPages.map(x=>`<div class="chart-row"><span>${escape(x.page||'/')}</span><div class="chart-track"><div class="chart-fill" style="width:${Math.round((Number(x.count)||0)/max*100)}%"></div></div><b>${Number(x.count)||0}</b></div>`).join(''):'<p>No page-view data yet.</p>'}</div></div></div>`;
  }
  function preferredCols(rows,def){
    if(!rows.length)return def.preferred.slice(0,7);
    const keys=Object.keys(rows[0]),out=[];
    def.preferred.forEach(k=>{if(keys.includes(k)&&!out.includes(k))out.push(k)});
    keys.forEach(k=>{if(out.length<8&&!out.includes(k)&&!['metadata','search_keywords'].includes(k))out.push(k)});
    return out;
  }
  async function tableView(key){
    const def=tableDefs[key];currentTable=def.table;const c=$('#content');
    c.innerHTML='<div class="notice">Loading '+escape(def.label)+'…</div>';
    let result=await client.from(def.table).select('*').limit(150);
    if(result.error){c.innerHTML=`<div class="panel"><h2>${escape(def.label)}</h2><div class="notice bad">${escape(result.error.message)}</div><p>This usually means the current admin role does not have access through RLS, or this table is not present in this Supabase version.</p></div>`;return}
    tableRows=result.data||[];renderTable(key,tableRows);
  }
  function renderTable(key,rows){
    const def=tableDefs[key],cols=preferredCols(rows,def),readonly=readOnlyTables.has(def.table);
    $('#content').innerHTML=`<div class="toolbar"><input id="table-search" type="search" placeholder="Search ${escape(def.label.toLowerCase())}…"><span class="tag">${rows.length} loaded</span><div class="spacer"></div>${createDefs[key]?`<button class="btn primary" id="new-record">New</button>`:''}<button class="btn outline" id="refresh-table">Refresh</button></div>
    <div class="table-shell"><table><thead><tr>${cols.map(c=>`<th>${escape(c)}</th>`).join('')}<th>Actions</th></tr></thead><tbody id="table-body">${renderRows(rows,cols,readonly)}</tbody></table></div>`;
    $('#table-search').addEventListener('input',e=>{const q=e.target.value.toLowerCase();renderTableBody(rows.filter(x=>JSON.stringify(x).toLowerCase().includes(q)),cols,readonly)});
    $('#refresh-table').onclick=()=>tableView(key);if($('#new-record'))$('#new-record').onclick=()=>openCreateDrawer(key);bindRowActions(readonly);
  }
  function renderRows(rows,cols,readonly){
    return rows.map((r,i)=>`<tr data-row="${i}">${cols.map(c=>`<td>${escape(fmt(r[c]))}</td>`).join('')}<td><div class="row-actions"><button class="mini" data-viewrow="${i}">View</button>${readonly?'':`<button class="mini" data-editrow="${i}">Edit</button>`}${currentTable==='enquiries'&&'status' in r?`<button class="mini" data-statusrow="${i}">Status</button>`:''}</div></td></tr>`).join('');
  }
  function renderTableBody(rows,cols,readonly){$('#table-body').innerHTML=renderRows(rows,cols,readonly);tableRows=rows;bindRowActions(readonly)}
  function bindRowActions(readonly){
    $$('[data-viewrow]').forEach(b=>b.onclick=()=>openDrawer(tableRows[+b.dataset.viewrow],true));
    if(!readonly)$$('[data-editrow]').forEach(b=>b.onclick=()=>openDrawer(tableRows[+b.dataset.editrow],false));
    $$('[data-statusrow]').forEach(b=>b.onclick=()=>quickStatus(tableRows[+b.dataset.statusrow]));
  }
  function fieldInput(k,v,ro){
    const isObject=v&&typeof v==='object';
    const val=isObject?JSON.stringify(v,null,2):v==null?'':String(v);
    const disabled=ro||noEdit.has(k);
    if(typeof v==='boolean'&&!disabled)return `<div class="edit-field"><label>${escape(k)}</label><select data-field="${escape(k)}"><option value="true" ${v?'selected':''}>true</option><option value="false" ${!v?'selected':''}>false</option></select></div>`;
    const wide=isObject||val.length>100||/body|description|notes|metadata|keywords|content/i.test(k);
    return `<div class="edit-field ${wide?'wide':''}"><label>${escape(k)}</label>${wide?`<textarea ${disabled?'disabled class="readonly"':''} data-field="${escape(k)}">${escape(val)}</textarea>`:`<input ${disabled?'disabled class="readonly"':''} data-field="${escape(k)}" value="${escape(val)}">`}</div>`;
  }
  function openCreateDrawer(key){
    currentTable=tableDefs[key].table;creating=true;editing=structuredClone(createDefs[key]);
    $('#drawer-title').textContent='Create '+tableDefs[key].label.replace(/s$/,'');
    $('#drawer-body').innerHTML='<div class="edit-grid">'+Object.entries(editing).map(([k,v])=>fieldInput(k,v,false)).join('')+'</div>';
    $('#drawer-save').hidden=false;$('#drawer').classList.add('open');
  }
  function openDrawer(row,viewOnly){
    creating=false;editing=row;$('#drawer-title').textContent=(viewOnly?'View ':'Edit ')+(currentTable||'record');
    $('#drawer-body').innerHTML='<div class="edit-grid">'+Object.entries(row).map(([k,v])=>fieldInput(k,v,viewOnly)).join('')+'</div>';
    $('#drawer-save').hidden=viewOnly;$('#drawer').classList.add('open');
  }
  function closeDrawer(){$('#drawer').classList.remove('open');editing=null;creating=false}
  async function saveDrawer(){
    if(!editing)return;const patch={};
    $$('[data-field]',$('#drawer-body')).forEach(el=>{
      const k=el.dataset.field;if(noEdit.has(k)&&!creating)return;
      const old=editing[k];let v=el.value;
      if(typeof old==='boolean')v=v==='true';
      else if(typeof old==='number'&&v!=='')v=Number(v);
      else if(old&&typeof old==='object'){try{v=JSON.parse(v||(/\[/.test(JSON.stringify(old))?'[]':'{}'))}catch(_){throw new Error(`${k} must be valid JSON`)}} else if(v==='')v=null;
      if(creating||JSON.stringify(v)!==JSON.stringify(old))patch[k]=v;
    });
    Object.keys(patch).forEach(k=>{if(patch[k]===null&&creating)delete patch[k]});
    if(creating&&currentTable==='products'){
      patch.slug=String(patch.slug||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      patch.title=String(patch.title||patch.name||'').trim();
      patch.name=String(patch.name||patch.title||'').trim();
      if(!patch.slug||!patch.title||!patch.category)throw new Error('Product slug, title/name and category are required.');
      patch.seo_title=patch.seo_title||patch.title;
      patch.seo_description=patch.seo_description||String(patch.short_description||'').slice(0,160)||'Industrial product requirement available from Crecer Grande.';
      patch.canonical_url=patch.canonical_url||`${location.origin.replace('/admin','')}/products/product-detail.html?slug=${encodeURIComponent(patch.slug)}`;
    }
    if(creating&&['divisions','projects','product_categories','product_brands'].includes(currentTable)){
      if(patch.slug)patch.slug=String(patch.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    }
    if(creating&&currentTable==='divisions'&&(!patch.slug||!patch.title))throw new Error('Division slug and title are required.');
    if(creating&&currentTable==='projects'&&(!patch.slug||!patch.title))throw new Error('Project slug and title are required.');
    if(creating&&currentTable==='product_categories'&&(!patch.slug||!patch.name))throw new Error('Category slug and name are required.');
    if(creating&&currentTable==='product_brands'&&(!patch.slug||!patch.name))throw new Error('Brand slug and name are required.');
    if(creating&&currentTable==='product_variants'&&(!patch.product_id||!patch.name))throw new Error('Product ID and variant name are required.');
    if(creating&&currentTable==='resources'&&!patch.title)throw new Error('Resource title is required.');
    if(creating&&currentTable==='page_content'&&(!patch.page_slug||!patch.page_name))throw new Error('Page slug and page name are required.');
    if(creating&&currentTable==='page_texts'&&!patch.page_key)throw new Error('Page key is required.');
    $('#drawer-save').disabled=true;
    try{
      if(creating){
        const {data,error}=await client.from(currentTable).insert(patch).select().maybeSingle();if(error)throw error;
        try{await client.rpc('log_admin_event',{p_action:'CREATE',p_module:currentTable,p_record_id:String(data?.id||data?.page_key||''),p_record_label:data?.name||data?.title||data?.slug||data?.page_key||'',p_metadata:{fields:Object.keys(patch)}})}catch(_){}
        closeDrawer();status('Created '+currentTable+' record.','ok');
      }else{
        if(!Object.keys(patch).length){closeDrawer();return}
        const def=Object.values(tableDefs).find(x=>x.table===currentTable)||{};
        const idKey=def.pk||('id' in editing?'id':null);if(!idKey)throw new Error('This row has no editable primary key.');
        if('updated_at' in editing)patch.updated_at=new Date().toISOString();const {error}=await client.from(currentTable).update(patch).eq(idKey,editing[idKey]);if(error)throw error;
        try{await client.rpc('log_admin_event',{p_action:'UPDATE',p_module:currentTable,p_record_id:String(editing[idKey]),p_record_label:editing.name||editing.title||editing.slug||String(editing[idKey]),p_metadata:{fields:Object.keys(patch)}})}catch(_){}
        closeDrawer();status('Saved '+currentTable+' record.','ok');
      }
      const key=Object.keys(tableDefs).find(k=>tableDefs[k].table===currentTable);if(key)tableView(key);
    }finally{$('#drawer-save').disabled=false}
  }
  async function quickStatus(row){
    const next=prompt('Set enquiry status:',row.status||'new');if(!next||next===row.status)return;
    const {error}=await client.from('enquiries').update({status:next}).eq('id',row.id);if(error)status(error.message,'bad');else{status('Enquiry status updated.','ok');tableView('enquiries')}
  }
  async function mediaView(){
    currentTable='media_assets';const c=$('#content');c.innerHTML='<div class="notice">Loading media library…</div>';
    const {data,error}=await client.from('media_assets').select('*').order('created_at',{ascending:false}).limit(200);
    if(error){c.innerHTML=`<div class="notice bad">${escape(error.message)}</div>`;return}
    const rows=data||[];
    c.innerHTML=`<div class="toolbar"><label class="btn primary" style="cursor:pointer">Upload Media<input id="media-upload" type="file" accept="image/*,.pdf" hidden></label><span class="tag">${rows.length} assets</span><div class="spacer"></div><button class="btn outline" id="refresh-media">Refresh</button></div>
    <div class="user-grid">${rows.length?rows.map(x=>`<div class="user-card"><h3>${escape(x.title||x.storage_path)}</h3><p>${escape(x.kind||'file')}</p><p><a href="${escape(x.public_url)}" target="_blank" rel="noopener">Open asset ↗</a></p><div class="row-actions"><button class="mini" data-copyurl="${escape(x.public_url)}">Copy URL</button></div></div>`).join(''):'<div class="notice">No media assets yet. Use Upload Media to add the first one.</div>'}</div>`;
    $('#refresh-media').onclick=mediaView;
    $('#media-upload').onchange=async(e)=>{
      const file=e.target.files?.[0];if(!file)return;
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
    $('[data-copyurl]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copyurl);status('Media URL copied.','ok')}catch(_){status('Copy unavailable.','bad')}});
  }
  async function analyticsView(){
    const c=$('#content');c.innerHTML='<div class="notice">Loading analytics…</div>';
    try{
      const s=await analyticsSummary(30);
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
        <div class="panel"><h3>Top Pages</h3>${pages.length?`<div class="table-shell"><table><thead><tr><th>Page</th><th>Views</th></tr></thead><tbody>${pages.map(x=>`<tr><td>${escape(x.page||'/')}</td><td>${Number(x.count)||0}</td></tr>`).join('')}</tbody></table></div>`:'<p>No page data yet.</p>'}</div>
        <div class="panel"><h3>Top Sources</h3>${sources.length?`<div class="table-shell"><table><thead><tr><th>Source</th><th>Events</th></tr></thead><tbody>${sources.map(x=>`<tr><td>${escape(x.source||'Direct / Unknown')}</td><td>${Number(x.count)||0}</td></tr>`).join('')}</tbody></table></div>`:'<p>No source data yet.</p>'}</div>
      </div>
      <div class="panel section-gap"><h3>Recent Visitors</h3>${visitors.length?`<div class="table-shell"><table><thead><tr><th>Visitor</th><th>Page Views</th><th>Source</th><th>Last Seen</th></tr></thead><tbody>${visitors.map(x=>`<tr><td>${escape(String(x.visitor_id||'').slice(0,12))}…</td><td>${Number(x.page_views)||0}</td><td>${escape(x.source||'Direct / Unknown')}</td><td>${escape(x.last_seen||'')}</td></tr>`).join('')}</tbody></table></div>`:'<p>No recent visitor data.</p>'}</div>`;
    }catch(e){c.innerHTML=`<div class="notice bad">${escape(e.message||String(e))}</div>`}
  }
  async function userView(){
    const c=$('#content');
    if(!(can('users.view')||can('users.manage'))){c.innerHTML='<div class="notice bad">Your role does not have permission to manage users.</div>';return}
    c.innerHTML='<div class="notice">Loading users and roles…</div>';
    const [u,r]=await Promise.all([client.from('user_profiles').select('*').order('display_name'),client.from('app_roles').select('*')]);
    if(u.error){c.innerHTML=`<div class="notice bad">${escape(u.error.message)}</div>`;return}
    roles=r.data||[];const users=u.data||[];
    c.innerHTML=`<div class="toolbar">${can('users.manage')?'<button class="btn primary" id="new-user">Create User</button>':''}<span class="tag">${users.length} profiles</span><div class="spacer"></div><span class="tag">Privileged auth actions run through Edge Function</span></div><div class="user-grid">${users.map(x=>`<div class="user-card"><h3>${escape(x.display_name||x.login_slug||'User')}</h3><p>${escape(x.login_slug||'')} • ${escape(x.role_key||'administrator')}</p><p>${x.is_root?'Root • ':''}${x.is_active?'Active':'Inactive'} • ${x.show_on_login?'Shown on login':'Hidden on login'}${x.must_change_password?' • Must change password':''}</p><div class="row-actions"><button class="mini" data-useredit="${escape(x.user_id)}">Edit</button><button class="mini" data-userpass="${escape(x.user_id)}">Reset password</button></div></div>`).join('')}</div>`;
    if($('#new-user'))$('#new-user').onclick=()=>userModal('create',null);
    $('[data-useredit]').forEach(b=>{b.hidden=!can('users.manage');b.onclick=()=>userModal('update',users.find(x=>x.user_id===b.dataset.useredit))});
    $('[data-userpass]').forEach(b=>{b.hidden=!can('users.manage');b.onclick=()=>userModal('reset_password',users.find(x=>x.user_id===b.dataset.userpass))});
  }
  function roleOptions(value){return roles.map(r=>`<option value="${escape(r.role_key)}" ${r.role_key===value?'selected':''}>${escape(r.name||r.role_key)}</option>`).join('')}
  function userModal(action,u){
    $('#user-modal-title').textContent=action==='create'?'Create administrator':action==='update'?'Edit administrator':'Reset temporary password';
    let body='';
    if(action==='create')body=`<label class="field">Display name<input id="um-name"></label><label class="field">Login alias<input id="um-slug" placeholder="first.last"></label><label class="field">Role<select id="um-role">${roleOptions('administrator')}</select></label><label class="field">Temporary password<input id="um-pass" type="password" minlength="10"></label><label class="field"><input id="um-show" type="checkbox" checked> Show on login list (where supported)</label>`;
    if(action==='update')body=`<label class="field">Display name<input id="um-name" value="${escape(u.display_name||'')}"></label><label class="field">Login alias<input value="${escape(u.login_slug||'')}" disabled></label><label class="field">Role<select id="um-role">${roleOptions(u.role_key)}</select></label><label class="field"><input id="um-active" type="checkbox" ${u.is_active?'checked':''}> Active</label><label class="field"><input id="um-show" type="checkbox" ${u.show_on_login?'checked':''}> Show on login list</label>`;
    if(action==='reset_password')body=`<p>Set a temporary password for <b>${escape(u.display_name||u.login_slug)}</b>. They will be flagged to change it.</p><label class="field">Temporary password<input id="um-pass" type="password" minlength="10"></label>`;
    $('#user-modal-body').innerHTML=body;$('#user-modal-save').onclick=()=>saveUserAction(action,u);$('#user-modal').classList.add('open');
  }
  function closeUserModal(){$('#user-modal').classList.remove('open')}
  async function edgeUser(body){
    const {data:{session}}=await client.auth.getSession();if(!session)throw new Error('Session expired.');
    const url=cfg.adminUsersFunctionUrl||`${cfg.supabaseUrl.replace(/\/$/,'')}/functions/v1/admin-users`;
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`,'apikey':cfg.supabasePublishableKey},body:JSON.stringify(body)});
    let out={};try{out=await res.json()}catch(_){}
    if(!res.ok||out.error)throw new Error(out.error||`Admin function returned ${res.status}`);return out;
  }
  async function saveUserAction(action,u){
    const b=$('#user-modal-save');b.disabled=true;
    try{
      let payload={action};
      if(action==='create')payload={...payload,display_name:$('#um-name').value.trim(),login_slug:$('#um-slug').value.trim().toLowerCase().replace(/\s+/g,'.'),role_key:$('#um-role').value,temporary_password:$('#um-pass').value,show_on_login:$('#um-show').checked};
      if(action==='update')payload={...payload,user_id:u.user_id,display_name:$('#um-name').value.trim(),role_key:$('#um-role').value,is_active:$('#um-active').checked,show_on_login:$('#um-show').checked};
      if(action==='reset_password')payload={...payload,user_id:u.user_id,temporary_password:$('#um-pass').value};
      await edgeUser(payload);closeUserModal();status('User action completed.','ok');userView();
    }catch(e){status(e.message||String(e),'bad')}finally{b.disabled=false}
  }
  async function accountView(){
    const {data:{user}}=await client.auth.getUser();
    $('#content').innerHTML=`<div class="grid2"><div class="panel"><h2>My Account</h2><p><b>${escape(profile.display_name||'Administrator')}</b></p><p>${escape(profile.login_slug||'')} • ${escape(profile.role_key||'')}</p><p>${escape(user?.email||'')}</p><p>${profile.is_root?'Root administrator':''}</p></div><div class="panel"><h2>Change Password</h2><label class="field">New password<input id="self-pass" type="password" minlength="10"></label><button class="btn primary" id="self-pass-save" style="margin-top:10px">Update password</button><div id="self-pass-status"></div></div></div>`;
    $('#self-pass-save').onclick=async()=>{const p=$('#self-pass').value;if(p.length<10){$('#self-pass-status').textContent='Use at least 10 characters.';return}const {error}=await client.auth.updateUser({password:p});$('#self-pass-status').textContent=error?error.message:'Password updated.'};
  }
  async function view(key){
    currentView=key;$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===key));
    const label=key==='dashboard'?'Dashboard':key==='users'?'Users & Access':key==='account'?'My Account':(tableDefs[key]?.label||key);
    $('#view-title').textContent=label;$('#view-subtitle').textContent='Crecer Grande Website Manager V2.9.3';
    status('');
    if(key==='dashboard')return dashboard();
    if(key==='users'){if(!(can('users.view')||can('users.manage'))){status('Your role does not have permission to access Users & Access.','bad');return view('dashboard')}return userView();}
    if(key==='account')return accountView();
    if(key==='analytics')return analyticsView();
    if(key==='media')return mediaView();
    if(tableDefs[key])return tableView(key);
  }
  async function boot(){
    try{
      await initClient();
      $('#login-form').addEventListener('submit',login);
      $('#logout-btn').onclick=logout;$('#refresh-btn').onclick=()=>view(currentView);$('#drawer-close').onclick=closeDrawer;$('#drawer-cancel').onclick=closeDrawer;$('#drawer-save').onclick=()=>saveDrawer().catch(e=>status(e.message,'bad'));
      $('#user-modal-cancel').onclick=closeUserModal;
      $$('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
      const {data:{session}}=await client.auth.getSession();
      if(session){try{profile=await loadProfile();await loadPermissions();showApp()}catch(e){await client.auth.signOut();$('#login-status').textContent=e.message}}
    }catch(e){$('#login-status').textContent=e.message||String(e)}
  }
  document.addEventListener('DOMContentLoaded',boot);
})();
