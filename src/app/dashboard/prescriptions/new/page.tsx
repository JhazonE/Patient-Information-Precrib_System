import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import PrescriptionForm from "@/presentation/components/PrescriptionForm";
import { getPatients } from "@/application/actions/patientActions";
import React from "react";

export default async function NewPrescriptionPage() {
  const patients = await getPatients();

  return (
    <DashboardLayout>
      <PrescriptionForm patients={patients} />
    </DashboardLayout>
  );
}
