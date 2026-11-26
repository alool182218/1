import { Suspense } from "react";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getStaff } from "../../../_lib/auth";
import { BASE } from "../../../_lib/supabase";
import { BackLink, Card, Loading, PageHeader } from "../../../_components/ui";
import { StudentForm } from "../student-form";
import { createStudent } from "../actions";

export const metadata: Metadata = { title: "تسجيل طالب" };

async function NewStudent({ searchParams }: { searchParams: Promise<{ h?: string }> }) {
  const { supabase, isAdmin } = await getStaff();
  const { h } = await searchParams;
  const { data: halaqat } = await supabase.from("hq_halaqat").select("id, name").eq("active", true).order("name");
  const options = halaqat ?? [];
  const preset = options.find((o) => String(o.id) === h)?.id ?? (options.length === 1 ? options[0].id : undefined);

  return (
    <StudentForm action={createStudent} halaqat={options} defaultHalaqa={preset} allowNoHalaqa={isAdmin} />
  );
}

export default function NewStudentPage({ searchParams }: PageProps<"/apps/halaqat/students/new">) {
  return (
    <>
      <BackLink href={`${BASE}/students`}>
        <ChevronRight size={15} strokeWidth={1.75} aria-hidden />
        الطلاب
      </BackLink>
      <PageHeader title="تسجيل طالب جديد" />
      <Card className="p-5">
        <Suspense fallback={<Loading />}>
          <NewStudent searchParams={searchParams as Promise<{ h?: string }>} />
        </Suspense>
      </Card>
    </>
  );
}
