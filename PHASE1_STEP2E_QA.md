# Phase 1 — Step 2E Catalogue Enrichment Manager

Verified on 2026-09-17.

## Goal
Close the remaining catalogue-management gap after Step 2D. The public product runtime can already display structured specifications and product media, but Website Manager previously had no practical editor for `product_attribute_definitions`, `product_attribute_values`, or `product_media`.

## Existing schema reused
No new catalogue tables were added.

Existing tables:
- `product_attribute_definitions`
- `product_attribute_values`
- `product_media`

Existing RLS remains the authorization boundary:
- authenticated administrators require `has_permission('products.edit')`
- anonymous/public reads are limited to deliberately published rows and published linked product/variant records

## Current Supabase guidance reviewed
- Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Storage buckets/access model: https://supabase.com/docs/guides/storage/buckets/fundamentals

Step 2E does not introduce a browser service-role key or a parallel upload system. Product Media accepts existing public Website Media URLs or normal site asset paths. This keeps the existing Media Library/storage workflow as the single source for uploads while `product_media` stores catalogue-specific associations and metadata.

## Website Manager additions
New module:
- `admin/assets/catalog-enrichment-admin.js`

Loaded after the existing catalogue/technical/publication-quality modules.

New permission-aware navigation screens:
1. **Specification Templates**
   - category-specific technical field definitions
   - text / number / boolean / JSON value types
   - optional unit
   - filterable/searchable/required flags
   - sort order
   - Draft/Published state
   - CRUD with cascade-delete warning

2. **Product Specifications**
   - product-level or variant-level values
   - specification selector constrained to the product category
   - value control changes according to definition type
   - JSON validation
   - number validation
   - variant/product ownership validation
   - exactly one typed value column populated
   - Draft/Published state

3. **Product Media**
   - product-level or variant-level media records
   - image / diagram / video types
   - existing Website Media URL or site asset path
   - optional thumbnail
   - alt text and caption
   - primary-media flag
   - sort order
   - Draft/Published state
   - published image/diagram requires alt text
   - marking a row primary clears the previous primary flag for that product
   - deleting the catalogue record deliberately does not delete the underlying stored file

## Integrity rules enforced in the UI
- A selected variant must belong to the selected product.
- A structured specification definition must belong to the selected product category.
- Number values must parse as finite numbers.
- JSON values must parse before save.
- Product media URLs must be HTTP/HTTPS URLs or site `assets/` paths.
- Images/diagrams cannot be published without alt text.
- New records are Draft unless explicitly published.
- `updated_by` is populated with the authenticated administrator ID.
- Create/update/delete events are sent to the existing audit RPC.

## Public-site interaction
Step 2D already reads these tables under public RLS. Therefore records created in Step 2E will automatically appear on the relevant product page after they are published, without editing the static HTML page.

## Deliberately not populated
No technical specification, media association, manufacturer identifier, compatibility claim, origin, stock or pricing fact was invented during Step 2E. The current empty structured fields remain empty until a verified fact is entered through Website Manager.

## Database status
No schema migration required for Step 2E. Existing constraints were reviewed:
- attribute definition value types: `text`, `number`, `boolean`, `json`
- attribute values: at most one typed value column can be non-null
- media types: `image`, `video`, `diagram`
- category/product/variant foreign keys retain their existing cascade behavior
