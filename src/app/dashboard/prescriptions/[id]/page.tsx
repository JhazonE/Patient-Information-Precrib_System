import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { getPrescriptionById } from "@/application/actions/prescriptionActions";
import { getDispenseByPrescription } from "@/application/actions/dispensingActions";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/presentation/components/PrintButton";
import PrescriptionPrintSlip, { PrescriptionPrintData } from "@/presentation/components/PrescriptionPrintSlip";
import PrescriptionDetailClient from "./PrescriptionDetailClient";

export default async function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [prescription, dispense] = await Promise.all([
    getPrescriptionById(id),
    getDispenseByPrescription(id),
  ]);

  if (!prescription) notFound();

  const age = prescription.patient?.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(prescription.patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const printData: PrescriptionPrintData = {
    id: prescription.id,
    createdAtStr: new Date(prescription.createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
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
      <PrescriptionDetailClient
        prescriptionId={id}
        medications={(prescription.medications as any[]) ?? []}
        dispense={dispense}
        printData={printData}
      />
    </DashboardLayout>
  );
}
