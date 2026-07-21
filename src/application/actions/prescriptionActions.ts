"use server";

import { revalidatePath } from "next/cache";
import { PrismaPrescriptionRepository } from "@/infrastructure/repositories/PrismaPrescriptionRepository";
import { MedicationItem } from "@/domain/entities";

const prescriptionRepo = new PrismaPrescriptionRepository();

export async function createPrescription(formData: FormData, medications: MedicationItem[]) {
  const patientId = formData.get("patientId") as string;
  const doctorId  = formData.get("doctorId") as string;
  const diagnosis = formData.get("diagnosis") as string;
  const instructions = formData.get("instructions") as string;

  if (!doctorId) throw new Error("No doctor selected.");

  await prescriptionRepo.create({
    patientId,
    doctorId,
    diagnosis,
    medications,
    instructions: instructions || null,
  });

  revalidatePath("/dashboard/prescriptions");
  revalidatePath("/dashboard");
}

export async function getPrescriptions() {
  return await prescriptionRepo.findAll();
}

export async function getPrescriptionById(id: string) {
  return await prescriptionRepo.findById(id);
}

export async function getPatientPrescriptions(patientId: string) {
  return await prescriptionRepo.findByPatientId(patientId);
}
