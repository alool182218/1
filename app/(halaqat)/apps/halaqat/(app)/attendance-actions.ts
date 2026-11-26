"use server";

import { getStaff } from "../_lib/auth";
import { isIsoDate, today } from "../_lib/dates";
import { isStatus } from "../_lib/status";
import type { AttendanceStatus } from "../_lib/types";

type Result = { error?: string };

function validDay(day: string) {
  return isIsoDate(day) && day <= today();
}

/** Set (or clear, with status null) one student's attendance for a day. */
export async function setAttendance(
  halaqaId: number,
  day: string,
  studentId: number,
  status: AttendanceStatus | null
): Promise<Result> {
  if (!Number.isInteger(halaqaId) || !Number.isInteger(studentId) || !validDay(day)) {
    return { error: "بيانات غير صالحة." };
  }
  if (status !== null && !isStatus(status)) return { error: "حالة غير صالحة." };

  const { supabase } = await getStaff();

  const { error } =
    status === null
      ? await supabase.from("hq_attendance").delete().eq("student_id", studentId).eq("day", day)
      : await supabase
          .from("hq_attendance")
          .upsert({ student_id: studentId, halaqa_id: halaqaId, day, status }, { onConflict: "student_id,day" });

  return error ? { error: "لم يتم الحفظ. تأكد من صلاحيتك على هذه الحلقة." } : {};
}

/** Mark every listed student as present (used for the "mark the rest present" button). */
export async function markPresent(halaqaId: number, day: string, studentIds: number[]): Promise<Result> {
  if (!Number.isInteger(halaqaId) || !validDay(day) || !studentIds.every(Number.isInteger)) {
    return { error: "بيانات غير صالحة." };
  }
  if (studentIds.length === 0) return {};

  const { supabase } = await getStaff();
  const rows = studentIds.map((student_id) => ({ student_id, halaqa_id: halaqaId, day, status: "present" as const }));
  const { error } = await supabase.from("hq_attendance").upsert(rows, { onConflict: "student_id,day" });

  return error ? { error: "لم يتم الحفظ. تأكد من صلاحيتك على هذه الحلقة." } : {};
}
