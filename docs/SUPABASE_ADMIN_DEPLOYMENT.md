# Supabase Admin Function Deployment

V2.6 includes:

`supabase/functions/admin-users/index.ts`

This function is required for privileged **Users & Access** operations such as:
- creating an administrator;
- changing another administrator's access state / role;
- resetting another administrator's temporary password.

## Existing database dependencies

The function expects the established V2.x database objects:

- `user_profiles`
- `app_roles`
- RPC `has_permission`
- RPC `admin_set_user_profile`
- RPC `log_admin_event`

It also expects the caller to have `users.manage`.

## Deployment

Use the Supabase CLI or Dashboard for the existing CG Website Builder project and deploy the function named:

`admin-users`

The function environment must provide the normal Supabase URL / browser key and the server-only service-role/secret credential.

Do **not** copy that secret into GitHub or any browser JavaScript file.

## Production validation

Before using this on production administrator accounts:
1. Log in as the root administrator.
2. Create a disposable non-root test administrator.
3. Confirm role assignment.
4. Confirm active/inactive state.
5. Reset its temporary password.
6. Verify audit-log entries.
7. Confirm a non-root administrator cannot assign the Super Admin role.
