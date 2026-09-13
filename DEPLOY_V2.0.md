# Crecer Grande Website V2.0 — Final Restored Deployment

The live Supabase backend has already completed the R4 upgrade and verification (`FINAL = PASS`). **Do not rerun migration SQL on the current project.**

## Deploy the frontend
1. Back up the current GitHub Pages repository.
2. Copy the **contents** of this package into the repository root.
3. Keep `index.html`, `CNAME`, `.nojekyll`, `robots.txt` and `sitemap.xml` at the root.
4. Do not change HostingRaja DNS or the custom domain.
5. Commit and push. Suggested commit: `Deploy Crecer Grande Website V2.0 Final Restored`.

## Connect Website Manager once
The package intentionally contains no account-specific Supabase keys.

Open `/admin/` and use **Connect Supabase**. Enter only:
- Supabase Project URL
- browser publishable / anon key

Never use a secret key, `service_role` key, database password or an admin password in browser files.

Click **Save, connect & download config**. The connection is saved in that browser for immediate use and Website Manager automatically downloads a permanent `runtime-config.js`. Replace `assets/js/runtime-config.js` in GitHub with that generated file and commit it so all public browsers can load live CMS data.

## Existing admin identities
V2.0 uses the existing internal Auth domain `admin.crecergrande.in` and does not recreate or reset passwords.

## User-management Edge Function
Deploy `supabase/functions/admin-users/index.ts` as the Supabase Edge Function `admin-users` when you want Website Manager to create users or reset passwords. Its server-side service-role environment value must remain inside Supabase only.

## Post-deployment tests
- Home page visual assets
- all 8 division pages
- all 8 product pages
- all 6 SEO service pages
- Projects / Resources / Estimate / Contact
- `/admin/` login for both current administrators
- one harmless CMS edit + public refresh
- Audit Log attribution
- one test RFQ

## Search Console
After the site is stable, resubmit `https://crecergrande.in/sitemap.xml` and request indexing once for the six new focused service pages.
