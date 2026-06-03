"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/database";

const DOCTOR_ID = "cm00000000000000000000001";

async function ensureDefaultDoctor() {
  const exists = await prisma.doctor.findUnique({ where: { id: DOCTOR_ID } });
  if (!exists) {
    await prisma.doctor.create({
      data: {
        id:        DOCTOR_ID,
        name:      "Dr. Smith",
        email:     "dr.smith@patientcare.com",
        specialty: "General Practitioner",
      },
    });
  }
}

export async function createAppointment(formData: FormData) {
  const patientId       = formData.get("patientId")       as string;
  const appointmentDate = formData.get("appointmentDate") as string;
  const timeSlot        = formData.get("timeSlot")        as string;
  const type            = formData.get("type")            as string;
  const notes           = formData.get("notes")           as string;

  await ensureDefaultDoctor();

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

export async function createAppointmentWithNewPatient(formData: FormData) {
  const firstName  = (formData.get("firstName")  as string) ?? "";
  const middleName = (formData.get("middleName") as string) ?? "";
  const lastName   = (formData.get("lastName")   as string) ?? "";
  const dateOfBirth     = formData.get("dateOfBirth")     as string;
  const gender          = formData.get("gender")          as string;
  const phone           = (formData.get("phone")    as string) ?? "";
  const email           = (formData.get("email")    as string) ?? "";
  const address         = (formData.get("address")  as string) ?? "";
  const appointmentDate = formData.get("appointmentDate") as string;
  const timeSlot        = formData.get("timeSlot")        as string;
  const type            = formData.get("type")            as string;
  const notes           = (formData.get("notes")   as string) ?? "";

  const fullName = [firstName.trim(), middleName.trim(), lastName.trim()]
    .filter(Boolean)
    .join(" ");

  await ensureDefaultDoctor();

  let patient: any = null;
  if (email.trim()) {
    patient = await prisma.patient.findFirst({ where: { email: email.trim() } });
  }
  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        name:        fullName,
        email:       email.trim()   || null,
        phone:       phone.trim()   || null,
        dateOfBirth: new Date(dateOfBirth),
        gender:      gender as any,
        address:     address || null,
      },
    });
  }

  await prisma.appointment.create({
    data: {
      patientId:       patient.id,
      doctorId:        DOCTOR_ID,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      type,
      notes: notes.trim() || null,
    },
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
