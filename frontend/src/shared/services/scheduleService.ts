import { api } from './api'
import { handleApiError } from '../utils/errorHandler'

export interface Schedule {
  id: number
  doctorId: number
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TimeSlot {
  time: string
  available: boolean
  appointmentId?: number
}

export const scheduleService = {
  // Get doctor's schedule
  async getDoctorSchedule(doctorId: number): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>(`/doctors/${doctorId}/schedule/`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Get available time slots for a specific date
  async getAvailableTimeSlots(doctorId: number, date: string): Promise<{
    date: string
    timeSlots: TimeSlot[]
  }> {
    try {
      const response = await api.get(`/doctors/${doctorId}/available-slots/`, {
        params: { date }
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Doctor functions
  async updateSchedule(doctorId: number, schedules: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }>): Promise<Schedule[]> {
    try {
      const response = await api.put<Schedule[]>(`/doctors/${doctorId}/schedule/`, {
        schedules
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  async createSchedule(doctorId: number, data: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }): Promise<Schedule> {
    try {
      const response = await api.post<Schedule>(`/doctors/${doctorId}/schedule/`, data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  async deleteSchedule(scheduleId: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/schedules/${scheduleId}/`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  }
}
