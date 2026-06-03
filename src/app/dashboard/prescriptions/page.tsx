"use client";

import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import Link from "next/link";
import React from "react";
import { PlusIcon, SearchIcon } from "@/presentation/components/icons";
import { getPrescriptions } from "@/application/actions/prescriptionActions";
import { PrescriptionRowSkeleton } from "@/presentation/components/Skeleton";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    getPrescriptions()
      .then(setPrescriptions)
      .finally(() => setLoading(false));
  }, []);

  const filtered = prescriptions.filter(
    (p) =>
      p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div
        className="animate-fade-up"
        style={{
          display: "flex",
          alignItems: "center",
          justifyItems: "space-between",
          marginBottom: "24px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.4px",
            }}
          >
            Prescription <span style={{ color: "var(--accent)" }}>Records</span>
          </h1>
          <p
            style={{
              margin: "5px 0 0",
              fontSize: "13.5px",
              color: "var(--text-secondary)",
            }}
          >
            {loading ? "Loading..." : `${prescriptions.length} total prescriptions on record.`}
          </p>
        </div>
        <Link
          href="/dashboard/prescriptions/new"
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
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#2563eb";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#3b82f6";
          }}
        >
          <PlusIcon size={16} />
          New Prescription
        </Link>
      </div>

      {/* Search bar */}
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
            placeholder="Search by patient or diagnosis..."
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
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
              e.currentTarget.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "#f8fafc";
            }}
          />
        </div>
      </div>

      {/* Table */}
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
            gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr 0.6fr",
            padding: "13px 24px",
            background: "#f8fafc",
            borderBottom: "1px solid #e8edf4",
          }}
        >
          {["Patient", "Doctor", "Diagnosis", "Date Issued", "Actions"].map((h) => (
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
          ))}
        </div>

        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => <PrescriptionRowSkeleton key={i} />)}
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
              ? `No prescriptions found matching "${search}"`
              : "No prescriptions issued yet."}
          </div>
        ) : (
          filtered.map((pres, i) => {
            const dateStr = new Date(pres.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={pres.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr 0.6fr",
                  padding: "16px 24px",
                  alignItems: "center",
                  borderBottom:
                    i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "#fafbff")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--text-primary)",
                  }}
                >
                  {pres.patient?.name ?? "—"}
                </div>
                <div
                  style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}
                >
                  {pres.doctor?.name ?? "—"}
                </div>
                <div
                  style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}
                >
                  {pres.diagnosis}
                </div>
                <div
                  style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}
                >
                  {dateStr}
                </div>
                <div style={{ textAlign: "right" }}>
                  <Link
                    href={`/dashboard/prescriptions/${pres.id}`}
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
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "#dbeafe")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "#eff6ff")
                    }
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
