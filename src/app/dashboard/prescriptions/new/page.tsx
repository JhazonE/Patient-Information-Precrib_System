import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import PrescriptionForm from "@/presentation/components/PrescriptionForm";
import { getPatients } from "@/application/actions/patientActions";
import { getDoctors } from "@/application/actions/doctorActions";
import React from "react";

export const dynamic = "force-dynamic";

export default async function NewPrescriptionPage() {
  const [patients, doctors] = await Promise.all([getPatients(), getDoctors()]);

  return (
    <DashboardLayout>
      <PrescriptionForm patients={patients} doctors={doctors} />
    </DashboardLayout>
  );
}
