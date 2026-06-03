"use client";

import React, { useState, useTransition } from "react";
import type { UserRow } from "@/application/actions/userActions";
import {
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "@/application/actions/userActions";
import { useSnackbar, Snackbar } from "@/presentation/components/Snackbar";

/* ── helpers ────────────────────────────────────────────────── */
const ROLE_META = {
  ADMIN:  { label: "Admin",  bg: "#fef2f2", color: "#dc2626" },
  DOCTOR: { label: "Doctor", bg: "#eff6ff", color: "#2563eb" },
  STAFF:  { label: "Staff",  bg: "#f5f3ff", color: "#7c3aed" },
} as const;

const AVATAR_COLORS = [
  "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  "linear-gradient(135deg,#10b981,#047857)",
  "linear-gradient(135deg,#f59e0b,#b45309)",
  "linear-gradient(135deg,#ef4444,#b91c1c)",
  "linear-gradient(135deg,#06b6d4,#0e7490)",
];
const avatarBg  = (id: string) => AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
const initials  = (name: string) => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const fmtDate   = (d: Date) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

type Role = "ADMIN" | "DOCTOR" | "STAFF";
interface FormState { name: string; username: string; email: string; password: string; role: Role }
const EMPTY: FormState = { name: "", username: "", email: "", password: "", role: "STAFF" };

/* ── icons ──────────────────────────────────────────────────── */
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
const EyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ── input field ────────────────────────────────────────────── */
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

/* ── slide drawer ───────────────────────────────────────────── */
function Drawer({
  open, title, subtitle, onClose, onSubmit, form, setForm, isEdit, isPending, error,
}: {
  open: boolean; title: string; subtitle: string;
  onClose: () => void; onSubmit: (f: FormState) => void;
  form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>;
  isEdit: boolean; isPending: boolean; error: string;
}) {
  const [showPw, setShowPw] = useState(false);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes drawerIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .drawer-input:focus { border-color: #6366f1 !important; background: #fff !important; }
        .drawer-select:focus { border-color: #6366f1 !important; background: #fff !important; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(15,23,42,0.35)", backdropFilter: "blur(2px)",
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 51,
        width: 420, background: "#fff",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        animation: "drawerIn 0.28s cubic-bezier(.4,0,.2,1)",
      }}>

        {/* Drawer header */}
        <div style={{
          padding: "24px 28px 20px", borderBottom: "1px solid #f3f4f6",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>{title}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>{subtitle}</p>
          </div>
          <button
            onClick={onClose} type="button"
            style={{
              width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e5e7eb",
              background: "#fff", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#6b7280",
              flexShrink: 0,
            }}
          ><CloseIcon /></button>
        </div>

        {/* Drawer body */}
        <form
          onSubmit={e => { e.preventDefault(); onSubmit(form); }}
          style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}
        >
          <Field label="Full Name">
            <input className="drawer-input" style={inputStyle} name="name" value={form.name}
              onChange={set("name")} placeholder="e.g. Dr. Juan dela Cruz" required />
          </Field>

          <Field label="Username">
            <input className="drawer-input" style={inputStyle} name="username" value={form.username}
              onChange={set("username")} placeholder="e.g. jdelacruz" autoComplete="off" required />
          </Field>

          <Field label="Email Address" optional>
            <input className="drawer-input" style={inputStyle} name="email" type="email" value={form.email}
              onChange={set("email")} placeholder="e.g. juan@clinic.com" autoComplete="off" />
          </Field>

          <Field label={isEdit ? "New Password" : "Password"}>
            <div style={{ position: "relative" }}>
              <input
                className="drawer-input"
                style={{ ...inputStyle, paddingRight: 44 }}
                name="password" type={showPw ? "text" : "password"}
                value={form.password} onChange={set("password")}
                placeholder={isEdit ? "Leave blank to keep current" : "Min. 8 characters"}
                required={!isEdit} autoComplete="new-password"
              />
              <button
                type="button" onClick={() => setShowPw(s => !s)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
                  display: "flex", alignItems: "center", padding: 0,
                }}
              >{showPw ? <EyeOpen /> : <EyeClosed />}</button>
            </div>
          </Field>

          <Field label="Role">
            <select
              className="drawer-select"
              style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
              name="role" value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
            >
              <option value="STAFF">Staff — General access</option>
              <option value="DOCTOR">Doctor — Clinical access</option>
              <option value="ADMIN">Admin — Full system access</option>
            </select>
          </Field>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 9, padding: "10px 14px",
              fontSize: 13, color: "#dc2626", fontWeight: 500,
            }}>{error}</div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Submit */}
          <button
            type="submit" disabled={isPending}
            style={{
              height: 46, borderRadius: 10, border: "none",
              background: isPending ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#4f46e5)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              flexShrink: 0, marginTop: 8,
            }}
          >
            {isPending && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            )}
            {isEdit ? "Save Changes" : "Create User"}
          </button>
        </form>
      </div>
    </>
  );
}

/* ── delete confirm ─────────────────────────────────────────── */
function DeleteDialog({
  user, onClose, onConfirm, isPending,
}: { user: UserRow; onClose: () => void; onConfirm: () => void; isPending: boolean }) {
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(15,23,42,0.35)", backdropFilter:"blur(2px)" }} />
      <div style={{
        position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:51,
        background:"#fff", borderRadius:20, width:"100%", maxWidth:380,
        boxShadow:"0 25px 50px rgba(0,0,0,0.15)", padding:"32px 28px", textAlign:"center",
      }}>
        <div style={{ width:52, height:52, borderRadius:14, background:"#fef2f2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"#dc2626" }}>
          <TrashIcon />
        </div>
        <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:800, color:"#111827" }}>Delete User?</h3>
        <p style={{ margin:"0 0 24px", fontSize:13.5, color:"#6b7280", lineHeight:1.6 }}>
          This will permanently remove <strong style={{ color:"#111827" }}>{user.name}</strong> from the system.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={onClose} style={{ padding:"10px 24px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending} style={{ padding:"10px 24px", borderRadius:9, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:700, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
            {isPending ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── stat icons ─────────────────────────────────────────────── */
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconStethoscope = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
    <circle cx="20" cy="10" r="2"/>
  </svg>
);

/* ── main panel ─────────────────────────────────────────────── */
export default function UsersPanel({ users }: { users: UserRow[] }) {
  const { showSnack, dismiss, snack }    = useSnackbar();
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [isEdit, setIsEdit]             = useState(false);
  const [editTarget, setEditTarget]     = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [form, setForm]                 = useState<FormState>(EMPTY);
  const [formError, setFormError]       = useState("");
  const [isPending, startTransition]    = useTransition();

  const openCreate = () => {
    setForm(EMPTY); setFormError(""); setIsEdit(false); setEditTarget(null); setDrawerOpen(true);
  };
  const openEdit = (u: UserRow) => {
    setForm({ name: u.name, username: u.username, email: u.email ?? "", password: "", role: u.role });
    setFormError(""); setIsEdit(true); setEditTarget(u); setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setFormError(""); };

  const handleSubmit = (f: FormState) => {
    setFormError("");
    startTransition(async () => {
      const payload = { name: f.name.trim(), username: f.username.trim(), email: f.email.trim() || undefined, password: f.password, role: f.role };
      const res = isEdit
        ? await updateUser(editTarget!.id, payload)
        : await createUser(payload);
      if (res.error) { setFormError(res.error); return; }
      closeDrawer();
      showSnack(isEdit ? "User updated successfully." : "User account created.", "success");
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    startTransition(async () => {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      showSnack(`${name} has been removed.`, "success");
    });
  };

  const handleToggle = (u: UserRow) => {
    const next = !u.isActive;
    startTransition(async () => {
      await toggleUserStatus(u.id, next);
      showSnack(next ? `${u.name} activated.` : `${u.name} deactivated.`, "info");
    });
  };

  const total   = users.length;
  const active  = users.filter(u => u.isActive).length;
  const admins  = users.filter(u => u.role === "ADMIN").length;
  const doctors = users.filter(u => u.role === "DOCTOR").length;

  const stats = [
    { label: "Total Users",  value: total,   sub: "Registered accounts",    accent: "#6366f1", icon: <IconUsers /> },
    { label: "Active",       value: active,  sub: "Currently active",       accent: "#10b981", icon: <IconCheck /> },
    { label: "Admins",       value: admins,  sub: "Full system access",     accent: "#dc2626", icon: <IconShield /> },
    { label: "Doctors",      value: doctors, sub: "Clinical access level",  accent: "#2563eb", icon: <IconStethoscope /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ── Page header ── */}
      <div className="animate-fade-up" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.4px" }}>
            User <span style={{ color: "var(--accent)" }}>Accounts</span>
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: "13.5px", color: "var(--text-secondary)" }}>
            Manage staff login accounts and access roles.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#6366f1,#4f46e5)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", flexShrink: 0,
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            transition: "opacity 0.2s, transform 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <PlusIcon /> Add New User
        </button>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="animate-fade-up"
            style={{
              animationDelay: `${i * 80}ms`,
              background: "var(--card-bg)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "var(--card-shadow)",
              border: "1px solid #e8edf4",
              transition: "box-shadow 0.25s ease, transform 0.25s ease",
              cursor: "default",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow-hover)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {s.label}
              </span>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `${s.accent}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: s.accent,
              }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ marginTop: "8px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Users table ── */}
      <div className="animate-fade-up-delay-2" style={{
        background: "var(--card-bg)",
        borderRadius: "16px",
        boxShadow: "var(--card-shadow)",
        border: "1px solid #e8edf4",
        overflow: "hidden",
      }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e8edf4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
            {total} {total === 1 ? "account" : "accounts"} registered
          </p>
        </div>

        {users.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px", color: "var(--text-muted)",
            }}>
              <IconUsers />
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>No user accounts yet</p>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-secondary)" }}>Click &ldquo;Add New User&rdquo; to create the first account.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e8edf4" }}>
                {["User", "Role", "Status", "Joined", "Last Login", ""].map(h => (
                  <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.8px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const rm = ROLE_META[u.role];
                return (
                  <tr
                    key={u.id}
                    style={{ borderBottom: i < users.length - 1 ? "1px solid #f3f6fb" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--content-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* User */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarBg(u.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontFamily: "monospace" }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ display: "inline-block", background: rm.bg, color: rm.color, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99, border: `1px solid ${rm.color}30` }}>
                        {rm.label}
                      </span>
                    </td>
                    {/* Status toggle */}
                    <td style={{ padding: "14px 20px" }}>
                      <button
                        onClick={() => handleToggle(u)} disabled={isPending} title={u.isActive ? "Click to deactivate" : "Click to activate"}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: u.isActive ? "#ecfdf5" : "var(--content-bg)", color: u.isActive ? "#059669" : "var(--text-muted)", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99, border: `1px solid ${u.isActive ? "#6ee7b7" : "#e8edf4"}`, cursor: "pointer" }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: u.isActive ? "#10b981" : "#d1d5db", display: "inline-block" }} />
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    {/* Joined */}
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{fmtDate(u.createdAt)}</td>
                    {/* Last login */}
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {u.lastLoginAt ? fmtDate(u.lastLoginAt) : <span style={{ color: "var(--text-muted)" }}>Never</span>}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => openEdit(u)} title="Edit"
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            border: "1px solid #e8edf4", background: "var(--card-bg)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--text-muted)", cursor: "pointer",
                            transition: "border-color 0.15s, color 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#a5b4fc"; e.currentTarget.style.color = "#6366f1"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8edf4"; e.currentTarget.style.color = "var(--text-muted)"; }}
                        ><EditIcon /></button>
                        <button
                          onClick={() => setDeleteTarget(u)} title="Delete"
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            border: "1px solid #e8edf4", background: "var(--card-bg)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--text-muted)", cursor: "pointer",
                            transition: "border-color 0.15s, color 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = "#ef4444"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8edf4"; e.currentTarget.style.color = "var(--text-muted)"; }}
                        ><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Slide drawer ── */}
      <Drawer
        open={drawerOpen}
        title={isEdit ? "Edit User" : "New User Account"}
        subtitle={isEdit ? `Editing ${editTarget?.name}` : "Fill in the details below to create a new account."}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        form={form} setForm={setForm}
        isEdit={isEdit} isPending={isPending} error={formError}
      />

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <DeleteDialog user={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isPending={isPending} />
      )}

      <Snackbar snack={snack} onDismiss={dismiss} />
    </div>
  );
}
