export interface Schedule {
  scheduleId: string
  title: "Khám bệnh"
  shift: "MORNING" | "AFTERNOON" | "EVENING"
  startTime: string
  endTime: string
  workDate: string
  roomNote: string
  floor: string
  building: string
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  schedules: Schedule[]
  scheduleCount: number
}

export interface TimeSlot {
  label: string
  start: string // Format: "HH:mm"
  end: string // Format: "HH:mm"
}

export type ViewType = "month" | "week"

export interface ScheduleModalProps {
  selectedDay: Date | null
  schedules: Schedule[]
  onClose: () => void
}

export interface MonthViewProps {
  calendarDays: CalendarDay[]
  onDayClick: (day: Date) => void
}

export interface WeekViewProps {
  days: Date[]
  schedules: Schedule[]
  timeSlots: TimeSlot[]
}
