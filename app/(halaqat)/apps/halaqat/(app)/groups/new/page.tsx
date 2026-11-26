import { Suspense } from "react";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { requireAdmin } from "../../../_lib/auth";
import { BASE } from "../../../_lib/supabase";
import { BackLink, Card, Loading, PageHeader } from "../../../_components/ui";
import { GroupForm } from "../group-form";
import { createGroup } from "../actions";

export const metadata: Metadata = { title: "حلقة جديدة" };

async function NewGroup() {
  const { supabase } = await requireAdmin();
  const { data: teachers } = await supabase
    .from("hq_profiles")
    .select("id, full_name")
    .eq("active", true)
    .order("full_name");
  return <GroupForm action={createGroup} teachers={teachers ?? []} />;
}

export default function NewGroupPage() {
  return (
    <>
      <BackLink href={`${BASE}/groups`}>
        <ChevronRight size={15} strokeWidth={1.75} aria-hidden />
        الحلقات
      </BackLink>
      <PageHeader title="حلقة جديدة" />
      <Card className="p-5">
        <Suspense fallback={<Loading />}>
          <NewGroup />
        </Suspense>
      </Card>
    </>
  );
}
