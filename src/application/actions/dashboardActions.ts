"use server";

import { prisma } from "@/infrastructure/db/database";

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalPatients, patientsToday, prescriptionsToday, totalPrescriptions, appointmentsToday] =
    await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: { gte: today } } }),
      prisma.prescription.count({ where: { createdAt: { gte: today } } }),
      prisma.prescription.count(),
      prisma.appointment.count({
        where: { appointmentDate: { gte: today, lt: tomorrow } },
      }),
    ]);

  return { totalPatients, patientsToday, prescriptionsToday, totalPrescriptions, appointmentsToday };
}
