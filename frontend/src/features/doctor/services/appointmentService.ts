import type { Appointment, AppointmentStats, PaginatedResponse } from "../types/appointment"
import { api } from "../../../shared/services/api"

// Get doctorId safely
const getDoctorId = (): number | null => {
  if (typeof window !== "undefined") {
    const doctorId = localStorage.getItem("currentDoctorId")
    return doctorId ? Number.parseInt(doctorId) : null
  }
  return null
}

// Utility functions for appointment data
export const formatAppointmentDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export const formatAppointmentTime = (timeString: string): string => {
  return timeString?.substring(0, 5) || "Chưa xác định"
}

export const formatTimeSlot = (slotStart?: string, slotEnd?: string): string => {
  if (!slotStart || !slotEnd) {
    return "Chưa xác định"
  }
  const formattedStart = formatAppointmentTime(slotStart)
  const formattedEnd = formatAppointmentTime(slotEnd)
  return `${formattedStart} - ${formattedEnd}`
}

export const getAppointmentStatusColor = (status: string): { color: string; bgColor: string } => {
  const colorMap = {
    PENDING: { color: "#d97706", bgColor: "#fef3c7" },
    CONFIRMED: { color: "#2563eb", bgColor: "#dbeafe" },
    COMPLETED: { color: "#059669", bgColor: "#d1fae5" },
    CANCELLED: { color: "#dc2626", bgColor: "#fee2e2" },
    PENDING_TEST_RESULT: { color: "#7c3aed", bgColor: "#ede9fe" },
    IN_PROGRESS: { color: "#0891b2", bgColor: "#cffafe" },
  }
  return colorMap[status as keyof typeof colorMap] || { color: "#6b7280", bgColor: "#f3f4f6" }
}

// Interface cho pagination
export interface PaginationParams {
  page: number
  size: number
}

// Interface cho filter parameters
export interface AppointmentFilterParams {
  shift?: string
  work_date?: string // YYYY-MM-DD format
  appointmentStatus?: string
  roomId?: number
}

// Combined interface cho API call
export interface AppointmentQueryParams extends PaginationParams, AppointmentFilterParams {}

export const calculateAppointmentStats = (appointments: Appointment[]): AppointmentStats => {
  return appointments.reduce(
    (stats, appointment) => {
      stats.total++
      switch (appointment.appointmentStatus) {
        case "PENDING":
          stats.pending++
          break
        case "CONFIRMED":
          stats.confirmed++
          break
        case "COMPLETED":
          stats.completed++
          break
        case "CANCELLED":
          stats.cancelled++
          break
        case "PENDING_TEST_RESULT":
          stats.pendingTestResult = (stats.pendingTestResult || 0) + 1
          break
        case "IN_PROGRESS":
          stats.inProgress = (stats.inProgress || 0) + 1
          break
      }
      return stats
    },
    {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      pendingTestResult: 0,
      inProgress: 0,
    },
  )
}

// Service for API calls
export const appointmentService = {
  async getAppointments(queryParams: AppointmentQueryParams): Promise<PaginatedResponse<Appointment>> {
    try {
      const doctorId = getDoctorId()
      if (!doctorId) {
        throw new Error("Doctor ID not found")
      }

      const params: any = {
        pageNo: queryParams.page,
        pageSize: queryParams.size,
      }

      // Normalize shift values to backend codes (accepts 'M', 'A', 'E' or 'MORNING', 'AFTERNOON', 'EVENING')
      if (queryParams.shift) {
        const raw = String(queryParams.shift).toUpperCase()
        const shiftMap: Record<string, string> = {
          M: "M",
          A: "A",
          E: "E",
          MORNING: "M",
          AFTERNOON: "A",
          EVENING: "E",
          NIGHT: "N",
          SURGERY: "S",
          MEETING: "T",
        }
        params.shift = shiftMap[raw] ?? raw
      }

      // Backend expects snake_case 'work_date'
      if (queryParams.work_date) params.workDate = queryParams.work_date
      if (queryParams.appointmentStatus) params.appointmentStatus = queryParams.appointmentStatus
      if (queryParams.roomId) params.roomId = queryParams.roomId

      console.log("API Request Params:", params) // Add this line
      const response = await api.get(`/appointments/doctor/${doctorId}`, { params })
      console.log("API Response:", response.data) // Add this line
      return response.data
    } catch (error) {
      console.error("Error fetching appointments:", error)
      throw error
    }
  },

  async getAppointmentById(appointmentId: number): Promise<Appointment> {
    const response = await api.get(`/appointments/${appointmentId}`)
    return response.data
  },

  async updateAppointmentById(appointmentId: number, updateData: Partial<Appointment>): Promise<Appointment> {
    const response = await api.put(`/appointments/${appointmentId}/`, updateData)
    return response.data
  },

  async updateAppointmentStatus(appointmentId: number, status: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${appointmentId}/status`, { status })
    return response.data
  },

  async updateAppointmentNotes(appointmentId: number, notes: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${appointmentId}/notes`, { notes })
    return response.data
  },

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const doctorId = getDoctorId()
    if (!doctorId) {
      throw new Error("Doctor ID not found")
    }

    const response = await api.get(`/doctors/${doctorId}/appointments`, {
      params: { date },
    })
    return response.data.content || response.data
  },
}
