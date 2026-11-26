import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ChartColumn } from "lucide-react";
import { getStaff } from "../../_lib/auth";
import { BASE } from "../../_lib/supabase";
import { formatShort, isIsoDate, monthStart, today } from "../../_lib/dates";
import { STATUS, STATUSES, attendanceRate, emptyCounts } from "../../_lib/status";
import type { AttendanceStatus } from "../../_lib/types";
import { Card, Empty, ErrorNote, Field, Loading, PageHeader, btn, inputCls } from "../../_components/ui";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "التقارير" };

type Search = { h?: string; from?: string; to?: string };
type Row = { id: number; name: string; halaqa: string; counts: Record<AttendanceStatus, number> };

function rateClass(rate: number | null) {
  if (rate === null) return "text-muted";
  if (rate >= 90) return "text-present";
  if (rate >= 75) return "text-late";
  return "text-absent";
}

async function Report({ searchParams }: { searchParams: Promise<Search> }) {
  const { supabase } = await getStaff();
  const sp = await searchParams;

  const now = today();
  let from = isIsoDate(sp.from) ? sp.from : monthStart(now);
  let to = isIsoDate(sp.to) ? sp.to : now;
  if (from > to) [from, to] = [to, from];

  const { data: halaqat } = await supabase.from("hq_halaqat").select("id, name").order("name");
  const halaqaName = new Map((halaqat ?? []).map((h) => [h.id, h.name]));
  const halaqaId = sp.h && halaqaName.has(Number(sp.h)) ? Number(sp.h) : null;

  const [{ data: totals, error }, { data: students }] = await Promise.all([
    supabase.rpc("hq_attendance_report", { p_from: from, p_to: to, p_halaqa: halaqaId }),
    supabase.from("hq_students").select("id, full_name, halaqa_id"),
  ]);

  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const rows: Row[] = ((totals ?? []) as { student_id: number; present: number; late: number; excused: number; absent: number }[])
    .map((t) => {
      const s = studentById.get(t.student_id);
      return {
        id: t.student_id,
        name: s?.full_name ?? "طالب منقول",
        halaqa: s?.halaqa_id ? (halaqaName.get(s.halaqa_id) ?? "-") : "-",
        counts: { present: t.present, late: t.late, excused: t.excused, absent: t.absent },
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));

  const sum = emptyCounts();
  for (const r of rows) for (const s of STATUSES) sum[s] += r.counts[s];
  const overall = attendanceRate(sum);

  return (
    <>
      <form className="no-print mb-4 flex flex-wrap items-end gap-3">
        <Field label="الحلقة">
          <select name="h" defaultValue={halaqaId ?? ""} className={`${inputCls} w-auto min-w-40`}>
            <option value="">كل الحلقات</option>
            {(halaqat ?? []).map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="من">
          <input type="date" name="from" defaultValue={from} max={now} className={`${inputCls} w-auto`} />
        </Field>
        <Field label="إلى">
          <input type="date" name="to" defaultValue={to} max={now} className={`${inputCls} w-auto`} />
        </Field>
        <button type="submit" className={btn.primary}>
          عرض التقرير
        </button>
        <span className="mr-auto">
          <PrintButton />
        </span>
      </form>

      <p className="mb-3 text-sm text-muted">
        {halaqaId ? halaqaName.get(halaqaId) : "كل الحلقات"} - من {formatShort(from)} إلى {formatShort(to)}
      </p>

      {error ? (
        <ErrorNote>تعذّر إنشاء التقرير.</ErrorNote>
      ) : rows.length === 0 ? (
        <Card>
          <Empty icon={ChartColumn} title="لا توجد سجلات حضور في هذه الفترة" />
        </Card>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Card className="p-3">
              <p className="text-xs text-muted">نسبة الحضور العامة</p>
              <p className={`mt-1 text-lg font-bold tabular-nums ${rateClass(overall)}`}>
                {overall === null ? "-" : `${overall}%`}
              </p>
            </Card>
            {STATUSES.map((s) => {
              const { label, icon: Icon, text } = STATUS[s];
              return (
                <Card key={s} className="p-3">
                  <p className={`flex items-center gap-1 text-xs ${text}`}>
                    <Icon size={13} strokeWidth={2} aria-hidden />
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums">{sum[s]}</p>
                </Card>
              );
            })}
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-xs text-muted">
                <tr>
                  <th className="px-4 py-2.5 text-right font-bold">الطالب</th>
                  {!halaqaId && <th className="px-4 py-2.5 text-right font-bold">الحلقة</th>}
                  {STATUSES.map((s) => (
                    <th key={s} className={`px-3 py-2.5 text-center font-bold ${STATUS[s].text}`}>
                      {STATUS[s].label}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-center font-bold">النسبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => {
                  const rate = attendanceRate(r.counts);
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-2">
                        <Link href={`${BASE}/students/${r.id}`} className="font-bold hover:text-primary">
                          {r.name}
                        </Link>
                      </td>
                      {!halaqaId && <td className="px-4 py-2 text-muted">{r.halaqa}</td>}
                      {STATUSES.map((s) => (
                        <td key={s} className="px-3 py-2 text-center tabular-nums">
                          {r.counts[s] || <span className="text-muted/50">0</span>}
                        </td>
                      ))}
                      <td className={`px-3 py-2 text-center font-bold tabular-nums ${rateClass(rate)}`}>
                        {rate === null ? "-" : `${rate}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-line bg-canvas/60 font-bold">
                <tr>
                  <td className="px-4 py-2.5" colSpan={halaqaId ? 1 : 2}>
                    المجموع ({rows.length} طالب)
                  </td>
                  {STATUSES.map((s) => (
                    <td key={s} className="px-3 py-2.5 text-center tabular-nums">
                      {sum[s]}
                    </td>
                  ))}
                  <td className={`px-3 py-2.5 text-center tabular-nums ${rateClass(overall)}`}>
                    {overall === null ? "-" : `${overall}%`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>
        </>
      )}
    </>
  );
}

export default function ReportsPage({ searchParams }: PageProps<"/apps/halaqat/reports">) {
  return (
    <>
      <PageHeader title="تقرير الحضور" subtitle="نسبة الحضور = (حاضر + متأخر) من مجموع الأيام المسجلة" />
      <Suspense fallback={<Loading />}>
        <Report searchParams={searchParams as Promise<Search>} />
      </Suspense>
    </>
  );
}
