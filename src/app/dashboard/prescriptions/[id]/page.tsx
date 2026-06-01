import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { getPrescriptionById } from "@/application/actions/prescriptionActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/presentation/components/PrintButton";
import PrescriptionPrintSlip, {
  PrescriptionPrintData,
} from "@/presentation/components/PrescriptionPrintSlip";

export default async function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prescription = await getPrescriptionById(id);

  if (!prescription) notFound();

  const age = prescription.patient?.dateOfBirth
    ? Math.floor(
        (new Date().getTime() -
          new Date(prescription.patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const printData: PrescriptionPrintData = {
    id: prescription.id,
    createdAtStr: new Date(prescription.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    diagnosis: prescription.diagnosis,
    medications: (prescription.medications as any[]) ?? [],
    instructions: prescription.instructions ?? null,
    patient: {
      name: prescription.patient?.name ?? "Unknown",
      gender: prescription.patient?.gender ?? "OTHER",
      age,
    },
    doctor: {
      name: prescription.doctor?.name ?? "Unknown",
      specialty: prescription.doctor?.specialty ?? null,
    },
  };

  return (
    <DashboardLayout>
      {/* Back + Actions — hidden during print */}
      <div
        className="animate-fade-up no-print"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <Link
          href="/dashboard/prescriptions"
          style={{
            fontSize: "13.5px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← Back to Prescriptions
        </Link>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "12.5px",
              color: "var(--text-muted)",
              fontStyle: "italic",
            }}
          >
            Clinic info pulled from Settings
          </span>
          <PrintButton />
        </div>
      </div>

      {/* Print Slip (clinic name/address from localStorage via client component) */}
      <div className="animate-fade-up-delay-1">
        <PrescriptionPrintSlip data={printData} />
      </div>
    </DashboardLayout>
  );
}
