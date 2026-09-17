# Phase 1 — Step 2B QA

Verified on 2026-09-17.

## Scope
- Equipment Types manager
- Equipment Models manager
- Product Compatibility manager
- Product Documents manager

## Existing backend state
- Equipment types: 7
- Equipment models: 0
- Compatibility records: 0
- Product documents: 0

## Security verification
All four tables use the existing catalogue RLS model:
- Admin writes require `products.edit`
- Public equipment type/model reads require `published = true`
- Public compatibility reads require the compatibility record, linked product, optional variant, and equipment model to all be publishable
- Public product-document reads require the document, linked product, and optional variant to be publishable

## Constraint verification
Compatibility status values:
- confirmed
- conditional
- reference_only

Product document type values:
- datasheet
- drawing
- manual
- certificate
- compatibility
- installation
- maintenance
- other

## Safety behaviour
- New equipment types start as Draft
- New equipment models start as Draft
- New compatibility records start as Draft
- New product documents start as Draft
- Variant dropdowns are filtered to the selected product
- Compatibility validates that a selected variant belongs to the selected product
- Document validity dates are checked before save
- Equipment model JSON specifications are validated before save
- Compatibility marked Confirmed records the verifying administrator/time when first confirmed

## Result
Step 2B is ready for final diff review and merge.
