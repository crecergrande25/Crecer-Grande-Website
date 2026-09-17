# admin-users — Crecer Grande Website V2.6

Protected Edge Function for Website Manager → Users & Access.

The browser sends the signed-in administrator JWT. The function:
1. verifies the user session;
2. checks the `users.manage` permission;
3. confirms the caller has an active administrator profile;
4. performs privileged Supabase Auth Admin actions using the server-only service/secret key;
5. writes user-management audit events.

Supported actions:
- `create`
- `update`
- `reset_password`

The service/secret key must remain in the Supabase function environment and must never be added to the public website repository as a browser configuration value.

The function expects the established V2.x database helpers:
- `has_permission`
- `admin_set_user_profile`
- `log_admin_event`

and tables:
- `user_profiles`
- `app_roles`

Default internal login domain: `admin.crecergrande.in`.
