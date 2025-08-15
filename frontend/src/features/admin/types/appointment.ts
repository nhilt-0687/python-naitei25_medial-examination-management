import type { EventInput } from "@fullcalendar/core"

// Kiểu trạng thái lịch khám cho CalendarEvent
export type EventStatus = "danger" | "success" | "waiting" | "cancel" | "no-show"

// Ánh xạ tên trạng thái và giá trị
export const EVENT_STATUS_MAP = {
  "Khẩn cấp": "danger" as EventStatus,
  "Đã khám": "success" as EventStatus,
  "Chờ khám": "waiting" as EventStatus,
  Hủy: "cancel" as EventStatus,
  "Không đến": "no-show" as EventStatus,
}

// Định nghĩa AppointmentStatus enum
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
  IN_PROGRESS = "IN_PROGRESS",
}

// Định nghĩa AppointmentStatus enum
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
  IN_PROGRESS = "IN_PROGRESS",
}

// Định nghĩa AppointmentStatus enum
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
  IN_PROGRESS = "IN_PROGRESS",
}

// Interface cho sự kiện lịch
export interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: EventStatus
    patientName: string
    patientId?: string
    insuranceId?: string
    phoneNumber?: string
    patientAge?: number
    symptoms?: string
    eventTime?: string
    doctorName?: string
    department?: string
    departmentId?: string
    doctorId?: string
    appointmentStatus?: AppointmentStatus
    appointmentId?: number
  }
}

// Interface cho form dữ liệu
export interface EventFormData {
  patientName: string
  patientId: string
  insuranceId: string
  phoneNumber: string
  patientAge: number
  symptoms: string
  date: string
  time: string
  doctorName: string
  doctorId: string
  department: string
  departmentId: string
  status: string
}

// SERVICE
export type ServiceType = "TEST" | "IMAGING" | "CONSULTATION" | "OTHER"

export interface Service {
  serviceId: number
  serviceName: string
  serviceType: ServiceType
  price: number
  createdAt: string
}

export interface ServiceDto {
  serviceName: string
  serviceType: ServiceType
  price: number
}

export interface ServiceOrder {
  orderId: number
  appointmentId: number
  roomId: number
  service: Service
  orderStatus: "ORDERED" | "COMPLETED"
  result: string
  number: number
  orderTime: string
  resultTime: string
  createdAt: string
}

export interface ServiceOrderDto {
  appointmentId: number
  roomId: number
  serviceId: number
  orderStatus: "ORDERED" | "COMPLETED"
  result: string
  number: number
  orderTime: string
  resultTime: string
}

export interface Appointment {
  appointmentId: number
  doctorId: number
  patientId: number
  scheduleId: number
  symptoms: string
  slotStart: string
  slotEnd: string
  number: number
  appointmentStatus: AppointmentStatus
  createdAt: string
  doctorInfo: {
    doctorId: number
    fullName: string
    academicDegree: string
    specialization: string
  }
}

export interface AppointmentDto {
  doctorId: number
  patientId: number
  scheduleId: number
  symptoms: string
  slotStart: string
  slotEnd: string
  number: number
  appointmentStatus: AppointmentStatus
}

export interface AppointmentNote {
  noteId: number
  appointmentId: number
  noteType: "DOCTOR" | "PATIENT"
  noteText: string
  createdAt: string
}

export interface AppointmentNoteDto {
  appointmentId: number
  noteType: "DOCTOR" | "PATIENT"
  noteText: string
}

// UPDATED: Shift enum to match backend (models.py)
export type Shift = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT"

export interface Schedule {
  id: number
  doctorId: number
  doctorName: string
  departmentId: number
  departmentName: string
  workDate: string
  startTime: string
  endTime: string
  maxPatients: number
  currentPatients: number
  status: "AVAILABLE" | "FULL" | "CANCELLED"
  defaultAppointmentDurationMinutes?: number
  shift: Shift // Thêm trường shift
}

export interface ScheduleDto extends Schedule {
  workDate: string
}

export interface Patient {
  id: number
  fullName: string
  phoneNumber: string
  insuranceId?: string
  age: number
  gender: "MALE" | "FEMALE" | "OTHER"
  address: string
  birthday?: string
  userId?: number
}

export interface PatientDto {
  patientId: number
  userId: number
  identityNumber: string
  insuranceNumber: string
  fullName: string
  avatar: string
  birthday: string
  gender: string
  address: string
  allergies: string
  height: number
  weight: number
  bloodType: string
  createdAt: string
}

export interface DoctorDto {
  doctorId: number
  userId: number
  identityNumber: string
  fullName: string
  avatar: string
  birthday: string
  gender: string
  address: string
  academicDegree: string
  specialization: string
  type: string
  consultationFee: string
  departmentId: number
  departmentName: string
  createdAt: string
}

export interface AppointmentUpdateRequest {
  appointmentId?: number
  doctorId?: number
  patientId?: number
  scheduleId?: number
  symptoms?: string
  appointmentStatus: AppointmentStatus
  slotStart?: string
  slotEnd?: string
}

export interface AppointmentRequest {
  doctor: number
  patient: number
  schedule: number
  symptoms: string
  slot_start: string
  slot_end: string
  appointment_status?: AppointmentStatus
}

export interface AppointmentResponse {
  appointmentId: number
  schedule: Schedule
  orderNumber?: string
  appointmentStatus: AppointmentStatus
  slotStart: string
  slotEnd: string
  symptoms: string
  doctorId: number
  patientInfo: {
    patientId: number
    fullName: string
    phoneNumber: string
    insuranceId?: string
    age: number
    gender: "MALE" | "FEMALE" | "OTHER"
  }
  doctorInfo?: {
    id: number
    fullName: string
    academicDegree: string
    specialization: string
  }
  createdAt: string
}
