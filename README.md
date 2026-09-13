# Crecer Grande Website V2.0 — Final Restored Complete Build

This release keeps the successful V2.0/R4 backend and restores the image-rich visual identity of the earlier V1.9.3 website.

## Public website
- Restored image-driven homepage, division cards, product cards, project cards and process visuals.
- 8 division pages.
- 8 product-detail pages.
- 6 focused SEO service pages: Laser Marking, 3D Printing, Reverse Engineering, Custom Machine Spares, Industrial Machine Maintenance and Laser Cutting.
- Projects, Resources, Estimate, Industries, About, Contact/RFQ, Privacy, Disclaimer and custom 404.
- Responsive mobile navigation, WhatsApp links, canonical metadata, sitemap, robots, structured data and Open Graph/Twitter metadata.
- Restored legacy asset filenames so current Supabase image URLs continue resolving.
- 8 downloadable division profiles plus legacy download-path aliases.

## Website Manager V2.0
Includes Pages & SEO, global settings, divisions, products, variants, internal pricing, estimate rules, projects, resources, media, enquiries, analytics, access management and audit log.

If the Supabase Project URL/key are not yet present in browser configuration, Website Manager displays a guided **Connect Supabase** panel instead of failing silently. The public website remains fully usable using its static fallback content.

## Security
The package contains no Supabase secret/service-role key, database password, admin password or private authentication credential. Only the browser-safe Project URL and publishable/anon key belong in `runtime-config.js`.

## Brand font
The Crecer Grande logo artwork is included. The Pirulen font file is intentionally not redistributed. CSS retains Pirulen as the preferred display-font name and uses safe fallbacks when it is not installed/licensed as a webfont.

Read `START_HERE.txt` before deployment.
