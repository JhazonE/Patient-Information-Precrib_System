"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const username = (formData.get("username") as string || "").trim();
  const password = (formData.get("password") as string) || "";

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  // ── 1. Try database users first ──────────────────────────────
  let authenticated = false;
  let sessionValue = "1";

  try {
    const { prisma } = await import("@/infrastructure/db/database");
    const dbUser = await prisma.user.findFirst({
      where: { username, isActive: true },
      select: { id: true, password: true },
    });

    if (dbUser && await bcrypt.compare(password, dbUser.password)) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { lastLoginAt: new Date() },
      });
      sessionValue = dbUser.id;
      authenticated = true;
    }
  } catch {
    // DB unavailable — fall through to env-var credentials below
  }

  // ── 2. Fallback: env-var bootstrap credentials ───────────────
  if (!authenticated) {
    const validUser = process.env.ADMIN_USERNAME || "admin";
    const validPass = process.env.ADMIN_PASSWORD || "admin123";
    if (username === validUser && password === validPass) {
      authenticated = true;
    }
  }

  if (authenticated) {
    (await cookies()).set("auth_session", sessionValue, {
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
