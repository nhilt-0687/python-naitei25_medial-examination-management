import { api } from "./api"
import { handleApiError } from "../utils/errorHandler"
import i18n from "../../i18n"
import type { Patient, PatientDto, EmergencyContact, EmergencyContactDto } from "../types/patient"

export interface PatientInfo {
    id: number;
    userId: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    birthday: string;
    gender: "M" | "F" | "O";
    address?: string;
    identity_number: string;
    insurance_number?: string;
    avatar?: string;
    allergies?: string;
    height?: number;
    weight?: number;
    blood_type?: string;
    created_at: string;
    updated_at: string;
}

export interface MedicalRecord {
  id: number
  patientId: number
  doctorId: number
  appointmentId: number
  diagnosis: string
  treatment: string
  prescription?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export const patientService = {
  /** Get all patients */
  async getAllPatients(): Promise<Patient[]> {
    try {
      const { data } = await api.get<Patient[]>("/patients/")
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  /** Get patient by ID */
  async getPatientById(patientId: number): Promise<Patient> {
    try {
      const { data } = await api.get<Patient>(`/patients/${patientId}/`)
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false) || i18n.t("services.patient.patientNotFound"))
    }
  },

  /** Create a new patient */
  async createPatient(patientData: PatientDto): Promise<Patient> {
    try {
      const { data } = await api.post<Patient>("/patients/", patientData)
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  /** Update patient information */
  async updatePatient(patientId: string, patientData: Partial<PatientDto>): Promise<Patient> {
    try {
      const { data } = await api.patch<Patient>(`/patients/${patientId}/`, patientData)
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  /** Delete patient by ID */
  async deletePatient(patientId: number): Promise<string> {
    try {
      const { data } = await api.delete<string>(`/patients/${patientId}/`)
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  /** Search patient by identityNumber, insuranceNumber, or fullName */
  async searchPatient(params: {
    identityNumber?: string
    insuranceNumber?: string
    fullName?: string
  }): Promise<Patient | null> {
    try {
      const query = new URLSearchParams(params).toString()
      const { data } = await api.get<Patient | null>(`/patients/search?${query}/`)
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  /** Get all emergency contacts for a patient */
  async getEmergencyContacts(patientId: number): Promise<EmergencyContact[]> {
    try {
      const { data } = await api.get<EmergencyContact[]>(`/patients/${patientId}/contacts/`)
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  /** Add an emergency contact */
  async addEmergencyContact(patientId: number, contactData: EmergencyContactDto): Promise<EmergencyContact> {
    try {
      const { data } = await api.post<EmergencyContact>(`/patients/${patientId}/contacts/`, contactData)
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  /** Delete an emergency contact */
  async deleteEmergencyContact(patientId: number, contactId: number): Promise<string> {
    try {
      const { data } = await api.delete<string>(`/patients/${patientId}/contacts/${contactId}/`)
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },
  async getCurrentPatient(): Promise<PatientInfo> {
    try {
      const response = await api.get<PatientInfo>('/patients/me/')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Update current patient profile
  async updateProfile(data: Partial<PatientInfo>): Promise<PatientInfo> {
    try {
      const response = await api.patch<PatientInfo>('/patients/me/', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Upload patient avatar
async uploadAvatar(patientId: string | number, file: File): Promise<{ avatar: string }> {
        try {
            const formData = new FormData();
            formData.append("avatar", file);
            const response = await api.post<{ avatar: string }>(
                `/patients/${patientId}/avatar/`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(handleApiError(error, false));
        }
    },

  // Get patient's medical records
  async getMedicalRecords(): Promise<MedicalRecord[]> {
    try {
      const response = await api.get<MedicalRecord[]>('/patients/me/medical-records/')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  // Get specific medical record
  async getMedicalRecord(recordId: number): Promise<MedicalRecord> {
    try {
      const response = await api.get<MedicalRecord>(`/patients/me/medical-records/${recordId}/`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  async getPatientByUserId(userId: number): Promise<Patient> {
    try {
      const response = await api.get<Patient>(`/patients/?user_id=${userId}`);
      if (!response.data) {
        throw new Error(i18n.t("services.patient.patientNotFound"));
      }
      // Nếu API trả về danh sách, lấy phần tử đầu tiên
      const patient = Array.isArray(response.data) ? response.data[0] : response.data;
      return patient;
    } catch (error: any) {
      throw new Error(handleApiError(error, false) || i18n.t("services.patient.patientNotFound"));
    }
  },
}
