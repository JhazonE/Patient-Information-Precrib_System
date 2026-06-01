import { prisma } from '../db/database';
import { IPatientRepository } from '../../domain/repositories';
import { Patient } from '../../domain/entities';

export class PrismaPatientRepository implements IPatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const data = await prisma.patient.findUnique({ where: { id } });
    return data as Patient | null;
  }

  async findAll(): Promise<Patient[]> {
    const data = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return data as Patient[];
  }

  async create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const data = await prisma.patient.create({
      data: {
        ...patient,
        dateOfBirth: new Date(patient.dateOfBirth),
      }
    });
    return data as Patient;
  }

  async update(id: string, patient: Partial<Patient>): Promise<Patient> {
    const data = await prisma.patient.update({
      where: { id },
      data: {
        ...patient,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
      }
    });
    return data as Patient;
  }

  async delete(id: string): Promise<void> {
    await prisma.patient.delete({ where: { id } });
  }
}
