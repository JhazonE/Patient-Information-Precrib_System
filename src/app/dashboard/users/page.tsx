export const dynamic = "force-dynamic";

import { getUsers } from "@/application/actions/userActions";
import UsersPanel from "@/app/admin/users/UsersPanel";

export default async function DashboardUsersPage() {
  const users = await getUsers();
  return <UsersPanel users={users} />;
}
