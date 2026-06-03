"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SnackType = "success" | "error" | "info";

interface SnackState {
  msg: string;
  type: SnackType;
  key: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSnackbar() {
  const [snack, setSnack] = React.useState<SnackState | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function showSnack(msg: string, type: SnackType = "success") {
    if (timer.current) clearTimeout(timer.current);
    setSnack((prev) => ({ msg, type, key: (prev?.key ?? 0) + 1 }));
    timer.current = setTimeout(() => setSnack(null), 3500);
  }

  function dismiss() {
    if (timer.current) clearTimeout(timer.current);
    setSnack(null);
  }

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { showSnack, dismiss, snack };
}

// ─── META ─────────────────────────────────────────────────────────────────────
const META: Record<SnackType, { bg: string; border: string; color: string; icon: React.ReactNode }> = {
  success: {
    bg: "#f0fdf4", border: "#86efac", color: "#166534",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    ),
  },
  error: {
    bg: "#fef2f2", border: "#fca5a5", color: "#991b1b",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4m0 4h.01" />
      </svg>
    ),
  },
  info: {
    bg: "#eff6ff", border: "#93c5fd", color: "#1e40af",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4m0-4h.01" />
      </svg>
    ),
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function Snackbar({
  snack,
  onDismiss,
}: {
  snack: SnackState | null;
  onDismiss: () => void;
}) {
  if (!snack) return null;

  const m = META[snack.type];

  return (
    <>
      <style>{`
        @keyframes snackSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
      <div
        key={snack.key}
        role="alert"
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "13px 18px",
          borderRadius: "12px",
          background: m.bg,
          border: `1.5px solid ${m.border}`,
          color: m.color,
          fontSize: "13.5px",
          fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          maxWidth: "360px",
          animation: "snackSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <span style={{ flexShrink: 0 }}>{m.icon}</span>
        <span style={{ flex: 1, lineHeight: 1.4 }}>{snack.msg}</span>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: m.color,
            opacity: 0.5,
            padding: "2px",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </>
  );
}
