"use client";

import React, { useState, useTransition } from "react";
import type { DoctorRow } from "@/application/actions/doctorActions";
import { createDoctor, updateDoctor, deleteDoctor } from "@/application/actions/doctorActions";
import { useSnackbar, Snackbar } from "@/presentation/components/Snackbar";
import { Spinner } from "@/presentation/components/Skeleton";

/* ── helpers ─────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  "linear-gradient(135deg,#10b981,#047857)",
  "linear-gradient(135deg,#f59e0b,#b45309)",
  "linear-gradient(135deg,#ef4444,#b91c1c)",
  "linear-gradient(135deg,#06b6d4,#0e7490)",
];
const avatarBg = (id: string) => AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (name: string) => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const fmtDate  = (d: Date) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

interface FormState { name: string; email: string; specialty: string; licenseNumber: string }
const EMPTY: FormState = { name: "", email: "", specialty: "", licenseNumber: "" };

/* ── icons ───────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const DoctorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
    <circle cx="20" cy="10" r="2"/>
  </svg>
);
const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
  </svg>
);

/* ── input field helper ──────────────────────────────────────── */
function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.5px", textTransform: "uppercase" }}>
        {label}{optional && <span style={{ color: "#d1d5db", fontWeight: 400, marginLeft: 4 }}>optional</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #e5e7eb",
  padding: "0 14px", fontSize: 14, color: "#111827", background: "#fafafa",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, background 0.2s",
};

/* ── Drawer ──────────────────────────────────────────────────── */
function Drawer({
  open, title, subtitle, onClose, onSubmit, form, setForm, isEdit, isPending, error,
}: {
  open: boolean; title: string; subtitle: string;
  onClose: () => void; onSubmit: (f: FormState) => void;
  form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>;
  isEdit: boolean; isPending: boolean; error: string;
}) {
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes drawerIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .doc-input:focus { border-color: #6366f1 !important; background: #fff !important; }
      `}</style>

      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.35)", backdropFilter: "blur(2px)" }} />

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 51,
        width: 420, background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        animation: "drawerIn 0.28s cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>{title}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>{subtitle}</p>
          </div>
          <button onClick={onClose} type="button" style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", flexShrink: 0 }}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="Full Name">
            <input className="doc-input" style={inputStyle} value={form.name} onChange={set("name")} placeholder="e.g. Dr. Maria Santos" required />
          </Field>

          <Field label="Email Address">
            <input className="doc-input" style={inputStyle} type="email" value={form.email} onChange={set("email")} placeholder="e.g. maria@clinic.com" required />
          </Field>

          <Field label="Specialty" optional>
            <input className="doc-input" style={inputStyle} value={form.specialty} onChange={set("specialty")} placeholder="e.g. Pediatrician, Cardiologist" />
          </Field>

          <Field label="License Number" optional>
            <input className="doc-input" style={inputStyle} value={form.licenseNumber} onChange={set("licenseNumber")} placeholder="e.g. PRC-2024-001234" />
          </Field>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{error}</div>
          )}

          <div style={{ flex: 1 }} />

          <button type="submit" disabled={isPending} style={{ height: 46, borderRadius: 10, border: "none", background: isPending ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(99,102,241,0.35)", flexShrink: 0, marginTop: 8 }}>
            {isPending && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            )}
            {isEdit ? "Save Changes" : "Register Doctor"}
          </button>
        </form>
      </div>
    </>
  );
}

/* ── Delete confirm ──────────────────────────────────────────── */
function DeleteDialog({ doctor, onClose, onConfirm, isPending }: {
  doctor: DoctorRow; onClose: () => void; onConfirm: () => void; isPending: boolean;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.35)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 51, background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: "0 25px 50px rgba(0,0,0,0.15)", padding: "32px 28px", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#dc2626" }}>
          <TrashIcon />
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#111827" }}>Remove Doctor?</h3>
        <p style={{ margin: "0 0 6px", fontSize: 13.5, color: "#6b7280", lineHeight: 1.6 }}>
          This will permanently remove <strong style={{ color: "#111827" }}>{doctor.name}</strong> from the system.
        </p>
        {(doctor._count.prescriptions > 0 || doctor._count.labRequests > 0) && (
          <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px" }}>
            This doctor has {doctor._count.prescriptions} prescription(s) and {doctor._count.labRequests} lab request(s) on record. Deletion may fail.
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending} style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
            {isPending ? "Removing…" : "Yes, Remove"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Main panel ──────────────────────────────────────────────── */
export default function DoctorsPanel({ doctors }: { doctors: DoctorRow[] }) {
  const { showSnack, dismiss, snack }    = useSnackbar();
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [isEdit, setIsEdit]             = useState(false);
  const [editTarget, setEditTarget]     = useState<DoctorRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DoctorRow | null>(null);
  const [form, setForm]                 = useState<FormState>(EMPTY);
  const [formError, setFormError]       = useState("");
  const [isPending, startTransition]    = useTransition();

  const openCreate = () => { setForm(EMPTY); setFormError(""); setIsEdit(false); setEditTarget(null); setDrawerOpen(true); };
  const openEdit   = (d: DoctorRow) => { setForm({ name: d.name, email: d.email, specialty: d.specialty ?? "", licenseNumber: d.licenseNumber ?? "" }); setFormError(""); setIsEdit(true); setEditTarget(d); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setFormError(""); };

  const handleSubmit = (f: FormState) => {
    setFormError("");
    startTransition(async () => {
      const payload = { name: f.name.trim(), email: f.email.trim(), specialty: f.specialty.trim() || undefined, licenseNumber: f.licenseNumber.trim() || undefined };
      const res = isEdit
        ? await updateDoctor(editTarget!.id, payload)
        : await createDoctor(payload);
      if (res.error) { setFormError(res.error); return; }
      closeDrawer();
      showSnack(isEdit ? "Doctor updated." : "Doctor registered successfully.", "success");
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    startTransition(async () => {
      const res = await deleteDoctor(deleteTarget.id);
      if (res.error) { showSnack(res.error, "error"); setDeleteTarget(null); return; }
      setDeleteTarget(null);
      showSnack(`${name} has been removed.`, "success");
    });
  };

  const totalPrescriptions = doctors.reduce((s, d) => s + d._count.prescriptions, 0);

  const stats = [
    { label: "Total Doctors", value: doctors.length, sub: "Registered doctors", accent: "#6366f1", icon: <DoctorIcon /> },
    { label: "Prescriptions", value: totalPrescriptions, sub: "Prescriptions issued", accent: "#2563eb", icon: <ClipboardIcon /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Page header */}
      <div className="animate-fade-up" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.4px" }}>
            Registered <span style={{ color: "var(--accent)" }}>Doctors</span>
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "var(--text-secondary)" }}>
            Manage clinic doctors who can issue prescriptions and lab requests.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 14px rgba(99,102,241,0.35)", transition: "opacity 0.2s, transform 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <PlusIcon /> Register Doctor
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 500 }}>
        {stats.map((s, i) => (
          <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms`, background: "var(--card-bg)", borderRadius: 16, padding: 24, boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</span>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", color: s.accent }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", lineHeight: 1 }}>{s.value}</div>
            <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--text-secondary)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="animate-fade-up-delay-2" style={{ background: "var(--card-bg)", borderRadius: 16, boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e8edf4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
            {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"} registered
          </p>
        </div>

        {doctors.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--text-muted)" }}>
              <DoctorIcon />
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>No doctors registered yet</p>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-secondary)" }}>Click &ldquo;Register Doctor&rdquo; to add the first doctor.</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 140px 80px 140px 80px", padding: "12px 24px", background: "#f8fafc", borderBottom: "1px solid #e8edf4" }}>
              {["Doctor", "Specialty", "License No.", "Rx", "Registered", ""].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", textAlign: h === "" ? "right" : "left" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {doctors.map((d, i) => (
              <div key={d.id}
                style={{ display: "grid", gridTemplateColumns: "2fr 1fr 140px 80px 140px 80px", padding: "14px 24px", alignItems: "center", borderBottom: i < doctors.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafbff")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* Doctor */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarBg(d.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {initials(d.name)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{d.email}</div>
                  </div>
                </div>

                {/* Specialty */}
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {d.specialty ? (
                    <span style={{ display: "inline-block", background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, border: "1px solid #bfdbfe" }}>
                      {d.specialty}
                    </span>
                  ) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                </div>

                {/* License number */}
                <div style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace" }}>
                  {d.licenseNumber ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                </div>

                {/* Prescription count */}
                <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>
                  {d._count.prescriptions}
                </div>

                {/* Registered */}
                <div style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{fmtDate(d.createdAt)}</div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => openEdit(d)} title="Edit"
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e8edf4", background: "var(--card-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#a5b4fc"; e.currentTarget.style.color = "#6366f1"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8edf4"; e.currentTarget.style.color = "var(--text-muted)"; }}
                  ><EditIcon /></button>
                  <button onClick={() => setDeleteTarget(d)} title="Remove"
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e8edf4", background: "var(--card-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8edf4"; e.currentTarget.style.color = "var(--text-muted)"; }}
                  ><TrashIcon /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer
        open={drawerOpen}
        title={isEdit ? "Edit Doctor" : "Register New Doctor"}
        subtitle={isEdit ? `Editing ${editTarget?.name}` : "Add a doctor to the clinic roster."}
        onClose={closeDrawer} onSubmit={handleSubmit}
        form={form} setForm={setForm}
        isEdit={isEdit} isPending={isPending} error={formError}
      />

      {deleteTarget && (
        <DeleteDialog doctor={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isPending={isPending} />
      )}

      <Snackbar snack={snack} onDismiss={dismiss} />
    </div>
  );
}
