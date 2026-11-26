-- ============================================================================
-- Halaqat project (Quran circles): staff, circles, students, attendance.
-- All tables use the hq_ prefix and are reachable only by signed-in staff.
-- Recitation tracking (hifz / muraja) will be added later as hq_recitations.
-- ============================================================================

create type public.hq_role as enum ('admin', 'teacher');
create type public.hq_attendance_status as enum ('present', 'absent', 'late', 'excused');

-- Staff ----------------------------------------------------------------------

create table public.hq_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  role public.hq_role not null default 'teacher',
  phone text check (phone is null or char_length(phone) <= 30),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.hq_invites (
  id bigint generated always as identity primary key,
  email text not null unique check (email = lower(email) and email like '%@%'),
  full_name text not null check (char_length(full_name) between 2 and 120),
  role public.hq_role not null default 'teacher',
  code text not null check (char_length(code) between 6 and 20),
  created_by uuid references public.hq_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

-- Circles and students -----------------------------------------------------------

create table public.hq_halaqat (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 80),
  teacher_id uuid references public.hq_profiles (id) on delete set null,
  schedule text check (schedule is null or char_length(schedule) <= 120),
  location text check (location is null or char_length(location) <= 120),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index hq_halaqat_teacher_idx on public.hq_halaqat (teacher_id);

create table public.hq_students (
  id bigint generated always as identity primary key,
  full_name text not null check (char_length(full_name) between 2 and 120),
  halaqa_id bigint references public.hq_halaqat (id) on delete set null,
  guardian_name text check (guardian_name is null or char_length(guardian_name) <= 120),
  guardian_phone text check (guardian_phone is null or char_length(guardian_phone) <= 30),
  birth_date date,
  joined_on date not null default ((now() at time zone 'Asia/Riyadh')::date),
  active boolean not null default true,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

create index hq_students_halaqa_idx on public.hq_students (halaqa_id);

-- Attendance: one record per student per day -----------------------------------

create table public.hq_attendance (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.hq_students (id) on delete cascade,
  halaqa_id bigint not null references public.hq_halaqat (id) on delete cascade,
  day date not null,
  status public.hq_attendance_status not null,
  note text check (note is null or char_length(note) <= 300),
  recorded_by uuid default auth.uid() references public.hq_profiles (id) on delete set null,
  recorded_at timestamptz not null default now(),
  unique (student_id, day)
);

create index hq_attendance_halaqa_day_idx on public.hq_attendance (halaqa_id, day);

-- Access helpers -------------------------------------------------------------------

create function public.hq_is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.hq_profiles
    where id = (select auth.uid()) and active
  );
$$;

create function public.hq_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.hq_profiles
    where id = (select auth.uid()) and active and role = 'admin'
  );
$$;

-- True when the signed-in, active teacher owns the circle.
create function public.hq_teaches(halaqa bigint) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.hq_halaqat h
    join public.hq_profiles p on p.id = h.teacher_id
    where h.id = halaqa and p.id = (select auth.uid()) and p.active
  );
$$;

-- True when the student currently belongs to the circle.
create function public.hq_student_in(student bigint, halaqa bigint) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.hq_students where id = student and halaqa_id = halaqa
  );
$$;

revoke execute on function public.hq_is_staff(), public.hq_is_admin(),
  public.hq_teaches(bigint), public.hq_student_in(bigint, bigint) from public, anon;
grant execute on function public.hq_is_staff(), public.hq_is_admin(),
  public.hq_teaches(bigint), public.hq_student_in(bigint, bigint) to authenticated;

-- Row level security ---------------------------------------------------------------

alter table public.hq_profiles enable row level security;
alter table public.hq_invites enable row level security;
alter table public.hq_halaqat enable row level security;
alter table public.hq_students enable row level security;
alter table public.hq_attendance enable row level security;

-- Profiles: every active staff member sees the staff list; only admins change it.
create policy "Staff read profiles" on public.hq_profiles
  for select to authenticated using (public.hq_is_staff() or id = (select auth.uid()));
create policy "Admins update profiles" on public.hq_profiles
  for update to authenticated using (public.hq_is_admin()) with check (public.hq_is_admin());

-- Invites: admins only.
create policy "Admins manage invites" on public.hq_invites
  for all to authenticated using (public.hq_is_admin()) with check (public.hq_is_admin());

-- Circles: admins manage all; a teacher sees the circles they teach.
create policy "Read circles" on public.hq_halaqat
  for select to authenticated using (public.hq_is_admin() or public.hq_teaches(id));
create policy "Admins add circles" on public.hq_halaqat
  for insert to authenticated with check (public.hq_is_admin());
create policy "Admins update circles" on public.hq_halaqat
  for update to authenticated using (public.hq_is_admin()) with check (public.hq_is_admin());
create policy "Admins delete circles" on public.hq_halaqat
  for delete to authenticated using (public.hq_is_admin());

-- Students: admins manage all; a teacher registers and edits students of their own circles.
create policy "Read students" on public.hq_students
  for select to authenticated using (public.hq_is_admin() or public.hq_teaches(halaqa_id));
create policy "Add students" on public.hq_students
  for insert to authenticated with check (public.hq_is_admin() or public.hq_teaches(halaqa_id));
create policy "Update students" on public.hq_students
  for update to authenticated
  using (public.hq_is_admin() or public.hq_teaches(halaqa_id))
  with check (public.hq_is_admin() or public.hq_teaches(halaqa_id));
create policy "Admins delete students" on public.hq_students
  for delete to authenticated using (public.hq_is_admin());

-- Attendance: admins all; a teacher records for students currently in their circle.
create policy "Read attendance" on public.hq_attendance
  for select to authenticated using (public.hq_is_admin() or public.hq_teaches(halaqa_id));
create policy "Record attendance" on public.hq_attendance
  for insert to authenticated with check (
    (public.hq_is_admin() or public.hq_teaches(halaqa_id))
    and public.hq_student_in(student_id, halaqa_id)
  );
create policy "Change attendance" on public.hq_attendance
  for update to authenticated
  using (public.hq_is_admin() or public.hq_teaches(halaqa_id))
  with check (
    (public.hq_is_admin() or public.hq_teaches(halaqa_id))
    and public.hq_student_in(student_id, halaqa_id)
  );
create policy "Clear attendance" on public.hq_attendance
  for delete to authenticated using (public.hq_is_admin() or public.hq_teaches(halaqa_id));

-- Privileges: signed-in users only (RLS above narrows it down); nothing for anon.
revoke all on public.hq_profiles, public.hq_invites, public.hq_halaqat,
  public.hq_students, public.hq_attendance from anon;
grant select, update on public.hq_profiles to authenticated;
grant select, insert, update, delete on public.hq_invites, public.hq_halaqat,
  public.hq_students, public.hq_attendance to authenticated;
grant usage on all sequences in schema public to authenticated;

-- Sign-up gate ---------------------------------------------------------------------
-- A new account for this app needs a valid invite (email + one-time code).
-- The very first account (the owner) needs the bootstrap code instead; only its
-- SHA-256 hash is stored here.

create function public.hq_handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta_code text := upper(trim(coalesce(new.raw_user_meta_data ->> 'invite_code', '')));
  meta_name text := trim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  inv public.hq_invites;
begin
  if coalesce(new.raw_user_meta_data ->> 'app', '') <> 'halaqat' then
    return new;
  end if;

  if not exists (select 1 from public.hq_profiles) then
    if encode(extensions.digest(meta_code, 'sha256'), 'hex')
       <> '7436a3b9b991a1788cf13a4c6b3fd38ccc17e0eaef228d80fdaf4af1dc8371dc' then
      raise exception 'HQ_INVALID_INVITE';
    end if;
    insert into public.hq_profiles (id, full_name, role)
    values (new.id, case when char_length(meta_name) >= 2 then meta_name else 'المدير' end, 'admin');
    return new;
  end if;

  select * into inv from public.hq_invites
  where email = lower(new.email) and used_at is null;

  if inv.id is null or inv.code <> meta_code then
    raise exception 'HQ_INVALID_INVITE';
  end if;

  insert into public.hq_profiles (id, full_name, role) values (new.id, inv.full_name, inv.role);
  update public.hq_invites set used_at = now() where id = inv.id;
  return new;
end;
$$;

revoke execute on function public.hq_handle_new_user() from public, anon, authenticated;

create trigger hq_on_auth_user_created
  after insert on auth.users
  for each row execute function public.hq_handle_new_user();
