import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import { getMedicines, getInventoryStats } from "@/application/actions/inventoryActions";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  const [medicines, stats] = await Promise.all([
    getMedicines(search),
    getInventoryStats(),
  ]);

  return (
    <DashboardLayout>
      <InventoryClient medicines={medicines} stats={stats} initialSearch={search} />
    </DashboardLayout>
  );
}
