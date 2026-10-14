import { Easing, interpolate } from "remotion";
import { clamp, easeOut } from "../theme";

// Small helpers for the dense product-screen scenes, where dozens of elements
// each fade or slide on their own beat. Times are in seconds.
export const fadeIn = (frame: number, fps: number, at: number, dur = 0.3) =>
  interpolate(frame, [at * fps, (at + dur) * fps], [0, 1], clamp);

export const fadeOut = (frame: number, fps: number, at: number, dur = 0.3) =>
  interpolate(frame, [at * fps, (at + dur) * fps], [1, 0], clamp);

export const rise = (frame: number, fps: number, at: number, px = 24, dur = 0.5) =>
  `0px ${interpolate(frame, [at * fps, (at + dur) * fps], [px, 0], { ...clamp, easing: easeOut })}px`;

export const springIn = (frame: number, fps: number, at: number, from = 0.8, dur = 0.5) =>
  interpolate(frame, [at * fps, (at + dur) * fps], [from, 1], {
    ...clamp,
    easing: Easing.spring({ damping: 13 }),
  });

// Visible between two times, with short fades at each end.
export const window_ = (frame: number, fps: number, from: number, to: number, f = 0.25) =>
  interpolate(frame, [from * fps, (from + f) * fps, to * fps, (to + f) * fps], [0, 1, 1, 0], clamp);

export const money = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
