import { appPath, getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, ctx: RouteContext<"/pwa/[slug]/manifest.webmanifest">) {
  const { slug } = await ctx.params;
  const project = getProject(slug);
  if (!project) return new Response("Not found", { status: 404 });

  const path = appPath(project.slug);
  const icon = (size: number, purpose: string) => ({
    src: `/pwa/${project.slug}/icon/${size}`,
    sizes: `${size}x${size}`,
    type: "image/png",
    purpose,
  });

  const manifest = {
    id: path,
    name: project.name,
    short_name: project.name,
    description: project.description,
    lang: "ar",
    dir: "rtl",
    start_url: path,
    scope: path,
    display: "standalone",
    theme_color: project.color,
    background_color: project.background,
    icons: [icon(192, "any"), icon(512, "any"), icon(192, "maskable"), icon(512, "maskable")],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
