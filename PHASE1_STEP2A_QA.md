# Phase 1 — Step 2A QA

Verified on 2026-09-17.

## Scope
- Product Categories manager
- Product Brands manager
- Product Classification manager
- Existing public category/subcategory compatibility retained

## Database verification
- `product_categories`: 26 rows
- Hierarchy: 7 top-level, 19 child, 0 deeper than two levels
- Current products: 8
- Products with structured `category_id`: 8
- Products with structured `brand_id`: 0 (expected before brand setup)
- Category and brand tables are protected by RLS
- Admin writes require `products.edit`
- Public reads require `published = true`

## Constraint verification
Brand UI values match database constraints exactly:

`brand_role`
- manufacturer
- equipment_brand
- both
- house_brand

`relationship_status`
- reference_only
- supplier
- reseller
- authorized_distributor
- authorized_service
- house_brand

## Safety behaviour
- New categories default to Draft
- New brands default to Draft
- Product classification preserves the legacy category/subcategory text used by the current public site
- Delete warnings reflect the actual `ON DELETE SET NULL` database behaviour
- Category parent selection is limited to top-level categories, matching the current two-level hierarchy

## Result
Step 2A is ready for merge after final GitHub diff review.
