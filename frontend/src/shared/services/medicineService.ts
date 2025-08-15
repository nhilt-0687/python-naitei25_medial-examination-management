import { api } from "./api"
import { handleApiError } from "../utils/errorHandler"

export interface Medicine {
  id: number
  medicine_name: string
  manufactor: string
  category: string
  description: string
  usage: string
  unit: string
  is_insurance_covered: boolean
  insurance_discount_percent: number
  insurance_discount: number
  side_effects: string
  price: number
  quantity: number
  created_at: string
}

export const medicineService = {
  async getAllMedicines(): Promise<Medicine[]> {
    try {
      const { data } = await api.get<Medicine[]>("/medicines/")
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false) || "Không thể tải danh sách thuốc")
    }
  },

  async getMedicineById(id: number): Promise<Medicine> {
    try {
      const { data } = await api.get<Medicine>(`/medicines/${id}/`)
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false) || "Không thể tải thông tin thuốc")
    }
  },

  async searchMedicines(params: { name?: string; category?: string }): Promise<Medicine[]> {
    try {
      const { data } = await api.get<Medicine[]>("/medicines/search/", { params })
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false) || "Không thể tìm kiếm thuốc")
    }
  },
}
