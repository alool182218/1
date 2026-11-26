import type { Metadata, Viewport } from "next";
import { Readex_Pro } from "next/font/google";
import "./notes.css";

const font = Readex_Pro({ subsets: ["arabic", "latin"], weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: "الملاحظات",
  description: "ملاحظات سريعة محفوظة على جهازك",
  manifest: "/pwa/notes/manifest.webmanifest",
  icons: { icon: "/pwa/notes/icon/192", apple: "/pwa/notes/icon/180" },
  appleWebApp: { capable: true, title: "الملاحظات", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#1c1917" };

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${font.className} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
