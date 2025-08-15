// Cập nhật types để tương thích với backend
export interface NewsArticle {
  id: number
  title: string
  date: string
  image: string
  content?: string
  author?: string
}

// Cập nhật Doctor type để match với backend
export interface Doctor {
  id: number
  user: {
    id: number
    email?: string
    phone?: string
    role: string
    is_active: boolean
  }
  department: {
    id: number
    department_name: string
    description?: string
  }
  identity_number: string
  first_name: string
  last_name: string
  birthday?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  address?: string
  academic_degree: 'BACHELOR' | 'MASTER' | 'DOCTOR' | 'PROFESSOR'
  specialization: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONSULTANT'
  created_at: string
  updated_at: string
  
  // Computed properties for frontend compatibility
  name: string
  specialty: string
  avatar: string
  rating?: number
  room?: string
  consultationFee?: number
}

export interface Specialty {
  id: number
  name: string
  doctorCount: string
  icon: string
  color: string
}

export interface UpcomingAppointment {
  doctorName: string
  specialty: string
  date: string
  time: string
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export type SortOption = "newest" | "oldest" | "featured" | "fee_asc" | "fee_desc"
export type GenderFilter = "MALE" | "FEMALE" | "OTHER" | "Tất cả"
export type FeeRangeFilter =
  | "Dưới 200.000 VND"
  | "Từ 200.000 VND - 500.000 VND"
  | "Từ 500.000 VND - 1.000.000 VND"
  | "Trên 1.000.000 VND"
  | "Tất cả"

export interface DoctorFilters {
  gender: GenderFilter
  feeRange: FeeRangeFilter
}

export interface DayOption {
  label: string
  date: string
  dayOfWeek: string
  isAvailable: boolean
}

export interface TimeSlot {
  time: string
  isAvailable: boolean
}

export type TimeOfDay = "morning" | "afternoon"

export interface Symptom {
  id: number
  name: string
}

export type PaymentMethodType = "credit_card" | "momo"

export interface CreditCard {
  id: string
  brand: "Visa" | "MasterCard" | "American Express"
  last4: string
  expiry: string
  cardholderName: string
  isDefault: boolean
}

export interface BookingDetails {
  doctorId: number
  doctorName: string
  doctorSpecialty: string
  doctorAvatar: string
  doctorRoom: string
  doctorConsultationFee: number
  selectedDate: string
  selectedTime: string
  hasInsurance: boolean
  selectedSymptoms: Symptom[]
  paymentMethodType: PaymentMethodType | null
  selectedCardId: string | null
  totalAmount: number
  insuranceDiscount: number
}

export interface DrugCategory {
  id: number
  name: string
  icon: string
}

export interface Drug {
  id: number
  name: string
  manufacturer: string
  image: string
}

export interface DrugDetail {
  id: number
  name: string
  images: string[]
  expiryDate: string
  manufacturer: string
  description: string
  sideEffects: string
}
