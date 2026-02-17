import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "#f6f2ea",
          padding: 96,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: -2,
              color: "#111",
              lineHeight: 1,
            }}
          >
            Hi, I&apos;m Addel.
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 500,
              color: "rgba(17,17,17,0.72)",
              lineHeight: 1.3,
              maxWidth: 860,
            }}
          >
            vibe coder · AI tinkerer · tech enthusiast
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
