-- Move the access helpers out of the API-exposed public schema so they cannot be
-- called as /rest/v1/rpc/... endpoints. Policies reference functions by OID, so
-- they keep working. Signed-in users still need USAGE + EXECUTE for RLS checks.

create schema if not exists hq_private;
revoke all on schema hq_private from public, anon;
grant usage on schema hq_private to authenticated;

alter function public.hq_is_staff() set schema hq_private;
alter function public.hq_is_admin() set schema hq_private;
alter function public.hq_teaches(bigint) set schema hq_private;
alter function public.hq_student_in(bigint, bigint) set schema hq_private;
alter function public.hq_handle_new_user() set schema hq_private;
