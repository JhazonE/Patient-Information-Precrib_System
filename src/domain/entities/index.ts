export interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  medications: MedicationItem[];
  instructions: string | null;
  createdAt: Date;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  // optional inventory link
  medicineId?: string;
  genericName?: string;
  formulation?: string;
  strength?: string;
  unit?: string;
}
