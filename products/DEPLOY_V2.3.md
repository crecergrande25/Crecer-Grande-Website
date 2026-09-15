# Crecer Grande Website V2.3 — Deployment

## Recommended for the existing live site
Use the **V2.3 DEPLOY OVER EXISTING** package. It intentionally does not contain `assets/js/runtime-config.js`, so the live browser-safe Supabase configuration file already on the host is not overwritten.

1. Back up the current live site.
2. Upload/extract the deploy-over-existing package into the web root and overwrite matching files.
3. Keep the existing `assets/js/runtime-config.js` in place.
4. Open `/admin/` and verify that Ramiz Islam and Sourav Bhowmik appear in the Administrator list.
5. If the backend still shows the older combined Contact/RFQ copy or old WhatsApp setting, run `supabase/backend/Crecer_Grande_V2.3_SAFE_PATCH.sql` once in Supabase SQL Editor.
6. Sign in and verify Dashboard, Enquiries, Analytics and Audit Log.
7. Open the public Home, Divisions, Products, Estimate, Projects, Resources, Contact and Request a Quote pages.
8. Submit one test RFQ and confirm it appears in Website Manager when Supabase is connected.
9. Re-submit `sitemap.xml` in Google Search Console after deployment.

## Fresh installation
Use the **FULL PACKAGE**. Then place the existing public Supabase Project URL and publishable/anon key in `assets/js/runtime-config.js`, or open Admin → Connection settings once in the browser. Do not use a service-role key.

## V2.3 backend
No new destructive SQL migration is required if the R4 backend already passed verification. Reference SQL is included under `supabase/backend/`.

## Currency converter
The Estimate page uses Frankfurter's public v2 exchange-rate API at runtime. It does not hard-code exchange rates. If the remote rate service is unavailable, the calculator reports that rather than showing a stale value.
