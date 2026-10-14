import { loadFont } from "@remotion/google-fonts/Inter";
import { Easing } from "remotion";

// Brand tokens. REPLACE these with the product's real palette before building
// any scene: read them from the product's CSS/Tailwind config or ask the user.
// Neutral placeholders are here only so the template compiles.
export const brand = {
  // Dark background of the video (scenes sit on this).
  bg: "#0b1220",
  // Accent: highlights, kicker text, progress bars, call-to-action button.
  accent: "#f59e0b",
  // A lighter tint of the accent, for flashes behind auto-filled fields.
  accentSoft: "#fef3c7",
  // Text on top of the accent color (pick whichever passes contrast).
  onAccent: "#0b1220",
  // Muted text on the dark background (supporting lines).
  mutedOnBg: "#cbd5e1",
  // The product's primary button color inside its UI.
  primary: "#2563eb",
} as const;

// Neutral greys for the recreated product UI (Tailwind slate).
export const slate = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  700: "#334155",
  900: "#0f172a",
} as const;

export const green = { 50: "#f0fdf4", 100: "#dcfce7", 600: "#16a34a" } as const;
export const red = { 100: "#fee2e2", 600: "#dc2626" } as const;

// Swap for the product's font if it uses a Google Font; Inter is a safe
// stand-in for system-font UIs.
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
