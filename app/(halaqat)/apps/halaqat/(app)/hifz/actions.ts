"use server";

import { refresh } from "next/cache";
import { getStaff } from "../../_lib/auth";
import { isIsoDate, today } from "../../_lib/dates";
import { isGrade, isKind, type RecitationKind } from "../../_lib/hifz";
import type { FormState } from "../../_lib/types";

const int = (fd: FormData, k: string) => {
  const n = Number(fd.get(k));
  return Number.isInteger(n) ? n : NaN;
};

/** Record one recitation (new memorization or review) for a student. */
export async function addRecitation(
  kind: RecitationKind,
  halaqaId: number,
  day: string,
  studentId: number,
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  if (!Number.isInteger(halaqaId) || !Number.isInteger(studentId) || !isIsoDate(day) || day > today()) {
    return { error: "بيانات غير صالحة." };
  }

  const grade = fd.get("grade");
  const surah = int(fd, "surah");
  const from = int(fd, "from_ayah");
  const to = int(fd, "to_ayah");
  const note = String(fd.get("note") ?? "").trim().slice(0, 300) || null;

  if (!isKind(kind)) return { error: "بيانات غير صالحة." };
  if (!(surah >= 1 && surah <= 114)) return { error: "اختر السورة." };
  if (!(from >= 1) || !(to >= 1)) return { error: "اكتب رقم آية البداية والنهاية." };
  if (to < from) return { error: "آية النهاية يجب أن تكون بعد آية البداية." };
  if (!isGrade(grade)) return { error: "اختر التقدير." };

  const { supabase } = await getStaff();
  const { error } = await supabase.from("hq_recitations").insert({
    student_id: studentId,
    halaqa_id: halaqaId,
    day,
    kind,
    surah,
    from_ayah: from,
    to_ayah: to,
    grade,
    note,
  });

  if (error) {
    if (error.message.includes("HQ_AYAH_OUT_OF_RANGE")) return { error: "رقم الآية أكبر من عدد آيات السورة." };
    return { error: "لم يتم الحفظ. تأكد من صلاحيتك على هذه الحلقة." };
  }

  refresh();
  return { ok: "تم التسجيل." };
}

export async function deleteRecitation(id: number) {
  if (!Number.isInteger(id)) return;
  const { supabase } = await getStaff();
  await supabase.from("hq_recitations").delete().eq("id", id);
  refresh();
}
