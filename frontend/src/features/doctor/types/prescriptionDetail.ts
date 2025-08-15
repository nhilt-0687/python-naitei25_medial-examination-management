import type { Medicine } from "./medicin"
import type { Prescription } from "./prescription"

export interface PrescriptionDetail {
  detailId: number
  prescriptionId?: number
  medicine: Medicine
  medicine_id: number
  dosage: string
  unit?: string
  frequency: string
  duration: string
  quantity: number
  prescriptionNotes?: string
  createdAt: string // ISO format datetime
}
