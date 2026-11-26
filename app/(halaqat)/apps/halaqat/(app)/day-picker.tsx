"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { inputCls, btn } from "../_components/ui";

type Option = { id: number; name: string };

/** Circle selector + date navigation; state lives in the URL (?h=&d=). */
export function DayPicker({
  base,
  halaqat,
  halaqaId,
  day,
  prev,
  next,
  max,
}: {
  base: string;
  halaqat: Option[];
  halaqaId: number;
  day: string;
  prev: string;
  next: string | null;
  max: string;
}) {
  const router = useRouter();
  const go = (h: number, d: string) => router.push(`${base}?h=${h}&d=${d}`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {halaqat.length > 1 && (
        <select
          aria-label="الحلقة"
          value={halaqaId}
          onChange={(e) => go(Number(e.target.value), day)}
          className={`${inputCls} w-auto min-w-40`}
        >
          {halaqat.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-1">
        <button type="button" aria-label="اليوم السابق" onClick={() => go(halaqaId, prev)} className={btn.ghost}>
          <ChevronRight size={16} strokeWidth={1.75} />
        </button>
        <input
          type="date"
          aria-label="التاريخ"
          value={day}
          max={max}
          onChange={(e) => e.target.value && go(halaqaId, e.target.value)}
          className={`${inputCls} w-auto`}
        />
        <button
          type="button"
          aria-label="اليوم التالي"
          disabled={!next}
          onClick={() => next && go(halaqaId, next)}
          className={`${btn.ghost} disabled:opacity-30`}
        >
          <ChevronLeft size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
