import { Patient, Prescription } from '../entities';

export interface IPatientRepository {
  findById(id: string): Promise<Patient | null>;
  findAll(): Promise<Patient[]>;
  create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  update(id: string, patient: Partial<Patient>): Promise<Patient>;
  delete(id: string): Promise<void>;
}

export interface IPrescriptionRepository {
  findById(id: string): Promise<any | null>;
  findAll(): Promise<any[]>;
  findByPatientId(patientId: string): Promise<any[]>;
  create(prescription: Omit<Prescription, 'id' | 'createdAt'>): Promise<Prescription>;
}
