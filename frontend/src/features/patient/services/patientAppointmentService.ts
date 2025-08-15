import { appointmentService, appointmentNoteService } from '../../../shared/services/appointmentService'
import { scheduleService } from '../../../shared/services/scheduleService'
import { transformAvailableSlotsToTimeSlots } from '../../../shared/utils/appointmentTransform'
import type { 
  Appointment, 
  AvailableSlot,
  BackendCreateAppointmentPayload,
} from "../../../shared/types/appointment";
import type { TimeSlot } from "../../../shared/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class PatientAppointmentService {
  async createAppointmentFromBooking(bookingDetails: {
    doctorId: number;
    patientId: number;
    scheduleId: number;
    selectedDate: string;
    selectedTime: string;
    symptoms: string[];
  }): Promise<Appointment> {
    try {
      const [startTime, endTime] = this.parseTimeSlot(
        bookingDetails.selectedTime
      );

      const appointmentData: BackendCreateAppointmentPayload = {
        doctor: bookingDetails.doctorId,
        patient: bookingDetails.patientId,
        schedule: bookingDetails.scheduleId,
        slot_start: startTime,
        slot_end: endTime,
        symptoms: bookingDetails.symptoms.join(", "),
        status: "PENDING",
      };

      const appointment = await appointmentService.createAppointment(
        appointmentData
      );
      return appointmentService.getAppointmentById(appointment.id);
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw new Error("Không thể tạo lịch hẹn");
    }
  }

  async getAvailableTimeSlots(
    doctorId: number,
    date: string
  ): Promise<{
    morning: TimeSlot[];
    afternoon: TimeSlot[];
  }> {
    try {
      const schedules = await doctorService.getDoctorSchedule(doctorId, date);

      if (schedules.length === 0) {
        return { morning: [], afternoon: [] };
      }

      const schedule = schedules[0]
      
      const response = await fetch(`${API_BASE_URL}api/v1/appointments/schedule/available-slots/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule_id: schedule.id,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Failed to fetch available slots: ${response.status} ${response.statusText} - ${
            errorData.detail || JSON.stringify(errorData)
          }`
        )
      }

      const availableSlots: AvailableSlot[] = await response.json()
      return transformAvailableSlotsToTimeSlots(availableSlots)
    } catch (error) {
      console.error("Error fetching available slots:", error);
      return { morning: [], afternoon: [] };
    }
  }

  async cancelAppointment(appointmentId: number): Promise<void> {
    try {
      await appointmentService.updateAppointment(appointmentId, {
        id: appointmentId,
        status: "CANCELLED",
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw new Error("Không thể hủy lịch hẹn");
    }
  }

  async addAppointmentNote(
    appointmentId: number,
    content: string,
    noteType = "GENERAL"
  ): Promise<void> {
    try {
      await appointmentNoteService.createNote(appointmentId, {
        note_type: noteType,
        content,
      });
    } catch (error) {
      console.error("Error adding appointment note:", error);
      throw new Error("Không thể thêm ghi chú");
    }
  }

  private parseTimeSlot(timeString: string): [string, string] {
    const [start, end] = timeString.split(" - ");
    return [start.trim(), end.trim()];
  }

  async canBookAppointment(
    doctorId: number,
    date: string,
    time: string
  ): Promise<boolean> {
    try {
      const availableSlots = await this.getAvailableTimeSlots(doctorId, date)
      const allSlots = [...availableSlots.morning, ...availableSlots.afternoon]
      return allSlots.some(slot => slot.time === time && slot.isAvailable)
    } catch (error) {
      console.error("Error checking appointment availability:", error);
      return false;
    }
  }
}

export const patientAppointmentService = new PatientAppointmentService();
