import type { UserRole } from "../constants/enums"

export interface User {
  userId: number
  email: string | null 
  phone: string
  role: UserRole
  createdAt: string
}

export interface UserRequest {
  email?: string
  phone: string
  password: string
  role: UserRole
}

export interface UserUpdateRequest {
  phone?: string
  email?: string | null
  password?: string
  role?: UserRole
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface AuthUser {
  userId?: number;
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

// Response type for getCurrentUser endpoint - same as User
export interface UserResponse extends User {}
