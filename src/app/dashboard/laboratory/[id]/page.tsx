import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { getLabRequestById } from "@/application/actions/laboratoryActions";
import { notFound } from "next/navigation";
import LabRequestClient from "./LabRequestClient";

export const dynamic = "force-dynamic";

export default async function LabRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getLabRequestById(id);
  if (!request) notFound();

  return (
    <DashboardLayout>
      <LabRequestClient request={request} />
    </DashboardLayout>
  );
}
