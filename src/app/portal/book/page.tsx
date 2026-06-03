"use client";

import React from "react";
import Link from "next/link";
import { bookAppointment } from "@/application/actions/portalActions";
import { PhAddressSelector } from "@/presentation/components/PhAddressSelector";

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

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: "13px", fontWeight: 700, color: "#475569",
};

const inputStyle: React.CSSProperties = {
  height: "46px", width: "100%", borderRadius: "10px",
  border: "1.5px solid #e2e8f0", background: "#f8fafc",
  padding: "0 14px", fontSize: "14px", color: "#1e293b", outline: "none",
  transition: "all 0.2s",
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#3b82f6";
  e.currentTarget.style.background  = "#fff";
  e.currentTarget.style.boxShadow   = "0 0 0 4px rgba(59,130,246,0.1)";
}
function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#e2e8f0";
  e.currentTarget.style.background  = "#f8fafc";
  e.currentTarget.style.boxShadow   = "none";
}

// ─── Section divider ─────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0 2px" }}>
      <span style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        {children}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#e8edf4" }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BookPage() {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Step 1 — Personal info
  const [firstName, setFirstName]   = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [lastName, setLastName]     = React.useState("");
  const [dob, setDob]               = React.useState("");
  const [gender, setGender]         = React.useState("MALE");
  const [phone, setPhone]           = React.useState("");
  const [email, setEmail]           = React.useState("");
  const [address, setAddress]       = React.useState("");
  const [addrKey, setAddrKey]       = React.useState(0);

  // Step 2 — Appointment
  const [apptDate, setApptDate]   = React.useState("");
  const [timeSlot, setTimeSlot]   = React.useState("");
  const [apptType, setApptType]   = React.useState("");
  const [notes, setNotes]         = React.useState("");

  const [error, setError]         = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult]       = React.useState<any>(null);

  function calcAge(dobStr: string) {
    if (!dobStr) return "";
    const birth = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? String(age) : "";
  }

  function goNext() {
    if (!firstName.trim())  { setError("First name is required."); return; }
    if (!lastName.trim())   { setError("Last name is required."); return; }
    if (!dob)               { setError("Date of birth is required."); return; }
    if (!phone.trim() && !email.trim()) {
      setError("Please provide at least a phone number or email address.");
      return;
    }
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!apptDate)  { setError("Please select an appointment date."); return; }
    if (!timeSlot)  { setError("Please select a time slot."); return; }
    if (!apptType)  { setError("Please select an appointment type."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await bookAppointment({
        firstName, middleName, lastName,
        dateOfBirth: dob, gender, phone, email, address,
        appointmentDate: apptDate, timeSlot, type: apptType, notes,
      });
      setResult(res);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep(1);
    setFirstName(""); setMiddleName(""); setLastName("");
    setDob(""); setGender("MALE"); setPhone(""); setEmail("");
    setAddress(""); setAddrKey((k) => k + 1);
    setApptDate(""); setTimeSlot(""); setApptType(""); setNotes("");
    setError(""); setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f5ff", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e8edf4",
        padding: "0 32px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/portal" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "#fff", fontSize: "14px",
          }}>P</div>
          <span style={{ fontWeight: 800, fontSize: "15px", color: "#1e293b" }}>
            Patient<span style={{ color: "#3b82f6" }}>Care</span>
          </span>
        </Link>
        <Link href="/portal" style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", textDecoration: "none" }}>
          ← Back
        </Link>
      </nav>

      {/* Step indicator */}
      {step < 3 && (
        <div style={{
          background: "#fff", borderBottom: "1px solid #e8edf4",
          padding: "16px 32px", display: "flex", justifyContent: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
            {[
              { n: 1, label: "Personal Info" },
              { n: 2, label: "Appointment" },
            ].map((s, i) => {
              const done   = step > s.n;
              const active = step === s.n;
              return (
                <React.Fragment key={s.n}>
                  {i > 0 && (
                    <div style={{
                      width: "60px", height: "2px",
                      background: done ? "#3b82f6" : "#e2e8f0",
                      margin: "0 4px",
                      transition: "background 0.3s",
                    }} />
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: done ? "#3b82f6" : active ? "#3b82f6" : "#e2e8f0",
                      color: done || active ? "#fff" : "#94a3b8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "12px",
                      transition: "all 0.3s",
                    }}>
                      {done ? (
                        <svg fill="none" height="14" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : s.n}
                    </div>
                    <span style={{
                      fontSize: "13px", fontWeight: active ? 700 : 500,
                      color: active ? "#1e293b" : done ? "#3b82f6" : "#94a3b8",
                    }}>
                      {s.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: "680px", margin: "0 auto",
        padding: "36px 24px 60px",
      }}>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "10px", padding: "12px 16px",
            fontSize: "13.5px", color: "#dc2626",
            marginBottom: "18px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            {error}
          </div>
        )}

        {/* ══ STEP 1: Personal Info ════════════════════════════════════════ */}
        {step === 1 && (
          <div style={{
            background: "#fff", borderRadius: "18px",
            padding: "36px", boxShadow: "0 2px 20px rgba(0,0,0,0.07)",
            border: "1px solid #e8edf4",
            display: "flex", flexDirection: "column", gap: "22px",
          }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.4px" }}>
                Your Information
              </h2>
              <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b" }}>
                Fill in your personal details. This creates your patient record.
              </p>
            </div>

            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <SectionLabel>Full Name</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>First Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input value={firstName} onChange={(e) => { setFirstName(e.target.value); setError(""); }}
                    placeholder="Juan" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Middle Name</label>
                  <input value={middleName} onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Santos" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Last Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input value={lastName} onChange={(e) => { setLastName(e.target.value); setError(""); }}
                  placeholder="Dela Cruz" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
            </div>

            {/* Personal */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <SectionLabel>Personal Details</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Date of Birth <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="date" value={dob} onChange={(e) => { setDob(e.target.value); setError(""); }}
                    style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Age</label>
                  <div style={{
                    height: "46px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
                    background: "#f1f5f9", padding: "0 14px", fontSize: "14px",
                    fontWeight: 700, color: dob ? "#1e293b" : "#94a3b8",
                    display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    {dob ? (
                      <>{calcAge(dob)}<span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>&nbsp;yrs</span></>
                    ) : "—"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}
                    style={{ ...inputStyle, height: "46px" }} onFocus={handleFocus} onBlur={handleBlur}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <SectionLabel>Contact Information</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(""); }}
                    placeholder="+63 912 345 6789" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="juan@example.com" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                * At least one of phone or email is required.
              </p>
            </div>

            {/* Address */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <SectionLabel>Home Address <span style={{ fontWeight: 500, color: "#94a3b8", textTransform: "none", letterSpacing: 0, fontSize: "12px" }}>(optional)</span></SectionLabel>
              <PhAddressSelector onAddressChange={setAddress} resetKey={addrKey} />
              {address && (
                <div style={{
                  background: "#f0fdf4", border: "1px solid #86efac",
                  borderRadius: "9px", padding: "9px 14px",
                  fontSize: "12.5px", color: "#166534",
                }}>
                  <strong>Address:</strong> {address}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={goNext}
              style={{
                marginTop: "4px", height: "50px", width: "100%",
                borderRadius: "12px", border: "none",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "#fff", fontWeight: 800, fontSize: "15px",
                cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Continue to Appointment →
            </button>
          </div>
        )}

        {/* ══ STEP 2: Appointment ══════════════════════════════════════════ */}
        {step === 2 && (
          <div style={{
            background: "#fff", borderRadius: "18px",
            padding: "36px", boxShadow: "0 2px 20px rgba(0,0,0,0.07)",
            border: "1px solid #e8edf4",
            display: "flex", flexDirection: "column", gap: "22px",
          }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.4px" }}>
                Schedule Your Appointment
              </h2>
              <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b" }}>
                Choose your preferred date, time, and type of appointment.
              </p>
            </div>

            {/* Patient summary */}
            <div style={{
              background: "#f8fafc", borderRadius: "12px", padding: "14px 18px",
              border: "1px solid #e8edf4", display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                background: "#eff6ff", border: "2px solid #bfdbfe",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: "13px", color: "#2563eb",
              }}>
                {([firstName[0], lastName[0]].filter(Boolean).join("") || "?").toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>
                  {[firstName, middleName, lastName].filter(Boolean).join(" ") || "—"}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                  {dob ? `${calcAge(dob)} yrs old` : ""}{phone ? ` · ${phone}` : ""}{email ? ` · ${email}` : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setStep(1); setError(""); }}
                style={{
                  marginLeft: "auto", padding: "4px 12px", borderRadius: "7px",
                  border: "1px solid #e2e8f0", background: "#fff",
                  color: "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                }}
              >
                Edit
              </button>
            </div>

            {/* Date + Time */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <SectionLabel>Date & Time</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Appointment Date <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="date" value={apptDate} min={todayISO}
                    onChange={(e) => { setApptDate(e.target.value); setError(""); }}
                    style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Time Slot <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={timeSlot} onChange={(e) => { setTimeSlot(e.target.value); setError(""); }}
                    style={{ ...inputStyle, height: "46px" }} onFocus={handleFocus} onBlur={handleBlur}>
                    <option value="">Select time...</option>
                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Type */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <SectionLabel>Appointment Type</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
                {APPT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setApptType(t); setError(""); }}
                    style={{
                      padding: "11px 12px", borderRadius: "10px", textAlign: "center",
                      border: apptType === t ? "2px solid #3b82f6" : "1.5px solid #e2e8f0",
                      background: apptType === t ? "#eff6ff" : "#f8fafc",
                      color: apptType === t ? "#1d4ed8" : "#475569",
                      fontWeight: apptType === t ? 700 : 500, fontSize: "13px",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>
                Reason / Notes{" "}
                <span style={{ fontWeight: 500, color: "#94a3b8", fontSize: "12px" }}>(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe your symptoms or reason for the visit..."
                style={{
                  ...inputStyle, height: "auto", padding: "12px 14px",
                  resize: "vertical", lineHeight: 1.6,
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  height: "50px", width: "100%", borderRadius: "12px", border: "none",
                  background: submitting ? "#93c5fd" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "#fff", fontWeight: 800, fontSize: "15px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                  transition: "all 0.2s",
                }}
              >
                {submitting ? "Confirming..." : "Confirm Appointment"}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setError(""); }}
                style={{
                  height: "44px", width: "100%", borderRadius: "12px",
                  border: "1.5px solid #e2e8f0", background: "#fff",
                  color: "#64748b", fontWeight: 600, fontSize: "14px", cursor: "pointer",
                }}
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3: Success ══════════════════════════════════════════════ */}
        {step === 3 && result && (
          <div style={{
            background: "#fff", borderRadius: "18px",
            padding: "48px 36px", boxShadow: "0 2px 20px rgba(0,0,0,0.07)",
            border: "1px solid #e8edf4", textAlign: "center",
          }}>
            {/* Success icon */}
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
            }}>
              <svg fill="none" height="34" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24" width="34">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Appointment Confirmed!
            </h2>
            <p style={{ margin: "0 0 32px", fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
              Your appointment has been successfully booked. Please arrive 10 minutes early.
            </p>

            {/* Booking card */}
            <div style={{
              background: "#f8fafc", borderRadius: "14px",
              border: "1px solid #e2e8f0", padding: "24px",
              marginBottom: "28px", textAlign: "left",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #e2e8f0",
              }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Booking Reference
                </span>
                <span style={{
                  background: "#eff6ff", color: "#1d4ed8",
                  padding: "5px 14px", borderRadius: "8px",
                  fontWeight: 900, fontSize: "16px", letterSpacing: "1px",
                }}>
                  {result.referenceNo}
                </span>
              </div>

              {[
                { label: "Patient Name",  value: result.patientName },
                { label: "Date",         value: result.appointmentDate },
                { label: "Time",         value: result.timeSlot },
                { label: "Type",         value: result.type },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "8px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Reminder */}
            <div style={{
              background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: "10px", padding: "12px 16px",
              fontSize: "13px", color: "#92400e", marginBottom: "28px",
              display: "flex", alignItems: "flex-start", gap: "8px", textAlign: "left",
            }}>
              <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" style={{ flexShrink: 0, marginTop: "1px" }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              Please save or note your booking reference number <strong>{result.referenceNo}</strong>. Bring a valid ID on your appointment day.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  height: "48px", width: "100%", borderRadius: "12px", border: "none",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                }}
              >
                Book Another Appointment
              </button>
              <Link
                href="/portal"
                style={{
                  display: "block", height: "44px", width: "100%", borderRadius: "12px",
                  border: "1.5px solid #e2e8f0", background: "#fff",
                  color: "#64748b", fontWeight: 600, fontSize: "14px",
                  textDecoration: "none", lineHeight: "44px",
                }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
