"use client";

import React, { useState, useTransition } from "react";
import type { UserRow } from "@/application/actions/userActions";
import {
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "@/application/actions/userActions";

/* ── helpers ─────────────────────────────────────── */
const ROLE_META = {
  ADMIN:  { label: "Admin",  bg: "#fef2f2", color: "#dc2626", dot: "#dc2626" },
  DOCTOR: { label: "Doctor", bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" },
  STAFF:  { label: "Staff",  bg: "#f5f3ff", color: "#7c3aed", dot: "#8b5cf6" },
} as const;

const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const AVATAR_COLORS = [
  "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  "linear-gradient(135deg,#10b981,#047857)",
  "linear-gradient(135deg,#f59e0b,#b45309)",
  "linear-gradient(135deg,#ef4444,#b91c1c)",
  "linear-gradient(135deg,#06b6d4,#0e7490)",
];
const avatarColor = (id: string) =>
  AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];

/* ── icons ───────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ── types ───────────────────────────────────────── */
type ModalMode = "create" | "edit" | null;
type Role = "ADMIN" | "DOCTOR" | "STAFF";
interface FormState { name: string; username: string; email: string; password: string; role: Role }
const DEFAULT_FORM: FormState = { name: "", username: "", email: "", password: "", role: "STAFF" };

/* ── form field ──────────────────────────────────── */
function Field({
  label, name, type = "text", value, onChange, placeholder, required, optional,
  children,
}: {
  label: string; name: string; type?: string; value?: string; onChange?: (v: string) => void;
  placeholder?: string; required?: boolean; optional?: boolean; children?: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display:"flex", gap:4, fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>
        {label}
        {optional && <span style={{ color:"#9ca3af", fontWeight:400 }}>(optional)</span>}
      </label>
      {children ?? (
        <input
          name={name} type={type} value={value} required={required}
          placeholder={placeholder} autoComplete="off"
          onChange={e => onChange?.(e.target.value)}
          style={{
            width:"100%", height:42, borderRadius:8, border:"1.5px solid #e5e7eb",
            padding:"0 12px", fontSize:14, color:"#111827", background:"#fff",
            outline:"none", boxSizing:"border-box",
          }}
          onFocus={e => (e.target.style.borderColor = "#6366f1")}
          onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
        />
      )}
    </div>
  );
}

/* ── user form modal ─────────────────────────────── */
function UserModal({
  mode, initial, onClose, isPending, onSubmit, error,
}: {
  mode: ModalMode; initial?: FormState;
  onClose: () => void; isPending: boolean;
  onSubmit: (f: FormState) => void; error: string;
}) {
  const [form, setForm] = useState<FormState>(initial ?? DEFAULT_FORM);
  const [showPw, setShowPw] = useState(false);
  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background:"#fff", borderRadius:20, width:"100%", maxWidth:480,
        boxShadow:"0 25px 60px rgba(0,0,0,0.2)", overflow:"hidden",
      }}>
        {/* Modal header */}
        <div style={{
          padding:"24px 28px 20px", borderBottom:"1px solid #f3f4f6",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div>
            <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"#111827" }}>
              {mode === "create" ? "Create New User" : "Edit User"}
            </h2>
            <p style={{ margin:"4px 0 0", fontSize:13, color:"#6b7280" }}>
              {mode === "create" ? "Add a new staff member to the system." : "Update this user's information."}
            </p>
          </div>
          <button
            onClick={onClose} type="button"
            style={{
              width:32, height:32, borderRadius:"50%", border:"none",
              background:"#f3f4f6", cursor:"pointer", display:"flex",
              alignItems:"center", justifyContent:"center", color:"#6b7280",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding:"24px 28px" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Field label="Full Name" name="name" value={form.name} onChange={set("name")} placeholder="e.g. Dr. Juan dela Cruz" required />
            <Field label="Username" name="username" value={form.username} onChange={set("username")} placeholder="e.g. jdelacruz" required />
            <Field label="Email Address" name="email" type="email" value={form.email} onChange={set("email")} placeholder="e.g. juan@clinic.com" optional />

            {/* Password field with toggle */}
            <div>
              <label style={{ display:"flex", gap:4, fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>
                Password
                {mode === "edit" && <span style={{ color:"#9ca3af", fontWeight:400 }}>(leave blank to keep current)</span>}
              </label>
              <div style={{ position:"relative" }}>
                <input
                  name="password" type={showPw ? "text" : "password"} value={form.password}
                  required={mode === "create"} placeholder={mode === "edit" ? "••••••••" : "Min. 8 characters"}
                  autoComplete="new-password"
                  onChange={e => set("password")(e.target.value)}
                  style={{
                    width:"100%", height:42, borderRadius:8, border:"1.5px solid #e5e7eb",
                    padding:"0 44px 0 12px", fontSize:14, color:"#111827",
                    background:"#fff", outline:"none", boxSizing:"border-box",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#6366f1")}
                  onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button
                  type="button" onClick={() => setShowPw(s => !s)}
                  style={{
                    position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer", color:"#9ca3af",
                    display:"flex", alignItems:"center",
                  }}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* Role select */}
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Role</label>
              <select
                name="role" value={form.role} onChange={e => set("role")(e.target.value)}
                style={{
                  width:"100%", height:42, borderRadius:8, border:"1.5px solid #e5e7eb",
                  padding:"0 12px", fontSize:14, color:"#111827", background:"#fff",
                  outline:"none", cursor:"pointer", boxSizing:"border-box",
                }}
                onFocus={e => (e.target.style.borderColor = "#6366f1")}
                onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
              >
                <option value="STAFF">Staff — General access</option>
                <option value="DOCTOR">Doctor — Clinical access</option>
                <option value="ADMIN">Admin — Full access</option>
              </select>
            </div>

            {error && (
              <div style={{
                background:"#fef2f2", border:"1px solid #fecaca",
                borderRadius:8, padding:"10px 14px",
                fontSize:13, color:"#dc2626", fontWeight:500,
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:24 }}>
            <button
              type="button" onClick={onClose} disabled={isPending}
              style={{
                padding:"10px 20px", borderRadius:9, border:"1.5px solid #e5e7eb",
                background:"#fff", fontSize:13, fontWeight:600, color:"#374151",
                cursor:"pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isPending}
              style={{
                padding:"10px 24px", borderRadius:9, border:"none",
                background: isPending ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#4f46e5)",
                color:"#fff", fontSize:13, fontWeight:700, cursor: isPending ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", gap:7,
                boxShadow:"0 4px 12px rgba(99,102,241,0.35)",
              }}
            >
              {isPending && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation:"spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
              {mode === "create" ? "Create User" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── delete confirm modal ────────────────────────── */
function DeleteModal({
  user, onClose, onConfirm, isPending,
}: { user: UserRow; onClose: () => void; onConfirm: () => void; isPending: boolean }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background:"#fff", borderRadius:20, width:"100%", maxWidth:400,
        boxShadow:"0 25px 60px rgba(0,0,0,0.2)", padding:32, textAlign:"center",
      }}>
        <div style={{
          width:56, height:56, borderRadius:16, background:"#fef2f2",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 20px", color:"#dc2626",
        }}>
          <TrashIcon />
        </div>
        <h2 style={{ margin:"0 0 8px", fontSize:18, fontWeight:800, color:"#111827" }}>Delete User</h2>
        <p style={{ margin:"0 0 24px", fontSize:14, color:"#6b7280", lineHeight:1.6 }}>
          Are you sure you want to delete <strong style={{ color:"#111827" }}>{user.name}</strong>?
          This action cannot be undone.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button
            onClick={onClose} disabled={isPending}
            style={{
              padding:"10px 24px", borderRadius:9, border:"1.5px solid #e5e7eb",
              background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm} disabled={isPending}
            style={{
              padding:"10px 24px", borderRadius:9, border:"none",
              background:"#dc2626", color:"#fff", fontSize:13, fontWeight:700,
              cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Deleting…" : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── main panel ──────────────────────────────────── */
export default function UsersPanel({ users }: { users: UserRow[] }) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const openCreate = () => { setFormError(""); setEditTarget(null); setModalMode("create"); };
  const openEdit = (u: UserRow) => { setFormError(""); setEditTarget(u); setModalMode("edit"); };
  const closeModal = () => { setModalMode(null); setEditTarget(null); setFormError(""); };

  const handleFormSubmit = (form: FormState) => {
    setFormError("");
    startTransition(async () => {
      const payload = {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
        role: form.role,
      };
      const res = modalMode === "create"
        ? await createUser(payload)
        : await updateUser(editTarget!.id, payload);

      if (res.error) { setFormError(res.error); return; }
      closeModal();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
    });
  };

  const handleToggle = (u: UserRow) => {
    startTransition(async () => { await toggleUserStatus(u.id, !u.isActive); });
  };

  // stats
  const total   = users.length;
  const active  = users.filter(u => u.isActive).length;
  const admins  = users.filter(u => u.role === "ADMIN").length;
  const doctors = users.filter(u => u.role === "DOCTOR").length;
  const staff   = users.filter(u => u.role === "STAFF").length;

  const statCards = [
    { label: "Total Users",    value: total,   color: "#6366f1", bg: "#eef2ff" },
    { label: "Active",         value: active,  color: "#10b981", bg: "#ecfdf5" },
    { label: "Admins",         value: admins,  color: "#dc2626", bg: "#fef2f2" },
    { label: "Doctors",        value: doctors, color: "#2563eb", bg: "#eff6ff" },
    { label: "Staff",          value: staff,   color: "#7c3aed", bg: "#f5f3ff" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground">User Management</h1>
          <p className="text-zinc-500 mt-2 font-medium">Manage staff accounts and access permissions.</p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"11px 22px", borderRadius:12, border:"none",
            background:"linear-gradient(135deg,#6366f1,#4f46e5)",
            color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer",
            boxShadow:"0 4px 14px rgba(99,102,241,0.4)",
            flexShrink:0,
          }}
        >
          <PlusIcon />
          Add New User
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14 }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background:s.bg, borderRadius:16, padding:"18px 20px",
            border:`1px solid ${s.color}22`,
          }}>
            <div style={{ fontSize:28, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:12, color:"#6b7280", fontWeight:600, marginTop:5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background:"#fff", borderRadius:20, border:"1px solid #f3f4f6",
        boxShadow:"0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
        overflow:"hidden",
      }}>
        {users.length === 0 ? (
          <div style={{ padding:"64px 32px", textAlign:"center" }}>
            <div style={{
              width:64, height:64, borderRadius:20, background:"#f3f4f6",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 16px", fontSize:28,
            }}>👤</div>
            <p style={{ fontSize:15, fontWeight:700, color:"#374151", margin:"0 0 6px" }}>No users yet</p>
            <p style={{ fontSize:13, color:"#9ca3af", margin:0 }}>Click "Add New User" to create the first account.</p>
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #f3f4f6" }}>
                {["User", "Username", "Role", "Status", "Joined", "Last Login", "Actions"].map(h => (
                  <th key={h} style={{
                    padding:"14px 20px", textAlign:"left",
                    fontSize:11, fontWeight:700, color:"#9ca3af",
                    letterSpacing:"0.8px", textTransform:"uppercase",
                    whiteSpace:"nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const rm = ROLE_META[u.role];
                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: i < users.length - 1 ? "1px solid #f9fafb" : "none",
                      transition:"background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    {/* User */}
                    <td style={{ padding:"14px 20px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{
                          width:36, height:36, borderRadius:"50%", flexShrink:0,
                          background:avatarColor(u.id),
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:13, fontWeight:800, color:"#fff",
                        }}>{initials(u.name)}</div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:"#111827", lineHeight:1.2 }}>{u.name}</div>
                          {u.email && <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{u.email}</div>}
                        </div>
                      </div>
                    </td>
                    {/* Username */}
                    <td style={{ padding:"14px 20px" }}>
                      <span style={{
                        fontFamily:"monospace", fontSize:13, color:"#374151",
                        background:"#f3f4f6", padding:"3px 9px", borderRadius:6,
                      }}>@{u.username}</span>
                    </td>
                    {/* Role */}
                    <td style={{ padding:"14px 20px" }}>
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:6,
                        background:rm.bg, color:rm.color,
                        fontSize:12, fontWeight:700, padding:"4px 10px",
                        borderRadius:99, border:`1px solid ${rm.color}33`,
                      }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:rm.dot, display:"inline-block" }} />
                        {rm.label}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding:"14px 20px" }}>
                      <button
                        onClick={() => handleToggle(u)}
                        disabled={isPending}
                        title={u.isActive ? "Click to deactivate" : "Click to activate"}
                        style={{
                          display:"inline-flex", alignItems:"center", gap:6,
                          background: u.isActive ? "#ecfdf5" : "#f9fafb",
                          color: u.isActive ? "#059669" : "#9ca3af",
                          fontSize:12, fontWeight:700, padding:"4px 10px",
                          borderRadius:99, border:`1px solid ${u.isActive ? "#6ee7b7" : "#e5e7eb"}`,
                          cursor:"pointer",
                        }}
                      >
                        <span style={{ width:6, height:6, borderRadius:"50%", background: u.isActive ? "#10b981" : "#d1d5db", display:"inline-block" }} />
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    {/* Joined */}
                    <td style={{ padding:"14px 20px", fontSize:13, color:"#6b7280", whiteSpace:"nowrap" }}>
                      {fmtDate(u.createdAt)}
                    </td>
                    {/* Last Login */}
                    <td style={{ padding:"14px 20px", fontSize:13, color:"#6b7280", whiteSpace:"nowrap" }}>
                      {u.lastLoginAt ? fmtDate(u.lastLoginAt) : <span style={{ color:"#d1d5db" }}>Never</span>}
                    </td>
                    {/* Actions */}
                    <td style={{ padding:"14px 20px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button
                          onClick={() => openEdit(u)}
                          title="Edit user"
                          style={{
                            width:32, height:32, borderRadius:8, border:"1px solid #e5e7eb",
                            background:"#fff", cursor:"pointer", color:"#6b7280",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            transition:"all 0.15s",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#6366f1"; (e.currentTarget as HTMLElement).style.color="#6366f1"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="#e5e7eb"; (e.currentTarget as HTMLElement).style.color="#6b7280"; }}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          title="Delete user"
                          style={{
                            width:32, height:32, borderRadius:8, border:"1px solid #e5e7eb",
                            background:"#fff", cursor:"pointer", color:"#6b7280",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            transition:"all 0.15s",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#fca5a5"; (e.currentTarget as HTMLElement).style.color="#dc2626"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="#e5e7eb"; (e.currentTarget as HTMLElement).style.color="#6b7280"; }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {(modalMode === "create" || modalMode === "edit") && (
        <UserModal
          mode={modalMode}
          initial={editTarget ? {
            name: editTarget.name,
            username: editTarget.username,
            email: editTarget.email ?? "",
            password: "",
            role: editTarget.role,
          } : undefined}
          onClose={closeModal}
          isPending={isPending}
          onSubmit={handleFormSubmit}
          error={formError}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isPending={isPending}
        />
      )}
    </div>
  );
}
