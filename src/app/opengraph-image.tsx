import { ImageResponse } from "next/og";

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
          background: "#fffdf7",
          color: "#111827",
          padding: 72,
          border: "24px solid #111827",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 900 }}>chmi.kr</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontSize: 156, fontWeight: 900, lineHeight: 0.9 }}>
              ㅊ미
            </div>
            <div style={{ fontSize: 48, fontWeight: 800 }}>
              cal 잘못 친 사람을 위한 오타 쉼터
            </div>
          </div>
          <div style={{ fontSize: 34, color: "#047857", fontWeight: 800 }}>
            오늘의 밈, 펭귄, 그리고 목적지 바로가기
          </div>
        </div>
      </div>
    ),
    size,
  );
}
