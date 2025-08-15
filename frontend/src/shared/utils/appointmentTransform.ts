import type { Appointment } from '../types/appointment'

export interface AppointmentDisplay {
  id: number
  doctorName: string
  doctorSpecialty: string
  doctorAvatar?: string
  date: string
  time: string
  status: string
  statusColor: string
  symptoms: string
  patientName: string
  patientPhone?: string
}

export function transformAppointmentToDisplay(appointment: Appointment): AppointmentDisplay {
  return {
    id: appointment.id,
    doctorName: appointment.doctor?.fullName || 'Chưa có thông tin',
    doctorSpecialty: appointment.doctor?.specialty || 'Chưa có thông tin',
    doctorAvatar: appointment.doctor?.avatar,
    date: formatAppointmentDate(appointment.appointmentDate),
    time: appointment.appointmentTime,
    status: getStatusText(appointment.status),
    statusColor: getStatusColor(appointment.status),
    symptoms: appointment.symptoms || 'Không có triệu chứng',
    patientName: appointment.patient?.fullName || 'Chưa có thông tin',
    patientPhone: appointment.patient?.phone
  }
}

export function formatAppointmentDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatAppointmentTime(date: string, time: string): string {
  const appointmentDate = new Date(date)
  const [hours, minutes] = time.split(':')
  appointmentDate.setHours(parseInt(hours), parseInt(minutes))
  
  return appointmentDate.toLocaleString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'IN_PROGRESS': 'Đang khám',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'NO_SHOW': 'Không đến'
  }
  return statusMap[status] || status
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'PENDING': 'text-yellow-600 bg-yellow-100',
    'CONFIRMED': 'text-blue-600 bg-blue-100',
    'IN_PROGRESS': 'text-purple-600 bg-purple-100',
    'COMPLETED': 'text-green-600 bg-green-100',
    'CANCELLED': 'text-red-600 bg-red-100',
    'NO_SHOW': 'text-gray-600 bg-gray-100'
  }
  return colorMap[status] || 'text-gray-600 bg-gray-100'
}

export interface AvailableSlot {
  time: string
  isAvailable: boolean
  scheduleId?: number
}

export interface TimeSlot {
  time: string
  isAvailable: boolean
}

export function transformAvailableSlotsToTimeSlots(slots: AvailableSlot[]): {
  morning: TimeSlot[]
  afternoon: TimeSlot[]
} {
  const morning: TimeSlot[] = []
  const afternoon: TimeSlot[] = []

  slots.forEach(slot => {
    const hour = parseInt(slot.time.split(':')[0])
    const timeSlot: TimeSlot = {
      time: slot.time,
      isAvailable: slot.isAvailable
    }

    if (hour < 12) {
      morning.push(timeSlot)
    } else {
      afternoon.push(timeSlot)
    }
  })

  return { morning, afternoon }
}
