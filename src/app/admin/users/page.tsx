export const dynamic = "force-dynamic";

import { getUsers } from "@/application/actions/userActions";
import UsersPanel from "./UsersPanel";

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersPanel users={users} />;
}
