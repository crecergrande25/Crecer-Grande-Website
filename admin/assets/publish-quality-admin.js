(() => {
  'use strict';

  const cfg = window.CG_CONFIG || {};
  if (!window.supabase || !cfg.supabaseUrl || !cfg.supabasePublishableKey) return;

  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
  const content = document.getElementById('content');
  const viewTitle = document.getElementById('view-title');
  const refreshBtn = document.getElementById('refresh');
  const state = { active: false, allowed: false, products: [], readiness: new Map() };

  const SUPPLY_TYPES = [
    ['unspecified', 'Unspecified'],
    ['genuine_oem', 'Genuine OEM'],
    ['compatible_aftermarket', 'Compatible aftermarket'],
    ['engineered_replacement', 'Engineered replacement'],
    ['custom_manufactured', 'Custom manufactured']
  ];
  const STOCK_STATUSES = [
    ['unknown', 'Unknown'], ['in_stock', 'In stock'], ['limited_stock', 'Limited stock'],
    ['on_order', 'On order'], ['import_against_order', 'Import against order'],
    ['made_to_order', 'Made to order'], ['out_of_stock', 'Out of stock'], ['discontinued', 'Discontinued']
  ];
  const WARRANTY_TYPES = [
    ['case_by_case', 'Case by case'], ['manufacturer', 'Manufacturer'], ['limited', 'Limited'],
    ['none', 'None'], ['not_applicable', 'Not applicable']
  ];
  const PRICE_MODES = [['quote', 'Quotation'], ['fixed', 'Fixed price'], ['from', 'From price'], ['contact', 'Contact for price']];

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
  const opt = (items, selected) => items.map(([v, l]) => `<option value="${esc(v)}" ${v === selected ? 'selected' : ''}>${esc(l)}</option>`).join('');
  const boolOpt = (selected) => `<option value="true" ${selected === true ? 'selected' : ''}>Yes</option><option value="false" ${selected === false ? 'selected' : ''}>No</option>`;
  const triOpt = (selected) => `<option value="" ${selected == null ? 'selected' : ''}>Unknown / not confirmed</option><option value="true" ${selected === true ? 'selected' : ''}>Yes</option><option value="false" ${selected === false ? 'selected' : ''}>No</option>`;
  const nullableNumber = (value) => {
    const s = String(value ?? '').trim();
    if (!s) return null;
    const n = Number(s);
    if (!Number.isFinite(n)) throw new Error(`Invalid number: ${s}`);
    return n;
  };

  function show(message, error = false) {
    if (content) content.innerHTML = `<div class="card">${error ? '<b>Error:</b> ' : ''}${esc(message)}</div>`;
  }

  async function refreshPermission() {
    const { data: { session } } = await client.auth.getSession();
    if (!session) { state.allowed = false; return setVisible(false); }
    const { data, error } = await client.rpc('get_my_permissions');
    state.allowed = !error && (data || []).some((r) => r.permission_key === 'products.edit' && r.allowed === true);
    setVisible(state.allowed);
  }

  function button() { return document.querySelector('[data-quality-view="readiness"]'); }
  function setVisible(visible) { if (button()) button().style.display = visible ? '' : 'none'; }

  function mountNavigation() {
    if (button()) return;
    const productsButton = document.querySelector('[data-view="products"]');
    if (!productsButton) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.qualityView = 'readiness';
    b.textContent = 'Publish Readiness';
    b.style.display = 'none';
    b.addEventListener('click', open);
    productsButton.insertAdjacentElement('afterend', b);

    document.querySelectorAll('[data-view], [data-catalog-view], [data-tech-view]').forEach((x) => {
      x.addEventListener('click', () => { state.active = false; button()?.classList.remove('active'); });
    });
  }

  async function open() {
    await refreshPermission();
    if (!state.allowed) return show('No permission.');
    state.active = true;
    document.querySelectorAll('.sidebar button').forEach((x) => x.classList.remove('active'));
    button()?.classList.add('active');
    await renderList();
  }

  async function loadProducts() {
    const fields = 'id,name,title,slug,published,category_id,brand_id,catalog_item_type,supply_type,manufacturer_part_number,model_number,gtin,identifier_exists,country_of_origin,price_mode,public_price,price_currency,compare_at_price,stock_status,lead_time_min_days,lead_time_max_days,lead_time_note,warranty_type,warranty_notes,rfq_enabled,cart_enabled,unit,moq,hsn,gst_pct,seo_title,seo_description,canonical_url,requires_compatibility_check';
    const { data, error } = await client.from('products').select(fields).order('sort_order', { ascending: true }).order('name', { ascending: true });
    if (error) throw error;
    state.products = data || [];
  }

  async function readinessFor(id) {
    const { data, error } = await client.rpc('get_product_publish_readiness', { p_product_id: id });
    if (error) throw error;
    state.readiness.set(id, data);
    return data;
  }

  async function loadReadiness() {
    state.readiness.clear();
    await Promise.all(state.products.map((p) => readinessFor(p.id)));
  }

  function badge(r) {
    if (!r) return 'Checking…';
    return r.ready ? 'Ready ✓' : `Blocked (${r.blocker_count})`;
  }

  async function renderList() {
    if (viewTitle) viewTitle.textContent = 'Product Publish Readiness';
    show('Checking product quality…');
    try {
      await loadProducts();
      await loadReadiness();
      const blocked = state.products.filter((p) => !state.readiness.get(p.id)?.ready).length;
      const warnings = state.products.reduce((n, p) => n + Number(state.readiness.get(p.id)?.warning_count || 0), 0);
      const rows = state.products.map((p, i) => {
        const r = state.readiness.get(p.id);
        return `<tr>
          <td><b>${esc(p.name || p.title)}</b><br><span class="muted">${esc(p.slug)}</span></td>
          <td>${p.published ? 'Published' : 'Draft'}</td><td>${esc(badge(r))}</td>
          <td>${esc(r?.blocker_count ?? 0)}</td><td>${esc(r?.warning_count ?? 0)}</td>
          <td><button class="primary small" type="button" data-quality-review="${i}">Review</button></td>
        </tr>`;
      }).join('');
      content.innerHTML = `
        <div class="card">
          <h2>Publication gate</h2>
          <p class="muted">The database now prevents a product from being published when a hard blocker exists. Warnings are improvement items and do not automatically remove a quotation-led industrial product from the website.</p>
          <div class="grid2">
            <div class="panel"><b>${state.products.length - blocked}/${state.products.length}</b><br><span class="muted">Products passing hard publication checks</span></div>
            <div class="panel"><b>${warnings}</b><br><span class="muted">Quality warnings remaining across the catalogue</span></div>
          </div>
          <div class="toolbar"><button class="primary" id="quality-recheck" type="button">Recheck all</button><button id="quality-open-products" type="button">Open Products</button></div>
          <div class="table-wrap"><table><thead><tr><th>Product</th><th>State</th><th>Readiness</th><th>Blockers</th><th>Warnings</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
        </div><div id="quality-detail"></div>`;
      document.getElementById('quality-recheck')?.addEventListener('click', renderList);
      document.getElementById('quality-open-products')?.addEventListener('click', () => document.querySelector('[data-view="products"]')?.click());
      content.querySelectorAll('[data-quality-review]').forEach((b) => b.addEventListener('click', () => renderDetail(state.products[Number(b.dataset.qualityReview)])));
    } catch (e) { show(e.message || String(e), true); }
  }

  function issueList(items, emptyText) {
    if (!items?.length) return `<p class="muted">${esc(emptyText)}</p>`;
    return `<ul class="checks">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  }

  function renderDetail(p) {
    const host = document.getElementById('quality-detail');
    if (!host) return;
    const r = state.readiness.get(p.id) || {};
    host.innerHTML = `
      <div class="card">
        <h2>${esc(p.name || p.title)}</h2>
        <p><b>${r.ready ? 'Ready to publish ✓' : `Cannot publish — ${r.blocker_count || 0} blocker(s)`}</b></p>
        <div class="grid2">
          <div class="panel"><h3>Hard blockers</h3>${issueList(r.blockers, 'No hard blockers.')}</div>
          <div class="panel"><h3>Quality warnings</h3>${issueList(r.warnings, 'No quality warnings.')}</div>
        </div>
        <div class="toolbar"><button class="primary" id="quality-edit" type="button">Edit quality data</button><a class="btn" href="../products/${encodeURIComponent(p.slug)}.html" target="_blank" rel="noopener">Open public page</a></div>
      </div><div id="quality-editor"></div>`;
    document.getElementById('quality-edit')?.addEventListener('click', () => editQuality(p));
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function editQuality(p) {
    const host = document.getElementById('quality-editor');
    if (!host) return;
    host.innerHTML = `
      <form class="card" id="quality-form"><h2>Structured quality data</h2>
      <p class="muted">Only enter identifiers, OEM claims, stock, origin and compatibility facts that are known or verified. Do not create a GTIN/MPN merely to clear a warning.</p>
      <div class="grid2">
        <label class="field">Supply type<select name="supply_type">${opt(SUPPLY_TYPES, p.supply_type || 'unspecified')}</select></label>
        <label class="field">Manufacturer identifiers exist?<select name="identifier_exists">${triOpt(p.identifier_exists)}</select></label>
        <label class="field">Manufacturer part number<input name="manufacturer_part_number" value="${esc(p.manufacturer_part_number || '')}"></label>
        <label class="field">Model number<input name="model_number" value="${esc(p.model_number || '')}"></label>
        <label class="field">GTIN / EAN / UPC<input name="gtin" inputmode="numeric" value="${esc(p.gtin || '')}"></label>
        <label class="field">Country of origin<input name="country_of_origin" value="${esc(p.country_of_origin || '')}"></label>
        <label class="field">Stock status<select name="stock_status">${opt(STOCK_STATUSES, p.stock_status || 'unknown')}</select></label>
        <label class="field">Lead time minimum days<input type="number" min="0" name="lead_time_min_days" value="${esc(p.lead_time_min_days ?? '')}"></label>
        <label class="field">Lead time maximum days<input type="number" min="0" name="lead_time_max_days" value="${esc(p.lead_time_max_days ?? '')}"></label>
        <label class="field">Lead time note<input name="lead_time_note" value="${esc(p.lead_time_note || '')}"></label>
        <label class="field">Warranty type<select name="warranty_type">${opt(WARRANTY_TYPES, p.warranty_type || 'case_by_case')}</select></label>
        <label class="field">Warranty notes<textarea name="warranty_notes" rows="3">${esc(p.warranty_notes || '')}</textarea></label>
        <label class="field">Price mode<select name="price_mode">${opt(PRICE_MODES, p.price_mode || 'quote')}</select></label>
        <label class="field">Public price<input type="number" step="0.01" min="0" name="public_price" value="${esc(p.public_price ?? '')}"></label>
        <label class="field">Currency<input maxlength="3" name="price_currency" value="${esc(p.price_currency || 'INR')}"></label>
        <label class="field">Compare-at price<input type="number" step="0.01" min="0" name="compare_at_price" value="${esc(p.compare_at_price ?? '')}"></label>
        <label class="field">RFQ enabled<select name="rfq_enabled">${boolOpt(p.rfq_enabled)}</select></label>
        <label class="field">Cart enabled<select name="cart_enabled">${boolOpt(p.cart_enabled)}</select></label>
        <label class="field">Selling unit<input name="unit" value="${esc(p.unit || '')}"></label>
        <label class="field">MOQ<input type="number" step="0.01" min="0" name="moq" value="${esc(p.moq ?? '')}"></label>
        <label class="field">HSN<input name="hsn" value="${esc(p.hsn || '')}"></label>
        <label class="field">GST %<input type="number" step="0.01" min="0" name="gst_pct" value="${esc(p.gst_pct ?? '')}"></label>
        <label class="field">SEO title<input name="seo_title" value="${esc(p.seo_title || '')}"></label>
        <label class="field">Canonical URL<input type="url" name="canonical_url" value="${esc(p.canonical_url || '')}"></label>
        <label class="field">SEO description<textarea name="seo_description" rows="4">${esc(p.seo_description || '')}</textarea></label>
      </div>
      <div class="toolbar"><button class="primary" type="submit">Save & recheck</button><button id="quality-cancel" type="button">Cancel</button></div></form>`;

    document.getElementById('quality-cancel')?.addEventListener('click', () => { host.innerHTML = ''; });
    document.getElementById('quality-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      try {
        const fd = new FormData(form);
        const identRaw = String(fd.get('identifier_exists') || '');
        const minDays = nullableNumber(fd.get('lead_time_min_days'));
        const maxDays = nullableNumber(fd.get('lead_time_max_days'));
        if (minDays != null && maxDays != null && maxDays < minDays) throw new Error('Maximum lead time cannot be less than minimum lead time.');
        const payload = {
          supply_type: String(fd.get('supply_type') || 'unspecified'),
          identifier_exists: identRaw === '' ? null : identRaw === 'true',
          manufacturer_part_number: String(fd.get('manufacturer_part_number') || '').trim() || null,
          model_number: String(fd.get('model_number') || '').trim() || null,
          gtin: String(fd.get('gtin') || '').trim() || null,
          country_of_origin: String(fd.get('country_of_origin') || '').trim() || null,
          stock_status: String(fd.get('stock_status') || 'unknown'),
          lead_time_min_days: minDays,
          lead_time_max_days: maxDays,
          lead_time_note: String(fd.get('lead_time_note') || '').trim() || null,
          warranty_type: String(fd.get('warranty_type') || 'case_by_case'),
          warranty_notes: String(fd.get('warranty_notes') || '').trim() || null,
          price_mode: String(fd.get('price_mode') || 'quote'),
          public_price: nullableNumber(fd.get('public_price')),
          price_currency: String(fd.get('price_currency') || 'INR').trim().toUpperCase(),
          compare_at_price: nullableNumber(fd.get('compare_at_price')),
          rfq_enabled: fd.get('rfq_enabled') === 'true',
          cart_enabled: fd.get('cart_enabled') === 'true',
          unit: String(fd.get('unit') || '').trim() || null,
          moq: nullableNumber(fd.get('moq')),
          hsn: String(fd.get('hsn') || '').trim() || null,
          gst_pct: nullableNumber(fd.get('gst_pct')),
          seo_title: String(fd.get('seo_title') || '').trim() || null,
          seo_description: String(fd.get('seo_description') || '').trim() || null,
          canonical_url: String(fd.get('canonical_url') || '').trim() || null
        };
        const { error } = await client.from('products').update(payload).eq('id', p.id);
        if (error) throw error;
        alert('Quality data saved. Readiness will now be rechecked.');
        await renderList();
        const updated = state.products.find((x) => x.id === p.id);
        if (updated) renderDetail(updated);
      } catch (e) { alert(e.message || String(e)); }
    });
  }

  mountNavigation();
  if (refreshBtn) {
    const previous = refreshBtn.onclick;
    refreshBtn.onclick = function (event) {
      if (state.active) { event?.preventDefault?.(); return renderList(); }
      if (typeof previous === 'function') return previous.call(this, event);
    };
  }
  client.auth.onAuthStateChange(() => setTimeout(refreshPermission, 0));
  refreshPermission();
})();