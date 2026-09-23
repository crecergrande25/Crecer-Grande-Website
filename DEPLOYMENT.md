# Crecer Grande Website Deployment

## Hosting

The public website is deployed from the repository's `main` branch through GitHub Pages and the custom domain **crecergrande.in**.

No npm, Python or server-side build is required for the public website.

## Files that must remain at repository root

- `index.html`
- `CNAME`
- `.nojekyll`
- `robots.txt`
- `sitemap.xml`
- `manifest.webmanifest`

## Production smoke test

After a deployment, verify:

- homepage
- Engineering Desk
- Services
- Divisions
- Projects
- Insights
- About
- Contact
- Request a Quote
- `/admin/` login
- mobile navigation
- enquiry submission
- one non-critical authenticated Admin read/edit action

## Supabase

GitHub Pages deployment does not deploy Supabase Edge Functions. Supabase remains a separate backend. Follow the maintained instructions in `docs/` for backend or administrator-function changes.
