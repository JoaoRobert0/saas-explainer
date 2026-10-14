import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOut } from "../theme";

// A centered headline across the top of a product scene, shown between two
// times. Several can share the spot and hand over to each other. In a
// vertical frame it sits lower, larger, and wraps.
export const TopHeadline: React.FC<{
  readonly from: number;
  readonly to?: number;
  readonly children: React.ReactNode;
}> = ({ from, to = 999, children }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  return (
    <div
      style={{
        position: "absolute",
        left: vertical ? 70 : 0,
        right: vertical ? 70 : 0,
        top: vertical ? 170 : 70,
        zIndex: 60,
        textAlign: "center",
        fontSize: vertical ? 96 : 84,
        lineHeight: vertical ? 1.05 : undefined,
        fontWeight: 800,
        letterSpacing: "-0.035em",
        color: "#fff",
        opacity: interpolate(frame, [from * fps, (from + 0.4) * fps, to * fps, (to + 0.3) * fps], [0, 1, 1, 0], clamp),
        translate: interpolate(frame, [from * fps, (from + 0.7) * fps], ["0px 30px", "0px 0px"], {
          ...clamp,
          easing: easeOut,
        }),
      }}
    >
      {children}
    </div>
  );
};
