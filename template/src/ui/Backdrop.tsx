import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { brand, clamp } from "../theme";

// The shared stage: dark brand background, a soft accent glow, and a slowly
// drifting dot grid. Every scene starts with it so cuts feel like one space.
// `glow` is the CSS position of the glow, e.g. "70% 50%" behind a phone.
export const Backdrop: React.FC<{ readonly glow?: string }> = ({ glow = "50% 50%" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(900px 700px at ${glow}, ${brand.accent}29, transparent 70%), ${brand.bg}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -40,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)",
          backgroundSize: "36px 36px",
          translate: interpolate(frame, [0, 12 * fps], ["0px 0px", "-36px -18px"], clamp),
        }}
      />
    </>
  );
};
