# Crecer Grande Website V2.9.4

## Technical Stabilization

Released: 23 September 2026

### Shared runtime
- Fixed the footer-normalization JavaScript defect in `assets/js/site.js`.
- The footer heart treatment now uses `document.querySelectorAll()`, so common initialization continues normally.
- This restores the intended initialization path for mobile navigation, the Solutions menu, Ask iKNOW, outbound click tracking and page-view tracking.

### Laser product-family pages
- Removed the obsolete `/assets/css/part4-visuals.css` reference from:
  - `products/co2-laser-spares.html`
  - `products/laser-cutting-heads.html`
  - `products/laser-welding-consumables.html`
- These pages continue to use the current `laser-ecosystem.css` and catalogue visual layers.

### Cache and release consistency
- Normalized all public sitemap pages that load the shared runtime to `/assets/js/site.js?v=2.9.4`.
- Corrected the malformed duplicated query-string cache reference on the 3D printing quote page.
- No public route, canonical URL, product slug, Supabase schema or catalogue data was changed.

### Scope
This revision is intentionally limited to stability and consistency fixes discovered during the September 2026 deep website audit. The premium visual redesign is handled as a separate controlled pass after this stabilization baseline.
