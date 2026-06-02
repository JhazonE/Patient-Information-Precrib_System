export const dynamic = "force-dynamic";

import { getUsers } from "@/application/actions/userActions";
import DashboardLayout from "@/presentation/layouts/DashboardLayout";
import UsersPanel from "@/app/admin/users/UsersPanel";

export default async function DashboardUsersPage() {
  const users = await getUsers();
  return (
    <DashboardLayout>
      <UsersPanel users={users} />
    </DashboardLayout>
  );
}
