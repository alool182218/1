import { Suspense } from "react";
import { cookies } from "next/headers";
import { CircleAlert, NotebookPen, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { InstallButton } from "@/components/install-button";
import { addNote, deleteNote } from "./actions";

type Note = { id: number; text: string; created_at: string };

const dateFormat = new Intl.DateTimeFormat("ar", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Riyadh",
});

async function NoteList() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("notes")
    .select("id, text, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-card p-3 text-sm text-red-400">
        <CircleAlert size={16} strokeWidth={1.5} aria-hidden />
        تعذّر جلب الملاحظات: {error.message}
      </p>
    );
  }

  const notes = (data ?? []) as Note[];
  if (notes.length === 0) return <p className="text-sm text-dim">لا توجد ملاحظات.</p>;

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li key={note.id} className="flex items-start gap-3 rounded-md bg-card p-3">
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap break-words text-sm">{note.text}</p>
            <time dateTime={note.created_at} className="mt-1 block text-xs text-dim">
              {dateFormat.format(new Date(note.created_at))}
            </time>
          </div>
          <form action={deleteNote.bind(null, note.id)} className="flex">
            <button type="submit" aria-label="حذف" className="text-dim hover:text-red-400">
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default function NotesPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8">
      <header className="mb-6 flex items-center gap-2.5 border-b border-line pb-4">
        <NotebookPen size={18} strokeWidth={1.5} className="text-amber" aria-hidden />
        <h1 className="font-medium tracking-wide">الملاحظات</h1>
        <InstallButton className="mr-auto flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-dim hover:border-amber hover:text-amber" />
      </header>

      <form action={addNote} className="mb-4 flex gap-2">
        <input
          name="text"
          required
          maxLength={2000}
          placeholder="اكتب ملاحظة..."
          autoComplete="off"
          className="flex-1 rounded-md border border-line bg-card px-3 py-2 text-sm outline-none placeholder:text-dim focus:border-amber"
        />
        <button
          type="submit"
          aria-label="إضافة"
          className="flex size-9 items-center justify-center rounded-md bg-amber text-paper hover:opacity-90"
        >
          <Plus size={18} strokeWidth={2} />
        </button>
      </form>

      <Suspense fallback={<p className="text-sm text-dim">جاري التحميل...</p>}>
        <NoteList />
      </Suspense>
    </main>
  );
}
