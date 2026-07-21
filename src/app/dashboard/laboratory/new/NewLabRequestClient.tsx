"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createLabRequest, createLabTest } from "@/application/actions/laboratoryActions";
import { FlaskIcon, PlusIcon, SearchIcon } from "@/presentation/components/icons";
import Link from "next/link";

const LAB_CATEGORIES = ["Hematology", "Clinical Chemistry", "Urinalysis", "Microbiology", "Serology", "Immunology", "Histopathology", "Other"];

type Patient = { id: string; name: string; dateOfBirth: Date; gender: string };
type Doctor  = { id: string; name: string; specialty: string | null };
type LabTest = { id: string; name: string; code: string; category: string; normalRange: string | null; unit: string | null; price: number | null };

function AddTestModal({ onClose, onAdded }: { onClose: () => void; onAdded: (t: LabTest) => void }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createLabTest(fd);
      // optimistic new test object
      const newTest: LabTest = {
        id: Date.now().toString(),
        name: fd.get("name") as string,
        code: (fd.get("code") as string).toUpperCase(),
        category: fd.get("category") as string,
        normalRange: (fd.get("normalRange") as string) || null,
        unit: (fd.get("unit") as string) || null,
        price: fd.get("price") ? parseFloat(fd.get("price") as string) : null,
      };
      onAdded(newTest);
      onClose();
    });
  }

  const field = (label: string, name: string, placeholder = "", required = false) => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>{label}{required && " *"}</label>
      <input name={name} required={required} placeholder={placeholder}
        style={{ width: "100%", height: "40px", borderRadius: "9px", border: "1px solid #e2e8f0", padding: "0 14px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
        onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
      />
    </div>
  );

  return (
    <>
      <motion.div
        key="lab-test-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 60, backdropFilter: "blur(2px)" }}
      />
      <motion.div
        key="lab-test-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "440px",
          background: "#fff", zIndex: 61, overflowY: "auto",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", padding: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1e293b" }}>Add Lab Test to Catalog</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "22px", cursor: "pointer", color: "#94a3b8", padding: "4px 8px", borderRadius: "6px" }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {field("Test Name", "name", "e.g. Complete Blood Count", true)}
          {field("Test Code", "code", "e.g. CBC", true)}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>Category *</label>
            <select name="category" required style={{ width: "100%", height: "40px", borderRadius: "9px", border: "1px solid #e2e8f0", padding: "0 14px", fontSize: "13.5px", outline: "none", background: "#fff", boxSizing: "border-box" }}>
              {LAB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            {field("Normal Range", "normalRange", "e.g. 4.5–11.0")}
            {field("Unit", "unit", "e.g. 10³/µL")}
            {field("Price (₱)", "price", "0.00")}
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: "42px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>Cancel</button>
            <button type="submit" disabled={isPending} style={{ flex: 2, height: "42px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "14px", opacity: isPending ? 0.7 : 1 }}>
              {isPending ? "Adding…" : "Add Test"}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

export default function NewLabRequestClient({
  patients, doctors, labTests: initialTests,
}: {
  patients: Patient[]; doctors: Doctor[]; labTests: LabTest[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [labTests, setLabTests] = useState<LabTest[]>(initialTests);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testSearch, setTestSearch] = useState("");
  const [showAddTest, setShowAddTest] = useState(false);
  const [error, setError] = useState("");

  const byCategory = labTests
    .filter(t => !testSearch || t.name.toLowerCase().includes(testSearch.toLowerCase()) || t.code.toLowerCase().includes(testSearch.toLowerCase()) || t.category.toLowerCase().includes(testSearch.toLowerCase()))
    .reduce<Record<string, LabTest[]>>((acc, t) => {
      (acc[t.category] ??= []).push(t);
      return acc;
    }, {});

  function toggleTest(id: string) {
    setSelectedTests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedTests.length === 0) { setError("Please select at least one test."); return; }
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("testIds", selectedTests.join(","));
    startTransition(async () => {
      const id = await createLabRequest(fd);
      router.push(`/dashboard/laboratory/${id}`);
    });
  }

  const inputStyle = {
    width: "100%", height: "42px", borderRadius: "9px", border: "1px solid #e2e8f0",
    padding: "0 14px", fontSize: "13.5px", color: "#1e293b", outline: "none", boxSizing: "border-box" as const,
    background: "#fff",
  };
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div>
      <div className="animate-fade-up" style={{ marginBottom: "24px" }}>
        <Link href="/dashboard/laboratory" style={{ fontSize: "13.5px", color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          ← Back to Laboratory
        </Link>
      </div>

      <h1 className="animate-fade-up" style={{ margin: "0 0 28px", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>New Lab Request</h1>

      <form className="animate-fade-up-delay-1" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>

          {/* Left: patient / doctor / options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "var(--card-bg)", borderRadius: "14px", padding: "24px", boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Request Details</h3>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>Patient *</label>
                <select name="patientId" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="">— Select patient —</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.gender === "MALE" ? "M" : p.gender === "FEMALE" ? "F" : "O"}, {Math.floor((new Date().getTime() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} yrs)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>Requesting Doctor *</label>
                <select name="doctorId" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="">— Select doctor —</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}{d.specialty ? ` (${d.specialty})` : ""}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>Priority</label>
                <select name="priority" defaultValue="ROUTINE" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT (Immediate)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>Clinical Notes</label>
                <textarea name="notes" rows={3} placeholder="Clinical indication, symptoms, history…"
                  style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Selected tests summary */}
            {selectedTests.length > 0 && (
              <div style={{ background: "#f0f9ff", borderRadius: "14px", padding: "20px 24px", border: "1px solid #bae6fd" }}>
                <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: "#0284c7" }}>{selectedTests.length} test{selectedTests.length > 1 ? "s" : ""} selected</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedTests.map(id => {
                    const t = labTests.find(x => x.id === id);
                    return t ? (
                      <span key={id} style={{ padding: "4px 10px", borderRadius: "6px", background: "#e0f2fe", color: "#0284c7", fontSize: "12.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                        {t.code}
                        <button type="button" onClick={() => toggleTest(id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#0284c7", padding: 0, fontWeight: 800, fontSize: "14px", lineHeight: 1 }}>×</button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", fontWeight: 600 }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/dashboard/laboratory"
                style={{ flex: 1, height: "44px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Cancel
              </Link>
              <button type="submit" disabled={isPending}
                style={{ flex: 2, height: "44px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: isPending ? 0.7 : 1 }}>
                {isPending ? "Creating…" : "Create Lab Request"}
              </button>
            </div>
          </div>

          {/* Right: test catalog */}
          <div style={{ background: "var(--card-bg)", borderRadius: "14px", padding: "24px", boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Select Tests</h3>
              <button type="button" onClick={() => setShowAddTest(true)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", border: "1px dashed #0ea5e9", background: "#f0f9ff", color: "#0284c7", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}>
                <PlusIcon width={13} height={13} /> Add Test
              </button>
            </div>

            <div style={{ position: "relative", marginBottom: "16px" }}>
              <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                <SearchIcon style={{ width: "14px", height: "14px" }} />
              </div>
              <input type="text" placeholder="Search tests…" value={testSearch} onChange={e => setTestSearch(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 12px 0 34px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ maxHeight: "480px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {Object.entries(byCategory).map(([cat, tests]) => (
                <div key={cat}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{cat}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {tests.map(t => {
                      const selected = selectedTests.includes(t.id);
                      return (
                        <label key={t.id} style={{
                          display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "9px", cursor: "pointer",
                          background: selected ? "#e0f2fe" : "#f8fafc", border: `1px solid ${selected ? "#7dd3fc" : "#e8edf4"}`,
                          transition: "all 0.15s",
                        }}>
                          <input type="checkbox" checked={selected} onChange={() => toggleTest(t.id)} style={{ width: "16px", height: "16px", accentColor: "#0284c7", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontWeight: 700, fontSize: "13px", color: "#1e293b" }}>{t.name}</span>
                              <span style={{ padding: "1px 7px", borderRadius: "4px", background: "#dbeafe", color: "#2563eb", fontSize: "11px", fontWeight: 700 }}>{t.code}</span>
                            </div>
                            {(t.normalRange || t.unit) && (
                              <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                                {t.normalRange && <span>Range: {t.normalRange}</span>}
                                {t.unit && <span> {t.normalRange ? "· " : ""}Unit: {t.unit}</span>}
                              </div>
                            )}
                          </div>
                          {t.price != null && <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", flexShrink: 0 }}>₱{t.price.toFixed(0)}</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.keys(byCategory).length === 0 && (
                <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                  <FlaskIcon width={32} height={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                  <p style={{ fontSize: "13px" }}>No tests found. Add tests to the catalog first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {showAddTest && (
          <AddTestModal
            onClose={() => setShowAddTest(false)}
            onAdded={(t) => setLabTests(prev => [...prev, t])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
