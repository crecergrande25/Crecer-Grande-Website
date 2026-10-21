# Crecer Grande Website

Production website for **https://crecergrande.in/**.

## Current structure

- Engineering-focused homepage
- Engineering Desk
- One Services directory and four service divisions
- 50 searchable engineering Insights in four topic groups
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
node scripts/check_release10.cjs
node scripts/check_photography.cjs
AUDIT_VIEWPORT=mobile node scripts/check_photography.cjs
```

Browser scripts default to the local server on port 8765; `SITE_BASE` selects another origin. Functional checks use controlled responses for enquiry, upload, feedback and currency scenarios. All browser checks block production writes. A passing local test does not establish production deployment or authenticated administrator access.

## Website illustrations

Release 10 integrates 70 generated images requested by the website owner. All 78 public content pages have foreground hero imagery; every hero except Home also has a matching background. Insights has 50 articles with image backgrounds on the cards. They are AI-generated illustrations, identified as such in captions and page notices; they do not document actual company facilities, staff or completed projects. The legacy unverified image library remains retired. No SVG images are allowed.

The new raster assets are in `assets/images/generated/`. Responsive WebP copies at four widths retain the original 3:2 composition. Original PNGs remain outside the checkout. Lazy loading and appropriate source sizes keep page downloads small.

Read [the placement guide](docs/RELEASE_10_REQUESTED_CHANGES.md) and [the exact image-to-page inventory](docs/IMAGE_PLACEMENTS.csv). `assets/data/photography.json` records every approved image, descriptive alternative text and its placements. [The original-photo brief](docs/ORIGINAL_PHOTOGRAPHY_BRIEF.md) still applies if replacing these illustrations with genuine company photography later.

## Earlier architectural repairs

The service directory is `/services.html`, with four divisions. `/divisions.html` and retired Automation routes redirect there. The Projects section has been removed at the owner’s request, including its pages, navigation, search entries and sitemap URLs. Delete the old Projects files when uploading the replacement website.

The static HTML carries a `data-content-updated-at` timestamp. CMS content older than that timestamp does not overwrite the release's copy; newer CMS edits can still apply. Public company settings remain dynamic. Review fresh CMS edits against the four-division scope.

See [the current image integration notes](docs/RELEASE_10_REQUESTED_CHANGES.md), [earlier release notes and acceptance checks](docs/RELEASE_7_HANDOFF.md) and [owner account actions](docs/OWNER_ACCOUNT_ACTIONS.md). No production deployment or Google account setup is claimed.

## Security

`assets/js/runtime-config.js` may contain only public/publishable browser configuration. Never commit a Supabase service-role key, administrator password, database password or any private credential.

Operational Supabase deployment notes remain under `docs/`.
