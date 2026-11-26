import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./tasks.css";

const font = Tajawal({ subsets: ["arabic", "latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "المهام",
  description: "قائمة مهام مربوطة بقاعدة بيانات Supabase",
  manifest: "/pwa/tasks/manifest.webmanifest",
  icons: { icon: "/pwa/tasks/icon/192", apple: "/pwa/tasks/icon/180" },
  appleWebApp: { capable: true, title: "المهام", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#0f766e" };

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${font.className} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
