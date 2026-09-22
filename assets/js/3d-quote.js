
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $=s=>document.querySelector(s);
const fileEl=$('#q3-file'),drop=$('#q3-drop'),viewer=$('#q3-viewer'),fileMeta=$('#q3-file-meta'),fileState=$('#q3-file-state');
const unitEl=$('#q3-unit'),processEl=$('#q3-process'),materialEl=$('#q3-material'),layerEl=$('#q3-layer'),infillEl=$('#q3-infill'),qtyEl=$('#q3-qty'),complexityEl=$('#q3-complexity'),colorEl=$('#q3-color');
const supportEl=$('#q3-support'),insertEl=$('#q3-inserts'),insertQtyEl=$('#q3-insert-qty'),finishEl=$('#q3-finish'),inspectionEl=$('#q3-inspection'),toleranceEl=$('#q3-tolerance'),applicationEl=$('#q3-application'),notesEl=$('#q3-notes');
const priceEl=$('#q3-price'),breakdown=$('#q3-breakdown'),submitBtn=$('#q3-submit'),copyBtn=$('#q3-copy'),submitStatus=$('#q3-submit-status');
const nameEl=$('#q3-name'),companyEl=$('#q3-company'),phoneEl=$('#q3-phone'),emailEl=$('#q3-email'),locationEl=$('#q3-location');
const metrics={x:$('#q3-x'),y:$('#q3-y'),z:$('#q3-z'),volume:$('#q3-volume'),area:$('#q3-area'),triangles:$('#q3-triangles')};
const alerts=$('#q3-alerts');

let materials=[],processes=[],pricing={},scene,camera,renderer,controls,modelRoot=null;
let current={file:null,ext:'',object:null,volume:0,area:0,triangles:0,x:0,y:0,z:0,estimate:null,instant:false};

const allowed=new Set(['stl','obj','3mf','step','stp','ste','igs','iges','x_t','x_b','sldprt','ipt','prt','catpart','jt','sat','dwg','dxf','zip']);
const meshExt=new Set(['stl','obj']);
const MAX_DEFAULT=50*1024*1024;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=n=>String(n||'file').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-180);
const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;

async function boot(){
  try{
    [materials,processes,pricing]=await Promise.all([
      fetch('/assets/data/3d-materials.json',{cache:'no-store'}).then(r=>r.json()),
      fetch('/assets/data/3d-processes.json',{cache:'no-store'}).then(r=>r.json()),
      fetch('/assets/data/3d-pricing.json',{cache:'no-store'}).then(r=>r.json())
    ]);
  }catch(e){fileState.textContent='The 3D configuration data could not be loaded.';fileState.className='q3-state error'}
  initViewer();fillProcesses();applyUrlPreset();renderMaterialAdvisor();
  fileEl.addEventListener('change',()=>handleFile(fileEl.files[0]));
  ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('drag')}));
  ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('drag')}));
  drop.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)handleFile(f)});
  unitEl.addEventListener('change',()=>{if(current.file&&meshExt.has(current.ext))parsePreview(current.file)});
  processEl.addEventListener('change',()=>{fillMaterials();fillProcessOptions();calculate();renderMaterialAdvisor()});
  materialEl.addEventListener('change',()=>{fillColors();calculate();renderMaterialAdvisor()});
  [layerEl,infillEl,qtyEl,complexityEl,colorEl,supportEl,insertEl,insertQtyEl,finishEl,inspectionEl,toleranceEl,applicationEl].forEach(el=>el.addEventListener('change',calculate));
  [qtyEl,insertQtyEl].forEach(el=>el.addEventListener('input',calculate));
  submitBtn.addEventListener('click',submitRequirement);
  copyBtn.addEventListener('click',copySummary);
}
function initViewer(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x071a36);
  camera=new THREE.PerspectiveCamera(43,1,.1,20000);camera.position.set(110,90,130);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});viewer.innerHTML='';viewer.appendChild(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=true;
  scene.add(new THREE.HemisphereLight(0xffffff,0x193858,2.3));
  const a=new THREE.DirectionalLight(0xffffff,2.5);a.position.set(110,160,90);scene.add(a);
  const b=new THREE.DirectionalLight(0x8fcaff,1.2);b.position.set(-90,45,-70);scene.add(b);
  scene.add(new THREE.GridHelper(320,32,0x45698d,0x183956));
  const resize=()=>{const r=viewer.getBoundingClientRect();renderer.setSize(Math.max(10,r.width),Math.max(10,r.height),false);camera.aspect=r.width/Math.max(10,r.height);camera.updateProjectionMatrix()};
  resize();addEventListener('resize',resize);(function anim(){requestAnimationFrame(anim);controls.update();renderer.render(scene,camera)})();
}
function fillProcesses(){
  processEl.innerHTML=processes.map(p=>`<option value="${p.id}">${esc(p.name)}${p.quote_mode==='rfq'?' — RFQ':''}</option>`).join('');
  fillMaterials();fillProcessOptions();
}
function fillMaterials(){
  const rows=materials.filter(m=>m.process===processEl.value);
  materialEl.innerHTML=rows.map(m=>`<option value="${m.id}">${esc(m.name)}${m.availability==='rfq'?' — RFQ':''}</option>`).join('')||'<option value="">Engineering review</option>';
  fillColors();
}
function fillColors(){
  const m=chosenMaterial();colorEl.innerHTML=(m?.colors||['Confirm during review']).map(c=>`<option>${esc(c)}</option>`).join('');
}
function fillProcessOptions(){
  const p=processEl.value;
  if(p==='fdm'){
    layerEl.disabled=false;layerEl.innerHTML='<option value="0.28">0.28 mm — Economy</option><option value="0.20" selected>0.20 mm — Standard</option><option value="0.16">0.16 mm — Fine</option><option value="0.12">0.12 mm — Extra fine</option>';
    infillEl.disabled=false;
  }else if(p==='resin'){
    layerEl.disabled=false;layerEl.innerHTML='<option value="0.10">0.10 mm — Fast</option><option value="0.05" selected>0.05 mm — Standard</option><option value="0.025">0.025 mm — Fine</option>';
    infillEl.disabled=true;infillEl.value='100';
  }else{
    layerEl.disabled=true;layerEl.innerHTML='<option>Engineering review</option>';infillEl.disabled=true;infillEl.value='100';
  }
}
function applyUrlPreset(){
  const q=new URLSearchParams(location.search),p=q.get('process'),m=q.get('material');
  if(p&&[...processEl.options].some(o=>o.value===p)){processEl.value=p;fillMaterials();fillProcessOptions()}
  if(m&&[...materialEl.options].some(o=>o.value===m)){materialEl.value=m;fillColors()}
}
function unitScale(){
  return unitEl.value==='inch'?25.4:unitEl.value==='cm'?10:1;
}
function setRoot(obj){
  if(modelRoot){scene.remove(modelRoot);disposeObject(modelRoot)}
  modelRoot=obj;scene.add(obj);analyseObject(obj);
}
function disposeObject(obj){obj.traverse(x=>{if(x.geometry)x.geometry.dispose?.();if(x.material){if(Array.isArray(x.material))x.material.forEach(m=>m.dispose?.());else x.material.dispose?.()}})}
function prepareMaterial(obj){
  obj.traverse(x=>{if(x.isMesh)x.material=new THREE.MeshStandardMaterial({color:0xd4dee9,metalness:.42,roughness:.30,side:THREE.DoubleSide})});
}
function analyseObject(obj){
  obj.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(obj),size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);
  current.x=size.x;current.y=size.y;current.z=size.z;
  let volume=0,area=0,triangles=0;
  const va=new THREE.Vector3(),vb=new THREE.Vector3(),vc=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3(),cross=new THREE.Vector3();
  obj.traverse(mesh=>{
    if(!mesh.isMesh||!mesh.geometry?.attributes?.position)return;
    const g=mesh.geometry,pos=g.attributes.position,idx=g.index;
    const triCount=idx?idx.count/3:pos.count/3;triangles+=triCount;
    const read=(i,v)=>v.fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld);
    for(let t=0;t<triCount;t++){
      const ia=idx?idx.getX(t*3):t*3,ib=idx?idx.getX(t*3+1):t*3+1,ic=idx?idx.getX(t*3+2):t*3+2;
      read(ia,va);read(ib,vb);read(ic,vc);
      volume+=va.dot(vb.clone().cross(vc))/6;
      ab.subVectors(vb,va);ac.subVectors(vc,va);cross.crossVectors(ab,ac);area+=cross.length()/2;
    }
  });
  current.volume=Math.abs(volume)/1000; // mm³ -> cm³
  current.area=area/100; // mm² -> cm²
  current.triangles=Math.round(triangles);
  Object.entries({x:size.x,y:size.y,z:size.z,volume:current.volume,area:current.area,triangles:current.triangles}).forEach(([k,v])=>{
    metrics[k].textContent=k==='triangles'?Number(v).toLocaleString('en-IN'):Number(v).toFixed(k==='volume'||k==='area'?2:1);
  });
  obj.position.sub(center);
  const max=Math.max(size.x,size.y,size.z)||100;camera.position.set(max*1.45,max*1.15,max*1.55);controls.target.set(0,0,0);controls.update();
  current.instant=true;renderAlerts();calculate();
}
function renderAlerts(){
  const notes=[];
  if(!current.volume||current.volume<0.001)notes.push(['warn','Enclosed volume is near zero. The mesh may be open/non-watertight or may use unexpected units.']);
  if(Math.max(current.x,current.y,current.z)>1000)notes.push(['warn','The model is larger than 1000 mm on at least one axis. Check the mesh unit before using the estimate.']);
  if(Math.min(current.x,current.y,current.z)>0&&Math.min(current.x,current.y,current.z)<0.4)notes.push(['warn','A very thin overall dimension is detected. Thin features should be reviewed for the selected process.']);
  if(current.triangles>1500000)notes.push(['','This is a high-resolution mesh. It may be larger than necessary for quoting/printing.']);
  notes.push(['','Geometry values are calculated from the uploaded mesh. They are not a full manufacturability or slicer analysis.']);
  alerts.innerHTML=notes.map(n=>`<div class="model-alert ${n[0]}">${esc(n[1])}</div>`).join('');
}
async function handleFile(f){
  if(!f)return;
  const max=(pricing.max_upload_mb||50)*1024*1024,ext=(f.name.split('.').pop()||'').toLowerCase();
  if(!allowed.has(ext)){fileState.textContent='This file type is not in the current CG intake list. Use STEP/STP/STL/OBJ/3MF or a supported CAD format.';fileState.className='q3-state error';return}
  if(f.size>max){fileState.textContent=`File exceeds the current ${pricing.max_upload_mb||50} MB website upload limit.`;fileState.className='q3-state error';return}
  current={...current,file:f,ext,object:null,volume:0,area:0,triangles:0,x:0,y:0,z:0,estimate:null,instant:false};
  fileMeta.innerHTML=`<b>${esc(f.name)}</b><span>${(f.size/1024/1024).toFixed(2)} MB · ${ext.toUpperCase()}</span>`;
  submitBtn.disabled=false;
  unitEl.closest('label').style.display=meshExt.has(ext)?'block':'none';
  if(['stl','obj','3mf'].includes(ext)){await parsePreview(f)}
  else{
    clearMetrics();fileState.textContent='CAD file accepted for engineering review. This format is not converted in-browser; the original file will be attached when you submit.';fileState.className='q3-state ok';
    priceEl.textContent='Engineering RFQ';breakdown.innerHTML=`<div><span>Route</span><b>CAD engineering review</b></div><div><span>File</span><b>${esc(f.name)}</b></div><div><span>Original geometry</span><b>Preserved for review</b></div>`;
  }
}
function clearMetrics(){Object.values(metrics).forEach(x=>x.textContent='—');alerts.innerHTML=''}
async function parsePreview(f){
  fileState.textContent='Analysing model locally in your browser…';fileState.className='q3-state';current.instant=false;
  try{
    let obj;
    if(current.ext==='stl'){
      const buf=await f.arrayBuffer(),g=new STLLoader().parse(buf);g.scale(unitScale(),unitScale(),unitScale());obj=new THREE.Mesh(g);
    }else if(current.ext==='obj'){
      const txt=await f.text();obj=new OBJLoader().parse(txt);obj.scale.setScalar(unitScale());
    }else{
      const buf=await f.arrayBuffer();obj=new ThreeMFLoader().parse(buf);
    }
    prepareMaterial(obj);setRoot(obj);
    fileState.textContent=`${current.ext.toUpperCase()} geometry analysed locally. Configure the manufacturing assumptions below.`;fileState.className='q3-state ok';
  }catch(e){
    clearMetrics();fileState.textContent='The browser could not calculate this mesh reliably. It can still be submitted for engineering review.';fileState.className='q3-state warn';priceEl.textContent='Engineering RFQ';
  }
}
function chosenMaterial(){return materials.find(m=>m.id===materialEl.value)}
function processInfo(){return processes.find(p=>p.id===processEl.value)}
function calculate(){
  const p=processInfo(),m=chosenMaterial(),q=Math.max(1,Number(qtyEl.value)||1);
  if(!current.file){priceEl.textContent='₹ —';return}
  if(!current.instant||!m||p?.quote_mode==='rfq'||m.availability==='rfq'){
    current.estimate={route:'rfq',quantity:q};
    priceEl.textContent='Engineering RFQ';
    breakdown.innerHTML=`<div><span>Process</span><b>${esc(p?.name||'Engineering review')}</b></div><div><span>Material</span><b>${esc(m?.name||'To be confirmed')}</b></div><div><span>Quantity</span><b>${q}</b></div><div><span>Pricing</span><b>After engineering review</b></div>`;
    return;
  }
  const cfg=pricing[processEl.value]||pricing.fdm,extras=pricing.extras||{},complex={simple:.88,normal:1,complex:1.42}[complexityEl.value]||1;
  const layer=Number(layerEl.value)||.2, layerFactor=processEl.value==='fdm'?Math.pow(.20/layer,.62):Math.pow(.05/layer,.38);
  let effectiveVolume=current.volume,grams=0,hours=0;
  if(processEl.value==='fdm'){
    const inf=Math.max(.05,Number(infillEl.value||20)/100),share=Math.min(1,(cfg.shell_share||.24)+(1-(cfg.shell_share||.24))*inf);
    effectiveVolume=current.volume*share*(supportEl.checked?(cfg.support_factor||1.14):1)*(cfg.waste_factor||1.08);
    grams=effectiveVolume*m.density;
    hours=Math.max(.55,(effectiveVolume/8.5)*layerFactor*complex);
  }else{
    effectiveVolume=current.volume*(supportEl.checked?(cfg.support_factor||1.18):1)*(cfg.waste_factor||1.16);
    grams=effectiveVolume*m.density;
    const z=Math.max(current.x,current.y,current.z);hours=Math.max(.6,(effectiveVolume/10.5)*layerFactor*complex+(z/80)*.25);
  }
  const materialCost=grams*m.material_rate,machineCost=hours*m.machine_rate,setup=cfg.setup||0;
  const inserts=insertEl.checked?Math.max(1,Number(insertQtyEl.value)||1)*(extras.insert_each||0):0;
  const finish=finishEl.value==='basic'?(extras.basic_finish||0):finishEl.value==='premium'?(extras.premium_finish||0):0;
  const inspection=inspectionEl.value==='basic'?(extras.basic_inspection||0):inspectionEl.value==='fai'?(extras.fai||0):0;
  let unit=Math.max(cfg.minimum_order||0,materialCost+machineCost+setup+inserts+finish+inspection);
  if(q>1)unit*=Math.max(1-(cfg.quantity_discount_max||.25),1-Math.min((cfg.quantity_discount_max||.25),(q-1)*.018));
  const total=Math.round(unit*q/10)*10,solidWeight=current.volume*m.density;
  current.estimate={route:'estimate',total,quantity:q,grams,hours,solidWeight,material:m,process:p};
  priceEl.textContent='₹ '+total.toLocaleString('en-IN');
  breakdown.innerHTML=`<div><span>Solid-model weight</span><b>${solidWeight.toFixed(1)} g</b></div><div><span>Estimated printed material</span><b>${grams.toFixed(1)} g / part</b></div><div><span>Estimated machine time</span><b>${hours.toFixed(1)} h / part</b></div><div><span>Quantity</span><b>${q}</b></div><div><span>Preliminary amount</span><b>₹ ${total.toLocaleString('en-IN')}*</b></div>`;
}
function renderMaterialAdvisor(){
  const host=$('#q3-advisor-result');if(!host)return;const tags=applicationEl.value?[applicationEl.value]:['functional'];
  const ranked=materials.filter(m=>m.process===processEl.value).map(m=>({m,score:tags.reduce((s,t)=>s+(m.tags||[]).includes(t)?1:0,0)})).sort((a,b)=>b.score-a.score||b.m.properties.strength-a.m.properties.strength).slice(0,3);
  host.innerHTML=ranked.map(({m})=>`<div class="mini"><b>${esc(m.name)}</b><span>${esc(m.use)}</span></div>`).join('');
}
function configurationLines(){
  const m=chosenMaterial(),p=processInfo(),q=Math.max(1,Number(qtyEl.value)||1);
  return [
    '3D Printing / CAD Requirement',
    `File: ${current.file?.name||''}`,
    current.instant?`Model: ${current.x.toFixed(1)} × ${current.y.toFixed(1)} × ${current.z.toFixed(1)} mm | Volume ${current.volume.toFixed(2)} cm³`:'',
    `Process: ${p?.name||'Engineering review'}`,`Material: ${m?.name||'To be confirmed'}`,`Colour: ${colorEl.value||'To be confirmed'}`,
    !layerEl.disabled?`Layer height: ${layerEl.value} mm`:'',!infillEl.disabled?`Infill: ${infillEl.value}%`:'',
    `Complexity: ${complexityEl.value}`,`Quantity: ${q}`,`Application: ${applicationEl.value||'Not specified'}`,`Tolerance requirement: ${toleranceEl.value}`,
    supportEl.checked?'Support allowance requested':'',insertEl.checked?`Heat-set inserts: ${Math.max(1,Number(insertQtyEl.value)||1)} per part`:'',
    finishEl.value!=='none'?`Finish: ${finishEl.options[finishEl.selectedIndex].text}`:'',inspectionEl.value!=='none'?`Inspection: ${inspectionEl.options[inspectionEl.selectedIndex].text}`:'',
    notesEl.value?`Notes: ${notesEl.value}`:'',current.estimate?.route==='estimate'?`Website preliminary amount: ₹ ${current.estimate.total.toLocaleString('en-IN')} (taxes extra as applicable)`:'Website route: Engineering RFQ'
  ].filter(Boolean);
}
async function copySummary(){
  if(!current.file){copyBtn.textContent='Upload a file first';setTimeout(()=>copyBtn.textContent='Copy summary',1200);return}
  try{await navigator.clipboard.writeText(configurationLines().join('\n'));copyBtn.textContent='Copied';setTimeout(()=>copyBtn.textContent='Copy summary',1400)}catch(_){copyBtn.textContent='Copy unavailable'}
}
async function upload(client,enquiryId,file){
  const path=`public-rfq/${enquiryId}/${uid()}-${clean(file.name)}`;
  const up=await client.storage.from('rfq-files').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});if(up.error)throw up.error;
  const reg=await client.rpc('register_enquiry_attachment',{p_enquiry_id:enquiryId,p_object_path:path,p_original_name:file.name,p_mime_type:file.type||null,p_file_size:file.size});if(reg.error)throw reg.error;
}
async function submitRequirement(){
  if(!current.file)return;
  const name=nameEl.value.trim(),phone=phoneEl.value.trim(),email=emailEl.value.trim();
  if(!name||(!phone&&!email)){submitStatus.className='q3-state error';submitStatus.textContent='Please enter your name and at least a phone number or email address.';return}
  submitBtn.disabled=true;submitStatus.className='q3-state';submitStatus.textContent='Recording requirement and uploading file…';
  const cfg=window.CG_CONFIG||{};let client=window.CG_SUPABASE;
  if(!client&&window.supabase&&cfg.supabaseUrl&&cfg.supabasePublishableKey){client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);window.CG_SUPABASE=client}
  const q=Math.max(1,Number(qtyEl.value)||1),lines=configurationLines(); if(locationEl.value.trim())lines.push(`Location / PIN: ${locationEl.value.trim()}`);
  try{
    if(!client)throw new Error('Website backend is not available.');
    const ids=window.CGVisitorIds?window.CGVisitorIds():['',''];
    const r=await client.rpc('submit_enquiry',{p_name:name,p_company:companyEl.value.trim()||null,p_phone:phone||null,p_email:email||null,p_requirement_type:'3D Printing / CAD Review',p_product_id:null,p_variant_id:null,p_quantity:String(q),p_message:lines.join('\n'),p_source:'3d-platform',p_visitor_id:ids[0]||null,p_session_id:ids[1]||null});
    if(r.error)throw r.error;const enquiryId=r.data?.enquiry_id;if(!enquiryId)throw new Error('Enquiry reference was not returned.');
    await upload(client,enquiryId,current.file);window.CGTrack?.('3d_quote_submit',{process:processEl.value,material:materialEl.value,route:current.estimate?.route||'rfq'});
    submitStatus.className='q3-state ok';submitStatus.innerHTML=`<b>Requirement recorded and CAD file uploaded.</b> Reference ${String(enquiryId).slice(0,8).toUpperCase()}. CG can now review the actual file before confirming price and manufacturability.`;
  }catch(e){
    const msg=['Hello Crecer Grande,','I want a 3D printing / CAD review.',...configurationLines().slice(0,8)].join('\n');
    submitStatus.className='q3-state error';submitStatus.innerHTML=`Automatic upload could not be completed: ${esc(e?.message||e)}. <a target="_blank" rel="noopener" href="https://wa.me/916291001781?text=${encodeURIComponent(msg)}"><b>Continue on WhatsApp →</b></a>`;
  }finally{submitBtn.disabled=false}
}
boot();
