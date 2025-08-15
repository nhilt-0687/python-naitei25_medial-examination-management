import type { PatientDetail, UpdatePatientRequest } from "../types/patient"
import { api } from "../../../shared/services/api"

export interface UpdatePatientRequest {
  name?: string
  symptoms?: string
  diagnosis?: string
  doctorNotes?: string
  hasFollowUp?: boolean
  followUpDate?: string
  systolicBloodPressure?: number
  diastolicBloodPressure?: number
  heartRate?: number
  bloodSugar?: number
  temperature?: number
  weight?: number
}

export const patientService = {
  // Lấy thông tin chi tiết bệnh nhân theo appointmentId
  async getPatientDetail(appointmentId: number): Promise<PatientDetail> {
    try {
      const response = await api.get(`/appointments/${appointmentId}`)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching patient detail for appointment ${appointmentId}:`, error)
      throw new Error("Không thể tải thông tin bệnh nhân")
    }
  },

  // Cập nhật thông tin bệnh nhân và cuộc hẹn
  async updatePatientDetail(appointmentId: number, data: UpdatePatientRequest): Promise<PatientDetail> {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, data)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error updating patient detail for appointment ${appointmentId}:`, error)
      throw new Error("Không thể cập nhật thông tin bệnh nhân")
    }
  },

  // Cập nhật sinh hiệu
  async updateVitalSigns(
    appointmentId: number,
    vitalSigns: {
      systolicBloodPressure: number
      diastolicBloodPressure: number
      heartRate: number
      bloodSugar: number
      temperature?: number
      weight?: number
    },
  ): Promise<any> {
    try {
      const response = await api.put(`/appointments/${appointmentId}/vital-signs`, vitalSigns)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error updating vital signs for appointment ${appointmentId}:`, error)
      throw new Error("Không thể cập nhật sinh hiệu")
    }
  },
}
