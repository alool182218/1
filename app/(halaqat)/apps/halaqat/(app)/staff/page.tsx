import { Suspense } from "react";
import type { Metadata } from "next";
import { Trash2, UserCog } from "lucide-react";
import { requireAdmin } from "../../_lib/auth";
import { Badge, Card, Empty, Loading, PageHeader, btn } from "../../_components/ui";
import { ConfirmSubmit } from "../../_components/confirm";
import { CopyCode, InviteForm } from "./invite-form";
import { deleteInvite, setActive, setRole } from "./actions";

export const metadata: Metadata = { title: "الكادر" };

async function Staff() {
  const { supabase, profile: me } = await requireAdmin();

  const [{ data: staff }, { data: invites }, { data: groups }] = await Promise.all([
    supabase.from("hq_profiles").select("id, full_name, role, active").order("role").order("full_name"),
    supabase.from("hq_invites").select("id, email, full_name, role, code, used_at").order("created_at", { ascending: false }),
    supabase.from("hq_halaqat").select("teacher_id").eq("active", true),
  ]);

  const groupCount = new Map<string, number>();
  for (const g of groups ?? []) if (g.teacher_id) groupCount.set(g.teacher_id, (groupCount.get(g.teacher_id) ?? 0) + 1);
  const pending = (invites ?? []).filter((i) => !i.used_at);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-5">
        <Card>
          <h2 className="border-b border-line px-4 py-3 text-sm font-bold">المعلمون والإداريون</h2>
          {!staff || staff.length === 0 ? (
            <Empty icon={UserCog} title="لا يوجد أحد بعد" />
          ) : (
            <ul className="divide-y divide-line">
              {staff.map((p) => {
                const self = p.id === me.id;
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">
                        {p.full_name}
                        {self && <span className="mr-1 text-xs font-normal text-muted">(أنت)</span>}
                      </p>
                      <p className="text-xs text-muted">{groupCount.get(p.id) ?? 0} حلقة</p>
                    </div>
                    <Badge className={p.role === "admin" ? "bg-gold-soft text-gold" : "bg-primary-soft text-primary"}>
                      {p.role === "admin" ? "مدير" : "معلم"}
                    </Badge>
                    {!p.active && <Badge className="bg-absent/10 text-absent">موقوف</Badge>}
                    {!self && (
                      <div className="flex items-center gap-1">
                        <form action={setRole.bind(null, p.id, p.role === "admin" ? "teacher" : "admin")}>
                          <button type="submit" className={btn.ghost}>
                            {p.role === "admin" ? "جعله معلماً" : "جعله مديراً"}
                          </button>
                        </form>
                        <form action={setActive.bind(null, p.id, !p.active)}>
                          <ConfirmSubmit
                            message={p.active ? `إيقاف حساب ${p.full_name}؟ لن يستطيع الدخول.` : `إعادة تفعيل حساب ${p.full_name}؟`}
                            className={btn.ghost}
                          >
                            {p.active ? "إيقاف" : "تفعيل"}
                          </ConfirmSubmit>
                        </form>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="border-b border-line px-4 py-3 text-sm font-bold">
            دعوات بانتظار التفعيل <span className="font-normal text-muted">({pending.length})</span>
          </h2>
          {pending.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">لا توجد دعوات معلقة.</p>
          ) : (
            <ul className="divide-y divide-line">
              {pending.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">
                      {i.full_name}
                      <span className="mr-2 text-xs font-normal text-muted">{i.role === "admin" ? "مدير" : "معلم"}</span>
                    </p>
                    <p className="truncate text-xs text-muted" dir="ltr">
                      <span className="block text-right">{i.email}</span>
                    </p>
                  </div>
                  <CopyCode code={i.code} />
                  <form action={deleteInvite.bind(null, i.id)}>
                    <ConfirmSubmit message="إلغاء هذه الدعوة؟" aria-label="إلغاء الدعوة" className={btn.ghost}>
                      <Trash2 size={15} strokeWidth={1.75} />
                    </ConfirmSubmit>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="h-fit p-4">
        <h2 className="mb-1 text-sm font-bold">دعوة معلم أو إداري</h2>
        <p className="mb-4 text-xs text-muted">
          يفتح الشخص التطبيق ويختار &quot;تفعيل حساب جديد&quot;، ثم يدخل بريده ورمز الدعوة ويختار كلمة مروره.
        </p>
        <InviteForm />
      </Card>
    </div>
  );
}

export default function StaffPage() {
  return (
    <>
      <PageHeader title="الكادر" subtitle="الحسابات والصلاحيات والدعوات" />
      <Suspense fallback={<Loading />}>
        <Staff />
      </Suspense>
    </>
  );
}
