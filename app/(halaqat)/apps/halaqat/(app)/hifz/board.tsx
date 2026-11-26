"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { GRADE, GRADES, rangeLabel, type Grade, type Recitation, type RecitationKind, type Surah } from "../../_lib/hifz";
import { ErrorNote, Field, btn, inputCls } from "../../_components/ui";
import { Submit } from "../../_components/submit";
import { ConfirmSubmit } from "../../_components/confirm";
import { addRecitation, deleteRecitation } from "./actions";

type Row = { id: number; name: string };
/** Where a student's last recitation of this kind ended. */
export type LastPosition = { surah: number; to_ayah: number };

export function RecitationBoard({
  kind,
  halaqaId,
  day,
  students,
  surahs,
  records,
  last,
}: {
  kind: RecitationKind;
  halaqaId: number;
  day: string;
  students: Row[];
  surahs: Surah[];
  records: Recitation[];
  last: Record<number, LastPosition>;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const byId = new Map(surahs.map((s) => [s.id, s]));
  const done = new Set(records.map((r) => r.student_id));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-present/10 px-2 text-present">
          سمّع اليوم <b className="tabular-nums">{done.size}</b>
        </span>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-line/50 px-2 text-muted">
          لم يسمّع <b className="tabular-nums">{students.length - done.size}</b>
        </span>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {students.map((st, i) => {
          const mine = records.filter((r) => r.student_id === st.id);
          const pos = last[st.id];
          const isOpen = open === st.id;
          return (
            <li key={st.id} className="px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-xs tabular-nums text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{st.name}</p>
                  <p className="truncate text-xs text-muted">
                    {pos
                      ? `${kind === "hifz" ? "آخر حفظ" : "آخر مراجعة"}: ${positionLabel(byId.get(pos.surah), pos.to_ayah)}`
                      : kind === "hifz"
                        ? "لا يوجد حفظ مسجّل"
                        : "لا توجد مراجعة مسجّلة"}
                  </p>
                </div>
                {!isOpen && (
                  <button type="button" onClick={() => setOpen(st.id)} className={btn.secondary}>
                    <Plus size={15} strokeWidth={1.75} aria-hidden />
                    تسجيل
                  </button>
                )}
              </div>

              {mine.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5 pr-9">
                  {mine.map((r) => {
                    const g = GRADE[r.grade];
                    return (
                      <li
                        key={r.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line py-0.5 pl-0.5 pr-2 text-xs"
                        title={r.note ?? undefined}
                      >
                        <span>{rangeLabel(byId.get(r.surah), r.from_ayah, r.to_ayah)}</span>
                        <span className={`rounded px-1.5 py-0.5 ${g.soft}`}>{g.label}</span>
                        <form action={deleteRecitation.bind(null, r.id)}>
                          <ConfirmSubmit
                            message="حذف هذا التسجيل؟"
                            aria-label="حذف"
                            className="flex size-5 items-center justify-center rounded text-muted hover:bg-absent/10 hover:text-absent"
                          >
                            <X size={12} strokeWidth={2} />
                          </ConfirmSubmit>
                        </form>
                      </li>
                    );
                  })}
                </ul>
              )}

              {isOpen && (
                <RecitationForm
                  action={addRecitation.bind(null, kind, halaqaId, day, st.id)}
                  surahs={surahs}
                  last={pos}
                  onClose={() => setOpen(null)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function positionLabel(surah: Surah | undefined, toAyah: number) {
  if (!surah) return `آية ${toAyah}`;
  return toAyah >= surah.ayahs ? `أتمّ سورة ${surah.name}` : `${surah.name} حتى آية ${toAyah}`;
}

/** Suggest continuing right after the last memorized ayah, in the same surah. */
function suggest(surahs: Surah[], last?: LastPosition) {
  if (!last) return { surah: 0, from: "" };
  const s = surahs.find((x) => x.id === last.surah);
  if (!s || last.to_ayah >= s.ayahs) return { surah: 0, from: "" };
  return { surah: s.id, from: String(last.to_ayah + 1) };
}

function RecitationForm({
  action,
  surahs,
  last,
  onClose,
}: {
  action: (prev: { error?: string; ok?: string } | undefined, fd: FormData) => Promise<{ error?: string; ok?: string } | undefined>;
  surahs: Surah[];
  last?: LastPosition;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const start = suggest(surahs, last);
  const [surahId, setSurahId] = useState<number>(start.surah);
  const [from, setFrom] = useState(start.from);
  const [to, setTo] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  const surah = surahs.find((s) => s.id === surahId);
  const max = surah?.ayahs;

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded-lg border border-line bg-canvas p-3 sm:mr-9">
      <input type="hidden" name="grade" value={grade ?? ""} />

      <div className="grid gap-3 sm:grid-cols-[1fr_6rem_6rem_auto] sm:items-end">
        <Field label="السورة">
          <select
            name="surah"
            required
            value={surahId || ""}
            onChange={(e) => {
              setSurahId(Number(e.target.value));
              setFrom("");
              setTo("");
            }}
            className={inputCls}
          >
            <option value="" disabled>
              اختر السورة
            </option>
            {surahs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}. {s.name} ({s.ayahs} آية)
              </option>
            ))}
          </select>
        </Field>
        <Field label="من آية">
          <input
            name="from_ayah"
            type="number"
            inputMode="numeric"
            required
            min={1}
            max={max}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
            dir="ltr"
          />
        </Field>
        <Field label="إلى آية">
          <input
            name="to_ayah"
            type="number"
            inputMode="numeric"
            required
            min={Number(from) || 1}
            max={max}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
            dir="ltr"
          />
        </Field>
        <button
          type="button"
          disabled={!surah}
          onClick={() => {
            if (!surah) return;
            setFrom("1");
            setTo(String(surah.ayahs));
          }}
          className={`${btn.ghost} h-9 disabled:opacity-40`}
        >
          السورة كاملة
        </button>
      </div>

      <div>
        <span className="mb-1 block text-xs font-bold text-muted">التقدير</span>
        <div role="radiogroup" aria-label="التقدير" className="grid grid-cols-5 gap-1">
          {GRADES.map((g) => {
            const { label, solid } = GRADE[g];
            const on = grade === g;
            return (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setGrade(g)}
                className={`h-8 rounded-md border px-1 text-xs transition-colors ${
                  on ? `${solid} border-transparent` : "border-line bg-surface hover:bg-canvas"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="ملاحظة (اختياري)">
        <input name="note" maxLength={300} className={inputCls} />
      </Field>

      {state?.error && <ErrorNote>{state.error}</ErrorNote>}

      <div className="flex gap-2">
        <Submit className={btn.primary}>حفظ التسجيل</Submit>
        <button type="button" onClick={onClose} className={btn.ghost}>
          إلغاء
        </button>
      </div>
    </form>
  );
}
