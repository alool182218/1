import { BookOpenText, ListChecks, NotebookPen, type LucideIcon } from "lucide-react";

export type Project = {
  /** Path segment: the project lives at /apps/<slug> */
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Brand color of the project (used for its app icon and theme). */
  color: string;
  /** Background color of the installed app's splash screen. */
  background: string;
  /**
   * Optional square image (file name in assets/icons) used as the installed app's
   * icon instead of the generated one. Keep the artwork inside the central 80%
   * so it survives maskable cropping.
   */
  appIcon?: string;
};

/**
 * Every project shown in the hub sidebar.
 * To add a project: create app/(<slug>)/layout.tsx + app/(<slug>)/apps/<slug>/page.tsx
 * and add an entry here.
 */
export const projects: Project[] = [
  {
    slug: "halaqat",
    name: "حلقات القرآن",
    description: "إدارة الطلاب والحلقات والمعلمين وتسجيل الحضور",
    icon: BookOpenText,
    color: "#0f5e63",
    background: "#f3f7f6",
    appIcon: "halaqat.jpg",
  },
  {
    slug: "tasks",
    name: "المهام",
    description: "قائمة مهام محفوظة في قاعدة البيانات",
    icon: ListChecks,
    color: "#0f766e",
    background: "#f0fdfa",
  },
  {
    slug: "notes",
    name: "الملاحظات",
    description: "ملاحظات سريعة محفوظة في قاعدة البيانات",
    icon: NotebookPen,
    color: "#b45309",
    background: "#1c1917",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

// No trailing slash: Next.js redirects "/apps/x/" to "/apps/x", and the
// installed app's scope must contain the URL it actually lands on.
export const appPath = (slug: string) => `/apps/${slug}`;
