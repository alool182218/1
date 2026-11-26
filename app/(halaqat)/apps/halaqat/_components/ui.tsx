import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";

export const btn = {
  primary:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 text-sm text-white transition-colors hover:bg-primary-hover disabled:opacity-60",
  secondary:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3.5 text-sm transition-colors hover:bg-canvas disabled:opacity-60",
  ghost:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm text-muted transition-colors hover:bg-canvas hover:text-ink",
  danger:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-absent/30 bg-surface px-3.5 text-sm text-absent transition-colors hover:bg-absent/5",
};

export const inputCls =
  "h-9 w-full rounded-md border border-line bg-surface px-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-primary";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-lg font-bold">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-lg border border-line bg-surface ${className}`}>{children}</div>;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Empty({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon size={28} strokeWidth={1.5} className="text-muted/60" aria-hidden />
      <p className="font-bold">{title}</p>
      {children && <div className="text-sm text-muted">{children}</div>}
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-md bg-absent/10 px-3 py-2 text-sm text-absent">
      <CircleAlert size={16} strokeWidth={1.75} className="shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function Badge({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${className}`}>{children}</span>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      {children}
    </Link>
  );
}

export function Loading() {
  return (
    <div className="space-y-2" aria-busy>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-line/50" />
      ))}
    </div>
  );
}
