-- Memorization (hifz) records for the Quran circles app.
-- hq_surahs: the 114 surahs (Hafs numbering) used to pick and validate ranges.
-- hq_recitations: one row per recitation a teacher records for a student.

create table public.hq_surahs (
  id smallint primary key check (id between 1 and 114),
  name text not null,
  ayahs smallint not null check (ayahs > 0)
);

insert into public.hq_surahs (id, name, ayahs) values
  (1, 'الفاتحة', 7), (2, 'البقرة', 286), (3, 'آل عمران', 200), (4, 'النساء', 176),
  (5, 'المائدة', 120), (6, 'الأنعام', 165), (7, 'الأعراف', 206), (8, 'الأنفال', 75),
  (9, 'التوبة', 129), (10, 'يونس', 109), (11, 'هود', 123), (12, 'يوسف', 111),
  (13, 'الرعد', 43), (14, 'إبراهيم', 52), (15, 'الحجر', 99), (16, 'النحل', 128),
  (17, 'الإسراء', 111), (18, 'الكهف', 110), (19, 'مريم', 98), (20, 'طه', 135),
  (21, 'الأنبياء', 112), (22, 'الحج', 78), (23, 'المؤمنون', 118), (24, 'النور', 64),
  (25, 'الفرقان', 77), (26, 'الشعراء', 227), (27, 'النمل', 93), (28, 'القصص', 88),
  (29, 'العنكبوت', 69), (30, 'الروم', 60), (31, 'لقمان', 34), (32, 'السجدة', 30),
  (33, 'الأحزاب', 73), (34, 'سبأ', 54), (35, 'فاطر', 45), (36, 'يس', 83),
  (37, 'الصافات', 182), (38, 'ص', 88), (39, 'الزمر', 75), (40, 'غافر', 85),
  (41, 'فصلت', 54), (42, 'الشورى', 53), (43, 'الزخرف', 89), (44, 'الدخان', 59),
  (45, 'الجاثية', 37), (46, 'الأحقاف', 35), (47, 'محمد', 38), (48, 'الفتح', 29),
  (49, 'الحجرات', 18), (50, 'ق', 45), (51, 'الذاريات', 60), (52, 'الطور', 49),
  (53, 'النجم', 62), (54, 'القمر', 55), (55, 'الرحمن', 78), (56, 'الواقعة', 96),
  (57, 'الحديد', 29), (58, 'المجادلة', 22), (59, 'الحشر', 24), (60, 'الممتحنة', 13),
  (61, 'الصف', 14), (62, 'الجمعة', 11), (63, 'المنافقون', 11), (64, 'التغابن', 18),
  (65, 'الطلاق', 12), (66, 'التحريم', 12), (67, 'الملك', 30), (68, 'القلم', 52),
  (69, 'الحاقة', 52), (70, 'المعارج', 44), (71, 'نوح', 28), (72, 'الجن', 28),
  (73, 'المزمل', 20), (74, 'المدثر', 56), (75, 'القيامة', 40), (76, 'الإنسان', 31),
  (77, 'المرسلات', 50), (78, 'النبأ', 40), (79, 'النازعات', 46), (80, 'عبس', 42),
  (81, 'التكوير', 29), (82, 'الانفطار', 19), (83, 'المطففين', 36), (84, 'الانشقاق', 25),
  (85, 'البروج', 22), (86, 'الطارق', 17), (87, 'الأعلى', 19), (88, 'الغاشية', 26),
  (89, 'الفجر', 30), (90, 'البلد', 20), (91, 'الشمس', 15), (92, 'الليل', 21),
  (93, 'الضحى', 11), (94, 'الشرح', 8), (95, 'التين', 8), (96, 'العلق', 19),
  (97, 'القدر', 5), (98, 'البينة', 8), (99, 'الزلزلة', 8), (100, 'العاديات', 11),
  (101, 'القارعة', 11), (102, 'التكاثر', 8), (103, 'العصر', 3), (104, 'الهمزة', 9),
  (105, 'الفيل', 5), (106, 'قريش', 4), (107, 'الماعون', 7), (108, 'الكوثر', 3),
  (109, 'الكافرون', 6), (110, 'النصر', 3), (111, 'المسد', 5), (112, 'الإخلاص', 4),
  (113, 'الفلق', 5), (114, 'الناس', 6);

create type public.hq_recitation_kind as enum ('hifz', 'muraja');
create type public.hq_grade as enum ('excellent', 'very_good', 'good', 'acceptable', 'repeat');

create table public.hq_recitations (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.hq_students (id) on delete cascade,
  halaqa_id bigint not null references public.hq_halaqat (id) on delete cascade,
  day date not null default (now() at time zone 'Asia/Riyadh')::date,
  kind public.hq_recitation_kind not null default 'hifz',
  surah smallint not null references public.hq_surahs (id),
  from_ayah smallint not null check (from_ayah >= 1),
  to_ayah smallint not null,
  grade public.hq_grade not null,
  note text check (note is null or char_length(note) <= 300),
  recorded_by uuid default auth.uid() references public.hq_profiles (id) on delete set null,
  recorded_at timestamptz not null default now(),
  check (to_ayah >= from_ayah)
);

create index hq_recitations_halaqa_day_idx on public.hq_recitations (halaqa_id, day);
create index hq_recitations_student_idx on public.hq_recitations (student_id, day desc, id desc);

-- The range must end inside the surah.
create function hq_private.hq_check_recitation_range() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.to_ayah > (select s.ayahs from public.hq_surahs s where s.id = new.surah) then
    raise exception 'HQ_AYAH_OUT_OF_RANGE';
  end if;
  return new;
end;
$$;

create trigger hq_recitations_range
  before insert or update on public.hq_recitations
  for each row execute function hq_private.hq_check_recitation_range();

-- Row level security: same scope as attendance.
alter table public.hq_surahs enable row level security;
alter table public.hq_recitations enable row level security;

create policy "Staff read surahs" on public.hq_surahs
  for select to authenticated using (hq_private.hq_is_staff());

create policy "Read recitations" on public.hq_recitations
  for select to authenticated using (hq_private.hq_is_admin() or hq_private.hq_teaches(halaqa_id));
create policy "Record recitations" on public.hq_recitations
  for insert to authenticated with check (
    (hq_private.hq_is_admin() or hq_private.hq_teaches(halaqa_id))
    and hq_private.hq_student_in(student_id, halaqa_id)
  );
create policy "Change recitations" on public.hq_recitations
  for update to authenticated
  using (hq_private.hq_is_admin() or hq_private.hq_teaches(halaqa_id))
  with check (
    (hq_private.hq_is_admin() or hq_private.hq_teaches(halaqa_id))
    and hq_private.hq_student_in(student_id, halaqa_id)
  );
create policy "Delete recitations" on public.hq_recitations
  for delete to authenticated using (hq_private.hq_is_admin() or hq_private.hq_teaches(halaqa_id));

revoke all on public.hq_surahs, public.hq_recitations from anon;
grant select on public.hq_surahs to authenticated;
grant select, insert, update, delete on public.hq_recitations to authenticated;
