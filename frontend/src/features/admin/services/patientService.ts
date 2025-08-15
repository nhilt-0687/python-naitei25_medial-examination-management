import { api } from "../../../shared/services/api";
import i18n from "../../../i18n";
import type {
  Patient,
  RawPatientFromAPI,
  CreatePatientRequest,
  PatientUpdateDto,
  EmergencyContact,
  EmergencyContactDto,
  RoomDetail,
  RoomDetailDto,
  PatientRoom,
  PatientRoomDto,
} from "../types/patient";

const mapRawPatientToFrontend = (rawPatient: RawPatientFromAPI): Patient => {
  // Calculate age from birthday if available
  let age: number | undefined;
  if (rawPatient.birthday) {
    const birthDate = new Date(rawPatient.birthday);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  return {
    patientId: rawPatient.id,
    userId: rawPatient.user,
    identityNumber: rawPatient.identity_number || "",
    insuranceNumber: rawPatient.insurance_number || "",
    fullName: `${rawPatient.first_name || ""} ${
      rawPatient.last_name || ""
    }`.trim(),
    birthday: rawPatient.birthday || "",
    phone: rawPatient.phone_number || "",
    email: rawPatient.email || "",
    avatar: rawPatient.avatar || "",
    gender:
      rawPatient.gender === "M"
        ? "MALE"
        : rawPatient.gender === "F"
        ? "FEMALE"
        : "OTHER",
    address: rawPatient.address || "",
    allergies: rawPatient.allergies || "",
    height: rawPatient.height || undefined,
    weight: rawPatient.weight || undefined,
    bloodType: rawPatient.blood_type as
      | "A+"
      | "A-"
      | "B+"
      | "B-"
      | "AB+"
      | "AB-"
      | "O+"
      | "O-"
      | undefined,
    createdAt: rawPatient.created_at || "",
    age: age,
  };
};

export const patientService = {
  /** Get all patients */
  async getAllPatients(): Promise<Patient[]> {
    try {
      const { data } = await api.get<RawPatientFromAPI[]>("/patients/");
      return data.map(mapRawPatientToFrontend);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      throw new Error("Không thể tải danh sách bệnh nhân");
    }
  },

  /** Get patient by ID */
  async getPatientById(patientId: number): Promise<Patient> {
    try {
      const { data } = await api.get<RawPatientFromAPI>(
        `/patients/${patientId}/`
      );
      return mapRawPatientToFrontend(data);
    } catch (error: any) {
      console.error(`Error fetching patient ${patientId}:`, error);
      throw new Error(i18n.t("services.patient.patientNotFound"));
    }
  },

  /** Create a new patient */
  async createPatient(patientData: CreatePatientRequest): Promise<Patient> {
    try {
      const backendData = {
        ...patientData,
        gender:
          patientData.gender === "MALE"
            ? "M"
            : patientData.gender === "FEMALE"
            ? "F"
            : "O",
      };
      const { data } = await api.post<RawPatientFromAPI>(
        "/patients/",
        backendData
      );
      return mapRawPatientToFrontend(data);
    } catch (error: any) {
      console.error("Error creating patient:", error);
      let errorMessage = "Không thể tạo bệnh nhân mới";
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data)}`;
      }
      throw new Error(errorMessage);
    }
  },

  /** Update patient information */
  async updatePatient(
    patientId: number,
    patientData: Partial<PatientUpdateDto>
  ): Promise<Patient> {
    try {
      const backendData: any = { ...patientData };
      if (patientData.gender !== undefined) {
        backendData.gender =
          patientData.gender === "MALE"
            ? "M"
            : patientData.gender === "FEMALE"
            ? "F"
            : "O";
      }
      const { data } = await api.put<RawPatientFromAPI>(
        `/patients/${patientId}/`,
        backendData
      );
      return mapRawPatientToFrontend(data);
    } catch (error: any) {
      console.error(`Error updating patient ${patientId}:`, error);
      let errorMessage = "Không thể cập nhật thông tin bệnh nhân";
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data)}`;
      }
      throw new Error(errorMessage);
    }
  },

  /** Delete patient by ID */
  async deletePatient(patientId: number): Promise<string> {
    try {
      const { data } = await api.delete<string>(`/patients/${patientId}/`);
      return data;
    } catch (error: any) {
      console.error(`Error deleting patient ${patientId}:`, error);
      throw new Error("Không thể xóa bệnh nhân");
    }
  },

  /** Search patient by identityNumber, insuranceNumber, or fullName */
  async searchPatient(params: {
    identityNumber?: string;
    insuranceNumber?: string;
    fullName?: string;
  }): Promise<Patient | null> {
    try {
      const query = new URLSearchParams(params).toString();
      const { data } = await api.get<RawPatientFromAPI[]>(
        `/patients/search?${query}`
      ); // Backend search returns a list
      if (data && data.length > 0) {
        return mapRawPatientToFrontend(data[0]); // Return the first match
      }
      return null;
    } catch (error: any) {
      console.error(
        `Error searching patient with params ${JSON.stringify(params)}:`,
        error
      );
      throw new Error("Không thể tìm kiếm bệnh nhân");
    }
  },

  /** Get all emergency contacts for a patient */
  async getEmergencyContacts(patientId: number): Promise<EmergencyContact[]> {
    try {
      const { data } = await api.get<EmergencyContact[]>(
        `/patients/${patientId}/contacts/`
      );
      return data;
    } catch (error: any) {
      console.error(
        `Error fetching emergency contacts for patient ${patientId}:`,
        error
      );
      throw new Error("Không thể tải danh sách liên hệ khẩn cấp");
    }
  },

  /** Add an emergency contact */
  async addEmergencyContact(
    patientId: number,
    contactData: EmergencyContactDto
  ): Promise<EmergencyContact> {
    try {
      const { data } = await api.post<EmergencyContact>(
        `/patients/${patientId}/contacts/`,
        contactData
      );
      return data;
    } catch (error: any) {
      console.error(
        `Error adding emergency contact for patient ${patientId}:`,
        error
      );
      throw new Error("Không thể thêm liên hệ khẩn cấp");
    }
  },

  /** Update emergency contact */
  async updateEmergencyContact(
    contactId: number,
    patientId: number,
    contactData: EmergencyContactDto
  ): Promise<EmergencyContact> {
    try {
      const { data } = await api.put<EmergencyContact>(
        `/patients/${patientId}/contacts/${contactId}/`,
        contactData
      );
      return data;
    } catch (error: any) {
      console.error(
        `Error updating emergency contact ${contactId} for patient ${patientId}:`,
        error
      );
      throw new Error("Không thể cập nhật liên hệ khẩn cấp");
    }
  },

  /** Delete an emergency contact */
  async deleteEmergencyContact(
    patientId: number,
    contactId: number
  ): Promise<string> {
    try {
      const { data } = await api.delete<string>(
        `/patients/${patientId}/contacts/${contactId}/`
      );
      return data;
    } catch (error: any) {
      console.error(
        `Error deleting emergency contact ${contactId} for patient ${patientId}:`,
        error
      );
      throw new Error("Không thể xóa liên hệ khẩn cấp");
    }
  },
};
