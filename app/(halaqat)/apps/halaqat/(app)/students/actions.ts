"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { getStaff, requireAdmin } from "../../_lib/auth";
import { BASE } from "../../_lib/supabase";
import { isIsoDate } from "../../_lib/dates";
import type { FormState } from "../../_lib/types";

const text = (fd: FormData, k: string, max: number) => {
  const v = String(fd.get(k) ?? "").trim().slice(0, max);
  return v || null;
};

function readStudent(fd: FormData) {
  const halaqa = Number(fd.get("halaqa_id"));
  const birth = String(fd.get("birth_date") ?? "");
  const joined = String(fd.get("joined_on") ?? "");
  return {
    full_name: text(fd, "full_name", 120) ?? "",
    halaqa_id: Number.isInteger(halaqa) && halaqa > 0 ? halaqa : null,
    guardian_name: text(fd, "guardian_name", 120),
    guardian_phone: text(fd, "guardian_phone", 30),
    birth_date: isIsoDate(birth) ? birth : null,
    ...(isIsoDate(joined) ? { joined_on: joined } : {}),
    notes: text(fd, "notes", 1000),
  };
}

export async function createStudent(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase, isAdmin } = await getStaff();
  const student = readStudent(fd);
  if (student.full_name.length < 2) return { error: "اكتب اسم الطالب الكامل." };
  if (!isAdmin && !student.halaqa_id) return { error: "اختر الحلقة." };

  const { data, error } = await supabase.from("hq_students").insert(student).select("id").single();
  if (error) return { error: "تعذّر حفظ الطالب. تأكد من صلاحيتك على الحلقة المختارة." };

  redirect(`${BASE}/students/${data.id}`);
}

export async function updateStudent(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase, isAdmin } = await getStaff();
  const student = readStudent(fd);
  if (student.full_name.length < 2) return { error: "اكتب اسم الطالب الكامل." };
  if (!isAdmin && !student.halaqa_id) return { error: "اختر الحلقة." };

  const { error, count } = await supabase
    .from("hq_students")
    .update({ ...student, active: fd.get("active") === "on" }, { count: "exact" })
    .eq("id", id);
  if (error || count === 0) return { error: "تعذّر حفظ التعديلات. تأكد من صلاحيتك على الحلقة المختارة." };

  refresh();
  return { ok: "تم حفظ التعديلات." };
}

export async function deleteStudent(id: number) {
  const { supabase } = await requireAdmin();
  await supabase.from("hq_students").delete().eq("id", id);
  redirect(`${BASE}/students`);
}
