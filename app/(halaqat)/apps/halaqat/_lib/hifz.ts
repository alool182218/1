import { BookOpenCheck, Repeat } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RecitationKind = "hifz" | "muraja";
export type Grade = "excellent" | "very_good" | "good" | "acceptable" | "repeat";

export type Surah = { id: number; name: string; ayahs: number };

export type Recitation = {
  id: number;
  student_id: number;
  day: string;
  kind: RecitationKind;
  surah: number;
  from_ayah: number;
  to_ayah: number;
  grade: Grade;
  note: string | null;
};

export const KINDS: RecitationKind[] = ["hifz", "muraja"];
export const KIND: Record<RecitationKind, { label: string; icon: LucideIcon }> = {
  hifz: { label: "حفظ جديد", icon: BookOpenCheck },
  muraja: { label: "مراجعة", icon: Repeat },
};

export const GRADES: Grade[] = ["excellent", "very_good", "good", "acceptable", "repeat"];
export const GRADE: Record<Grade, { label: string; soft: string; solid: string }> = {
  excellent: { label: "ممتاز", soft: "bg-present/10 text-present", solid: "bg-present text-white" },
  very_good: { label: "جيد جداً", soft: "bg-primary-soft text-primary", solid: "bg-primary text-white" },
  good: { label: "جيد", soft: "bg-excused/10 text-excused", solid: "bg-excused text-white" },
  acceptable: { label: "مقبول", soft: "bg-late/10 text-late", solid: "bg-late text-white" },
  repeat: { label: "يُعاد", soft: "bg-absent/10 text-absent", solid: "bg-absent text-white" },
};

export const isKind = (v: unknown): v is RecitationKind => typeof v === "string" && (KINDS as string[]).includes(v);
export const isGrade = (v: unknown): v is Grade => typeof v === "string" && (GRADES as string[]).includes(v);

/** "البقرة 1-25", or "البقرة 7" for a single ayah, or "البقرة كاملة" for the whole surah. */
export function rangeLabel(surah: Surah | undefined, from: number, to: number) {
  const name = surah?.name ?? "سورة";
  if (surah && from === 1 && to === surah.ayahs) return `${name} كاملة`;
  return from === to ? `${name} ${from}` : `${name} ${from}-${to}`;
}
