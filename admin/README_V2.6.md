# Crecer Grande Website Manager V2.6

## Security model

- Public browser configuration contains only the Supabase project URL and publishable key.
- Supabase Auth provides administrator sessions.
- Database writes run under the signed-in user's Row Level Security policies.
- Privileged user creation / password reset is sent to the `admin-users` Edge Function.
- The service-role / secret key stays only in the Edge Function environment.
- The browser never receives the service-role / secret key.
- Root / Super Admin assignment is additionally protected server-side.

## Admin areas

- Dashboard
- Enquiries
- Analytics
- Website Settings
- Homepage / Page Content / Page Text
- Divisions / Projects / Resources
- Media Assets
- Products / Variants / Categories / Brands
- Users & Access
- Audit Log
- My Account

The data editor is schema-tolerant: it loads actual fields returned by the live tables rather than hard-coding a fragile V2.6-only database schema.

## Existing Supabase dependencies

The live database must keep the established V2.x RLS policies, authentication users and helper RPCs.
The included V2.6 package intentionally contains no private service key and no administrator passwords.
