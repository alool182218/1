import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpenCheck, CalendarDays, ChevronRight, Phone, Trash2 } from "lucide-react";
import { GRADE, KIND, rangeLabel, type Recitation, type Surah } from "../../../_lib/hifz";
import { getStaff } from "../../../_lib/auth";
import { BASE } from "../../../_lib/supabase";
import { formatHijri, formatShort } from "../../../_lib/dates";
import { STATUS, STATUSES, attendanceRate, emptyCounts } from "../../../_lib/status";
import type { AttendanceStatus, Student } from "../../../_lib/types";
import { BackLink, Badge, Card, Empty, Loading, PageHeader, btn } from "../../../_components/ui";
import { ConfirmSubmit } from "../../../_components/confirm";
import { StudentForm } from "../student-form";
import { deleteStudent, updateStudent } from "../actions";

export const metadata: Metadata = { title: "ملف الطالب" };

async function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const { supabase, isAdmin } = await getStaff();

  const [{ data: student }, { data: halaqat }, { data: history }, { data: recitations }, { data: surahs }] = await Promise.all([
    supabase.from("hq_students").select("*").eq("id", id).maybeSingle<Student>(),
    supabase.from("hq_halaqat").select("id, name").order("name"),
    supabase
      .from("hq_attendance")
      .select("day, status")
      .eq("student_id", id)
      .order("day", { ascending: false })
      .limit(400),
    supabase
      .from("hq_recitations")
      .select("id, student_id, day, kind, surah, from_ayah, to_ayah, grade, note")
      .eq("student_id", id)
      .order("day", { ascending: false })
      .order("id", { ascending: false })
      .limit(30)
      .returns<Recitation[]>(),
    supabase.from("hq_surahs").select("id, name, ayahs").returns<Surah[]>(),
  ]);
  const surahById = new Map((surahs ?? []).map((s) => [s.id, s]));

  if (!student) notFound();

  const counts = emptyCounts();
  for (const r of history ?? []) counts[r.status as AttendanceStatus]++;
  const rate = attendanceRate(counts);
  const halaqaName = halaqat?.find((h) => h.id === student.halaqa_id)?.name;
  const recent = (history ?? []).slice(0, 30);

  return (
    <>
      <PageHeader
        title={student.full_name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>{halaqaName ?? "بدون حلقة"}</span>
            {!student.active && <Badge className="bg-line/60 text-muted">غير منتظم</Badge>}
            {student.guardian_phone && (
              <a href={`tel:${student.guardian_phone}`} className="inline-flex items-center gap-1 hover:text-primary" dir="ltr">
                <Phone size={13} strokeWidth={1.75} aria-hidden />
                {student.guardian_phone}
              </a>
            )}
          </span>
        }
      >
        {isAdmin && (
          <form action={deleteStudent.bind(null, student.id)}>
            <ConfirmSubmit
              message={`حذف الطالب "${student.full_name}" وكل سجلات حضوره نهائياً؟`}
              className={btn.danger}
            >
              <Trash2 size={15} strokeWidth={1.75} aria-hidden />
              حذف
            </ConfirmSubmit>
          </form>
        )}
      </PageHeader>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Card className="p-3">
          <p className="text-xs text-muted">نسبة الحضور</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-primary">{rate === null ? "-" : `${rate}%`}</p>
        </Card>
        {STATUSES.map((s) => {
          const { label, icon: Icon, text } = STATUS[s];
          return (
            <Card key={s} className="p-3">
              <p className={`flex items-center gap-1 text-xs ${text}`}>
                <Icon size={13} strokeWidth={2} aria-hidden />
                {label}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums">{counts[s]}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-bold">بيانات الطالب</h2>
          <StudentForm
            action={updateStudent.bind(null, student.id)}
            halaqat={halaqat ?? []}
            student={student}
            allowNoHalaqa={isAdmin}
          />
        </Card>

        <Card>
          <h2 className="border-b border-line px-4 py-3 text-sm font-bold">آخر سجلات الحضور</h2>
          {recent.length === 0 ? (
            <Empty icon={CalendarDays} title="لا توجد سجلات" />
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((r) => {
                const { label, icon: Icon, soft } = STATUS[r.status as AttendanceStatus];
                return (
                  <li key={r.day} className="flex items-center justify-between gap-2 px-4 py-2 text-sm">
                    <span>
                      {formatShort(r.day)}
                      <span className="mr-2 text-xs text-muted">{formatHijri(r.day)}</span>
                    </span>
                    <Badge className={soft}>
                      <Icon size={12} strokeWidth={2} aria-hidden />
                      {label}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="border-b border-line px-4 py-3 text-sm font-bold">سجل الحفظ والمراجعة</h2>
        {!recitations || recitations.length === 0 ? (
          <Empty icon={BookOpenCheck} title="لا يوجد تسميع مسجّل" />
        ) : (
          <ul className="divide-y divide-line">
            {recitations.map((r) => {
              const { label: kindLabel, icon: KindIcon } = KIND[r.kind];
              const g = GRADE[r.grade];
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-sm">
                  <span className="w-20 shrink-0 text-xs text-muted">{formatShort(r.day)}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <KindIcon size={13} strokeWidth={1.75} aria-hidden />
                    {kindLabel}
                  </span>
                  <span className="font-bold">{rangeLabel(surahById.get(r.surah), r.from_ayah, r.to_ayah)}</span>
                  <Badge className={g.soft}>{g.label}</Badge>
                  {r.note && <span className="text-xs text-muted">{r.note}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}

export default function StudentPage({ params }: PageProps<"/apps/halaqat/students/[id]">) {
  return (
    <>
      <BackLink href={`${BASE}/students`}>
        <ChevronRight size={15} strokeWidth={1.75} aria-hidden />
        الطلاب
      </BackLink>
      <Suspense fallback={<Loading />}>
        <StudentProfile params={params} />
      </Suspense>
    </>
  );
}
