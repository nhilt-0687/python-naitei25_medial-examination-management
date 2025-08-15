import type {
  Service,
  ServiceDto,
  Appointment,
  ServiceOrder,
  AppointmentUpdateRequest,
  AppointmentRequest,
  AppointmentResponse,
  Schedule,
} from "../types/appointment";
import { api } from "../../../shared/services/api";
import { AppointmentStatus } from "../types/appointment";

export const appointmentService = {
  // Get all services
  async getAllServices(): Promise<Service[]> {
    try {
      const response = await api.get<Service[]>("/appointments/services/");
      return response.data;
    } catch (error) {
      console.error("Error fetching services:", error);
      throw new Error("Không thể tải danh sách dịch vụ");
    }
  },

  // Get service by ID
  async getServiceById(serviceId: number): Promise<Service> {
    try {
      const response = await api.get<Service>(
        `/appointments/services/${serviceId}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching service ${serviceId}:`, error);
      throw new Error("Không thể tải thông tin dịch vụ");
    }
  },

  // Create service
  async createService(serviceData: ServiceDto): Promise<Service> {
    try {
      const response = await api.post<Service>(
        "/appointments/services/",
        serviceData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating service:", error);
      throw new Error("Không thể tạo dịch vụ mới");
    }
  },

  // Update service
  async updateService(
    serviceId: number,
    serviceData: Partial<ServiceDto>
  ): Promise<Service> {
    try {
      const response = await api.put<Service>(
        `/appointments/services/${serviceId}/`,
        serviceData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating service ${serviceId}:`, error);
      throw new Error("Không thể cập nhật dịch vụ");
    }
  },

  // Delete service
  async deleteService(serviceId: number): Promise<string> {
    try {
      const response = await api.delete<string>(
        `/appointments/services/${serviceId}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting service ${serviceId}:`, error);
      throw new Error("Không thể xóa dịch vụ");
    }
  },

  // Get all orders
  async getAllOrders(serviceId: number): Promise<ServiceOrder[]> {
    try {
      const response = await api.get<ServiceOrder[]>(
        `/appointments/services/${serviceId}/service-orders/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for service ${serviceId}:`, error);
      throw new Error("Không thể tải danh sách đơn hàng");
    }
  },

  // Get all appointments by patient ID
  async getAppointmentsByPatientId(
    patientId: number,
    pageNo = 0,
    pageSize = 10
  ): Promise<any> {
    try {
      const response = await api.get(
        `/appointments/patient/${patientId}?pageNo=${pageNo}&pageSize=${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching appointments for patient ${patientId}:`,
        error
      );
      throw new Error("Không thể tải lịch khám của bệnh nhân");
    }
  },

  // Get appointment by ID
  async getAppointmentById(appointmentId: number): Promise<Appointment> {
    try {
      const response = await api.get<Appointment>(
        `/appointments/${appointmentId}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${appointmentId}:`, error);
      throw new Error("Không thể tải thông tin lịch khám");
    }
  },

  // Create appointment
  async createAppointment(
    appointmentData: AppointmentRequest
  ): Promise<AppointmentRequest> {
    const requestBody = {
      doctor: appointmentData.doctor,
      patient: appointmentData.patient,
      schedule: appointmentData.schedule,
      symptoms: appointmentData.symptoms.trim(),
      slot_start: appointmentData.slot_start,
      slot_end: appointmentData.slot_end,
      ...(appointmentData.appointment_status && {
        appointment_status: appointmentData.appointment_status,
      }),
    };

    try {
      const response = await api.post<AppointmentRequest>(
        "/appointments/",
        requestBody
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating appointment (Frontend Service):", error);

      let errorMessage = "Không thể tạo lịch khám mới";

      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.response?.data?.detail) {
        errorMessage += `: ${error.response.data.detail}`;
      } else if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data)}`;
      }

      throw new Error(errorMessage);
    }
  },

  // Update appointment
  async updateAppointment(
    appointmentId: number,
    appointmentData: Partial<AppointmentUpdateRequest>
  ): Promise<AppointmentUpdateRequest> {
    try {
      const snakeCaseUpdateData: any = {};

      if (appointmentData.appointmentStatus !== undefined) {
        const statusMapToBackend: Record<AppointmentStatus, string> = {
          [AppointmentStatus.PENDING]: "PENDING",
          [AppointmentStatus.CONFIRMED]: "CONFIRMED",
          [AppointmentStatus.CANCELLED]: "CANCELLED",
          [AppointmentStatus.COMPLETED]: "COMPLETED",
          [AppointmentStatus.NO_SHOW]: "NO_SHOW",
          [AppointmentStatus.IN_PROGRESS]: "IN_PROGRESS",
        };
        snakeCaseUpdateData.appointment_status =
          statusMapToBackend[appointmentData.appointmentStatus];
      }
      if (appointmentData.doctorId !== undefined) {
        snakeCaseUpdateData.doctor_id = Number(appointmentData.doctorId);
      }
      if (appointmentData.patientId !== undefined) {
        snakeCaseUpdateData.patient_id = Number(appointmentData.patientId);
      }
      if (appointmentData.scheduleId !== undefined) {
        snakeCaseUpdateData.schedule_id = Number(appointmentData.scheduleId);
      }
      if (appointmentData.symptoms !== undefined) {
        snakeCaseUpdateData.symptoms = appointmentData.symptoms.trim();
      }
      if (appointmentData.slotStart !== undefined) {
        snakeCaseUpdateData.slot_start = appointmentData.slotStart;
      }
      if (appointmentData.slotEnd !== undefined) {
        snakeCaseUpdateData.slot_end = appointmentData.slotEnd;
      }

      const response = await api.put<AppointmentUpdateRequest>(
        `/appointments/${appointmentId}/`,
        snakeCaseUpdateData
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error updating appointment ${appointmentId}:`, error);

      if (error.response) {
        console.error("Backend response error:", {
          status: error.response.status,
          data: error.response.data,
        });

        const backendMessage =
          error.response.data?.message || error.response.data?.detail;
        if (backendMessage) {
          throw new Error(`Lỗi từ server: ${backendMessage}`);
        }
      }

      throw new Error("Không thể cập nhật lịch khám");
    }
  },

  // Function to cancel an appointment via POST to /cancel/ endpoint
  async cancelAppointment(appointmentId: number): Promise<void> {
    try {
      await api.post(`/appointments/${appointmentId}/cancel/`);
    } catch (error: any) {
      console.error(`Error cancelling appointment ${appointmentId}:`, error);
      if (error.response) {
        console.error("Backend response error:", {
          status: error.response.status,
          data: error.response.data,
        });
        const backendMessage =
          error.response.data?.message || error.response.data?.detail;
        if (backendMessage) {
          throw new Error(`Lỗi từ server khi hủy: ${backendMessage}`);
        }
      }
      throw new Error("Không thể hủy lịch khám");
    }
  },

  // Delete appointment
  async deleteAppointment(appointmentId: number): Promise<string> {
    try {
      const response = await api.delete<string>(
        `/appointments/${appointmentId}/`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting appointment ${appointmentId}:`, error);

      if (error.response) {
        console.error("Backend response error:", {
          status: error.response.status,
          data: error.response.data,
        });

        if (error.response.status === 404) {
          throw new Error("Không tìm thấy lịch khám để xóa");
        }
        if (error.response.status === 403) {
          throw new Error("Bạn không có quyền x��a lịch khám này");
        }

        const backendMessage =
          error.response.data?.message || error.response.data?.detail;
        if (backendMessage) {
          throw new Error(`Lỗi từ server: ${backendMessage}`);
        }
      }

      throw new Error("Không thể xóa lịch khám");
    }
  },

  // Get all appointments
  async getAllAppointments(
    pageNo = 0,
    pageSize = 10
  ): Promise<{
    content: AppointmentResponse[];
    totalPages: number;
    totalElements: number;
    pageNo: number;
    pageSize: number;
  }> {
    try {
      const response = await api.get(`/appointments/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      throw new Error("Không thể tải danh sách lịch khám");
    }
  },

  // Get schedules by date
  async getSchedulesByDate(date: string) {
    try {
      const response = await api.get(`/schedules/date/${date}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedules for date ${date}:`, error);
      throw new Error("Không thể tải lịch làm việc theo ngày");
    }
  },

  // Get schedule by id
  async getScheduleById(id: number) {
    try {
      const response = await api.get(`/schedules/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule ${id}:`, error);
      throw new Error("Không thể tải thông tin lịch làm việc");
    }
  },

  // Get schedules by doctor ID and date
  async getSchedulesByDoctorAndDate(
    doctorId: number,
    date: string
  ): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>(
        `/schedules/?doctor_id=${doctorId}&workDate=${date}`
      );
      console.log(
        "🔍 appointmentService.getSchedulesByDoctorAndDate - Response data:",
        response.data
      );

      // Thêm bước lọc để chỉ trả về schedules của bác sĩ được chọn
      const filteredSchedules = response.data.filter(
        (schedule: any) => schedule.doctor_id === doctorId
      );

      console.log(
        `🔍 Filtered schedules for doctor ${doctorId}:`,
        filteredSchedules
      );

      return filteredSchedules;
    } catch (error) {
      console.error(
        `Error fetching schedules for doctor ${doctorId} on date ${date}:`,
        error
      );
      throw new Error("Không thể tải lịch làm việc của bác sĩ theo ngày");
    }
  },

  // Get available time slots for a schedule
  async getAvailableTimeSlots(
    scheduleId: number
  ): Promise<{ slot_start: string; slot_end: string; available: boolean }[]> {
    try {
      if (!scheduleId || scheduleId <= 0) {
        throw new Error("Schedule ID không hợp lệ");
      }

      const response = await api.post<
        { slot_start: string; slot_end: string; available: boolean }[]
      >(`/appointments/schedule/available-slots/`, {
        schedule_id: Number(scheduleId),
      });
      return response.data;
    } catch (error: any) {
      console.error(
        `Error fetching available slots for schedule ${scheduleId}:`,
        error
      );

      if (error.response) {
        console.error("Backend response error:", {
          status: error.response.status,
          data: error.response.data,
        });

        const backendMessage =
          error.response.data?.message || error.response.data?.detail;
        if (backendMessage) {
          throw new Error(`Lỗi từ server: ${backendMessage}`);
        }
      }

      throw new Error("Không thể tải các slot thời gian có sẵn");
    }
  },
};
