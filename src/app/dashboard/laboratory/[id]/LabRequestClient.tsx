"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { saveLabResults, updateLabRequestStatus } from "@/application/actions/laboratoryActions";
import { FlaskIcon } from "@/presentation/components/icons";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:     { bg: "#fef3c7", color: "#d97706", label: "Pending" },
  IN_PROGRESS: { bg: "#dbeafe", color: "#2563eb", label: "In Progress" },
  COMPLETED:   { bg: "#dcfce7", color: "#16a34a", label: "Completed" },
  CANCELLED:   { bg: "#f1f5f9", color: "#64748b", label: "Cancelled" },
};

const INTERPRETATION_OPTS = [
  { value: "",         label: "— Select —" },
  { value: "NORMAL",   label: "Normal",    color: "#16a34a" },
  { value: "HIGH",     label: "High",      color: "#d97706" },
  { value: "LOW",      label: "Low",       color: "#2563eb" },
  { value: "CRITICAL", label: "Critical",  color: "#dc2626" },
];

type LabResult = {
  id: string; requestId: string; testId: string;
  value: string | null; unit: string | null; normalRange: string | null;
  interpretation: string | null; remarks: string | null;
  performedBy: string | null; performedAt: Date | null; createdAt: Date;
  test: { id: string; name: string; code: string; category: string; normalRange: string | null; unit: string | null };
};

type LabRequest = {
  id: string; patientId: string; doctorId: string; priority: string;
  notes: string | null; status: string; createdAt: Date; updatedAt: Date;
  patient: { id: string; name: string; gender: string; dateOfBirth: Date; phone: string | null; email: string | null; address: string | null };
  doctor: { id: string; name: string; specialty: string | null };
  results: LabResult[];
};

function InterpretationBadge({ value }: { value: string | null }) {
  if (!value) return <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>;
  const colors: Record<string, { bg: string; color: string }> = {
    NORMAL:   { bg: "#dcfce7", color: "#16a34a" },
    HIGH:     { bg: "#fef3c7", color: "#d97706" },
    LOW:      { bg: "#dbeafe", color: "#2563eb" },
    CRITICAL: { bg: "#fee2e2", color: "#dc2626" },
  };
  const style = colors[value] ?? { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ padding: "2px 8px", borderRadius: "99px", background: style.bg, color: style.color, fontSize: "11.5px", fontWeight: 700 }}>
      {value.charAt(0) + value.slice(1).toLowerCase()}
    </span>
  );
}

export default function LabRequestClient({ request }: { request: LabRequest }) {
  const [editMode, setEditMode] = useState(request.status !== "COMPLETED");
  const [isPending, startTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const s = STATUS_STYLES[request.status] ?? STATUS_STYLES.PENDING;
  const age = Math.floor((new Date().getTime() - new Date(request.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  const byCategory = request.results.reduce<Record<string, LabResult[]>>((acc, r) => {
    (acc[r.test.category] ??= []).push(r);
    return acc;
  }, {});

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveLabResults(request.id, fd);
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function handleStatusChange(status: string) {
    startStatusTransition(async () => {
      await updateLabRequestStatus(request.id, status as any);
    });
  }

  const inputBase = { width: "100%", borderRadius: "7px", border: "1px solid #e2e8f0", padding: "6px 10px", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" as const };

  return (
    <div>
      {/* Back */}
      <div className="animate-fade-up" style={{ marginBottom: "20px" }}>
        <Link href="/dashboard/laboratory" style={{ fontSize: "13.5px", color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          ← Back to Laboratory
        </Link>
      </div>

      {/* Header card */}
      <div className="animate-fade-up-delay-1" style={{ background: "var(--card-bg)", borderRadius: "16px", padding: "24px 28px", boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7", flexShrink: 0 }}>
              <FlaskIcon width={24} height={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Lab Request</h1>
                <span style={{ padding: "3px 12px", borderRadius: "99px", background: s.bg, color: s.color, fontSize: "12px", fontWeight: 700 }}>{s.label}</span>
                {request.priority !== "ROUTINE" && (
                  <span style={{ padding: "3px 12px", borderRadius: "99px", background: request.priority === "STAT" ? "#fee2e2" : "#fef3c7", color: request.priority === "STAT" ? "#dc2626" : "#d97706", fontSize: "12px", fontWeight: 700 }}>
                    {request.priority}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                {new Date(request.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          {/* Status actions */}
          {request.status !== "COMPLETED" && request.status !== "CANCELLED" && (
            <div style={{ display: "flex", gap: "8px" }}>
              {request.status === "PENDING" && (
                <button disabled={statusPending} onClick={() => handleStatusChange("IN_PROGRESS")}
                  style={{ padding: "8px 16px", borderRadius: "9px", border: "1px solid #7dd3fc", background: "#e0f2fe", color: "#0284c7", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                  Start Processing
                </button>
              )}
              <button disabled={statusPending} onClick={() => handleStatusChange("CANCELLED")}
                style={{ padding: "8px 16px", borderRadius: "9px", border: "1px solid #fecaca", background: "#fff", color: "#ef4444", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                Cancel Request
              </button>
            </div>
          )}
        </div>

        {/* Patient + doctor info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e8edf4" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Patient</div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{request.patient.name}</div>
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
              {request.patient.gender === "MALE" ? "Male" : request.patient.gender === "FEMALE" ? "Female" : "Other"} · {age} years old
            </div>
            {request.patient.phone && <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{request.patient.phone}</div>}
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Requesting Doctor</div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{request.doctor.name}</div>
            {request.doctor.specialty && <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>{request.doctor.specialty}</div>}
          </div>
          {request.notes && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Clinical Notes</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{request.notes}</div>
            </div>
          )}
        </div>
      </div>

      {/* Results section */}
      <div className="animate-fade-up-delay-2">
      {saved && (
        <div style={{ padding: "12px 20px", borderRadius: "10px", background: "#dcfce7", border: "1px solid #86efac", color: "#16a34a", fontWeight: 700, fontSize: "13.5px", marginBottom: "16px" }}>
          Results saved successfully and request marked as Completed.
        </div>
      )}

      {request.results.length === 0 ? (
        <div style={{ background: "var(--card-bg)", borderRadius: "16px", padding: "48px", textAlign: "center", color: "var(--text-muted)", border: "1px solid #e8edf4" }}>
          <FlaskIcon width={36} height={36} style={{ margin: "0 auto 14px", display: "block", opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No tests included in this request.</p>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {Object.entries(byCategory).map(([category, results]) => (
            <div key={category} style={{ background: "var(--card-bg)", borderRadius: "16px", padding: "24px", boxShadow: "var(--card-shadow)", border: "1px solid #e8edf4", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{ padding: "4px 12px", borderRadius: "6px", background: "#e0f2fe", color: "#0284c7", fontSize: "12px", fontWeight: 700 }}>{category}</span>
              </div>

              {editMode ? (
                /* ── Edit mode: input grid ── */
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {results.map(r => (
                    <div key={r.id} style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 1fr 1fr", gap: "12px", alignItems: "start", padding: "14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e8edf4" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "#1e293b" }}>{r.test.name}</div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>{r.test.code}</div>
                        {r.test.normalRange && <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Normal: {r.test.normalRange}</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase" }}>Result Value</div>
                        <input name={`value_${r.id}`} defaultValue={r.value ?? ""} placeholder="Enter value"
                          style={inputBase}
                          onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
                          onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase" }}>Unit</div>
                        <input name={`unit_${r.id}`} defaultValue={r.unit ?? r.test.unit ?? ""} placeholder="e.g. mg/dL"
                          style={inputBase}
                          onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
                          onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                        <input type="hidden" name={`normalRange_${r.id}`} value={r.test.normalRange ?? ""} />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase" }}>Interpretation</div>
                        <select name={`interpretation_${r.id}`} defaultValue={r.interpretation ?? ""}
                          style={{ ...inputBase, height: "34px" }}>
                          {INTERPRETATION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase" }}>Performed By</div>
                        <input name={`performedBy_${r.id}`} defaultValue={r.performedBy ?? ""} placeholder="Lab technician"
                          style={inputBase}
                          onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
                          onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                      </div>
                      {/* full-width remarks */}
                      <div style={{ gridColumn: "2/-1" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase" }}>Remarks</div>
                        <input name={`remarks_${r.id}`} defaultValue={r.remarks ?? ""} placeholder="Additional notes…"
                          style={inputBase}
                          onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
                          onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── View mode: results table ── */
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e8edf4" }}>
                      {["Test", "Code", "Result", "Unit", "Normal Range", "Interpretation", "Performed By", "Date"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: i < results.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                        <td style={{ padding: "12px 12px", fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>{r.test.name}</td>
                        <td style={{ padding: "12px 12px" }}>
                          <span style={{ padding: "2px 7px", borderRadius: "4px", background: "#dbeafe", color: "#2563eb", fontSize: "11.5px", fontWeight: 700 }}>{r.test.code}</span>
                        </td>
                        <td style={{ padding: "12px 12px", fontWeight: 700, fontSize: "13.5px", color: r.value ? "#1e293b" : "#94a3b8" }}>{r.value ?? "—"}</td>
                        <td style={{ padding: "12px 12px", fontSize: "12.5px", color: "#64748b" }}>{r.unit ?? "—"}</td>
                        <td style={{ padding: "12px 12px", fontSize: "12.5px", color: "#64748b" }}>{r.normalRange ?? r.test.normalRange ?? "—"}</td>
                        <td style={{ padding: "12px 12px" }}><InterpretationBadge value={r.interpretation} /></td>
                        <td style={{ padding: "12px 12px", fontSize: "12.5px", color: "#64748b" }}>{r.performedBy ?? "—"}</td>
                        <td style={{ padding: "12px 12px", fontSize: "12px", color: "#94a3b8" }}>
                          {r.performedAt ? new Date(r.performedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            {request.status !== "CANCELLED" && (
              editMode ? (
                <>
                  <button type="button" onClick={() => setEditMode(false)}
                    style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: "13.5px", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isPending}
                    style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", opacity: isPending ? 0.7 : 1 }}>
                    {isPending ? "Saving…" : "Save Results & Complete"}
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setEditMode(true)}
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #7dd3fc", background: "#e0f2fe", color: "#0284c7", fontWeight: 700, fontSize: "13.5px", cursor: "pointer" }}>
                  Edit Results
                </button>
              )
            )}
          </div>
        </form>
      )}
      </div>{/* /animate-fade-up-delay-2 */}
    </div>
  );
}
