import { api } from "./api"
import { handleApiError } from "../utils/errorHandler"
import type {
  Appointment,
  UpdateAppointmentPayload,
  AppointmentNote,
  AppointmentFilter,
  BackendCreateAppointmentPayload,
} from "../types/appointment" // Import BackendCreateAppointmentPayload
import type { PaginatedResponse } from "../types/api"

export type AppointmentListResponse = PaginatedResponse<Appointment>

export const appointmentService = {
  // Get my appointments (used for past appointments)
  async getMyAppointments(page = 1, pageSize = 10, filters?: AppointmentFilter): Promise<AppointmentListResponse> {
    try {
      const params = new URLSearchParams()
      params.append("pageNo", page.toString()) // Changed to pageNo
      params.append("pageSize", pageSize.toString()) // Changed to pageSize

      if (filters?.status) params.append("status", filters.status)
      if (filters?.startDate) params.append("start_date", filters.startDate) // Changed to start_date
      if (filters?.endDate) params.append("end_date", filters.endDate) // Changed to end_date

      // Call the new /appointments/my/ endpoint
      const response = await api.get<AppointmentListResponse>(`/appointments/my/?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Get upcoming appointments
  async getUpcomingAppointments(): Promise<Appointment[]> {
    try {
      // Call the new /appointments/upcoming/ endpoint
      const response = await api.get<{ results: Appointment[] }>("/appointments/upcoming/")
      return response.data.results
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Get appointment by ID
  async getAppointmentById(appointmentId: number): Promise<Appointment> {
    try {
      const response = await api.get<Appointment>(`/appointments/${appointmentId}/`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Create new appointment
  async createAppointment(payload: BackendCreateAppointmentPayload): Promise<Appointment> {
    // Đã sửa kiểu payload
    try {
      const response = await api.post<Appointment>("/appointments/", payload)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Update appointment
  async updateAppointment(appointmentId: number, payload: UpdateAppointmentPayload): Promise<Appointment> {
    try {
      const response = await api.patch<Appointment>(`/appointments/${appointmentId}/`, payload)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Cancel appointment
  async cancelAppointment(appointmentId: number, reason?: string): Promise<Appointment> {
    try {
      const response = await api.patch<Appointment>(`/appointments/${appointmentId}/`, {
        status: "CANCELLED",
        cancellationReason: reason,
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Get available time slots
  async getAvailableSlots(
    scheduleId: number,
    date: string,
  ): Promise<{
    morning: string[]
    afternoon: string[]
  }> {
    try {
      const response = await api.post<{
        morning: string[]
        afternoon: string[]
      }>(`/appointments/schedule/available-slots/`, {
        schedule_id: scheduleId,
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Admin functions
  async getAllAppointments(page = 1, pageSize = 10, filters?: AppointmentFilter): Promise<AppointmentListResponse> {
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("page_size", pageSize.toString())

      if (filters?.status) params.append("status", filters.status)
      if (filters?.doctorId) params.append("doctor_id", filters.doctorId.toString())
      if (filters?.patientId) params.append("patient_id", filters.patientId.toString())
      if (filters?.startDate) params.append("start_date", filters.startDate)
      if (filters?.endDate) params.append("end_date", filters.endDate)

      const response = await api.get<AppointmentListResponse>(`/appointments/?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  async getDoctorAppointments(
    doctorId: number,
    page = 1,
    pageSize = 10,
    filters?: AppointmentFilter,
  ): Promise<AppointmentListResponse> {
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("page_size", pageSize.toString())

      if (filters?.status) params.append("status", filters.status)
      if (filters?.startDate) params.append("start_date", filters.startDate)
      if (filters?.endDate) params.append("end_date", filters.endDate)

      const response = await api.get<AppointmentListResponse>(`/appointments/doctor/${doctorId}/?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },
}

export const appointmentNoteService = {
  // Get notes for appointment
  async getAppointmentNotes(appointmentId: number): Promise<AppointmentNote[]> {
    try {
      const response = await api.get<{ results: AppointmentNote[] }>(`/appointments/${appointmentId}/notes/`)
      return response.data.results
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Create appointment note
  async createAppointmentNote(
    appointmentId: number,
    payload: {
      noteType: "DIAGNOSIS" | "PRESCRIPTION" | "GENERAL"
      content: string
    },
  ): Promise<AppointmentNote> {
    try {
      const response = await api.post<AppointmentNote>(`/appointments/${appointmentId}/notes/`, payload)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Update appointment note
  async updateAppointmentNote(
    noteId: number,
    payload: {
      content: string
    },
  ): Promise<AppointmentNote> {
    try {
      const response = await api.patch<AppointmentNote>(`/appointment-notes/${noteId}/`, payload)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Delete appointment note
  async deleteAppointmentNote(noteId: number): Promise<void> {
    try {
      await api.delete(`/appointment-notes/${noteId}/`)
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },
}

export default appointmentService