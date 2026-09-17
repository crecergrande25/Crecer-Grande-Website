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
    categories: [],
    products: [],
    variants: [],
    definitions: []
  };

  const VALUE_TYPES = [['text','Text'],['number','Number'],['boolean','Yes / No'],['json','JSON']];
  const MEDIA_TYPES = [['image','Image'],['diagram','Diagram'],['video','Video']];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
  const slugify = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const bool = (value) => value === true || value === 'true' || value === 'on';
  const nOr = (value, fallback = 100) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const optionList = (rows, selected) => rows.map(([value,label]) => `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(label)}</option>`).join('');

  async function currentUserId() {
    const { data } = await client.auth.getUser();
    return data.user?.id || null;
  }

  async function logEvent(action, label) {
    try {
      await client.rpc('log_admin_event', { p_action: action, p_module: 'catalog_enrichment', p_record_label: label || '' });
    } catch (_) {}
  }

  function showStatus(message, error = false) {
    if (!content) return;
    content.innerHTML = `<div class="card">${error ? '<b>Error:</b> ' : ''}${esc(message)}</div>`;
  }

  function buttons() { return Array.from(document.querySelectorAll('[data-enrichment-view]')); }
  function setVisible(visible) { buttons().forEach((b) => { b.style.display = visible ? '' : 'none'; }); }
  function activate(view) {
    document.querySelectorAll('.sidebar button').forEach((b) => b.classList.remove('active'));
    document.querySelector(`[data-enrichment-view="${view}"]`)?.classList.add('active');
  }

  function mountNavigation() {
    if (document.querySelector('[data-enrichment-view]')) return;
    const anchorStart = document.querySelector('[data-view="variants"]');
    if (!anchorStart) return;
    const defs = [
      ['spec-definitions', 'Specification Templates'],
      ['spec-values', 'Product Specifications'],
      ['product-media', 'Product Media']
    ];
    let anchor = anchorStart;
    defs.forEach(([view,label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.enrichmentView = view;
      button.textContent = label;
      button.style.display = 'none';
      button.addEventListener('click', () => openView(view));
      anchor.insertAdjacentElement('afterend', button);
      anchor = button;
    });
    document.querySelectorAll('[data-view], [data-catalog-view], [data-tech-view], [data-quality-view]').forEach((b) => {
      b.addEventListener('click', () => { state.view = null; buttons().forEach((x) => x.classList.remove('active')); });
    });
  }

  async function refreshPermission() {
    const { data: { session } } = await client.auth.getSession();
    if (!session) { state.allowed = false; setVisible(false); return; }
    const { data, error } = await client.rpc('get_my_permissions');
    state.allowed = !error && (data || []).some((r) => r.permission_key === 'products.edit' && r.allowed === true);
    setVisible(state.allowed);
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
      if (state.view === 'spec-definitions') return renderDefinitions();
      if (state.view === 'spec-values') return renderValues();
      if (state.view === 'product-media') return renderMedia();
    } catch (error) { showStatus(error.message || String(error), true); }
  }

  async function loadBase() {
    const [cats, products, variants, definitions] = await Promise.all([
      client.from('product_categories').select('id,name,parent_id,published').order('sort_order').order('name'),
      client.from('products').select('id,name,title,slug,category_id,published').order('name'),
      client.from('product_variants').select('id,product_id,variant_name,name,sku,published').order('sort_order'),
      client.from('product_attribute_definitions').select('*').order('sort_order').order('attribute_name')
    ]);
    for (const x of [cats, products, variants, definitions]) if (x.error) throw x.error;
    state.categories = cats.data || [];
    state.products = products.data || [];
    state.variants = variants.data || [];
    state.definitions = definitions.data || [];
  }

  const productLabel = (id) => {
    const x = state.products.find((r) => r.id === id);
    return x ? (x.name || x.title || x.slug) : id || '';
  };
  const variantLabel = (id) => {
    const x = state.variants.find((r) => r.id === id);
    return x ? (x.variant_name || x.name || x.sku || x.id) : '';
  };
  const categoryLabel = (id) => state.categories.find((r) => r.id === id)?.name || '';
  const definitionLabel = (id) => state.definitions.find((r) => r.id === id)?.attribute_name || '';
  const productOptions = (selected) => state.products.map((r) => `<option value="${esc(r.id)}" ${selected === r.id ? 'selected' : ''}>${esc(productLabel(r.id))}${r.published ? '' : ' [Draft]'}</option>`).join('');
  const variantOptions = (productId, selected) => state.variants.filter((r) => r.product_id === productId).map((r) => `<option value="${esc(r.id)}" ${selected === r.id ? 'selected' : ''}>${esc(variantLabel(r.id))}${r.published ? '' : ' [Draft]'}</option>`).join('');
  const categoryOptions = (selected) => state.categories.map((r) => `<option value="${esc(r.id)}" ${selected === r.id ? 'selected' : ''}>${esc(r.name)}${r.published ? '' : ' [Draft]'}</option>`).join('');
  const definitionOptions = (productId, selected) => {
    const product = state.products.find((p) => p.id === productId);
    return state.definitions.filter((d) => !product?.category_id || d.category_id === product.category_id).map((d) => `<option value="${esc(d.id)}" ${selected === d.id ? 'selected' : ''}>${esc(d.attribute_name)} (${esc(d.value_type)})${d.published ? '' : ' [Draft]'}</option>`).join('');
  };

  async function renderDefinitions(edit = null) {
    viewTitle.textContent = 'Specification Templates';
    await loadBase();
    const { data, error } = await client.from('product_attribute_definitions').select('*').order('sort_order').order('attribute_name');
    if (error) throw error;
    const rows = data || [];
    const r = edit || {};
    content.innerHTML = `
      <div class="card"><h2>${r.id ? 'Edit specification template' : 'Add specification template'}</h2>
        <p class="muted">Define the technical fields expected for a product category. New templates start as Draft.</p>
        <form id="enrich-def-form">
          <input type="hidden" name="id" value="${esc(r.id || '')}">
          <div class="form-grid">
            <label>Category<select name="category_id" required><option value="">Select category</option>${categoryOptions(r.category_id)}</select></label>
            <label>Specification name<input name="attribute_name" required value="${esc(r.attribute_name || '')}" placeholder="e.g. Rated voltage"></label>
            <label>Key<input name="attribute_key" required value="${esc(r.attribute_key || '')}" placeholder="rated_voltage"></label>
            <label>Value type<select name="value_type">${optionList(VALUE_TYPES, r.value_type || 'text')}</select></label>
            <label>Unit<input name="unit" value="${esc(r.unit || '')}" placeholder="V, mm, kW, bar..."></label>
            <label>Sort order<input name="sort_order" type="number" value="${esc(r.sort_order ?? 100)}"></label>
          </div>
          <div class="check-row"><label><input name="filterable" type="checkbox" ${r.filterable ? 'checked' : ''}> Filterable</label><label><input name="searchable" type="checkbox" ${r.searchable ? 'checked' : ''}> Searchable</label><label><input name="required_for_category" type="checkbox" ${r.required_for_category ? 'checked' : ''}> Required for category</label><label><input name="published" type="checkbox" ${r.published ? 'checked' : ''}> Published</label></div>
          <div class="toolbar"><button class="primary" type="submit">${r.id ? 'Save changes' : 'Add template'}</button>${r.id ? '<button class="secondary" id="enrich-def-cancel" type="button">Cancel</button>' : ''}</div>
        </form>
      </div>
      <div class="card"><h2>Existing templates</h2><div class="table-wrap"><table><thead><tr><th>Category</th><th>Specification</th><th>Type</th><th>Flags</th><th>Status</th><th></th></tr></thead><tbody>
        ${rows.length ? rows.map((x) => `<tr><td>${esc(categoryLabel(x.category_id))}</td><td><b>${esc(x.attribute_name)}</b><br><small>${esc(x.attribute_key)}${x.unit ? ` • ${esc(x.unit)}` : ''}</small></td><td>${esc(x.value_type)}</td><td>${x.required_for_category ? 'Required ' : ''}${x.filterable ? 'Filter ' : ''}${x.searchable ? 'Search' : ''}</td><td>${x.published ? 'Published' : 'Draft'}</td><td><button class="small" data-def-edit="${esc(x.id)}">Edit</button> <button class="small danger" data-def-delete="${esc(x.id)}">Delete</button></td></tr>`).join('') : '<tr><td colspan="6">No templates yet.</td></tr>'}
      </tbody></table></div></div>`;

    const form = document.getElementById('enrich-def-form');
    const nameInput = form.elements.attribute_name;
    const keyInput = form.elements.attribute_key;
    let keyTouched = !!r.id;
    keyInput.addEventListener('input', () => { keyTouched = true; });
    nameInput.addEventListener('input', () => { if (!keyTouched) keyInput.value = slugify(nameInput.value); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(form); const uid = await currentUserId();
        const payload = {
          category_id: fd.get('category_id'), attribute_name: String(fd.get('attribute_name') || '').trim(), attribute_key: slugify(fd.get('attribute_key')),
          value_type: fd.get('value_type'), unit: String(fd.get('unit') || '').trim() || null,
          filterable: fd.has('filterable'), searchable: fd.has('searchable'), required_for_category: fd.has('required_for_category'),
          sort_order: nOr(fd.get('sort_order')), published: fd.has('published'), updated_by: uid
        };
        if (!payload.attribute_key) throw new Error('A specification key is required.');
        const id = fd.get('id');
        const q = id ? client.from('product_attribute_definitions').update(payload).eq('id', id) : client.from('product_attribute_definitions').insert(payload);
        const { error } = await q; if (error) throw error;
        await logEvent(id ? 'update' : 'create', payload.attribute_name); await renderDefinitions();
      } catch (err) { alert(err.message || err); }
    });
    document.getElementById('enrich-def-cancel')?.addEventListener('click', () => renderDefinitions());
    document.querySelectorAll('[data-def-edit]').forEach((b) => b.addEventListener('click', () => renderDefinitions(rows.find((x) => x.id === b.dataset.defEdit))));
    document.querySelectorAll('[data-def-delete]').forEach((b) => b.addEventListener('click', async () => {
      const row = rows.find((x) => x.id === b.dataset.defDelete); if (!row || !confirm(`Delete specification template “${row.attribute_name}”? Existing values using it will also be deleted.`)) return;
      const { error } = await client.from('product_attribute_definitions').delete().eq('id', row.id); if (error) return alert(error.message);
      await logEvent('delete', row.attribute_name); renderDefinitions();
    }));
  }

  function valueFor(row) {
    if (row.value_text != null) return row.value_text;
    if (row.value_number != null) return row.value_number;
    if (row.value_boolean != null) return row.value_boolean ? 'Yes' : 'No';
    if (row.value_json != null) return JSON.stringify(row.value_json);
    return '';
  }

  async function renderValues(edit = null) {
    viewTitle.textContent = 'Product Specifications';
    await loadBase();
    const { data, error } = await client.from('product_attribute_values').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    const rows = data || []; const r = edit || {};
    const initialProduct = r.product_id || state.products[0]?.id || '';
    const initialDef = state.definitions.find((d) => d.id === r.attribute_definition_id) || null;
    content.innerHTML = `
      <div class="card"><h2>${r.id ? 'Edit specification value' : 'Add specification value'}</h2>
        <p class="muted">Values can apply to the whole product or one specific variant. Only published values appear on public product pages.</p>
        <form id="enrich-value-form"><input type="hidden" name="id" value="${esc(r.id || '')}">
          <div class="form-grid">
            <label>Product<select name="product_id" required>${productOptions(initialProduct)}</select></label>
            <label>Variant (optional)<select name="variant_id"><option value="">Whole product</option>${variantOptions(initialProduct, r.variant_id)}</select></label>
            <label>Specification<select name="attribute_definition_id" required><option value="">Select specification</option>${definitionOptions(initialProduct, r.attribute_definition_id)}</select></label>
            <label id="enrich-value-field">Value<input name="value" value="${esc(valueFor(r))}"></label>
          </div>
          <label><input name="published" type="checkbox" ${r.published ? 'checked' : ''}> Published</label>
          <div class="toolbar"><button class="primary" type="submit">${r.id ? 'Save changes' : 'Add value'}</button>${r.id ? '<button class="secondary" id="enrich-value-cancel" type="button">Cancel</button>' : ''}</div>
        </form>
      </div>
      <div class="card"><h2>Structured specification values</h2><div class="table-wrap"><table><thead><tr><th>Product</th><th>Variant</th><th>Specification</th><th>Value</th><th>Status</th><th></th></tr></thead><tbody>
        ${rows.length ? rows.map((x) => `<tr><td>${esc(productLabel(x.product_id))}</td><td>${esc(x.variant_id ? variantLabel(x.variant_id) : 'Whole product')}</td><td>${esc(definitionLabel(x.attribute_definition_id))}</td><td>${esc(valueFor(x))}</td><td>${x.published ? 'Published' : 'Draft'}</td><td><button class="small" data-value-edit="${esc(x.id)}">Edit</button> <button class="small danger" data-value-delete="${esc(x.id)}">Delete</button></td></tr>`).join('') : '<tr><td colspan="6">No structured specification values yet.</td></tr>'}
      </tbody></table></div></div>`;

    const form = document.getElementById('enrich-value-form');
    const productSelect = form.elements.product_id, variantSelect = form.elements.variant_id, defSelect = form.elements.attribute_definition_id;
    function updateDependent() {
      const pid = productSelect.value;
      variantSelect.innerHTML = `<option value="">Whole product</option>${variantOptions(pid, variantSelect.value)}`;
      const selected = defSelect.value;
      defSelect.innerHTML = `<option value="">Select specification</option>${definitionOptions(pid, selected)}`;
      if (![...defSelect.options].some((o) => o.value === selected)) defSelect.value = '';
      updateValueControl();
    }
    function updateValueControl() {
      const def = state.definitions.find((d) => d.id === defSelect.value) || initialDef;
      const holder = document.getElementById('enrich-value-field');
      const existing = form.elements.value?.value ?? valueFor(r);
      if (!def) return holder.innerHTML = `Value<input name="value" value="${esc(existing)}">`;
      if (def.value_type === 'boolean') holder.innerHTML = `Value<select name="value"><option value="true" ${existing === true || existing === 'Yes' || existing === 'true' ? 'selected' : ''}>Yes</option><option value="false" ${existing === false || existing === 'No' || existing === 'false' ? 'selected' : ''}>No</option></select>`;
      else if (def.value_type === 'number') holder.innerHTML = `Value${def.unit ? ` (${esc(def.unit)})` : ''}<input name="value" type="number" step="any" value="${esc(existing)}">`;
      else if (def.value_type === 'json') holder.innerHTML = `JSON value<textarea name="value" rows="4">${esc(existing)}</textarea>`;
      else holder.innerHTML = `Value${def.unit ? ` (${esc(def.unit)})` : ''}<input name="value" value="${esc(existing)}">`;
    }
    productSelect.addEventListener('change', updateDependent); defSelect.addEventListener('change', updateValueControl); updateValueControl();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(form), def = state.definitions.find((d) => d.id === fd.get('attribute_definition_id'));
        if (!def) throw new Error('Select a valid specification.');
        const product = state.products.find((p) => p.id === fd.get('product_id'));
        if (def.category_id && product?.category_id !== def.category_id) throw new Error('This specification template belongs to a different product category.');
        const variantId = fd.get('variant_id') || null;
        if (variantId && !state.variants.some((v) => v.id === variantId && v.product_id === product.id)) throw new Error('The selected variant does not belong to this product.');
        const raw = String(fd.get('value') ?? '').trim(), uid = await currentUserId();
        const payload = { product_id: product.id, variant_id: variantId, attribute_definition_id: def.id, value_text: null, value_number: null, value_boolean: null, value_json: null, published: fd.has('published'), updated_by: uid };
        if (def.value_type === 'number') { if (raw === '' || !Number.isFinite(Number(raw))) throw new Error('Enter a valid number.'); payload.value_number = Number(raw); }
        else if (def.value_type === 'boolean') payload.value_boolean = raw === 'true';
        else if (def.value_type === 'json') { if (!raw) throw new Error('Enter JSON.'); payload.value_json = JSON.parse(raw); }
        else { if (!raw) throw new Error('Enter a value.'); payload.value_text = raw; }
        const id = fd.get('id');
        const q = id ? client.from('product_attribute_values').update(payload).eq('id', id) : client.from('product_attribute_values').insert(payload);
        const { error } = await q; if (error) throw error;
        await logEvent(id ? 'update' : 'create', `${productLabel(product.id)} — ${def.attribute_name}`); renderValues();
      } catch (err) { alert(err.message || err); }
    });
    document.getElementById('enrich-value-cancel')?.addEventListener('click', () => renderValues());
    document.querySelectorAll('[data-value-edit]').forEach((b) => b.addEventListener('click', () => renderValues(rows.find((x) => x.id === b.dataset.valueEdit))));
    document.querySelectorAll('[data-value-delete]').forEach((b) => b.addEventListener('click', async () => {
      const row = rows.find((x) => x.id === b.dataset.valueDelete); if (!row || !confirm('Delete this specification value?')) return;
      const { error } = await client.from('product_attribute_values').delete().eq('id', row.id); if (error) return alert(error.message);
      await logEvent('delete', `${productLabel(row.product_id)} — ${definitionLabel(row.attribute_definition_id)}`); renderValues();
    }));
  }

  function validMediaUrl(value) {
    const s = String(value || '').trim();
    return /^https?:\/\//i.test(s) || /^\/?assets\//i.test(s) || /^\.\.\/assets\//i.test(s);
  }

  async function renderMedia(edit = null) {
    viewTitle.textContent = 'Product Media';
    await loadBase();
    const { data, error } = await client.from('product_media').select('*').order('sort_order').order('updated_at', { ascending: false });
    if (error) throw error;
    const rows = data || []; const r = edit || {}; const initialProduct = r.product_id || state.products[0]?.id || '';
    content.innerHTML = `
      <div class="card"><h2>${r.id ? 'Edit product media' : 'Add product media'}</h2>
        <p class="muted">Use an existing public Website Media URL or a site asset path. Product Media is catalogue-specific and appears automatically on the public product page when published.</p>
        <form id="enrich-media-form"><input type="hidden" name="id" value="${esc(r.id || '')}">
          <div class="form-grid">
            <label>Product<select name="product_id" required>${productOptions(initialProduct)}</select></label>
            <label>Variant (optional)<select name="variant_id"><option value="">Whole product</option>${variantOptions(initialProduct, r.variant_id)}</select></label>
            <label>Media type<select name="media_type">${optionList(MEDIA_TYPES, r.media_type || 'image')}</select></label>
            <label>Sort order<input name="sort_order" type="number" value="${esc(r.sort_order ?? 100)}"></label>
            <label class="span-2">File URL / site asset path<input name="file_url" required value="${esc(r.file_url || '')}" placeholder="https://... or assets/images/..."></label>
            <label class="span-2">Thumbnail URL (optional)<input name="thumbnail_url" value="${esc(r.thumbnail_url || '')}"></label>
            <label>Alt text<input name="alt_text" value="${esc(r.alt_text || '')}" placeholder="Describe the image"></label>
            <label>Caption<input name="caption" value="${esc(r.caption || '')}"></label>
          </div>
          <div class="check-row"><label><input name="is_primary" type="checkbox" ${r.is_primary ? 'checked' : ''}> Primary catalogue media</label><label><input name="published" type="checkbox" ${r.published ? 'checked' : ''}> Published</label></div>
          <p class="muted">For images and diagrams, add meaningful alt text before publishing. Marking one row primary will clear the primary flag from other media for the same product.</p>
          <div class="toolbar"><button class="primary" type="submit">${r.id ? 'Save changes' : 'Add media'}</button>${r.id ? '<button class="secondary" id="enrich-media-cancel" type="button">Cancel</button>' : ''}</div>
        </form>
      </div>
      <div class="card"><h2>Catalogue media records</h2><div class="table-wrap"><table><thead><tr><th>Product</th><th>Variant</th><th>Type</th><th>File</th><th>Primary</th><th>Status</th><th></th></tr></thead><tbody>
        ${rows.length ? rows.map((x) => `<tr><td>${esc(productLabel(x.product_id))}</td><td>${esc(x.variant_id ? variantLabel(x.variant_id) : 'Whole product')}</td><td>${esc(x.media_type)}</td><td><small>${esc(x.file_url)}</small></td><td>${x.is_primary ? 'Yes' : ''}</td><td>${x.published ? 'Published' : 'Draft'}</td><td><button class="small" data-media-edit="${esc(x.id)}">Edit</button> <button class="small danger" data-media-delete="${esc(x.id)}">Delete</button></td></tr>`).join('') : '<tr><td colspan="7">No product media records yet.</td></tr>'}
      </tbody></table></div></div>`;
    const form = document.getElementById('enrich-media-form'), productSelect = form.elements.product_id, variantSelect = form.elements.variant_id;
    productSelect.addEventListener('change', () => { variantSelect.innerHTML = `<option value="">Whole product</option>${variantOptions(productSelect.value, '')}`; });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(form), productId = fd.get('product_id'), variantId = fd.get('variant_id') || null;
        if (variantId && !state.variants.some((v) => v.id === variantId && v.product_id === productId)) throw new Error('The selected variant does not belong to this product.');
        const fileUrl = String(fd.get('file_url') || '').trim(), thumbnail = String(fd.get('thumbnail_url') || '').trim();
        if (!validMediaUrl(fileUrl)) throw new Error('Use an HTTPS/HTTP URL or a site assets path.');
        if (thumbnail && !validMediaUrl(thumbnail)) throw new Error('Thumbnail URL must be HTTP/HTTPS or a site assets path.');
        const type = fd.get('media_type'), alt = String(fd.get('alt_text') || '').trim();
        if (fd.has('published') && type !== 'video' && !alt) throw new Error('Published images/diagrams need alt text.');
        const uid = await currentUserId();
        const payload = { product_id: productId, variant_id: variantId, media_type: type, file_url: fileUrl, thumbnail_url: thumbnail || null, alt_text: alt || null, caption: String(fd.get('caption') || '').trim() || null, is_primary: fd.has('is_primary'), sort_order: nOr(fd.get('sort_order')), published: fd.has('published'), updated_by: uid };
        if (payload.is_primary) {
          const { error: clearError } = await client.from('product_media').update({ is_primary: false, updated_by: uid }).eq('product_id', productId).eq('is_primary', true);
          if (clearError) throw clearError;
        }
        const id = fd.get('id');
        const q = id ? client.from('product_media').update(payload).eq('id', id) : client.from('product_media').insert(payload);
        const { error } = await q; if (error) throw error;
        await logEvent(id ? 'update' : 'create', `${productLabel(productId)} — ${type}`); renderMedia();
      } catch (err) { alert(err.message || err); }
    });
    document.getElementById('enrich-media-cancel')?.addEventListener('click', () => renderMedia());
    document.querySelectorAll('[data-media-edit]').forEach((b) => b.addEventListener('click', () => renderMedia(rows.find((x) => x.id === b.dataset.mediaEdit))));
    document.querySelectorAll('[data-media-delete]').forEach((b) => b.addEventListener('click', async () => {
      const row = rows.find((x) => x.id === b.dataset.mediaDelete); if (!row || !confirm('Delete this product media record? The underlying uploaded file is not deleted.')) return;
      const { error } = await client.from('product_media').delete().eq('id', row.id); if (error) return alert(error.message);
      await logEvent('delete', `${productLabel(row.product_id)} — ${row.media_type}`); renderMedia();
    }));
  }

  mountNavigation();
  refreshPermission();
  const previousRefresh = refreshBtn?.onclick;
  if (refreshBtn) refreshBtn.addEventListener('click', () => { if (state.view) renderCurrent(); else if (typeof previousRefresh === 'function') previousRefresh(); });
  client.auth.onAuthStateChange(() => setTimeout(refreshPermission, 0));
})();