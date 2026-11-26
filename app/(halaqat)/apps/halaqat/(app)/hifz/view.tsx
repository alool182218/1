import { Suspense } from "react";
import Link from "next/link";
import { BookMarked, Users } from "lucide-react";
import { getStaff } from "../../_lib/auth";
import { BASE } from "../../_lib/supabase";
import { addDays, formatDay, formatHijri, isIsoDate, today } from "../../_lib/dates";
import type { Recitation, RecitationKind, Surah } from "../../_lib/hifz";
import { Card, Empty, ErrorNote, Loading, PageHeader, btn } from "../../_components/ui";
import { DayPicker } from "../day-picker";
import { RecitationBoard, type LastPosition } from "./board";

export type Search = { h?: string; d?: string };

const PAGE: Record<RecitationKind, { title: string; path: string }> = {
  hifz: { title: "الحفظ", path: `${BASE}/hifz` },
  muraja: { title: "المراجعة", path: `${BASE}/muraja` },
};

async function Recitations({ kind, searchParams }: { kind: RecitationKind; searchParams: Promise<Search> }) {
  const { title, path } = PAGE[kind];
  const { supabase, isAdmin } = await getStaff();
  const sp = await searchParams;

  const [{ data: halaqat, error }, { data: surahs }] = await Promise.all([
    supabase.from("hq_halaqat").select("id, name").eq("active", true).order("name"),
    supabase.from("hq_surahs").select("id, name, ayahs").order("id").returns<Surah[]>(),
  ]);

  if (error || !surahs) return <ErrorNote>تعذّر تحميل البيانات.</ErrorNote>;

  if (!halaqat || halaqat.length === 0) {
    return (
      <Card>
        <Empty icon={BookMarked} title="لا توجد حلقات بعد">
          {isAdmin ? (
            <Link href={`${BASE}/groups`} className={`${btn.primary} mt-3`}>
              إنشاء حلقة
            </Link>
          ) : (
            "لم تُسند إليك حلقة بعد. تواصل مع الإدارة."
          )}
        </Empty>
      </Card>
    );
  }

  const now = today();
  const day = isIsoDate(sp.d) && sp.d <= now ? sp.d : now;
  const halaqaId = halaqat.some((h) => String(h.id) === sp.h) ? Number(sp.h) : halaqat[0].id;
  const nextDay = addDays(day, 1);

  const { data: students } = await supabase
    .from("hq_students")
    .select("id, full_name")
    .eq("halaqa_id", halaqaId)
    .eq("active", true)
    .order("full_name");
  const ids = (students ?? []).map((s) => s.id);

  const [{ data: records }, { data: history }] = await Promise.all([
    supabase
      .from("hq_recitations")
      .select("id, student_id, day, kind, surah, from_ayah, to_ayah, grade, note")
      .eq("halaqa_id", halaqaId)
      .eq("day", day)
      .eq("kind", kind)
      .order("id")
      .returns<Recitation[]>(),
    ids.length
      ? supabase
          .from("hq_recitations")
          .select("student_id, surah, to_ayah")
          .in("student_id", ids)
          .eq("kind", kind)
          .lte("day", day)
          .order("day", { ascending: false })
          .order("id", { ascending: false })
          .limit(2000)
      : Promise.resolve({ data: [] as { student_id: number; surah: number; to_ayah: number }[] }),
  ]);

  // Latest position of each student for this kind, up to the selected day.
  const last: Record<number, LastPosition> = {};
  for (const r of history ?? []) last[r.student_id] ??= { surah: r.surah, to_ayah: r.to_ayah };

  return (
    <>
      <PageHeader title={title} subtitle={`${formatDay(day)} - ${formatHijri(day)}`}>
        <DayPicker
          base={path}
          halaqat={halaqat}
          halaqaId={halaqaId}
          day={day}
          prev={addDays(day, -1)}
          next={nextDay <= now ? nextDay : null}
          max={now}
        />
      </PageHeader>

      {!students || students.length === 0 ? (
        <Card>
          <Empty icon={Users} title="لا يوجد طلاب في هذه الحلقة">
            <Link href={`${BASE}/students/new?h=${halaqaId}`} className={`${btn.primary} mt-3`}>
              تسجيل طالب
            </Link>
          </Empty>
        </Card>
      ) : (
        <RecitationBoard
          key={`${halaqaId}-${day}`}
          kind={kind}
          halaqaId={halaqaId}
          day={day}
          students={students.map((s) => ({ id: s.id, name: s.full_name }))}
          surahs={surahs}
          records={records ?? []}
          last={last}
        />
      )}
    </>
  );
}

/** Shared page body for the memorization and review sections. */
export function RecitationView({ kind, searchParams }: { kind: RecitationKind; searchParams: Promise<Search> }) {
  return (
    <Suspense fallback={<Loading />}>
      <Recitations kind={kind} searchParams={searchParams} />
    </Suspense>
  );
}
