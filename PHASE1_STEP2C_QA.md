# Phase 1 — Step 2C Publication Quality Gate

Verified on 2026-09-17.

## Goal
Prevent incomplete or internally inconsistent product records from being published while keeping Crecer Grande's quotation-led industrial catalogue practical. The gate distinguishes hard publication blockers from quality warnings.

## Research basis
Current guidance reviewed before implementation:

- Google Search Central — Product structured data: https://developers.google.com/search/docs/appearance/structured-data/product
- Google Search Central — Merchant listing structured data: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- Google Search Central — Title links: https://developers.google.com/search/docs/appearance/title-link
- Google Search Central — Snippets/meta descriptions: https://developers.google.com/search/docs/appearance/snippet
- Google Merchant Center — Product data specification / identifiers: https://support.google.com/merchants/answer/7052112
- Supabase — Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security

Implementation decisions:
- Quote-only industrial products are not forced to have a public price.
- Commerce-specific checks become hard requirements when cart/fixed-price behaviour is enabled.
- GTIN/MPN/brand values must never be invented only to satisfy a quality check.
- Family-level catalogue pages may legitimately lack item-level identifiers.
- SEO enrichment is primarily a warning unless the missing data creates a functional/publication inconsistency.
- RLS remains the authorization boundary; no browser service-role key and no new SECURITY DEFINER bypass were introduced.

## Live data issue corrected
The public product runtime uses `products.name` to replace page headings. All eight legacy product rows contained the placeholder `Industrial Product`, while their existing `title` values were accurate.

The Step 2C migration safely normalized only facts already known from existing catalogue data:
- placeholder/blank `name` -> existing `title`
- blank `short_description` -> existing `description`
- blank SEO title -> existing title/name + ` | Crecer Grande`
- blank SEO description -> existing description
- blank canonical -> the existing `/products/<slug>.html` URL
- family-level `identifier_exists` null -> false

No brand, MPN, GTIN, OEM relationship, price, stock, compatibility, HSN/GST or country-of-origin value was invented.

## Database implementation
Supabase migration: `phase1_step2c_publish_quality`

Added:
- `cg_is_valid_gtin(text)` — validates GTIN-8/12/13/14 including check digit
- `cg_product_publish_blockers(products)` — hard publication checks
- `cg_product_publish_warnings(products)` — improvement guidance
- `get_product_publish_readiness(uuid)` — authenticated readiness RPC
- `cg_products_publish_gate` — BEFORE INSERT/UPDATE trigger that rejects `published=true` when blockers exist

Functions use normal invoker/RLS behaviour. Readiness helpers are not executable by `anon`.

## Hard blockers
Examples include:
- placeholder/blank product name
- malformed slug
- missing/unpublished structured category
- assigned unpublished brand
- insufficient product description
- missing primary image
- neither RFQ nor cart enabled
- non-quote pricing without a positive public price
- cart enabled without fixed price, positive price, currency or known stock state
- invalid supplied GTIN
- contradictory `identifier_exists` data
- unsupported genuine-OEM claim lacking brand + MPN/GTIN evidence
- published confirmed compatibility lacking verification source/verifier/time

The 60-character description threshold is an internal Crecer Grande quality rule, not a claimed Google minimum.

## Warnings
Warnings include useful but non-blocking enrichment such as:
- gallery images
- search keywords
- structured technical specifications
- supply-type classification
- known stock/lead-time guidance
- warranty notes
- published variants for product families
- compatibility records when compatibility checking is required
- technical documents
- HSN/GST/unit data before commerce integration
- SEO title/description/canonical completeness

## Verification results
After safe normalization:
- Current products checked: 8
- Hard blockers: 0 across all 8
- All 8 existing published catalogue pages remain publish-ready
- Quality warnings remain intentionally visible for future enrichment

Gate stress tests:
- Attempt to update a published product back to `Industrial Product`: correctly rejected by trigger
- Valid GTIN-13 `4006381333931`: accepted
- Invalid check digit `4006381333932`: rejected
- Invalid short identifier `123`: rejected

## Website Manager changes
New `Publish Readiness` screen:
- lists every product and publication state
- shows Ready/Blocked status
- shows blocker and warning counts
- detailed review of blockers and warnings
- opens the public product page
- provides controlled structured-quality editing for supply type, identifier status, MPN/model/GTIN, origin, stock, lead time, warranty, price mode, RFQ/cart, commercial tax/unit fields and SEO fields
- saving re-runs the database gate/readiness report

## Result
Step 2C is ready for final branch diff review. The database enforcement is already active; the Website Manager UI is isolated on `phase1-step2c-publish-quality` until review and merge.