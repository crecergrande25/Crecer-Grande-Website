(() => {
  'use strict';

  const cfg = window.CG_CONFIG || {};
  if (!window.supabase || !cfg.supabaseUrl || !cfg.supabasePublishableKey) return;

  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
  const content = document.getElementById('content');
  const viewTitle = document.getElementById('view-title');
  const refreshBtn = document.getElementById('refresh');

  const state = {
    view: null,
    allowed: false,
    equipmentTypes: [],
    equipmentModels: [],
    brands: [],
    products: [],
    variants: []
  };

  const COMPATIBILITY_STATUSES = [
    ['reference_only', 'Reference only'],
    ['conditional', 'Conditional'],
    ['confirmed', 'Confirmed']
  ];

  const DOCUMENT_TYPES = [
    ['datasheet', 'Datasheet'],
    ['drawing', 'Drawing'],
    ['manual', 'Manual'],
    ['certificate', 'Certificate'],
    ['compatibility', 'Compatibility'],
    ['installation', 'Installation'],
    ['maintenance', 'Maintenance'],
    ['other', 'Other']
  ];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  const slugify = (value) => String(value || '')
    .trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const optionList = (options, selected) => options.map(([value, label]) =>
    `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(label)}</option>`
  ).join('');

  const numberOr = (value, fallback = 100) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const parseJson = (value, fallback = {}) => {
    const text = String(value || '').trim();
    if (!text) return fallback;
    const parsed = JSON.parse(text);
    return parsed;
  };

  const parseArray = (value) => {
    const text = String(value || '').trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
    } catch (_) {}
    return text.split(',').map((x) => x.trim()).filter(Boolean);
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

  function showStatus(message, error = false) {
    if (!content) return;
    content.innerHTML = `<div class="card">${error ? '<b>Error:</b> ' : ''}${esc(message)}</div>`;
  }

  function customButtons() {
    return Array.from(document.querySelectorAll('[data-tech-view]'));
  }

  function setCustomVisible(visible) {
    customButtons().forEach((button) => { button.style.display = visible ? '' : 'none'; });
  }

  function activate(view) {
    document.querySelectorAll('.sidebar button').forEach((button) => button.classList.remove('active'));
    document.querySelector(`[data-tech-view="${view}"]`)?.classList.add('active');
  }

  function mountNavigation() {
    if (document.querySelector('[data-tech-view]')) return;
    const anchorStart = document.querySelector('[data-view="variants"]');
    if (!anchorStart) return;

    const defs = [
      ['equipment-types', 'Equipment Types'],
      ['equipment-models', 'Equipment Models'],
      ['compatibility', 'Product Compatibility'],
      ['documents', 'Product Documents']
    ];

    let anchor = anchorStart;
    defs.forEach(([view, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.techView = view;
      button.textContent = label;
      button.style.display = 'none';
      button.addEventListener('click', () => openView(view));
      anchor.insertAdjacentElement('afterend', button);
      anchor = button;
    });

    document.querySelectorAll('[data-view], [data-catalog-view]').forEach((button) => {
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
      return setCustomVisible(false);
    }
    const { data, error } = await client.rpc('get_my_permissions');
    state.allowed = !error && (data || []).some((row) =>
      row.permission_key === 'products.edit' && row.allowed === true
    );
    setCustomVisible(state.allowed);
  }

  async function openView(view) {
    await refreshPermission();
    if (!state.allowed) return showStatus('No permission.');
    state.view = view;
    activate(view);
    await renderCurrent();
  }

  async function renderCurrent() {
    if (!state.view) return;
    showStatus('Loading…');
    try {
      if (state.view === 'equipment-types') return renderEquipmentTypes();
      if (state.view === 'equipment-models') return renderEquipmentModels();
      if (state.view === 'compatibility') return renderCompatibility();
      if (state.view === 'documents') return renderDocuments();
    } catch (error) {
      showStatus(error.message || String(error), true);
    }
  }

  async function loadEquipmentTypes() {
    const { data, error } = await client.from('equipment_types').select('*')
      .order('sort_order', { ascending: true }).order('name', { ascending: true });
    if (error) throw error;
    state.equipmentTypes = data || [];
  }

  async function loadBrands() {
    const { data, error } = await client.from('product_brands').select('id,name,published')
      .order('name', { ascending: true });
    if (error) throw error;
    state.brands = data || [];
  }

  async function loadEquipmentModels() {
    const { data, error } = await client.from('equipment_models').select('*')
      .order('sort_order', { ascending: true }).order('model_name', { ascending: true });
    if (error) throw error;
    state.equipmentModels = data || [];
  }

  async function loadProducts() {
    const { data, error } = await client.from('products').select('id,name,title,slug,published')
      .order('name', { ascending: true });
    if (error) throw error;
    state.products = data || [];
  }

  async function loadVariants() {
    const { data, error } = await client.from('product_variants')
      .select('id,product_id,variant_name,name,sku,published').order('sort_order', { ascending: true });
    if (error) throw error;
    state.variants = data || [];
  }

  function productLabel(id) {
    const row = state.products.find((x) => x.id === id);
    return row ? (row.name || row.title || row.slug) : id || '';
  }

  function variantLabel(id) {
    const row = state.variants.find((x) => x.id === id);
    if (!row) return '';
    return row.variant_name || row.name || row.sku || row.id;
  }

  function typeLabel(id) {
    return state.equipmentTypes.find((x) => x.id === id)?.name || '';
  }

  function brandLabel(id) {
    return state.brands.find((x) => x.id === id)?.name || '';
  }

  function modelLabel(row) {
    if (!row) return '';
    const brand = brandLabel(row.brand_id);
    const type = typeLabel(row.equipment_type_id);
    return [brand, row.model_name, type ? `(${type})` : ''].filter(Boolean).join(' ');
  }

  function statusText(published) {
    return published ? 'Published' : 'Draft';
  }

  function productOptions(selected) {
    return state.products.map((row) =>
      `<option value="${esc(row.id)}" ${selected === row.id ? 'selected' : ''}>${esc(productLabel(row.id))}</option>`
    ).join('');
  }

  function variantOptions(productId, selected) {
    return state.variants.filter((row) => row.product_id === productId).map((row) =>
      `<option value="${esc(row.id)}" ${selected === row.id ? 'selected' : ''}>${esc(variantLabel(row.id))}</option>`
    ).join('');
  }

  function typeOptions(selected) {
    return state.equipmentTypes.map((row) =>
      `<option value="${esc(row.id)}" ${selected === row.id ? 'selected' : ''}>${esc(row.name)}</option>`
    ).join('');
  }

  function brandOptions(selected) {
    return state.brands.map((row) =>
      `<option value="${esc(row.id)}" ${selected === row.id ? 'selected' : ''}>${esc(row.name)}</option>`
    ).join('');
  }

  function modelOptions(selected) {
    return state.equipmentModels.map((row) =>
      `<option value="${esc(row.id)}" ${selected === row.id ? 'selected' : ''}>${esc(modelLabel(row))}</option>`
    ).join('');
  }

  async function renderEquipmentTypes() {
    if (viewTitle) viewTitle.textContent = 'Equipment Types';
    await loadEquipmentTypes();
    const rows = state.equipmentTypes.map((row, index) => `
      <tr><td>${esc(row.name)}</td><td>${esc(row.slug)}</td><td>${esc(statusText(row.published))}</td>
      <td>${esc(row.sort_order)}</td><td><button class="primary small" data-type-edit="${index}" type="button">Edit</button></td></tr>`
    ).join('');

    content.innerHTML = `
      <div class="card"><div class="toolbar"><button class="primary" id="tech-add-type" type="button">+ Add equipment type</button></div>
      <p class="muted">Examples: fibre laser cutter, CO₂ laser cutter, CNC/VMC, industrial chiller and other equipment families used for compatibility mapping.</p>
      <div class="table-wrap">${rows ? `<table><thead><tr><th>Name</th><th>Slug</th><th>Status</th><th>Order</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : 'No equipment types.'}</div></div>
      <div id="tech-editor"></div>`;

    document.getElementById('tech-add-type')?.addEventListener('click', () => editEquipmentType(null));
    content.querySelectorAll('[data-type-edit]').forEach((button) => {
      button.addEventListener('click', () => editEquipmentType(state.equipmentTypes[Number(button.dataset.typeEdit)]));
    });
  }

  function editEquipmentType(row) {
    const editor = document.getElementById('tech-editor');
    if (!editor) return;
    const isNew = !row?.id;
    const published = isNew ? false : row.published === true;
    editor.innerHTML = `
      <form class="card" id="tech-type-form"><h2>${isNew ? 'Add equipment type' : `Edit ${esc(row.name)}`}</h2>
      <div class="grid2">
        <label class="field">Name<input name="name" required value="${esc(row?.name || '')}"></label>
        <label class="field">Slug<input name="slug" required value="${esc(row?.slug || '')}"></label>
        <label class="field">Description<textarea name="description" rows="4">${esc(row?.description || '')}</textarea></label>
        <label class="field">Sort order<input name="sort_order" type="number" value="${esc(row?.sort_order ?? 100)}"></label>
        <label class="field">Published<select name="published"><option value="false" ${!published ? 'selected' : ''}>false</option><option value="true" ${published ? 'selected' : ''}>true</option></select></label>
      </div><div class="toolbar"><button class="primary" type="submit">${isNew ? 'Create' : 'Save'}</button>${isNew ? '' : '<button class="danger" id="tech-delete-type" type="button">Delete</button>'}</div></form>`;

    const form = document.getElementById('tech-type-form');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        const fd = new FormData(form);
        const name = String(fd.get('name') || '').trim();
        const slug = slugify(fd.get('slug') || name);
        if (!name || !slug) throw new Error('Name and slug are required.');
        const payload = {
          name, slug,
          description: String(fd.get('description') || '').trim() || null,
          sort_order: numberOr(fd.get('sort_order')),
          published: fd.get('published') === 'true',
          updated_by: await currentUserId()
        };
        const result = isNew
          ? await client.from('equipment_types').insert(payload)
          : await client.from('equipment_types').update(payload).eq('id', row.id);
        if (result.error) throw result.error;
        await logEvent(isNew ? 'CREATE' : 'UPDATE', 'equipment_types', name);
        alert(isNew ? 'Equipment type created.' : 'Equipment type saved.');
        await renderEquipmentTypes();
      } catch (error) { alert(error.message || String(error)); }
    });

    document.getElementById('tech-delete-type')?.addEventListener('click', async () => {
      if (!confirm(`Delete equipment type "${row.name}"? Linked equipment models will keep existing but become type-unassigned.`)) return;
      const result = await client.from('equipment_types').delete().eq('id', row.id);
      if (result.error) return alert(result.error.message);
      await logEvent('DELETE', 'equipment_types', row.name);
      await renderEquipmentTypes();
    });
  }

  async function renderEquipmentModels() {
    if (viewTitle) viewTitle.textContent = 'Equipment Models';
    await Promise.all([loadEquipmentTypes(), loadBrands(), loadEquipmentModels()]);
    const rows = state.equipmentModels.map((row, index) => `
      <tr><td>${esc(row.model_name)}</td><td>${esc(typeLabel(row.equipment_type_id))}</td><td>${esc(brandLabel(row.brand_id))}</td>
      <td>${esc(row.model_code || '')}</td><td>${esc(statusText(row.published))}</td>
      <td><button class="primary small" data-model-edit="${index}" type="button">Edit</button></td></tr>`
    ).join('');

    content.innerHTML = `
      <div class="card"><div class="toolbar"><button class="primary" id="tech-add-model" type="button">+ Add equipment model</button></div>
      <p class="muted">Create exact machine/chiller/equipment models before linking products as confirmed or conditional replacements.</p>
      <div class="table-wrap">${rows ? `<table><thead><tr><th>Model</th><th>Type</th><th>Brand</th><th>Code</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : 'No equipment models yet.'}</div></div>
      <div id="tech-editor"></div>`;

    document.getElementById('tech-add-model')?.addEventListener('click', () => editEquipmentModel(null));
    content.querySelectorAll('[data-model-edit]').forEach((button) => {
      button.addEventListener('click', () => editEquipmentModel(state.equipmentModels[Number(button.dataset.modelEdit)]));
    });
  }

  function editEquipmentModel(row) {
    const editor = document.getElementById('tech-editor');
    if (!editor) return;
    const isNew = !row?.id;
    const published = isNew ? false : row.published === true;
    editor.innerHTML = `
      <form class="card" id="tech-model-form"><h2>${isNew ? 'Add equipment model' : `Edit ${esc(row.model_name)}`}</h2>
      <div class="grid2">
        <label class="field">Model name<input name="model_name" required value="${esc(row?.model_name || '')}"></label>
        <label class="field">Model code<input name="model_code" value="${esc(row?.model_code || '')}"></label>
        <label class="field">Equipment type<select name="equipment_type_id"><option value="">Unassigned</option>${typeOptions(row?.equipment_type_id || '')}</select></label>
        <label class="field">Brand<select name="brand_id"><option value="">Unassigned</option>${brandOptions(row?.brand_id || '')}</select></label>
        <label class="field">Aliases (JSON array or comma-separated)<textarea name="aliases" rows="3">${esc(JSON.stringify(row?.aliases || []))}</textarea></label>
        <label class="field">Specifications (JSON)<textarea name="specifications" rows="5">${esc(JSON.stringify(row?.specifications || {}, null, 2))}</textarea></label>
        <label class="field">Notes<textarea name="notes" rows="4">${esc(row?.notes || '')}</textarea></label>
        <label class="field">Sort order<input name="sort_order" type="number" value="${esc(row?.sort_order ?? 100)}"></label>
        <label class="field">Published<select name="published"><option value="false" ${!published ? 'selected' : ''}>false</option><option value="true" ${published ? 'selected' : ''}>true</option></select></label>
      </div><div class="toolbar"><button class="primary" type="submit">${isNew ? 'Create' : 'Save'}</button>${isNew ? '' : '<button class="danger" id="tech-delete-model" type="button">Delete</button>'}</div></form>`;

    const form = document.getElementById('tech-model-form');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        const fd = new FormData(form);
        const modelName = String(fd.get('model_name') || '').trim();
        if (!modelName) throw new Error('Model name is required.');
        const specs = parseJson(fd.get('specifications'), {});
        if (specs && (Array.isArray(specs) || typeof specs !== 'object')) throw new Error('Specifications must be a JSON object.');
        const payload = {
          model_name: modelName,
          model_code: String(fd.get('model_code') || '').trim() || null,
          equipment_type_id: fd.get('equipment_type_id') || null,
          brand_id: fd.get('brand_id') || null,
          aliases: parseArray(fd.get('aliases')),
          specifications: specs || {},
          notes: String(fd.get('notes') || '').trim() || null,
          sort_order: numberOr(fd.get('sort_order')),
          published: fd.get('published') === 'true',
          updated_by: await currentUserId()
        };
        const result = isNew
          ? await client.from('equipment_models').insert(payload)
          : await client.from('equipment_models').update(payload).eq('id', row.id);
        if (result.error) throw result.error;
        await logEvent(isNew ? 'CREATE' : 'UPDATE', 'equipment_models', modelName);
        alert(isNew ? 'Equipment model created.' : 'Equipment model saved.');
        await renderEquipmentModels();
      } catch (error) { alert(error.message || String(error)); }
    });

    document.getElementById('tech-delete-model')?.addEventListener('click', async () => {
      if (!confirm(`Delete equipment model "${row.model_name}"? Compatibility links for this model will also be deleted.`)) return;
      const result = await client.from('equipment_models').delete().eq('id', row.id);
      if (result.error) return alert(result.error.message);
      await logEvent('DELETE', 'equipment_models', row.model_name);
      await renderEquipmentModels();
    });
  }

  async function renderCompatibility() {
    if (viewTitle) viewTitle.textContent = 'Product Compatibility';
    await Promise.all([loadProducts(), loadVariants(), loadEquipmentTypes(), loadBrands(), loadEquipmentModels()]);
    const { data, error } = await client.from('product_compatibility').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const rowsData = data || [];
    const rows = rowsData.map((row, index) => {
      const model = state.equipmentModels.find((x) => x.id === row.equipment_model_id);
      return `<tr><td>${esc(productLabel(row.product_id))}${row.variant_id ? `<br><span class="muted">${esc(variantLabel(row.variant_id))}</span>` : ''}</td>
      <td>${esc(modelLabel(model))}</td><td>${esc(row.compatibility_status)}</td><td>${esc(statusText(row.published))}</td>
      <td><button class="primary small" data-compat-edit="${index}" type="button">Edit</button></td></tr>`;
    }).join('');

    content.innerHTML = `
      <div class="card"><div class="toolbar"><button class="primary" id="tech-add-compat" type="button">+ Add compatibility</button></div>
      <p class="muted">Use <b>Confirmed</b> only when compatibility is technically verified. Use Conditional where fitment or operating conditions must be checked, and Reference only where the association is not a verified replacement claim.</p>
      <div class="table-wrap">${rows ? `<table><thead><tr><th>Product / Variant</th><th>Equipment model</th><th>Status</th><th>Published</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : 'No compatibility records yet.'}</div></div>
      <div id="tech-editor"></div>`;

    document.getElementById('tech-add-compat')?.addEventListener('click', () => editCompatibility(null));
    content.querySelectorAll('[data-compat-edit]').forEach((button) => {
      button.addEventListener('click', () => editCompatibility(rowsData[Number(button.dataset.compatEdit)]));
    });
  }

  function editCompatibility(row) {
    const editor = document.getElementById('tech-editor');
    if (!editor) return;
    const isNew = !row?.id;
    const productId = row?.product_id || state.products[0]?.id || '';
    const status = row?.compatibility_status || 'reference_only';
    const published = isNew ? false : row.published === true;

    editor.innerHTML = `
      <form class="card" id="tech-compat-form"><h2>${isNew ? 'Add compatibility' : 'Edit compatibility'}</h2>
      <div class="grid2">
        <label class="field">Product<select name="product_id" id="tech-compat-product" required><option value="">Choose product</option>${productOptions(productId)}</select></label>
        <label class="field">Variant (optional)<select name="variant_id" id="tech-compat-variant"><option value="">Product-level compatibility</option>${variantOptions(productId, row?.variant_id || '')}</select></label>
        <label class="field">Equipment model<select name="equipment_model_id" required><option value="">Choose model</option>${modelOptions(row?.equipment_model_id || '')}</select></label>
        <label class="field">Compatibility status<select name="compatibility_status">${optionList(COMPATIBILITY_STATUSES, status)}</select></label>
        <label class="field">Verification source<textarea name="verification_source" rows="3">${esc(row?.verification_source || '')}</textarea></label>
        <label class="field">Compatibility notes<textarea name="compatibility_notes" rows="4">${esc(row?.compatibility_notes || '')}</textarea></label>
        <label class="field">Published<select name="published"><option value="false" ${!published ? 'selected' : ''}>false</option><option value="true" ${published ? 'selected' : ''}>true</option></select></label>
      </div><div class="toolbar"><button class="primary" type="submit">${isNew ? 'Create' : 'Save'}</button>${isNew ? '' : '<button class="danger" id="tech-delete-compat" type="button">Delete</button>'}</div></form>`;

    const productSelect = document.getElementById('tech-compat-product');
    const variantSelect = document.getElementById('tech-compat-variant');
    productSelect?.addEventListener('change', () => {
      if (variantSelect) variantSelect.innerHTML = `<option value="">Product-level compatibility</option>${variantOptions(productSelect.value, '')}`;
    });

    const form = document.getElementById('tech-compat-form');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        const fd = new FormData(form);
        const chosenProduct = String(fd.get('product_id') || '');
        const chosenVariant = String(fd.get('variant_id') || '') || null;
        const chosenModel = String(fd.get('equipment_model_id') || '');
        if (!chosenProduct || !chosenModel) throw new Error('Product and equipment model are required.');
        if (chosenVariant && !state.variants.some((x) => x.id === chosenVariant && x.product_id === chosenProduct)) {
          throw new Error('Selected variant does not belong to the selected product.');
        }
        const userId = await currentUserId();
        const chosenStatus = String(fd.get('compatibility_status') || 'reference_only');
        const payload = {
          product_id: chosenProduct,
          variant_id: chosenVariant,
          equipment_model_id: chosenModel,
          compatibility_status: chosenStatus,
          verification_source: String(fd.get('verification_source') || '').trim() || null,
          compatibility_notes: String(fd.get('compatibility_notes') || '').trim() || null,
          published: fd.get('published') === 'true',
          updated_by: userId
        };
        if (chosenStatus === 'confirmed' && !row?.verified_at) {
          payload.verified_at = new Date().toISOString();
          payload.verified_by = userId;
        }
        const result = isNew
          ? await client.from('product_compatibility').insert(payload)
          : await client.from('product_compatibility').update(payload).eq('id', row.id);
        if (result.error) throw result.error;
        await logEvent(isNew ? 'CREATE' : 'UPDATE', 'product_compatibility', `${productLabel(chosenProduct)} / ${modelLabel(state.equipmentModels.find((x) => x.id === chosenModel))}`);
        alert(isNew ? 'Compatibility created.' : 'Compatibility saved.');
        await renderCompatibility();
      } catch (error) { alert(error.message || String(error)); }
    });

    document.getElementById('tech-delete-compat')?.addEventListener('click', async () => {
      if (!confirm('Delete this compatibility record?')) return;
      const result = await client.from('product_compatibility').delete().eq('id', row.id);
      if (result.error) return alert(result.error.message);
      await logEvent('DELETE', 'product_compatibility', productLabel(row.product_id));
      await renderCompatibility();
    });
  }

  async function renderDocuments() {
    if (viewTitle) viewTitle.textContent = 'Product Documents';
    await Promise.all([loadProducts(), loadVariants()]);
    const { data, error } = await client.from('product_documents').select('*')
      .order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) throw error;
    const rowsData = data || [];
    const rows = rowsData.map((row, index) => `
      <tr><td>${esc(productLabel(row.product_id))}${row.variant_id ? `<br><span class="muted">${esc(variantLabel(row.variant_id))}</span>` : ''}</td>
      <td>${esc(row.title)}</td><td>${esc(row.document_type)}</td><td>${esc(row.revision || '')}</td><td>${esc(statusText(row.published))}</td>
      <td><button class="primary small" data-doc-edit="${index}" type="button">Edit</button></td></tr>`
    ).join('');

    content.innerHTML = `
      <div class="card"><div class="toolbar"><button class="primary" id="tech-add-doc" type="button">+ Add document</button></div>
      <p class="muted">Attach product-level or variant-level datasheets, drawings, manuals, certificates and maintenance/installation references. New documents start as Draft.</p>
      <div class="table-wrap">${rows ? `<table><thead><tr><th>Product / Variant</th><th>Title</th><th>Type</th><th>Rev.</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : 'No product documents yet.'}</div></div>
      <div id="tech-editor"></div>`;

    document.getElementById('tech-add-doc')?.addEventListener('click', () => editDocument(null));
    content.querySelectorAll('[data-doc-edit]').forEach((button) => {
      button.addEventListener('click', () => editDocument(rowsData[Number(button.dataset.docEdit)]));
    });
  }

  function editDocument(row) {
    const editor = document.getElementById('tech-editor');
    if (!editor) return;
    const isNew = !row?.id;
    const productId = row?.product_id || state.products[0]?.id || '';
    const docType = row?.document_type || 'other';
    const published = isNew ? false : row.published === true;

    editor.innerHTML = `
      <form class="card" id="tech-doc-form"><h2>${isNew ? 'Add product document' : `Edit ${esc(row.title)}`}</h2>
      <div class="grid2">
        <label class="field">Product<select name="product_id" id="tech-doc-product" required><option value="">Choose product</option>${productOptions(productId)}</select></label>
        <label class="field">Variant (optional)<select name="variant_id" id="tech-doc-variant"><option value="">Product-level document</option>${variantOptions(productId, row?.variant_id || '')}</select></label>
        <label class="field">Document type<select name="document_type">${optionList(DOCUMENT_TYPES, docType)}</select></label>
        <label class="field">Title<input name="title" required value="${esc(row?.title || '')}"></label>
        <label class="field">File URL<input name="file_url" required type="url" value="${esc(row?.file_url || '')}"></label>
        <label class="field">Document number<input name="document_number" value="${esc(row?.document_number || '')}"></label>
        <label class="field">Revision<input name="revision" value="${esc(row?.revision || '')}"></label>
        <label class="field">Language code<input name="language_code" value="${esc(row?.language_code || 'en')}"></label>
        <label class="field">Valid from<input name="valid_from" type="date" value="${esc(row?.valid_from || '')}"></label>
        <label class="field">Valid until<input name="valid_until" type="date" value="${esc(row?.valid_until || '')}"></label>
        <label class="field">Notes<textarea name="notes" rows="4">${esc(row?.notes || '')}</textarea></label>
        <label class="field">Sort order<input name="sort_order" type="number" value="${esc(row?.sort_order ?? 100)}"></label>
        <label class="field">Published<select name="published"><option value="false" ${!published ? 'selected' : ''}>false</option><option value="true" ${published ? 'selected' : ''}>true</option></select></label>
      </div><div class="toolbar"><button class="primary" type="submit">${isNew ? 'Create' : 'Save'}</button>${isNew ? '' : '<button class="danger" id="tech-delete-doc" type="button">Delete</button>'}</div></form>`;

    const productSelect = document.getElementById('tech-doc-product');
    const variantSelect = document.getElementById('tech-doc-variant');
    productSelect?.addEventListener('change', () => {
      if (variantSelect) variantSelect.innerHTML = `<option value="">Product-level document</option>${variantOptions(productSelect.value, '')}`;
    });

    const form = document.getElementById('tech-doc-form');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        const fd = new FormData(form);
        const chosenProduct = String(fd.get('product_id') || '');
        const chosenVariant = String(fd.get('variant_id') || '') || null;
        const title = String(fd.get('title') || '').trim();
        const fileUrl = String(fd.get('file_url') || '').trim();
        const validFrom = String(fd.get('valid_from') || '') || null;
        const validUntil = String(fd.get('valid_until') || '') || null;
        if (!chosenProduct || !title || !fileUrl) throw new Error('Product, title and file URL are required.');
        if (chosenVariant && !state.variants.some((x) => x.id === chosenVariant && x.product_id === chosenProduct)) {
          throw new Error('Selected variant does not belong to the selected product.');
        }
        if (validFrom && validUntil && validUntil < validFrom) throw new Error('Valid until cannot be earlier than Valid from.');
        const payload = {
          product_id: chosenProduct,
          variant_id: chosenVariant,
          document_type: String(fd.get('document_type') || 'other'),
          title,
          file_url: fileUrl,
          document_number: String(fd.get('document_number') || '').trim() || null,
          revision: String(fd.get('revision') || '').trim() || null,
          language_code: String(fd.get('language_code') || 'en').trim() || 'en',
          valid_from: validFrom,
          valid_until: validUntil,
          notes: String(fd.get('notes') || '').trim() || null,
          sort_order: numberOr(fd.get('sort_order')),
          published: fd.get('published') === 'true',
          updated_by: await currentUserId()
        };
        const result = isNew
          ? await client.from('product_documents').insert(payload)
          : await client.from('product_documents').update(payload).eq('id', row.id);
        if (result.error) throw result.error;
        await logEvent(isNew ? 'CREATE' : 'UPDATE', 'product_documents', title);
        alert(isNew ? 'Document created.' : 'Document saved.');
        await renderDocuments();
      } catch (error) { alert(error.message || String(error)); }
    });

    document.getElementById('tech-delete-doc')?.addEventListener('click', async () => {
      if (!confirm(`Delete document "${row.title}"?`)) return;
      const result = await client.from('product_documents').delete().eq('id', row.id);
      if (result.error) return alert(result.error.message);
      await logEvent('DELETE', 'product_documents', row.title);
      await renderDocuments();
    });
  }

  mountNavigation();

  if (refreshBtn) {
    const priorRefresh = refreshBtn.onclick;
    refreshBtn.onclick = function (event) {
      if (state.view) {
        event?.preventDefault?.();
        return renderCurrent();
      }
      if (typeof priorRefresh === 'function') return priorRefresh.call(this, event);
    };
  }

  client.auth.onAuthStateChange(() => setTimeout(refreshPermission, 0));
  refreshPermission();
})();
