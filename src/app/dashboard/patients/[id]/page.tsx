import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { getPatientById } from "@/application/actions/patientActions";
import { getPatientPrescriptions } from "@/application/actions/prescriptionActions";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [patient, prescriptions] = await Promise.all([
    getPatientById(id),
    getPatientPrescriptions(id),
  ]);

  if (!patient) notFound();

  const age = Math.floor(
    (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );
  const dobFormatted = new Date(patient.dateOfBirth).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const colors = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];
  const color = colors[patient.name.charCodeAt(0) % colors.length];
  const initials = patient.name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout>
      {/* Back */}
      <div className="animate-fade-up" style={{ marginBottom: "24px" }}>
        <Link
          href="/dashboard/patients"
          style={{
            fontSize: "13.5px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 0",
          }}
        >
          ← Back to Patients
        </Link>
      </div>

      {/* Profile header */}
      <div
        className="animate-fade-up-delay-1"
        style={{
          background: "var(--card-bg)",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "var(--card-shadow)",
          border: "1px solid #e8edf4",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: `${color}20`,
              border: `3px solid ${color}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "22px",
              color: color,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.4px",
              }}
            >
              {patient.name}
            </h1>
            <p
              style={{
                margin: "5px 0 0",
                fontSize: "13.5px",
                color: "var(--text-secondary)",
              }}
            >
              {patient.gender === "MALE"
                ? "Male"
                : patient.gender === "FEMALE"
                ? "Female"
                : "Other"}{" "}
              · {age} years old ·{" "}
              {prescriptions.length} prescription
              {prescriptions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/dashboard/prescriptions/new"
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              background: "#3b82f6",
              color: "#fff",
              fontWeight: 700,
              fontSize: "13.5px",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            + New Prescription
          </Link>
        </div>
      </div>

      {/* Info grid + prescriptions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Info card */}
        <div
          className="animate-fade-up-delay-2"
          style={{
            background: "var(--card-bg)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "var(--card-shadow)",
            border: "1px solid #e8edf4",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px",
              fontSize: "14px",
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            Patient Information
          </h3>
          {[
            { label: "Date of Birth", value: dobFormatted },
            {
              label: "Gender",
              value:
                patient.gender === "MALE"
                  ? "Male"
                  : patient.gender === "FEMALE"
                  ? "Female"
                  : "Other",
            },
            { label: "Phone", value: patient.phone ?? "Not provided" },
            { label: "Email", value: patient.email ?? "Not provided" },
            { label: "Address", value: patient.address ?? "Not provided" },
            {
              label: "Registered",
              value: new Date(patient.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  color: "var(--text-primary)",
                  marginTop: "4px",
                  fontWeight: 500,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Prescriptions list */}
        <div className="animate-fade-up-delay-3">
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "16px",
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            Prescription History{" "}
            <span
              style={{
                fontWeight: 400,
                color: "var(--text-muted)",
                fontSize: "14px",
              }}
            >
              ({prescriptions.length})
            </span>
          </h2>

          {prescriptions.length === 0 ? (
            <div
              style={{
                background: "var(--card-bg)",
                borderRadius: "16px",
                padding: "48px",
                boxShadow: "var(--card-shadow)",
                border: "1px solid #e8edf4",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <p style={{ fontWeight: 600 }}>No prescriptions yet</p>
              <p style={{ fontSize: "13px" }}>
                Create the first prescription for this patient.
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {prescriptions.map((rx: any) => {
                const meds: any[] = rx.medications ?? [];
                return (
                  <Link
                    key={rx.id}
                    href={`/dashboard/prescriptions/${rx.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="rx-card"
                      style={{
                        background: "var(--card-bg)",
                        borderRadius: "14px",
                        padding: "18px 22px",
                        boxShadow: "var(--card-shadow)",
                        border: "1px solid #e8edf4",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "14px",
                              color: "var(--text-primary)",
                            }}
                          >
                            {rx.diagnosis}
                          </div>
                          <div
                            style={{
                              fontSize: "12.5px",
                              color: "var(--text-muted)",
                              marginTop: "4px",
                            }}
                          >
                            by {rx.doctor?.name ?? "Unknown"} ·{" "}
                            {meds.length} medication{meds.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {new Date(rx.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "4px",
                              padding: "2px 10px",
                              borderRadius: "99px",
                              background: "#dcfce7",
                              color: "#16a34a",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            Active
                          </span>
                        </div>
                      </div>
                      {meds.length > 0 && (
                        <div
                          style={{
                            marginTop: "10px",
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          {meds.slice(0, 3).map((med: any, i: number) => (
                            <span
                              key={i}
                              style={{
                                padding: "2px 10px",
                                borderRadius: "6px",
                                background: "#eff6ff",
                                color: "#3b82f6",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              {med.name}
                            </span>
                          ))}
                          {meds.length > 3 && (
                            <span
                              style={{
                                padding: "2px 10px",
                                borderRadius: "6px",
                                background: "#f1f5f9",
                                color: "#64748b",
                                fontSize: "12px",
                              }}
                            >
                              +{meds.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
