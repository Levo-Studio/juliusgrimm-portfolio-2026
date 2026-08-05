import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/server/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Project case study — Julius Grimm";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const accent = "#5BE38B";

export default async function OpengraphImage({ params }: Props): Promise<ImageResponse> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // Use the project's own screenshot as the badge when one is uploaded.
  if (project?.imageUrl) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.imageUrl} width={size.width} height={size.height} style={{ objectFit: "cover" }} alt="" />
        </div>
      ),
      { ...size }
    );
  }

  // Otherwise render a branded title card so the link still shows a project-specific badge.
  const title = project?.title ?? "Julius Grimm";
  const subtitle = project?.subtitle ?? "Engineer by Design";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "80px",
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ display: "flex", width: "20px", height: "20px", backgroundColor: accent }} />
          <div style={{ fontSize: "26px", letterSpacing: "6px", color: accent }}>CASE STUDY</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "78px", lineHeight: 1.05, fontWeight: 600 }}>{title}</div>
          <div style={{ display: "flex", fontSize: "42px", lineHeight: 1.1, color: accent, marginTop: "20px" }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.7)" }}>juliusgrimm.dev</div>
      </div>
    ),
    { ...size }
  );
}
