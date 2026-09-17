(() => {
  'use strict';

  const main = document.querySelector('main[data-product-slug]');
  const cfg = window.CG_CONFIG || {};
  if (!main || !window.supabase || !cfg.supabaseUrl || !cfg.supabasePublishableKey) return;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  const clean = (value) => String(value ?? '').trim();
  const titleCase = (value) => clean(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const money = (value, currency = 'INR') => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '';
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount); }
    catch (_) { return `${currency} ${amount.toLocaleString('en-IN')}`; }
  };

  function absoluteUrl(value) {
    const raw = clean(value);
    if (!raw) return '';
    try {
      if (/^https?:\/\//i.test(raw)) return new URL(raw).href;
      return new URL('/' + raw.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/^\/+/, ''), location.origin).href;
    } catch (_) { return ''; }
  }

  function safeHref(value) {
    const raw = clean(value);
    if (!raw) return '';
    try {
      const u = new URL(raw, location.href);
      return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
    } catch (_) { return ''; }
  }

  function addStylesheet() {
    if (document.querySelector('link[data-cg-product-intelligence]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.cgProductIntelligence = '1';
    link.href = new URL('../assets/css/product-intelligence.css', location.href).href;
    document.head.appendChild(link);
  }

  function setMeta(selector, value, preferLonger = false) {
    const text = clean(value);
    if (!text) return;
    const node = document.querySelector(selector);
    if (!node) return;
    const current = clean(node.getAttribute('content'));
    if (preferLonger && current.length > text.length) return;
    node.setAttribute('content', text);
  }

  function updateSeo(p) {
    if (clean(p.seo_title)) document.title = p.seo_title;
    setMeta('meta[name="description"]', p.seo_description || p.short_description || p.description, true);
    setMeta('meta[property="og:title"]', p.seo_title || p.name);
    setMeta('meta[property="og:description"]', p.seo_description || p.short_description || p.description, true);
    setMeta('meta[name="twitter:title"]', p.seo_title || p.name);
    setMeta('meta[name="twitter:description"]', p.seo_description || p.short_description || p.description, true);
    const canonical = safeHref(p.canonical_url);
    if (canonical) {
      const c = document.querySelector('link[rel="canonical"]');
      if (c) c.href = canonical;
      setMeta('meta[property="og:url"]', canonical);
    }
  }

  function setText(selector, value, preferLonger = false) {
    const text = clean(value);
    if (!text) return;
    document.querySelectorAll(selector).forEach((node) => {
      const current = clean(node.textContent);
      if (preferLonger && current.length > text.length) return;
      node.textContent = text;
    });
  }

  function commercialLabel(p) {
    if (p.price_mode === 'fixed' && Number(p.public_price) > 0) return money(p.public_price, p.price_currency || 'INR');
    if (p.price_mode === 'from' && Number(p.public_price) > 0) return `From ${money(p.public_price, p.price_currency || 'INR')}`;
    if (p.price_mode === 'range' && Number(p.public_price) > 0 && Number(p.compare_at_price) > Number(p.public_price)) {
      return `${money(p.public_price, p.price_currency || 'INR')}–${money(p.compare_at_price, p.price_currency || 'INR')}`;
    }
    return 'Quotation based';
  }

  function stockLabel(status) {
    const map = {
      in_stock: 'In stock', limited_stock: 'Limited stock', on_order: 'On order',
      import_against_order: 'Import against order', made_to_order: 'Made to order',
      out_of_stock: 'Out of stock', discontinued: 'Discontinued', unknown: 'Confirmed at quotation'
    };
    return map[status] || 'Confirmed at quotation';
  }

  function leadTimeLabel(item) {
    if (clean(item.lead_time_note)) return item.lead_time_note;
    const min = Number.isFinite(Number(item.lead_time_min_days)) ? Number(item.lead_time_min_days) : null;
    const max = Number.isFinite(Number(item.lead_time_max_days)) ? Number(item.lead_time_max_days) : null;
    if (min != null && max != null) return min === max ? `${min} day${min === 1 ? '' : 's'}` : `${min}–${max} days`;
    if (min != null) return `From ${min} day${min === 1 ? '' : 's'}`;
    if (max != null) return `Up to ${max} days`;
    return 'Confirmed at quotation';
  }

  function supplyLabel(value) {
    const map = {
      genuine_oem: 'Genuine OEM', compatible_aftermarket: 'Compatible aftermarket',
      engineered_replacement: 'Engineered replacement', custom_manufactured: 'Custom manufactured',
      unspecified: 'Confirmed per requirement'
    };
    return map[value] || 'Confirmed per requirement';
  }

  function attributeValue(row, def) {
    if (row.value_text != null && clean(row.value_text)) return row.value_text;
    if (row.value_number != null) return `${row.value_number}${clean(def?.unit) ? ` ${def.unit}` : ''}`;
    if (row.value_boolean != null) return row.value_boolean ? 'Yes' : 'No';
    if (row.value_json != null) return typeof row.value_json === 'string' ? row.value_json : JSON.stringify(row.value_json);
    return '';
  }

  function objectSpecs(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
    return Object.entries(obj).filter(([, v]) => v != null && clean(typeof v === 'object' ? JSON.stringify(v) : v)).map(([k, v]) => ({
      name: titleCase(k),
      value: typeof v === 'object' ? JSON.stringify(v) : String(v)
    }));
  }

  function renderVariants(p, variants) {
    const box = document.getElementById('product-variants');
    if (!box || !variants.length) return;
    box.innerHTML = variants.map((x) => {
      const name = clean(x.variant_name) || clean(x.name) || 'Configured option';
      const identity = [x.sku ? `SKU: ${x.sku}` : '', x.manufacturer_part_number ? `MPN: ${x.manufacturer_part_number}` : '', x.model_number ? `Model: ${x.model_number}` : ''].filter(Boolean);
      const facts = [];
      if (x.moq) facts.push(`MOQ ${Number(x.moq).toLocaleString('en-IN')} ${x.unit || p.unit || ''}`.trim());
      if (x.stock_status && x.stock_status !== 'unknown') facts.push(stockLabel(x.stock_status));
      if (x.lead_time_note || x.lead_time_min_days != null || x.lead_time_max_days != null) facts.push(leadTimeLabel(x));
      if (Number(x.public_price) > 0) facts.push(money(x.public_price, x.price_currency || p.price_currency || 'INR'));
      else facts.push('Quotation based');
      return `<article class="variant-card cg-variant-card">
        <div><b>${esc(name)}</b>${identity.length ? `<span class="variant-sku">${esc(identity.join(' • '))}</span>` : ''}</div>
        <p>${esc(facts.join(' • '))}</p>
      </article>`;
    }).join('');
  }

  function detailRow(label, value) {
    const v = clean(value);
    return v ? `<div class="cg-fact"><span>${esc(label)}</span><b>${esc(v)}</b></div>` : '';
  }

  function renderIntelligence(p, category, brand, attributes, variants, compatibility, models, equipmentTypes, equipmentBrands, documents, media) {
    document.getElementById('cg-product-intelligence')?.remove();
    const section = document.createElement('section');
    section.id = 'cg-product-intelligence';
    section.className = 'section cg-product-intelligence';

    const generalSpecs = [...objectSpecs(p.specifications)];
    const defs = new Map(attributes.definitions.map((d) => [d.id, d]));
    attributes.values.filter((x) => !x.variant_id).forEach((x) => {
      const def = defs.get(x.attribute_definition_id);
      const value = attributeValue(x, def);
      if (def && value) generalSpecs.push({ name: def.attribute_name || titleCase(def.attribute_key), value });
    });

    const identityFacts = [
      detailRow('Category', category?.name),
      detailRow('Commercial basis', commercialLabel(p)),
      detailRow('Availability', stockLabel(p.stock_status)),
      detailRow('Lead time', leadTimeLabel(p)),
      detailRow('Supply type', supplyLabel(p.supply_type)),
      detailRow('Brand / manufacturer', brand?.name),
      detailRow('Model', p.model_number),
      detailRow('Manufacturer part no.', p.manufacturer_part_number),
      detailRow('GTIN / EAN / UPC', p.gtin),
      detailRow('Country of origin', p.country_of_origin)
    ].filter(Boolean).join('');

    let compatibilityHtml = '';
    if (compatibility.length) {
      const modelMap = new Map(models.map((m) => [m.id, m]));
      const typeMap = new Map(equipmentTypes.map((t) => [t.id, t]));
      const brandMap = new Map(equipmentBrands.map((b) => [b.id, b]));
      const rows = compatibility.map((x) => {
        const m = modelMap.get(x.equipment_model_id) || {};
        const b = brandMap.get(m.brand_id);
        const type = typeMap.get(m.equipment_type_id);
        const machine = [b?.name, m.model_name || m.model_code].filter(Boolean).join(' ');
        const status = x.compatibility_status === 'confirmed' ? 'Confirmed' : x.compatibility_status === 'conditional' ? 'Conditional' : titleCase(x.compatibility_status || 'Under review');
        const note = clean(x.compatibility_notes);
        return `<tr><td>${esc(machine || 'Equipment model')}</td><td>${esc(type?.name || '')}</td><td>${esc(status)}</td><td>${esc(note)}</td></tr>`;
      }).join('');
      compatibilityHtml = `<div class="cg-intel-block"><div class="section-head"><div><div class="subhead">Compatibility</div><h2>Published compatibility records</h2></div><p>Only records deliberately published from the Website Manager are shown.</p></div><div class="table-wrap"><table class="cg-tech-table"><thead><tr><th>Make / model</th><th>Equipment</th><th>Status</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    } else if (p.requires_compatibility_check) {
      compatibilityHtml = `<div class="cg-intel-block"><div class="panel cg-compatibility-note"><h3>Compatibility verification required</h3><p>No universal cross-reference is published for this product family. Share the machine/equipment make, model, existing part number or clear photographs so Crecer Grande can verify the requirement before quotation.</p></div></div>`;
    }

    let specsHtml = '';
    if (generalSpecs.length) {
      specsHtml = `<div class="cg-intel-block"><div class="section-head"><div><div class="subhead">Technical data</div><h2>Published specifications</h2></div><p>Values below come from the structured catalogue.</p></div><div class="cg-spec-grid">${generalSpecs.map((s) => detailRow(s.name, s.value)).join('')}</div></div>`;
    }

    let docsHtml = '';
    if (documents.length) {
      const items = documents.map((d) => {
        const href = safeHref(d.file_url);
        if (!href) return '';
        const meta = [titleCase(d.document_type), d.document_number, d.revision ? `Rev. ${d.revision}` : ''].filter(Boolean).join(' • ');
        return `<a class="cg-document-card" href="${esc(href)}" target="_blank" rel="noopener"><b>${esc(d.title || 'Technical document')}</b><span>${esc(meta)}</span></a>`;
      }).filter(Boolean).join('');
      if (items) docsHtml = `<div class="cg-intel-block"><div class="section-head"><div><div class="subhead">Documents</div><h2>Technical documents</h2></div><p>Only currently published documents are listed.</p></div><div class="cg-doc-grid">${items}</div></div>`;
    }

    let mediaHtml = '';
    if (media.length) {
      const cards = media.map((m) => {
        const src = absoluteUrl(m.file_url);
        if (!src || m.media_type === 'video') return '';
        return `<figure class="cg-media-card"><img src="${esc(src)}" alt="${esc(m.alt_text || p.name)}" loading="lazy"><figcaption>${esc(m.caption || '')}</figcaption></figure>`;
      }).filter(Boolean).join('');
      if (cards) mediaHtml = `<div class="cg-intel-block"><div class="section-head"><div><div class="subhead">Catalogue media</div><h2>Published product media</h2></div></div><div class="cg-media-grid">${cards}</div></div>`;
    }

    section.innerHTML = `<div class="container">
      <div class="section-head"><div><div class="subhead">Live catalogue data</div><h2>Commercial & technical summary</h2></div><p>Structured information is shown only when it is available or explicitly confirmed.</p></div>
      <div class="cg-fact-grid">${identityFacts}</div>
      ${specsHtml}${compatibilityHtml}${docsHtml}${mediaHtml}
    </div>`;

    const cta = main.querySelector('.cta');
    if (cta) cta.insertAdjacentElement('beforebegin', section);
    else main.appendChild(section);
  }

  function removeLegacyProductSchema() {
    document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
      if (node.id === 'cg-live-catalog-schema') { node.remove(); return; }
      try {
        const data = JSON.parse(node.textContent || '{}');
        const types = Array.isArray(data?.['@type']) ? data['@type'] : [data?.['@type']];
        if (types.some((t) => ['Product', 'ProductGroup'].includes(t))) node.remove();
      } catch (_) {}
    });
  }

  function availabilitySchema(status) {
    return ({
      in_stock: 'https://schema.org/InStock', limited_stock: 'https://schema.org/LimitedAvailability',
      out_of_stock: 'https://schema.org/OutOfStock', discontinued: 'https://schema.org/Discontinued'
    })[status] || '';
  }

  function jsonLdProduct(p, category, brand) {
    const canonical = safeHref(p.canonical_url) || location.href.split('#')[0];
    const image = absoluteUrl(p.image_url);
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonical}#product`,
      name: p.name,
      description: p.description || p.short_description,
      url: canonical
    };
    if (image) schema.image = [image];
    if (category?.name) schema.category = category.name;
    if (brand?.name) schema.brand = { '@type': 'Brand', name: brand.name };
    if (clean(p.cg_product_code)) schema.sku = p.cg_product_code;
    if (clean(p.manufacturer_part_number)) schema.mpn = p.manufacturer_part_number;
    if (clean(p.model_number)) schema.model = p.model_number;
    if (clean(p.gtin)) schema.gtin = p.gtin;
    const specs = objectSpecs(p.specifications);
    if (specs.length) schema.additionalProperty = specs.map((s) => ({ '@type': 'PropertyValue', name: s.name, value: s.value }));
    if (Number(p.public_price) > 0 && p.price_mode !== 'quote') {
      const offer = {
        '@type': 'Offer',
        url: canonical,
        price: Number(p.public_price),
        priceCurrency: p.price_currency || 'INR'
      };
      const availability = availabilitySchema(p.stock_status);
      if (availability) offer.availability = availability;
      schema.offers = offer;
    }
    return schema;
  }

  function updateStructuredData(p, category, brand, variants) {
    removeLegacyProductSchema();
    const canonical = safeHref(p.canonical_url) || location.href.split('#')[0];
    let data;
    if (p.catalog_item_type === 'family') {
      data = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonical}#catalog`,
        name: p.name,
        description: p.description || p.short_description,
        url: canonical
      };
      if (category?.name) data.about = { '@type': 'Thing', name: category.name };
      if (variants.length) {
        data.mainEntity = {
          '@type': 'ItemList',
          numberOfItems: variants.length,
          itemListElement: variants.map((v, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: clean(v.variant_name) || clean(v.name) || `Option ${i + 1}`,
            ...(clean(v.sku) ? { identifier: v.sku } : {})
          }))
        };
      }
    } else {
      data = jsonLdProduct(p, category, brand);
    }
    const node = document.createElement('script');
    node.id = 'cg-live-catalog-schema';
    node.type = 'application/ld+json';
    node.textContent = JSON.stringify(data);
    document.head.appendChild(node);
  }

  async function dataOr(query, fallback = []) {
    try {
      const { data, error } = await query;
      if (error) return fallback;
      return data ?? fallback;
    } catch (_) { return fallback; }
  }

  async function loadRelated(c, p) {
    const [variants, categoryRows, brandRows, attrValues, compatibility, documents, media] = await Promise.all([
      dataOr(c.from('product_variants').select('id,name,variant_name,sku,manufacturer_part_number,model_number,gtin,identifier_exists,supply_type,country_of_origin,public_price,price_currency,compare_at_price,stock_status,lead_time_min_days,lead_time_max_days,lead_time_note,unit,moq,gst_pct,attributes,specifications,sort_order').eq('product_id', p.id).eq('published', true).order('sort_order')),
      p.category_id ? dataOr(c.from('product_categories').select('id,name,slug').eq('id', p.category_id).limit(1)) : Promise.resolve([]),
      p.brand_id ? dataOr(c.from('product_brands').select('id,name,brand_role,relationship_status').eq('id', p.brand_id).limit(1)) : Promise.resolve([]),
      dataOr(c.from('product_attribute_values').select('id,variant_id,attribute_definition_id,value_text,value_number,value_boolean,value_json').eq('product_id', p.id).eq('published', true)),
      dataOr(c.from('product_compatibility').select('id,variant_id,equipment_model_id,compatibility_status,compatibility_notes,verification_source,verified_at').eq('product_id', p.id).eq('published', true)),
      dataOr(c.from('product_documents').select('id,variant_id,document_type,title,file_url,document_number,revision,language_code,valid_from,valid_until,notes,sort_order').eq('product_id', p.id).eq('published', true).order('sort_order')),
      dataOr(c.from('product_media').select('id,variant_id,media_type,file_url,thumbnail_url,alt_text,caption,is_primary,sort_order').eq('product_id', p.id).eq('published', true).order('sort_order'))
    ]);

    const attrDefIds = [...new Set(attrValues.map((x) => x.attribute_definition_id).filter(Boolean))];
    const definitions = attrDefIds.length ? await dataOr(c.from('product_attribute_definitions').select('id,attribute_key,attribute_name,value_type,unit,sort_order').in('id', attrDefIds).eq('published', true).order('sort_order')) : [];

    const modelIds = [...new Set(compatibility.map((x) => x.equipment_model_id).filter(Boolean))];
    const models = modelIds.length ? await dataOr(c.from('equipment_models').select('id,equipment_type_id,brand_id,model_name,model_code,aliases,sort_order').in('id', modelIds).eq('published', true).order('sort_order')) : [];
    const typeIds = [...new Set(models.map((x) => x.equipment_type_id).filter(Boolean))];
    const equipmentTypes = typeIds.length ? await dataOr(c.from('equipment_types').select('id,name,slug').in('id', typeIds).eq('published', true)) : [];
    const equipmentBrandIds = [...new Set(models.map((x) => x.brand_id).filter(Boolean))];
    const equipmentBrands = equipmentBrandIds.length ? await dataOr(c.from('product_brands').select('id,name').in('id', equipmentBrandIds).eq('published', true)) : [];

    return {
      variants,
      category: categoryRows[0] || null,
      brand: brandRows[0] || null,
      attributes: { values: attrValues, definitions },
      compatibility,
      models,
      equipmentTypes,
      equipmentBrands,
      documents,
      media
    };
  }

  function markUnavailable() {
    removeLegacyProductSchema();
    main.innerHTML = '<section class="page-hero"><div class="container"><h1>Product unavailable.</h1><p>This catalogue item is not currently published. Please contact Crecer Grande if you have a related requirement.</p><div class="actions"><a class="btn primary" href="../contact.html">Contact Crecer Grande</a><a class="btn outline" href="../products.html">Browse Products</a></div></div></section>';
    document.title = 'Product unavailable | Crecer Grande';
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', 'noindex,follow');
  }

  async function init() {
    addStylesheet();
    const slug = main.dataset.productSlug;
    try {
      const c = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
      const { data: p, error } = await c.from('products').select('*').eq('slug', slug).maybeSingle();
      if (error) return;
      if (!p) { markUnavailable(); return; }

      setText('[data-product="name"]', p.name);
      setText('[data-product="short_description"]', p.short_description, true);
      setText('[data-product="description"]', p.description, true);
      updateSeo(p);

      const related = await loadRelated(c, p);
      renderVariants(p, related.variants);
      renderIntelligence(p, related.category, related.brand, related.attributes, related.variants, related.compatibility, related.models, related.equipmentTypes, related.equipmentBrands, related.documents, related.media);
      updateStructuredData(p, related.category, related.brand, related.variants);
    } catch (_) {
      // Keep the static page usable if the live catalogue layer is temporarily unavailable.
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();