import { Suspense } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

async function Todos() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from("todos").select();

  if (error) {
    return (
      <p className="rounded bg-red-50 p-4 text-red-700">
        تعذّر جلب البيانات: {error.message}
      </p>
    );
  }

  if (!todos || todos.length === 0) {
    return <p className="text-zinc-500">ما فيه مهام بعد.</p>;
  }

  return (
    <ul className="list-disc space-y-2 pr-6">
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <main dir="rtl" className="mx-auto w-full max-w-xl p-8 font-sans">
      <h1 className="mb-6 text-2xl font-bold">قائمة المهام</h1>
      <Suspense fallback={<p className="text-zinc-500">جاري التحميل...</p>}>
        <Todos />
      </Suspense>
    </main>
  );
}
