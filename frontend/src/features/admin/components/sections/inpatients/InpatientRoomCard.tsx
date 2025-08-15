import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "../../ui/modal";
import { DeleteConfirmationModal } from "../../ui/modal/DeleteConfirmationModal";
import { format } from "date-fns";
import type { PatientRoom } from "../../../types/patient";
import { patientService } from "../../../services/patientService";

interface InpatientRoomCardProps {
  room: PatientRoom;
  onDeleted?: () => void;
}

const InpatientRoomCard: React.FC<InpatientRoomCardProps> = ({
  room,
  onDeleted,
}) => {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Partial<PatientRoom>>({
    roomName: room.roomName,
    maxCapacity: room.maxCapacity,
    note: room.note,
  });
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await patientService.deletePatientRoom(room.roomId);
      setModalOpen(false);
      setSuccessModal("Xóa phòng thành công!");
      if (onDeleted) onDeleted();
    } catch (error: any) {
      if (
        error?.response?.data?.message?.includes(
          "violates foreign key constraint"
        ) ||
        error?.response?.data
          ?.toString()
          ?.includes("violates foreign key constraint")
      ) {
        setErrorModal(
          "Không thể xóa phòng vì còn dữ liệu liên quan (ví dụ: chi tiết phòng, bệnh nhân...). Hãy xóa hoặc chuyển hết dữ liệu liên quan trước."
        );
      } else {
        setErrorModal("Xóa phòng thất bại!");
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientService.updatePatientRoom(room.roomId, editData);
      setShowEditModal(false);
      setSuccessModal("Cập nhật phòng thành công!");
      if (onDeleted) onDeleted();
    } catch (error) {
      setErrorModal("Cập nhật phòng thất bại!");
    }
  };

  if (!room) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-red-500">
        Không có thông tin phòng.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-shadow hover:shadow-md">
      <div className="p-6">
        {/* Header with room name and note */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Phòng {room.roomName}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-base-500/10 text-base-800">
                {room.note}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Mã phòng: P{room.roomId.toString().padStart(4, "0")}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Sức chứa tối đa: {room.maxCapacity}
            </span>
          </div>
        </div>

        <div className="flex items-start mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 mr-2 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-600">
            Tạo lúc: {format(new Date(room?.createdAt), "dd-MM-yyyy")}
          </span>
        </div>

        {/* Footer buttons */}
        <div className="mt-5 flex justify-end">
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-sky-700 bg-sky-100 rounded-md hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              Xem
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Sửa
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Modal xem chi tiết phòng */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        className="max-w-md p-6"
      >
        <h2 className="text-2xl text-base-600 font-semibold mb-4">
          Chi tiết phòng bệnh
        </h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Tên phòng: </span>
            {room.roomName}
          </div>
          <div>
            <span className="font-medium">Mã phòng: </span>P
            {room.roomId.toString().padStart(4, "0")}
          </div>
          <div>
            <span className="font-medium">Sức chứa tối đa: </span>
            {room.maxCapacity}
          </div>
          <div>
            <span className="font-medium">Ghi chú: </span>
            {room.note}
          </div>
          <div>
            <span className="font-medium">Ngày tạo: </span>
            {format(new Date(room.createdAt), "dd-MM-yyyy")}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </Modal>

      {/* Modal xác nhận xóa */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa phòng"
        message={`Bạn có chắc chắn muốn xóa phòng ${room.roomName} không? Thao tác này sẽ không thể hoàn tác.`}
      />

      {/* Modal chỉnh sửa phòng */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        className="max-w-md p-6"
      >
        <h2 className="text-2xl text-base-600 font-semibold mb-4">
          Chỉnh sửa phòng bệnh
        </h2>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Tên phòng</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={editData.roomName || ""}
              onChange={(e) =>
                setEditData({ ...editData, roomName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Sức chứa tối đa</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={editData.maxCapacity || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  maxCapacity: Number(e.target.value),
                })
              }
              required
              min={1}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Ghi chú</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={editData.note || ""}
              onChange={(e) =>
                setEditData({ ...editData, note: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-base-600 text-white rounded hover:bg-base-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal thông báo lỗi */}
      <Modal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        className="max-w-sm p-6"
      >
        <h2 className="text-lg font-semibold mb-4 text-red-600">Lỗi</h2>
        <p>{errorModal}</p>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setErrorModal(null)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </Modal>

      {/* Modal thông báo thành công */}
      <Modal
        isOpen={!!successModal}
        onClose={() => setSuccessModal(null)}
        className="max-w-sm p-6"
      >
        <h2 className="text-lg font-semibold mb-4 text-green-600">
          Thành công
        </h2>
        <p>{successModal}</p>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setSuccessModal(null)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default InpatientRoomCard;
