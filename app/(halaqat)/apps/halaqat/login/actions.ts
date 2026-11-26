"use server";

import { redirect } from "next/navigation";
import { BASE, createClient } from "../_lib/supabase";
import type { FormState } from "../_lib/types";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function signIn(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "أدخل البريد الإلكتروني وكلمة المرور." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };

  redirect(BASE);
}

export async function activate(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const code = str(fd, "code").toUpperCase();
  const fullName = str(fd, "full_name");

  if (!email || !code) return { error: "أدخل البريد الإلكتروني ورمز الدعوة." };
  if (password.length < 8) return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { app: "halaqat", invite_code: code, full_name: fullName } },
  });

  if (error) {
    if (/already registered|already exists/i.test(error.message)) {
      return { error: "هذا البريد مسجل مسبقاً. استخدم تسجيل الدخول." };
    }
    if (/password/i.test(error.message)) {
      return { error: "كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل." };
    }
    return { error: "رمز الدعوة لا يطابق هذا البريد، أو سبق استخدامه." };
  }
  if (!data.session) return { error: "تعذّر تفعيل الحساب. حاول مرة أخرى." };

  redirect(BASE);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`${BASE}/login`);
}
