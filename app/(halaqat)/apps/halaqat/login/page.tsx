import { Suspense } from "react";
import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import { InstallButton } from "@/components/install-button";
import { LoginForm } from "./form";
import { btn } from "../_components/ui";

export const metadata: Metadata = { title: "تسجيل الدخول" };

const NOTICES: Record<string, string> = {
  inactive: "حسابك غير مفعّل. تواصل مع إدارة الحلقات.",
};

async function Form({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return <LoginForm notice={e ? NOTICES[e] : undefined} />;
}

export default function LoginPage({ searchParams }: PageProps<"/apps/halaqat/login">) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-white">
            <BookOpenText size={24} strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <h1 className="text-lg font-bold">حلقات القرآن</h1>
            <p className="text-sm text-muted">إدارة الطلاب والحلقات والحضور</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5">
          <Suspense>
            <Form searchParams={searchParams as Promise<{ e?: string }>} />
          </Suspense>
        </div>

        <div className="mt-4 flex justify-center">
          <InstallButton className={btn.ghost} />
        </div>
      </div>
    </main>
  );
}
