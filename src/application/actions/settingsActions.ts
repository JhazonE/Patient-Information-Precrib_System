"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/database";

const DOCTOR_ID = "cm00000000000000000000001";

export async function getDoctorProfile() {
  return await prisma.doctor.findUnique({ where: { id: DOCTOR_ID } });
}

export async function updateDoctorProfile(name: string, specialty: string) {
  await prisma.doctor.upsert({
    where: { id: DOCTOR_ID },
    create: {
      id: DOCTOR_ID,
      name,
      email: "dr.smith@patientcare.com",
      specialty,
    },
    update: { name, specialty },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/prescriptions");
}
