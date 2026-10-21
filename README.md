# Crecer Grande Website

Production website for **https://crecergrande.in/**.

## Current structure

- Engineering-focused homepage
- Engineering Desk
- One Services directory and four service divisions
- Six engineering project guides
- Engineering Insights, guides and downloadable division profiles
- Industries, About, Contact, Privacy and Disclaimer
- Request-for-Quote and enquiry workflows
- Authenticated Website Manager under `/admin/`
- Supabase-backed authentication, CMS data, enquiries and analytics
- GitHub Pages deployment with the custom domain in `CNAME`

The former public Products catalogue has been retired. Product/spare identification is now handled as an engineering enquiry through the Engineering Desk and Request a Quote.

## Front-end

The public site is static HTML/CSS/JavaScript and requires no build command. Shared navigation/footer behavior lives in `assets/js/site.js`.

Serve the repository root with `python3 -m http.server 8765 --bind 127.0.0.1`. Install Pillow for image checks and Playwright 1.56.1 with Chromium for browser checks. Keep local dependencies outside the checkout where possible.

Run the local quality checks from the repository root:

```sh
python3 scripts/check_site_quality.py
python3 scripts/check_semantic_headings.py
python3 scripts/check_image_assets.py
node --test scripts/check_calculators.cjs
node scripts/check_home_brand.cjs
node scripts/check_welding_media.cjs
node scripts/check_functional_flows.cjs
node scripts/check_release7.cjs
node scripts/check_photography.cjs
AUDIT_VIEWPORT=mobile node scripts/check_photography.cjs
```

Browser scripts default to the local server on port 8765; `SITE_BASE` selects another origin. Functional checks use controlled responses for enquiry, upload, feedback and currency scenarios. All browser checks block production writes. A passing local test does not establish production deployment or authenticated administrator access.

## Photography

Unverified legacy images have been withdrawn from public layouts. The site currently uses text-led cards and solid hero backgrounds. This does not satisfy the requirement for original workshop photography; do not describe legacy or generated images as completed customer work.

`assets/data/photography.json` records the withdrawn library and the original photos still needed. Follow [the media brief](docs/ORIGINAL_PHOTOGRAPHY_BRIEF.md) for capture, consent, captions and before/after pairs. Brand logos and functional QR images remain raster assets. SVG image assets are not permitted.

## Release 7 handoff

The service directory is `/services.html`, with four divisions. `/divisions.html` and retired Automation routes redirect there. The project library has six distinct guides; three overlapping legacy URLs redirect to related sections. These guides describe methods, not verified completed customer jobs.

The static HTML carries a `data-content-updated-at` timestamp. CMS content older than that timestamp does not overwrite the release's copy; newer CMS edits can still apply. Public company settings remain dynamic. Review fresh CMS edits against the four-division scope.

See [release notes and acceptance checks](docs/RELEASE_7_HANDOFF.md) and [owner account actions](docs/OWNER_ACCOUNT_ACTIONS.md). No production deployment or Google account setup is claimed.

## Security

`assets/js/runtime-config.js` may contain only public/publishable browser configuration. Never commit a Supabase service-role key, administrator password, database password or any private credential.

Operational Supabase deployment notes remain under `docs/`.
