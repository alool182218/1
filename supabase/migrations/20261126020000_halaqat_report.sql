-- Per-student attendance totals for a date range (optionally one circle).
-- security invoker: the caller's row level security still applies.
create function public.hq_attendance_report(p_from date, p_to date, p_halaqa bigint default null)
returns table (student_id bigint, present int, late int, excused int, absent int)
language sql stable security invoker set search_path = '' as $$
  select
    a.student_id,
    (count(*) filter (where a.status = 'present'))::int,
    (count(*) filter (where a.status = 'late'))::int,
    (count(*) filter (where a.status = 'excused'))::int,
    (count(*) filter (where a.status = 'absent'))::int
  from public.hq_attendance a
  where a.day between p_from and p_to
    and (p_halaqa is null or a.halaqa_id = p_halaqa)
  group by a.student_id;
$$;

revoke execute on function public.hq_attendance_report(date, date, bigint) from public, anon;
grant execute on function public.hq_attendance_report(date, date, bigint) to authenticated;
