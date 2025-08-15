export interface Department {
  id: number;
  department_name: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
}

export interface User {
  id: number;
  email: string;
  phone?: string | null;
  role: string;
  created_at: string;
}

export interface Doctor {
  id: number;
  user: User;
  department: Department;
  identity_number: string;
  first_name: string;
  last_name: string;
  birthday: string;
  avatar?: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "FE"; // Bao gồm "FE" từ dữ liệu
  address: string;
  academic_degree: "B" | "BS" | "BS_CKI" | "BS_CKII" | "THS_BS" | "TS_BS" | "PGS_TS_BS" | "GS_TS_BS";
  specialization: string;
  type: "EXAMINATION" | "SERVICE";
  created_at: string;
  updated_at: string;
  price?: number; // Đã thêm trường này
}

export interface DoctorDto {
  user_id?: number;
  identity_number: string;
  first_name: string;
  last_name: string;
  birthday: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "FE";
  address: string;
  academic_degree: "B" | "BS" | "BS_CKI" | "BS_CKII" | "THS_BS" | "TS_BS" | "PGS_TS_BS" | "GS_TS_BS";
  specialization: string;
  type: "EXAMINATION" | "SERVICE";
  department_id: number;
}

export interface DoctorResponse {
  doctors: Doctor[];
  total: number;
}

// Academic degree labels for display
export const ACADEMIC_DEGREE_LABELS: Record<string, string> = {
  B: "Bác sĩ",
  BS: "BS",
  BS_CKI: "BS CKI",
  BS_CKII: "BS CKII",
  THS_BS: "ThS.BS",
  TS_BS: "TS.BS",
  PGS_TS_BS: "PGS.TS.BS",
  GS_TS_BS: "GS.TS.BS",
};
