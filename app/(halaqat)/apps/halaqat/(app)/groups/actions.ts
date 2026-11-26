"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { requireAdmin } from "../../_lib/auth";
import { BASE } from "../../_lib/supabase";
import type { FormState } from "../../_lib/types";

const text = (fd: FormData, k: string, max: number) => {
  const v = String(fd.get(k) ?? "").trim().slice(0, max);
  return v || null;
};

function readGroup(fd: FormData) {
  const teacher = String(fd.get("teacher_id") ?? "");
  return {
    name: text(fd, "name", 80) ?? "",
    teacher_id: /^[0-9a-f-]{36}$/i.test(teacher) ? teacher : null,
    schedule: text(fd, "schedule", 120),
    location: text(fd, "location", 120),
  };
}

export async function createGroup(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const group = readGroup(fd);
  if (group.name.length < 2) return { error: "اكتب اسم الحلقة." };

  const { data, error } = await supabase.from("hq_halaqat").insert(group).select("id").single();
  if (error) return { error: "تعذّر إنشاء الحلقة." };

  redirect(`${BASE}/groups/${data.id}`);
}

export async function updateGroup(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const group = readGroup(fd);
  if (group.name.length < 2) return { error: "اكتب اسم الحلقة." };

  const { error } = await supabase
    .from("hq_halaqat")
    .update({ ...group, active: fd.get("active") === "on" })
    .eq("id", id);
  if (error) return { error: "تعذّر حفظ التعديلات." };

  refresh();
  return { ok: "تم حفظ التعديلات." };
}

export async function deleteGroup(id: number) {
  const { supabase } = await requireAdmin();
  await supabase.from("hq_halaqat").delete().eq("id", id);
  redirect(`${BASE}/groups`);
}
