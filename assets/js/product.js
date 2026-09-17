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
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency', currency, maximumFractionDigits: 2
      }).format(amount);
    } catch (_) {
      return `${currency} ${amount.toLocaleString('en-IN')}`;
    }
  };

  function absoluteUrl(value) {
    const raw = clean(value);
    if (!raw) return '';
    try {
      if (/^https?:\/\//i.test(raw)) return new URL(raw).href;
      return new URL('/' + raw.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/^\/+/, ''), location.origin).href;
    } catch (_) {
      return '';
    }
  }

  function safeHref(value) {
    const raw = clean(value);
    if (!raw) return '';
    try {
      const url = new URL(raw, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) {
      return '';
    }
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

  function updateSeo(product) {
    if (clean(product.seo_title)) document.title = product.seo_title;
    setMeta('meta[name="description"]', product.seo_description || product.short_description || product.description, true);
    setMeta('meta[property="og:title"]', product.seo_title || product.name);
    setMeta('meta[property="og:description"]', product.seo_description || product.short_description || product.description, true);
    setMeta('meta[name="twitter:title"]', product.seo_title || product.name);
    setMeta('meta[name="twitter:description"]', product.seo_description || product.short_description || product.description, true);
    const canonical = safeHref(product.canonical_url);
    if (canonical) {
      const node = document.querySelector('link[rel="canonical"]');
      if (node) node.href = canonical;
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

  function commercialLabel(product) {
    if (product.price_mode === 'fixed' && Number(product.public_price) > 0) {
      return money(product.public_price, product.price_currency || 'INR');
    }
    if (product.price_mode === 'from' && Number(product.public_price) > 0) {
      return `From ${money(product.public_price, product.price_currency || 'INR')}`;
    }
    if (product.price_mode === 'range' && Number(product.public_price) > 0 && Number(product.compare_at_price) > Number(product.public_price)) {
      return `${money(product.public_price, product.price_currency || 'INR')}–${money(product.compare_at_price, product.price_currency || 'INR')}`;
    }
    return 'Quotation based';
  }

  function stockLabel(status) {
    const map = {
      in_stock: 'In stock',
      limited_stock: 'Limited stock',
      on_order: 'On order',
      import_against_order: 'Import against order',
      made_to_order: 'Made to order',
      out_of_stock: 'Out of stock',
      discontinued: 'Discontinued',
      unknown: 'Confirmed at quotation'
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
      genuine_oem: 'Genuine OEM',
      compatible_aftermarket: 'Compatible aftermarket',
      engineered_replacement: 'Engineered replacement',
      custom_manufactured: 'Custom manufactured',
      unspecified: 'Confirmed per requirement'
    };
    return map[value] || 'Confirmed per requirement';
  }

  function attributeValue(row, definition) {
    if (row.value_text != null && clean(row.value_text)) return row.value_text;
    if (row.value_number != null) return `${row.value_number}${clean(definition?.unit) ? ` ${definition.unit}` : ''}`;
    if (row.value_boolean != null) return row.value_boolean ? 'Yes' : 'No';
    if (row.value_json != null) return typeof row.value_json === 'string' ? row.value_json : JSON.stringify(row.value_json);
    return '';
  }

  function objectSpecs(object) {
    if (!object || typeof object !== 'object' || Array.isArray(object)) return [];
    return Object.entries(object)
      .filter(([, value]) => value != null && clean(typeof value === 'object' ? JSON.stringify(value) : value))
      .map(([key, value]) => ({
        name: titleCase(key),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));
  }

  function normalizedSpecs(attributes, variantId = null) {
    const definitions = new Map((attributes?.definitions || []).map((definition) => [definition.id, definition]));
    return (attributes?.values || [])
      .filter((row) => (variantId ? row.variant_id === variantId : !row.variant_id))
      .map((row) => {
        const definition = definitions.get(row.attribute_definition_id);
        const value = attributeValue(row, definition);
        return definition && value ? {
          name: definition.attribute_name || titleCase(definition.attribute_key),
          value
        } : null;
      })
      .filter(Boolean);
  }

  function renderVariants(product, variants, attributes) {
    const box = document.getElementById('product-variants');
    if (!box || !variants.length) return;

    box.innerHTML = variants.map((variant) => {
      const name = clean(variant.variant_name) || clean(variant.name) || 'Configured option';
      const identity = [
        variant.sku ? `SKU: ${variant.sku}` : '',
        variant.manufacturer_part_number ? `MPN: ${variant.manufacturer_part_number}` : '',
        variant.model_number ? `Model: ${variant.model_number}` : ''
      ].filter(Boolean);

      const facts = [];
      if (variant.moq) facts.push(`MOQ ${Number(variant.moq).toLocaleString('en-IN')} ${variant.unit || product.unit || ''}`.trim());
      if (variant.stock_status && variant.stock_status !== 'unknown') facts.push(stockLabel(variant.stock_status));
      if (variant.lead_time_note || variant.lead_time_min_days != null || variant.lead_time_max_days != null) facts.push(leadTimeLabel(variant));
      if (Number(variant.public_price) > 0) facts.push(money(variant.public_price, variant.price_currency || product.price_currency || 'INR'));
      else facts.push('Quotation based');

      const variantSpecs = [
        ...objectSpecs(variant.specifications),
        ...normalizedSpecs(attributes, variant.id)
      ];
      const specHtml = variantSpecs.length
        ? `<dl class="cg-variant-specs">${variantSpecs.map((spec) => `<div><dt>${esc(spec.name)}</dt><dd>${esc(spec.value)}</dd></div>`).join('')}</dl>`
        : '';

      return `<article class="variant-card cg-variant-card">
        <div><b>${esc(name)}</b>${identity.length ? `<span class="variant-sku">${esc(identity.join(' • '))}</span>` : ''}</div>
        <p>${esc(facts.join(' • '))}</p>
        ${specHtml}
      </article>`;
    }).join('');
  }

  function detailRow(label, value) {
    const text = clean(value);
    return text ? `<div class="cg-fact"><span>${esc(label)}</span><b>${esc(text)}</b></div>` : '';
  }

  function pageAlreadyShowsImage(src) {
    const target = absoluteUrl(src);
    if (!target) return false;
    return Array.from(main.querySelectorAll('img[src]')).some((image) => absoluteUrl(image.getAttribute('src')) === target);
  }

  function renderIntelligence(product, category, brand, attributes, compatibility, models, equipmentTypes, equipmentBrands, documents, media) {
    document.getElementById('cg-product-intelligence')?.remove();
    const section = document.createElement('section');
    section.id = 'cg-product-intelligence';
    section.className = 'section cg-product-intelligence';

    const generalSpecs = [
      ...objectSpecs(product.specifications),
      ...normalizedSpecs(attributes)
    ];

    const identityFacts = [
      detailRow('Category', category?.name),
      detailRow('Commercial basis', commercialLabel(product)),
      detailRow('Availability', stockLabel(product.stock_status)),
      detailRow('Lead time', leadTimeLabel(product)),
      detailRow('Supply type', supplyLabel(product.supply_type)),
      detailRow('Brand / manufacturer', brand?.name),
      detailRow('Model', product.model_number),
      detailRow('Manufacturer part no.', product.manufacturer_part_number),
      detailRow('GTIN / EAN / UPC', product.gtin),
      detailRow('Country of origin', product.country_of_origin)
    ].filter(Boolean).join('');

    let specsHtml = '';
    if (generalSpecs.length) {
      specsHtml = `<div class="cg-intel-block"><div class="section-head"><div><div class="subhead">Technical data</div><h2>Published specifications</h2></div><p>Values below come from the structured catalogue.</p></div><div class="cg-spec-grid">${generalSpecs.map((spec) => detailRow(spec.name, spec.value)).join('')}</div></div>`;
    }

    let compatibilityHtml = '';
    if (compatibility.length) {
      const modelMap = new Map(models.map((model) => [model.id, model]));
      const typeMap = new Map(equipmentTypes.map((type) => [type.id, type]));
      const brandMap = new Map(equipmentBrands.map((item) => [item.id, item]));
      const rows = compatibility.map((row) => {
        const model = modelMap.get(row.equipment_model_id) || {};
        const equipmentBrand = brandMap.get(model.brand_id);
        const type = typeMap.get(model.equipment_type_id);
        const machine = [equipmentBrand?.name, model.model_name || model.model_code].filter(Boolean).join(' ');
        const status = row.compatibility_status === 'confirmed'
          ? 'Confirmed'
          : row.compatibility_status === 'conditional'
            ? 'Conditional'
            : titleCase(row.compatibility_status || 'Under review');
        return `<tr><td>${esc(machine || 'Equipment model')}</td><td>${esc(type?.name || '')}</td><td>${esc(status)}</td><td>${esc(clean(row.compatibility_notes))}</td></tr>`;
      }).join('');
      compatibilityHtml = `<div class="cg-intel-block"><div class="section-head"><div><div class="subhead">Compatibility</div><h2>Published compatibility records</h2></div><p>Only records deliberately published from the Website Manager are shown.</p></div><div class="table-wrap"><table class="cg-tech-table"><thead><tr><th>Make / model</th><th>Equipment</th><th>Status</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    } else if (product.requires_compatibility_check) {
      compatibilityHtml = `<div class="cg-intel-block"><div class="panel cg-compatibility-note"><h3>Compatibility verification required</h3><p>No universal cross-reference is published for this product family. Share the machine/equipment make, model, existing part number or clear photographs so Crecer Grande can verify the requirement before quotation.</p></div></div>`;
    }

    let docsHtml = '';
    if (documents.length) {
      const items = documents.map((documentRow) => {
        const href = safeHref(documentRow.file_url);
        if (!href) return '';
        const meta = [
          titleCase(documentRow.document_type),
          documentRow.document_number,
          documentRow.revision ? `Rev. ${documentRow.revision}` : ''
        ].filter(Boolean).join(' • ');
        return `<a class="cg-document-card" href="${esc(href)}" target="_blank" rel="noopener"><b>${esc(documentRow.title || 'Technical document')}</b><span>${esc(meta)}</span></a>`;
      }).filter(Boolean).join('');
      if (items) {
        docsHtml = `<div class="cg-intel-block"><div class="section-head"><div><div class="subhead">Documents</div><h2>Technical documents</h2></div><p>Only currently published documents are listed.</p></div><div class="cg-doc-grid">${items}</div></div>`;
      }
    }

    let mediaHtml = '';
    if (media.length) {
      const cards = media.map((mediaRow) => {
        const src = absoluteUrl(mediaRow.file_url);
        if (!src || mediaRow.media_type === 'video' || pageAlreadyShowsImage(mediaRow.file_url)) return '';
        return `<figure class="cg-media-card"><img src="${esc(src)}" alt="${esc(mediaRow.alt_text || product.name)}" loading="lazy"><figcaption>${esc(mediaRow.caption || '')}</figcaption></figure>`;
      }).filter(Boolean).join('');
      if (cards) {
        mediaHtml = `<div class="cg-intel-block"><div class="section-head"><div><div class="subhead">Catalogue media</div><h2>Published product media</h2></div></div><div class="cg-media-grid">${cards}</div></div>`;
      }
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
      if (node.id === 'cg-live-catalog-schema') {
        node.remove();
        return;
      }
      try {
        const data = JSON.parse(node.textContent || '{}');
        const types = Array.isArray(data?.['@type']) ? data['@type'] : [data?.['@type']];
        if (types.some((type) => ['Product', 'ProductGroup'].includes(type))) node.remove();
      } catch (_) {}
    });
  }

  function availabilitySchema(status) {
    return ({
      in_stock: 'https://schema.org/InStock',
      limited_stock: 'https://schema.org/LimitedAvailability',
      out_of_stock: 'https://schema.org/OutOfStock',
      discontinued: 'https://schema.org/Discontinued'
    })[status] || '';
  }

  function jsonLdProduct(product, category, brand, attributes) {
    const canonical = safeHref(product.canonical_url) || location.href.split('#')[0];
    const image = absoluteUrl(product.image_url);
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonical}#product`,
      name: product.name,
      description: product.description || product.short_description,
      url: canonical
    };
    if (image) schema.image = [image];
    if (category?.name) schema.category = category.name;
    if (brand?.name) schema.brand = { '@type': 'Brand', name: brand.name };
    if (clean(product.cg_product_code)) schema.sku = product.cg_product_code;
    if (clean(product.manufacturer_part_number)) schema.mpn = product.manufacturer_part_number;
    if (clean(product.model_number)) schema.model = product.model_number;
    if (clean(product.gtin)) schema.gtin = product.gtin;

    const specs = [...objectSpecs(product.specifications), ...normalizedSpecs(attributes)];
    if (specs.length) {
      schema.additionalProperty = specs.map((spec) => ({
        '@type': 'PropertyValue', name: spec.name, value: spec.value
      }));
    }

    if (Number(product.public_price) > 0 && product.price_mode !== 'quote') {
      const offer = {
        '@type': 'Offer',
        url: canonical,
        price: Number(product.public_price),
        priceCurrency: product.price_currency || 'INR'
      };
      const availability = availabilitySchema(product.stock_status);
      if (availability) offer.availability = availability;
      schema.offers = offer;
    }
    return schema;
  }

  function updateStructuredData(product, category, brand, variants, attributes) {
    removeLegacyProductSchema();
    const canonical = safeHref(product.canonical_url) || location.href.split('#')[0];
    let data;

    if (product.catalog_item_type === 'family') {
      data = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonical}#catalog`,
        name: product.name,
        description: product.description || product.short_description,
        url: canonical
      };
      if (category?.name) data.about = { '@type': 'Thing', name: category.name };
      if (variants.length) {
        data.mainEntity = {
          '@type': 'ItemList',
          numberOfItems: variants.length,
          itemListElement: variants.map((variant, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: clean(variant.variant_name) || clean(variant.name) || `Option ${index + 1}`,
            ...(clean(variant.sku) ? { identifier: variant.sku } : {})
          }))
        };
      }
    } else {
      data = jsonLdProduct(product, category, brand, attributes);
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
    } catch (_) {
      return fallback;
    }
  }

  async function loadRelated(client, product) {
    const [variants, categoryRows, brandRows, attrValues, compatibility, documents, media] = await Promise.all([
      dataOr(client.from('product_variants').select('id,name,variant_name,sku,manufacturer_part_number,model_number,gtin,identifier_exists,supply_type,country_of_origin,public_price,price_currency,compare_at_price,stock_status,lead_time_min_days,lead_time_max_days,lead_time_note,unit,moq,gst_pct,attributes,specifications,sort_order').eq('product_id', product.id).eq('published', true).order('sort_order')),
      product.category_id ? dataOr(client.from('product_categories').select('id,name,slug').eq('id', product.category_id).limit(1)) : Promise.resolve([]),
      product.brand_id ? dataOr(client.from('product_brands').select('id,name,brand_role,relationship_status').eq('id', product.brand_id).limit(1)) : Promise.resolve([]),
      dataOr(client.from('product_attribute_values').select('id,variant_id,attribute_definition_id,value_text,value_number,value_boolean,value_json').eq('product_id', product.id).eq('published', true)),
      dataOr(client.from('product_compatibility').select('id,variant_id,equipment_model_id,compatibility_status,compatibility_notes,verification_source,verified_at').eq('product_id', product.id).eq('published', true)),
      dataOr(client.from('product_documents').select('id,variant_id,document_type,title,file_url,document_number,revision,language_code,valid_from,valid_until,notes,sort_order').eq('product_id', product.id).eq('published', true).order('sort_order')),
      dataOr(client.from('product_media').select('id,variant_id,media_type,file_url,thumbnail_url,alt_text,caption,is_primary,sort_order').eq('product_id', product.id).eq('published', true).order('sort_order'))
    ]);

    const definitionIds = [...new Set(attrValues.map((row) => row.attribute_definition_id).filter(Boolean))];
    const definitions = definitionIds.length
      ? await dataOr(client.from('product_attribute_definitions').select('id,attribute_key,attribute_name,value_type,unit,sort_order').in('id', definitionIds).eq('published', true).order('sort_order'))
      : [];

    const modelIds = [...new Set(compatibility.map((row) => row.equipment_model_id).filter(Boolean))];
    const models = modelIds.length
      ? await dataOr(client.from('equipment_models').select('id,equipment_type_id,brand_id,model_name,model_code,aliases,sort_order').in('id', modelIds).eq('published', true).order('sort_order'))
      : [];
    const typeIds = [...new Set(models.map((row) => row.equipment_type_id).filter(Boolean))];
    const equipmentTypes = typeIds.length
      ? await dataOr(client.from('equipment_types').select('id,name,slug').in('id', typeIds).eq('published', true))
      : [];
    const equipmentBrandIds = [...new Set(models.map((row) => row.brand_id).filter(Boolean))];
    const equipmentBrands = equipmentBrandIds.length
      ? await dataOr(client.from('product_brands').select('id,name').in('id', equipmentBrandIds).eq('published', true))
      : [];

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
      const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
      const { data: product, error } = await client.from('products').select('*').eq('slug', slug).maybeSingle();
      if (error) return;
      if (!product) {
        markUnavailable();
        return;
      }

      setText('[data-product="name"]', product.name);
      setText('[data-product="short_description"]', product.short_description, true);
      setText('[data-product="description"]', product.description, true);
      updateSeo(product);

      const related = await loadRelated(client, product);
      renderVariants(product, related.variants, related.attributes);
      renderIntelligence(
        product,
        related.category,
        related.brand,
        related.attributes,
        related.compatibility,
        related.models,
        related.equipmentTypes,
        related.equipmentBrands,
        related.documents,
        related.media
      );
      updateStructuredData(product, related.category, related.brand, related.variants, related.attributes);
    } catch (_) {
      // Preserve the static page if the live catalogue layer is temporarily unavailable.
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
