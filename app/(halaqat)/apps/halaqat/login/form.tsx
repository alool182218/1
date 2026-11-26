"use client";

import { useActionState, useState } from "react";
import { KeyRound, LogIn } from "lucide-react";
import { activate, signIn } from "./actions";
import { ErrorNote, Field, btn, inputCls } from "../_components/ui";
import { Submit } from "../_components/submit";

export function LoginForm({ notice }: { notice?: string }) {
  const [mode, setMode] = useState<"signin" | "activate">("signin");
  const [signInState, signInAction] = useActionState(signIn, undefined);
  const [activateState, activateAction] = useActionState(activate, undefined);

  const isSignIn = mode === "signin";
  const error = isSignIn ? signInState?.error : activateState?.error;

  return (
    <div className="space-y-4">
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-md bg-canvas p-1 text-sm">
        {(
          [
            ["signin", "تسجيل الدخول"],
            ["activate", "تفعيل حساب جديد"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mode === key}
            onClick={() => setMode(key)}
            className={`h-8 rounded transition-colors ${
              mode === key ? "bg-surface font-bold shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {notice && !error && <ErrorNote>{notice}</ErrorNote>}
      {error && <ErrorNote>{error}</ErrorNote>}

      <form key={mode} action={isSignIn ? signInAction : activateAction} className="space-y-3">
        <Field label="البريد الإلكتروني">
          <input name="email" type="email" required autoComplete="email" dir="ltr" className={inputCls} />
        </Field>

        {!isSignIn && (
          <Field label="رمز الدعوة" hint="تحصل عليه من إدارة الحلقات.">
            <input
              name="code"
              required
              autoComplete="off"
              dir="ltr"
              className={`${inputCls} font-mono uppercase tracking-widest`}
            />
          </Field>
        )}

        {!isSignIn && (
          <Field label="الاسم الكامل" hint="يُستخدم لحساب المدير الأول فقط، وبقية الحسابات تأخذ الاسم من الدعوة.">
            <input name="full_name" autoComplete="name" className={inputCls} />
          </Field>
        )}

        <Field label={isSignIn ? "كلمة المرور" : "كلمة مرور جديدة"}>
          <input
            name="password"
            type="password"
            required
            minLength={isSignIn ? undefined : 8}
            autoComplete={isSignIn ? "current-password" : "new-password"}
            dir="ltr"
            className={inputCls}
          />
        </Field>

        <Submit className={`${btn.primary} w-full`}>
          {isSignIn ? (
            <LogIn size={16} strokeWidth={1.75} aria-hidden />
          ) : (
            <KeyRound size={16} strokeWidth={1.75} aria-hidden />
          )}
          {isSignIn ? "دخول" : "تفعيل الحساب"}
        </Submit>
      </form>
    </div>
  );
}
