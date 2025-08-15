import type { Doctor, DoctorDto } from "../types/doctor";
import type { DoctorInfo } from "../types/auths";
import { api } from "./api";
import { handleApiError } from "../utils/errorHandler";
import i18n from "../../i18n";
import type { AvailableSlot } from "../types/appointment";

export interface DoctorSearchParams {
  specialty?: string;
  department?: string;
  name?: string;
  minRating?: number;
  maxFee?: number;
  experience?: number;
  page?: number;
  limit?: number;
}

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  work_date: string;
  start_time: string;
  end_time: string;
  shift: "M" | "A";
  doctor: number;
  room: number;
}

export const doctorService = {
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await api.get<Doctor[]>("/doctors");
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async getDoctorById(userId: number): Promise<Doctor> {
    try {
      const response = await api.get<Doctor>(`/doctors/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async getDoctorByUserId(doctorId: number): Promise<Doctor> {
    try {
      const response = await api.get<Doctor>(`/doctors/user/${doctorId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        handleApiError(error, false) || i18n.t("services.doctor.doctorNotFound")
      );
    }
  },

  async createDoctor(doctorData: DoctorDto): Promise<Doctor> {
    try {
      const response = await api.post<Doctor>("/doctors", doctorData);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async getDoctorSchedule(
    doctorId: number,
    workDate?: string
  ): Promise<DoctorSchedule[]> {
    try {
      const params = new URLSearchParams();
      params.append("doctor_id", doctorId.toString());
      if (workDate) {
        params.append("work_date", workDate);
      }
      const response = await api.get<DoctorSchedule[]>(
        `/schedules/?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  // Get doctor's available time slots for a specific date
  async getAvailableTimeSlots(
    scheduleId: number,
    date: string
  ): Promise<{
    date: string;
    timeSlots: Array<{ time: string; available: boolean; scheduleId: number }>;
  }> {
    try {
      const response = await api.post<AvailableSlot[]>(
        `/appointments/schedule/available-slots/`,
        {
          schedule_id: scheduleId,
        }
      );

      const formattedTimeSlots = response.data.map((slot) => ({
        time: slot.slot_start,
        available: slot.available,
        scheduleId: slot.scheduleId || scheduleId,
      }));

      return {
        date: date,
        timeSlots: formattedTimeSlots,
      };
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async updateDoctorProfile(
    doctorId: number,
    data: Partial<DoctorInfo>
  ): Promise<DoctorInfo> {
    try {
      const response = await api.patch<DoctorInfo>(
        `/doctors/${doctorId}/`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async updateDoctor(
    doctorId: number,
    doctorData: Partial<DoctorDto>
  ): Promise<Doctor> {
    // Sử dụng PATCH để partial update - chỉ gửi những trường thay đổi
    const response = await api.patch<Doctor>(
      `/doctors/${doctorId}/`,
      doctorData
    );
    return response.data;
  },

  async uploadDoctorAvatar(
    doctorId: number,
    file: File
  ): Promise<{ avatar: string }> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await api.post<{ avatar: string }>(
        `/doctors/${doctorId}/avatar/`,
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
};
