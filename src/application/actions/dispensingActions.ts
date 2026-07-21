"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/database";

export type DispensePayload = {
  prescriptionId: string;
  dispensedBy: string;
  notes?: string;
  items: { medicineId: string; quantity: number; unit: string }[];
};

export async function dispense(payload: DispensePayload): Promise<{ error?: string }> {
  const { prescriptionId, dispensedBy, notes, items } = payload;

  // Guard: already dispensed
  const existing = await prisma.dispense.findUnique({ where: { prescriptionId } });
  if (existing) return { error: "This prescription has already been dispensed." };

  // Guard: check stock for each item
  for (const item of items) {
    if (item.quantity <= 0) continue;
    const med = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
    if (!med) return { error: `Medicine not found.` };
    if (med.stock < item.quantity) {
      return { error: `Insufficient stock for ${med.name}. Available: ${med.stock} ${med.unit}.` };
    }
  }

  // Create dispense record + deduct stock in a transaction
  await prisma.$transaction(async (tx) => {
    const dispenseRecord = await tx.dispense.create({
      data: {
        prescriptionId,
        dispensedBy: dispensedBy || null,
        notes: notes || null,
      },
    });

    for (const item of items) {
      if (item.quantity <= 0) continue;
      await tx.dispenseItem.create({
        data: {
          dispenseId: dispenseRecord.id,
          medicineId: item.medicineId,
          quantity: item.quantity,
          unit: item.unit,
        },
      });
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  });

  revalidatePath("/dashboard/prescriptions");
  revalidatePath(`/dashboard/prescriptions/${prescriptionId}`);
  revalidatePath("/dashboard/inventory");
  return {};
}

export async function getDispenseByPrescription(prescriptionId: string) {
  return prisma.dispense.findUnique({
    where: { prescriptionId },
    include: {
      items: {
        include: {
          medicine: { select: { id: true, name: true, genericName: true, unit: true } },
        },
      },
    },
  });
}
