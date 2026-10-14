import type React from "react";
import { slate } from "../theme";

// A desktop browser window holding a recreated screen of the product: window
// chrome with the URL, the app's top bar (logo + nav, the active item darker),
// then whatever the scene renders. Size it from the parent; it fills 100%.
export const Browser: React.FC<{
  readonly url: string;
  readonly logo: React.ReactNode;
  readonly nav?: readonly string[];
  readonly active?: string;
  readonly children: React.ReactNode;
}> = ({ url, logo, nav = [], active, children }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: 26,
      background: slate[50],
      overflow: "hidden",
      boxShadow: "0 50px 120px rgba(0,0,0,0.6)",
      position: "relative",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px", background: slate[200] }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: "#f87171" }} />
      <span style={{ width: 14, height: 14, borderRadius: 7, background: "#fbbf24" }} />
      <span style={{ width: 14, height: 14, borderRadius: 7, background: "#34d399" }} />
      <span
        style={{
          marginLeft: 20,
          flex: 1,
          maxWidth: 560,
          background: "#fff",
          borderRadius: 10,
          padding: "6px 16px",
          fontSize: 17,
          color: slate[500],
        }}
      >
        {url}
      </span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 34px",
        background: "#fff",
        borderBottom: `1.5px solid ${slate[200]}`,
      }}
    >
      {logo}
      <div style={{ display: "flex", gap: 34, fontSize: 19, fontWeight: 600, color: slate[500] }}>
        {nav.map((s) => (
          <span key={s} style={{ color: s === active ? slate[900] : undefined }}>
            {s}
          </span>
        ))}
      </div>
    </div>
    {children}
  </div>
);
