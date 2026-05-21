import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

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
          gap: 48,
          background: "#ffffff",
          color: "#111827",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 520,
            height: "100%",
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 900, color: "#047857" }}>
            {siteConfig.domain}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 56 }}>
            <div style={{ fontSize: 132, fontWeight: 900, lineHeight: 0.88, color: "#059669" }}>
              ㅊ미
            </div>
            <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1.05 }}>
              또 눌렀죠?
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#52525b" }}>
              힐링 하고 가요.
            </div>
          </div>
          <div style={{ marginTop: 58, fontSize: 32, color: "#047857", fontWeight: 900 }}>
            복이 올거에요
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 500,
            height: 500,
            overflow: "hidden",
            borderRadius: 28,
            border: "4px solid #111827",
            boxShadow: "0 28px 80px rgba(15, 23, 42, 0.18)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/52/Cat_Meme.jpg"
            alt="귀여운 고양이 사진"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
