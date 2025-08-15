export interface MedicalService {
  id: number
  categoryId: number
  name: string
  description?: string
  price: number
  duration: number // in minutes
  isActive: boolean
  createdAt: string
}

export interface ServiceCategory {
  id: number
  name: string
  description?: string
  icon?: string
  isActive: boolean
  createdAt: string
}
