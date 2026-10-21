# Crecer Grande Website

Production website for **https://crecergrande.in/**.

## Current structure

- Engineering-focused homepage
- Engineering Desk
- Services and eight capability divisions
- Projects and case-study patterns
- Engineering Insights, guides and downloadable division profiles
- Industries, About, Contact, Privacy and Disclaimer
- Request-for-Quote and enquiry workflows
- Secure Website Manager under `/admin/`
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
node scripts/check_photography.cjs
AUDIT_VIEWPORT=mobile node scripts/check_photography.cjs
```

Browser scripts default to the local server on port 8765; `SITE_BASE` selects another origin. Functional checks use controlled responses for enquiry, upload, feedback and currency scenarios. All browser checks block production writes. A passing local test does not establish production deployment or authenticated administrator access.

## Photography

Content imagery uses raster files; SVG artwork and inline SVG are excluded. Relevant images may be reused rather than forcing unrelated imagery or synthetic fillers into each placement. The asset guard prevents SVG artwork from being reintroduced. Retired SVG generation scripts have been removed.

`assets/data/photography.json` records the existing assets selected for reuse. Their original photographic provenance was not supplied; the refresh does not establish that they are original photographs of Crecer Grande's premises or customer work. Representative imagery must not be presented as evidence of a specific customer project. Use properly sourced photographs or company-supplied originals for future replacements.

Engineering calculators provide planning figures with explicit assumptions, not commercial quotations or substitutes for manufacturing review. Homepage search, Engineering Desk routes, project/article filters, forms and chat each have local functional coverage.

## Security

`assets/js/runtime-config.js` may contain only public/publishable browser configuration. Never commit a Supabase service-role key, administrator password, database password or any private credential.

Operational Supabase deployment notes remain under `docs/`.
