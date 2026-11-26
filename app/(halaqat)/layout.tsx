import type { Metadata, Viewport } from "next";
import { Almarai } from "next/font/google";
import "./halaqat.css";

const font = Almarai({ subsets: ["arabic", "latin"], weight: ["300", "400", "700"] });

export const metadata: Metadata = {
  title: { default: "حلقات القرآن", template: "%s | حلقات القرآن" },
  description: "إدارة حلقات تحفيظ القرآن: الطلاب والمعلمون والحضور",
  manifest: "/pwa/halaqat/manifest.webmanifest",
  icons: { icon: "/pwa/halaqat/icon/192", apple: "/pwa/halaqat/icon/180" },
  appleWebApp: { capable: true, title: "حلقات القرآن", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#14532d" };

export default function HalaqatLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${font.className} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
