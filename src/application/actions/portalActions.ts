"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/database";

const DOCTOR_ID = "cm00000000000000000000001";

export interface BookingPayload {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  appointmentDate: string;
  timeSlot: string;
  type: string;
  notes: string;
}

export async function bookAppointment(data: BookingPayload) {
  const fullName = [data.firstName.trim(), data.middleName.trim(), data.lastName.trim()]
    .filter(Boolean)
    .join(" ");

  // Reuse existing patient if email matches, otherwise create new
  let patient: any = null;
  if (data.email.trim()) {
    patient = await prisma.patient.findFirst({ where: { email: data.email.trim() } });
  }

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        name: fullName,
        email: data.email.trim() || null,
        phone: data.phone.trim() || null,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender as any,
        address: data.address || null,
      },
    });
  }

  // Ensure default doctor exists
  const doctorExists = await prisma.doctor.findUnique({ where: { id: DOCTOR_ID } });
  if (!doctorExists) {
    await prisma.doctor.create({
      data: {
        id: DOCTOR_ID,
        name: "Dr. Smith",
        email: "dr.smith@patientcare.com",
        specialty: "Cardiologist",
      },
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: DOCTOR_ID,
      appointmentDate: new Date(data.appointmentDate),
      timeSlot: data.timeSlot,
      type: data.type,
      notes: data.notes.trim() || null,
    },
  });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");

  return {
    referenceNo: appointment.id.slice(-8).toUpperCase(),
    patientName: patient.name,
    appointmentDate: new Date(data.appointmentDate).toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    timeSlot: data.timeSlot,
    type: data.type,
  };
}
