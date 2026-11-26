import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BookMarked, Clock, MapPin, Plus, UserRound, Users } from "lucide-react";
import { getStaff } from "../../_lib/auth";
import { BASE } from "../../_lib/supabase";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, btn } from "../../_components/ui";

export const metadata: Metadata = { title: "الحلقات" };

async function Groups() {
  const { supabase, isAdmin } = await getStaff();

  const [{ data: groups, error }, { data: staff }, { data: students }] = await Promise.all([
    supabase.from("hq_halaqat").select("id, name, teacher_id, schedule, location, active").order("active", { ascending: false }).order("name"),
    supabase.from("hq_profiles").select("id, full_name"),
    supabase.from("hq_students").select("halaqa_id").eq("active", true),
  ]);

  if (error) return <ErrorNote>تعذّر تحميل الحلقات.</ErrorNote>;

  const teacherName = new Map((staff ?? []).map((p) => [p.id, p.full_name]));
  const count = new Map<number, number>();
  for (const s of students ?? []) if (s.halaqa_id) count.set(s.halaqa_id, (count.get(s.halaqa_id) ?? 0) + 1);

  return (
    <>
      <PageHeader title="الحلقات" subtitle={isAdmin ? "كل حلقات المجمع" : "الحلقات المسندة إليك"}>
        {isAdmin && (
          <Link href={`${BASE}/groups/new`} className={btn.primary}>
            <Plus size={16} strokeWidth={1.75} aria-hidden />
            حلقة جديدة
          </Link>
        )}
      </PageHeader>

      {!groups || groups.length === 0 ? (
        <Card>
          <Empty icon={BookMarked} title="لا توجد حلقات بعد" />
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={`${BASE}/groups/${g.id}`}
                className="block h-full rounded-lg border border-line bg-surface p-4 transition-colors hover:border-primary/40"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h2 className="font-bold">{g.name}</h2>
                  {!g.active && <Badge className="bg-line/60 text-muted">موقوفة</Badge>}
                </div>
                <dl className="space-y-1.5 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <UserRound size={14} strokeWidth={1.75} aria-hidden />
                    <dd>{g.teacher_id ? teacherName.get(g.teacher_id) : "بدون معلم"}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} strokeWidth={1.75} aria-hidden />
                    <dd>{count.get(g.id) ?? 0} طالب</dd>
                  </div>
                  {g.schedule && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} strokeWidth={1.75} aria-hidden />
                      <dd>{g.schedule}</dd>
                    </div>
                  )}
                  {g.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} strokeWidth={1.75} aria-hidden />
                      <dd>{g.location}</dd>
                    </div>
                  )}
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function GroupsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Groups />
    </Suspense>
  );
}
