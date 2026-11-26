-- Tasks: completion flag and write access.
alter table public.todos add column if not exists done boolean not null default false;

grant select, insert, update, delete on public.todos to anon;

drop policy if exists "Public can add todos" on public.todos;
create policy "Public can add todos" on public.todos for insert to anon with check (true);

drop policy if exists "Public can update todos" on public.todos;
create policy "Public can update todos" on public.todos for update to anon using (true) with check (true);

drop policy if exists "Public can delete todos" on public.todos;
create policy "Public can delete todos" on public.todos for delete to anon using (true);

-- Notes project: its own table.
create table if not exists public.notes (
  id bigint generated always as identity primary key,
  text text not null check (char_length(text) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

grant select, insert, delete on public.notes to anon;

drop policy if exists "Public can read notes" on public.notes;
create policy "Public can read notes" on public.notes for select to anon using (true);

drop policy if exists "Public can add notes" on public.notes;
create policy "Public can add notes" on public.notes for insert to anon with check (true);

drop policy if exists "Public can delete notes" on public.notes;
create policy "Public can delete notes" on public.notes for delete to anon using (true);

grant usage on all sequences in schema public to anon;
