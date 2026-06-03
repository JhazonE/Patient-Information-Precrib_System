"use client";

import React from "react";

const PSGC = "https://psgc.cloud/api";
interface GeoItem { code: string; name: string; }

const labelStyle: React.CSSProperties = {
  fontSize: "13px", fontWeight: 700, color: "#475569",
};

const selStyle: React.CSSProperties = {
  height: "46px", width: "100%", borderRadius: "10px",
  border: "1.5px solid #e2e8f0", background: "#f8fafc",
  padding: "0 14px", fontSize: "14px", color: "#1e293b", outline: "none",
};

const disabledStyle: React.CSSProperties = {
  ...selStyle, opacity: 0.45, cursor: "not-allowed", background: "#f1f5f9",
};

const inputStyle: React.CSSProperties = {
  height: "46px", width: "100%", borderRadius: "10px",
  border: "1.5px solid #e2e8f0", background: "#f8fafc",
  padding: "0 14px", fontSize: "14px", color: "#1e293b", outline: "none",
  transition: "all 0.2s",
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#3b82f6";
  e.currentTarget.style.background  = "#fff";
  e.currentTarget.style.boxShadow   = "0 0 0 4px rgba(59,130,246,0.1)";
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#e2e8f0";
  e.currentTarget.style.background  = "#f8fafc";
  e.currentTarget.style.boxShadow   = "none";
}

export function PhAddressSelector({
  onAddressChange,
  resetKey,
  compact = false,
}: {
  onAddressChange: (addr: string) => void;
  resetKey: number;
  compact?: boolean;
}) {
  const [regions,   setRegions]   = React.useState<GeoItem[]>([]);
  const [provinces, setProvinces] = React.useState<GeoItem[]>([]);
  const [cities,    setCities]    = React.useState<GeoItem[]>([]);
  const [barangays, setBarangays] = React.useState<GeoItem[]>([]);

  const [regionCode,   setRegionCode]   = React.useState("");
  const [provinceCode, setProvinceCode] = React.useState("");
  const [cityCode,     setCityCode]     = React.useState("");
  const [barangayCode, setBarangayCode] = React.useState("");
  const [street,       setStreet]       = React.useState("");

  const [loadingRegions,   setLoadingRegions]   = React.useState(true);
  const [loadingProvinces, setLoadingProvinces] = React.useState(false);
  const [loadingCities,    setLoadingCities]    = React.useState(false);
  const [loadingBarangays, setLoadingBarangays] = React.useState(false);
  const [apiError,         setApiError]         = React.useState(false);

  React.useEffect(() => {
    setRegionCode(""); setProvinceCode(""); setCityCode(""); setBarangayCode("");
    setProvinces([]); setCities([]); setBarangays([]); setStreet("");
  }, [resetKey]);

  React.useEffect(() => {
    fetch(`${PSGC}/regions`)
      .then((r) => r.json())
      .then((d: GeoItem[]) => setRegions(d.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setApiError(true))
      .finally(() => setLoadingRegions(false));
  }, []);

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
    setRegionCode(code); setProvinceCode(""); setProvinces([]);
    setCityCode(""); setCities([]); setBarangayCode(""); setBarangays([]);
    if (!code) return;
    setLoadingProvinces(true);
    fetch(`${PSGC}/regions/${code}/provinces`)
      .then((r) => r.json())
      .then((d: GeoItem[]) => {
        const sorted = d.sort((a, b) => a.name.localeCompare(b.name));
        setProvinces(sorted);
        if (sorted.length === 0) {
          setLoadingCities(true);
          return fetch(`${PSGC}/regions/${code}/cities-municipalities`)
            .then((r) => r.json())
            .then((cd: GeoItem[]) => setCities(cd.sort((a, b) => a.name.localeCompare(b.name))))
            .finally(() => setLoadingCities(false));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProvinces(false));
  }

  function selectProvince(code: string) {
    setProvinceCode(code); setCityCode(""); setCities([]); setBarangayCode(""); setBarangays([]);
    if (!code) return;
    setLoadingCities(true);
    fetch(`${PSGC}/provinces/${code}/cities-municipalities`)
      .then((r) => r.json())
      .then((d: GeoItem[]) => setCities(d.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {})
      .finally(() => setLoadingCities(false));
  }

  function selectCity(code: string) {
    setCityCode(code); setBarangayCode(""); setBarangays([]);
    if (!code) return;
    setLoadingBarangays(true);
    fetch(`${PSGC}/cities-municipalities/${code}/barangays`)
      .then((r) => r.json())
      .then((d: GeoItem[]) => setBarangays(d.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {})
      .finally(() => setLoadingBarangays(false));
  }

  const gap = compact ? "10px" : "14px";
  const labelSz: React.CSSProperties = compact
    ? { ...labelStyle, fontSize: "12px" }
    : labelStyle;

  if (apiError) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={labelSz}>Address</label>
        <input
          placeholder="Enter full address"
          onChange={(e) => onAddressChange(e.target.value)}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {/* Street */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={labelSz}>House / Unit No. &amp; Street</label>
        <input
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="e.g. 123 Rizal St., Purok 2"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Region + Province */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelSz}>Region</label>
          <select
            value={regionCode}
            onChange={(e) => selectRegion(e.target.value)}
            style={loadingRegions ? disabledStyle : selStyle}
            disabled={loadingRegions}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="">{loadingRegions ? "Loading..." : "Select Region"}</option>
            {regions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelSz}>Province</label>
          <select
            value={provinceCode}
            onChange={(e) => selectProvince(e.target.value)}
            style={(!regionCode || loadingProvinces || provinces.length === 0) ? disabledStyle : selStyle}
            disabled={!regionCode || loadingProvinces || provinces.length === 0}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="">
              {loadingProvinces ? "Loading..." : !regionCode ? "Select region first" : provinces.length === 0 && regionCode ? "N/A" : "Select Province"}
            </option>
            {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* City + Barangay */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelSz}>City / Municipality</label>
          <select
            value={cityCode}
            onChange={(e) => selectCity(e.target.value)}
            style={((!regionCode && !provinceCode) || loadingCities || cities.length === 0) ? disabledStyle : selStyle}
            disabled={(!regionCode && !provinceCode) || loadingCities || cities.length === 0}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="">{loadingCities ? "Loading..." : "Select City"}</option>
            {cities.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelSz}>Barangay</label>
          <select
            value={barangayCode}
            onChange={(e) => setBarangayCode(e.target.value)}
            style={(!cityCode || loadingBarangays || barangays.length === 0) ? disabledStyle : selStyle}
            disabled={!cityCode || loadingBarangays || barangays.length === 0}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="">{loadingBarangays ? "Loading..." : "Select Barangay"}</option>
            {barangays.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
