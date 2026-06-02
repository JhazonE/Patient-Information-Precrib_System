import React from "react";

interface LogoProps {
  size?: number;
  variant?: "icon" | "full";
  dark?: boolean;
}

export default function Logo({ size = 36, variant = "full", dark = false }: LogoProps) {
  const radius = Math.round(size * 0.26);

  const icon = (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
      }}
    >
      <svg
        width={Math.round(size * 0.56)}
        height={Math.round(size * 0.56)}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="7.5" y="1" width="5" height="18" rx="2.5" fill="white" />
        <rect x="1" y="7.5" width="18" height="5" rx="2.5" fill="white" />
      </svg>
    </div>
  );

  if (variant === "icon") return icon;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(size * 0.28) }}>
      {icon}
      <div>
        <div
          style={{
            fontWeight: 800,
            fontSize: Math.round(size * 0.44),
            color: dark ? "#ffffff" : "#1e293b",
            letterSpacing: "-0.3px",
            lineHeight: 1,
          }}
        >
          Patient<span style={{ color: dark ? "#93c5fd" : "#3b82f6" }}>Care</span>
        </div>
        <div
          style={{
            fontSize: Math.max(9, Math.round(size * 0.25)),
            color: dark ? "rgba(255,255,255,0.5)" : "#94a3b8",
            fontWeight: 600,
            letterSpacing: "1.8px",
            marginTop: "3px",
            textTransform: "uppercase",
          }}
        >
          Medical System
        </div>
      </div>
    </div>
  );
}
