CRECER GRANDE V2.3 — BACKEND NOTE
=================================

V2.3 does NOT require a new destructive database migration.
The website/admin code remains compatible with the Supabase R4 backend that previously passed FINAL/PASS verification.

The two SQL files in this folder are included only as reference/recovery copies:
- Crecer_Grande_MASTER_BACKEND_R4_REFERENCE.sql
- Crecer_Grande_BACKEND_VERIFY_R4_REFERENCE.sql

If your existing R4 backend is already working, DO NOT rerun the master script unnecessarily.

Browser connection values
-------------------------
The public website and Website Manager need only the browser-safe Supabase Project URL and publishable/anon key.
Never place a service_role key, database password, or admin password in browser JavaScript.

V2.3 runtime-config.js is backward-compatible with the V2.0–V2.2 localStorage key `cg_v2_supabase_config`, so an existing connected browser should remain connected after an upgrade on the same domain.

Existing R4 installation
------------------------
Run `Crecer_Grande_V2.3_SAFE_PATCH.sql` once after deploying V2.3 if the live Supabase project still contains the older combined Contact/RFQ copy or older WhatsApp/site-settings values. The patch is DML-only and does not change auth users or passwords.
