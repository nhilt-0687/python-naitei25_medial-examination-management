import React from 'react';
import { Appointment } from './ClinicCard';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
  clinicId: string;
  appointments: Appointment[];
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  clinicName,
  clinicId,
  appointments,
}) => {
  if (!isOpen) return null;

  // Phân loại lịch hẹn theo trạng thái
  const scheduledAppointments = appointments.filter(
    (app) => app.status === 'scheduled'
  );
  const inProgressAppointments = appointments.filter(
    (app) => app.status === 'in-progress'
  );
  const completedAppointments = appointments.filter(
    (app) => app.status === 'completed'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
            Đã đặt lịch
          </span>
        );
      case 'in-progress':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
            Đang khám
          </span>
        );
      case 'completed':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
            Hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
            Không xác định
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Lịch hẹn - {clinicName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có lịch hẹn</h3>
              <p className="mt-1 text-sm text-gray-500">
                Hiện tại không có lịch hẹn nào cho phòng khám này.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Appointments in progress */}
              {inProgressAppointments.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Đang khám ({inProgressAppointments.length})
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-yellow-200">
                      {inProgressAppointments.map((appointment) => (
                        <li key={appointment.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {appointment.patientName} ({appointment.patientId})
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.time} - {appointment.date}
                              </p>
                              {appointment.reason && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Lý do: {appointment.reason}
                                </p>
                              )}
                            </div>
                            <div>{getStatusBadge(appointment.status)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Scheduled appointments */}
              {scheduledAppointments.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Lịch hẹn sắp tới ({scheduledAppointments.length})
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {scheduledAppointments.map((appointment) => (
                        <li key={appointment.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {appointment.patientName} ({appointment.patientId})
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.time} - {appointment.date}
                              </p>
                              {appointment.reason && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Lý do: {appointment.reason}
                                </p>
                              )}
                            </div>
                            <div>{getStatusBadge(appointment.status)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Completed appointments (today) */}
              {completedAppointments.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Đã hoàn thành trong ngày ({completedAppointments.length})
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-green-200">
                      {completedAppointments.map((appointment) => (
                        <li key={appointment.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {appointment.patientName} ({appointment.patientId})
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.time} - {appointment.date}
                              </p>
                            </div>
                            <div>{getStatusBadge(appointment.status)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default AppointmentModal;