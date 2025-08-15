import React from 'react';
import { Link } from 'react-router-dom';
import { PatientInfo } from './InpatientRoomCard';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomInfo: {
    number: string;
    department: string;
    building: string;
    floor: string;
  };
  patients: PatientInfo[];
}

const InpatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  roomInfo,
  patients,
}) => {
  if (!isOpen) return null;

  // Phân loại bệnh nhân theo mức độ
  const criticalPatients = patients.filter(p => p.severity === 'critical');
  const observationPatients = patients.filter(p => p.severity === 'observation');
  const normalPatients = patients.filter(p => p.severity === 'normal');

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
            Nguy kịch
          </span>
        );
      case 'observation':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
            Theo dõi
          </span>
        );
      case 'normal':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
            Bình thường
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Bệnh nhân - Phòng {roomInfo.number}
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

        {/* Room info */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Khoa:</span>{' '}
              <span className="text-gray-600">{roomInfo.department}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Vị trí:</span>{' '}
              <span className="text-gray-600">{roomInfo.building}, {roomInfo.floor}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tổng số bệnh nhân:</span>{' '}
              <span className="text-gray-600">{patients.length}</span>
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {patients.length === 0 ? (
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bệnh nhân</h3>
              <p className="mt-1 text-sm text-gray-500">
                Hiện tại không có bệnh nhân nào trong phòng này.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Critical patients */}
              {criticalPatients.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Bệnh nhân nguy kịch ({criticalPatients.length})
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-red-200">
                      {criticalPatients.map((patient) => (
                        <li key={patient.id} className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {patient.name} ({patient.age} tuổi, {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'})
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {patient.id}
                              </p>
                              <p className="text-sm text-gray-500">
                                Bác sĩ phụ trách: {patient.doctor}
                              </p>
                              <p className="text-sm text-gray-500">
                                Chẩn đoán: {patient.diagnosis}
                              </p>
                              <p className="text-sm text-gray-500">
                                Nhập viện: {patient.admissionDate}
                              </p>
                              {patient.expectedDischargeDate && (
                                <p className="text-sm text-gray-500">
                                  Dự kiến xuất viện: {patient.expectedDischargeDate}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              {getSeverityBadge(patient.severity)}
                              <Link
                                to={`/admin/patients/${patient.id}`}
                                className="text-sm text-base-600 hover:text-base-800 font-medium"
                              >
                                Xem hồ sơ
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Observation patients */}
              {observationPatients.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Bệnh nhân cần theo dõi ({observationPatients.length})
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-yellow-200">
                      {observationPatients.map((patient) => (
                        <li key={patient.id} className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {patient.name} ({patient.age} tuổi, {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'})
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {patient.id}
                              </p>
                              <p className="text-sm text-gray-500">
                                Bác sĩ phụ trách: {patient.doctor}
                              </p>
                              <p className="text-sm text-gray-500">
                                Chẩn đoán: {patient.diagnosis}
                              </p>
                              <p className="text-sm text-gray-500">
                                Nhập viện: {patient.admissionDate}
                              </p>
                              {patient.expectedDischargeDate && (
                                <p className="text-sm text-gray-500">
                                  Dự kiến xuất viện: {patient.expectedDischargeDate}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              {getSeverityBadge(patient.severity)}
                              <Link
                                to={`/admin/patients/${patient.id}`}
                                className="text-sm text-base-600 hover:text-base-800 font-medium"
                              >
                                Xem hồ sơ
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Normal patients */}
              {normalPatients.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Bệnh nhân ổn định ({normalPatients.length})
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-green-200">
                      {normalPatients.map((patient) => (
                        <li key={patient.id} className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {patient.name} ({patient.age} tuổi, {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'})
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {patient.id}
                              </p>
                              <p className="text-sm text-gray-500">
                                Bác sĩ phụ trách: {patient.doctor}
                              </p>
                              <p className="text-sm text-gray-500">
                                Chẩn đoán: {patient.diagnosis}
                              </p>
                              <p className="text-sm text-gray-500">
                                Nhập viện: {patient.admissionDate}
                              </p>
                              {patient.expectedDischargeDate && (
                                <p className="text-sm text-gray-500">
                                  Dự kiến xuất viện: {patient.expectedDischargeDate}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              {getSeverityBadge(patient.severity)}
                              <Link
                                to={`/admin/patients/${patient.id}`}
                                className="text-sm text-base-600 hover:text-base-800 font-medium"
                              >
                                Xem hồ sơ
                              </Link>
                            </div>
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

        {/* Modal footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md mr-2"
          >
            Đóng
          </button>
          <Link
            to={`/admin/patient-rooms/${roomInfo.number}/patients`}
            className="px-4 py-2 bg-base-600 hover:bg-base-700 text-white text-sm font-medium rounded-md"
          >
            Quản lý bệnh nhân
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InpatientModal;