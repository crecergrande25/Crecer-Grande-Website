# Crecer Grande Website V2.6 — FINAL RELEASE QA

Release date: 2026-09-18  
Target: GitHub Pages + existing Crecer Grande Supabase backend

## Package checks

- Files in package: 139
- Indexable public pages: 62
- Missing required release files: 0
- Broken local links: 0
- Missing local assets: 0
- HTML structural issues: 0
- Canonical issues on indexable pages: 0
- JSON-LD parse errors: 0
- JavaScript syntax failures: 0
- JSON / manifest parse failures: 0
- Sitemap XML parse error: None

## Security checks

- PASS — no known old admin passwords
- PASS — no service role value in public files
- PASS — public runtime has publishable key only
- PASS — admin route noindex
- PASS — robots disallows admin

## Host-readiness

- PASS — `CNAME` points to `crecergrande.in`
- PASS — `.nojekyll` included
- PASS — `robots.txt` included and Admin disallowed
- PASS — canonical-only sitemap regenerated
- PASS — PWA manifest included
- PASS — production 404 page included
- PASS — public Supabase runtime config retained
- PASS — server-side `admin-users` Edge Function source included
- PASS — administrator passwords are not embedded in the release
- PASS — service-role / secret credential is not embedded in browser runtime config

## Live production checks still required after upload

Static QA cannot prove live Supabase RLS/Auth/storage behavior. After deployment, perform the checks in `docs/POST_DEPLOYMENT_CHECKLIST.md`, especially:

1. RFQ + file upload.
2. STL/OBJ/3MF viewer in real browsers.
3. Existing administrator login.
4. Non-critical CMS edit.
5. `admin-users` Edge Function using a disposable non-root test account.
6. Search Console sitemap / URL inspection.
