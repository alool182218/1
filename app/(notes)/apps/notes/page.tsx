import { NotebookPen } from "lucide-react";
import { InstallButton } from "@/components/install-button";
import { Notes } from "./notes";

export default function NotesPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8">
      <header className="mb-6 flex items-center gap-2.5 border-b border-line pb-4">
        <NotebookPen size={18} strokeWidth={1.5} className="text-amber" aria-hidden />
        <h1 className="font-medium tracking-wide">الملاحظات</h1>
        <InstallButton className="mr-auto flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-dim hover:border-amber hover:text-amber" />
      </header>
      <Notes />
    </main>
  );
}
