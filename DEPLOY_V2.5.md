# Deploying Crecer Grande V2.5

## Recommended method for the existing live website
Use the `DEPLOY_OVER_EXISTING` ZIP. Its files are placed directly at ZIP root and it intentionally excludes `assets/js/runtime-config.js`, preserving the live browser/Supabase configuration file already deployed.

1. Back up the current live repository/site.
2. Extract the V2.5 deploy ZIP.
3. Upload the files directly into the website root, replacing matching V2.4 files.
4. Do not create an extra containing directory in the repository.
5. Wait for GitHub Pages/hosting deployment to complete.
6. Hard-refresh the browser.
7. Test these URLs:
   - /services.html
   - /industrial-automation-kolkata.html
   - /mechanical-design-services-kolkata.html
   - /iso-9001-consultant-kolkata.html
   - /industrial-inspection-qa-kolkata.html
   - /gem-tender-support-kolkata.html
   - /sheet-metal-bending-kolkata.html
   - /sitemap.xml
8. Verify /admin/ still connects normally.

## Google Search Console after deployment
1. Open Sitemaps and resubmit `https://crecergrande.in/sitemap.xml`.
2. Inspect the homepage and `/services.html`.
3. Request indexing for the new commercial pages, within Search Console's normal quota.
4. Then inspect the most important existing pages: laser marking, laser cutting, 3D printing, reverse engineering and machine maintenance.
5. Monitor Page Indexing and Search Results performance rather than repeatedly requesting the same URL.
