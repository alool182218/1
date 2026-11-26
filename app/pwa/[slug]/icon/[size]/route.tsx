import { ImageResponse } from "next/og";
import { icons, type IconNode } from "lucide";
import { getProject, projects } from "@/lib/projects";

const SIZES = [180, 192, 512];

export function generateStaticParams() {
  return projects.flatMap((p) => SIZES.map((s) => ({ slug: p.slug, size: String(s) })));
}

export async function GET(_req: Request, ctx: RouteContext<"/pwa/[slug]/icon/[size]">) {
  const { slug, size: sizeParam } = await ctx.params;
  const project = getProject(slug);
  const size = Number(sizeParam);
  if (!project || !SIZES.includes(size)) return new Response("Not found", { status: 404 });

  // The project's lucide-react icon, drawn from its vanilla lucide path data
  // (React icon components cannot render inside ImageResponse).
  const node: IconNode = icons[project.icon.displayName as keyof typeof icons] ?? icons.Box;
  const glyph = Math.round(size * 0.46);

  // Full-bleed background so the icon works as both "any" and "maskable".
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: project.color,
        }}
      >
        <svg
          width={glyph}
          height={glyph}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {node.map(([Tag, attrs], i) => (
            <Tag key={i} {...attrs} />
          ))}
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
