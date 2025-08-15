// API Response Types dựa trên Django backend
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Backend Model Types
export interface Department {
  id: number
  department_name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface ExaminationRoom {
  id: number
  department_id: number
  type: string
  building: string
  floor: number
  note?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email?: string
  phone?: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: number
  user: User
  department: Department
  identity_number: string
  first_name: string
  last_name: string
  birthday?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  address?: string
  academic_degree: 'BACHELOR' | 'MASTER' | 'DOCTOR' | 'PROFESSOR'
  specialization: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONSULTANT'
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: number
  doctor_id: number
  work_date: string
  start_time: string
  end_time: string
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING'
  room_id: number
  created_at: string
  updated_at: string
}

// Request Types
export interface CreateDoctorRequest {
  password: string
  identity_number: string
  first_name: string
  last_name: string
  birthday: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  address?: string
  academic_degree: 'BACHELOR' | 'MASTER' | 'DOCTOR' | 'PROFESSOR'
  specialization: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONSULTANT'
  department_id: number
  email?: string
  phone?: string
}

export interface DoctorFilterParams {
  gender?: string
  academicDegree?: string
  specialization?: string
  type?: string
}

export interface ScheduleFilterParams {
  shift?: string
  workDate?: string
  roomId?: number
}
