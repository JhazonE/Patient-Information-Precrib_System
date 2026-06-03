"use client";

import React, { useState } from "react";
import { Button, Separator } from "@heroui/react";
import { PlusIcon, TrashIcon } from "@/presentation/components/icons";
import { createPrescription } from "@/application/actions/prescriptionActions";
import { Patient, MedicationItem } from "@/domain/entities";
import { useRouter } from "next/navigation";
import { useSnackbar, Snackbar } from "@/presentation/components/Snackbar";
import { Spinner } from "@/presentation/components/Skeleton";

// ─── Medication name input with localStorage autocomplete ────────────────────
function MedicationNameInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [savedMeds, setSavedMeds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("savedMedications");
      if (raw) setSavedMeds(JSON.parse(raw));
    } catch {}
  }, []);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleChange(val: string) {
    onChange(val);
    if (val.trim().length > 0 && savedMeds.length > 0) {
      const filtered = savedMeds.filter((m) =>
        m.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setOpen(false);
    }
  }

  function handleFocus() {
    if (value.trim().length > 0 && savedMeds.length > 0) {
      const filtered = savedMeds.filter((m) =>
        m.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      if (filtered.length > 0) setOpen(true);
    } else if (!value.trim() && savedMeds.length > 0) {
      setSuggestions(savedMeds.slice(0, 8));
      setOpen(true);
    }
  }

  function selectSuggestion(med: string) {
    onChange(med);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        required
        autoComplete="off"
        style={{
          height: "38px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
          padding: "0 12px",
          fontSize: "13px",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#93c5fd")}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.currentTarget)
            e.currentTarget.style.borderColor = "#e2e8f0";
        }}
        placeholder="e.g. Paracetamol"
      />

      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
            zIndex: 100,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "6px 12px 4px",
              fontSize: "10px",
              fontWeight: 800,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Previously used
          </div>
          {suggestions.map((s) => (
            <div
              key={s}
              onMouseDown={() => selectSuggestion(s)}
              style={{
                padding: "9px 14px",
                fontSize: "13px",
                cursor: "pointer",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "1px solid #f8fafc",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0f7ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <svg
                fill="none"
                height="13"
                stroke="#94a3b8"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="13"
                style={{ flexShrink: 0 }}
              >
                <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-14v4l3 3" />
              </svg>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main form ───────────────────────────────────────────────────────────────
interface PrescriptionFormProps {
  patients: Patient[];
}

export default function PrescriptionForm({ patients }: PrescriptionFormProps) {
  const router = useRouter();
  const { showSnack, dismiss, snack } = useSnackbar();
  const [medications, setMedications] = useState<MedicationItem[]>([
    { name: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (
    index: number,
    field: keyof MedicationItem,
    value: string
  ) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      await createPrescription(formData, medications);

      // Persist medication names for future autocomplete
      const names = medications.map((m) => m.name.trim()).filter(Boolean);
      if (names.length > 0) {
        try {
          const existing: string[] = JSON.parse(
            localStorage.getItem("savedMedications") || "[]"
          );
          const merged = [...new Set([...existing, ...names])];
          localStorage.setItem("savedMedications", JSON.stringify(merged));
        } catch {}
      }

      showSnack("Prescription created successfully.", "success");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (error) {
      console.error("Failed to create prescription:", error);
      showSnack("Failed to create prescription. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="animate-fade-up max-w-5xl mx-auto space-y-8"
    >
      {/* Form Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Create <span style={{ color: "var(--accent)" }}>New Prescription</span>
        </h1>
        <p
          style={{
            marginTop: "6px",
            fontSize: "14px",
            color: "var(--text-secondary)",
          }}
        >
          Issue a clinical prescription with detailed medication schedules.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* ── Main Content ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Patient and Diagnosis */}
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "var(--card-shadow)",
              border: "1px solid #e8edf4",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "20px",
              }}
            >
              Patient Information & Clinical Summary
            </h2>

            <div style={{ display: "grid", gap: "20px" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                  }}
                >
                  Select Patient <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="patientId"
                  required
                  style={{
                    height: "42px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    padding: "0 14px",
                    fontSize: "14px",
                    color: "var(--text-primary)",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#93c5fd";
                    e.currentTarget.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                >
                  <option value="">Choose a patient from records...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                  }}
                >
                  Primary Diagnosis <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="diagnosis"
                  required
                  style={{
                    minHeight: "120px",
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    padding: "14px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                    resize: "vertical",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#93c5fd";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(59,130,246,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Enter formal diagnosis and clinical observations..."
                />
              </div>
            </div>
          </div>

          {/* Medications */}
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "var(--card-shadow)",
              border: "1px solid #e8edf4",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  Medication List
                </h2>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  Previously used medicines appear as suggestions while typing.
                </p>
              </div>
              <button
                type="button"
                onClick={addMedication}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "var(--accent)",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#dbeafe")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#eff6ff")
                }
              >
                <PlusIcon size={14} />
                Add Medication
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {medications.map((med, index) => (
                <div
                  key={index}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 40px",
                      gap: "12px",
                      alignItems: "end",
                    }}
                  >
                    {/* Medicine Name — with autocomplete */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Medicine Name
                      </label>
                      <MedicationNameInput
                        value={med.name}
                        onChange={(v) => updateMedication(index, "name", v)}
                      />
                    </div>

                    {/* Dosage */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Dosage
                      </label>
                      <input
                        value={med.dosage}
                        onChange={(e) =>
                          updateMedication(index, "dosage", e.target.value)
                        }
                        required
                        style={{
                          height: "38px",
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#f8fafc",
                          padding: "0 12px",
                          fontSize: "13px",
                          outline: "none",
                        }}
                        placeholder="500mg"
                      />
                    </div>

                    {/* Frequency */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Freq.
                      </label>
                      <input
                        value={med.frequency}
                        onChange={(e) =>
                          updateMedication(index, "frequency", e.target.value)
                        }
                        required
                        style={{
                          height: "38px",
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#f8fafc",
                          padding: "0 12px",
                          fontSize: "13px",
                          outline: "none",
                        }}
                        placeholder="Twice a day"
                      />
                    </div>

                    {/* Duration */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Duration
                      </label>
                      <input
                        value={med.duration}
                        onChange={(e) =>
                          updateMedication(index, "duration", e.target.value)
                        }
                        required
                        style={{
                          height: "38px",
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#f8fafc",
                          padding: "0 12px",
                          fontSize: "13px",
                          outline: "none",
                        }}
                        placeholder="7 Days"
                      />
                    </div>

                    {/* Remove */}
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        style={{
                          height: "38px",
                          width: "38px",
                          borderRadius: "8px",
                          border: "1px solid #fee2e2",
                          background: "#fef2f2",
                          color: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fee2e2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#fef2f2")
                        }
                      >
                        <TrashIcon size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            position: "sticky",
            top: "0",
          }}
        >
          <div
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
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Execution Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                  }}
                >
                  Special Instructions
                </label>
                <textarea
                  name="instructions"
                  style={{
                    minHeight: "100px",
                    width: "100%",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    padding: "12px",
                    fontSize: "13px",
                    outline: "none",
                    resize: "none",
                  }}
                  placeholder="Notes for the pharmacist..."
                />
              </div>

              <Separator />

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  style={{
                    height: "44px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {isSubmitting && <Spinner size={15} color="#fff" />}
                    {isSubmitting ? "Generating..." : "Generate Prescription"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onPress={() => router.back()}
                  style={{
                    height: "44px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Discard Draft
                </Button>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(59,130,246,0.04)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px dashed rgba(59,130,246,0.2)",
            }}
          >
            <h4
              style={{
                margin: "0 0 10px",
                fontSize: "12px",
                fontWeight: 800,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Safety Guidelines
            </h4>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 16px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>Verify patient identity before confirming.</li>
              <li>Ensure dosages are correctly specified.</li>
              <li>Check for potential drug interactions.</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
    <Snackbar snack={snack} onDismiss={dismiss} />
    </>
  );
}
