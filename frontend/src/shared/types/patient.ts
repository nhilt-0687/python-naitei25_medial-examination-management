import type { Gender, BloodType, Relationship } from "../constants/enums"

export interface Patient {
  patientId: number;
  identityNumber: string;
  insuranceNumber: string;
  fullName: string;
  birthday: string;
  gender: Gender;
  address: string;
  allergies: string;
  height: number; // đơn vị: cm
  weight: number; // đơn vị: kg
  bloodType: BloodType;
  createdAt: string;
  contacts?: EmergencyContact[];
}

export interface PatientDto {
  identityNumber: string;
  insuranceNumber: string;
  fullName: string;
  birthday: string;
  gender: Gender;
  address: string;
  allergies: string;
  height: number;
  weight: number;
  bloodType: BloodType;
}

export interface EmergencyContact {
  contactId: number;
  contactName: string;
  contactPhone: string;
  relationship: Relationship;
  createdAt: string;
  patientId: number;
}

export interface EmergencyContactDto {
  contactName: string;
  contactPhone: string;
  relationship: Relationship;
}
