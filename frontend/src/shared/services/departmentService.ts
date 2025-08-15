import { api } from './api';
import { handleApiError } from '../utils/errorHandler';
import type { Doctor } from '../types/doctor';

export interface DepartmentDetail {
  id: number;
  department_name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const departmentService = {
  async getDepartments(): Promise<DepartmentDetail[]> {
    try {
      const response = await api.get<DepartmentDetail[]>('/departments/');
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      throw new Error(handleApiError(error, false));
    }
  },

  async getDepartmentById(id: number): Promise<DepartmentDetail> {
    try {
      const response = await api.get<DepartmentDetail>(`/departments/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async getDoctorsByDepartmentId(id: number): Promise<Doctor[]> {
    try {
      const response = await api.get<Doctor[]>(`/departments/${id}/doctors`);
      console.log('Doctors API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching doctors by department:', error);
      throw new Error(handleApiError(error, false));
    }
  },

  async createDepartment(data: {
    department_name: string;
    description?: string;
  }): Promise<DepartmentDetail> {
    try {
      const response = await api.post<DepartmentDetail>('/departments/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async updateDepartment(id: number, data: Partial<{
    department_name: string;
    description: string;
    is_active: boolean;
  }>): Promise<DepartmentDetail> {
    try {
      const response = await api.patch<DepartmentDetail>(`/departments/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async deleteDepartment(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/departments/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  }
};
