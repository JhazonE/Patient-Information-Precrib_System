"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/database";

const REVALIDATE = "/dashboard/inventory";

export async function getMedicines(search = "") {
  return prisma.medicine.findMany({
    where: search
      ? {
          isActive: true,
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { genericName: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
          ],
        }
      : { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMedicineById(id: string) {
  return prisma.medicine.findUnique({ where: { id } });
}

export async function createMedicine(formData: FormData) {
  await prisma.medicine.create({
    data: {
      name:         formData.get("name") as string,
      genericName:  (formData.get("genericName") as string) || null,
      formulation:  formData.get("formulation") as string,
      strength:     formData.get("strength") as string,
      unit:         formData.get("unit") as string,
      category:     (formData.get("category") as string) || null,
      stock:        parseInt(formData.get("stock") as string) || 0,
      reorderLevel: parseInt(formData.get("reorderLevel") as string) || 10,
      price:        formData.get("price") ? parseFloat(formData.get("price") as string) : null,
      supplier:     (formData.get("supplier") as string) || null,
      expiryDate:   formData.get("expiryDate") ? new Date(formData.get("expiryDate") as string) : null,
      batchNumber:  (formData.get("batchNumber") as string) || null,
      description:  (formData.get("description") as string) || null,
    },
  });
  revalidatePath(REVALIDATE);
}

export async function updateMedicine(id: string, formData: FormData) {
  await prisma.medicine.update({
    where: { id },
    data: {
      name:         formData.get("name") as string,
      genericName:  (formData.get("genericName") as string) || null,
      formulation:  formData.get("formulation") as string,
      strength:     formData.get("strength") as string,
      unit:         formData.get("unit") as string,
      category:     (formData.get("category") as string) || null,
      stock:        parseInt(formData.get("stock") as string) || 0,
      reorderLevel: parseInt(formData.get("reorderLevel") as string) || 10,
      price:        formData.get("price") ? parseFloat(formData.get("price") as string) : null,
      supplier:     (formData.get("supplier") as string) || null,
      expiryDate:   formData.get("expiryDate") ? new Date(formData.get("expiryDate") as string) : null,
      batchNumber:  (formData.get("batchNumber") as string) || null,
      description:  (formData.get("description") as string) || null,
    },
  });
  revalidatePath(REVALIDATE);
}

export async function deleteMedicine(id: string) {
  await prisma.medicine.update({ where: { id }, data: { isActive: false } });
  revalidatePath(REVALIDATE);
}

export async function searchMedicines(query: string) {
  if (!query || query.trim().length < 1) return [];
  return prisma.medicine.findMany({
    where: {
      isActive: true,
      OR: [
        { name:        { contains: query, mode: "insensitive" } },
        { genericName: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true, name: true, genericName: true,
      formulation: true, strength: true, unit: true,
      stock: true, reorderLevel: true,
    },
    orderBy: { name: "asc" },
    take: 10,
  });
}

export async function getInventoryStats() {
  const medicines = await prisma.medicine.findMany({ where: { isActive: true } });
  return {
    total:      medicines.length,
    lowStock:   medicines.filter((m) => m.stock > 0 && m.stock <= m.reorderLevel).length,
    outOfStock: medicines.filter((m) => m.stock === 0).length,
  };
}
