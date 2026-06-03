"use client";

import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { PlusIcon, SearchIcon } from "@/presentation/components/icons";
import { createPatient, getPatients, updatePatient } from "@/application/actions/patientActions";
import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSnackbar, Snackbar } from "@/presentation/components/Snackbar";
import { PatientRowSkeleton, Spinner } from "@/presentation/components/Skeleton";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name: string) => {
  if (!name) return "P";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

import { PhAddressSelector } from "@/presentation/components/PhAddressSelector";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const { showSnack, dismiss, snack } = useSnackbar();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // ── Edit drawer state ──────────────────────────────────────────────────────
  const [editPatient, setEditPatient] = React.useState<any>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editFirstName, setEditFirstName] = React.useState("");
  const [editMiddleName, setEditMiddleName] = React.useState("");
  const [editLastName, setEditLastName] = React.useState("");
  const [editDob, setEditDob] = React.useState("");
  const [editGender, setEditGender] = React.useState("MALE");
  const [editPhone, setEditPhone] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editAddressKey, setEditAddressKey] = React.useState(0);
  const [editAddressPicker, setEditAddressPicker] = React.useState(false);
  const [editNameError, setEditNameError] = React.useState("");
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  // New patient form state
  const [firstName, setFirstName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [composedAddress, setComposedAddress] = React.useState("");
  const [addressKey, setAddressKey] = React.useState(0); // forces PhAddressSelector reset
  const [nameError, setNameError] = React.useState("");

  function calcAge(dobStr: string): string {
    if (!dobStr) return "";
    const birth = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? String(age) : "";
  }

  const fetchPatients = React.useCallback(async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    fetchPatients();
  }, [fetchPatients]);

  function openDrawer() {
    setIsOpen(true);
  }

  function closeDrawer() {
    setIsOpen(false);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setDob("");
    setComposedAddress("");
    setNameError("");
    setAddressKey((k) => k + 1);
  }

  function openEditDrawer(p: any) {
    // Parse full name into parts
    const parts = (p.name ?? "").trim().split(" ");
    const fn  = parts[0] ?? "";
    const ln  = parts.length > 1 ? parts[parts.length - 1] : "";
    const mn  = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";
    setEditFirstName(fn);
    setEditMiddleName(mn);
    setEditLastName(ln);
    setEditDob(p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "");
    setEditGender(p.gender ?? "MALE");
    setEditPhone(p.phone ?? "");
    setEditEmail(p.email ?? "");
    setEditAddress(p.address ?? "");
    setEditAddressKey((k) => k + 1);
    setEditAddressPicker(false);
    setEditNameError("");
    setEditPatient(p);
    setIsEditOpen(true);
  }

  function closeEditDrawer() {
    setIsEditOpen(false);
    setEditPatient(null);
    setEditNameError("");
    setEditAddressPicker(false);
  }

  const handleUpdatePatient = async (formData: FormData) => {
    const fn = editFirstName.trim();
    const mn = editMiddleName.trim();
    const ln = editLastName.trim();
    if (!fn || !ln) {
      setEditNameError("First name and last name are required.");
      return;
    }
    const fullName = [fn, mn, ln].filter(Boolean).join(" ");
    formData.set("name",    fullName);
    formData.set("address", editAddress);
    formData.set("dob",     editDob);
    formData.set("gender",  editGender);

    setEditSubmitting(true);
    try {
      await updatePatient(editPatient.id, formData);
      closeEditDrawer();
      await fetchPatients();
      showSnack("Patient updated successfully.", "success");
    } catch {
      showSnack("Failed to update patient. Please try again.", "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleRegisterPatient = async (formData: FormData) => {
    const fn = firstName.trim();
    const mn = middleName.trim();
    const ln = lastName.trim();

    if (!fn || !ln) {
      setNameError("First name and last name are required.");
      return;
    }

    const fullName = [fn, mn, ln].filter(Boolean).join(" ");
    formData.set("name", fullName);
    formData.set("address", composedAddress);

    setSubmitting(true);
    try {
      await createPatient(formData);
      closeDrawer();
      await fetchPatients();
      showSnack("Patient registered successfully.", "success");
    } catch (error) {
      console.error("Failed to register patient:", error);
      showSnack("Failed to register patient. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  );

  const inputStyle: React.CSSProperties = {
    height: "44px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: "0 16px",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    transition: "all 0.2s",
    width: "100%",
  };

  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "#3b82f6";
    e.currentTarget.style.background = "#fff";
    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.1)";
  }

  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "#e2e8f0";
    e.currentTarget.style.background = "#f8fafc";
    e.currentTarget.style.boxShadow = "none";
  }

  return (
    <DashboardLayout>
      <div
        className="animate-fade-up"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.4px",
            }}
          >
            Patients
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: "13.5px", color: "var(--text-secondary)" }}>
            {patients.length} registered patients in the system
          </p>
        </div>

        <button
          onClick={openDrawer}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#3b82f6",
            color: "#fff",
            fontWeight: 700,
            fontSize: "13.5px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
            transition: "all 0.2s",
          }}
        >
          <PlusIcon size={16} />
          Add Patient
        </button>
      </div>

      {/* ── Drawer ─────────────────────────────────────────────────────────── */}
      {mounted && (
        <AnimatePresence mode="wait">
          {isOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {/* Backdrop */}
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeDrawer}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(4px)",
                }}
              />

              {/* Drawer panel */}
              <motion.div
                key="drawer-content"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "relative",
                  width: "560px",
                  maxWidth: "100%",
                  background: "#fff",
                  boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100vh",
                  borderLeft: "1px solid #f1f5f9",
                  zIndex: 1001,
                }}
              >
                <form
                  action={handleRegisterPatient}
                  style={{ height: "100%", display: "flex", flexDirection: "column" }}
                >
                  {/* Header */}
                  <div
                    style={{
                      padding: "28px 28px 22px",
                      borderBottom: "1px solid #f1f5f9",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          fontWeight: 800,
                          color: "var(--text-primary)",
                        }}
                      >
                        Register Patient
                      </h2>
                      <button
                        type="button"
                        onClick={closeDrawer}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          padding: "4px",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-muted)" }}>
                      Fill in the patient&apos;s details to create a new record.
                    </p>
                  </div>

                  {/* Body */}
                  <div
                    style={{
                      padding: "24px 28px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                      flex: 1,
                      overflowY: "auto",
                    }}
                  >
                    {/* ── Name section ── */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#3b82f6",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          Full Name
                        </span>
                        <div style={{ flex: 1, height: "1px", background: "#e8edf4" }} />
                      </div>

                      {nameError && (
                        <div
                          style={{
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            fontSize: "12.5px",
                            color: "#ef4444",
                            marginBottom: "12px",
                          }}
                        >
                          {nameError}
                        </div>
                      )}

                      <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                            }}
                          >
                            First Name <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <input
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              if (nameError) setNameError("");
                            }}
                            placeholder="Juan"
                            style={inputStyle}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Middle Name
                          </label>
                          <input
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                            placeholder="Santos"
                            style={inputStyle}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Last Name <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <input
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              if (nameError) setNameError("");
                            }}
                            placeholder="Dela Cruz"
                            style={inputStyle}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Personal Info section ── */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#3b82f6",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          Personal Info
                        </span>
                        <div style={{ flex: 1, height: "1px", background: "#e8edf4" }} />
                      </div>

                      {/* Birthday | Age (auto) | Gender — 3-column */}
                      <div
                        style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 1fr", gap: "12px" }}
                      >
                        {/* Birthday */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label
                            style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}
                          >
                            Date of Birth <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <input
                            name="dob"
                            type="date"
                            required
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            style={inputStyle}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>

                        {/* Age — auto-calculated */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label
                            style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}
                          >
                            Age
                          </label>
                          <div
                            style={{
                              height: "44px",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              background: "#f1f5f9",
                              padding: "0 14px",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: dob ? "#1e293b" : "#94a3b8",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {dob ? (
                              <>
                                {calcAge(dob)}
                                <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>
                                  yrs
                                </span>
                              </>
                            ) : (
                              "—"
                            )}
                          </div>
                        </div>

                        {/* Gender */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label
                            style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}
                          >
                            Gender
                          </label>
                          <select
                            name="gender"
                            style={inputStyle}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* ── Contact section ── */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#3b82f6",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          Contact
                        </span>
                        <div style={{ flex: 1, height: "1px", background: "#e8edf4" }} />
                      </div>

                      <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Phone Number
                          </label>
                          <input
                            name="phone"
                            type="tel"
                            placeholder="+63 912 345 6789"
                            style={inputStyle}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Email Address
                          </label>
                          <input
                            name="email"
                            type="email"
                            placeholder="juan@example.com"
                            style={inputStyle}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Philippine Address ── */}
                    <PhAddressSelector
                      onAddressChange={setComposedAddress}
                      resetKey={addressKey}
                    />

                    {/* Preview of composed address */}
                    {composedAddress && (
                      <div
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #86efac",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          fontSize: "12.5px",
                          color: "#166534",
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>Address: </span>
                        {composedAddress}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      padding: "20px 28px 28px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      borderTop: "1px solid #f1f5f9",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "12px",
                        border: "none",
                        background: submitting ? "#93c5fd" : "#3b82f6",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: submitting ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      {submitting && <Spinner size={15} color="#fff" />}
                      {submitting ? "Registering..." : "Add Patient"}
                    </button>
                    <button
                      type="button"
                      onClick={closeDrawer}
                      style={{
                        width: "100%",
                        height: "44px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      Discard
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div
        className="animate-fade-up-delay-1"
        style={{
          background: "var(--card-bg)",
          borderRadius: "14px",
          padding: "16px 20px",
          boxShadow: "var(--card-shadow)",
          border: "1px solid #e8edf4",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          >
            <SearchIcon style={{ width: "15px", height: "15px" }} />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: "38px",
              borderRadius: "9px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              padding: "0 14px 0 36px",
              fontSize: "13.5px",
              outline: "none",
              color: "var(--text-primary)",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#93c5fd";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(59,130,246,0.12)";
              e.currentTarget.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "#f8fafc";
            }}
          />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          {["All", "Active", "Inactive"].map((f) => (
            <button
              key={f}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: f === "All" ? "#eff6ff" : "#fff",
                color: f === "All" ? "#2563eb" : "#64748b",
                fontWeight: 600,
                fontSize: "12.5px",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div
        className="animate-fade-up-delay-2"
        style={{
          background: "var(--card-bg)",
          borderRadius: "16px",
          boxShadow: "var(--card-shadow)",
          border: "1px solid #e8edf4",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1.2fr 1fr 0.8fr",
            padding: "13px 24px",
            background: "#f8fafc",
            borderBottom: "1px solid #e8edf4",
          }}
        >
          {["Patient", "Gender", "Date of Birth", "Phone", "Actions"].map(
            (h) => (
              <div
                key={h}
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  textAlign: h === "Actions" ? "right" : "left",
                }}
              >
                {h}
              </div>
            )
          )}
        </div>

        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => <PatientRowSkeleton key={i} />)}
          </>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "14px",
            }}
          >
            {search
              ? `No patients found matching "${search}"`
              : "No patients registered yet."}
          </div>
        ) : (
          filtered.map((patient, i) => {
            const initials = getInitials(patient.name);
            const colors = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];
            const color = colors[patient.name.charCodeAt(0) % colors.length];
            const dob = patient.dateOfBirth
              ? new Date(patient.dateOfBirth).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "---";

            return (
              <div
                key={patient.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1.2fr 1fr 0.8fr",
                  padding: "16px 24px",
                  alignItems: "center",
                  borderBottom:
                    i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  transition: "background 0.15s",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: `${color}20`,
                      border: `2px solid ${color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "13px",
                      color,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "var(--text-primary)",
                      }}
                    >
                      {patient.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      {patient.email || "No email"}
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "99px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background:
                        patient.gender === "FEMALE" ? "#fdf2f8" : "#eff6ff",
                      color:
                        patient.gender === "FEMALE" ? "#db2777" : "#2563eb",
                    }}
                  >
                    {patient.gender === "MALE"
                      ? "Male"
                      : patient.gender === "FEMALE"
                      ? "Female"
                      : "Other"}
                  </span>
                </div>

                <div
                  style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}
                >
                  {dob}
                </div>
                <div
                  style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}
                >
                  {patient.phone || "---"}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end",
                  }}
                >
                  <Link
                    href={`/dashboard/patients/${patient.id}`}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "inline-block",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "#dbeafe")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "#eff6ff")
                    }
                  >
                    View
                  </Link>
                  <button
                    onClick={() => openEditDrawer(patient)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "#f8fafc",
                      color: "#64748b",
                      border: "1px solid #e2e8f0",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f1f5f9";
                      e.currentTarget.style.color = "#1e293b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.color = "#64748b";
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* ── Edit Patient Drawer ─────────────────────────────────────────── */}
      {mounted && (
        <AnimatePresence mode="wait">
          {isEditOpen && editPatient && (
            <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
              {/* Backdrop */}
              <motion.div
                key="edit-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeEditDrawer}
                style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
              />

              {/* Panel */}
              <motion.div
                key="edit-drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "relative", width: "520px", maxWidth: "100%",
                  background: "#fff", boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
                  display: "flex", flexDirection: "column", height: "100vh",
                  borderLeft: "1px solid #f1f5f9", zIndex: 1001,
                }}
              >
                <form action={handleUpdatePatient} style={{ height: "100%", display: "flex", flexDirection: "column" }}>

                  {/* Header */}
                  <div style={{ padding: "28px 28px 22px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "9px",
                          background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </div>
                        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                          Edit Patient
                        </h2>
                      </div>
                      <button type="button" onClick={closeEditDrawer} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                      Editing record for <strong>{editPatient.name}</strong>
                    </p>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "20px", flex: 1, overflowY: "auto" }}>

                    {/* Error */}
                    {editNameError && (
                      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#dc2626" }}>
                        {editNameError}
                      </div>
                    )}

                    {/* ── Full Name ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.7px" }}>Full Name</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>First Name <span style={{ color: "#ef4444" }}>*</span></label>
                          <input value={editFirstName} onChange={(e) => { setEditFirstName(e.target.value); setEditNameError(""); }}
                            placeholder="Juan" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Middle Name</label>
                          <input value={editMiddleName} onChange={(e) => setEditMiddleName(e.target.value)}
                            placeholder="Santos" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Last Name <span style={{ color: "#ef4444" }}>*</span></label>
                        <input value={editLastName} onChange={(e) => { setEditLastName(e.target.value); setEditNameError(""); }}
                          placeholder="Dela Cruz" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                      </div>
                    </div>

                    {/* ── Personal Details ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.7px" }}>Personal Details</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 1fr", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Date of Birth</label>
                          <input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)}
                            style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Age</label>
                          <div style={{
                            height: "44px", borderRadius: "12px", border: "1px solid #e2e8f0",
                            background: "#f1f5f9", padding: "0 16px", fontSize: "14px",
                            fontWeight: 700, color: editDob ? "var(--text-primary)" : "#94a3b8",
                            display: "flex", alignItems: "center",
                          }}>
                            {editDob ? `${calcAge(editDob)} yrs` : "—"}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Gender</label>
                          <select value={editGender} onChange={(e) => setEditGender(e.target.value)}
                            style={inputStyle} onFocus={onFocus} onBlur={onBlur as any}>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* ── Contact ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.7px" }}>Contact Information</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Phone</label>
                          <input name="phone" type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="+63 912 345 6789" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Email</label>
                          <input name="email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="juan@example.com" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                      </div>
                    </div>

                    {/* ── Address ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.7px" }}>Address</div>
                        <button
                          type="button"
                          onClick={() => { setEditAddressPicker((v) => !v); setEditAddressKey((k) => k + 1); }}
                          style={{
                            fontSize: "11.5px", fontWeight: 600, color: editAddressPicker ? "#dc2626" : "#3b82f6",
                            background: editAddressPicker ? "#fef2f2" : "#eff6ff",
                            border: "none", borderRadius: "6px", padding: "3px 10px", cursor: "pointer",
                          }}
                        >
                          {editAddressPicker ? "✕ Close picker" : "Use address picker"}
                        </button>
                      </div>

                      {/* Direct text input (always visible) */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Current Address</label>
                        <input
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Enter full address"
                          style={inputStyle}
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                      </div>

                      {/* PSGC picker (toggleable) */}
                      {editAddressPicker && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "4px" }}>
                          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                            Selecting from the picker will replace the address above.
                          </p>
                          <PhAddressSelector
                            onAddressChange={(addr) => { if (addr) setEditAddress(addr); }}
                            resetKey={editAddressKey}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
                    <button
                      type="submit"
                      disabled={editSubmitting}
                      style={{
                        width: "100%", height: "48px", borderRadius: "12px", border: "none",
                        background: editSubmitting ? "#fcd34d" : "linear-gradient(135deg, #f59e0b, #d97706)",
                        color: "#fff", fontWeight: 700, fontSize: "14px",
                        cursor: editSubmitting ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                        transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      }}
                    >
                      {editSubmitting && <Spinner size={15} color="#fff" />}
                      {editSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={closeEditDrawer}
                      style={{
                        width: "100%", height: "44px", borderRadius: "12px",
                        border: "1px solid #e2e8f0", background: "#fff",
                        color: "#64748b", fontWeight: 600, fontSize: "14px", cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}

      <Snackbar snack={snack} onDismiss={dismiss} />
    </DashboardLayout>
  );
}
