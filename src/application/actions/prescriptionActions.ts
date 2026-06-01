"use server";

import { revalidatePath } from "next/cache";
import { PrismaPrescriptionRepository } from "@/infrastructure/repositories/PrismaPrescriptionRepository";
import { MedicationItem } from "@/domain/entities";
import { prisma } from "@/infrastructure/db/database";

const prescriptionRepo = new PrismaPrescriptionRepository();

const DEFAULT_DOCTOR = {
  id: "cm00000000000000000000001",
  name: "Dr. Smith",
  email: "dr.smith@patientcare.com",
  specialty: "Cardiologist",
};

export async function createPrescription(formData: FormData, medications: MedicationItem[]) {
  const patientId = formData.get("patientId") as string;
  const diagnosis = formData.get("diagnosis") as string;
  const instructions = formData.get("instructions") as string;

  // Hardcoded Doctor ID until auth is implemented
  const doctorId = DEFAULT_DOCTOR.id;

  // Ensure the default doctor exists (temporary until auth is added)
  const doctorExists = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctorExists) {
    await prisma.doctor.create({ data: DEFAULT_DOCTOR });
  }

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
