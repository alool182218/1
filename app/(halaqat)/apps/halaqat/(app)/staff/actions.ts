"use server";

import { randomInt } from "node:crypto";
import { refresh } from "next/cache";
import { requireAdmin } from "../../_lib/auth";
import type { FormState, Role } from "../../_lib/types";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no look-alike characters

function inviteCode(length = 8) {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

const isRole = (v: unknown): v is Role => v === "admin" || v === "teacher";

export async function createInvite(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase, profile } = await requireAdmin();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const fullName = String(fd.get("full_name") ?? "").trim().slice(0, 120);
  const role = fd.get("role");

  if (fullName.length < 2) return { error: "اكتب الاسم الكامل." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "البريد الإلكتروني غير صحيح." };
  if (!isRole(role)) return { error: "اختر الصلاحية." };

  const { error } = await supabase
    .from("hq_invites")
    .insert({ email, full_name: fullName, role, code: inviteCode(), created_by: profile.id });

  if (error) {
    return { error: error.code === "23505" ? "يوجد دعوة سابقة لهذا البريد." : "تعذّر إنشاء الدعوة." };
  }
  refresh();
  return { ok: "تم إنشاء الدعوة. أرسل الرمز للشخص مع رابط التطبيق." };
}

export async function deleteInvite(id: number) {
  const { supabase } = await requireAdmin();
  await supabase.from("hq_invites").delete().eq("id", id);
  refresh();
}

export async function setActive(id: string, active: boolean) {
  const { supabase, profile } = await requireAdmin();
  if (id === profile.id) return; // an admin cannot lock themselves out
  await supabase.from("hq_profiles").update({ active }).eq("id", id);
  refresh();
}

export async function setRole(id: string, role: Role) {
  const { supabase, profile } = await requireAdmin();
  if (id === profile.id || !isRole(role)) return;
  await supabase.from("hq_profiles").update({ role }).eq("id", id);
  refresh();
}
