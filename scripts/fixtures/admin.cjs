// Isolated local test SDK. Never imported by the production admin interface.
module.exports=function fixture(options={}){return `(()=>{
 const options=${JSON.stringify(options)};
 const calls=window.__adminCalls={writes:[],reads:[],auth:[]};
 let signedIn=Boolean(options.session)&&sessionStorage.getItem('admin-demo-signed-out')!=='1',listener=()=>{};
 const data={
 user_profiles:[{user_id:'demo-admin',display_name:'Demo Administrator',login_slug:'demo.admin',role_key:'administrator',is_root:true,is_active:options.active!==false,must_change_password:false}],
 enquiries:[{id:'sample-01',name:'Sample enquiry 01',company:'Example Engineering',email:'sample@example.test',requirement_type:'CAD drawing review',status:'new',submitted_at:'2026-10-21T10:00:00Z'},{id:'sample-02',name:'Sample enquiry 02',company:'Example Components',email:'sample2@example.test',requirement_type:'Replacement component',status:'reviewing',submitted_at:'2026-10-20T10:00:00Z'},{id:'sample-03',name:'Sample enquiry 03',company:'Example Manufacturing',email:'sample3@example.test',requirement_type:'Machine maintenance',status:'quoted',submitted_at:'2026-10-19T10:00:00Z'}],
 site_settings:[{id:'main',company_name:'Crecer Grande',tagline:'Engineering services',email_primary:'sample@example.test'}],
 resources:[{id:'resource-01',title:'Sample resource record',resource_type:'article',file_url:'/insights/gdt-datum-basics.html',published:false,sort_order:1}],
 homepage_content:[{id:'main',title:'Website homepage',hero_line1:'CAD drawings, custom parts',published:true}],
 page_content:[{id:'page-01',page_slug:'about',page_name:'About',title:'Engineering from Kolkata',intro:'Sample editable copy',published:true}],
 page_texts:[{page_key:'contact',title:'Contact Us',intro:'Send your requirement'}],
 divisions:[{id:'division-01',slug:'engineering-design',name:'Engineering & Design',published:true}],
 media_assets:[{id:'media-01',title:'CAD engineering illustration',storage_path:'sample/illustration.webp',public_url:'/assets/images/generated/02-engineering-and-cad.webp',kind:'image'}],
 app_roles:[{role_key:'administrator',name:'Administrator'}],audit_log:[]};
 function from(table){let operation='select',payload=null,head=false,filters=[],limit=150;
 const query={select(columns,opts){head=!!opts?.head;return query},order(){return query},eq(k,v){filters.push([k,v]);return query},limit(n){limit=n;return query},insert(v){operation='insert';payload=v;return query},update(v){operation='update';payload=v;return query},async maybeSingle(){return result(true)},then(resolve,reject){return result(false).then(resolve,reject)}};
 async function result(single){if(options.delay)await new Promise(r=>setTimeout(r,options.delay));if(operation!=='select'){calls.writes.push({table,operation,payload});if(options.failSave)return{data:null,error:{message:'Controlled save failure'}}}else calls.reads.push(table);let rows=(data[table]||[]).filter(r=>filters.every(([k,v])=>r[k]===v)).slice(0,limit);if(operation==='insert')rows=[{id:'created-sample',...payload}];return{data:head?null:single?(rows[0]||null):rows,error:null,count:table==='enquiries'?12:rows.length}}
 return query}
 window.CG_CONFIG={supabaseUrl:'https://admin-preview.invalid',supabasePublishableKey:'local-preview',adminAuthDomain:'admin.example.test'};
 window.supabase={createClient:()=>({
 from,
 auth:{
 onAuthStateChange:fn=>{listener=fn;window.__adminAuthEvent=fn},
 getSession:async()=>({data:{session:signedIn?{access_token:'local-preview-token'}:null},error:null}),
 getUser:async()=>({data:{user:signedIn?{id:'demo-admin',email:'demo@example.test'}:null},error:null}),
 signInWithPassword:async()=>{calls.auth.push('signIn');if(options.failLogin)return{error:{message:'Sign-in rejected for test'}};signedIn=true;sessionStorage.removeItem('admin-demo-signed-out');return{error:null}},
 signOut:async()=>{calls.auth.push('signOut');signedIn=false;sessionStorage.setItem('admin-demo-signed-out','1');listener('SIGNED_OUT');return{error:null}},
 updateUser:async()=>{calls.auth.push('updateUser');return{error:null}}
 },
 rpc:async(name,args)=>{if(name==='get_my_permissions')return{data:[{permission_key:'users.view',allowed:true},{permission_key:'users.manage',allowed:true}],error:null};if(name==='get_analytics_summary')return{data:{page_views:1640,unique_visitors:389,sessions:462,enquiries:12,whatsapp_clicks:18,top_pages:[{page:'/services.html',count:380},{page:'/contact.html',count:260},{page:'/insights.html',count:210}],top_sources:[{source:'Direct',count:200},{source:'Google',count:180}],recent_visitors:[]},error:null};calls.writes.push({rpc:name,args});return{data:[],error:null}},
 storage:{from:()=>({upload:async()=>{calls.writes.push({storage:'upload'});return{error:null}},getPublicUrl:()=>({data:{publicUrl:'/assets/images/generated/02-engineering-and-cad.webp'}})})}
 })};
 })();`};
