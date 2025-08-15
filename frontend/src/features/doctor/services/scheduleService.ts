import { api } from "../../../shared/services/api"
import type { Shift } from "../types/appointment"

export interface ScheduleResponse {
  id: number // Thay đổi từ scheduleId thành id
  doctor_id: number
  work_date: string
  start_time: string
  end_time: string
  shift: Shift
  room_id: number
  location?: string
  room_note?: string
  floor?: number
  building?: string
  created_at: string
  title?: string
}

export interface CreateScheduleRequest {
  doctor: number // Changed from doctor_id to doctor
  work_date: string
  start_time: string
  end_time: string
  shift: Shift
  room: number // Changed from room_id to room
}

export const scheduleService = {
  // Lấy lịch làm việc theo ID bác sĩ
  async getSchedulesByDoctorId(doctorId: number): Promise<ScheduleResponse[]> {
    try {
      const response = await api.get<ScheduleResponse[]>(`/schedules/?doctor_id=${doctorId}`)
      console.log('Raw API response:', response);
      console.log(`Successfully fetched ${response.data.length} schedules:`, response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error fetching schedules for doctor ${doctorId}:`, error)
      throw new Error(`Không thể tải lịch làm việc của bác sĩ`)
    }
  },

  // Lấy tất cả lịch làm việc cho chế độ admin
  async getAllSchedulesForAdmin(): Promise<ScheduleResponse[]> {
    try {
      const response = await api.get<ScheduleResponse[]>(`/doctors/schedules/admin/`)
      console.log(`✅ Successfully fetched ${response.data.length} admin schedules:`, response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error fetching admin schedules:`, error)
      throw new Error(`Không thể tải danh sách lịch làm việc`)
    }
  },

  // Lấy lịch làm việc theo ID lịch
  async getScheduleById(scheduleId: number): Promise<ScheduleResponse> {
    try {
      const response = await api.get<ScheduleResponse>(`/doctors/schedules/${scheduleId}/`)
      console.log(`✅ Successfully fetched schedule:`, response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error fetching schedule ${scheduleId}:`, error)
      throw new Error(`Không thể tải thông tin lịch làm việc`)
    }
  },

  // Tạo lịch làm việc mới
  async createSchedule(scheduleData: CreateScheduleRequest): Promise<ScheduleResponse> {
    try {
      const payload = {
        doctor: scheduleData.doctor, // Now directly uses 'doctor'
        room: scheduleData.room, // Now directly uses 'room'
        work_date: scheduleData.work_date,
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time,
        shift: scheduleData.shift,
      }
      const response = await api.post<ScheduleResponse>("/schedules/", payload)
      console.log(`✅ Successfully created schedule:`, response.data)
      return response.data
    } catch (error: any) {
      // Thêm ': any' để truy cập thuộc tính response
      console.error(`❌ Error creating schedule:`, error)
      if (error.response) {
        console.error("Backend error details:", error.response.data) // Dòng này sẽ hiển thị lỗi chi tiết
      }
      throw new Error(`Không thể tạo lịch làm việc mới`)
    }
  },

  // Cập nhật lịch làm việc hiện có
  async updateSchedule(
    doctorId: number,
    scheduleId: number,
    scheduleData: Partial<CreateScheduleRequest>,
  ): Promise<ScheduleResponse> {
    try {
      const payload: Partial<any> = {}
      if (scheduleData.doctor !== undefined) payload.doctor = scheduleData.doctor // Changed from doctor_id
      if (scheduleData.room !== undefined) payload.room = scheduleData.room // Changed from room_id
      if (scheduleData.work_date !== undefined) payload.work_date = scheduleData.work_date
      if (scheduleData.start_time !== undefined) payload.start_time = scheduleData.start_time
      if (scheduleData.end_time !== undefined) payload.end_time = scheduleData.end_time
      if (scheduleData.shift !== undefined) payload.shift = scheduleData.shift

      const response = await api.put<ScheduleResponse>(`/doctors/${doctorId}/schedules/${scheduleId}/`, payload)
      console.log(`✅ Successfully updated schedule:`, response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error updating schedule ${scheduleId}:`, error)
      throw new Error(`Không thể cập nhật lịch làm việc`)
    }
  },

  // Xóa lịch làm việc
  async deleteSchedule(doctorId: number, scheduleId: number): Promise<void> {
    try {
      await api.delete(`/doctors/${doctorId}/schedules/${scheduleId}/`)
      console.log(`✅ Successfully deleted schedule ${scheduleId}`)
    } catch (error) {
      console.error(`❌ Error deleting schedule ${scheduleId}:`, error)
      throw new Error(`Không thể xóa lịch làm việc`)
    }
  },
}
