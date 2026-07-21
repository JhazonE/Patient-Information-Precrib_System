"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createMedicine, updateMedicine, deleteMedicine } from "@/application/actions/inventoryActions";
import { PackageIcon, PlusIcon, SearchIcon, EditIcon, TrashIcon, AlertIcon, PillIcon } from "@/presentation/components/icons";

const FORMULATIONS = ["Tablet", "Capsule", "Syrup", "Suspension", "Injection", "Cream", "Ointment", "Drops", "Inhaler", "Patch", "Suppository", "Solution"];
const CATEGORIES = ["Antibiotic", "Analgesic", "Antipyretic", "Antihypertensive", "Antidiabetic", "Antihistamine", "Antacid", "Antifungal", "Antiviral", "Vitamin/Supplement", "Cardiovascular", "Respiratory", "GI", "Neurological", "Other"];
const UNITS = ["tablet", "capsule", "ml", "vial", "sachet", "patch", "ampoule", "tube", "bottle"];

type Medicine = {
  id: string; name: string; genericName: string | null; formulation: string;
  strength: string; unit: string; category: string | null; stock: number;
  reorderLevel: number; price: number | null; supplier: string | null;
  expiryDate: Date | null; batchNumber: string | null; description: string | null;
};

function StockBadge({ stock, reorderLevel }: { stock: number; reorderLevel: number }) {
  if (stock === 0) return (
    <span style={{ padding: "3px 10px", borderRadius: "99px", background: "#fee2e2", color: "#dc2626", fontSize: "11.5px", fontWeight: 700 }}>Out of Stock</span>
  );
  if (stock <= reorderLevel) return (
    <span style={{ padding: "3px 10px", borderRadius: "99px", background: "#fef3c7", color: "#d97706", fontSize: "11.5px", fontWeight: 700 }}>{stock} — Low</span>
  );
  return (
    <span style={{ padding: "3px 10px", borderRadius: "99px", background: "#dcfce7", color: "#16a34a", fontSize: "11.5px", fontWeight: 700 }}>{stock}</span>
  );
}

function MedicineDrawer({
  open, onClose, editing, onSuccess,
}: {
  open: boolean; onClose: () => void; editing: Medicine | null; onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) await updateMedicine(editing.id, fd);
      else await createMedicine(fd);
      onSuccess();
      onClose();
    });
  }

  const field = (label: string, name: string, opts: { type?: string; required?: boolean; defaultValue?: string | number; placeholder?: string }) => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>{label}{opts.required && " *"}</label>
      <input
        name={name} type={opts.type ?? "text"} required={opts.required}
        defaultValue={opts.defaultValue ?? ""}
        placeholder={opts.placeholder}
        step={opts.type === "number" ? "any" : undefined}
        style={{ width: "100%", height: "40px", borderRadius: "9px", border: "1px solid #e2e8f0", padding: "0 14px", fontSize: "13.5px", color: "#1e293b", outline: "none", boxSizing: "border-box" }}
        onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
      />
    </div>
  );

  const select = (label: string, name: string, options: string[], required = false, def = "") => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>{label}{required && " *"}</label>
      <select name={name} required={required} defaultValue={def}
        style={{ width: "100%", height: "40px", borderRadius: "9px", border: "1px solid #e2e8f0", padding: "0 14px", fontSize: "13.5px", color: "#1e293b", outline: "none", background: "#fff", boxSizing: "border-box" }}>
        {!required && <option value="">— Select —</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <motion.div
        key="inv-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, backdropFilter: "blur(2px)" }}
      />
      <motion.div
        key="inv-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "520px", background: "#fff",
          zIndex: 51, overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
          padding: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1e293b" }}>
            {editing ? "Edit Medicine" : "Add Medicine"}
          </h2>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "22px", cursor: "pointer", color: "#94a3b8", padding: "4px 8px", borderRadius: "6px" }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <div style={{ gridColumn: "1/-1" }}>{field("Brand / Trade Name", "name", { required: true, defaultValue: editing?.name, placeholder: "e.g. Amoxicillin 500mg" })}</div>
            <div style={{ gridColumn: "1/-1" }}>{field("Generic Name", "genericName", { defaultValue: editing?.genericName ?? "", placeholder: "e.g. Amoxicillin Trihydrate" })}</div>
            {select("Formulation", "formulation", FORMULATIONS, true, editing?.formulation ?? "")}
            {field("Strength", "strength", { required: true, defaultValue: editing?.strength, placeholder: "e.g. 500mg" })}
            {select("Unit", "unit", UNITS, true, editing?.unit ?? "")}
            {select("Category", "category", CATEGORIES, false, editing?.category ?? "")}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e8edf4", margin: "8px 0 20px" }} />
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 16px" }}>Stock & Pricing</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            {field("Current Stock", "stock", { type: "number", required: true, defaultValue: editing?.stock ?? 0 })}
            {field("Reorder Level", "reorderLevel", { type: "number", defaultValue: editing?.reorderLevel ?? 10 })}
            {field("Price (₱)", "price", { type: "number", defaultValue: editing?.price ?? "", placeholder: "0.00" })}
            {field("Batch Number", "batchNumber", { defaultValue: editing?.batchNumber ?? "" })}
            {field("Expiry Date", "expiryDate", { type: "date", defaultValue: editing?.expiryDate ? new Date(editing.expiryDate).toISOString().split("T")[0] : "" })}
            {field("Supplier", "supplier", { defaultValue: editing?.supplier ?? "" })}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>Description / Notes</label>
            <textarea name="description" rows={3} defaultValue={editing?.description ?? ""}
              style={{ width: "100%", borderRadius: "9px", border: "1px solid #e2e8f0", padding: "10px 14px", fontSize: "13.5px", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, height: "42px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              style={{ flex: 2, height: "42px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "14px", opacity: isPending ? 0.7 : 1 }}>
              {isPending ? "Saving…" : editing ? "Save Changes" : "Add Medicine"}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

export default function InventoryClient({
  medicines, stats, initialSearch,
}: {
  medicines: Medicine[];
  stats: { total: number; lowStock: number; outOfStock: number };
  initialSearch: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [, startTransition] = useTransition();

  const filtered = medicines.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.genericName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (m.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() { setEditing(null); setDrawerOpen(true); }
  function openEdit(m: Medicine) { setEditing(m); setDrawerOpen(true); }

  function handleDelete(id: string) {
    if (!confirm("Remove this medicine from inventory?")) return;
    startTransition(() => deleteMedicine(id));
  }

  const statCards = [
    { label: "Total Medicines", value: stats.total, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Low Stock", value: stats.lowStock, color: "#d97706", bg: "#fffbeb" },
    { label: "Out of Stock", value: stats.outOfStock, color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Inventory</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "var(--text-muted)" }}>Manage medicines, formulations, and stock levels</p>
        </div>
        <button onClick={openAdd} style={{
          display: "flex", alignItems: "center", gap: "8px", padding: "11px 20px",
          borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
          color: "#fff", fontWeight: 700, fontSize: "13.5px", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
        }}>
          <PlusIcon width={16} height={16} /> Add Medicine
        </button>
      </div>

      {/* Stat cards */}
      <div className="animate-fade-up-delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: "var(--card-bg)", borderRadius: "14px", padding: "20px 24px", boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
              <PackageIcon width={22} height={22} />
            </div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="animate-fade-up-delay-2" style={{ position: "relative", marginBottom: "20px", maxWidth: "360px" }}>
        <div style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
          <SearchIcon style={{ width: "15px", height: "15px" }} />
        </div>
        <input
          type="text" placeholder="Search medicines…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", height: "40px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 14px 0 38px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Table */}
      <div className="animate-fade-up-delay-3" style={{ background: "var(--card-bg)", borderRadius: "16px", boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center", color: "var(--text-muted)" }}>
            <PillIcon width={40} height={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
            <p style={{ fontWeight: 600, marginBottom: "6px" }}>No medicines found</p>
            <p style={{ fontSize: "13px" }}>Add your first medicine to get started.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e8edf4", background: "#f8fafc" }}>
                {["Medicine", "Formulation", "Strength", "Category", "Stock", "Price", "Expiry", ""].map(h => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f8fafc"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text-primary)" }}>{m.name}</div>
                    {m.genericName && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{m.genericName}</div>}
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: "13px", color: "var(--text-secondary)" }}>{m.formulation}</td>
                  <td style={{ padding: "14px 18px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>{m.strength}</td>
                  <td style={{ padding: "14px 18px" }}>
                    {m.category && (
                      <span style={{ padding: "3px 10px", borderRadius: "6px", background: "#eff6ff", color: "#3b82f6", fontSize: "12px", fontWeight: 600 }}>{m.category}</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <StockBadge stock={m.stock} reorderLevel={m.reorderLevel} />
                      {m.stock <= m.reorderLevel && m.stock > 0 && (
                        <AlertIcon width={14} height={14} style={{ color: "#d97706" }} />
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                    {m.price != null ? `₱${m.price.toFixed(2)}` : "—"}
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: "12.5px", color: m.expiryDate && new Date(m.expiryDate) < new Date() ? "#dc2626" : "var(--text-muted)" }}>
                    {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => openEdit(m)} title="Edit"
                        style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <EditIcon width={14} height={14} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} title="Remove"
                        style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TrashIcon width={14} height={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence mode="wait">
        {drawerOpen && (
          <MedicineDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editing={editing} onSuccess={() => {}} />
        )}
      </AnimatePresence>
    </div>
  );
}
