import type React from "react";
import { slate } from "../theme";

// Logical screen size; content is laid out at roughly 1.1x a real phone.
export const SCREEN_W = 430;
export const SCREEN_H = 900;
const BEZEL = 14;

export const Phone: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      width: SCREEN_W + BEZEL * 2,
      height: SCREEN_H + BEZEL * 2,
      padding: BEZEL,
      borderRadius: 72,
      background: "linear-gradient(145deg, #2b3440, #0b0f14 60%)",
      boxShadow:
        "0 0 0 2px #3a4452 inset, 0 60px 120px rgba(0,0,0,0.55), 0 20px 40px rgba(0,0,0,0.35)",
    }}
  >
    <div
      style={{
        position: "relative",
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: 58,
        overflow: "hidden",
        background: slate[50],
      }}
    >
      {children}
      {/* Dynamic island */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          translate: "-50% 0",
          width: 124,
          height: 36,
          borderRadius: 20,
          background: "#000",
        }}
      />
    </div>
  </div>
);

export const StatusBar: React.FC<{ readonly dark?: boolean }> = ({ dark }) => (
  <div
    style={{
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 38px 0",
      fontSize: 17,
      fontWeight: 600,
      color: dark ? "#fff" : slate[900],
    }}
  >
    <span>9:41</span>
    <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <svg width="18" height="12" viewBox="0 0 18 12">
        <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
        <rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" />
        <rect x="10" y="2" width="3" height="10" rx="1" fill="currentColor" />
        <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
      </svg>
      <svg width="27" height="13" viewBox="0 0 27 13">
        <rect
          x="0.5"
          y="0.5"
          width="23"
          height="12"
          rx="3.5"
          fill="none"
          stroke="currentColor"
          opacity="0.4"
        />
        <rect x="2" y="2" width="18" height="9" rx="2" fill="currentColor" />
        <rect
          x="25"
          y="4"
          width="2"
          height="5"
          rx="1"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
    </span>
  </div>
);
