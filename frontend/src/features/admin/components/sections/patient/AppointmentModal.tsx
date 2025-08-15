import React, { useState } from "react";
import { Modal } from "../../ui/modal";
import InfoField from "../../form/InfoField";
import { Appointment } from "../../../types/appointment";
import { format } from "date-fns";
import { appointmentService } from "../../../services/appointmentService";

interface AppointmentModalProps extends Appointment {
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentModal({
  doctorInfo,
  appointmentId,
  symptoms,
  number,
  appointmentStatus,
  slotStart,
  slotEnd,
  createdAt,
  isOpen,
  onClose,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    symptoms,
  });

  const formatHHmm = (timeStr: string) => {
    if (!timeStr) return "N/A";
    const parts = timeStr.split(":");
    if (parts.length < 2) return "N/A";
    return `${parts[0]}:${parts[1]}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] min-w-[300px] p-6 lg:p-10 mt-40 mb-10"
    >
      <div className="space-y-6 mb-10">
        <h3 className="text-xl font-semibold text-gray-800">
          Lịch khám #{appointmentId}
        </h3>
        <InfoField
          label="Ngày"
          value={format(new Date(createdAt), "dd-MM-yyyy")}
        />
        <InfoField
          label="Bác sĩ"
          value={
            doctorInfo
              ? `${doctorInfo.academicDegree}. ${doctorInfo.fullName}`
              : ""
          }
        />
        <InfoField
          label="Chuyên khoa"
          value={doctorInfo?.specialization || ""}
        />
        <InfoField label="Triệu chứng" value={formData.symptoms} />
        <InfoField
          label="Tình trạng"
          value={
            appointmentStatus === "PENDING"
              ? "Chờ xác nhận"
              : appointmentStatus === "COMPLETED"
              ? "Đã khám"
              : appointmentStatus === "CANCELLED"
              ? "Đã hủy"
              : appointmentStatus === "CONFIRMED"
              ? "Đã xác nhận"
              : "Chưa xác định"
          }
        />
        <InfoField label="Số thứ tự" value={number} />
        <InfoField
          label="Khung giờ"
          value={`${formatHHmm(slotStart)} - ${formatHHmm(slotEnd)}`}
        />
      </div>
    </Modal>
  );
}

interface DeleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  appointmentId: number | string;
}

export function DeleteAppointmentModal({
  isOpen,
  onClose,
  onDelete,
  appointmentId,
}: DeleteAppointmentModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await appointmentService.deleteAppointment(Number(appointmentId));
      onDelete();
      onClose();
    } catch (error) {
      alert("Xóa thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[400px] min-w-[300px] p-6"
    >
      <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
      <p>Bạn có chắc muốn xóa lịch khám #{appointmentId} không?</p>
      <div className="flex gap-2 mt-6">
        <button
          className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Đang xóa..." : "Xóa"}
        </button>
        <button
          className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          onClick={onClose}
        >
          Hủy
        </button>
      </div>
    </Modal>
  );
}
