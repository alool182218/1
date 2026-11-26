import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Trash2, UserPlus, Users } from "lucide-react";
import { getStaff } from "../../../_lib/auth";
import { BASE } from "../../../_lib/supabase";
import type { Halaqa } from "../../../_lib/types";
import { BackLink, Badge, Card, Empty, Loading, PageHeader, btn } from "../../../_components/ui";
import { ConfirmSubmit } from "../../../_components/confirm";
import { GroupForm } from "../group-form";
import { deleteGroup, updateGroup } from "../actions";

export const metadata: Metadata = { title: "الحلقة" };

async function Group({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const { supabase, isAdmin } = await getStaff();

  const [{ data: group }, { data: students }, { data: teachers }] = await Promise.all([
    supabase.from("hq_halaqat").select("*").eq("id", id).maybeSingle<Halaqa>(),
    supabase.from("hq_students").select("id, full_name, active").eq("halaqa_id", id).order("full_name"),
    supabase.from("hq_profiles").select("id, full_name, active").order("full_name"),
  ]);

  if (!group) notFound();

  const teacher = teachers?.find((t) => t.id === group.teacher_id);
  const activeStudents = (students ?? []).filter((s) => s.active);

  return (
    <>
      <PageHeader
        title={group.name}
        subtitle={[teacher?.full_name ?? "بدون معلم", group.schedule, group.location].filter(Boolean).join(" - ")}
      >
        <Link href={`${BASE}?h=${group.id}`} className={btn.secondary}>
          كشف الحضور
        </Link>
        {isAdmin && (
          <form action={deleteGroup.bind(null, group.id)}>
            <ConfirmSubmit
              message={`حذف حلقة "${group.name}"؟ سيبقى الطلاب بدون حلقة، وتُحذف سجلات حضور هذه الحلقة.`}
              className={btn.danger}
            >
              <Trash2 size={15} strokeWidth={1.75} aria-hidden />
              حذف
            </ConfirmSubmit>
          </form>
        )}
      </PageHeader>

      <div className={`grid gap-5 ${isAdmin ? "lg:grid-cols-[1fr_20rem]" : ""}`}>
        {isAdmin && (
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-bold">بيانات الحلقة</h2>
            <GroupForm
              action={updateGroup.bind(null, group.id)}
              teachers={(teachers ?? []).filter((t) => t.active || t.id === group.teacher_id)}
              group={group}
            />
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-bold">
              الطلاب <span className="font-normal text-muted">({activeStudents.length})</span>
            </h2>
            <Link href={`${BASE}/students/new?h=${group.id}`} className={btn.ghost}>
              <UserPlus size={15} strokeWidth={1.75} aria-hidden />
              إضافة
            </Link>
          </div>
          {!students || students.length === 0 ? (
            <Empty icon={Users} title="لا يوجد طلاب" />
          ) : (
            <ul className="divide-y divide-line">
              {students.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`${BASE}/students/${s.id}`}
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-canvas/60"
                  >
                    {s.full_name}
                    {!s.active && <Badge className="bg-line/60 text-muted">غير منتظم</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

export default function GroupPage({ params }: PageProps<"/apps/halaqat/groups/[id]">) {
  return (
    <>
      <BackLink href={`${BASE}/groups`}>
        <ChevronRight size={15} strokeWidth={1.75} aria-hidden />
        الحلقات
      </BackLink>
      <Suspense fallback={<Loading />}>
        <Group params={params} />
      </Suspense>
    </>
  );
}
