import { Suspense } from "react";
import { cookies } from "next/headers";
import { Circle, CircleAlert, CircleCheck, ListChecks, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { InstallButton } from "@/components/install-button";
import { addTask, deleteTask, toggleTask } from "./actions";

type Todo = { id: number; name: string; done: boolean };

async function Todos() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.from("todos").select("id, name, done").order("id");

  if (error) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
        <CircleAlert size={16} strokeWidth={1.75} aria-hidden />
        تعذّر جلب البيانات: {error.message}
      </p>
    );
  }

  const todos = (data ?? []) as Todo[];
  if (todos.length === 0) return <p className="text-sm opacity-70">ما فيه مهام بعد.</p>;

  return (
    <ul className="divide-y divide-brand-soft overflow-hidden rounded-xl border border-brand-soft bg-white">
      {todos.map((todo) => (
        <li key={todo.id} className="flex items-center gap-3 px-4 py-2.5">
          <form action={toggleTask.bind(null, todo.id, !todo.done)} className="flex">
            <button
              type="submit"
              aria-label={todo.done ? "إلغاء الإنجاز" : "تم الإنجاز"}
              className="text-brand hover:opacity-70"
            >
              {todo.done ? (
                <CircleCheck size={18} strokeWidth={1.75} />
              ) : (
                <Circle size={18} strokeWidth={1.75} />
              )}
            </button>
          </form>
          <span className={`flex-1 ${todo.done ? "line-through opacity-50" : ""}`}>{todo.name}</span>
          <form action={deleteTask.bind(null, todo.id)} className="flex">
            <button type="submit" aria-label="حذف" className="text-ink/40 hover:text-red-600">
              <Trash2 size={16} strokeWidth={1.75} />
            </button>
          </form>
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

      <form action={addTask} className="mb-4 flex gap-2">
        <input
          name="name"
          required
          maxLength={300}
          placeholder="مهمة جديدة..."
          autoComplete="off"
          className="flex-1 rounded-lg border border-brand-soft bg-white px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          aria-label="إضافة"
          className="flex size-9 items-center justify-center rounded-lg bg-brand text-white hover:opacity-90"
        >
          <Plus size={18} strokeWidth={2} />
        </button>
      </form>

      <Suspense fallback={<p className="text-sm opacity-70">جاري التحميل...</p>}>
        <Todos />
      </Suspense>
    </main>
  );
}
