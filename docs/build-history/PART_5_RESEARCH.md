# Crecer Grande Website V2.6 — Part 5 Research Notes

## Scope
Part 5 completes the main service/division architecture, normalizes navigation and replaces the temporary Admin placeholder with a secured Website Manager V2.6.

## Security design
The Website Manager uses the existing Supabase Auth + RLS model for browser-side database access. Privileged Auth Admin operations (create user, reset another user's password) are kept in the `admin-users` Edge Function with the server-only secret/service credential.

Current Supabase guidance explicitly states that Auth Admin `createUser` must be called only on a server and that service-role/secret credentials must never be exposed in the browser. Current Edge Function guidance also supports validating authenticated-user JWTs in the function and applying RLS / permission checks.

## Service / division design decisions
- Eight CG divisions are represented as capability areas, while customers are still encouraged to start from the engineering problem.
- Product sourcing remains a major Products platform rather than being forced into the eight-division organization model.
- Service pages now consistently show scope, working method, technical inputs and possible deliverables.
- Inspection pages do not claim laboratory / accreditation status.
- ISO/QMS pages do not claim CG is a certification body.
- Business-compliance pages distinguish administrative support from legal/tax/statutory professional advice or authorized sign-off.
- Third-party brand and equipment references remain compatibility/search context unless a commercial relationship is specifically documented.

## Admin design decisions
- No admin passwords embedded in the repository.
- No service-role or secret key embedded in the repository.
- Login accepts a CG admin alias and derives the internal admin-domain email.
- Direct table edits are constrained by the signed-in user's RLS policies.
- User creation / role / reset actions are routed to the protected Edge Function.
- The data editor is schema-tolerant so it can work across the existing V2.x table structure without a destructive migration.

## Deployment note
Uploading the static package to GitHub Pages updates the public website and Website Manager front-end. The included `supabase/functions/admin-users` source is version-controlled with the site but must be deployed to the existing Supabase project separately only if the deployed function is absent or needs the V2.6 update.
