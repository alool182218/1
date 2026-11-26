import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { icons, type IconNode } from "lucide";
import { getProject, projects } from "@/lib/projects";

const SIZES = [180, 192, 512];
// "512" is the regular icon; "m512" the maskable one, which launchers may crop
// to a circle, so its artwork must stay inside the central 80%.
const PARAMS = [...SIZES.map(String), "m192", "m512"];

// How much custom artwork is enlarged (its edges are cropped away).
const ZOOM = { any: 1.4, maskable: 1.15 };

export function generateStaticParams() {
  return projects.flatMap((p) => PARAMS.map((s) => ({ slug: p.slug, size: s })));
}

export async function GET(_req: Request, ctx: RouteContext<"/pwa/[slug]/icon/[size]">) {
  const { slug, size: sizeParam } = await ctx.params;
  const project = getProject(slug);
  if (!project || !PARAMS.includes(sizeParam)) return new Response("Not found", { status: 404 });
  const maskable = sizeParam.startsWith("m");
  const size = Number(maskable ? sizeParam.slice(1) : sizeParam);

  // A project with its own artwork: enlarge it around its center and crop.
  if (project.appIcon) {
    const bytes = await readFile(join(process.cwd(), "assets", "icons", project.appIcon));
    const type = project.appIcon.endsWith(".png") ? "image/png" : "image/jpeg";
    const src = `data:${type};base64,${bytes.toString("base64")}`;
    const scaled = Math.round(size * (maskable ? ZOOM.maskable : ZOOM.any));
    const offset = -Math.round((scaled - size) / 2);
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={src} width={scaled} height={scaled} style={{ position: "absolute", left: offset, top: offset }} />
        </div>
      ),
      { width: size, height: size }
    );
  }

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
