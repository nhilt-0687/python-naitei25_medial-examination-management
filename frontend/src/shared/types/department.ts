export interface Department {
  id: number;
  department_name: string;
  avatar?: string | null;
}

export interface DepartmentDetail extends Department {
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentResponse {
  departments: DepartmentDetail[];
  total: number;
}