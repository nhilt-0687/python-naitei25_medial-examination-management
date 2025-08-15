import type {
  Doctor,
  DoctorDto,
  CreateDoctorRequest,
  ExaminationRoom,
  ExaminationRoomDto,
} from "../types/doctor";
import { api } from "../../../shared/services/api";
import i18n from "../../../i18n";

export const doctorService = {
  // Get all doctors
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await api.get<any[]>("/doctors/");
      return response.data.map((item) => ({
        doctorId: item.id,
        userId: item.user?.id,
        identityNumber: item.identity_number,
        fullName: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
        birthday: item.birthday,
        gender: item.gender === "M" ? "MALE" : "FEMALE",
        address: item.address,
        academicDegree: item.academic_degree,
        specialization: item.specialization,
        avatar: item.avatar,
        type: item.type === "EXAMINATION" ? "EXAMINATION" : "SERVICE",
        department: {
          id: item.department?.id,
          department_name: item.department?.department_name,
          description: item.department?.description,
          createdAt: item.department?.created_at,
        },
        departmentId: item.department?.id,
        departmentName: item.department?.department_name,
        createdAt: item.created_at,
      }));
    } catch (error: any) {
      console.error("Error fetching doctors:", error);
      throw new Error("Không thể tải danh sách bác sĩ");
    }
  },

  // Get doctor by ID (based on doctor's primary key ID)
  async getDoctorById(doctorId: number): Promise<Doctor> {
    try {
      const response = await api.get<any>(`/doctors/${doctorId}/`);
      const item = response.data;
      return {
        doctorId: item.id,
        userId: item.user?.id,
        identityNumber: item.identity_number,
        fullName: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
        birthday: item.birthday,
        gender: item.gender === "M" ? "MALE" : "FEMALE",
        address: item.address,
        academicDegree: item.academic_degree,
        specialization: item.specialization,
        avatar: item.avatar,
        type: item.type === "EXAMINATION" ? "EXAMINATION" : "SERVICE",
        department: {
          id: item.department?.id,
          department_name: item.department?.department_name,
          description: item.department?.description,
          created_at: item.department?.created_at,
        },
        departmentId: item.department?.id,
        departmentName: item.department?.department_name,
        createdAt: item.created_at,
      };
    } catch (error: any) {
      console.error(`Error fetching doctor ${doctorId}:`, error);
      throw new Error("Không thể tải thông tin bác sĩ");
    }
  },

  // Get doctor by userId (user's primary key ID)
  async getDoctorByUserId(userId: number): Promise<Doctor> {
    try {
      const response = await api.get<any>(`/doctors/user/${userId}/`);
      const item = response.data;
      if (!item) {
        throw new Error(i18n.t("services.doctor.doctorNotFound"));
      }
      return {
        doctorId: item.id,
        userId: item.user?.id,
        identityNumber: item.identity_number,
        fullName: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
        birthday: item.birthday,
        gender: item.gender === "M" ? "MALE" : "FEMALE",
        address: item.address,
        academicDegree: item.academic_degree,
        specialization: item.specialization,
        avatar: item.avatar,
        type: item.type === "EXAMINATION" ? "EXAMINATION" : "SERVICE",
        department: {
          id: item.department?.id,
          department_name: item.department?.department_name,
          description: item.department?.description,
          created_at: item.department?.created_at,
        },
        departmentId: item.department?.id,
        departmentName: item.department?.department_name,
        createdAt: item.created_at,
      };
    } catch (error: any) {
      console.error(`Error fetching doctor by userId ${userId}:`, error);
      throw new Error(i18n.t("services.doctor.doctorNotFound"));
    }
  },

  // Create doctor
  async createDoctor(doctorData: CreateDoctorRequest): Promise<Doctor> {
    try {
      const requestBody = {
        ...doctorData,
        first_name: doctorData.first_name,
        last_name: doctorData.last_name,
        gender: doctorData.gender === "MALE" ? "M" : "F",
        type: doctorData.type === "EXAMINATION" ? "EXAMINATION" : "SERVICE",
      };
      const response = await api.post<Doctor>("/doctors/", requestBody);
      return response.data;
    } catch (error: any) {
      console.error("Error creating doctor:", error);
      throw new Error("Không thể tạo bác sĩ mới");
    }
  },

  // Update doctor
  async updateDoctor(
    doctorId: number,
    doctorData: Partial<DoctorDto>
  ): Promise<Doctor> {
    try {
      const requestBody: any = { ...doctorData };
      if (doctorData.first_name !== undefined) {
        requestBody.first_name = doctorData.first_name;
      }
      if (doctorData.last_name !== undefined) {
        requestBody.last_name = doctorData.last_name;
      }
      if (doctorData.gender !== undefined) {
        requestBody.gender = doctorData.gender === "MALE" ? "M" : "F";
      }
      if (doctorData.type !== undefined) {
        requestBody.type = doctorData.type === "EXAMINATION" ? "EXAMINATION" : "SERVICE";
      }

      const response = await api.put<Doctor>(
        `/doctors/${doctorId}/`,
        requestBody
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error updating doctor ${doctorId}:`, error);
      throw new Error("Không thể cập nhật bác sĩ");
    }
  },

  // Delete doctor
  async deleteDoctor(doctorId: number): Promise<string> {
    try {
      const response = await api.delete<string>(`/doctors/${doctorId}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting doctor ${doctorId}:`, error);
      throw new Error("Không thể xóa bác sĩ");
    }
  },

  // Find doctor by identity number
  async findByIdentityNumber(identityNumber: string): Promise<Doctor | null> {
    try {
      const response = await api.get<any | null>(
        `/doctors/search?identityNumber=${identityNumber}`
      );
      if (!response.data) return null;
      const item = response.data;
      return {
        doctorId: item.id,
        userId: item.user?.id,
        identityNumber: item.identity_number,
        fullName: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
        birthday: item.birthday,
        gender: item.gender === "M" ? "MALE" : "FEMALE",
        address: item.address,
        academicDegree: item.academic_degree,
        specialization: item.specialization,
        avatar: item.avatar,
        type: item.type === "EXAMINATION" ? "EXAMINATION" : "SERVICE",
        department: {
          id: item.department?.id,
          department_name: item.department?.department_name,
          description: item.department?.description,
          created_at: item.department?.created_at,
        },
        departmentId: item.department?.id,
        departmentName: item.department?.department_name,
        createdAt: item.created_at,
      };
    } catch (error: any) {
      console.error(
        `Error finding doctor by identity number ${identityNumber}:`,
        error
      );
      throw new Error("Không thể tìm bác sĩ theo số CMND/CCCD");
    }
  },

  async filterDoctors(params: {
    gender?: "MALE" | "FEMALE" | "OTHER";
    academicDegree?:
      | "BS"
      | "BS_CKI"
      | "BS_CKII"
      | "THS_BS"
      | "TS_BS"
      | "PGS_TS_BS"
      | "GS_TS_BS";
    specialization?: string;
    type?: "EXAMINATION" | "SERVICE";
  }): Promise<Doctor[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.gender) queryParams.append("gender", params.gender === "MALE" ? "M" : (params.gender === "FEMALE" ? "F" : params.gender));
      if (params.academicDegree)
        queryParams.append("academicDegree", params.academicDegree);
      if (params.specialization)
        queryParams.append("specialization", params.specialization);
      if (params.type) queryParams.append("type", params.type);

      const response = await api.get<any[]>(
        `/doctors/filter?${queryParams.toString()}`
      );
      return response.data.map((item) => ({
        doctorId: item.id,
        userId: item.user?.id,
        identityNumber: item.identity_number,
        fullName: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
        birthday: item.birthday,
        gender: item.gender === "M" ? "MALE" : "FEMALE",
        address: item.address,
        academicDegree: item.academic_degree,
        specialization: item.specialization,
        avatar: item.avatar,
        type: item.type === "EXAMINATION" ? "EXAMINATION" : "SERVICE",
        department: {
          id: item.department?.id,
          department_name: item.department?.department_name,
          description: item.department?.description,
          created_at: item.department?.created_at,
        },
        departmentId: item.department?.id,
        departmentName: item.department?.department_name,
        createdAt: item.created_at,
      }));
    } catch (error: any) {
      console.error("Error filtering doctors:", error);
      throw new Error("Không thể lọc danh sách bác sĩ");
    }
  },

  // Get all examination rooms
  async getAllExaminationRooms(): Promise<ExaminationRoom[]> {
    try {
      const response = await api.get<any[]>("/examination-rooms/");
      return response.data.map((room: any) => ({
        roomId: room.id,
        departmentId: room.department_id,
        type: room.type,
        building: room.building,
        floor: room.floor,
        note: room.note,
        createdAt: room.created_at,
      }));
    } catch (error: any) {
      console.error("Error fetching examination rooms:", error);
      throw new Error("Không thể tải danh sách phòng khám");
    }
  },

  // Get examination room by ID
  async getExaminationRoomById(
    roomId: number
  ): Promise<ExaminationRoom | null> {
    try {
      const response = await api.get<ExaminationRoom | null>(
        `/examination-rooms/${roomId}/`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching examination room ${roomId}:`, error);
      throw new Error("Không thể tải thông tin phòng khám");
    }
  },

  // Create examination room
  async createExaminationRoom(
    roomData: Omit<ExaminationRoomDto, "roomId">
  ): Promise<ExaminationRoomDto> {
    try {
      const response = await api.post<ExaminationRoomDto>(
        "/examination-rooms/",
        roomData
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating examination room:", error);
      throw new Error("Không thể tạo phòng khám mới");
    }
  },

  // Update examination room
  async updateExaminationRoom(
    roomId: number,
    roomData: Partial<ExaminationRoomDto>
  ): Promise<ExaminationRoom> {
    try {
      const response = await api.put<ExaminationRoom>(
        `/examination-rooms/${roomId}/`,
        roomData
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error updating examination room ${roomId}:`, error);
      throw new Error("Không thể cập nhật phòng khám");
    }
  },

  // Delete examination room
  async deleteExaminationRoom(roomId: number): Promise<string> {
    try {
      const response = await api.delete<string>(
        `/examination-rooms/${roomId}/`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting examination room ${roomId}:`, error);
      throw new Error("Không thể xóa phòng khám");
    }
  },
};
