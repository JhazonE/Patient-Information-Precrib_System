"use client";

import React from "react";
import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { getDoctorProfile, updateDoctorProfile } from "@/application/actions/settingsActions";

/* ─── Helpers ─────────────────────────────────────────────── */

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--card-bg)",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "var(--card-shadow)",
        border: "1px solid #e8edf4",
      }}
    >
      <div style={{ marginBottom: "22px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 800,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        style={{
          fontSize: "12.5px",
          fontWeight: 700,
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: "42px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  padding: "0 14px",
  fontSize: "14px",
  color: "var(--text-primary)",
  outline: "none",
  transition: "all 0.2s",
  width: "100%",
};

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={inputStyle}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#93c5fd";
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.background = "#f8fafc";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      style={{
        width: "46px",
        height: "26px",
        borderRadius: "13px",
        background: checked ? "#3b82f6" : "#e2e8f0",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.25s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "4px",
          left: checked ? "24px" : "4px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.25s",
        }}
      />
    </div>
  );
}

function SaveButton({
  loading,
  saved,
}: {
  loading: boolean;
  saved: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        height: "40px",
        padding: "0 24px",
        borderRadius: "10px",
        border: "none",
        background: saved ? "#10b981" : "#3b82f6",
        color: "#fff",
        fontWeight: 700,
        fontSize: "13.5px",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.2s",
        opacity: loading ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {saved ? (
        <>
          <svg fill="none" height="14" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Saved!
        </>
      ) : loading ? (
        "Saving..."
      ) : (
        "Save Changes"
      )}
    </button>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */

export default function SettingsPage() {
  /* Doctor profile */
  const [doctorName, setDoctorName] = React.useState("");
  const [doctorSpecialty, setDoctorSpecialty] = React.useState("");
  const [doctorEmail, setDoctorEmail] = React.useState("dr.smith@patientcare.com");
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [profileSaved, setProfileSaved] = React.useState(false);

  /* Clinic print header */
  const [clinicName, setClinicName] = React.useState("PatientCare Clinic");
  const [clinicAddress, setClinicAddress] = React.useState("");
  const [clinicPhone, setClinicPhone] = React.useState("");
  const [licenseNo, setLicenseNo] = React.useState("");
  const [clinicSaved, setClinicSaved] = React.useState(false);

  /* Appearance */
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("light");

  /* Notifications */
  const [notifs, setNotifs] = React.useState({
    appointmentReminders: true,
    newPatientAlerts: true,
    prescriptionDue: false,
    systemUpdates: false,
  });

  /* Load initial data */
  React.useEffect(() => {
    getDoctorProfile().then((doc) => {
      if (doc) {
        setDoctorName(doc.name);
        setDoctorSpecialty(doc.specialty ?? "");
        setDoctorEmail(doc.email);
      }
    });

    try {
      const saved = localStorage.getItem("clinicSettings");
      if (saved) {
        const c = JSON.parse(saved);
        if (c.clinicName) setClinicName(c.clinicName);
        if (c.address) setClinicAddress(c.address);
        if (c.phone) setClinicPhone(c.phone);
        if (c.licenseNo) setLicenseNo(c.licenseNo);
      }

      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
      if (savedTheme) setTheme(savedTheme);

      const savedNotifs = localStorage.getItem("notifications");
      if (savedNotifs) setNotifs({ ...notifs, ...JSON.parse(savedNotifs) });
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Save doctor profile */
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateDoctorProfile(doctorName, doctorSpecialty);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } finally {
      setProfileLoading(false);
    }
  }

  /* Save clinic info */
  function handleSaveClinic(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem(
        "clinicSettings",
        JSON.stringify({
          clinicName,
          address: clinicAddress,
          phone: clinicPhone,
          licenseNo,
        })
      );
      setClinicSaved(true);
      setTimeout(() => setClinicSaved(false), 2500);
    } catch {}
  }

  /* Apply + save theme */
  function applyTheme(t: "light" | "dark" | "system") {
    setTheme(t);
    localStorage.setItem("theme", t);

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = t === "dark" || (t === "system" && prefersDark);
    document.documentElement.setAttribute("data-theme", useDark ? "dark" : "light");
  }

  /* Save notification toggle */
  function toggleNotif(key: keyof typeof notifs) {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    try {
      localStorage.setItem("notifications", JSON.stringify(updated));
    } catch {}
  }

  const themeOptions: { value: "light" | "dark" | "system"; label: string; icon: React.ReactNode }[] = [
    {
      value: "light",
      label: "Light",
      icon: (
        <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
    },
    {
      value: "dark",
      label: "Dark",
      icon: (
        <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
    {
      value: "system",
      label: "System",
      icon: (
        <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8m-4-4v4" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-up" style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          System <span style={{ color: "var(--accent)" }}>Settings</span>
        </h1>
        <p
          style={{
            marginTop: "6px",
            fontSize: "14px",
            color: "var(--text-secondary)",
          }}
        >
          Manage your profile, clinic info for prescriptions, and preferences.
        </p>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >

        {/* ── 1. Doctor Profile ─────────────────────────── */}
        <SectionCard
          title="Doctor Profile"
          description="Your name and specialty appear on every printed prescription."
        >
          <form onSubmit={handleSaveProfile}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <FieldGroup label="Full Name *">
                <InputField
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. Smith"
                  required
                />
              </FieldGroup>
              <FieldGroup label="Specialty *">
                <InputField
                  value={doctorSpecialty}
                  onChange={(e) => setDoctorSpecialty(e.target.value)}
                  placeholder="e.g. Cardiologist"
                  required
                />
              </FieldGroup>
            </div>
            <FieldGroup label="Email (read-only)">
              <InputField
                value={doctorEmail}
                readOnly
                style={{ ...inputStyle, background: "#f1f5f9", color: "#94a3b8", cursor: "default" }}
              />
            </FieldGroup>
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <SaveButton loading={profileLoading} saved={profileSaved} />
            </div>
          </form>
        </SectionCard>

        {/* ── 2. Clinic Print Header ─────────────────────── */}
        <SectionCard
          title="Clinic Print Header"
          description="These details appear on the printed prescription slip header."
        >
          <form onSubmit={handleSaveClinic}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <FieldGroup label="Clinic Name">
                <InputField
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="PatientCare Clinic"
                />
              </FieldGroup>
              <FieldGroup label="Doctor License No.">
                <InputField
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  placeholder="e.g. MD-123456"
                />
              </FieldGroup>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <FieldGroup label="Clinic Address">
                <InputField
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="123 Medical Ave, City"
                />
              </FieldGroup>
              <FieldGroup label="Phone Number">
                <InputField
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  placeholder="+63 912 345 6789"
                />
              </FieldGroup>
            </div>
            <div
              style={{
                background: "#eff6ff",
                borderRadius: "10px",
                padding: "12px 16px",
                fontSize: "12.5px",
                color: "#2563eb",
                marginBottom: "16px",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
              }}
            >
              <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" style={{ flexShrink: 0, marginTop: "1px" }}>
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
              </svg>
              Clinic info is saved locally in your browser and used on printed prescriptions. Changes take effect immediately on the next prescription you view.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SaveButton loading={false} saved={clinicSaved} />
            </div>
          </form>
        </SectionCard>

        {/* ── 3. Appearance ─────────────────────────────── */}
        <SectionCard
          title="Appearance"
          description="Choose your preferred color theme for the application."
        >
          <div style={{ display: "flex", gap: "12px" }}>
            {themeOptions.map((opt) => {
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => applyTheme(opt.value)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "16px 28px",
                    borderRadius: "12px",
                    border: active ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                    background: active ? "#eff6ff" : "var(--card-bg)",
                    color: active ? "#2563eb" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: active ? 700 : 500,
                    fontSize: "13px",
                    transition: "all 0.2s",
                  }}
                >
                  {opt.icon}
                  {opt.label}
                  {active && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#3b82f6",
                        display: "block",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* ── 4. Notifications ──────────────────────────── */}
        <SectionCard
          title="Notification Preferences"
          description="Control which alerts you receive while using the system."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {(
              [
                {
                  key: "appointmentReminders" as const,
                  label: "Appointment Reminders",
                  desc: "Get alerted before scheduled patient appointments.",
                },
                {
                  key: "newPatientAlerts" as const,
                  label: "New Patient Registrations",
                  desc: "Notify when a new patient is added to the system.",
                },
                {
                  key: "prescriptionDue" as const,
                  label: "Prescription Follow-ups Due",
                  desc: "Remind when a patient's prescription period ends.",
                },
                {
                  key: "systemUpdates" as const,
                  label: "System Updates",
                  desc: "Receive notices about maintenance and system changes.",
                },
              ] as const
            ).map((item, i, arr) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom:
                    i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "var(--text-muted)",
                      marginTop: "2px",
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
                <Toggle
                  checked={notifs[item.key]}
                  onChange={() => toggleNotif(item.key)}
                />
              </div>
            ))}
          </div>
        </SectionCard>

      </div>
    </DashboardLayout>
  );
}
