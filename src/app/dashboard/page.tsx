"use client";

import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import Link from "next/link";
import React from "react";
import { getDashboardStats } from "@/application/actions/dashboardActions";
import { getUpcomingAppointments } from "@/application/actions/appointmentActions";
import { StatCardSkeleton, CardRowSkeleton } from "@/presentation/components/Skeleton";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent, icon, delay = 0,
}: {
  label: string;
  value: string | number;
  sub: string;
  accent: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${delay}ms`,
        background: "var(--card-bg)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "var(--card-shadow)",
        border: "1px solid #e8edf4",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow-hover)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
          {label}
        </span>
        <div style={{
          width: "38px", height: "38px", borderRadius: "10px",
          background: `${accent}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accent,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: "8px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
        {sub}
      </div>
    </div>
  );
}

// ─── Status meta for appointment statuses ────────────────────────────────────
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  SCHEDULED: { label: "Scheduled", bg: "#dbeafe", color: "#2563eb" },
  COMPLETED: { label: "Completed", bg: "#dcfce7", color: "#16a34a" },
  CANCELLED: { label: "Cancelled", bg: "#fee2e2", color: "#dc2626" },
  NO_SHOW:   { label: "No-show",   bg: "#fef3c7", color: "#d97706" },
};

// ─── Appointment row (real DB data) ──────────────────────────────────────────
function AppointmentRow({ appt }: { appt: any }) {
  const d = new Date(appt.appointmentDate);
  const isToday = (() => {
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
  })();

  const dateLabel = isToday
    ? "Today"
    : d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });

  const meta = STATUS_META[appt.status] ?? STATUS_META.SCHEDULED;

  const initials = (() => {
    const parts = (appt.patient?.name ?? "?").trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (appt.patient?.name ?? "?").slice(0, 2).toUpperCase();
  })();

  const colors = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];
  const avatarColor = colors[(appt.patient?.name ?? "").charCodeAt(0) % colors.length];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px 18px",
        borderRadius: "12px",
        background: "var(--card-bg)",
        border: "1px solid #e8edf4",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLElement).style.transform = "translateX(2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Time + date pill */}
        <div style={{ textAlign: "center", minWidth: "58px" }}>
          <div style={{
            padding: "4px 10px", borderRadius: "8px",
            background: "#eff6ff", color: "#2563eb",
            fontWeight: 800, fontSize: "12px", whiteSpace: "nowrap",
          }}>
            {appt.timeSlot}
          </div>
          <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "3px", fontWeight: 600 }}>
            {dateLabel}
          </div>
        </div>

        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
            background: `${avatarColor}20`, border: `2px solid ${avatarColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "11px", color: avatarColor,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text-primary)" }}>
              {appt.patient?.name ?? "Unknown"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>
              {appt.type}
            </div>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <span style={{
        padding: "4px 11px", borderRadius: "99px",
        background: meta.bg, color: meta.color,
        fontWeight: 700, fontSize: "11.5px", whiteSpace: "nowrap",
      }}>
        {meta.label}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [dbStats, setDbStats] = React.useState({
    totalPatients: 0,
    patientsToday: 0,
    prescriptionsToday: 0,
    totalPrescriptions: 0,
    appointmentsToday: 0,
  });
  const [upcomingAppts, setUpcomingAppts] = React.useState<any[]>([]);

  React.useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getUpcomingAppointments(6),
    ]).then(([stats, appts]) => {
      setDbStats(stats);
      setUpcomingAppts(appts);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Patients Today",
      value: dbStats.patientsToday,
      sub: "New registrations today",
      accent: "#3b82f6",
      delay: 0,
      icon: (
        <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: "Appointments Today",
      value: dbStats.appointmentsToday,
      sub: "Scheduled for today",
      accent: "#10b981",
      delay: 80,
      icon: (
        <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
          <path d="M8 14h.01M12 14h.01M16 14h.01" strokeWidth="2.5"/>
        </svg>
      ),
    },
    {
      label: "Prescriptions Today",
      value: dbStats.prescriptionsToday,
      sub: "Issued in the last 24 hours",
      accent: "#f59e0b",
      delay: 160,
      icon: (
        <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      ),
    },
    {
      label: "Total Patients",
      value: dbStats.totalPatients,
      sub: "Registered in the system",
      accent: "#8b5cf6",
      delay: 240,
      icon: (
        <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="animate-fade-up" style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.5px" }}>
          Good morning, <span style={{ color: "var(--accent)" }}>Dr. Smith 👋</span>
        </h1>
        <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>
          Here&apos;s what&apos;s happening at your clinic today.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>

        {/* Upcoming appointments — live from DB */}
        <div className="animate-fade-up-delay-2" style={{
          background: "var(--card-bg)", borderRadius: "16px", padding: "24px",
          boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Upcoming Appointments
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                {upcomingAppts.length === 0
                  ? "No upcoming appointments"
                  : `${upcomingAppts.length} scheduled`}
              </p>
            </div>
            <Link
              href="/dashboard/appointments"
              style={{
                fontSize: "12.5px", fontWeight: 700, color: "var(--accent)",
                textDecoration: "none", padding: "6px 14px", borderRadius: "8px",
                background: "#eff6ff", transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "#dbeafe"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "#eff6ff"}
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Array.from({ length: 4 }).map((_, i) => <CardRowSkeleton key={i} />)}
            </div>
          ) : upcomingAppts.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              color: "var(--text-muted)", fontSize: "13.5px",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px", background: "#f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <svg fill="none" height="22" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24" width="22">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              No upcoming appointments yet.{" "}
              <Link href="/dashboard/appointments" style={{ color: "var(--accent)", fontWeight: 600 }}>
                Book one →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {upcomingAppts.map((appt) => (
                <AppointmentRow key={appt.id} appt={appt} />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions + system status */}
        <div className="animate-fade-up-delay-3" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            background: "var(--card-bg)", borderRadius: "16px", padding: "22px",
            boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4",
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Book Appointment",  href: "/dashboard/appointments", bg: "#3b82f6", color: "#fff"     },
                { label: "New Prescription",  href: "/dashboard/prescriptions/new", bg: "#f0fdf4", color: "#16a34a" },
                { label: "Add Patient",        href: "/dashboard/patients",     bg: "#faf5ff", color: "#7c3aed" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  style={{
                    display: "block", padding: "12px 16px", borderRadius: "10px",
                    background: action.bg, color: action.color,
                    fontWeight: 700, fontSize: "13px", textDecoration: "none",
                    transition: "opacity 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; (e.currentTarget as HTMLElement).style.transform = "scale(0.98)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  {action.label} →
                </Link>
              ))}
            </div>
          </div>

          <div style={{
            background: "var(--card-bg)", borderRadius: "16px", padding: "22px",
            boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4",
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              System Status
            </h3>
            {[
              { label: "Database",   status: "Online",  color: "#10b981" },
              { label: "API Server", status: "Online",  color: "#10b981" },
              { label: "Backups",    status: "Running", color: "#f59e0b" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 700, color: item.color }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: item.color, display: "inline-block" }} />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
