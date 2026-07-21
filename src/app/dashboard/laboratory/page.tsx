import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { getLabRequests, getLabStats } from "@/application/actions/laboratoryActions";
import Link from "next/link";
import { FlaskIcon, PlusIcon } from "@/presentation/components/icons";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:     { bg: "#fef3c7", color: "#d97706", label: "Pending" },
  IN_PROGRESS: { bg: "#dbeafe", color: "#2563eb", label: "In Progress" },
  COMPLETED:   { bg: "#dcfce7", color: "#16a34a", label: "Completed" },
  CANCELLED:   { bg: "#f1f5f9", color: "#64748b", label: "Cancelled" },
};

const PRIORITY_STYLES: Record<string, { color: string; label: string }> = {
  ROUTINE: { color: "#64748b", label: "Routine" },
  URGENT:  { color: "#d97706", label: "Urgent" },
  STAT:    { color: "#dc2626", label: "STAT" },
};

export default async function LaboratoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [requests, stats] = await Promise.all([
    getLabRequests(status as any),
    getLabStats(),
  ]);

  const statCards = [
    { label: "Total Requests",  value: stats.total,      color: "#3b82f6", bg: "#eff6ff" },
    { label: "Pending",         value: stats.pending,    color: "#d97706", bg: "#fffbeb" },
    { label: "In Progress",     value: stats.inProgress, color: "#2563eb", bg: "#dbeafe" },
    { label: "Completed",       value: stats.completed,  color: "#16a34a", bg: "#dcfce7" },
  ];

  const filterTabs = [
    { label: "All",         value: "" },
    { label: "Pending",     value: "PENDING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed",   value: "COMPLETED" },
  ];

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Laboratory</h1>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "var(--text-muted)" }}>Manage lab test requests and results</p>
          </div>
          <Link href="/dashboard/laboratory/new" style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "11px 20px",
            borderRadius: "10px", textDecoration: "none",
            background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
            color: "#fff", fontWeight: 700, fontSize: "13.5px",
            boxShadow: "0 4px 14px rgba(14,165,233,0.4)",
          }}>
            <PlusIcon width={16} height={16} /> New Lab Request
          </Link>
        </div>

        {/* Stat cards */}
        <div className="animate-fade-up-delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: "var(--card-bg)", borderRadius: "14px", padding: "20px 24px", boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
                <FlaskIcon width={20} height={20} />
              </div>
              <div>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="animate-fade-up-delay-2" style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {filterTabs.map(tab => {
            const active = (status ?? "") === tab.value;
            return (
              <Link
                key={tab.value}
                href={tab.value ? `/dashboard/laboratory?status=${tab.value}` : "/dashboard/laboratory"}
                style={{
                  padding: "7px 18px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 600,
                  background: active ? "#0ea5e9" : "#f1f5f9",
                  color: active ? "#fff" : "#64748b",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Requests list */}
        <div className="animate-fade-up-delay-3" style={{ background: "var(--card-bg)", borderRadius: "16px", boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4", overflow: "hidden" }}>
          {requests.length === 0 ? (
            <div style={{ padding: "64px", textAlign: "center", color: "var(--text-muted)" }}>
              <FlaskIcon width={40} height={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
              <p style={{ fontWeight: 600, marginBottom: "6px" }}>No lab requests found</p>
              <p style={{ fontSize: "13px" }}>Create a new lab request to get started.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e8edf4", background: "#f8fafc" }}>
                  {["Patient", "Requested By", "Tests", "Priority", "Status", "Date", ""].map(h => (
                    <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(requests as any[]).map((req, i) => {
                  const s = STATUS_STYLES[req.status] ?? STATUS_STYLES.PENDING;
                  const p = PRIORITY_STYLES[req.priority] ?? PRIORITY_STYLES.ROUTINE;
                  return (
                    <tr key={req.id} style={{ borderBottom: i < requests.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f8fafc"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text-primary)" }}>{req.patient.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {req.patient.gender === "MALE" ? "M" : req.patient.gender === "FEMALE" ? "F" : "O"} ·{" "}
                          {Math.floor((new Date().getTime() - new Date(req.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} yrs
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                        <div style={{ fontWeight: 600 }}>{req.doctor.name}</div>
                        {req.doctor.specialty && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{req.doctor.specialty}</div>}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {req.results.slice(0, 3).map((r: any) => (
                            <span key={r.id} style={{ padding: "2px 8px", borderRadius: "5px", background: "#e0f2fe", color: "#0284c7", fontSize: "11.5px", fontWeight: 600 }}>
                              {r.test.code}
                            </span>
                          ))}
                          {req.results.length > 3 && (
                            <span style={{ padding: "2px 8px", borderRadius: "5px", background: "#f1f5f9", color: "#64748b", fontSize: "11.5px" }}>
                              +{req.results.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: p.color }}>{p.label}</span>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "99px", background: s.bg, color: s.color, fontSize: "11.5px", fontWeight: 700 }}>{s.label}</span>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: "12.5px", color: "var(--text-muted)" }}>
                        {new Date(req.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <Link href={`/dashboard/laboratory/${req.id}`}
                          style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#0ea5e9", fontWeight: 700, fontSize: "12.5px", textDecoration: "none", whiteSpace: "nowrap" }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
