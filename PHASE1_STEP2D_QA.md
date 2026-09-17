# Phase 1 — Step 2D Public Product Intelligence

Verified on 2026-09-17.

## Goal
Make the public Crecer Grande product pages consume the structured Supabase catalogue without inventing product facts, weakening the useful static engineering copy, or presenting quote-led family pages as fully identified ecommerce SKUs.

## Current guidance reviewed
- Google Search Central — Product snippets: https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- Google Search Central — Merchant listings: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- Google Search Central — Product variants: https://developers.google.com/search/docs/appearance/structured-data/product-variants
- Schema.org Product: https://schema.org/Product
- Schema.org Offer: https://schema.org/Offer

Key implementation decisions:
- The eight current Crecer Grande records are `catalog_item_type = family`; they are sourcing/product-family pages, not individual directly purchasable products.
- Quote-only family pages are not forced into `Offer` markup because Google product-snippet eligibility requires a real offer, review or aggregate rating, and merchant listings require real commerce data.
- Brand, MPN, GTIN, origin, stock, compatibility and pricing are rendered only when present/verified in the catalogue.
- Existing static page copy is retained when it is richer than the older database description.
- Existing legacy static `Product`/`ProductGroup` JSON-LD is removed by the live catalogue runtime and replaced with context-appropriate structured data.
- Family pages use `CollectionPage` + `ItemList` semantics. Item-level catalogue records can use `Product`, with an `Offer` only when a real non-quote public price exists.

## Live catalogue audit before Step 2D
Published data at implementation time:
- Products: 8 family pages
- Published variants: 15
- Published compatibility records: 0
- Published product documents: 0
- Published structured attribute values: 0
- Published product media records: 0

All 8 published products still pass the Step 2C publication gate with zero hard blockers.

## Data normalization
Supabase migration: `phase1_step2d_public_product_normalization`

The legacy variant rows already contained descriptive `name` values, but `variant_name` was the generic value `Standard`. The migration copies the existing descriptive `name` into `variant_name` only when the published row still has the generic/blank legacy label.

Examples now exposed correctly:
- Cutting nozzles
- Protective / cover glass
- For 1500W-class laser system
- For 3000W-class laser system
- PLC / controller hardware
- V-die / lower tool

No new manufacturer, compatibility, identifier, price, origin, stock or technical claim was created.

## Public runtime changes
`assets/js/product.js` now:
- loads the product record under existing anonymous RLS
- treats a clean null result as missing/unpublished and replaces the hard-coded page with an unavailable/noindex state
- preserves static content if the live API itself errors, keeping the site usable during an outage
- does not overwrite a richer static description/meta description with a shorter database value
- renders descriptive published variants with SKU, MPN/model when available, MOQ, availability, lead-time and real public price only when available
- renders category, commercial basis, availability, lead-time, supply type, brand, model, MPN, GTIN and origin from structured fields
- renders structured specifications and category-defined attributes when published
- renders verified compatibility records when published; otherwise shows a compatibility-verification notice only for products marked as requiring compatibility checks
- renders published technical documents and product media only when they exist
- updates canonical/SEO metadata from the catalogue without shortening stronger static descriptions
- removes legacy Product/ProductGroup JSON-LD at runtime
- emits CollectionPage/ItemList JSON-LD for family pages
- emits Product JSON-LD for item-level records, adding Offer only when a real public non-quote price exists

`assets/css/product-intelligence.css` adds responsive styling for the new facts, specifications, compatibility, documents, media and variant presentation.

## Security and data integrity
- Existing Supabase RLS remains the public-data boundary.
- The public runtime uses only the publishable browser key.
- No service-role key or security bypass is introduced.
- Related-table queries remain constrained by their existing `published = true` RLS policies.
- All dynamic database text is HTML-escaped before insertion.
- Document/media URLs are restricted to HTTP/HTTPS before being used as links.

## Known current catalogue state
Because no compatibility records, documents, structured attributes or catalogue media have yet been published, those sections do not fabricate content. They will appear automatically as verified records are added through the Website Manager.

The existing family pages will immediately benefit from:
- meaningful variant names instead of `Standard`
- structured category/commercial/availability/lead-time summary
- compatibility-verification messaging where required
- safer structured-data semantics
- proper handling of unpublished products

## Validation
- Replacement JavaScript passed `node --check` under Node.js 22.
- Product and related-table RLS policies were reviewed before implementation.
- All 15 published variant labels were verified after migration.
- All 8 published products were rechecked through `get_product_publish_readiness()` and remain ready with 0 blockers.
