import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { InstallButton } from "@/components/install-button";
import { getStaff } from "../_lib/auth";
import { signOut } from "../login/actions";
import { btn } from "../_components/ui";
import { BottomNav, SideNav } from "./nav";

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/pwa/halaqat/icon/192" alt="" width={32} height={32} className="size-8 rounded-lg" />
      <span className="font-bold">حلقات القرآن</span>
    </div>
  );
}

async function UserCard() {
  const { profile, isAdmin } = await getStaff();
  return (
    <div className="flex items-center gap-2 border-t border-line pt-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{profile.full_name}</p>
        <p className="text-xs text-muted">{isAdmin ? "مدير" : "معلم"}</p>
      </div>
      <form action={signOut}>
        <button type="submit" aria-label="تسجيل الخروج" title="تسجيل الخروج" className={btn.ghost}>
          <LogOut size={16} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}

async function Side() {
  const { isAdmin } = await getStaff();
  return <SideNav isAdmin={isAdmin} />;
}

async function Bottom() {
  const { isAdmin } = await getStaff();
  return <BottomNav isAdmin={isAdmin} />;
}

async function MobileSignOut() {
  await getStaff();
  return (
    <form action={signOut}>
      <button type="submit" aria-label="تسجيل الخروج" className={btn.ghost}>
        <LogOut size={16} strokeWidth={1.75} />
      </button>
    </form>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="no-print sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-5 border-l border-line bg-surface p-4 md:flex">
        <Brand />
        <Suspense>
          <Side />
        </Suspense>
        <div className="mt-auto space-y-3">
          <InstallButton className={`${btn.secondary} w-full`} />
          <Suspense>
            <UserCard />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="no-print sticky top-0 z-10 flex h-12 items-center justify-between border-b border-line bg-surface px-4 md:hidden">
          <Brand />
          <div className="flex items-center gap-1">
            <InstallButton className={btn.ghost} label="تثبيت" />
            <Suspense>
              <MobileSignOut />
            </Suspense>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>

        {/* Mobile bottom navigation */}
        <div className="no-print sticky bottom-0 md:hidden">
          <Suspense>
            <Bottom />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
