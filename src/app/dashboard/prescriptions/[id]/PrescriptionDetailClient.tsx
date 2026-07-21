"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PrintButton from "@/presentation/components/PrintButton";
import PrescriptionPrintSlip, { PrescriptionPrintData } from "@/presentation/components/PrescriptionPrintSlip";
import DispenseDrawer from "@/presentation/components/DispenseDrawer";

type DispenseItem = {
  id: string; quantity: number; unit: string;
  medicine: { id: string; name: string; genericName: string | null; unit: string };
};

type Dispense = {
  id: string; prescriptionId: string; dispensedBy: string | null;
  notes: string | null; createdAt: Date;
  items: DispenseItem[];
} | null;

export default function PrescriptionDetailClient({
  prescriptionId, medications, dispense, printData,
}: {
  prescriptionId: string;
  medications: any[];
  dispense: Dispense;
  printData: PrescriptionPrintData;
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Back + Actions */}
      <div className="animate-fade-up no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <Link href="/dashboard/prescriptions"
          style={{ fontSize: "13.5px", color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          ← Back to Prescriptions
        </Link>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Dispensed status OR Dispense button */}
          {dispense ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ padding: "5px 14px", borderRadius: "99px", background: "#dcfce7", color: "#16a34a", fontSize: "12.5px", fontWeight: 700 }}>
                ✓ Dispensed
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {dispense.dispensedBy ? `by ${dispense.dispensedBy} · ` : ""}
                {new Date(dispense.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px",
                borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#10b981,#059669)",
                color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
              }}>
              Dispense Medicines
            </button>
          )}

          <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
            Clinic info pulled from Settings
          </span>
          <PrintButton />
        </div>
      </div>

      {/* Dispense summary card (if already dispensed) */}
      {dispense && dispense.items.length > 0 && (
        <div className="animate-fade-up no-print" style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "14px", padding: "20px 24px", marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#16a34a", marginBottom: "12px" }}>Dispensed Items</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {dispense.items.map(item => (
              <div key={item.id} style={{ padding: "6px 14px", borderRadius: "8px", background: "#dcfce7", border: "1px solid #86efac", fontSize: "13px", fontWeight: 600, color: "#15803d" }}>
                {item.medicine.name} — {item.quantity} {item.unit}
              </div>
            ))}
          </div>
          {dispense.notes && (
            <div style={{ marginTop: "12px", fontSize: "12.5px", color: "#166534" }}>Note: {dispense.notes}</div>
          )}
        </div>
      )}

      {/* Print Slip */}
      <div className="animate-fade-up-delay-1">
        <PrescriptionPrintSlip data={printData} />
      </div>

      {/* Dispense Drawer */}
      <DispenseDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        prescriptionId={prescriptionId}
        medications={medications}
        onDone={() => router.refresh()}
      />
    </>
  );
}
