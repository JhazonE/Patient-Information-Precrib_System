"use server";

import { prisma } from "@/infrastructure/db/database";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export type UserRow = {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: "ADMIN" | "DOCTOR" | "STAFF";
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export async function getUsers(): Promise<UserRow[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });
}

export async function createUser(data: {
  username: string;
  name: string;
  email?: string;
  password: string;
  role: "ADMIN" | "DOCTOR" | "STAFF";
}): Promise<{ error?: string }> {
  try {
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing) return { error: "Username is already taken." };

    const passwordHash = await bcrypt.hash(data.password, 10);
    await prisma.user.create({
      data: {
        username: data.username,
        name: data.name,
        email: data.email || null,
        password: passwordHash,
        role: data.role,
      },
    });
    revalidatePath("/admin/users");
    return {};
  } catch {
    return { error: "Failed to create user. Please try again." };
  }
}

export async function updateUser(
  id: string,
  data: {
    username?: string;
    name?: string;
    email?: string;
    password?: string;
    role?: "ADMIN" | "DOCTOR" | "STAFF";
    isActive?: boolean;
  }
): Promise<{ error?: string }> {
  try {
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: data.username, NOT: { id } },
      });
      if (existing) return { error: "Username is already taken." };
    }

    const updateData: Record<string, unknown> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    await prisma.user.update({ where: { id }, data: updateData });
    revalidatePath("/admin/users");
    return {};
  } catch {
    return { error: "Failed to update user. Please try again." };
  }
}

export async function deleteUser(id: string): Promise<{ error?: string }> {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return {};
  } catch {
    return { error: "Failed to delete user." };
  }
}

export async function toggleUserStatus(
  id: string,
  isActive: boolean
): Promise<{ error?: string }> {
  try {
    await prisma.user.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/users");
    return {};
  } catch {
    return { error: "Failed to update status." };
  }
}
