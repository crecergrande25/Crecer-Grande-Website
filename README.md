# Crecer Grande Website V2.9.2

Production-ready static website for **https://crecergrande.in/**.

## Current release focus

V2.9.2 is the **Website Completion & Consolidation** release:

- Supabase is the authoritative published product catalogue
- 141 published products now have complete image, SEO title, SEO description and canonical URL coverage
- Product Finder and homepage search honor canonical product routes
- Website Manager supports record creation, protected analytics and media uploads
- Homepage and division CMS edits can publish into the public website
- Analytics event naming and browser-session tracking are corrected
- RFQ attachment ownership, extension controls and server-side abuse limits are hardened
- The unused legacy Supabase security project is paused, not deleted
- Sitemap and canonical coverage are normalized for the published catalogue

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
Current release: **V2.9.2**.

See `VERSION_HISTORY.md` and `CHANGELOG_V2.9.2.md`.

## Important security rule

`assets/js/runtime-config.js` contains only the **public/publishable** Supabase browser configuration.

Never add a Supabase `service_role` key, secret key, administrator password, database password or other private credential to the GitHub repository.

See `docs/SECURITY_V2.6.md` and `docs/SUPABASE_ADMIN_DEPLOYMENT.md`.