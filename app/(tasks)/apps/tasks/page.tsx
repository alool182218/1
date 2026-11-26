import { Suspense } from "react";
import { cookies } from "next/headers";
import { CircleAlert, CircleCheck, ListChecks } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { InstallButton } from "@/components/install-button";

async function Todos() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: todos, error } = await supabase.from("todos").select().order("id");

  if (error) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
        <CircleAlert size={16} strokeWidth={1.75} aria-hidden />
        تعذّر جلب البيانات: {error.message}
      </p>
    );
  }

  if (!todos || todos.length === 0) {
    return <p className="text-sm opacity-70">ما فيه مهام بعد.</p>;
  }

  return (
    <ul className="divide-y divide-brand-soft overflow-hidden rounded-xl border border-brand-soft bg-white">
      {todos.map((todo) => (
        <li key={todo.id} className="flex items-center gap-3 px-4 py-3">
          <CircleCheck size={18} strokeWidth={1.75} className="shrink-0 text-brand" aria-hidden />
          <span>{todo.name}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TasksPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-5 py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-white">
          <ListChecks size={18} strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="text-lg font-bold">المهام</h1>
        <InstallButton className="mr-auto flex items-center gap-1.5 rounded-lg border border-brand-soft bg-white px-3 py-1.5 text-sm text-brand hover:bg-brand-soft" />
      </header>

      <Suspense fallback={<p className="text-sm opacity-70">جاري التحميل...</p>}>
        <Todos />
      </Suspense>
    </main>
  );
}
