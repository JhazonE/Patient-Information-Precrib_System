"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/db/database";
import { LabStatus } from "@prisma/client";

const REVALIDATE = "/dashboard/laboratory";

// ─── Lab Tests (catalog) ─────────────────────────────────────────────────────

export async function getLabTests() {
  return prisma.labTest.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function createLabTest(formData: FormData) {
  await prisma.labTest.create({
    data: {
      name:        formData.get("name") as string,
      code:        (formData.get("code") as string).toUpperCase().trim(),
      category:    formData.get("category") as string,
      description: (formData.get("description") as string) || null,
      normalRange: (formData.get("normalRange") as string) || null,
      unit:        (formData.get("unit") as string) || null,
      price:       formData.get("price") ? parseFloat(formData.get("price") as string) : null,
    },
  });
  revalidatePath(REVALIDATE);
}

// ─── Lab Requests ─────────────────────────────────────────────────────────────

export async function getLabRequests(status?: LabStatus) {
  return prisma.labRequest.findMany({
    where: status ? { status } : undefined,
    include: {
      patient: { select: { id: true, name: true, gender: true, dateOfBirth: true } },
      doctor:  { select: { id: true, name: true, specialty: true } },
      results: { include: { test: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLabRequestById(id: string) {
  return prisma.labRequest.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor:  true,
      results: { include: { test: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getPatientLabRequests(patientId: string) {
  return prisma.labRequest.findMany({
    where: { patientId },
    include: {
      doctor:  { select: { name: true, specialty: true } },
      results: { include: { test: { select: { name: true, code: true, category: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLabRequest(formData: FormData) {
  const testIds = (formData.get("testIds") as string).split(",").filter(Boolean);

  const request = await prisma.labRequest.create({
    data: {
      patientId:     formData.get("patientId") as string,
      doctorId:      formData.get("doctorId") as string,
      requestedById: (formData.get("requestedById") as string) || null,
      priority:      (formData.get("priority") as string) || "ROUTINE",
      notes:         (formData.get("notes") as string) || null,
      status:        "PENDING",
    },
  });

  // pre-create empty result slots for each selected test
  if (testIds.length > 0) {
    await prisma.labResult.createMany({
      data: testIds.map((testId) => ({
        requestId: request.id,
        testId,
      })),
    });
  }

  revalidatePath(REVALIDATE);
  return request.id;
}

export async function updateLabRequestStatus(id: string, status: LabStatus) {
  await prisma.labRequest.update({ where: { id }, data: { status } });
  revalidatePath(REVALIDATE);
  revalidatePath(`/dashboard/laboratory/${id}`);
}

// ─── Lab Results ─────────────────────────────────────────────────────────────

export async function saveLabResults(requestId: string, formData: FormData) {
  const results = await prisma.labResult.findMany({ where: { requestId } });

  await Promise.all(
    results.map((r) => {
      const value          = formData.get(`value_${r.id}`) as string;
      const unit           = formData.get(`unit_${r.id}`) as string;
      const normalRange    = formData.get(`normalRange_${r.id}`) as string;
      const interpretation = formData.get(`interpretation_${r.id}`) as string;
      const remarks        = formData.get(`remarks_${r.id}`) as string;
      const performedBy    = formData.get(`performedBy_${r.id}`) as string;

      return prisma.labResult.update({
        where: { id: r.id },
        data: {
          value:          value || null,
          unit:           unit || null,
          normalRange:    normalRange || null,
          interpretation: interpretation || null,
          remarks:        remarks || null,
          performedBy:    performedBy || null,
          performedAt:    value ? new Date() : null,
        },
      });
    })
  );

  // auto-complete if all results have a value
  const allFilled = results.length > 0;
  if (allFilled) {
    await prisma.labRequest.update({
      where: { id: requestId },
      data:  { status: "COMPLETED" },
    });
  }

  revalidatePath(REVALIDATE);
  revalidatePath(`/dashboard/laboratory/${requestId}`);
}

export async function getLabStats() {
  const [total, pending, inProgress, completed] = await Promise.all([
    prisma.labRequest.count(),
    prisma.labRequest.count({ where: { status: "PENDING" } }),
    prisma.labRequest.count({ where: { status: "IN_PROGRESS" } }),
    prisma.labRequest.count({ where: { status: "COMPLETED" } }),
  ]);
  return { total, pending, inProgress, completed };
}
