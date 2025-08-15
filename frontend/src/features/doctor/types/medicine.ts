export interface Medicine {
  medicineId: number
  medicineName: string
  manufacturer?: string
  category: string
  description?: string
  usage: string
  unit: string
  insuranceDiscountPercent: number
  insuranceDiscount?: number
  sideEffects?: string
  price: number
  quantity?: number
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK"
  createdAt: string // ISO format datetime
}
