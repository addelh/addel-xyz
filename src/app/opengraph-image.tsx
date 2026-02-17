import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const SOUR_GUMMY_WOFF2 =
  "https://fonts.gstatic.com/s/sourgummy/v3/8AtGGs2gPYuNDii97MjjBrLbYfdJvDU5AZfP5opPVCC4oC5ANR1NwcNk8FqNLW5MoLma.woff2";

const PATRICK_HAND_WOFF2 =
  "https://fonts.gstatic.com/s/patrickhand/v25/LDI1apSQOAYtSuYWp8ZhfYe8XsLLubg58w.woff2";

export default async function Image() {
  const [displayFont, handFont] = await Promise.all([
    fetch(SOUR_GUMMY_WOFF2).then((res) => res.arrayBuffer()),
    fetch(PATRICK_HAND_WOFF2).then((res) => res.arrayBuffer()),
  ]);

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
              fontFamily: '"Sour Gummy"',
              fontSize: 120,
              fontWeight: 500,
              letterSpacing: -2,
              color: "#111",
              lineHeight: 1,
            }}
          >
            Hi, I&apos;m Addel.
          </div>
          <div
            style={{
              fontFamily: '"Patrick Hand"',
              fontSize: 44,
              fontWeight: 400,
              color: "rgba(17,17,17,0.72)",
              lineHeight: 1.25,
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
      fonts: [
        {
          name: "Sour Gummy",
          data: displayFont,
          weight: 500,
          style: "normal",
        },
        {
          name: "Patrick Hand",
          data: handFont,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
