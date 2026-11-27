import { ImageResponse } from "next/og";

/**
 * The app icon: the signature pink card with a dark border and offset
 * shadow, holding an "M". Drawn with plain shapes so it needs no font.
 * `padding` shrinks the art so maskable icons survive circular crops.
 */
export function appIcon(size: number, padding = 0) {
  const inner = size * (1 - padding * 2);
  const border = Math.max(2, Math.round(inner * 0.04));
  const shadow = Math.round(inner * 0.06);
  const card = inner - shadow;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#f6f0f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", width: inner, height: inner, display: "flex" }}>
          <div
            style={{
              position: "absolute",
              left: shadow,
              top: shadow,
              width: card,
              height: card,
              background: "#2d2d2b",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: card,
              height: card,
              background: "#c39e9e",
              border: `${border}px solid #2d2d2b`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={card * 0.56} height={card * 0.44} viewBox="0 0 56 44">
              <path
                d="M5 42 V4 L28 30 L51 4 V42"
                fill="none"
                stroke="#2d2d2b"
                strokeWidth="7"
                strokeLinejoin="miter"
              />
            </svg>
          </div>
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
