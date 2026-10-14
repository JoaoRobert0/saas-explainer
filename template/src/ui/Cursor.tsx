import type React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../theme";

// A mouse pointer that glides between waypoints and pulses a ring on click.
// `path` is [seconds, x, y] in the parent's coordinates.
export const Cursor: React.FC<{
  readonly path: readonly (readonly [number, number, number])[];
  readonly clicks?: readonly number[];
  readonly from?: number;
  readonly to?: number;
}> = ({ path, clicks = [], from = path[0][0], to = 999 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const times = path.map((p) => p[0] * fps);
  const opts = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const x = path.length > 1 ? interpolate(frame, times, path.map((p) => p[1]), opts) : path[0][1];
  const y = path.length > 1 ? interpolate(frame, times, path.map((p) => p[2]), opts) : path[0][2];
  const opacity = interpolate(
    frame,
    [(from - 0.2) * fps, from * fps, to * fps, (to + 0.2) * fps],
    [0, 1, 1, 0],
    clamp,
  );
  const pressed = clicks.some((c) => frame >= c * fps && frame < (c + 0.12) * fps);

  return (
    <div style={{ position: "absolute", left: x, top: y, opacity, zIndex: 50, pointerEvents: "none" }}>
      {clicks.map((c) => (
        <div
          key={c}
          style={{
            position: "absolute",
            left: -26,
            top: -26,
            width: 52,
            height: 52,
            borderRadius: 26,
            border: "3px solid rgba(235,155,3,0.9)",
            opacity: interpolate(frame, [c * fps, (c + 0.4) * fps], [1, 0], clamp),
            scale: interpolate(frame, [c * fps, (c + 0.4) * fps], [0.3, 1.3], clamp),
            display: frame >= c * fps && frame < (c + 0.45) * fps ? "block" : "none",
          }}
        />
      ))}
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        style={{ scale: pressed ? "0.88" : "1", transformOrigin: "0 0", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" }}
      >
        <path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="#fff" stroke="#041727" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
