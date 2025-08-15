export interface RawPatientFromAPI {
  id: number;
  created_at?: string;
  updated_at?: string;
  identity_number?: string;
  insurance_number?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  birthday?: string;
  gender: string;
  address?: string;
  allergies?: string | null;
  height?: number | null;
  weight?: number | null;
  blood_type?: string | null;
  user?: number;
  avatar?: string;
}

export interface Patient {
  patientId: number;
  userId?: number;
  identityNumber: string;
  insuranceNumber: string;
  fullName: string;
  birthday: string;
  phone: string;
  email?: string;
  avatar?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address: string;
  allergies?: string;
  height?: number;
  weight?: number;
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  createdAt: string;
  contacts?: EmergencyContact[];
  age?: number;
}

export interface CreatePatientRequest {
  email: string;
  phone: string;
  password: string;
  identityNumber: string;
  insuranceNumber: string;
  first_name: string;
  last_name: string;
  birthday: string;
  avatar?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  allergies?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  emergencyContactDtos?: EmergencyContactDto[];
}

export interface PatientUpdateDto {
  userId?: number;
  identityNumber?: string;
  insuranceNumber?: string;
  first_name?: string;
  last_name?: string;
  birthday?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  allergies?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
}

export interface EmergencyContact {
  contactId: number;
  patientId: number;
  contactName: string;
  contactPhone: string;
  relationship: "FAMILY" | "FRIEND" | "OTHERS";
  createdAt: string;
}

export interface EmergencyContactDto {
  contactName: string;
  contactPhone: string;
  relationship: "FAMILY" | "FRIEND" | "OTHERS";
}

export interface RoomDetail {
  detailId: number;
  roomId: number;
  patientId: number;
  createdAt: string;
}

export interface RoomDetailDto {
  roomId: number;
  patientId: number;
}

export interface PatientRoom {
  roomId: number;
  roomName: string;
  maxCapacity: number;
  note: string;
  createdAt: string;
}

export interface PatientRoomDto {
  roomName: string;
  maxCapacity: number;
  note?: string;
}