import type {
  AppointmentNote,
  CreateAppointmentNoteRequest,
  UpdateAppointmentNoteRequest,
} from "../types/appointmentNote"
import { api } from "../../../shared/services/api"

export const appointmentNoteService = {
  // Lấy lời dặn bác sĩ theo appointmentId
  async getNotesByAppointmentId(appointmentId: number): Promise<AppointmentNote[]> {
    try {
      const response = await api.get(`/appointment-notes/appointment/${appointmentId}/notes`)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching notes for appointment ${appointmentId}:`, error)
      throw new Error("Không thể tải lời dặn bác sĩ")
    }
  },

  // Tạo lời dặn bác sĩ theo appointmentId
  async createNote(appointmentId: number, note: CreateAppointmentNoteRequest): Promise<AppointmentNote> {
    try {
      const response = await api.post(`/appointments/${appointmentId}/notes/create`, note)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error creating note for appointment ${appointmentId}:`, error)
      throw new Error("Không thể tạo lời dặn bác sĩ")
    }
  },

  // Cập nhật lời dặn bác sĩ theo noteId
  async updateNote(noteId: number, note: UpdateAppointmentNoteRequest): Promise<AppointmentNote> {
    try {
      const response = await api.put(`/appointments/notes/${noteId}`, note)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error updating note ${noteId}:`, error)
      throw new Error("Không thể cập nhật lời dặn bác sĩ")
    }
  },

  // Xóa lời dặn bác sĩ theo noteId
  async deleteNote(noteId: number): Promise<void> {
    try {
      await api.delete(`/appointments/notes/${noteId}`)
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error deleting note ${noteId}:`, error)
      throw new Error("Không thể xóa lời dặn bác sĩ")
    }
  },
}
