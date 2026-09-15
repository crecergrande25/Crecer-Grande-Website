CRECER GRANDE WEBSITE V2.3 — COMPLETE PACKAGE
==============================================
Build: 15 September 2026

WHAT IS INCLUDED
----------------
- Complete public website
- Website Manager V2.3 admin front end
- 8 division pages + detailed division pages
- 8 product groups + detailed product pages
- Projects / case-study pages
- Resources / downloadable division profiles
- Dedicated Contact page
- Dedicated Request a Quote page
- Engineering Estimate tools
- Expanded material-density selectors
- Live currency reference converter
- SEO metadata, canonical URLs, sitemap, robots.txt and structured data
- Supabase admin-user Edge Function source
- R4 backend reference / verification SQL
- V2.3 deployment instructions and QA report

IMPORTANT: EXISTING LIVE WEBSITE
--------------------------------
If your live site already has a working Supabase `assets/js/runtime-config.js`, use the separate
V2.3 DEPLOY OVER EXISTING package. That package intentionally does NOT overwrite runtime-config.js.
This is the safest upgrade path and preserves the existing public Project URL / publishable key.

V2.3 also reads the legacy V2.0–V2.2 browser storage key `cg_v2_supabase_config`, so the same browser
on the same domain can keep its previously saved Website Manager connection.

FRESH INSTALLATION
------------------
The FULL package ships without any private credential. To connect Supabase on a fresh host/browser,
configure only the browser-safe Supabase Project URL and publishable/anon key. Never place a
service_role key, database password or administrator password in browser code.

CONTACT / RFQ
-------------
Contact and Request a Quote are now separate pages. WhatsApp uses +91 6291001781.
The retired secondary phone number is not used by the V2.3 website or V2.3 seed values.

ESTIMATE PAGE
-------------
The material list includes common stainless steels, carbon/alloy steels, aluminium alloys,
copper alloys, cast iron, titanium, nickel alloys and engineering plastics, with Custom density.
Currency conversion uses the public Frankfurter v2 reference-rate API and does not hard-code rates.

BACKEND
-------
No new destructive V2.3 database migration is required if the existing R4 backend already passed.
Reference copies are in `supabase/backend/` for recovery/documentation only.

START HERE
----------
Read `DEPLOY_V2.3.md`, then use the correct ZIP for your deployment scenario.
