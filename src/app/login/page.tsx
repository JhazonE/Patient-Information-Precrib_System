"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import Logo from "@/presentation/components/Logo";
import { loginAction } from "./actions";

const features = [
  "Patient Records Management",
  "Prescription System",
  "Appointment Scheduling",
  "Analytics & Reports",
];

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.2)" />
    <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: "0 0 42%",
        background: "linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 55%, #3b82f6 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "320px", height: "320px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "-60px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Logo size={44} variant="full" dark />

          <div style={{ marginTop: "52px" }}>
            <div style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              color: "#bfdbfe",
              fontSize: "11px", fontWeight: 700,
              letterSpacing: "2px", textTransform: "uppercase",
              padding: "5px 12px", borderRadius: "99px",
              marginBottom: "16px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              Staff Portal
            </div>
            <h1 style={{
              color: "#ffffff", fontSize: "34px", fontWeight: 900,
              margin: "0 0 14px", letterSpacing: "-0.8px", lineHeight: 1.15,
            }}>
              Your clinic,<br />all in one place.
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.7)", fontSize: "15px", lineHeight: 1.7,
              margin: 0, maxWidth: "340px",
            }}>
              Manage patient records, prescriptions, and appointments from a unified secure platform.
            </p>
          </div>

          <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {features.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckIcon />
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", fontWeight: 500 }}>
                  {f}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "52px",
            paddingTop: "28px",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 8px #4ade80",
            }} />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12.5px", fontWeight: 500 }}>
              System online · Secure connection
            </span>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          <div style={{ marginBottom: "36px" }}>
            <h2 style={{
              fontSize: "26px", fontWeight: 900, color: "#0f172a",
              margin: "0 0 8px", letterSpacing: "-0.5px",
            }}>
              Sign in to your account
            </h2>
            <p style={{ color: "#64748b", fontSize: "14.5px", margin: 0, lineHeight: 1.6 }}>
              Enter your staff credentials to access the system.
            </p>
          </div>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{
                display: "block", fontSize: "13px", fontWeight: 600,
                color: "#374151", marginBottom: "7px",
              }}>
                Username
              </label>
              <input
                name="username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                required
                disabled={isPending}
                style={{
                  width: "100%", height: "46px",
                  border: state?.error ? "1.5px solid #f87171" : "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "0 14px",
                  fontSize: "14px", color: "#0f172a",
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = state?.error ? "#f87171" : "#e2e8f0"; }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                  Password
                </label>
              </div>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isPending}
                style={{
                  width: "100%", height: "46px",
                  border: state?.error ? "1.5px solid #f87171" : "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "0 14px",
                  fontSize: "14px", color: "#0f172a",
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = state?.error ? "#f87171" : "#e2e8f0"; }}
              />
            </div>

            {state?.error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "8px", padding: "10px 14px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 11v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: "13px", color: "#dc2626", fontWeight: 500 }}>
                  {state.error}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                width: "100%", height: "48px",
                background: isPending
                  ? "linear-gradient(135deg, #93c5fd, #60a5fa)"
                  : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "#fff",
                fontWeight: 700, fontSize: "15px",
                border: "none", borderRadius: "10px",
                cursor: isPending ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
                transition: "all 0.2s",
                marginTop: "4px",
              }}
            >
              {isPending ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign In →</>
              )}
            </button>
          </form>

          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <Link
              href="/portal"
              style={{
                fontSize: "13px", color: "#64748b", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: "5px",
                fontWeight: 500, transition: "color 0.2s",
              }}
            >
              ← Back to Patient Portal
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}
