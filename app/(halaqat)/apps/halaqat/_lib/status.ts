import { Check, Clock, DoorOpen, X, type LucideIcon } from "lucide-react";
import type { AttendanceStatus } from "./types";

export const STATUSES: AttendanceStatus[] = ["present", "late", "excused", "absent"];

export const STATUS: Record<
  AttendanceStatus,
  { label: string; icon: LucideIcon; text: string; solid: string; soft: string }
> = {
  present: { label: "حاضر", icon: Check, text: "text-present", solid: "bg-present text-white", soft: "bg-present/10 text-present" },
  late: { label: "متأخر", icon: Clock, text: "text-late", solid: "bg-late text-white", soft: "bg-late/10 text-late" },
  excused: { label: "مستأذن", icon: DoorOpen, text: "text-excused", solid: "bg-excused text-white", soft: "bg-excused/10 text-excused" },
  absent: { label: "غائب", icon: X, text: "text-absent", solid: "bg-absent text-white", soft: "bg-absent/10 text-absent" },
};

export const isStatus = (v: unknown): v is AttendanceStatus =>
  typeof v === "string" && (STATUSES as string[]).includes(v);

/** Attendance rate: present or late, out of all recorded days. */
export function attendanceRate(counts: Record<AttendanceStatus, number>) {
  const total = counts.present + counts.late + counts.excused + counts.absent;
  return total === 0 ? null : Math.round(((counts.present + counts.late) / total) * 100);
}

export const emptyCounts = (): Record<AttendanceStatus, number> => ({ present: 0, late: 0, excused: 0, absent: 0 });
