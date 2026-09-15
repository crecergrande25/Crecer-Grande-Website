# Crecer Grande Website V2.4 Deployment

## Recommended live-site deployment
Use the **DEPLOY_OVER_EXISTING** ZIP when upgrading the current live site. It preserves your existing `assets/js/runtime-config.js` so the Supabase browser connection is not overwritten.

1. Back up the current repository/site.
2. Extract the deploy package.
3. Upload/replace its contents at the existing website root.
4. Do not delete the existing `assets/js/runtime-config.js`.
5. Confirm these URLs after deployment:
   - `/`
   - `/insights.html`
   - `/insights/vernier-caliper-guide.html`
   - `/insights/metric-tap-drill-clearance-hole-chart.html`
   - `/admin/`
6. Confirm menu, mobile menu, search/filter, Request a Quote and admin login.
7. Submit/refresh the sitemap in Google Search Console if desired.

## Full package
The full package contains all source files including the runtime-config template. Use it for backup/source control or a fresh deployment where the Supabase public config will be supplied separately.
