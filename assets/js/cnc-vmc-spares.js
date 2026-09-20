document.addEventListener('DOMContentLoaded',()=>{
  const input=document.getElementById('cnc-search');
  const clear=document.getElementById('cnc-clear');
  const cards=[...document.querySelectorAll('.cnc-card')];
  const count=document.getElementById('cnc-count');
  const empty=document.getElementById('cnc-empty');
  const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const render=()=>{
    const terms=norm(input?.value).split(' ').filter(Boolean);
    let shown=0;
    cards.forEach(card=>{
      const hay=norm(card.dataset.search+' '+card.textContent);
      const ok=!terms.length||terms.every(t=>hay.includes(t));
      card.style.display=ok?'flex':'none';
      if(ok)shown++;
    });
    if(count)count.textContent=shown+' categor'+(shown===1?'y':'ies')+' shown';
    if(empty)empty.style.display=shown?'none':'block';
  };
  input?.addEventListener('input',render);
  clear?.addEventListener('click',()=>{if(input)input.value='';render();input?.focus()});
  const qs=new URLSearchParams(location.search);
  if(qs.get('q')&&input)input.value=qs.get('q');
  render();
});