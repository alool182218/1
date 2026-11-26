"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, CalendarCheck, ChartColumn, UserCog, Users, type LucideIcon } from "lucide-react";

const B = "/apps/halaqat";

type Item = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean };

const ITEMS: Item[] = [
  { href: B, label: "الحضور", icon: CalendarCheck },
  { href: `${B}/students`, label: "الطلاب", icon: Users },
  { href: `${B}/groups`, label: "الحلقات", icon: BookMarked },
  { href: `${B}/reports`, label: "التقارير", icon: ChartColumn },
  { href: `${B}/staff`, label: "الكادر", icon: UserCog, adminOnly: true },
];

function useItems(isAdmin: boolean) {
  const pathname = usePathname();
  return ITEMS.filter((i) => isAdmin || !i.adminOnly).map((i) => ({
    ...i,
    active: i.href === B ? pathname === B : pathname.startsWith(i.href),
  }));
}

export function SideNav({ isAdmin }: { isAdmin: boolean }) {
  const items = useItems(isAdmin);
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-sm transition-colors ${
            active ? "bg-primary-soft font-bold text-primary" : "text-muted hover:bg-canvas hover:text-ink"
          }`}
        >
          <Icon size={17} strokeWidth={1.75} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const items = useItems(isAdmin);
  return (
    <nav
      className="grid border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "text-primary" : "text-muted"}`}
        >
          <Icon size={19} strokeWidth={active ? 2 : 1.75} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
