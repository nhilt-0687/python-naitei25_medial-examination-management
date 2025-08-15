import React, { useEffect, useState } from "react";
import { appointmentService } from "../../../services/appointmentService";
import { AppointmentResponse } from "../../../types/appointment";

const getStatusColor = (_status: string): string => {
  return "bg-green-500";
};

const TodayAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentService.getAllAppointments(0, 100);
        const shuffled = [...response.content].sort(() => Math.random() - 0.3);
        setAppointments(shuffled.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const getPatientName = (appointment: AppointmentResponse) =>
    appointment.patientInfo?.fullName || "Chưa rõ";

  const getTimeRange = (appointment: AppointmentResponse) =>
    appointment.slotStart && appointment.slotEnd
      ? `${appointment.slotStart} - ${appointment.slotEnd}`
      : "";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Lịch hẹn khám hôm nay
      </h2>

      <div className="relative">
        <div className="space-y-8">
          {appointments.length === 0 && (
            <div className="text-gray-400 text-center">Không có lịch hẹn</div>
          )}
          {appointments.map((appointment) => (
            <div key={appointment.appointmentId} className="flex items-start">
              <div className="w-20 flex-shrink-0 text-sm text-gray-500 pr-2">
                {getTimeRange(appointment)}
              </div>
              <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0 mr-4">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(
                    appointment.appointmentStatus
                  )}`}
                ></div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-800">
                  {getPatientName(appointment)}
                </h3>
                <p className="text-[12px] text-gray-500">
                  {appointment.symptoms}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodayAppointments;
