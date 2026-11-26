-- Protect the maintenance allowlist and settings from direct public RPC access.
-- The admin panel now reads/writes these settings through the PIN-authenticated
-- /api/admin maintenance_get and maintenance_set actions.
begin;

revoke execute on function public.site_settings_get() from public, anon, authenticated;
revoke execute on function public.site_settings_set(boolean, text, text[]) from public, anon, authenticated;

-- Keep the functions callable by trusted server-side operations if needed.
grant execute on function public.site_settings_get() to service_role;
grant execute on function public.site_settings_set(boolean, text, text[]) to service_role;

commit;
