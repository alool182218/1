"use client";

import { useState, useTransition } from "react";
import { CheckCheck, Loader } from "lucide-react";
import { STATUS, STATUSES } from "../_lib/status";
import type { AttendanceStatus } from "../_lib/types";
import { markPresent, setAttendance } from "./attendance-actions";
import { ErrorNote, btn } from "../_components/ui";

type Row = { id: number; name: string };

export function AttendanceBoard({
  halaqaId,
  day,
  students,
  initial,
}: {
  halaqaId: number;
  day: string;
  students: Row[];
  initial: Record<number, AttendanceStatus>;
}) {
  const [marks, setMarks] = useState<Record<number, AttendanceStatus>>(initial);
  const [saving, setSaving] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [bulkPending, startBulk] = useTransition();

  const busy = (id: number, on: boolean) =>
    setSaving((s) => {
      const next = new Set(s);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  async function choose(id: number, status: AttendanceStatus) {
    const previous = marks[id];
    const next = previous === status ? null : status; // tapping the active status clears it
    setError(null);
    setMarks((m) => {
      const copy = { ...m };
      if (next) copy[id] = next;
      else delete copy[id];
      return copy;
    });
    busy(id, true);
    const res = await setAttendance(halaqaId, day, id, next);
    busy(id, false);
    if (res.error) {
      setError(res.error);
      setMarks((m) => {
        const copy = { ...m };
        if (previous) copy[id] = previous;
        else delete copy[id];
        return copy;
      });
    }
  }

  const unmarked = students.filter((s) => !marks[s.id]).map((s) => s.id);

  function markRest() {
    setError(null);
    startBulk(async () => {
      const res = await markPresent(halaqaId, day, unmarked);
      if (res.error) setError(res.error);
      else setMarks((m) => ({ ...m, ...Object.fromEntries(unmarked.map((id) => [id, "present" as const])) }));
    });
  }

  const counts = STATUSES.map((s) => ({ s, n: students.filter((st) => marks[st.id] === s).length }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {counts.map(({ s, n }) => {
          const { label, icon: Icon, soft } = STATUS[s];
          return (
            <span key={s} className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs ${soft}`}>
              <Icon size={14} strokeWidth={2} aria-hidden />
              {label} <b className="tabular-nums">{n}</b>
            </span>
          );
        })}
        <span className="inline-flex h-7 items-center rounded-md bg-line/50 px-2 text-xs text-muted">
          لم يُسجّل <b className="mr-1 tabular-nums">{unmarked.length}</b>
        </span>

        <button
          type="button"
          onClick={markRest}
          disabled={bulkPending || unmarked.length === 0}
          className={`${btn.secondary} mr-auto`}
        >
          {bulkPending ? (
            <Loader size={15} strokeWidth={1.75} className="animate-spin" aria-hidden />
          ) : (
            <CheckCheck size={16} strokeWidth={1.75} aria-hidden />
          )}
          تحضير الباقين
        </button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {students.map((st, i) => (
          <li key={st.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 sm:flex-nowrap">
            <span className="w-6 shrink-0 text-xs tabular-nums text-muted">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-bold">{st.name}</span>
            {saving.has(st.id) && (
              <Loader size={14} strokeWidth={1.75} className="animate-spin text-muted" aria-label="جاري الحفظ" />
            )}
            <div role="radiogroup" aria-label={`حضور ${st.name}`} className="grid w-full grid-cols-4 gap-1 sm:w-auto">
              {STATUSES.map((s) => {
                const { label, icon: Icon, solid, text } = STATUS[s];
                const on = marks[st.id] === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => choose(st.id, s)}
                    className={`flex h-8 items-center justify-center gap-1 rounded-md border px-2.5 text-xs transition-colors ${
                      on ? `${solid} border-transparent` : `border-line ${text} hover:bg-canvas`
                    }`}
                  >
                    <Icon size={14} strokeWidth={2} aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
