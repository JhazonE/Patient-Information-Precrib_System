import DashboardLayout from "@/presentation/layouts/DashboardLayout";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="animate-fade-up">
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.5px" }}>
          Clinical <span style={{ color: "var(--accent)" }}>Analytics</span>
        </h1>
        <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>
          Insights and trends from patient records and prescription data.
        </p>

        <div style={{
          marginTop: "32px", height: "400px", background: "var(--card-bg)", 
          borderRadius: "16px", border: "1px dashed #e2e8f0", display: "flex", 
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: "var(--text-muted)"
        }}>
          <div style={{ marginBottom: "16px", opacity: 0.5 }}>
            <svg fill="none" height="64" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" width="64">
              <path d="M3 3v18h18"/><path d="M18 9l-5 5-2-2-5 5"/>
            </svg>
          </div>
          <p style={{ fontWeight: 600 }}>Analytics modules are currently being synchronized...</p>
          <p style={{ fontSize: "12px" }}>Real-time charting and data visualization will appear here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
