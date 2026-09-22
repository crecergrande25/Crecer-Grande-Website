# Crecer Grande Website V2.9.3

## Final QA & Resilience Revision

Released: 22 September 2026

### Product image integrity
- Audited every published product image against the actual GitHub repository tree.
- Corrected 12 broken image paths discovered behind non-empty database values.
- Removed all published-product image duplication.
- Final live catalogue result: 141 published products, 141 unique image URLs, 0 broken local image paths.
- Synchronized the corrected image assignments into the offline catalogue.

### Catalogue resilience
- Expanded assets/data/catalog-fallback.json from 95 to all 141 published products.
- Fallback catalogue now has 141 unique slugs, 141 unique images and 0 broken local image paths.
- Homepage search now indexes fallback products first and de-duplicates/refreshes them with live Supabase data.
- Product Finder therefore retains the complete catalogue during a temporary Supabase read outage.

### Website Manager
- User-management navigation and controls now follow get_my_permissions().
- Standard administrators no longer see controls they are not permitted to use.
- Super-admin/root user management remains available.
- Website Manager runtime cache bumped for the final revision.

### RFQ & conversion analytics
- Added design_rfq_submit and 3d_quote_submit to the accepted analytics event set.
- Removed stale version-specific source labels from general, design and 3D RFQ submissions.
- Aligned request-quote, contact, design-job-work and 3D quote runtime cache tags.
- Verified RFQ client limits and file extensions match database/storage rules.

### Source and routing QA
- Audited priority public pages for missing local assets/links, duplicate IDs, H1 structure, titles, descriptions and canonical URLs.
- Verified all 212 sitemap URLs map to repository files.
- Verified all 141 product canonical targets map to repository files.
- Refreshed the 404 page and release labels.

### Verification limitation
- Source, database, storage and route checks are complete. Full rendered-browser/pixel QA could not be performed in the completion session because the public domain was not reachable from the available browser runtimes.
