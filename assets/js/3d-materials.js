
(() => {
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  async function getMaterials(){return await (await fetch('/assets/data/3d-materials.json',{cache:'no-store'})).json()}
  async function getProcesses(){return await (await fetch('/assets/data/3d-processes.json',{cache:'no-store'})).json()}
  function propertyLabel(n){return n>=85?'High':n>=65?'Med–High':n>=45?'Medium':n>=25?'Low–Med':'Low'}
  async function initAdvisor(){
    const host=document.querySelector('[data-material-advisor]'); if(!host)return;
    const mats=await getMaterials();
    const buttons=[...host.querySelectorAll('[data-usecase]')],out=host.querySelector('[data-advisor-result]');
    const map={
      'visual':['visual','detail','smooth'],'functional':['functional','engineering'],'outdoor':['outdoor','uv'],
      'flexible':['flexible'],'heat':['heat'],'fixture':['jig-fixture','rigid'],'clear':['clear'],'production':['production','batch']
    };
    function show(key){
      buttons.forEach(b=>b.classList.toggle('active',b.dataset.usecase===key));
      const tags=map[key]||[];
      const ranked=mats.map(m=>({m,score:tags.reduce((s,t)=>s+(m.tags||[]).includes(t)?1:0,0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||b.m.properties.strength-a.m.properties.strength).slice(0,3);
      out.innerHTML=ranked.map(({m})=>`<div class="mini"><b>${esc(m.name)}</b><span>${esc(m.use)}</span><a href="/request-quote.html?requirement=${encodeURIComponent(`3D Printing - ${m.name}`)}">Configure →</a></div>`).join('')||'<div class="mini"><b>Engineering review</b><span>Tell CG the required property and service environment.</span></div>';
    }
    buttons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.usecase))); show('functional');
  }
  async function initMaterialPage(){
    const grid=document.getElementById('material-cards'); if(!grid)return;
    const mats=await getMaterials(),process=document.getElementById('mat-process'),use=document.getElementById('mat-use'),search=document.getElementById('mat-search'),compare=document.getElementById('material-compare');
    let selected=[];
    const pct=(n)=>Math.round(n);
    function filtered(){
      const p=process.value,u=use.value,q=search.value.trim().toLowerCase();
      return mats.filter(m=>(!p||m.process===p)&&(!u||(m.tags||[]).includes(u))&&(!q||(m.name+' '+m.use+' '+m.notes+' '+(m.tags||[]).join(' ')).toLowerCase().includes(q)));
    }
    function renderCompare(){
      const rows=mats.filter(m=>selected.includes(m.id));
      if(rows.length<2){compare.innerHTML='<div style="padding:16px;color:#6b7a8e">Select two or three materials to compare.</div>';return}
      const props=['strength','heat','impact','flexibility','finish','uv'];
      compare.innerHTML=`<table class="compare-table"><thead><tr><th>Property</th>${rows.map(m=>`<th>${esc(m.name)}</th>`).join('')}</tr></thead><tbody>
        <tr><td>Process</td>${rows.map(m=>`<td>${esc(m.process.toUpperCase())}</td>`).join('')}</tr>
        <tr><td>Quote route</td>${rows.map(m=>`<td>${m.availability==='estimate'?'Website estimate':'Engineering RFQ'}</td>`).join('')}</tr>
        ${props.map(p=>`<tr><td>${p[0].toUpperCase()+p.slice(1)}</td>${rows.map(m=>`<td>${propertyLabel(m.properties[p])} (${m.properties[p]}/100)</td>`).join('')}</tr>`).join('')}
        <tr><td>Typical use</td>${rows.map(m=>`<td>${esc(m.use)}</td>`).join('')}</tr>
      </tbody></table>`;
    }
    function render(){
      const rows=filtered();
      grid.innerHTML=rows.map(m=>`<article class="mat-card-v26 ${selected.includes(m.id)?'selected':''}" data-mid="${esc(m.id)}"><span class="badge">${esc(m.process.toUpperCase())} · ${m.availability==='estimate'?'Estimator':'RFQ'}</span><h3>${esc(m.name)}</h3><p>${esc(m.use)}</p>
        <div class="prop-grid"><div class="prop"><span>Strength</span><b>${propertyLabel(m.properties.strength)}</b></div><div class="prop"><span>Heat</span><b>${propertyLabel(m.properties.heat)}</b></div><div class="prop"><span>Finish</span><b>${propertyLabel(m.properties.finish)}</b></div></div>
        <div class="mat-actions"><button type="button" data-compare="${esc(m.id)}">${selected.includes(m.id)?'Remove compare':'Compare'}</button><a href="/request-quote.html?requirement=${encodeURIComponent(`3D Printing - ${m.name}`)}">Configure →</a></div></article>`).join('')||'<div class="panel">No material matched these filters. Try a broader requirement or send it for engineering review.</div>';
      grid.querySelectorAll('[data-compare]').forEach(b=>b.onclick=()=>{
        const id=b.dataset.compare;
        if(selected.includes(id))selected=selected.filter(x=>x!==id); else if(selected.length<3)selected.push(id); else selected=[selected[1],selected[2],id];
        render(); renderCompare();
      });
    }
    [process,use,search].forEach(el=>el.addEventListener('input',render)); render(); renderCompare();
  }
  document.addEventListener('DOMContentLoaded',()=>{initAdvisor().catch(()=>{});initMaterialPage().catch(()=>{})});
})();
