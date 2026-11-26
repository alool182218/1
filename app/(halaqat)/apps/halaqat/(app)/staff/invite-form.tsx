"use client";

import { useActionState, useState } from "react";
import { Check, Copy, UserPlus } from "lucide-react";
import { createInvite } from "./actions";
import { ErrorNote, Field, btn, inputCls } from "../../_components/ui";
import { Submit } from "../../_components/submit";

export function InviteForm() {
  const [state, action] = useActionState(createInvite, undefined);

  return (
    <form action={action} className="space-y-3">
      {state?.error && <ErrorNote>{state.error}</ErrorNote>}
      {state?.ok && <p className="rounded-md bg-present/10 px-3 py-2 text-sm text-present">{state.ok}</p>}

      <Field label="الاسم الكامل">
        <input name="full_name" required minLength={2} maxLength={120} className={inputCls} />
      </Field>
      <Field label="البريد الإلكتروني">
        <input name="email" type="email" required dir="ltr" className={inputCls} />
      </Field>
      <Field label="الصلاحية">
        <select name="role" defaultValue="teacher" className={inputCls}>
          <option value="teacher">معلم</option>
          <option value="admin">مدير</option>
        </select>
      </Field>
      <Submit className={`${btn.primary} w-full`}>
        <UserPlus size={16} strokeWidth={1.75} aria-hidden />
        إنشاء دعوة
      </Submit>
    </form>
  );
}

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="نسخ الرمز"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded bg-gold-soft px-2 py-1 font-mono text-xs tracking-widest text-gold"
    >
      {code}
      {copied ? <Check size={13} strokeWidth={2} aria-label="تم النسخ" /> : <Copy size={13} strokeWidth={1.75} aria-hidden />}
    </button>
  );
}
