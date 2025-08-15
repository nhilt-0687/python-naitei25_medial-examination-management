import type { Prescription } from "../types/prescription"
import type { Medicine } from "../types/medicine"
import { api } from "../../../shared/services/api"

export const pharmacyService = {
  // Lấy thông tin toa thuốc theo appointmentId
  async getCurrentPrescriptionByAppointmentId(appointmentId: number): Promise<Prescription> {
    try {
      const response = await api.get(`/prescriptions/appointment/${appointmentId}`)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching prescription for appointment ${appointmentId}:`, error)
      throw new Error("Không thể lấy toa thuốc hiện tại")
    }
  },

  // Lấy lịch sử đơn thuốc theo patientId
  async getPrescriptionHistoryByPatientId(patientId: number): Promise<Prescription[]> {
    try {
      const response = await api.get(`/prescriptions/patient/${patientId}`)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching prescription history for patient ${patientId}:`, error)
      throw new Error("Không thể tải lịch sử đơn thuốc")
    }
  },

  // Tạo toa thuốc mới
  async createPrescription(appointmentId: number, prescriptionData: Partial<Prescription>): Promise<Prescription> {
    try {
      const response = await api.post(`/prescriptions/`, {
        appointmentId,
        ...prescriptionData,
        prescriptionDetails: prescriptionData.prescriptionDetails || [],
      })
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error creating prescription for appointment ${appointmentId}:`, error)
      throw new Error("Không thể tạo toa thuốc")
    }
  },

  // Sửa toa thuốc theo prescriptionId
  async updatePrescription(prescriptionId: number, prescriptionData: Partial<Prescription>): Promise<Prescription> {
    try {
      const response = await api.put(`/pharmacy/prescriptions/${prescriptionId}`, prescriptionData)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error updating prescription ${prescriptionId}:`, error)
      throw error
    }
  },

  // Xóa toa thuốc theo prescriptionId
  async deletePrescription(prescriptionId: number): Promise<void> {
    try {
      await api.delete(`/pharmacy/prescriptions/${prescriptionId}`)
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error deleting prescription ${prescriptionId}:`, error)
      throw new Error("Không thể xóa toa thuốc")
    }
  },

  // Lấy tất cả thuốc
  async getAllMedicines(): Promise<Medicine[]> {
    try {
      const response = await api.get<Medicine[]>("/pharmacy/medicines")
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching all medicines:`, error)
      throw new Error("Không thể lấy danh sách thuốc")
    }
  },

  // Lấy thuốc theo ID
  async getMedicineById(id: number): Promise<Medicine> {
    try {
      const response = await api.get<Medicine>(`/pharmacy/medicines/${id}`)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching medicine ${id}:`, error)
      throw new Error("Không thể lấy thông tin thuốc")
    }
  },

  // Tìm kiếm thuốc theo tên hoặc danh mục
  async searchMedicine(name?: string, category?: string): Promise<Medicine[]> {
    try {
      const params: any = {}
      if (name) params.medicine_name = name
      if (category) params.category = category

      const response = await api.get<Medicine[]>("/medicines/search", { params })
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error searching medicine with name ${name} and category ${category}:`, error)
      throw new Error("Không thể tìm kiếm thuốc")
    }
  },
}
