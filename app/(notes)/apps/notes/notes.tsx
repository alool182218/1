"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Note = { id: string; text: string; at: number };

// Prefixed key: projects share the browser storage of this domain.
const STORAGE_KEY = "notes-app:items";

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setNotes(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
    } catch {
      setNotes([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes, loaded]);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((n) => [{ id: crypto.randomUUID(), text, at: Date.now() }, ...n]);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="اكتب ملاحظة..."
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

      {loaded && notes.length === 0 && <p className="text-sm text-dim">لا توجد ملاحظات.</p>}

      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="group flex items-start gap-3 rounded-md bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-wrap break-words text-sm">{note.text}</p>
              <time className="mt-1 block text-xs text-dim">
                {new Date(note.at).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" })}
              </time>
            </div>
            <button
              type="button"
              aria-label="حذف"
              onClick={() => setNotes((n) => n.filter((x) => x.id !== note.id))}
              className="text-dim hover:text-red-400"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
