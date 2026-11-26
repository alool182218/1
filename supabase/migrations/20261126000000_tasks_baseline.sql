-- Tasks project: the todos table as first created by hand in the SQL Editor.
-- Written idempotently so it is safe on the existing database.

create table if not exists public.todos (
  id bigint generated always as identity primary key,
  name text not null
);

alter table public.todos enable row level security;

grant select on public.todos to anon;

drop policy if exists "Public can read todos" on public.todos;
create policy "Public can read todos" on public.todos for select to anon using (true);
