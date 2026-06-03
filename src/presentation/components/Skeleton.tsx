"use client";

import React from "react";

// ─── Base Skeleton ─────────────────────────────────────────────────────────────
export function Skeleton({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  style,
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .sk {
          background: linear-gradient(90deg, #f1f5f9 25%, #e8edf4 50%, #f1f5f9 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s ease-in-out infinite;
          flex-shrink: 0;
        }
      `}</style>
      <div
        className="sk"
        style={{ width, height, borderRadius, ...style }}
      />
    </>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.75s linear infinite; display: flex; flex-shrink: 0; }
      `}</style>
      <svg
        className="spinner"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </>
  );
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div style={{
      background: "var(--card-bg)", borderRadius: "16px", padding: "24px",
      boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <Skeleton width="80px" height="12px" />
        <Skeleton width="38px" height="38px" borderRadius="10px" />
      </div>
      <Skeleton width="64px" height="32px" borderRadius="8px" style={{ marginBottom: "10px" }} />
      <Skeleton width="120px" height="12px" />
    </div>
  );
}

// ─── Table Row Skeleton ────────────────────────────────────────────────────────
export function TableRowSkeleton({ cols }: { cols: number[] }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: cols.map((c) => `${c}fr`).join(" "),
      padding: "16px 24px",
      alignItems: "center",
      gap: "8px",
      borderBottom: "1px solid #f1f5f9",
    }}>
      {cols.map((_, i) => (
        <Skeleton
          key={i}
          width={`${55 + (i % 3) * 20}%`}
          height="14px"
          borderRadius="6px"
        />
      ))}
    </div>
  );
}

// ─── Card Row Skeleton (for appointment-card-style lists) ─────────────────────
export function CardRowSkeleton() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 18px", borderRadius: "12px",
      background: "var(--card-bg)", border: "1px solid #e8edf4",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <Skeleton width="58px" height="36px" borderRadius="8px" />
        <Skeleton width="36px" height="36px" borderRadius="50%" />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton width="120px" height="13px" />
          <Skeleton width="80px" height="11px" />
        </div>
      </div>
      <Skeleton width="70px" height="22px" borderRadius="99px" />
    </div>
  );
}

// ─── Patient Table Row Skeleton ───────────────────────────────────────────────
export function PatientRowSkeleton() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "2fr 1.2fr 1.4fr 1fr 1fr 0.6fr",
      padding: "16px 24px",
      alignItems: "center",
      borderBottom: "1px solid #f1f5f9",
      gap: "8px",
    }}>
      {/* Name + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Skeleton width="36px" height="36px" borderRadius="50%" />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton width="120px" height="13px" />
          <Skeleton width="80px" height="11px" />
        </div>
      </div>
      <Skeleton width="55px" height="13px" />
      <Skeleton width="90px" height="13px" />
      <Skeleton width="60px" height="13px" />
      <Skeleton width="70px" height="22px" borderRadius="99px" />
      <Skeleton width="36px" height="28px" borderRadius="7px" style={{ marginLeft: "auto" }} />
    </div>
  );
}

// ─── Prescription Row Skeleton ─────────────────────────────────────────────────
export function PrescriptionRowSkeleton() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr 0.6fr",
      padding: "16px 24px",
      alignItems: "center",
      borderBottom: "1px solid #f1f5f9",
      gap: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Skeleton width="32px" height="32px" borderRadius="50%" />
        <Skeleton width="110px" height="13px" />
      </div>
      <Skeleton width="80px" height="13px" />
      <Skeleton width="130px" height="13px" />
      <Skeleton width="80px" height="13px" />
      <Skeleton width="36px" height="28px" borderRadius="7px" style={{ marginLeft: "auto" }} />
    </div>
  );
}

// ─── Appointment Table Row Skeleton ───────────────────────────────────────────
export function AppointmentRowSkeleton() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "160px 1fr 1fr 130px 1fr 160px",
      padding: "16px 24px",
      alignItems: "center",
      borderBottom: "1px solid #f1f5f9",
      gap: "8px",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <Skeleton width="90px" height="13px" />
        <Skeleton width="70px" height="11px" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Skeleton width="34px" height="34px" borderRadius="50%" />
        <Skeleton width="100px" height="13px" />
      </div>
      <Skeleton width="80px" height="24px" borderRadius="6px" />
      <Skeleton width="80px" height="22px" borderRadius="99px" />
      <Skeleton width="90px" height="13px" />
      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
        <Skeleton width="68px" height="28px" borderRadius="7px" />
        <Skeleton width="60px" height="28px" borderRadius="7px" />
      </div>
    </div>
  );
}

// ─── User Row Skeleton ────────────────────────────────────────────────────────
export function UserRowSkeleton() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "16px",
      padding: "16px 24px", borderBottom: "1px solid #f1f5f9",
    }}>
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <Skeleton width="140px" height="13px" />
        <Skeleton width="100px" height="11px" />
      </div>
      <Skeleton width="60px" height="22px" borderRadius="6px" />
      <Skeleton width="55px" height="22px" borderRadius="99px" />
      <div style={{ display: "flex", gap: "8px" }}>
        <Skeleton width="32px" height="32px" borderRadius="8px" />
        <Skeleton width="32px" height="32px" borderRadius="8px" />
        <Skeleton width="52px" height="32px" borderRadius="8px" />
      </div>
    </div>
  );
}
