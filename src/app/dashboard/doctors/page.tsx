import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { getDoctors } from "@/application/actions/doctorActions";
import DoctorsPanel from "./DoctorsPanel";

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const doctors = await getDoctors();

  return (
    <DashboardLayout>
      <DoctorsPanel doctors={doctors} />
    </DashboardLayout>
  );
}
