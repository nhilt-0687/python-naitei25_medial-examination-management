import { authService } from '../../../shared/services/authService'
import { patientService } from '../../../shared/services/patientService'
import { doctorService } from '../../../shared/services/doctorService'
import { appointmentService } from '../../../shared/services/appointmentService'
import { paymentService } from '../../../shared/services/paymentService'
import { departmentService } from '../../../shared/services/departmentService'
import { serviceService } from '../../../shared/services/serviceService'

// Re-export all services for patient features
export {
  authService,
  patientService,
  doctorService,
  appointmentService,
  paymentService,
  departmentService,
  serviceService
}

// Patient-specific API wrapper
export const patientApiService = {
  // Authentication
  auth: authService,

  // Patient profile management
  profile: {
    get: patientService.getCurrentPatient,
    update: patientService.updateProfile,
    uploadAvatar: patientService.uploadAvatar,
    getMedicalRecords: patientService.getMedicalRecords,
    getMedicalRecord: patientService.getMedicalRecord
  },

  // Doctor search and booking
  doctors: {
    search: doctorService.searchDoctors,
    getById: doctorService.getDoctorById,
    getFeatured: doctorService.getFeaturedDoctors,
    getSchedule: doctorService.getDoctorSchedule,
    getAvailableSlots: doctorService.getAvailableTimeSlots
  },

  // Appointment management
  appointments: {
    getMy: appointmentService.getMyAppointments,
    getUpcoming: appointmentService.getUpcomingAppointments,
    create: appointmentService.createAppointment,
    getById: appointmentService.getAppointmentById,
    update: appointmentService.updateAppointment,
    cancel: appointmentService.cancelAppointment
  },

  // Payment and billing
  payments: {
    getMyBills: paymentService.getMyBills,
    getBillById: paymentService.getBillById,
    createPayment: paymentService.createPayment,
    getPaymentStatus: paymentService.getPaymentStatus,
    getTransactionHistory: paymentService.getTransactionHistory
  },

  // Medical services
  services: {
    getAll: serviceService.getServices,
    getById: serviceService.getServiceById,
    getByCategory: serviceService.getServicesByCategory
  },

  // Departments
  departments: {
    getAll: departmentService.getDepartments,
    getById: departmentService.getDepartmentById
  }
}
