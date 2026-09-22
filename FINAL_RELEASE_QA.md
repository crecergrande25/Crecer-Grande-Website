# Crecer Grande Website V2.9.3 — FINAL RELEASE QA

Release date: 2026-09-22  
Target: GitHub Pages + Crecer Grande Supabase production backend

## Release integrity

- PASS — 212 sitemap URLs are unique and map to repository files.
- PASS — 141 published products have 141 unique canonical URLs.
- PASS — all 141 product canonical targets map to repository files.
- PASS — 141 published products have image URLs.
- PASS — 141 published products use 141 unique image URLs.
- PASS — 0 broken local product-image paths.
- PASS — 141 products have SEO title, SEO description and canonical URL coverage.
- PASS — fallback catalogue contains all 141 published products with unique slugs and unique images.
- PASS — fallback metadata includes 50 categories, 10 brands and 31 equipment models.
- PASS — legacy duplicate routes sampled under /products/products/, /products/divisions/ and old division aliases use noindex,follow and canonical targets.
- PASS — priority public pages have one H1, canonical URL, page title and image alt coverage with no sampled duplicate IDs.

## Runtime / CMS

- PASS — core public pages use V2.9.3 site.js runtime cache keys.
- PASS — homepage, divisions hub and all eight division pages load the Supabase/CMS runtime where required.
- PASS — Website Manager can create normal CMS/catalogue records.
- PASS — Website Manager Media Library uploads to the protected site-assets workflow.
- PASS — Website Manager Analytics uses the protected get_analytics_summary() RPC.
- PASS — Website Manager user controls follow effective permissions.
- PASS — modified JavaScript files passed syntax compilation checks.

## Catalogue / product experience

- PASS — Product Finder reads the complete published catalogue and honors canonical routes.
- PASS — homepage search supports the full catalogue and canonical product destinations.
- PASS — canonical product pages have static first-paint product imagery and matching social-preview imagery for sampled remapped products.
- PASS — static catalogue and Supabase data remain usable if live catalogue reads temporarily fail.

## RFQ / upload workflow

- PASS — RFQ file bucket is private.
- PASS — site-assets media bucket is public-read with authenticated management policies.
- PASS — attachment paths are bound to the enquiry-specific UUID prefix.
- PASS — 50 MB maximum file size remains enforced.
- PASS — maximum 8 registered attachments per enquiry is enforced server-side.
- PASS — public enquiry submission throttling is enforced.
- PASS — analytics-event throttling is enforced.
- PASS — CAD/document extension policy is aligned between frontend and storage.
- PASS — RFQ / design / 3D quote analytics event names are accepted by the database.

## Security / database

- PASS — production Supabase project CG Website Builder v1.0 is ACTIVE_HEALTHY.
- PASS — unused CG Website Security V1.0 project is paused / INACTIVE, not deleted.
- PASS — no service-role secret is exposed in browser runtime configuration.
- PASS — Admin Auth and privileged user operations remain server-side/protected.
- PASS — missing foreign-key indexes identified during the completion pass were added.
- PASS — flagged auth.uid() RLS performance patterns were optimized without changing intended access.
- INFO — analytics_events intentionally has no direct client SELECT policy; analytics reporting uses a protected RPC.
- INFO — public SECURITY DEFINER warnings remain for the public website endpoints that intentionally require anonymous execution and contain validation/throttling.
- MANUAL — enable Supabase Auth leaked-password protection in the Supabase dashboard; the connected management API does not expose this account-level toggle.

## SEO / deployment

- PASS — CNAME points to crecergrande.in.
- PASS — .nojekyll is present.
- PASS — robots.txt allows public crawling and disallows /admin/.
- PASS — sitemap.xml has no duplicate URLs.
- PASS — legacy/alternate sampled routes use canonical/noindex handling.
- PASS — production 404 page is current and no longer advertises an old V2.6 release.
- PASS — README, VERSION_HISTORY and release changelog identify V2.9.3 as current.

## Verification limitation

Full rendered-browser / pixel-level desktop and mobile QA could not be completed in this session because crecergrande.in is not reachable from the available browser automation/runtime paths. Source-level, repository, Supabase, storage, routing, SEO metadata and Search Console checks were performed instead.

When a browser runtime can reach the public domain, the remaining visual acceptance gate is:

1. Desktop + mobile homepage visual inspection.
2. Product Finder search/filter interaction.
3. Sample catalogue detail pages and images.
4. RFQ form submission with a disposable test enquiry/file.
5. 3D quote STL/OBJ/3MF viewer interaction.
6. Admin login, Media upload and a disposable CMS edit.
7. Browser console/network-error check.

No structural redesign should be performed before that acceptance gate unless a reproducible defect is found.
