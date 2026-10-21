# Owner account actions

These actions need the account owner's access and verification. No fake verification token, listing URL, reviews or ownership claim is included in this release.

## Google Search Console

1. Open https://search.google.com/search-console and add the Domain property `crecergrande.in` using the Google account that will own it.
2. Copy the exact TXT record Google provides into the domain's DNS panel, then complete verification. Do not change existing mail, website or other DNS records.
3. Submit `https://crecergrande.in/sitemap.xml`.
4. After deploying this release, inspect the homepage, Services and key local service URLs. Check the Google-selected canonical, indexing status and sitemap processing.
5. Request recrawling of affected URLs. The updated Open Graph copy may also remain in social platforms' caches until they refetch it; a source upload alone cannot clear those caches.

## Google Business Profile

1. Open https://business.google.com/ using the owner's Google account. Search for the existing business before creating a duplicate.
2. Claim or create the legitimate Crecer Grande listing and complete Google's required verification.
3. Use the actual business name, phone, website, opening hours and service categories. Publish the workshop address only if it meets Google's requirements for customer visits; otherwise configure the appropriate service area.
4. Upload the original workshop, machines, parts and team photographs from the media brief. Do not present generated imagery as the premises or customer work.
5. Keep the public name, address/service area and phone consistent with approved website settings. Add the verified listing URL to the website only after ownership and details are confirmed.

## Admin access

The `/admin/` sign-in page and its JavaScript are public static files on GitHub Pages. Hiding the route or removing its footer link does not protect private data. Guessing the URL must still lead only to the sign-in form. Enforce authorization in Supabase RLS and privileged Edge Functions.

Read-only checks on 21 October 2026: public site settings responded HTTP 200; anonymous enquiries, user_profiles and audit_log requests responded HTTP 401 using the existing publishable browser key. No records, users, passwords or policies were changed. This checks those anonymous reads only; it is not a full backend security audit.

The frontend now keeps the workspace hidden and inert until authentication and an active profile are verified, signs out failed profile checks, and clears displayed data on sign-out. No actual administrator login was performed.

In Supabase, review the actual users, active profiles and roles, enforce strong unique passwords and appropriate MFA, enable the appropriate authentication protection/rate limits, and verify policies with an unprivileged authenticated test account. Backend authorization checks must cover reads, writes, uploads and privileged functions. Never add a service-role key to website source. Do not run reference migrations against the existing live database.

If the sign-in page itself must be inaccessible without prior authentication, GitHub Pages cannot provide that access boundary. Put the admin application behind an identity-aware proxy or host it on infrastructure that enforces access before serving it. This is not implemented by this static frontend release.
