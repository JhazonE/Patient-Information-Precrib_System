"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const username = (formData.get("username") as string || "").trim();
  const password = formData.get("password") as string || "";

  const validUser = process.env.ADMIN_USERNAME || "admin";
  const validPass = process.env.ADMIN_PASSWORD || "admin123";

  if (username === validUser && password === validPass) {
    (await cookies()).set("auth_session", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    redirect("/dashboard");
  }

  return { error: "Invalid username or password." };
}

export async function logoutAction() {
  (await cookies()).delete("auth_session");
  redirect("/login");
}
