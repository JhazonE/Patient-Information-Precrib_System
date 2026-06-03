"use client";

import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { PlusIcon, SearchIcon } from "@/presentation/components/icons";
import { createPatient, getPatients } from "@/application/actions/patientActions";
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

// ─── Philippine address selector (PSGC Cloud API) ────────────────────────────
const PSGC = "https://psgc.cloud/api";

interface GeoItem {
  code: string;
  name: string;
}

function PhAddressSelector({
  onAddressChange,
  resetKey,
}: {
  onAddressChange: (addr: string) => void;
  resetKey: number;
}) {
  const [regions, setRegions] = React.useState<GeoItem[]>([]);
  const [provinces, setProvinces] = React.useState<GeoItem[]>([]);
  const [cities, setCities] = React.useState<GeoItem[]>([]);
  const [barangays, setBarangays] = React.useState<GeoItem[]>([]);

  const [regionCode, setRegionCode] = React.useState("");
  const [provinceCode, setProvinceCode] = React.useState("");
  const [cityCode, setCityCode] = React.useState("");
  const [barangayCode, setBarangayCode] = React.useState("");
  const [street, setStreet] = React.useState("");

  const [loadingRegions, setLoadingRegions] = React.useState(true);
  const [loadingProvinces, setLoadingProvinces] = React.useState(false);
  const [loadingCities, setLoadingCities] = React.useState(false);
  const [loadingBarangays, setLoadingBarangays] = React.useState(false);
  const [apiError, setApiError] = React.useState(false);

  // Reload regions and reset selections when resetKey changes
  React.useEffect(() => {
    setRegionCode(""); setProvinceCode(""); setCityCode(""); setBarangayCode("");
    setProvinces([]); setCities([]); setBarangays([]);
    setStreet("");
  }, [resetKey]);

  // Fetch regions once
  React.useEffect(() => {
    setLoadingRegions(true);
    fetch(`${PSGC}/regions`)
      .then((r) => r.json())
      .then((data: GeoItem[]) =>
        setRegions(data.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch(() => setApiError(true))
      .finally(() => setLoadingRegions(false));
  }, []);

  // Compose address whenever selections change
  React.useEffect(() => {
    const parts = [
      street.trim(),
      barangays.find((b) => b.code === barangayCode)?.name,
      cities.find((c) => c.code === cityCode)?.name,
      provinces.find((p) => p.code === provinceCode)?.name,
      regions.find((r) => r.code === regionCode)?.name,
    ].filter(Boolean);
    onAddressChange(parts.join(", "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [street, barangayCode, cityCode, provinceCode, regionCode]);

  function selectRegion(code: string) {
    setRegionCode(code);
    setProvinceCode(""); setProvinces([]);
    setCityCode(""); setCities([]);
    setBarangayCode(""); setBarangays([]);
    if (!code) return;

    setLoadingProvinces(true);
    fetch(`${PSGC}/regions/${code}/provinces`)
      .then((r) => r.json())
      .then((data: GeoItem[]) => {
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setProvinces(sorted);
        if (sorted.length === 0) {
          // NCR / regions without provinces — load cities directly
          setLoadingCities(true);
          return fetch(`${PSGC}/regions/${code}/cities-municipalities`)
            .then((r) => r.json())
            .then((d: GeoItem[]) =>
              setCities(d.sort((a, b) => a.name.localeCompare(b.name)))
            )
            .finally(() => setLoadingCities(false));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProvinces(false));
  }

  function selectProvince(code: string) {
    setProvinceCode(code);
    setCityCode(""); setCities([]);
    setBarangayCode(""); setBarangays([]);
    if (!code) return;

    setLoadingCities(true);
    fetch(`${PSGC}/provinces/${code}/cities-municipalities`)
      .then((r) => r.json())
      .then((data: GeoItem[]) =>
        setCities(data.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch(() => {})
      .finally(() => setLoadingCities(false));
  }

  function selectCity(code: string) {
    setCityCode(code);
    setBarangayCode(""); setBarangays([]);
    if (!code) return;

    setLoadingBarangays(true);
    fetch(`${PSGC}/cities-municipalities/${code}/barangays`)
      .then((r) => r.json())
      .then((data: GeoItem[]) =>
        setBarangays(data.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch(() => {})
      .finally(() => setLoadingBarangays(false));
  }

  const inputBase: React.CSSProperties = {
    height: "44px",
    width: "100%",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: "0 14px",
    fontSize: "13.5px",
    color: "var(--text-primary)",
    outline: "none",
    transition: "all 0.2s",
  };

  const disabledStyle: React.CSSProperties = {
    ...inputBase,
    opacity: 0.45,
    cursor: "not-allowed",
    background: "#f1f5f9",
  };

  function focusStyle(el: HTMLInputElement | HTMLSelectElement) {
    el.style.borderColor = "#3b82f6";
    el.style.background = "#fff";
    el.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.1)";
  }

  function blurStyle(el: HTMLInputElement | HTMLSelectElement) {
    el.style.borderColor = "#e2e8f0";
    el.style.background = "#f8fafc";
    el.style.boxShadow = "none";
  }

  // If API fails, show a plain text input
  if (apiError) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
          Address
        </label>
        <input
          placeholder="Enter full address"
          onChange={(e) => onAddressChange(e.target.value)}
          style={inputBase}
          onFocus={(e) => focusStyle(e.currentTarget)}
          onBlur={(e) => blurStyle(e.currentTarget)}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 800,
            color: "#3b82f6",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Address
        </div>
        <div style={{ flex: 1, height: "1px", background: "#e8edf4" }} />
      </div>

      {/* Street */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
          House / Unit No. & Street
        </label>
        <input
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="e.g. 123 Rizal St., Purok 2"
          style={inputBase}
          onFocus={(e) => focusStyle(e.currentTarget)}
          onBlur={(e) => blurStyle(e.currentTarget)}
        />
      </div>

      {/* Region + Province */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
            Region
          </label>
          <select
            value={regionCode}
            onChange={(e) => selectRegion(e.target.value)}
            style={loadingRegions ? disabledStyle : inputBase}
            disabled={loadingRegions}
            onFocus={(e) => focusStyle(e.currentTarget)}
            onBlur={(e) => blurStyle(e.currentTarget)}
          >
            <option value="">
              {loadingRegions ? "Loading regions..." : "Select Region"}
            </option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
            Province
          </label>
          <select
            value={provinceCode}
            onChange={(e) => selectProvince(e.target.value)}
            style={
              !regionCode || loadingProvinces || provinces.length === 0
                ? disabledStyle
                : inputBase
            }
            disabled={!regionCode || loadingProvinces || provinces.length === 0}
            onFocus={(e) => focusStyle(e.currentTarget)}
            onBlur={(e) => blurStyle(e.currentTarget)}
          >
            <option value="">
              {loadingProvinces
                ? "Loading..."
                : !regionCode
                ? "Select region first"
                : provinces.length === 0 && regionCode
                ? "N/A"
                : "Select Province"}
            </option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* City + Barangay */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
            City / Municipality
          </label>
          <select
            value={cityCode}
            onChange={(e) => selectCity(e.target.value)}
            style={
              (!regionCode && !provinceCode) || loadingCities || cities.length === 0
                ? disabledStyle
                : inputBase
            }
            disabled={
              (!regionCode && !provinceCode) || loadingCities || cities.length === 0
            }
            onFocus={(e) => focusStyle(e.currentTarget)}
            onBlur={(e) => blurStyle(e.currentTarget)}
          >
            <option value="">
              {loadingCities ? "Loading..." : "Select City / Municipality"}
            </option>
            {cities.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
            Barangay
          </label>
          <select
            value={barangayCode}
            onChange={(e) => setBarangayCode(e.target.value)}
            style={
              !cityCode || loadingBarangays || barangays.length === 0
                ? disabledStyle
                : inputBase
            }
            disabled={!cityCode || loadingBarangays || barangays.length === 0}
            onFocus={(e) => focusStyle(e.currentTarget)}
            onBlur={(e) => blurStyle(e.currentTarget)}
          >
            <option value="">
              {loadingBarangays ? "Loading..." : "Select Barangay"}
            </option>
            {barangays.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const { showSnack, dismiss, snack } = useSnackbar();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

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
      <Snackbar snack={snack} onDismiss={dismiss} />
    </DashboardLayout>
  );
}
