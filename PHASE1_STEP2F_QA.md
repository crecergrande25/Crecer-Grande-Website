# Phase 1 — Step 2F Pilot Catalogue Enrichment

Verified on 2026-09-17.

## Goal
Populate the first Crecer Grande product family end-to-end using verified existing catalogue/site facts, while closing integration gaps discovered after Steps 2D–2E.

Pilot family: **Laser Chiller Pumps**.

## Integrity rule
Laser-system power class does **not** by itself define an exact replacement pump. Exact voltage, frequency, motor power, flow, head, ports, dimensions, manufacturer model/part number and compatibility remain blank until a specific pump/chiller configuration is verified.

## Integration fixes
1. Publication-readiness warnings now treat published normalized `product_media` rows as valid gallery enrichment and published normalized `product_attribute_values` rows as valid structured specifications. The legacy `products.gallery` and `products.specifications` fields remain supported.
2. Public variant cards now consume published variant-level normalized specification values, so values created through Website Manager are visible without copying them into legacy JSON fields.
3. Dynamic catalogue media avoids rendering a duplicate image when the same asset already appears in the static product page.
4. Item-level Product structured data can consume normalized product-level specifications as `additionalProperty` values.

## Supabase migration
`phase1_step2f_readiness_normalized_enrichment`

The updated warning function remains `SECURITY INVOKER`, with an empty search path and explicit schema qualification for normalized-table lookups.

## Pilot data populated
Safe existing facts only:
- corrected primary product image to `assets/images/prod-pump-v23.webp`
- strengthened the database description to match the existing public engineering copy
- added internal/search keywords describing the already-published scope
- added `Referenced Laser System Class` as a category specification definition
- assigned 1500 W / 2000 W / 3000 W / 6000 W to the four existing application-class variants
- registered the existing pump image in normalized `product_media`

No brand, manufacturer, MPN, GTIN, stock, lead time, price, warranty, electrical duty, hydraulic duty or model compatibility was invented.

## Readiness result
Before enrichment: 9 warnings, 0 blockers.
After enrichment: 6 warnings, 0 blockers.

Cleared with verified data:
- supporting gallery/media
- search keywords
- structured technical specifications

Remaining warnings are intentionally preserved because they require exact evidence:
- supply-type classification
- stock status
- lead-time guidance
- warranty terms
- verified compatibility
- published technical document

## Technical rationale
The existing public page already states that laser wattage alone does not determine pump compatibility. Current Hanli chiller data also demonstrates that pump power, flow, pressure/head and interfaces vary by exact chiller model/configuration even within a nominal laser-power class. The pilot therefore models laser wattage only as a **referenced application class**, not as an exact pump performance specification.

## Security
- no service-role key is exposed
- no RLS bypass was introduced
- normalized catalogue reads remain subject to existing public RLS
- readiness function uses invoker security
