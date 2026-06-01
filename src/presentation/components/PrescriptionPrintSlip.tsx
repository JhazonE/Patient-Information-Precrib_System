"use client";

import React from "react";

export interface PrescriptionPrintData {
  id: string;
  createdAtStr: string;
  diagnosis: string;
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  instructions: string | null;
  patient: { name: string; gender: string; age: number | null };
  doctor: { name: string; specialty: string | null };
}

interface ClinicSettings {
  clinicName: string;
  address: string;
  phone: string;
  licenseNo: string;
}

const DEFAULT_CLINIC: ClinicSettings = {
  clinicName: "PatientCare Clinic",
  address: "",
  phone: "",
  licenseNo: "",
};

const LABEL = {
  fontSize: "10px",
  fontWeight: 800,
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  marginBottom: "8px",
};

export default function PrescriptionPrintSlip({ data }: { data: PrescriptionPrintData }) {
  const [clinic, setClinic] = React.useState<ClinicSettings>(DEFAULT_CLINIC);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("clinicSettings");
      if (saved) setClinic({ ...DEFAULT_CLINIC, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const genderLabel =
    data.patient.gender === "MALE"
      ? "Male"
      : data.patient.gender === "FEMALE"
      ? "Female"
      : "Other";

  return (
    <div
      id="prescription-content"
      className="print-prescription"
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "40px 48px",
        boxShadow: "var(--card-shadow)",
        border: "1px solid #e8edf4",
        maxWidth: "780px",
        margin: "0 auto",
        color: "#1e293b",
      }}
    >
      {/* ── Clinic header ─────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingBottom: "24px",
          borderBottom: "2px solid #1e40af",
          marginBottom: "28px",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: "22px",
              color: "#1e40af",
              letterSpacing: "-0.5px",
            }}
          >
            {clinic.clinicName || "PatientCare Clinic"}
          </div>
          {clinic.address && (
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
              {clinic.address}
            </div>
          )}
          {clinic.phone && (
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Tel: {clinic.phone}
            </div>
          )}
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px", fontStyle: "italic" }}>
            Medical Prescription
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
            Rx#{data.id.slice(-8).toUpperCase()}
          </div>
          <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "3px" }}>
            Issued: {data.createdAtStr}
          </div>
          {clinic.licenseNo && (
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              Lic# {clinic.licenseNo}
            </div>
          )}
        </div>
      </div>

      {/* ── Doctor + Patient ──────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "28px",
          marginBottom: "28px",
          paddingBottom: "20px",
          borderBottom: "1px solid #e8edf4",
        }}
      >
        <div>
          <div style={LABEL}>Prescribing Physician</div>
          <div style={{ fontWeight: 800, fontSize: "16px", color: "#1e293b" }}>
            {data.doctor.name}
          </div>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
            {data.doctor.specialty ?? "General Practitioner"}
          </div>
        </div>
        <div>
          <div style={LABEL}>Patient</div>
          <div style={{ fontWeight: 800, fontSize: "16px", color: "#1e293b" }}>
            {data.patient.name}
          </div>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
            {genderLabel}
            {data.patient.age !== null ? ` · ${data.patient.age} yrs old` : ""}
          </div>
        </div>
      </div>

      {/* ── Diagnosis ─────────────────────────────────── */}
      <div
        style={{
          background: "#f0f7ff",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "24px",
          borderLeft: "4px solid #3b82f6",
        }}
      >
        <div style={{ ...LABEL, color: "#1d4ed8" }}>Diagnosis</div>
        <div style={{ fontSize: "14px", color: "#1e293b", lineHeight: 1.7 }}>
          {data.diagnosis}
        </div>
      </div>

      {/* ── Medications table ─────────────────────────── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={LABEL}>
          Medications &nbsp;
          <span style={{ fontWeight: 600, color: "#64748b", textTransform: "none", letterSpacing: 0, fontSize: "12px" }}>
            ({data.medications.length} item{data.medications.length !== 1 ? "s" : ""})
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              {["Medicine", "Dosage", "Frequency", "Duration"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.medications.map((med, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  background: i % 2 === 0 ? "#fff" : "#fafbff",
                }}
              >
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1e293b" }}>
                  {med.name}
                </td>
                <td style={{ padding: "12px 14px", color: "#475569" }}>{med.dosage}</td>
                <td style={{ padding: "12px 14px", color: "#475569" }}>{med.frequency}</td>
                <td style={{ padding: "12px 14px", color: "#475569" }}>{med.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Special Instructions ──────────────────────── */}
      {data.instructions && (
        <div
          style={{
            background: "#fffbeb",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "28px",
            border: "1px solid #fde68a",
          }}
        >
          <div style={{ ...LABEL, color: "#92400e" }}>Special Instructions</div>
          <div style={{ fontSize: "13.5px", color: "#78350f", lineHeight: 1.6 }}>
            {data.instructions}
          </div>
        </div>
      )}

      {/* ── Signature ─────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "28px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "200px",
              borderBottom: "1.5px solid #1e293b",
              marginBottom: "8px",
              height: "48px",
            }}
          />
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
            {data.doctor.name}
          </div>
          <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
            {data.doctor.specialty ?? "General Practitioner"}
          </div>
          {clinic.licenseNo && (
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              Lic# {clinic.licenseNo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
