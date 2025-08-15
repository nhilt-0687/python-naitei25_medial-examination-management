import type { Department } from "./department"

export interface ExaminationRoom {
  roomId: number
  department?: Department
  type: "EXAMINATION" | "TEST"
  building: string
  floor: number
  roomName: string
  note?: string
  capacity?: number
  status?: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
  createdAt: string // ISO format datetime
}
