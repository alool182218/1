"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, MonitorDown } from "lucide-react";
import { appPath, getProject, projects, type Project } from "@/lib/projects";

function readHash() {
  const slug = decodeURIComponent(window.location.hash.slice(1));
  return getProject(slug) ? slug : null;
}

export function Hub() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setActive(readHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const select = (slug: string | null) => {
    history.replaceState(null, "", slug ? `#${slug}` : window.location.pathname);
    setActive(slug);
  };

  const project = active ? getProject(active) : undefined;

  return (
    <div className="flex h-full">
      <Sidebar active={active} onSelect={select} />
      <main className="flex min-w-0 flex-1 flex-col">
        {project ? <ProjectView project={project} /> : <Overview onSelect={select} />}
      </main>
    </div>
  );
}

function Sidebar({ active, onSelect }: { active: string | null; onSelect: (slug: string | null) => void }) {
  return (
    <nav
      aria-label="المشاريع"
      className="flex w-16 shrink-0 flex-col items-center gap-2 border-l border-[var(--hub-border)] bg-[var(--hub-surface)] py-3"
    >
      <RailButton label="كل المشاريع" selected={active === null} onClick={() => onSelect(null)}>
        <LayoutGrid size={20} strokeWidth={1.75} />
      </RailButton>

      <div className="my-1 h-px w-8 bg-[var(--hub-border)]" />

      {projects.map((p) => {
        const Icon = p.icon;
        return (
          <RailButton
            key={p.slug}
            label={p.name}
            color={p.color}
            selected={active === p.slug}
            onClick={() => onSelect(p.slug)}
          >
            <Icon size={20} strokeWidth={1.75} />
          </RailButton>
        );
      })}
    </nav>
  );
}

function RailButton({
  label,
  color,
  selected,
  onClick,
  children,
}: {
  label: string;
  color?: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={label}
        aria-current={selected ? "page" : undefined}
        onClick={onClick}
        className={`flex size-10 items-center justify-center rounded-lg transition-colors ${
          selected
            ? "text-white"
            : "text-[var(--hub-muted)] hover:bg-[var(--hub-bg)] hover:text-[var(--hub-text)]"
        }`}
        style={selected ? { background: color ?? "var(--hub-text)" } : undefined}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-full top-1/2 z-10 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[var(--hub-text)] px-2 py-1 text-xs text-[var(--hub-bg)] opacity-0 transition-opacity group-hover:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

function Overview({ onSelect }: { onSelect: (slug: string) => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-base font-semibold">مشاريعي</h1>
      <p className="mt-1 text-[var(--hub-muted)]">اختر مشروعاً من القائمة لعرضه.</p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {projects.map((p) => {
          const Icon = p.icon;
          return (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => onSelect(p.slug)}
                className="flex w-full items-center gap-3 rounded-lg border border-[var(--hub-border)] bg-[var(--hub-surface)] p-3 text-right transition-colors hover:border-[var(--hub-muted)]"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-md text-white"
                  style={{ background: p.color }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-[var(--hub-muted)]">{p.description}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProjectView({ project }: { project: Project }) {
  const Icon = project.icon;
  const href = appPath(project.slug);

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--hub-border)] bg-[var(--hub-surface)] px-4">
        <Icon size={16} strokeWidth={1.75} style={{ color: project.color }} />
        <span className="font-medium">{project.name}</span>
        <span className="truncate text-xs text-[var(--hub-muted)]">{project.description}</span>

        <a
          href={href}
          target="_blank"
          rel="noopener"
          title="يفتح المشروع وحده في نافذة جديدة، ومنها تثبّته كتطبيق مستقل"
          className="mr-auto flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs text-[var(--hub-muted)] transition-colors hover:bg-[var(--hub-bg)] hover:text-[var(--hub-text)]"
        >
          <MonitorDown size={16} strokeWidth={1.75} />
          <span>تثبيت كتطبيق</span>
        </a>
      </header>

      <iframe key={project.slug} src={href} title={project.name} className="w-full flex-1 border-0 bg-white" />
    </>
  );
}
