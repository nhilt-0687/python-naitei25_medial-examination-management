import { api } from './api'
import { handleApiError } from '../utils/errorHandler'

export interface MedicalService {
  id: number
  name: string
  description?: string
  category: string
  price: number
  duration: number // in minutes
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const serviceService = {
  // Get all services
  async getServices(params?: {
    category?: string
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<{
    results: MedicalService[]
    count: number
    next: string | null
    previous: string | null
  }> {
    try {
      const response = await api.get('/services/', { params })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Get service by ID
  async getServiceById(serviceId: number): Promise<MedicalService> {
    try {
      const response = await api.get<MedicalService>(`/services/${serviceId}/`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Get services by category
  async getServicesByCategory(category: string): Promise<MedicalService[]> {
    try {
      const response = await api.get<MedicalService[]>('/services/', {
        params: { category, isActive: true }
      })
      return response.data.results || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Admin functions
  async createService(data: {
    name: string
    description?: string
    category: string
    price: number
    duration: number
  }): Promise<MedicalService> {
    try {
      const response = await api.post<MedicalService>('/services/', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  async updateService(serviceId: number, data: Partial<{
    name: string
    description: string
    category: string
    price: number
    duration: number
    isActive: boolean
  }>): Promise<MedicalService> {
    try {
      const response = await api.patch<MedicalService>(`/services/${serviceId}/`, data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  async deleteService(serviceId: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/services/${serviceId}/`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  }
}
