import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./hub.css";

const font = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "مشاريعي",
  description: "لوحة تجمع كل مشاريعي",
};

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${font.className} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
