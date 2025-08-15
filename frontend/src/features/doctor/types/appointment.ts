import type { AppointmentNote } from "./appointmentNote"
import type { Schedule } from "./schedule"
import type { Patient } from "../../../shared/types/patient"

export interface Appointment {
  appointmentId: number
  patientId: number
  patientInfo: Patient | null // Có thể null
  symptoms: string
  number: number
  schedule: Schedule
  appointmentStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING_TEST_RESULT" | "IN_PROGRESS"
  createdAt: string
  appointmentNotes?: AppointmentNote | null
  slotEnd?: string // Format: "HH:mm:ss"
  slotStart?: string // Format: "HH:mm:ss"
}

// Interface cho response phân trang
export interface PaginatedResponse<T> {
  content: T[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

// Interface cho filters frontend
export interface AppointmentFilters {
  work_date?: string // YYYY-MM-DD format
  shift?: string
  appointmentStatus?: string
  roomId?: number
  searchTerm?: string
  gender?: string
}

export interface AppointmentStats {
  total: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  pendingTestResult: number
  inProgress: number
}

export type Shift = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT" | 'SURGERY' | 'MEETING';
