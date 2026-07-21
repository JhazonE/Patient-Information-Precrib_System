import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { getLabTests } from "@/application/actions/laboratoryActions";
import { getPatients } from "@/application/actions/patientActions";
import { prisma } from "@/infrastructure/db/database";
import NewLabRequestClient from "./NewLabRequestClient";

export const dynamic = "force-dynamic";

export default async function NewLabRequestPage() {
  const [patients, doctors, labTests] = await Promise.all([
    getPatients(),
    prisma.doctor.findMany({ orderBy: { name: "asc" } }),
    getLabTests(),
  ]);

  return (
    <DashboardLayout>
      <NewLabRequestClient patients={patients} doctors={doctors} labTests={labTests} />
    </DashboardLayout>
  );
}
