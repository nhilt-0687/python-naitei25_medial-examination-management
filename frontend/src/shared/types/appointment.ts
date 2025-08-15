export interface Appointment {
  id: number
  patientId: number
  prescriptionId?: number
  patientInfo?: {
    id: number
    fullName: string
    email: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    avatar?: string
    first_name?: string
    last_name?: string
  }
  doctorId: number
  doctorInfo?: {
    id: number
    fullName: string
    specialization: string // Changed from specialty to specialization
    department?: string // Added department as optional
    avatar?: string
    experience?: number
    rating?: number
    price?: number
    consultationFee?: number
  }
  // Removed appointmentDate and appointmentTime as they are derived from schedule and slot_start/slot_end
  status: string // Changed to string to match backend single-character status (e.g., 'C', 'P')
  symptoms?: string
  notes?: string
  diagnosis?: string
  treatment?: string
  prescription?: string
  followUpDate?: string
  cancellationReason?: string
  createdAt: string
  updatedAt?: string // Made optional as it might not always be present
  schedule?: {
    id: number
    shift: "M" | "A"
    room: number
    floor?: number
    building?: string
    start_time?: string // Added start_time
    end_time?: string // Added end_time
    work_date?: string // Added work_date
    location?: string // Added location
    room_note?: string // Added room_note
  }
  slot_start?: string // Added slot_start
  slot_end?: string // Added slot_end
  appointment_notes?: AppointmentNote[] // Added appointment_notes
  service_orders?: any[] // Added service_orders
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export interface CreateAppointmentPayload {
  doctorId: number
  appointmentDate: string
  appointmentTime: string
  symptoms?: string
  notes?: string
}

export interface BackendCreateAppointmentPayload {
  doctor: number
  patient: number
  schedule: number
  slot_start: string
  slot_end: string
  symptoms: string
  status: string
}

export interface UpdateAppointmentPayload {
  appointmentDate?: string
  appointmentTime?: string
  status?: AppointmentStatus
  symptoms?: string
  notes?: string
  diagnosis?: string
  treatment?: string
  prescription?: string
}

export interface AppointmentNote {
  id: number
  appointmentId: number
  noteType: "DIAGNOSIS" | "PRESCRIPTION" | "GENERAL"
  content: string
  createdBy?: number // Made optional
  createdAt: string
  updatedAt?: string // Made optional
}

export interface AvailableSlot {
  slot_start: string
  slot_end: string
  available: boolean
  scheduleId?: number
}

export interface AppointmentFilter {
  status?: AppointmentStatus
  doctorId?: number
  patientId?: number
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
