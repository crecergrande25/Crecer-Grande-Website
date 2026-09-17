# Crecer Grande Website V2.6

Production-ready static website package for **https://crecergrande.in/**.

## What is included

- V2.6 engineering-gateway homepage
- Engineering Desk
- Industrial Products platform
- Laser Product Finder
- Laser cutting heads, consumables, chillers, pumps and service-spares pages
- 3D Printing & CAD quotation platform
- Material explorer and additive-manufacturing design guide
- 8 Crecer Grande division pages
- Specialist engineering / manufacturing / maintenance / quality / tender service pages
- Projects / engineering case studies
- Resources / technical insights
- Industries / About / Privacy / Disclaimer
- Secure Website Manager V2.6 front-end
- Supabase `admin-users` Edge Function source
- SEO metadata, canonical URLs, structured data, sitemap, robots, manifest and 404 page
- GitHub Pages custom-domain files (`CNAME`, `.nojekyll`)

## Hosting model

The public website is static and can be served directly by GitHub Pages.  
Supabase provides the live database, Auth, enquiry/file workflow, analytics and secured administration layer.

## Important security rule

`assets/js/runtime-config.js` contains only the **public/publishable** Supabase browser configuration.

Never add a Supabase `service_role` key, secret key, administrator password, database password or other private credential to the GitHub repository.

See `docs/SECURITY_V2.6.md` and `docs/SUPABASE_ADMIN_DEPLOYMENT.md`.
