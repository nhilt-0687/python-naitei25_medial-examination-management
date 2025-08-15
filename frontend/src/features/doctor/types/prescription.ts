import type { PrescriptionDetail } from './prescriptionDetail';

export interface Prescription {
  prescriptionId: number;
  patientId: number;
  appointmentId: number;
  followUpDate?: string; // ISO format (yyyy-mm-dd)
  isFollowUp: boolean;
  diagnosis: string;
  systolicBloodPressure: number;
  diastolicBloodPressure: number;
  heartRate: number;
  bloodSugar: number;
  note: string;
  createdAt: string; // ISO format datetime
  prescriptionDetails: PrescriptionDetail[];
}
