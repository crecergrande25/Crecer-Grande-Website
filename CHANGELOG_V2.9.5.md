# Crecer Grande Website V2.9.5

## Premium Foundation

Released: 23 September 2026

### Shared visual system
- Added a controlled premium polish layer to `assets/css/site.css`.
- Refined sticky-header depth, navigation feedback, mega-menu presentation and quote-button emphasis.
- Improved shared card elevation, border treatment and image hover behavior.
- Refined Ask iKNOW panel animation and floating action treatment.
- Enhanced the common footer background depth while preserving the navy/gold brand system.

### Accessibility and interaction quality
- Added stronger `:focus-visible` treatment for keyboard users.
- Added `prefers-reduced-motion` handling for the new shared motion treatments.
- Improved touch targets and mobile behavior without changing navigation structure.
- Preserved the V2.9.4 runtime stabilization and Engineering Desk image accessibility corrections.

### Cache consistency
- Public sitemap pages that load the common stylesheet now request `/assets/css/site.css?v=2.9.5`.
- No page route, canonical URL, Supabase schema, product record, RFQ workflow or public content was changed.

### Scope
V2.9.5 is the visual-system baseline for the subsequent page-by-page premium redesign. Individual division and catalogue experience upgrades are intentionally separate so each can be verified and rolled back independently.
