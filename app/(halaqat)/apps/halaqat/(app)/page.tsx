import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BookMarked, Users } from "lucide-react";
import { getStaff } from "../_lib/auth";
import { BASE } from "../_lib/supabase";
import { addDays, formatDay, formatHijri, isIsoDate, today } from "../_lib/dates";
import type { AttendanceStatus } from "../_lib/types";
import { Card, Empty, ErrorNote, Loading, PageHeader, btn } from "../_components/ui";
import { AttendanceBoard } from "./board";
import { DayPicker } from "./day-picker";

export const metadata: Metadata = { title: "الحضور" };

type Search = { h?: string; d?: string };

async function Attendance({ searchParams }: { searchParams: Promise<Search> }) {
  const { supabase, isAdmin } = await getStaff();
  const sp = await searchParams;

  const { data: halaqat, error } = await supabase
    .from("hq_halaqat")
    .select("id, name")
    .eq("active", true)
    .order("name");

  if (error) return <ErrorNote>تعذّر تحميل الحلقات.</ErrorNote>;

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

  const [{ data: students }, { data: records }] = await Promise.all([
    supabase.from("hq_students").select("id, full_name").eq("halaqa_id", halaqaId).eq("active", true).order("full_name"),
    supabase.from("hq_attendance").select("student_id, status").eq("halaqa_id", halaqaId).eq("day", day),
  ]);

  const initial: Record<number, AttendanceStatus> = {};
  for (const r of records ?? []) initial[r.student_id] = r.status;

  return (
    <>
      <PageHeader title="الحضور" subtitle={`${formatDay(day)} - ${formatHijri(day)}`}>
        <DayPicker
          base={BASE}
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
        <AttendanceBoard
          key={`${halaqaId}-${day}`}
          halaqaId={halaqaId}
          day={day}
          students={students.map((s) => ({ id: s.id, name: s.full_name }))}
          initial={initial}
        />
      )}
    </>
  );
}

export default function AttendancePage({ searchParams }: PageProps<"/apps/halaqat">) {
  return (
    <Suspense fallback={<Loading />}>
      <Attendance searchParams={searchParams as Promise<Search>} />
    </Suspense>
  );
}
