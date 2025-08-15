// User roles
export enum UserRole {
  ADMIN = "A",
  DOCTOR = "D",
  PATIENT = "P",
}

// Gender
export enum Gender {
  MALE = "M",
  FEMALE = "F",
  OTHER = "O",
}

// Academic Degree
export enum AcademicDegree {
  BS = "B",
  BS_CKI = "C1",
  BS_CKII = "C2",
  ThS_BS = "T1",
  TS_BS = "T2",
  PGS_TS_BS = "P1",
  GS_TS_BS = "G1",
}

// Doctor Type
export enum DoctorType {
  EXAMINATION = "E",
  SERVICE = "S",
}

// Shift
export enum Shift {
  MORNING = "M",
  AFTERNOON = "A",
  EVENING = "E",
  NIGHT = "N",
}

// Appointment Status
export enum AppointmentStatus {
  PENDING = "P",
  CONFIRMED = "C",
  CANCELLED = "X",
  COMPLETED = "D",
  NO_SHOW = "N",
  IN_PROGRESS = "I",
}

// Service Type
export enum ServiceType {
  TEST = "T",
  IMAGING = "I",
  CONSULTATION = "C",
  OTHER = "O",
}

// Order Status
export enum OrderStatus {
  ORDERED = "O",
  COMPLETED = "C",
}

// Note Type
export enum NoteType {
  DOCTOR = "D",
  PATIENT = "P",
}

// Payment Status
export enum PaymentStatus {
  PAID = "P",
  UNPAID = "U",
}

// Payment Method
export enum PaymentMethod {
  CASH = "C",
  ONLINE_BANKING = "B",
  CARD = "D",
}

// Transaction Status
export enum TransactionStatus {
  SUCCESS = "S",
  FAILED = "F",
  PENDING = "P",
}

// Notification Type
export enum NotificationType {
  SYSTEM = "S",
  BILL = "B",
  APPOINTMENT = "A",
  FOLLOWUP = "F",
  OTHER = "O",
}

// Relationship
export enum Relationship {
  FAMILY = "F",
  FRIEND = "R",
  OTHERS = "O",
}

// Room Type
export enum RoomType {
  EXAMINATION = "E",
  TEST = "T",
}

/**
 * ========================
 * Mapping Helpers
 * ========================
 */

// Map AppointmentStatus code -> key & i18n labelKey
export const mapAppointmentStatus = (code: AppointmentStatus | string) => {
  const statusMap = {
    [AppointmentStatus.PENDING]:    { key: "PENDING", labelKey: "upcomingAppointments.statusPending" },
    [AppointmentStatus.CONFIRMED]:  { key: "CONFIRMED", labelKey: "upcomingAppointments.statusConfirmed" },
    [AppointmentStatus.CANCELLED]:  { key: "CANCELLED", labelKey: "upcomingAppointments.statusCancelled" },
    [AppointmentStatus.COMPLETED]:  { key: "COMPLETED", labelKey: "upcomingAppointments.statusCompleted" },
    [AppointmentStatus.NO_SHOW]:    { key: "NO_SHOW", labelKey: "upcomingAppointments.statusNoShow" },
    [AppointmentStatus.IN_PROGRESS]:{ key: "IN_PROGRESS", labelKey: "upcomingAppointments.statusInProgress" },
  }
  return statusMap[code as AppointmentStatus] || { key: "UNKNOWN", labelKey: "upcomingAppointments.statusUnknown" }
}

// Map Gender code -> i18n labelKey
export const mapGender = (code: Gender | string) => {
  const genderMap = {
    [Gender.MALE]:   { key: "MALE", labelKey: "common.genderMale" },
    [Gender.FEMALE]: { key: "FEMALE", labelKey: "common.genderFemale" },
    [Gender.OTHER]:  { key: "OTHER", labelKey: "common.genderOther" },
  }
  return genderMap[code as Gender] || { key: "UNKNOWN", labelKey: "common.unknown" }
}
