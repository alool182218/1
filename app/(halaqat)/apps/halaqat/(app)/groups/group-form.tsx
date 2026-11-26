"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import type { FormState, Halaqa } from "../../_lib/types";
import { ErrorNote, Field, btn, inputCls } from "../../_components/ui";
import { Submit } from "../../_components/submit";

type Teacher = { id: string; full_name: string };

export function GroupForm({
  action,
  teachers,
  group,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  teachers: Teacher[];
  group?: Halaqa;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <ErrorNote>{state.error}</ErrorNote>}
      {state?.ok && <p className="rounded-md bg-present/10 px-3 py-2 text-sm text-present">{state.ok}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم الحلقة">
          <input name="name" required minLength={2} maxLength={80} defaultValue={group?.name} className={inputCls} />
        </Field>

        <Field label="المعلم">
          <select name="teacher_id" defaultValue={group?.teacher_id ?? ""} className={inputCls}>
            <option value="">بدون معلم</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="موعد الحلقة" hint="مثال: بعد العصر، من الأحد إلى الخميس">
          <input name="schedule" maxLength={120} defaultValue={group?.schedule ?? ""} className={inputCls} />
        </Field>

        <Field label="المكان">
          <input name="location" maxLength={120} defaultValue={group?.location ?? ""} className={inputCls} />
        </Field>
      </div>

      {group && (
        <label className="flex items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked={group.active} className="size-4 accent-primary" />
          الحلقة قائمة (الموقوفة لا تظهر في الحضور)
        </label>
      )}

      <Submit className={btn.primary}>
        <Save size={16} strokeWidth={1.75} aria-hidden />
        {group ? "حفظ التعديلات" : "إنشاء الحلقة"}
      </Submit>
    </form>
  );
}
