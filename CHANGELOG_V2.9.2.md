# Crecer Grande Website V2.9.2

## Website Completion & Consolidation

Released: 22 September 2026

### Catalogue and SEO
- Promoted all published Supabase products into the catalogue experience.
- Added canonical static pages for the 46 products that previously existed only in the database.
- Preserved richer standalone canonical product pages where they already existed.
- Product Finder and homepage search now honor each product's database canonical URL.
- All 141 published products now have an image URL, SEO title, SEO description and canonical URL.
- Sitemap now contains every published product canonical target with no duplicate URLs.

### Website Manager
- Added create-record workflows for products, variants, categories, brands, divisions, projects, resources, page content and page text.
- Added a real Media Library upload flow using the protected Supabase site-assets bucket.
- Added protected analytics reporting through get_analytics_summary().
- Fixed page_texts primary-key editing.
- CMS edits now timestamp records for controlled live publishing.

### Public CMS
- Homepage premium copy is synchronized with homepage_content.
- Homepage CMS fields can update the premium hero, routes, divisions, why, featured and CTA sections.
- Fresh page-content edits can update public hero/SEO fields without allowing old database copy to overwrite the redesigned site.
- All eight division pages now load the CMS runtime and can reflect fresh division edits.

### Analytics
- Corrected event names to match the database whitelist.
- Added phone, email, WhatsApp and Instagram click tracking.
- Visitor ID remains persistent while session ID now uses sessionStorage.
- Admin dashboard and Analytics view now use the protected analytics RPC.
- Privacy notice now describes anonymous visitor/session analytics and collected technical metadata.

### RFQ and security
- RFQ attachment registration now requires an enquiry-specific storage path.
- Frontend and Storage extension allowlists are aligned, including IDW, IPN and CSV.
- Maximum attachment registration is enforced server-side at 8 files per enquiry.
- Public enquiry submissions are throttled to 5 per session per 10 minutes.
- Analytics is throttled to 150 events per session per 10 minutes.
- Anonymous execution of the unused get_login_options RPC was revoked.
- Added missing foreign-key indexes and optimized RLS auth.uid() evaluation.
- The unused CG Website Security V1.0 Supabase project was paused (reversible).

### Remaining platform setting
- Supabase leaked-password protection should be enabled from the Auth password-security settings; the connected management tools do not expose that account setting.
