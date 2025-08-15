import type { ExaminationRoom } from "../types/examinationRoom"
import { api } from "../../../shared/services/api"

export const examinationRoomService = {
  // Lấy tất cả phòng khám
  async getAllExaminationRooms(): Promise<ExaminationRoom[]> {
    try {
      const response = await api.get<ExaminationRoom[]>("/examination-rooms/")
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching all examination rooms:`, error)
      throw new Error("Không thể lấy danh sách phòng khám")
    }
  },

  // Lấy phòng khám theo ID
  async getExaminationRoomById(roomId: number): Promise<ExaminationRoom> {
    try {
      const response = await api.get<ExaminationRoom>(`/examination-rooms/${roomId}`)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching examination room ${roomId}:`, error)
      throw new Error("Không thể lấy thông tin phòng khám")
    }
  },

  // Lọc phòng theo type, building, floor
  async filterRooms(type?: string, building?: string, floor?: number): Promise<ExaminationRoom[]> {
    try {
      const params = new URLSearchParams()
      if (type) params.append("type", type)
      if (building) params.append("building", building)
      if (floor) params.append("floor", floor.toString())

      const response = await api.get<ExaminationRoom[]>(`/examination-rooms/search/?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error filtering rooms:`, error)
      throw new Error("Không thể lọc phòng khám")
    }
  },

  // Lấy các phòng xét nghiệm (type = TEST)
  async getTestRooms(): Promise<ExaminationRoom[]> {
    try {
      const rooms = await this.filterRooms("T")
      return rooms
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching test rooms:`, error)
      throw new Error("Không thể lấy danh sách phòng xét nghiệm")
    }
  },

  // Lấy các phòng khám bệnh (type = EXAMINATION)
  async getExaminationRooms(): Promise<ExaminationRoom[]> {
    try {
      const rooms = await this.filterRooms("E")
      return rooms
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error fetching examination rooms:`, error)
      throw new Error("Không thể lấy danh sách phòng khám bệnh")
    }
  },
}
