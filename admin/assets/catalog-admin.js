(() => {
  'use strict';

  const cfg = window.CG_CONFIG || {};
  if (!window.supabase || !cfg.supabaseUrl || !cfg.supabasePublishableKey) return;

  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
  const content = document.getElementById('content');
  const viewTitle = document.getElementById('view-title');
  const refresh = document.getElementById('refresh');
  const state = { view: null, allowed: false, categories: [], brands: [], products: [] };

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const slugify = (v) => String(v || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const num = (v, fallback = 100) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  const uid = async () => ((await client.auth.getUser()).data.user || {}).id || null;

  async function permitted() {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return false;
    const { data, error } = await client.rpc('get_my_permissions');
    return !error && (data || []).some((x) => x.permission_key === 'products.edit' && x.allowed === true);
  }

  function customButtons() { return [...document.querySelectorAll('[data-catalog-view]')]; }
  function activate(name) {
    document.querySelectorAll('.sidebar button').forEach((b) => b.classList.remove('active'));
    document.querySelector(`[data-catalog-view="${name}"]`)?.classList.add('active');
  }

  function mount() {
    if (document.querySelector('[data-catalog-view]')) return;
    const products = document.querySelector('[data-view="products"]');
    if (!products) return;
    const labels = [['categories','Product Categories'],['brands','Product Brands'],['classification','Product Classification']];
    let anchor = products;
    labels.forEach(([view, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.catalogView = view; b.textContent = label; b.style.display = 'none';
      anchor.insertAdjacentElement('afterend', b); anchor = b;
      b.onclick = async () => { state.view = view; activate(view); await render(); };
    });
    document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { state.view = null; customButtons().forEach((x) => x.classList.remove('active')); }));
  }

  async function syncVisibility() {
    state.allowed = await permitted();
    customButtons().forEach((b) => b.style.display = state.allowed ? '' : 'none');
  }

  function errorCard(e) { content.innerHTML = `<div class="card"><b>Error:</b> ${esc(e?.message || e)}</div>`; }
  function pathName(row) {
    const parent = state.categories.find((x) => x.id === row.parent_id);
    return parent ? `${parent.name} → ${row.name}` : row.name;
  }

  async function loadCategories() {
    const { data, error } = await client.from('product_categories').select('*').order('sort_order').order('name');
    if (error) throw error; state.categories = data || [];
  }
  async function loadBrands() {
    const { data, error } = await client.from('product_brands').select('*').order('sort_order').order('name');
    if (error) throw error; state.brands = data || [];
  }
  async function loadProducts() {
    const { data, error } = await client.from('products').select('id,name,title,slug,category,subcategory,category_id,brand_id,published,sort_order').order('sort_order').order('name');
    if (error) throw error; state.products = data || [];
  }

  async function render() {
    await syncVisibility();
    if (!state.allowed) return errorCard('No permission.');
    content.innerHTML = '<div class="card">Loading…</div>';
    try {
      if (state.view === 'categories') return renderCategories();
      if (state.view === 'brands') return renderBrands();
      if (state.view === 'classification') return renderClassification();
    } catch (e) { errorCard(e); }
  }

  async function renderCategories() {
    viewTitle.textContent = 'Product Categories';
    await loadCategories();
    const rows = state.categories.map((r,i) => `<tr><td>${esc(pathName(r))}</td><td>${esc(r.slug)}</td><td>${r.published?'Published':'Draft'}</td><td>${esc(r.sort_order)}</td><td><button class="primary small" data-cat="${i}">Edit</button></td></tr>`).join('');
    content.innerHTML = `<div class="card"><div class="toolbar"><button class="primary" id="cat-add">+ Add category</button></div><p class="muted">Structured catalogue categories. Only published categories are visible publicly.</p><div class="table-wrap"><table><thead><tr><th>Category</th><th>Slug</th><th>Status</th><th>Order</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div><div id="catalog-editor"></div>`;
    document.getElementById('cat-add').onclick = () => categoryEditor(null);
    content.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => categoryEditor(state.categories[+b.dataset.cat]));
  }

  function categoryEditor(row) {
    const isNew = !row?.id; const ed = document.getElementById('catalog-editor');
    const parents = state.categories.filter((x) => x.id !== row?.id).map((x) => `<option value="${x.id}" ${row?.parent_id===x.id?'selected':''}>${esc(pathName(x))}</option>`).join('');
    ed.innerHTML = `<form class="card" id="cat-form"><h2>${isNew?'Add category':'Edit '+esc(row.name)}</h2><div class="grid2"><label class="field">Name<input name="name" required value="${esc(row?.name||'')}"></label><label class="field">Slug<input name="slug" required value="${esc(row?.slug||'')}"></label><label class="field">Parent<select name="parent_id"><option value="">Top level</option>${parents}</select></label><label class="field">Sort order<input type="number" name="sort_order" value="${esc(row?.sort_order??100)}"></label><label class="field">Short description<textarea name="short_description" rows="4">${esc(row?.short_description||'')}</textarea></label><label class="field">Full description<textarea name="full_description" rows="4">${esc(row?.full_description||'')}</textarea></label><label class="field">Image URL<input name="image_url" value="${esc(row?.image_url||'')}"></label><label class="field">SEO title<input name="seo_title" value="${esc(row?.seo_title||'')}"></label><label class="field">SEO description<textarea name="seo_description" rows="4">${esc(row?.seo_description||'')}</textarea></label><label class="field">Published<select name="published"><option value="true" ${row?.published!==false?'selected':''}>true</option><option value="false" ${row?.published===false?'selected':''}>false</option></select></label></div><div class="toolbar"><button class="primary">${isNew?'Create':'Save'}</button>${isNew?'':'<button type="button" class="danger" id="cat-delete">Delete</button>'}</div></form>`;
    const form = document.getElementById('cat-form');
    form.onsubmit = async (e) => { e.preventDefault(); const f = new FormData(form); const name=String(f.get('name')||'').trim(); const payload={name,slug:slugify(f.get('slug')||name),parent_id:f.get('parent_id')||null,sort_order:num(f.get('sort_order')),short_description:String(f.get('short_description')||'').trim()||null,full_description:String(f.get('full_description')||'').trim()||null,image_url:String(f.get('image_url')||'').trim()||null,seo_title:String(f.get('seo_title')||'').trim()||null,seo_description:String(f.get('seo_description')||'').trim()||null,published:f.get('published')==='true',updated_by:await uid()}; const q=isNew?await client.from('product_categories').insert(payload):await client.from('product_categories').update(payload).eq('id',row.id); if(q.error)return alert(q.error.message); await renderCategories(); };
    document.getElementById('cat-delete')?.addEventListener('click', async () => { if(!confirm('Delete this category?')) return; const q=await client.from('product_categories').delete().eq('id',row.id); if(q.error)return alert(q.error.message); await renderCategories(); });
  }

  async function renderBrands() {
    viewTitle.textContent = 'Product Brands'; await loadBrands();
    const rows=state.brands.map((r,i)=>`<tr><td>${esc(r.name)}</td><td>${esc(r.brand_role)}</td><td>${esc(r.relationship_status)}</td><td>${r.published?'Published':'Draft'}</td><td><button class="primary small" data-brand="${i}">Edit</button></td></tr>`).join('');
    content.innerHTML=`<div class="card"><div class="toolbar"><button class="primary" id="brand-add">+ Add brand</button></div><p class="muted">Manufacturer and equipment-brand records used by the product catalogue.</p><div class="table-wrap"><table><thead><tr><th>Brand</th><th>Role</th><th>Relationship</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div><div id="catalog-editor"></div>`;
    document.getElementById('brand-add').onclick=()=>brandEditor(null); content.querySelectorAll('[data-brand]').forEach((b)=>b.onclick=()=>brandEditor(state.brands[+b.dataset.brand]));
  }

  function brandEditor(row) {
    const isNew=!row?.id; const ed=document.getElementById('catalog-editor');
    const roles=['manufacturer','equipment_brand','both','house_brand']; const relationships=['reference_only','supplier','reseller','authorized_distributor','authorized_service','house_brand'];
    ed.innerHTML=`<form class="card" id="brand-form"><h2>${isNew?'Add brand':'Edit '+esc(row.name)}</h2><div class="grid2"><label class="field">Name<input name="name" required value="${esc(row?.name||'')}"></label><label class="field">Slug<input name="slug" required value="${esc(row?.slug||'')}"></label><label class="field">Brand role<select name="brand_role">${roles.map((x)=>`<option value="${x}" ${(row?.brand_role||'manufacturer')===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="field">Relationship<select name="relationship_status">${relationships.map((x)=>`<option value="${x}" ${(row?.relationship_status||'reference_only')===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="field">Website URL<input name="website_url" value="${esc(row?.website_url||'')}"></label><label class="field">Logo URL<input name="logo_url" value="${esc(row?.logo_url||'')}"></label><label class="field">Description<textarea name="description" rows="4">${esc(row?.description||'')}</textarea></label><label class="field">Trademark notice<textarea name="trademark_notice" rows="4">${esc(row?.trademark_notice||'')}</textarea></label><label class="field">Authorization note<textarea name="authorization_note" rows="4">${esc(row?.authorization_note||'')}</textarea></label><label class="field">Sort order<input type="number" name="sort_order" value="${esc(row?.sort_order??100)}"></label><label class="field">Published<select name="published"><option value="true" ${row?.published!==false?'selected':''}>true</option><option value="false" ${row?.published===false?'selected':''}>false</option></select></label></div><div class="toolbar"><button class="primary">${isNew?'Create':'Save'}</button>${isNew?'':'<button type="button" class="danger" id="brand-delete">Delete</button>'}</div></form>`;
    const form=document.getElementById('brand-form'); form.onsubmit=async(e)=>{e.preventDefault();const f=new FormData(form);const name=String(f.get('name')||'').trim();const payload={name,slug:slugify(f.get('slug')||name),brand_role:f.get('brand_role'),relationship_status:f.get('relationship_status'),website_url:String(f.get('website_url')||'').trim()||null,logo_url:String(f.get('logo_url')||'').trim()||null,description:String(f.get('description')||'').trim()||null,trademark_notice:String(f.get('trademark_notice')||'').trim()||null,authorization_note:String(f.get('authorization_note')||'').trim()||null,sort_order:num(f.get('sort_order')),published:f.get('published')==='true',updated_by:await uid()};const q=isNew?await client.from('product_brands').insert(payload):await client.from('product_brands').update(payload).eq('id',row.id);if(q.error)return alert(q.error.message);await renderBrands();};
    document.getElementById('brand-delete')?.addEventListener('click',async()=>{if(!confirm('Delete this brand?'))return;const q=await client.from('product_brands').delete().eq('id',row.id);if(q.error)return alert(q.error.message);await renderBrands();});
  }

  async function renderClassification() {
    viewTitle.textContent='Product Classification'; await Promise.all([loadCategories(),loadBrands(),loadProducts()]);
    const cOpts=state.categories.map((c)=>`<option value="${c.id}">${esc(pathName(c))}</option>`).join(''); const bOpts=state.brands.map((b)=>`<option value="${b.id}">${esc(b.name)}</option>`).join('');
    const rows=state.products.map((p,i)=>`<tr><td><b>${esc(p.name||p.title||p.slug)}</b><br><span class="muted">${esc(p.slug)}</span></td><td><select data-c="${i}"><option value="">Unassigned</option>${cOpts}</select></td><td><select data-b="${i}"><option value="">Unassigned</option>${bOpts}</select></td><td>${p.published?'Published':'Draft'}</td><td><button class="primary small" data-save="${i}">Save</button></td></tr>`).join('');
    content.innerHTML=`<div class="card"><p class="muted">Assign structured category and manufacturer/brand records to existing products. Legacy category text is kept in sync during migration.</p><div class="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Brand</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    state.products.forEach((p,i)=>{const c=content.querySelector(`[data-c="${i}"]`);const b=content.querySelector(`[data-b="${i}"]`);if(c)c.value=p.category_id||'';if(b)b.value=p.brand_id||'';});
    content.querySelectorAll('[data-save]').forEach((button)=>button.onclick=async()=>{const i=+button.dataset.save,p=state.products[i],categoryId=content.querySelector(`[data-c="${i}"]`)?.value||null,brandId=content.querySelector(`[data-b="${i}"]`)?.value||null,cat=state.categories.find((x)=>x.id===categoryId),parent=cat?.parent_id?state.categories.find((x)=>x.id===cat.parent_id):null;const payload={category_id:categoryId,brand_id:brandId,updated_by:await uid()};if(cat){payload.category=parent?parent.name:cat.name;payload.subcategory=parent?cat.name:null;}const q=await client.from('products').update(payload).eq('id',p.id);if(q.error)return alert(q.error.message);alert('Classification saved.');});
  }

  mount(); syncVisibility(); client.auth.onAuthStateChange(()=>setTimeout(syncVisibility,0));
  if (refresh) { const old=refresh.onclick; refresh.onclick=(e)=>state.view?(e?.preventDefault?.(),render()):(typeof old==='function'?old.call(refresh,e):undefined); }
})();
