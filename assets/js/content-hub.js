
document.addEventListener('DOMContentLoaded',()=>{
  const toolbar=document.querySelector('[data-filter-toolbar]');
  const items=[...document.querySelectorAll('[data-filter-item]')];
  if(toolbar&&items.length){
    toolbar.addEventListener('click',e=>{
      const b=e.target.closest('[data-filter]');if(!b)return;
      toolbar.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));
      const f=b.dataset.filter;
      items.forEach(x=>{const tags=(x.dataset.filterItem||'').split(/\s+/);x.hidden=f!=='all'&&!tags.includes(f)});
    });
  }
});
