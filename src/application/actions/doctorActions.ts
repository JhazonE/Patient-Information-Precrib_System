"use server";

import { prisma } from "@/infrastructure/db/database";
import { revalidatePath } from "next/cache";

export type DoctorRow = {
  id: string;
  name: string;
  email: string;
  specialty: string | null;
  licenseNumber: string | null;
  createdAt: Date;
  _count: { prescriptions: number; labRequests: number };
};

export async function getDoctors(): Promise<DoctorRow[]> {
  return prisma.doctor.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { prescriptions: true, labRequests: true } } },
  });
}

export async function createDoctor(data: {
  name: string;
  email: string;
  specialty?: string;
  licenseNumber?: string;
}): Promise<{ error?: string }> {
  try {
    const existing = await prisma.doctor.findUnique({ where: { email: data.email } });
    if (existing) return { error: "A doctor with this email already exists." };

    await prisma.doctor.create({
      data: {
        name: data.name,
        email: data.email,
        specialty: data.specialty || null,
        licenseNumber: data.licenseNumber || null,
      },
    });
    revalidatePath("/dashboard/doctors");
    revalidatePath("/dashboard/prescriptions/new");
    revalidatePath("/dashboard/laboratory/new");
    return {};
  } catch {
    return { error: "Failed to create doctor. Please try again." };
  }
}

export async function updateDoctor(
  id: string,
  data: { name: string; email: string; specialty?: string; licenseNumber?: string }
): Promise<{ error?: string }> {
  try {
    const existing = await prisma.doctor.findFirst({
      where: { email: data.email, NOT: { id } },
    });
    if (existing) return { error: "A doctor with this email already exists." };

    await prisma.doctor.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        specialty: data.specialty || null,
        licenseNumber: data.licenseNumber || null,
      },
    });
    revalidatePath("/dashboard/doctors");
    revalidatePath("/dashboard/prescriptions/new");
    revalidatePath("/dashboard/laboratory/new");
    return {};
  } catch {
    return { error: "Failed to update doctor. Please try again." };
  }
}

export async function deleteDoctor(id: string): Promise<{ error?: string }> {
  try {
    await prisma.doctor.delete({ where: { id } });
    revalidatePath("/dashboard/doctors");
    revalidatePath("/dashboard/prescriptions/new");
    revalidatePath("/dashboard/laboratory/new");
    return {};
  } catch {
    return { error: "Cannot delete this doctor — they have existing prescriptions or lab requests." };
  }
}
