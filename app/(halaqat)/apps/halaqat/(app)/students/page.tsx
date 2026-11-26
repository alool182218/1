import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Search, UserPlus, Users } from "lucide-react";
import { getStaff } from "../../_lib/auth";
import { BASE } from "../../_lib/supabase";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, btn, inputCls } from "../../_components/ui";

export const metadata: Metadata = { title: "الطلاب" };

type Search = { q?: string; h?: string; all?: string };

async function StudentList({ searchParams }: { searchParams: Promise<Search> }) {
  const { supabase } = await getStaff();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const showAll = sp.all === "1";

  const { data: halaqat } = await supabase.from("hq_halaqat").select("id, name").order("name");
  const halaqaName = new Map((halaqat ?? []).map((h) => [h.id, h.name]));

  let query = supabase
    .from("hq_students")
    .select("id, full_name, halaqa_id, guardian_phone, active")
    .order("full_name")
    .limit(500);
  if (q) query = query.ilike("full_name", `%${q.replace(/[%_]/g, "")}%`);
  if (sp.h && halaqaName.has(Number(sp.h))) query = query.eq("halaqa_id", Number(sp.h));
  if (!showAll) query = query.eq("active", true);

  const { data: students, error } = await query;

  return (
    <>
      <form className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search
            size={15}
            strokeWidth={1.75}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input name="q" defaultValue={q} placeholder="بحث بالاسم" className={`${inputCls} pr-9`} />
        </div>
        <select name="h" defaultValue={sp.h ?? ""} aria-label="الحلقة" className={`${inputCls} w-auto`}>
          <option value="">كل الحلقات</option>
          {(halaqat ?? []).map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" name="all" value="1" defaultChecked={showAll} className="size-4 accent-primary" />
          إظهار غير المنتظمين
        </label>
        <button type="submit" className={btn.secondary}>
          تطبيق
        </button>
      </form>

      {error ? (
        <ErrorNote>تعذّر تحميل الطلاب.</ErrorNote>
      ) : !students || students.length === 0 ? (
        <Card>
          <Empty icon={Users} title={q || sp.h ? "لا توجد نتائج" : "لا يوجد طلاب بعد"} />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 text-right font-bold">الطالب</th>
                <th className="px-4 py-2.5 text-right font-bold">الحلقة</th>
                <th className="hidden px-4 py-2.5 text-right font-bold sm:table-cell">جوال ولي الأمر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-canvas/60">
                  <td className="px-4 py-2.5">
                    <Link href={`${BASE}/students/${s.id}`} className="font-bold hover:text-primary">
                      {s.full_name}
                    </Link>
                    {!s.active && <Badge className="mr-2 bg-line/60 text-muted">غير منتظم</Badge>}
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    {s.halaqa_id ? halaqaName.get(s.halaqa_id) : "بدون حلقة"}
                  </td>
                  <td className="hidden px-4 py-2.5 text-muted sm:table-cell" dir="ltr">
                    <span className="block text-right">{s.guardian_phone ?? "-"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line px-4 py-2 text-xs text-muted">{students.length} طالب</p>
        </Card>
      )}
    </>
  );
}

export default function StudentsPage({ searchParams }: PageProps<"/apps/halaqat/students">) {
  return (
    <>
      <PageHeader title="الطلاب">
        <Link href={`${BASE}/students/new`} className={btn.primary}>
          <UserPlus size={16} strokeWidth={1.75} aria-hidden />
          تسجيل طالب
        </Link>
      </PageHeader>
      <Suspense fallback={<Loading />}>
        <StudentList searchParams={searchParams as Promise<Search>} />
      </Suspense>
    </>
  );
}
