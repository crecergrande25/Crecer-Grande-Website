document.addEventListener('DOMContentLoaded',()=>{
 const input=document.getElementById('p6-search'),clear=document.getElementById('p6-clear');
 const cards=[...document.querySelectorAll('.p6-card')],count=document.getElementById('p6-count'),empty=document.getElementById('p6-empty');
 const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
 const render=()=>{const t=norm(input?.value).split(' ').filter(Boolean);let n=0;cards.forEach(c=>{const ok=!t.length||t.every(x=>norm(c.dataset.search+' '+c.textContent).includes(x));c.style.display=ok?'flex':'none';if(ok)n++});if(count)count.textContent=n+' categor'+(n===1?'y':'ies')+' shown';if(empty)empty.style.display=n?'none':'block';};
 input?.addEventListener('input',render);clear?.addEventListener('click',()=>{if(input)input.value='';render();input?.focus()});render();
});