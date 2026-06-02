import { redirect } from "next/navigation";

// Proxy handles unauthenticated users at "/" → /login.
// Authenticated users fall through here and land on the dashboard.
export default function Home() {
  redirect("/dashboard");
}
