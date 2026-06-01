"use server";

import { revalidatePath } from "next/cache";
import { PrismaPatientRepository } from "@/infrastructure/repositories/PrismaPatientRepository";
import { Gender } from "@prisma/client";

const patientRepo = new PrismaPatientRepository();

export async function createPatient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const dob = formData.get("dob") as string;
  const gender = formData.get("gender") as Gender;
  const address = formData.get("address") as string;

  await patientRepo.create({
    name,
    email: email || null,
    phone: phone || null,
    dateOfBirth: new Date(dob),
    gender: gender as any,
    address: address || null,
  });

  revalidatePath("/dashboard/patients");
}

export async function getPatients() {
  return await patientRepo.findAll();
}

export async function getPatientById(id: string) {
  return await patientRepo.findById(id);
}
