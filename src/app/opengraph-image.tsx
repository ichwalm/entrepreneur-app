import { ImageResponse } from "next/og";

export const alt = "Entrepreneur Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #000000 0%, #111827 45%, #0b1220 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            opacity: 0.95,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#f59e0b",
              color: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            E
          </div>
          <div style={{ fontWeight: 700 }}>Entrepreneur Platform</div>
        </div>

        <div
          style={{
            marginTop: 32,
            display: "flex",
            flexDirection: "column",
            fontSize: 70,
            fontWeight: 800,
            letterSpacing: -1.2,
          }}
        >
          <span>Bangun brand.</span>
          <span>Promosikan produk.</span>
        </div>
        <div style={{ marginTop: 18, fontSize: 28, opacity: 0.8 }}>
          Website profile modern + CMS admin + promosi lengkap
        </div>
      </div>
    ),
    size,
  );
}
