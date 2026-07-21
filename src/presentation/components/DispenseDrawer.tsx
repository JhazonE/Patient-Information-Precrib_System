"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dispense } from "@/application/actions/dispensingActions";
import { searchMedicines } from "@/application/actions/inventoryActions";
import { PillIcon } from "@/presentation/components/icons";

type Medication = {
  name: string; dosage?: string; medicineId?: string;
  formulation?: string; strength?: string; unit?: string;
};

type MedSuggestion = {
  id: string; name: string; genericName: string | null;
  formulation: string; strength: string; unit: string;
  stock: number; reorderLevel: number;
};

type DispenseRow = {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unit: string;
  stock: number;
};

function MiniSearch({ onSelect }: { onSelect: (m: MedSuggestion) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MedSuggestion[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.trim().length < 1) { setResults([]); return; }
    timerRef.current = setTimeout(() => {
      searchMedicines(q).then((r) => setResults(r as MedSuggestion[]));
    }, 250);
  }

  return (
    <div style={{ position: "relative" }}>
      <input value={query} onChange={handleChange} placeholder="Search inventory to add…"
        style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px dashed #cbd5e1", background: "#f8fafc", padding: "0 12px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
      />
      {results.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200, maxHeight: "200px", overflowY: "auto" }}>
          {results.map(r => (
            <div key={r.id} onMouseDown={() => { onSelect(r); setQuery(""); setResults([]); }}
              style={{ padding: "8px 14px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f8fafc" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f0f9ff"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <div>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>{r.name}</div>
                <div style={{ fontSize: "11.5px", color: "#64748b" }}>{r.formulation} · {r.strength}</div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 7px", borderRadius: "99px", flexShrink: 0,
                background: r.stock === 0 ? "#fee2e2" : r.stock <= r.reorderLevel ? "#fef3c7" : "#dcfce7",
                color: r.stock === 0 ? "#dc2626" : r.stock <= r.reorderLevel ? "#d97706" : "#16a34a" }}>
                {r.stock === 0 ? "Out" : `${r.stock} ${r.unit}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DispenseDrawer({
  open, onClose, prescriptionId, medications, onDone,
}: {
  open: boolean;
  onClose: () => void;
  prescriptionId: string;
  medications: Medication[];
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [dispensedBy, setDispensedBy] = useState("");
  const [notes, setNotes] = useState("");

  // Pre-populate rows from prescription medications that have a medicineId
  const [rows, setRows] = useState<DispenseRow[]>(() =>
    medications
      .filter(m => m.medicineId)
      .map(m => ({
        medicineId: m.medicineId!,
        medicineName: m.name,
        quantity: 1,
        unit: m.unit ?? "tablet",
        stock: 0,
      }))
  );

  function addFromInventory(med: MedSuggestion) {
    if (rows.some(r => r.medicineId === med.id)) return;
    setRows(prev => [...prev, { medicineId: med.id, medicineName: med.name, quantity: 1, unit: med.unit, stock: med.stock }]);
  }

  function removeRow(id: string) {
    setRows(prev => prev.filter(r => r.medicineId !== id));
  }

  function setQty(id: string, qty: number) {
    setRows(prev => prev.map(r => r.medicineId === id ? { ...r, quantity: Math.max(0, qty) } : r));
  }

  function handleDispense() {
    setError("");
    const items = rows.filter(r => r.quantity > 0).map(r => ({ medicineId: r.medicineId, quantity: r.quantity, unit: r.unit }));
    if (items.length === 0) { setError("Add at least one medicine with quantity > 0."); return; }
    startTransition(async () => {
      const res = await dispense({ prescriptionId, dispensedBy, notes, items });
      if (res.error) { setError(res.error); return; }
      onDone();
      onClose();
    });
  }

  const inputStyle = { width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "0 12px", fontSize: "13px", outline: "none", boxSizing: "border-box" as const, background: "#f8fafc" };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          <motion.div key="disp-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, backdropFilter: "blur(2px)" }} />
          <motion.div key="disp-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }}
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "500px", background: "#fff", zIndex: 51, overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1e293b" }}>Dispense Medicines</h2>
                <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b" }}>Confirm quantities — stock will be deducted on save.</p>
              </div>
              <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "22px", cursor: "pointer", color: "#94a3b8", padding: "4px 8px", borderRadius: "6px" }}>×</button>
            </div>

            {/* Medicine rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px" }}>Medicines to Dispense</div>

              {rows.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", border: "1px dashed #e2e8f0", borderRadius: "10px", color: "#94a3b8", fontSize: "13px" }}>
                  No medicines linked. Search inventory below to add.
                </div>
              ) : (
                rows.map(row => (
                  <div key={row.medicineId} style={{ display: "grid", gridTemplateColumns: "1fr 90px 36px", gap: "8px", alignItems: "center", padding: "12px 14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e8edf4" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#1e293b" }}>{row.medicineName}</div>
                      <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>Unit: {row.unit}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Qty</div>
                      <input type="number" min="0" value={row.quantity} onChange={e => setQty(row.medicineId, parseInt(e.target.value) || 0)}
                        style={{ ...inputStyle, textAlign: "center", fontWeight: 700 }} />
                    </div>
                    <button type="button" onClick={() => removeRow(row.medicineId)}
                      style={{ height: "36px", width: "36px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", alignSelf: "flex-end" }}>
                      ×
                    </button>
                  </div>
                ))
              )}

              {/* Search to add more */}
              <MiniSearch onSelect={addFromInventory} />
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e8edf4", margin: 0 }} />

            {/* Dispensed by + notes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>Dispensed By</label>
                <input value={dispensedBy} onChange={e => setDispensedBy(e.target.value)} placeholder="Pharmacist name"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional remarks…"
                  style={{ ...inputStyle, height: "auto", padding: "8px 12px", resize: "vertical" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", fontWeight: 600 }}>{error}</div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "8px" }}>
              <button type="button" onClick={onClose}
                style={{ flex: 1, height: "44px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={handleDispense} disabled={isPending}
                style={{ flex: 2, height: "44px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: isPending ? 0.7 : 1 }}>
                {isPending ? "Dispensing…" : "Confirm & Dispense"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
