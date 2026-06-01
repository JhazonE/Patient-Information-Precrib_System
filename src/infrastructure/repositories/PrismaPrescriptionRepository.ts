import { prisma } from '../db/database';
import { IPrescriptionRepository } from '../../domain/repositories';
import { Prescription, MedicationItem } from '../../domain/entities';

export class PrismaPrescriptionRepository implements IPrescriptionRepository {
  async findById(id: string): Promise<any | null> {
    return await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  async findAll(): Promise<any[]> {
    return await prisma.prescription.findMany({
      include: {
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true, specialty: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatientId(patientId: string): Promise<any[]> {
    return await prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: { select: { name: true, specialty: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(prescription: Omit<Prescription, 'id' | 'createdAt'>): Promise<Prescription> {
    const data = await prisma.prescription.create({
      data: {
        diagnosis: prescription.diagnosis,
        instructions: prescription.instructions,
        medications: prescription.medications as any,
        patient: { connect: { id: prescription.patientId } },
        doctor: { connect: { id: prescription.doctorId } },
      },
    });
    return data as any as Prescription;
  }
}
