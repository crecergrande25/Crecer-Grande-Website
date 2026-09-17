# Deploy Crecer Grande Website V2.6

## GitHub Pages deployment

1. Back up the current repository.
2. Extract `Crecer Grande Website V2.6.zip`.
3. Open the extracted `Crecer Grande Website V2.6` folder.
4. Upload **the contents of that folder** to the root of the GitHub repository.
5. Make sure these files are at repository root:
   - `index.html`
   - `CNAME`
   - `.nojekyll`
   - `robots.txt`
   - `sitemap.xml`
   - `manifest.webmanifest`
6. Commit the changes to the branch currently used by GitHub Pages.
7. Wait for GitHub Pages to publish and HTTPS/CDN propagation to finish.

No npm build, Python build or server process is required for the public site.

## Important: Supabase is separate

Uploading to GitHub does **not** deploy Supabase Edge Functions.

The public site can use the existing live Supabase project immediately.  
If the deployed `admin-users` function is missing or needs the V2.6 update, deploy the included source separately using the instructions in `docs/SUPABASE_ADMIN_DEPLOYMENT.md`.

## First production checks

Test these routes after deployment:

- `/`
- `/engineering-desk.html`
- `/products.html`
- `/products/laser-product-finder.html`
- `/products/3d-print-quote.html`
- `/request-quote.html`
- `/projects.html`
- `/resources.html`
- `/admin/`

Also test:
- mobile navigation;
- Product Finder search;
- STL/OBJ/3MF upload;
- RFQ submission;
- RFQ file upload;
- Admin login;
- enquiry status change;
- one non-critical CMS edit;
- a non-root test-user action before using user management on production accounts.
