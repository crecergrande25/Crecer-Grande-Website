(() => {
  'use strict';

  const cfg = window.CG_CONFIG || {};
  if (!window.supabase || !cfg.supabaseUrl || !cfg.supabasePublishableKey) return;

  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
  const content = document.getElementById('content');
  const viewTitle = document.getElementById('view-title');
  const refreshBtn = document.getElementById('refresh');
  const sidebar = document.querySelector('.sidebar');

  const state = {
    view: null,
    allowed: false,
    categories: [],
    brands: [],
    products: []
  };

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  const slugify = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const asNumber = (value, fallback = 100) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  async function currentUserId() {
    const { data } = await client.auth.getUser();
    return data.user?.id || null;
  }

  async function logEvent(action, module, label) {
    try {
      await client.rpc('log_admin_event', {
        p_action: action,
        p_module: module,
        p_record_label: label || ''
      });
    } catch (_) {}
  }

  function statusCard(message, isError = false) {
    if (!content) return;
    content.innerHTML = `<div class="card">${isError ? '<b>Error:</b> ' : ''}${esc(message)}</div>`;
  }

  function customButtons() {
    return Array.from(document.querySelectorAll('[data-catalog-view]'));
  }

  function setCustomVisible(visible) {
    customButtons().forEach((button) => {
      button.style.display = visible ? '' : 'none';
    });
  }

  function clearAllActive() {
    document.querySelectorAll('.sidebar button').forEach((button) => button.classList.remove('active'));
  }

  function activateCustom(view) {
    clearAllActive();
    const button = document.querySelector(`[data-catalog-view="${view}"]`);
    if (button) button.classList.add('active');
  }

  function mountNavigation() {
    if (!sidebar || document.querySelector('[data-catalog-view]')) return;
    const productsButton = document.querySelector('[data-view="products"]');
    const variantsButton = document.querySelector('[data-view="variants"]');
    if (!productsButton) return;

    const categoriesButton = document.createElement('button');
    categoriesButton.type = 'button';
    categoriesButton.dataset.catalogView = 'categories';
    categoriesButton.textContent = 'Product Categories';

    const brandsButton = document.createElement('button');
    brandsButton.type = 'button';
    brandsButton.dataset.catalogView = 'brands';
    brandsButton.textContent = 'Product Brands';

    const classificationButton = document.createElement('button');
    classificationButton.type = 'button';
    classificationButton.dataset.catalogView = 'classification';
    classificationButton.textContent = 'Product Classification';

    productsButton.insertAdjacentElement('afterend', categoriesButton);
    categoriesButton.insertAdjacentElement('afterend', brandsButton);
    brandsButton.insertAdjacentElement('afterend', classificationButton);

    // Keep Product Variants after the new catalogue controls.
    if (variantsButton) classificationButton.insertAdjacentElement('afterend', variantsButton);

    customButtons().forEach((button) => {
      button.style.display = 'none';
      button.addEventListener('click', () => openView(button.dataset.catalogView));
    });

    document.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => {
        state.view = null;
        customButtons().forEach((x) => x.classList.remove('active'));
      });
    });
  }

  async function refreshPermission() {
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      state.allowed = false;
      setCustomVisible(false);
      return;
    }
    const { data, error } = await client.rpc('get_my_permissions');
    state.allowed = !error && (data || []).some((row) => row.permission_key === 'products.edit' && row.allowed === true);
    setCustomVisible(state.allowed);
  }

  async function openView(view) {
    await refreshPermission();
    if (!state.allowed) {
      statusCard('No permission.');
      return;
    }
    state.view = view;
    activateCustom(view);
    await renderCurrent();
  }

  async function renderCurrent() {
    if (!state.view) return;
    statusCard('Loading…');
    try {
      if (state.view === 'categories') return renderCategories();
      if (state.view === 'brands') return renderBrands();
      if (state.view === 'classification') return renderClassification();
    } catch (error) {
      statusCard(error.message || String(error), true);
    }
  }

  async function loadCategories() {
    const { data, error } = await client
      .from('product_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    state.categories = data || [];
    return state.categories;
  }

  async function loadBrands() {
    const { data, error } = await client
      .from('product_brands')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    state.brands = data || [];
    return state.brands;
  }

  async function loadProducts() {
    const { data, error } = await client
      .from('products')
      .select('id,name,title,slug,category,subcategory,category_id,brand_id,published,sort_order')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    state.products = data || [];
    return state.products;
  }

  function categoryName(id) {
    return state.categories.find((row) => row.id === id)?.name || '';
  }

  function brandName(id) {
    return state.brands.find((row) => row.id === id)?.name || '';
  }

  function categoryPath(row) {
    if (!row) return '';
    const parent = state.categories.find((x) => x.id === row.parent_id);
    return parent ? `${parent.name} → ${row.name}` : row.name;
  }

  function publishedBadge(value) {
    return value ? 'Published' : 'Draft';
  }

  async function renderCategories() {
    if (viewTitle) viewTitle.textContent = 'Product Categories';
    await loadCategories();

    const rows = state.categories.map((row, index) => `
      <tr>
        <td>${esc(categoryPath(row))}</td>
        <td>${esc(row.slug)}</td>
        <td>${esc(publishedBadge(row.published))}</td>
        <td>${esc(row.sort_order)}</td>
        <td><button class="primary small" type="button" data-category-edit="${index}">Edit</button></td>
      </tr>`).join('');

    content.innerHTML = `
      <div class="card">
        <div class="toolbar"><button class="primary" type="button" id="catalog-add-category">+ Add category</button></div>
        <p class="muted">Maintain the category hierarchy used by the product catalogue. Draft categories stay hidden from public catalogue reads.</p>
        <div class="table-wrap">
          ${rows ? `<table><thead><tr><th>Category</th><th>Slug</th><th>Status</th><th>Order</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : 'No categories.'}
        </div>
      </div>
      <div id="catalog-editor"></div>`;

    document.getElementById('catalog-add-category')?.addEventListener('click', () => editCategory(null));
    content.querySelectorAll('[data-category-edit]').forEach((button) => {
      button.addEventListener('click', () => editCategory(state.categories[Number(button.dataset.categoryEdit)]));
    });
  }

  function editCategory(row) {
    const editor = document.getElementById('catalog-editor');
    if (!editor) return;
    const isNew = !row?.id;
    const parentOptions = state.categories
      .filter((x) => x.id !== row?.id)
      .map((x) => `<option value="${esc(x.id)}" ${row?.parent_id === x.id ? 'selected' : ''}>${esc(categoryPath(x))}</option>`)
      .join('');

    editor.innerHTML = `
      <form class="card" id="catalog-category-form">
        <h2>${isNew ? 'Add category' : `Edit ${esc(row.name)}`}</h2>
        <div class="grid2">
          <label class="field">Name<input name="name" required value="${esc(row?.name || '')}"></label>
          <label class="field">Slug<input name="slug" required value="${esc(row?.slug || '')}" placeholder="laser-consumables"></label>
          <label class="field">Parent category<select name="parent_id"><option value="">Top level</option>${parentOptions}</select></label>
          <label class="field">Sort order<input name="sort_order" type="number" value="${esc(row?.sort_order ?? 100)}"></label>
          <label class="field">Short description<textarea name="short_description" rows="4">${esc(row?.short_description || '')}</textarea></label>
          <label class="field">Full description<textarea name="full_description" rows="4">${esc(row?.full_description || '')}</textarea></label>
          <label class="field">Image URL<input name="image_url" value="${esc(row?.image_url || '')}"></label>
          <label class="field">Icon<input name="icon" value="${esc(row?.icon || '')}"></label>
          <label class="field">SEO title<input name="seo_title" value="${esc(row?.seo_title || '')}"></label>
          <label class="field">SEO description<textarea name="seo_description" rows="4">${esc(row?.seo_description || '')}</textarea></label>
          <label class="field">Canonical URL<input name="canonical_url" value="${esc(row?.canonical_url || '')}"></label>
          <label class="field">Published<select name="published"><option value="true" ${row?.published !== false ? 'selected' : ''}>true</option><option value="false" ${row?.published === false ? 'selected' : ''}>false</option></select></label>
        </div>
        <div class="toolbar">
          <button class="primary" type="submit">${isNew ? 'Create category' : 'Save category'}</button>
          ${isNew ? '' : '<button class="danger" type="button" id="catalog-delete-category">Delete</button>'}
        </div>
      </form>`;

    const form = document.getElementById('catalog-category-form');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const slug = slugify(formData.get('slug') || name);
        if (!name || !slug) throw new Error('Name and slug are required.');
        const payload = {
          name,
          slug,
          parent_id: formData.get('parent_id') || null,
          sort_order: asNumber(formData.get('sort_order')),
          short_description: String(formData.get('short_description') || '').trim() || null,
          full_description: String(formData.get('full_description') || '').trim() || null,
          image_url: String(formData.get('image_url') || '').trim() || null,
          icon: String(formData.get('icon') || '').trim() || null,
          seo_title: String(formData.get('seo_title') || '').trim() || null,
          seo_description: String(formData.get('seo_description') || '').trim() || null,
          canonical_url: String(formData.get('canonical_url') || '').trim() || null,
          published: formData.get('published') === 'true',
          updated_by: await currentUserId()
        };
        const result = isNew
          ? await client.from('product_categories').insert(payload)
          : await client.from('product_categories').update(payload).eq('id', row.id);
        if (result.error) throw result.error;
        await logEvent(isNew ? 'CREATE' : 'UPDATE', 'product_categories', name);
        alert(isNew ? 'Category created.' : 'Category saved.');
        await renderCategories();
      } catch (error) {
        alert(error.message || String(error));
      }
    });

    document.getElementById('catalog-delete-category')?.addEventListener('click', async () => {
      if (!confirm(`Delete category "${row.name}"? This will fail if products or child categories still reference it.`)) return;
      const result = await client.from('product_categories').delete().eq('id', row.id);
      if (result.error) return alert(result.error.message);
      await logEvent('DELETE', 'product_categories', row.name);
      alert('Category deleted.');
      await renderCategories();
    });
  }

  async function renderBrands() {
    if (viewTitle) viewTitle.textContent = 'Product Brands';
    await loadBrands();

    const rows = state.brands.map((row, index) => `
      <tr>
        <td>${esc(row.name)}</td>
        <td>${esc(row.brand_role)}</td>
        <td>${esc(row.relationship_status)}</td>
        <td>${esc(publishedBadge(row.published))}</td>
        <td><button class="primary small" type="button" data-brand-edit="${index}">Edit</button></td>
      </tr>`).join('');

    content.innerHTML = `
      <div class="card">
        <div class="toolbar"><button class="primary" type="button" id="catalog-add-brand">+ Add brand</button></div>
        <p class="muted">Use brand records for manufacturers, OEM references and Crecer Grande-labelled products. Relationship status is kept explicit so the website does not imply authorisation that has not been confirmed.</p>
        <div class="table-wrap">
          ${rows ? `<table><thead><tr><th>Brand</th><th>Role</th><th>Relationship</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : 'No brands yet.'}
        </div>
      </div>
      <div id="catalog-editor"></div>`;

    document.getElementById('catalog-add-brand')?.addEventListener('click', () => editBrand(null));
    content.querySelectorAll('[data-brand-edit]').forEach((button) => {
      button.addEventListener('click', () => editBrand(state.brands[Number(button.dataset.brandEdit)]));
    });
  }

  function editBrand(row) {
    const editor = document.getElementById('catalog-editor');
    if (!editor) return;
    const isNew = !row?.id;
    const role = row?.brand_role || 'manufacturer';
    const relationship = row?.relationship_status || 'reference_only';

    editor.innerHTML = `
      <form class="card" id="catalog-brand-form">
        <h2>${isNew ? 'Add brand' : `Edit ${esc(row.name)}`}</h2>
        <div class="grid2">
          <label class="field">Name<input name="name" required value="${esc(row?.name || '')}"></label>
          <label class="field">Slug<input name="slug" required value="${esc(row?.slug || '')}" placeholder="brand-name"></label>
          <label class="field">Brand role<select name="brand_role">
            ${['manufacturer','oem','supplier','cg_brand','reference'].map((x) => `<option value="${x}" ${role === x ? 'selected' : ''}>${x}</option>`).join('')}
          </select></label>
          <label class="field">Relationship status<select name="relationship_status">
            ${['reference_only','supplier','reseller','authorised','own_brand'].map((x) => `<option value="${x}" ${relationship === x ? 'selected' : ''}>${x}</option>`).join('')}
          </select></label>
          <label class="field">Website URL<input name="website_url" value="${esc(row?.website_url || '')}"></label>
          <label class="field">Logo URL<input name="logo_url" value="${esc(row?.logo_url || '')}"></label>
          <label class="field">Description<textarea name="description" rows="4">${esc(row?.description || '')}</textarea></label>
          <label class="field">Trademark notice<textarea name="trademark_notice" rows="4">${esc(row?.trademark_notice || '')}</textarea></label>
          <label class="field">Authorisation note<textarea name="authorization_note" rows="4">${esc(row?.authorization_note || '')}</textarea></label>
          <label class="field">Sort order<input name="sort_order" type="number" value="${esc(row?.sort_order ?? 100)}"></label>
          <label class="field">Published<select name="published"><option value="true" ${row?.published !== false ? 'selected' : ''}>true</option><option value="false" ${row?.published === false ? 'selected' : ''}>false</option></select></label>
        </div>
        <div class="toolbar">
          <button class="primary" type="submit">${isNew ? 'Create brand' : 'Save brand'}</button>
          ${isNew ? '' : '<button class="danger" type="button" id="catalog-delete-brand">Delete</button>'}
        </div>
      </form>`;

    const form = document.getElementById('catalog-brand-form');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const slug = slugify(formData.get('slug') || name);
        if (!name || !slug) throw new Error('Name and slug are required.');
        const payload = {
          name,
          slug,
          brand_role: String(formData.get('brand_role') || 'manufacturer'),
          relationship_status: String(formData.get('relationship_status') || 'reference_only'),
          website_url: String(formData.get('website_url') || '').trim() || null,
          logo_url: String(formData.get('logo_url') || '').trim() || null,
          description: String(formData.get('description') || '').trim() || null,
          trademark_notice: String(formData.get('trademark_notice') || '').trim() || null,
          authorization_note: String(formData.get('authorization_note') || '').trim() || null,
          sort_order: asNumber(formData.get('sort_order')),
          published: formData.get('published') === 'true',
          updated_by: await currentUserId()
        };
        const result = isNew
          ? await client.from('product_brands').insert(payload)
          : await client.from('product_brands').update(payload).eq('id', row.id);
        if (result.error) throw result.error;
        await logEvent(isNew ? 'CREATE' : 'UPDATE', 'product_brands', name);
        alert(isNew ? 'Brand created.' : 'Brand saved.');
        await renderBrands();
      } catch (error) {
        alert(error.message || String(error));
      }
    });

    document.getElementById('catalog-delete-brand')?.addEventListener('click', async () => {
      if (!confirm(`Delete brand "${row.name}"? This will fail if products still reference it.`)) return;
      const result = await client.from('product_brands').delete().eq('id', row.id);
      if (result.error) return alert(result.error.message);
      await logEvent('DELETE', 'product_brands', row.name);
      alert('Brand deleted.');
      await renderBrands();
    });
  }

  async function renderClassification() {
    if (viewTitle) viewTitle.textContent = 'Product Classification';
    await Promise.all([loadCategories(), loadBrands(), loadProducts()]);

    const categoryOptions = state.categories.map((row) => `<option value="${esc(row.id)}">${esc(categoryPath(row))}</option>`).join('');
    const brandOptions = state.brands.map((row) => `<option value="${esc(row.id)}">${esc(row.name)}</option>`).join('');

    const rows = state.products.map((product, index) => `
      <tr>
        <td><b>${esc(product.name || product.title || product.slug)}</b><br><span class="muted">${esc(product.slug)}</span></td>
        <td><select data-product-category="${index}"><option value="">Unassigned</option>${categoryOptions}</select></td>
        <td><select data-product-brand="${index}"><option value="">Unassigned</option>${brandOptions}</select></td>
        <td>${esc(product.published ? 'Published' : 'Draft')}</td>
        <td><button class="primary small" type="button" data-product-save="${index}">Save</button></td>
      </tr>`).join('');

    content.innerHTML = `
      <div class="card">
        <p class="muted">Assign each product to the structured category and brand records. Saving a category also keeps the existing legacy category/subcategory text in sync so the current public website continues to work during Phase 1 migration.</p>
        <div class="table-wrap">
          ${rows ? `<table><thead><tr><th>Product</th><th>Category</th><th>Brand</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : 'No products.'}
        </div>
      </div>`;

    state.products.forEach((product, index) => {
      const categorySelect = content.querySelector(`[data-product-category="${index}"]`);
      const brandSelect = content.querySelector(`[data-product-brand="${index}"]`);
      if (categorySelect) categorySelect.value = product.category_id || '';
      if (brandSelect) brandSelect.value = product.brand_id || '';
    });

    content.querySelectorAll('[data-product-save]').forEach((button) => {
      button.addEventListener('click', async () => {
        const index = Number(button.dataset.productSave);
        const product = state.products[index];
        const categoryId = content.querySelector(`[data-product-category="${index}"]`)?.value || null;
        const brandId = content.querySelector(`[data-product-brand="${index}"]`)?.value || null;
        const selectedCategory = state.categories.find((row) => row.id === categoryId) || null;
        const parentCategory = selectedCategory?.parent_id
          ? state.categories.find((row) => row.id === selectedCategory.parent_id) || null
          : null;

        const payload = {
          category_id: categoryId,
          brand_id: brandId,
          updated_by: await currentUserId()
        };

        if (selectedCategory) {
          payload.category = parentCategory ? parentCategory.name : selectedCategory.name;
          payload.subcategory = parentCategory ? selectedCategory.name : null;
        }

        button.disabled = true;
        const result = await client.from('products').update(payload).eq('id', product.id);
        button.disabled = false;
        if (result.error) return alert(result.error.message);

        product.category_id = categoryId;
        product.brand_id = brandId;
        if (selectedCategory) {
          product.category = payload.category;
          product.subcategory = payload.subcategory;
        }
        await logEvent('UPDATE', 'products', product.name || product.title || product.slug);
        alert(`Classification saved for ${product.name || product.title || product.slug}.`);
      });
    });
  }

  mountNavigation();

  if (refreshBtn) {
    const originalRefresh = refreshBtn.onclick;
    refreshBtn.onclick = function (event) {
      if (state.view) {
        event?.preventDefault?.();
        return renderCurrent();
      }
      if (typeof originalRefresh === 'function') return originalRefresh.call(this, event);
    };
  }

  client.auth.onAuthStateChange(() => {
    setTimeout(refreshPermission, 0);
  });
  refreshPermission();
})();
