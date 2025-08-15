import { api } from "../../../shared/services/api"
import type { Services } from "../types/services"

export const servicesService = {
  async getAllServices(): Promise<Services[]> {
    try {
      const response = await api.get<Services[]>("/services")
      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", error)
      throw new Error("Không thể lấy danh sách dịch vụ")
    }
  },

  async getServiceById(serviceId: number): Promise<Services> {
    try {
      const response = await api.get<Services>(`/services/${serviceId}/`);
      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết dịch vụ:", error)
      throw new Error("Không thể lấy chi tiết dịch vụ")
    }
  },

  async searchServices(searchTerm: string): Promise<Services[]> {
    try {
      const response = await api.get<Services[]>(`/services?search=${encodeURIComponent(searchTerm)}`)
      return response.data
    } catch (error) {
      console.error("Error searching services:", error)
      return []
    }
  }
}
