export interface Department {
  id: string;
  name: string;
  description?: string;
  location?: string;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  speciality?: string;
  avatar?: string;
}

export interface Schedule {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  currentPatients: number;
  status: "AVAILABLE" | "FULL" | "CANCELLED";
}

export interface Patient {
  id: string;
  fullName: string;
  phoneNumber: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  insuranceNumber?: string;
}

export interface Appointment {
  id: string;
  scheduleId: string;
  patientId: string;
  doctorId: string;
  symptoms: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  schedule?: {
    date: string;
    doctorName: string;
    departmentName: string;
    departmentId: string;
  };
  patientInfo?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    age: number;
    gender: string;
    insuranceId: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Dữ liệu mẫu cho các khoa
export const departments: Department[] = [
  { id: "1", name: "Khoa Nội", location: "Tầng 2, Tòa nhà A" },
  { id: "2", name: "Khoa Ngoại", location: "Tầng 3, Tòa nhà A" },
  { id: "3", name: "Khoa Tim mạch", location: "Tầng 4, Tòa nhà B" },
  { id: "4", name: "Khoa Sản", location: "Tầng 2, Tòa nhà B" },
  { id: "5", name: "Khoa Nhi", location: "Tầng 3, Tòa nhà B" },
  { id: "6", name: "Khoa Cơ Xương Khớp", location: "Tầng 5, Tòa nhà A" },
  { id: "7", name: "Khoa Tiêu hóa", location: "Tầng 4, Tòa nhà A" },
  { id: "8", name: "Khoa Thần kinh", location: "Tầng 5, Tòa nhà B" },
];

// Dữ liệu mẫu cho các bác sĩ
export const doctors: Doctor[] = [
  { 
    id: "1", 
    name: "Phạm Văn Minh", 
    departmentId: "1",
    speciality: "Nội tổng quát",
    avatar: "https://example.com/avatars/doctor1.jpg"
  },
  { 
    id: "2", 
    name: "Nguyễn Minh Hải", 
    departmentId: "1",
    speciality: "Nội tiêu hóa",
    avatar: "https://example.com/avatars/doctor2.jpg"
  },
  { id: "3", name: "Đỗ Thành Nam", departmentId: "3" },
  { id: "4", name: "Trương Thị Mỹ Hoa", departmentId: "7" },
  { id: "5", name: "Lưu Ly", departmentId: "4" },
  { id: "6", name: "Lâm Tâm Như", departmentId: "6" },
  { id: "7", name: "Hoắc Kiến Hoa", departmentId: "5" },
  { id: "8", name: "Châu Tấn", departmentId: "2" },
  { id: "9", name: "Phạm Băng Băng", departmentId: "8" },
  { id: "10", name: "Đàm Vĩnh Hưng", departmentId: "3" },
];

// Dữ liệu mẫu cho lịch làm việc
export const schedules: Schedule[] = [
  {
    id: "1",
    doctorId: "1",
    date: "2024-03-20",
    startTime: "08:00",
    endTime: "12:00",
    maxPatients: 20,
    currentPatients: 5,
    status: "AVAILABLE"
  },
  {
    id: "2",
    doctorId: "1",
    date: "2024-03-20",
    startTime: "13:30",
    endTime: "17:00",
    maxPatients: 15,
    currentPatients: 15,
    status: "FULL"
  },
  // Thêm lịch mới cho ngày 11/6/2025
  // Ca sáng cho tất cả bác sĩ
  ...doctors.map((doctor, index) => ({
    id: `${10 + index * 2}`,
    doctorId: doctor.id,
    date: "2025-06-11",
    startTime: "08:00",
    endTime: "11:30",
    maxPatients: 15,
    currentPatients: 0,
    status: "AVAILABLE" as const
  })),
  // Ca chiều cho tất cả bác sĩ
  ...doctors.map((doctor, index) => ({
    id: `${11 + index * 2}`,
    doctorId: doctor.id,
    date: "2025-06-11",
    startTime: "13:30",
    endTime: "16:30",
    maxPatients: 15,
    currentPatients: 0,
    status: "AVAILABLE" as const
  }))
];

// Dữ liệu mẫu cho bệnh nhân
export const patients: Patient[] = [
  {
    id: "1",
    fullName: "Trần Văn D",
    phoneNumber: "0901234567",
    age: 35,
    gender: "MALE",
    insuranceNumber: "BH123456789"
  },
  {
    id: "2",
    fullName: "Nguyễn Văn Thịnh",
    phoneNumber: "0912345678",
    age: 42,
    gender: "MALE",
    insuranceNumber: "BH234567890"
  },
  {
    id: "3",
    fullName: "Nguyễn Văn C",
    phoneNumber: "0923456789",
    age: 28,
    gender: "MALE",
    insuranceNumber: "BH345678901"
  },
  {
    id: "4",
    fullName: "Nguyễn Văn C",
    phoneNumber: "0934567890",
    age: 50,
    gender: "MALE",
    insuranceNumber: "BH456789012"
  },
  {
    id: "5",
    fullName: "Lê Thiện Nhi",
    phoneNumber: "0945678901",
    age: 25,
    gender: "FEMALE",
    insuranceNumber: "BH567890123"
  },
  {
    id: "6",
    fullName: "Nguyễn Văn A",
    phoneNumber: "0956789012",
    age: 45,
    gender: "MALE",
    insuranceNumber: "BH678901234"
  },
  {
    id: "7",
    fullName: "Trần Đỗ Phương Nhi",
    phoneNumber: "0967890123",
    age: 30,
    gender: "FEMALE",
    insuranceNumber: "BH789012345"
  },
  {
    id: "8",
    fullName: "Trần Ngọc Anh Thơ",
    phoneNumber: "0978901234",
    age: 27,
    gender: "FEMALE",
    insuranceNumber: "BH890123456"
  }
];

// Dữ liệu mẫu cho lịch khám
export const appointments: Appointment[] = [
  {
    id: "1",
    scheduleId: "1",
    patientId: "1",
    doctorId: "1",
    symptoms: "Đau đầu, sốt nhẹ",
    slotStart: "08:00",
    slotEnd: "08:30",
    status: "success",
    schedule: {
      date: "2024-03-20",
      doctorName: "Bs. Nguyễn Văn A",
      departmentName: "Khoa Nội",
      departmentId: "1"
    },
    patientInfo: {
      id: "1",
      fullName: "Nguyễn Văn Bệnh",
      phoneNumber: "0123456789",
      age: 30,
      gender: "MALE",
      insuranceId: "BH123456789"
    }
  },
  {
    id: "2",
    scheduleId: "2",
    patientId: "2",
    doctorId: "2",
    symptoms: "Đau bụng, buồn nôn",
    slotStart: "09:00",
    slotEnd: "09:30",
    status: "warning",
    schedule: {
      date: "2024-03-20",
      doctorName: "Bs. Trần Thị B",
      departmentName: "Khoa Ngoại",
      departmentId: "2"
    },
    patientInfo: {
      id: "2",
      fullName: "Trần Thị Khỏe",
      phoneNumber: "0987654321",
      age: 25,
      gender: "FEMALE",
      insuranceId: "BH987654321"
    }
  }
];

// Service API giả lập
export const mockDataService = {
  // Lấy danh sách khoa
  getDepartments: async (): Promise<Department[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(departments), 300);
    });
  },

  // Lấy danh sách bác sĩ theo khoa
  getDoctorsByDepartment: async (departmentId: string): Promise<Doctor[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredDoctors = doctors.filter(
          (doctor) => doctor.departmentId === departmentId
        );
        resolve(filteredDoctors);
      }, 300);
    });
  },

  // Lấy lịch làm việc của bác sĩ theo ngày
  getSchedulesByDoctorAndDate: async (doctorId: string, date: string): Promise<Schedule[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredSchedules = schedules.filter(
          (schedule) => schedule.doctorId === doctorId && schedule.date === date
        );
        resolve(filteredSchedules);
      }, 300);
    });
  },

  // Lấy danh sách bệnh nhân
  getPatients: async (): Promise<Patient[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(patients);
      }, 300);
    });
  },

  // Lấy thông tin bệnh nhân theo ID
  getPatientById: async (patientId: string): Promise<Patient | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = patients.find((p) => p.id === patientId);
        resolve(patient || null);
      }, 300);
    });
  },

  // Get all appointments
  getAppointments: async (): Promise<Appointment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(appointments);
      }, 500);
    });
  },

  // Create new appointment
  createAppointment: async (appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<Appointment> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAppointment: Appointment = {
          id: (appointments.length + 1).toString(),
          ...appointmentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          schedule: {
            date: appointmentData.schedule?.date || new Date().toISOString().split("T")[0],
            doctorName: appointmentData.schedule?.doctorName || "Bác sĩ",
            departmentName: appointmentData.schedule?.departmentName || "Khoa",
            departmentId: appointmentData.schedule?.departmentId || "1"
          },
          patientInfo: {
            id: appointmentData.patientId,
            fullName: "Bệnh nhân mới",
            phoneNumber: "",
            age: 0,
            gender: "OTHER",
            insuranceId: ""
          }
        };
        appointments.push(newAppointment);
        resolve(newAppointment);
      }, 500);
    });
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: string): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (!appointment) {
          reject(new Error("Không tìm thấy lịch khám"));
          return;
        }
        appointment.status = status;
        resolve(appointment);
      }, 500);
    });
  },

  // Cập nhật số lượng bệnh nhân trong lịch làm việc
  updateSchedulePatientCount: async (scheduleId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const schedule = schedules.find((s) => s.id === scheduleId);
        if (schedule) {
          schedule.currentPatients += 1;
          if (schedule.currentPatients >= schedule.maxPatients) {
            schedule.status = "FULL";
          }
        }
        resolve();
      }, 300);
    });
  }
};