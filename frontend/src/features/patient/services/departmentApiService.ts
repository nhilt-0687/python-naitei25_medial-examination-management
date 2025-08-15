import type { Department } from '../../../shared/types/department'
import { departmentService, type Department as DepartmentAPI } from '../../../shared/services/departmentService'
import type { Doctor } from '../../../shared/types/doctor'

class DepartmentApiService {
  private baseUrl = `${import.meta.env.VITE_API_BASE_URL}api`

  async getDepartments(): Promise<Department[]> {
    try {
      const departments = await departmentService.getDepartments()
      // Transform API response to match frontend interface
      return departments.map(dept => ({
        departmentId: dept.id,
        departmentName: dept.name
      }))
    } catch (error) {
      console.error('Error fetching departments:', error)
      throw new Error('Không thể tải danh sách khoa khám')
    }
  }

  async getDepartmentById(departmentId: number): Promise<DepartmentAPI> {
    try {
      return await departmentService.getDepartmentById(departmentId)
    } catch (error) {
      console.error('Error fetching department:', error)
      throw new Error('Không thể tải thông tin khoa khám')
    }
  }

  async getDoctorsByDepartment(departmentId: number): Promise<Doctor[]> {
    try {
      return await apiClient.get<Doctor[]>(`/departments/${departmentId}/doctors/`)
    } catch (error) {
      console.error('Error fetching doctors by department:', error)
      throw new Error('Không thể tải danh sách bác sĩ theo khoa')
    }
  }
}

export const departmentApiService = new DepartmentApiService()
