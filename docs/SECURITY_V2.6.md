# Security — Crecer Grande Website V2.6

## Browser-safe values

The Supabase project URL and publishable key are intentionally browser-visible. They are protected by the database's Row Level Security and function authorization rules.

## Values that must never be committed

- Supabase service-role / secret key
- Database password
- Administrator passwords
- Email-provider secrets
- Private API keys
- Authentication recovery tokens

## Website Manager security

Website Manager V2.6 uses:
1. Supabase Auth for administrator sign-in.
2. `user_profiles` / role data for administrator state.
3. Row Level Security for normal browser-side database operations.
4. The `admin-users` Edge Function for privileged Auth Admin operations.
5. `users.manage` permission and active-profile checks in the Edge Function.
6. Root-only protection for assigning the Super Admin role.

The server-only secret/service credential belongs in the Supabase Edge Function environment, never in `assets/js/runtime-config.js`.
