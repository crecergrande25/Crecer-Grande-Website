# Release 13 — Crecer Grande admin workspace

## What changed

The sign-in, sidebar and recovery page use the original `assets/images/Logo-R01.png`. The sign-in pairs a workshop illustration with a focused form. The authenticated workspace uses consistent navy, warm white and restrained gold, clearer typography, bounded data tables and an off-canvas navigation menu on phones. Refresh remains available on mobile.

Overview highlights published guides, enquiries and visitor activity with real counts from their respective sources. There are no invented growth figures. The new Insights library reads the 50 published article entries from `assets/data/insights.json`, with raster thumbnails and title/topic search. Those articles are source-managed; the separate Resource records editor continues to manage database records. The retired Projects module is removed from navigation and Overview queries.

Media now shows raster previews. Copy URL and Users actions initialize correctly; the old single-element selector errors are fixed. Uploads accept PNG, JPG, WebP and PDF, with the existing 20 MB limit. SVG uploads are rejected.

Record and user dialogs support Escape, focus containment, focus restoration, background inertness and associated input labels. Save errors remain visible within the active dialog. Record updates send changed fields and keep the original record identity through asynchronous saves. Closing a pending save and opening another module does not replace the new view when the earlier response arrives.

Password visibility controls are available on sign-in and recovery. Recovery retains its session requirement and length/match validation. Account password changes also complete the existing password-change confirmation RPC and report partial failures accurately. Expired sessions clear private content, close dialogs and invalidate outstanding reads, including a profile check still in progress.

The live-media GitHub workflow now calls the existing `check_photography.cjs` script; it previously named a nonexistent script. Public page asset links remain at release 12 because their files have not changed in this admin release. Admin CSS and scripts use version 13 cache URLs. `VERSION.txt` is 13.0.0.

## Verification

- Isolated browser checks cover sign-in, inactive/rejected accounts, session termination during login/profile/record requests, dashboard, 50-guide search, record view/edit/status/error states, pending saves, Media copy/SVG rejection, user dialog errors, account password changes and recovery.
- Desktop and 320/390-pixel mobile layouts were checked for document overflow and navigation/dialog keyboard behavior.
- Twelve selected admin screens/states passed axe WCAG A/AA scans with zero reported violations. This is a sampled automated result, not a full accessibility certification.
- Production network writes were blocked; authenticated previews use sample enquiries and sample metrics. No live administrator credentials, records or production saves were used.
- Public website static, heading, image, calculator and controlled browser regression checks were run separately. Detailed results accompany the handoff.

Run `node scripts/check_admin.cjs` against the local server. Add `ADMIN_A11Y=1` with `@axe-core/playwright` installed for the accessibility scans. The fixture in `scripts/fixtures/admin.cjs` is only a test dependency; production admin scripts never load it. Keep that fixture out of manually edited runtime configuration.

## Deployment and owner verification

Upload the contents of `website/` from the provided ZIP into the repository root, preserving paths. The complete archive includes all earlier website changes, including the unique homepage background. The admin-only patch assumes release 12 assets and article data already exist; it changes no database configuration or schema.

After publishing, `https://crecergrande.in/VERSION.txt?verify=v13` should return 13.0.0, and `/admin/?verify=v13` should show the original logo and new sign-in. Verify your real account, the permissions of each role, and an authorized record save in your own session. A public login URL is expected; private data access depends on Supabase authentication and backend policies, not on hiding the route.

No commit, push, deployment, administrator creation or backend policy change was performed for this release. Earlier retired-file cleanup remains necessary if old Projects/SVG files still exist in the uploaded repository.
