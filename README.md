# Crecer Grande Website V2.9.4

Production-ready static website for **https://crecergrande.in/**.

## Current release focus

V2.9.4 is the **Technical Stabilization** revision:

- Fixes the shared footer-normalization JavaScript error that could stop common page initialization
- Restores reliable initialization for the mobile navigation, Ask iKNOW and common analytics handlers
- Removes obsolete references to the deleted `part4-visuals.css` stylesheet from laser product-family pages
- Normalizes the public sitemap pages to the V2.9.4 shared-runtime cache key
- Corrects the malformed duplicate query-string runtime reference on the 3D printing quote page
- Preserves the V2.9.3 catalogue, SEO, RFQ and Website Manager functionality without structural redesign

## What is included

- Engineering-gateway homepage
- Engineering Desk
- Mechanical Design Job Work platform
- Industrial Products platform
- Laser Product Finder
- Laser cutting heads, consumables, chillers, pumps and service-spares pages
- 3D Printing & CAD quotation platform
- Material explorer and additive-manufacturing design guide
- 8 Crecer Grande division pages
- Specialist engineering / manufacturing / maintenance / quality / tender service pages
- Resources / technical insights
- Industries / About / Privacy / Disclaimer
- Secure Website Manager front-end
- Supabase `admin-users` Edge Function source
- SEO metadata, canonical URLs, structured data, sitemap, robots, manifest and 404 page
- GitHub Pages custom-domain files (`CNAME`, `.nojekyll`)

## Hosting model

The public website is static and can be served directly by GitHub Pages.  
Supabase provides the live database, Auth, enquiry/file workflow, analytics and secured administration layer.

## Versioning

Crecer Grande Website uses `V<generation>.<feature-release>.<revision>`.

- Small corrections increment the third number.
- Significant feature / architecture changes increment the second number and reset revision to zero.
- Major platform-generation changes increment the first number.

Known stable reference versions: **V1.9.3** and **V2.6.4**.  
Current release: **V2.9.4**.

See `VERSION_HISTORY.md` and `CHANGELOG_V2.9.4.md`.

## Important security rule

`assets/js/runtime-config.js` contains only the **public/publishable** Supabase browser configuration.

Never add a Supabase `service_role` key, secret key, administrator password, database password or other private credential to the GitHub repository.

See `docs/SECURITY_V2.6.md` and `docs/SUPABASE_ADMIN_DEPLOYMENT.md`.