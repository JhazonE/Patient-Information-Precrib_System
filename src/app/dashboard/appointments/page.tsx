"use client";

import React from "react";
import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { CalendarIcon, PlusIcon, SearchIcon } from "@/presentation/components/icons";
import {
  createAppointment,
  createAppointmentWithNewPatient,
  getAppointments,
  updateAppointmentStatus,
} from "@/application/actions/appointmentActions";
import { getPatients } from "@/application/actions/patientActions";
import { PhAddressSelector } from "@/presentation/components/PhAddressSelector";
import { useSnackbar, Snackbar } from "@/presentation/components/Snackbar";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ───────────────────────────────────────────────────────────────
const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 17; h++) {
  for (const m of ["00", "30"]) {
    if (h === 17 && m === "30") break;
    const ampm = h < 12 ? "AM" : "PM";
    const disp = h > 12 ? h - 12 : h === 0 ? 12 : h;
    TIME_SLOTS.push(`${disp}:${m} ${ampm}`);
  }
}

const APPT_TYPES = [
  "Consultation",
  "Follow-up",
  "Check-up",
  "Emergency",
  "Lab Results",
  "Vaccination",
  "Physical Exam",
];

const STATUS_META: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  SCHEDULED:  { label: "Scheduled",  bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" },
  COMPLETED:  { label: "Completed",  bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  CANCELLED:  { label: "Cancelled",  bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  NO_SHOW:    { label: "No-show",    bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
};

const FILTER_TABS = ["All", "Today", "Upcoming", "Completed", "Cancelled"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth() &&
    a.getDate()     === b.getDate()
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

function formatDayName(d: Date) {
  return d.toLocaleDateString("en-PH", { weekday: "long" });
}

const getInitials = (name: string) => {
  const p = name.trim().split(" ");
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const COLORS = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];
const avatarColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.SCHEDULED;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "12px",
        fontWeight: 600,
        background: m.bg,
        color: m.color,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: m.dot,
          flexShrink: 0,
        }}
      />
      {m.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const { showSnack, dismiss, snack } = useSnackbar();
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>("All");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  // Drawer — new-patient mode
  const [patientMode, setPatientMode] = React.useState<"existing" | "new">("existing");
  const [newAddress, setNewAddress] = React.useState("");
  const [addrKey, setAddrKey] = React.useState(0);

  async function load() {
    try {
      const [appts, pts] = await Promise.all([getAppointments(), getPatients()]);
      setAppointments(appts);
      setPatients(pts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    setMounted(true);
    load();
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = React.useMemo(() => {
    const todayCount = appointments.filter((a) =>
      isSameDay(new Date(a.appointmentDate), today)
    ).length;
    const upcoming = appointments.filter(
      (a) => new Date(a.appointmentDate) > today && a.status === "SCHEDULED"
    ).length;
    const completed = appointments.filter((a) => a.status === "COMPLETED").length;
    const cancelled = appointments.filter((a) => a.status === "CANCELLED").length;
    return { total: appointments.length, todayCount, upcoming, completed, cancelled };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments]);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    let list = appointments;

    if (activeFilter === "Today")
      list = list.filter((a) => isSameDay(new Date(a.appointmentDate), today));
    else if (activeFilter === "Upcoming")
      list = list.filter(
        (a) => new Date(a.appointmentDate) >= today && a.status === "SCHEDULED"
      );
    else if (activeFilter === "Completed")
      list = list.filter((a) => a.status === "COMPLETED");
    else if (activeFilter === "Cancelled")
      list = list.filter((a) => a.status === "CANCELLED");

    if (search.trim())
      list = list.filter((a) =>
        a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.type?.toLowerCase().includes(search.toLowerCase())
      );

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, activeFilter, search]);

  function closeDrawer() {
    setIsDrawerOpen(false);
    setPatientMode("existing");
    setNewAddress("");
    setAddrKey((k) => k + 1);
  }

  // ── Book appointment ──────────────────────────────────────────────────────
  async function handleBook(formData: FormData) {
    setSubmitting(true);
    try {
      if (patientMode === "new") {
        formData.set("address", newAddress);
        await createAppointmentWithNewPatient(formData);
      } else {
        await createAppointment(formData);
      }
      closeDrawer();
      await load();
      showSnack("Appointment booked successfully.", "success");
    } catch (e) {
      console.error(e);
      showSnack("Failed to book appointment. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      await load();
      const labels: Record<string, string> = {
        COMPLETED: "Appointment marked as completed.",
        CANCELLED: "Appointment cancelled.",
        NO_SHOW: "Appointment marked as no-show.",
        SCHEDULED: "Appointment rescheduled.",
      };
      showSnack(labels[status] ?? "Status updated.", "success");
    } catch {
      showSnack("Failed to update status. Please try again.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Shared input style ────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    height: "44px",
    width: "100%",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: "0 16px",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    transition: "all 0.2s",
  };

  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "#3b82f6";
    e.currentTarget.style.background  = "#fff";
    e.currentTarget.style.boxShadow   = "0 0 0 4px rgba(59,130,246,0.1)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "#e2e8f0";
    e.currentTarget.style.background  = "#f8fafc";
    e.currentTarget.style.boxShadow   = "none";
  }

  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div
        className="animate-fade-up"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.4px",
            }}
          >
            Appointments
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: "13.5px", color: "var(--text-secondary)" }}>
            Schedule and manage patient appointments
          </p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#3b82f6",
            color: "#fff",
            fontWeight: 700,
            fontSize: "13.5px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
        >
          <PlusIcon size={16} />
          Book Appointment
        </button>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div
        className="animate-fade-up-delay-1"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total", value: stats.total,      bg: "#f8fafc",  color: "#475569", accent: "#94a3b8" },
          { label: "Today",    value: stats.todayCount, bg: "#eff6ff",  color: "#2563eb", accent: "#3b82f6" },
          { label: "Upcoming", value: stats.upcoming,   bg: "#f0fdf4",  color: "#16a34a", accent: "#22c55e" },
          { label: "Completed",value: stats.completed,  bg: "#faf5ff",  color: "#7c3aed", accent: "#8b5cf6" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--card-bg)",
              borderRadius: "14px",
              padding: "18px 20px",
              boxShadow: "var(--card-shadow)",
              border: "1px solid #e8edf4",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CalendarIcon width={20} height={20} style={{ color: s.accent }} />
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters + search ────────────────────────────────────────────── */}
      <div
        className="animate-fade-up-delay-2"
        style={{
          background: "var(--card-bg)",
          borderRadius: "14px",
          padding: "14px 20px",
          boxShadow: "var(--card-shadow)",
          border: "1px solid #e8edf4",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: activeFilter === tab ? "#3b82f6" : "#e2e8f0",
                background: activeFilter === tab ? "#eff6ff" : "#fff",
                color: activeFilter === tab ? "#2563eb" : "#64748b",
                fontWeight: 600,
                fontSize: "12.5px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginLeft: "auto", minWidth: "220px" }}>
          <div
            style={{
              position: "absolute",
              left: "11px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          >
            <SearchIcon style={{ width: "14px", height: "14px" }} />
          </div>
          <input
            type="text"
            placeholder="Search patient or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: "36px",
              width: "100%",
              borderRadius: "9px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              padding: "0 12px 0 32px",
              fontSize: "13px",
              outline: "none",
              color: "var(--text-primary)",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#93c5fd";
              e.currentTarget.style.background  = "#fff";
              e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(59,130,246,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background  = "#f8fafc";
              e.currentTarget.style.boxShadow   = "none";
            }}
          />
        </div>
      </div>

      {/* ── Appointments list ────────────────────────────────────────────── */}
      <div className="animate-fade-up-delay-2">
        {loading ? (
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: "16px",
              padding: "60px 24px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "14px",
              boxShadow: "var(--card-shadow)",
              border: "1px solid #e8edf4",
            }}
          >
            Loading appointments...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: "16px",
              padding: "64px 24px",
              textAlign: "center",
              boxShadow: "var(--card-shadow)",
              border: "1px solid #e8edf4",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CalendarIcon width={26} height={26} style={{ color: "#3b82f6" }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px" }}>
              No appointments found
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>
              {activeFilter !== "All"
                ? `No ${activeFilter.toLowerCase()} appointments.`
                : "Book your first appointment to get started."}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: "16px",
              boxShadow: "var(--card-shadow)",
              border: "1px solid #e8edf4",
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr 1fr 130px 1fr 160px",
                padding: "12px 24px",
                background: "#f8fafc",
                borderBottom: "1px solid #e8edf4",
              }}
            >
              {["Date & Time", "Patient", "Type", "Status", "Doctor", "Actions"].map((h) => (
                <div
                  key={h}
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    textAlign: h === "Actions" ? "right" : "left",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((appt, i) => {
              const d   = new Date(appt.appointmentDate);
              const isToday = isSameDay(d, new Date());
              const color  = avatarColor(appt.patient?.name ?? "");
              const busy   = updatingId === appt.id;

              return (
                <div
                  key={appt.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr 1fr 130px 1fr 160px",
                    padding: "15px 24px",
                    alignItems: "center",
                    borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                    transition: "background 0.15s",
                    opacity: busy ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#fafbff")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "transparent")
                  }
                >
                  {/* Date & Time */}
                  <div>
                    <div
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: isToday ? "#2563eb" : "var(--text-primary)",
                      }}
                    >
                      {isToday ? "Today" : formatDate(d)}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {appt.timeSlot} · {formatDayName(d)}
                    </div>
                  </div>

                  {/* Patient */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        background: `${color}20`,
                        border: `2px solid ${color}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "12px",
                        color,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(appt.patient?.name ?? "?")}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--text-primary)" }}>
                      {appt.patient?.name ?? "—"}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#f1f5f9",
                        color: "#475569",
                      }}
                    >
                      {appt.type}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={appt.status} />
                  </div>

                  {/* Doctor */}
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {appt.doctor?.name ?? "—"}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      justifyContent: "flex-end",
                      flexWrap: "wrap",
                    }}
                  >
                    {appt.status === "SCHEDULED" && (
                      <>
                        <button
                          disabled={busy}
                          onClick={() => changeStatus(appt.id, "COMPLETED")}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "7px",
                            border: "none",
                            background: "#f0fdf4",
                            color: "#16a34a",
                            fontWeight: 600,
                            fontSize: "11.5px",
                            cursor: busy ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#dcfce7")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#f0fdf4")
                          }
                        >
                          Complete
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => changeStatus(appt.id, "NO_SHOW")}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "7px",
                            border: "none",
                            background: "#fffbeb",
                            color: "#d97706",
                            fontWeight: 600,
                            fontSize: "11.5px",
                            cursor: busy ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#fef3c7")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#fffbeb")
                          }
                        >
                          No-show
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => changeStatus(appt.id, "CANCELLED")}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "7px",
                            border: "none",
                            background: "#fef2f2",
                            color: "#dc2626",
                            fontWeight: 600,
                            fontSize: "11.5px",
                            cursor: busy ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#fee2e2")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#fef2f2")
                          }
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {(appt.status === "CANCELLED" || appt.status === "NO_SHOW") && (
                      <button
                        disabled={busy}
                        onClick={() => changeStatus(appt.id, "SCHEDULED")}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "7px",
                          border: "none",
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontWeight: 600,
                          fontSize: "11.5px",
                          cursor: busy ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#dbeafe")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#eff6ff")
                        }
                      >
                        Reschedule
                      </button>
                    )}
                    {appt.status === "COMPLETED" && (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Done
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Book Appointment Drawer ──────────────────────────────────────── */}
      {mounted && (
        <AnimatePresence mode="wait">
          {isDrawerOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <motion.div
                key="appt-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(4px)",
                }}
              />

              <motion.div
                key="appt-drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "relative",
                  width: "480px",
                  maxWidth: "100%",
                  background: "#fff",
                  boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100vh",
                  borderLeft: "1px solid #f1f5f9",
                  zIndex: 1001,
                }}
              >
                <form
                  action={handleBook}
                  style={{ height: "100%", display: "flex", flexDirection: "column" }}
                >
                  {/* Drawer header */}
                  <div
                    style={{
                      padding: "28px 28px 22px",
                      borderBottom: "1px solid #f1f5f9",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "9px",
                            background: "#eff6ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CalendarIcon width={18} height={18} style={{ color: "#3b82f6" }} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                          Book Appointment
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={closeDrawer}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          padding: "4px",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                      Fill in the details to schedule a new patient appointment.
                    </p>
                  </div>

                  {/* Drawer body */}
                  <div
                    style={{
                      padding: "24px 28px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                      flex: 1,
                      overflowY: "auto",
                    }}
                  >
                    {/* Patient mode toggle */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      {(["existing", "new"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => { setPatientMode(mode); setNewAddress(""); setAddrKey((k) => k + 1); }}
                          style={{
                            flex: 1, height: "38px", borderRadius: "9px",
                            border: "1.5px solid",
                            borderColor: patientMode === mode ? "#3b82f6" : "#e2e8f0",
                            background: patientMode === mode ? "#eff6ff" : "#f8fafc",
                            color: patientMode === mode ? "#1d4ed8" : "#64748b",
                            fontWeight: patientMode === mode ? 700 : 500,
                            fontSize: "13px", cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {mode === "existing" ? "Existing Patient" : "New / Walk-in"}
                        </button>
                      ))}
                    </div>

                    {/* ── Existing patient ── */}
                    {patientMode === "existing" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                          Patient <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <select name="patientId" required style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                          <option value="">Select patient...</option>
                          {patients.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* ── New patient fields ── */}
                    {patientMode === "new" && (
                      <>
                        {/* Name */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                            Patient Information
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                                First Name <span style={{ color: "#ef4444" }}>*</span>
                              </label>
                              <input name="firstName" required placeholder="Juan" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Middle Name</label>
                              <input name="middleName" placeholder="Santos" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                              Last Name <span style={{ color: "#ef4444" }}>*</span>
                            </label>
                            <input name="lastName" required placeholder="Dela Cruz" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                          </div>
                        </div>

                        {/* DOB + Gender */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                              Date of Birth <span style={{ color: "#ef4444" }}>*</span>
                            </label>
                            <input name="dateOfBirth" type="date" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Gender</label>
                            <select name="gender" style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                        </div>

                        {/* Contact */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Phone</label>
                            <input name="phone" type="tel" placeholder="+63 912 345 6789" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Email</label>
                            <input name="email" type="email" placeholder="juan@example.com" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                          </div>
                        </div>

                        {/* Address */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                            Home Address <span style={{ fontWeight: 500, color: "#94a3b8", textTransform: "none", letterSpacing: 0, fontSize: "11px" }}>(optional)</span>
                          </div>
                          <PhAddressSelector onAddressChange={setNewAddress} resetKey={addrKey} compact />
                          {newAddress && (
                            <div style={{
                              background: "#f0fdf4", border: "1px solid #86efac",
                              borderRadius: "8px", padding: "8px 12px",
                              fontSize: "12px", color: "#166534",
                            }}>
                              <strong>Address:</strong> {newAddress}
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div style={{ height: "1px", background: "#e8edf4" }} />
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                          Appointment Details
                        </div>
                      </>
                    )}

                    {/* Date + Time */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                          Date <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          name="appointmentDate"
                          type="date"
                          required
                          min={todayISO}
                          style={inputStyle}
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                          Time Slot <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <select name="timeSlot" required style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                          <option value="">Select time...</option>
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Appointment Type */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                        Appointment Type <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <select name="type" required style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                        <option value="">Select type...</option>
                        {APPT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Notes */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                        Notes <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)" }}>(optional)</span>
                      </label>
                      <textarea
                        name="notes"
                        rows={3}
                        placeholder="Reason for visit, special instructions, reminders..."
                        style={{
                          ...inputStyle,
                          height: "auto",
                          padding: "12px 16px",
                          resize: "vertical",
                          lineHeight: 1.6,
                        }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>

                    {/* Info box */}
                    <div
                      style={{
                        background: "#eff6ff",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        fontSize: "12.5px",
                        color: "#2563eb",
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-start",
                      }}
                    >
                      <svg
                        fill="none"
                        height="15"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="15"
                        style={{ flexShrink: 0, marginTop: "1px" }}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4m0-4h.01" />
                      </svg>
                      Appointment will be assigned to Dr. Smith. Status starts as <strong>&nbsp;Scheduled</strong>.
                    </div>
                  </div>

                  {/* Drawer footer */}
                  <div
                    style={{
                      padding: "20px 28px 28px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      borderTop: "1px solid #f1f5f9",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "12px",
                        border: "none",
                        background: submitting ? "#93c5fd" : "#3b82f6",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: submitting ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                        transition: "all 0.2s",
                      }}
                    >
                      {submitting ? "Booking..." : "Confirm Appointment"}
                    </button>
                    <button
                      type="button"
                      onClick={closeDrawer}
                      style={{
                        width: "100%",
                        height: "44px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}

      <Snackbar snack={snack} onDismiss={dismiss} />
    </DashboardLayout>
  );
}
