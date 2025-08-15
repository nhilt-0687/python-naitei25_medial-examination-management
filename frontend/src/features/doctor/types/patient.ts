import type { Appointment } from "./appointment"
import type { Schedule } from "./schedule"
import type { AppointmentNote } from "./appointmentNote"
import type { DoctorInfo } from "./doctor"

export interface Patient {
  id: number
  code: string
  fullName: string
  gender: "MALE" | "FEMALE"
  age: number
  symptoms: string
  status: string
  avatar?: string
  appointmentData?: Appointment
  birthday?: string
  address?: string
  allergies?: string | "Không xác định"
  height?: number | "Không xác định"
  weight?: number | "Không xác định"
  bloodType?: string | "Không xác định"
  identityNumber?: string
  insuranceNumber?: string
  userId?: number
  createdAt?: string
}

export interface PatientInfo extends Omit<Patient, "id" | "code" | "appointmentData" | "symptoms" | "status"> {}

export interface PatientDetail {
  appointmentId: string
  patientId: string
  patientInfo: PatientInfo
  symptoms: string
  number: number
  slotStart: string
  slotEnd: string
  doctorId: number
  schedule: Schedule
  appointmentStatus: string
  createdAt: string
  doctorInfo: DoctorInfo
  appointmentNote?: AppointmentNote
  vitalSigns?: {
    systolicBloodPressure?: number
    diastolicBloodPressure?: number
    heartRate?: number
    bloodSugar?: number
    temperature?: number
    weight?: number
  }
}
