"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import type { FormState, Student } from "../../_lib/types";
import { ErrorNote, Field, btn, inputCls } from "../../_components/ui";
import { Submit } from "../../_components/submit";

type Option = { id: number; name: string };

export function StudentForm({
  action,
  halaqat,
  student,
  defaultHalaqa,
  allowNoHalaqa,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  halaqat: Option[];
  student?: Student;
  defaultHalaqa?: number;
  allowNoHalaqa: boolean;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <ErrorNote>{state.error}</ErrorNote>}
      {state?.ok && <p className="rounded-md bg-present/10 px-3 py-2 text-sm text-present">{state.ok}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم الطالب الكامل">
          <input name="full_name" required minLength={2} maxLength={120} defaultValue={student?.full_name} className={inputCls} />
        </Field>

        <Field label="الحلقة">
          <select
            name="halaqa_id"
            required={!allowNoHalaqa}
            defaultValue={student ? (student.halaqa_id ?? "") : (defaultHalaqa ?? "")}
            className={inputCls}
          >
            <option value="">{allowNoHalaqa ? "بدون حلقة" : "اختر الحلقة"}</option>
            {halaqat.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="اسم ولي الأمر">
          <input name="guardian_name" maxLength={120} defaultValue={student?.guardian_name ?? ""} className={inputCls} />
        </Field>

        <Field label="جوال ولي الأمر">
          <input
            name="guardian_phone"
            type="tel"
            dir="ltr"
            maxLength={30}
            defaultValue={student?.guardian_phone ?? ""}
            className={`${inputCls} text-right`}
          />
        </Field>

        <Field label="تاريخ الميلاد">
          <input name="birth_date" type="date" defaultValue={student?.birth_date ?? ""} className={inputCls} />
        </Field>

        <Field label="تاريخ الالتحاق">
          <input name="joined_on" type="date" defaultValue={student?.joined_on ?? ""} className={inputCls} />
        </Field>
      </div>

      <Field label="ملاحظات">
        <textarea
          name="notes"
          rows={3}
          maxLength={1000}
          defaultValue={student?.notes ?? ""}
          className={`${inputCls} h-auto py-2`}
        />
      </Field>

      {student && (
        <label className="flex items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked={student.active} className="size-4 accent-primary" />
          الطالب منتظم (غير المنتظم لا يظهر في كشف الحضور)
        </label>
      )}

      <Submit className={btn.primary}>
        <Save size={16} strokeWidth={1.75} aria-hidden />
        {student ? "حفظ التعديلات" : "تسجيل الطالب"}
      </Submit>
    </form>
  );
}
