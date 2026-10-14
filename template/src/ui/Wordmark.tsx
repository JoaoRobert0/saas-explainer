import type React from "react";
import { brand } from "../theme";

// The product's name as live text, optionally with its logo file next to it.
// Prefer the real logo: trace or copy the product's SVG into public/ and pass
// it as `logoSrc` (staticFile path) — a raster logo blurs when scaled up.
export const Wordmark: React.FC<{
  readonly name: string;
  readonly height: number;
  readonly onDark?: boolean;
  readonly logoSrc?: string;
}> = ({ name, height, onDark, logoSrc }) => (
  <div style={{ display: "flex", alignItems: "center", gap: height * 0.28 }}>
    {logoSrc ? <img src={logoSrc} style={{ height, width: "auto" }} /> : null}
    <span
      style={{
        fontSize: height * 0.72,
        fontWeight: 800,
        letterSpacing: "-0.025em",
        color: onDark ? "#fff" : brand.bg,
      }}
    >
      {name}
    </span>
  </div>
);
