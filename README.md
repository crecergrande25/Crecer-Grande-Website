# Crecer Grande Website V2.9.5

Production-ready static website for **https://crecergrande.in/**.

## Current release focus

V2.9.5 is the **Premium Foundation** revision:

- Adds a shared premium interaction and visual-polish layer without changing public routes, content or catalogue data
- Refines header depth, navigation feedback, mega-menu treatment, buttons, cards, image hover treatment and the Ask iKNOW panel
- Strengthens keyboard focus visibility and reduced-motion support
- Adds more consistent premium shadows, borders and responsive touch behavior across shared components
- Enhances footer depth while preserving the existing Crecer Grande navy/gold visual language
- Normalizes public sitemap pages to the V2.9.5 shared stylesheet cache key
- Keeps V2.9.4 technical stabilization behavior intact

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
Current release: **V2.9.5**.

See `VERSION_HISTORY.md` and `CHANGELOG_V2.9.5.md`.

## Important security rule

`assets/js/runtime-config.js` contains only the **public/publishable** Supabase browser configuration.

Never add a Supabase `service_role` key, secret key, administrator password, database password or other private credential to the GitHub repository.

See `docs/SECURITY_V2.6.md` and `docs/SUPABASE_ADMIN_DEPLOYMENT.md`.