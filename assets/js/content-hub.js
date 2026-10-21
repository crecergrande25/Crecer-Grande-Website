
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-filter-toolbar]').forEach(toolbar => {
    const section = toolbar.closest('section');
    const items = [...section.querySelectorAll('[data-filter-item]')];
    const search = section.querySelector('[data-content-search]');
    const status = section.querySelector('[data-filter-status]');
    const empty = section.querySelector('[data-filter-empty]');
    let category = 'all';
    const apply = () => {
      const query = (search?.value || '').trim().toLowerCase();
      let count = 0;
      items.forEach(item => {
        const matchesCategory = category === 'all' || item.dataset.filterItem.split(/\s+/).includes(category);
        const matchesQuery = !query || item.textContent.toLowerCase().includes(query);
        item.hidden = !(matchesCategory && matchesQuery);
        if (!item.hidden) count++;
      });
      if (status) status.textContent = `${count} ${count === 1 ? 'result' : 'results'}`;
      if (empty) empty.hidden = count !== 0;
    };
    toolbar.addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      category = button.dataset.filter;
      toolbar.querySelectorAll('button').forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      apply();
    });
    search?.addEventListener('input', apply);
    apply();
  });
});
