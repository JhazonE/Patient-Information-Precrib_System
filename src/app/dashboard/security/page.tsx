"use client";

import DashboardLayout from "@/presentation/layouts/DashboardLayout";

export default function SecurityPage() {
  return (
    <DashboardLayout>
      <div className="animate-fade-up">
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.5px" }}>
          Privacy & <span style={{ color: "var(--accent)" }}>Security</span>
        </h1>
        <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>
          Protect your patient data and manage system access permissions.
        </p>

        <div style={{
          marginTop: "32px", background: "var(--card-bg)", 
          borderRadius: "16px", border: "1px solid #e8edf4", boxShadow: "var(--card-shadow)",
          padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
        }}>
           <div style={{ 
             width: "72px", height: "72px", borderRadius: "20px", background: "rgba(59,130,246,0.1)",
             display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)",
             marginBottom: "24px"
           }}>
             <svg fill="none" height="40" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="40">
               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
             </svg>
           </div>
           <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Enhanced Data Protection</h3>
           <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", maxWidth: "400px", textAlign: "center", lineHeight: 1.6 }}>
             Your patient records are encrypted with AES-256 standard. Multifactor authentication is currently active for this session.
           </p>
           <button style={{
             marginTop: "24px", padding: "10px 24px", borderRadius: "10px", border: "none",
             background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: "14px",
             cursor: "pointer", boxShadow: "0 4px 12px var(--accent-glow)"
           }}>View Access Logs</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
