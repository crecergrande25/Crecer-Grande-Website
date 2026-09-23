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

## Security

`assets/js/runtime-config.js` may contain only public/publishable browser configuration. Never commit a Supabase service-role key, administrator password, database password or any private credential.

Operational Supabase deployment notes remain under `docs/`.
