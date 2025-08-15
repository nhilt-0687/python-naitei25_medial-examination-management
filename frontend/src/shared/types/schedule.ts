export interface Schedule {
  id: number
  doctorId: number
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string
  endTime: string
  isActive: boolean
}

export interface TimeSlot {
  startTime: string
  endTime: string
  isAvailable: boolean
  appointmentId?: number
}
