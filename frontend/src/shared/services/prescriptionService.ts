import { api } from "./api";
import { handleApiError } from "../utils/errorHandler";
import i18n from "../../i18n";

export interface Prescription {
  id: number;
  created_at: string;
  diagnosis: string;
  systolic_blood_pressure?: number;
  diastolic_blood_pressure?: number;
  heart_rate?: number;
  blood_sugar?: number;
  note?: string;
  follow_up_date?: string;
  is_follow_up: boolean;
  prescription_details: Array<{
    id: number;
    medicine: { medicine_id: number; medicine_name: string };
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    prescription_notes?: string;
  }>;
}

export const prescriptionService = {
  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    try {
      const { data } = await api.get<Prescription[]>(`/prescriptions/patient/${patientId}`);
      return data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false) || i18n.t("services.prescription.notFound"));
    }
  },

  async getPrescriptionById(id: number): Promise<Prescription> {
    try {
      const { data } = await api.get<Prescription>(`/prescriptions/${id}`);
      return data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false) || i18n.t("services.prescription.detailNotFound"));
    }
  },

  async downloadPrescriptionPdf(id: number): Promise<string> {
    try {
      const { data } = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      return URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async getPrescriptionDetails(id: number) {
  try {
    const { data } = await api.get(`/prescriptions/${id}/detail/`);
    return data;
  } catch (error: any) {
    throw new Error(handleApiError(error, false) || i18n.t("services.prescription.detailNotFound"));
  }
}

};