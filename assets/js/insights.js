(() => {
  const search = document.getElementById('insight-search');
  const cards = [...document.querySelectorAll('.insight-card')];
  const buttons = [...document.querySelectorAll('.insight-filter')];
  const empty = document.getElementById('insight-empty');
  if (!cards.length) return;
  let category = 'all';
  function apply(){
    const q=(search?.value||'').trim().toLowerCase();
    let shown=0;
    cards.forEach(card=>{
      const okCat = category==='all' || card.dataset.category===category;
      const text=(card.dataset.title+' '+card.textContent).toLowerCase();
      const okQ=!q || text.includes(q);
      const show=okCat&&okQ; card.hidden=!show; if(show) shown++;
    });
    if(empty) empty.hidden=shown!==0;
  }
  buttons.forEach(b=>b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.remove('active'));b.classList.add('active');category=b.dataset.filter;apply();}));
  search?.addEventListener('input',apply);
})();
