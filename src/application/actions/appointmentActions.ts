"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/database";

const DOCTOR_ID = "cm00000000000000000000001";

export async function createAppointment(formData: FormData) {
  const patientId      = formData.get("patientId") as string;
  const appointmentDate = formData.get("appointmentDate") as string;
  const timeSlot       = formData.get("timeSlot") as string;
  const type           = formData.get("type") as string;
  const notes          = formData.get("notes") as string;

  await prisma.appointment.create({
    data: {
      patientId,
      doctorId: DOCTOR_ID,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      type,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
}

export async function getAppointments() {
  return await prisma.appointment.findMany({
    include: {
      patient: { select: { id: true, name: true, gender: true } },
      doctor:  { select: { id: true, name: true, specialty: true } },
    },
    orderBy: { appointmentDate: "asc" },
  });
}

export async function updateAppointmentStatus(id: string, status: string) {
  await prisma.appointment.update({
    where: { id },
    data: { status: status as any },
  });
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
}

export async function getUpcomingAppointments(limit = 5) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return await prisma.appointment.findMany({
    where: { appointmentDate: { gte: today }, status: "SCHEDULED" },
    include: { patient: { select: { id: true, name: true } } },
    orderBy: { appointmentDate: "asc" },
    take: limit,
  });
}

export async function getPatientAppointments(patientId: string) {
  return await prisma.appointment.findMany({
    where: { patientId },
    include: { doctor: { select: { name: true, specialty: true } } },
    orderBy: { appointmentDate: "desc" },
  });
}
