# Phase 1 — Step 2G Pump Catalogue Closure

Verified on 2026-09-17.

## Goal
Close the remaining implementation work around the Laser Chiller Pumps pilot after Step 2F, especially the public comparison page and catalogue metadata that could be completed without inventing commercial or compatibility facts.

## Public page correction
The four pump comparison cards on `products/laser-chiller-pumps.html` no longer use abstract SVG placeholder pump drawings.

They now use a real pump product image already present in the Crecer Grande site assets (`assets/images/prod-pump-v23.webp`). The image is explicitly described as representative, and the page continues to require confirmation of exact ports, mounting and dimensions before supply.

This preserves factual integrity while avoiding a false claim that a generic image is an exact photograph of each model.

Commit: `dd08657eb6c10cdcb67c9e337f633c405c8ef12c`

## Brand metadata
The family-level `Laser Chiller Pumps` product is now linked to the existing published LiCheng manufacturer record in Supabase.

The product-level `supply_type` remains `unspecified` deliberately. The publication gate correctly rejects marking the family record as `genuine_oem` because a family page contains multiple MPNs and therefore cannot carry one family-level MPN/GTIN as evidence. Each of the four published variants already carries its verified LiCheng manufacturer part/model number and `genuine_oem` supply type.

## Publication readiness after closure
The family remains publish-ready:
- blockers: 0
- warnings: 5

The five remaining warnings are intentionally evidence-bound and must not be guessed:
1. family-level supply-type classification
2. stock status
3. reliable lead-time guidance
4. case-by-case warranty explanation
5. exact verified compatibility records

These do not block publication and are appropriate for a quotation-led industrial catalogue until commercial/technical evidence becomes available.

## Existing verified technical records retained
All four model variants remain published with their verified MPN/model identifiers:
- CG1622403501 — 180W
- CG1622684002 — 360W
- CJ0622558828 — 600W
- CJ0622601028 — 880W

All four model-specific technical datasheet records remain published in `product_documents`.

## Security / integrity
No service-role credential was exposed, RLS was not bypassed, and no unsupported stock, price, warranty, lead-time or machine-compatibility claim was introduced.

## Result
The implementation work that can be completed from verified information is closed. Remaining warnings are data-acquisition items, not unfinished code defects.
