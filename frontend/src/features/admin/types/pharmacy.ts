export interface Medicine {
  medicineId: number
  medicineName: string
  manufactor?: string
  category: string
  description: string
  usage: string
  unit: string
  insuranceDiscountPercent: number
  insuranceDiscount?: number
  sideEffects?: string
  price: number
  quantity?: number
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK"
  avatar?: string
}

export interface MedicineRequest {
  medicineName: string
  manufactor: string
  category: string
  description: string
  usage: string
  unit: string
  insuranceDiscountPercent: number
  sideEffects: string
  price: number
  quantity: number
}

export interface MedicineUpdateRequest {
  medicineName?: string
  manufactor?: string
  category?: string
  description?: string
  usage?: string
  unit?: string
  insuranceDiscountPercent?: number
  sideEffects?: string
  price?: number
  quantity?: number
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface Prescription {
  id: number
  patient: number
  appointment: number
  follow_up_date: string | null // Changed from followUpDate
  is_follow_up: boolean // Changed from isFollowUp
  diagnosis: string
  systolic_blood_pressure: number | null // Changed from systolicBloodPressure
  diastolic_blood_pressure: number | null // Changed from diastolicBloodPressure
  heart_rate: number | null // Changed from heartRate
  blood_sugar: number | null // Changed from bloodSugar
  note: string | null
  prescription_details: PrescriptionDetailRequest[] | PrescriptionDetailResponse[] // Changed from prescriptionDetails
  created_at: string // Changed from createdAt
}

export interface PrescriptionDetailRequest {
  medicine_id: number // Changed from medicineId
  dosage: string
  frequency: string
  duration: string
  quantity: number
  prescription_notes: string // Changed from prescriptionNotes
}

export interface PrescriptionDetailResponse {
  detailId: number
  prescriptionId: number
  medicine: {
    medicineId: number
    medicineName: string
    price: number
  }
  dosage: string
  frequency: string
  duration: string
  quantity: number
  prescriptionNotes: string
  createdAt: string
}

export interface PrescriptionResponse {
  prescriptionId: number
  createdAt: string
  note: string
  diagnosis: string
  prescriptionDetails: PrescriptionDetailResponse[]
  systolicBloodPressure?: number | null
  diastolicBloodPressure?: number | null
  heartRate?: number | null
  bloodSugar?: number | null
  systolic_blood_pressure?: number
  diastolic_blood_pressure?: number
  heart_rate?: number
  blood_sugar?: number
}

export interface CreatePrescriptionRequest {
  appointment_id: number // Changed from appointmentId
  patient_id: number // Changed from patientId
  follow_up_date?: string | null // Changed from followUpDate
  is_follow_up?: boolean // Changed from isFollowUp
  diagnosis: string
  systolic_blood_pressure?: number | null // Changed from systolicBloodPressure
  diastolic_blood_pressure?: number | null // Changed from diastolicBloodPressure
  heart_rate?: number | null // Changed from heartRate
  blood_sugar?: number | null // Changed from bloodSugar
  note?: string | null
  prescription_details?: PrescriptionDetailRequest[] // Changed from prescriptionDetails
}

export interface UpdatePrescriptionRequest {
  followUpDate?: string | null
  isFollowUp?: boolean
  diagnosis?: string
  systolicBloodPressure?: number | null
  diastolicBloodPressure?: number | null
  heartRate?: number | null
  bloodSugar?: number | null
  note?: string | null
  prescriptionDetails?: PrescriptionDetailRequest[]
}

export interface AddMedicineToPrescriptionRequest {
  prescriptionId: number
  medicineId: number
  dosage: string
  frequency: string
  duration: string
  quantity: number
  prescriptionNotes?: string
}

export interface UpdatePrescriptionDetailRequest {
  detailId: number
  dosage?: string
  frequency?: string
  duration?: string
  quantity?: number
  prescriptionNotes?: string
}
