import React, { useState } from "react";
import type { ExaminationRoom, ExaminationRoomDto } from "../../../types/doctor";
import { doctorService } from "../../../services/doctorService";
import { DeleteConfirmationModal } from "../../ui/modal/DeleteConfirmationModal";

const ClinicCard: React.FC<{
  clinic: ExaminationRoom;
  onUpdated?: () => void;
}> = ({ clinic, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [roomDetail, setRoomDetail] = useState<ExaminationRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState<Partial<ExaminationRoomDto>>({
    departmentId: clinic.departmentId,
    type: clinic.type,
    note: clinic.note,
    building: clinic.building,
    floor: clinic.floor,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleView = async () => {
    setLoading(true);
    try {
      const data = await doctorService.getExaminationRoomById(clinic.roomId);
      setRoomDetail(data);
      setOpen(true);
    } catch (error) {
      setRoomDetail(null);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await doctorService.updateExaminationRoom(clinic.roomId, editData);
      setShowEditModal(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      // Xử lý lỗi nếu cần
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await doctorService.deleteExaminationRoom(clinic.roomId);
      setModalOpen(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      // Xử lý lỗi nếu cần
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-shadow hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h5 className="text-base font-semibold text-gray-800">
            {clinic.note || `Phòng ${clinic.roomId}`}
          </h5>
        </div>

        {/* Thông tin cơ bản */}
        <div className="space-y-2 mb-4">
          <div className="flex ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4 text-gray-500 mr-2 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm text-gray-600">
              Tòa {clinic.building}, Tầng {clinic.floor}
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-sm text-gray-600">
              Loại phòng:{" "}
              {clinic.type === "EXAMINATION"
                ? "Khám bệnh"
                : clinic.type === "TEST"
                ? "Xét nghiệm"
                : clinic.type === "OTHER"
                ? "Khác"
                : clinic.type}
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-sm text-gray-600">
              Mã khoa: {clinic.departmentId}
            </span>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-5 flex justify-end">
          <div className="flex gap-2">
            <button
              onClick={handleView}
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
      {/* Modal xem chi tiết phòng khám */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg text-center relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
              aria-label="Đóng"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-base-600">
              Thông tin phòng khám
            </h2>
            {loading ? (
              <div className="py-8 text-gray-500">Đang tải...</div>
            ) : roomDetail ? (
              <div className="text-left space-y-2">
                <div>
                  <span className="font-medium">Tên phòng:</span>{" "}
                  {roomDetail.note || `Phòng ${roomDetail.roomId}`}
                </div>
                <div>
                  <span className="font-medium">Tòa nhà:</span>{" "}
                  {roomDetail.building}
                </div>
                <div>
                  <span className="font-medium">Tầng:</span> {roomDetail.floor}
                </div>
                <div>
                  <span className="font-medium">Loại phòng:</span>{" "}
                  {roomDetail.type === "EXAMINATION"
                    ? "Khám bệnh"
                    : roomDetail.type === "TEST"
                    ? "Xét nghiệm"
                    : roomDetail.type === "OTHER"
                    ? "Khác"
                    : roomDetail.type}
                </div>
                <div>
                  <span className="font-medium">Mã khoa:</span>{" "}
                  {roomDetail.departmentId}
                </div>
                <div>
                  <span className="font-medium">Mã phòng:</span> P
                  {String(roomDetail.roomId).padStart(4, "0")}
                </div>
              </div>
            ) : (
              <div className="text-red-600 py-8">
                Không tìm thấy thông tin phòng!
              </div>
            )}
            <button
              onClick={() => setOpen(false)}
              className="mt-6 px-4 py-2 bg-base-600 text-white rounded hover:bg-base-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Modal sửa phòng khám */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg text-center relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
              aria-label="Đóng"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-base-600">
              Sửa phòng khám
            </h2>
            <form onSubmit={handleEdit} className="space-y-4 text-left">
              <div>
                <label className="block font-medium mb-1">Tên phòng</label>
                <input
                  type="text"
                  name="note"
                  value={editData.note || ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, note: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nhập tên phòng"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Tòa nhà</label>
                <input
                  type="text"
                  name="building"
                  value={editData.building || ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, building: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nhập tòa nhà"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Tầng</label>
                <input
                  type="number"
                  name="floor"
                  value={editData.floor ?? ""}
                  onChange={(e) =>
                    setEditData((d) => ({
                      ...d,
                      floor: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nhập tầng"
                  min={1}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Loại phòng</label>
                <select
                  name="type"
                  value={editData.type}
                  onChange={(e) =>
                    setEditData((d) => ({
                      ...d,
                      type: e.target.value as ExaminationRoomDto["type"],
                    }))
                  }
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="EXAMINATION">Khám bệnh</option>
                  <option value="TEST">Xét nghiệm</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Mã khoa</label>
                <input
                  type="number"
                  name="departmentId"
                  value={editData.departmentId ?? ""}
                  onChange={(e) =>
                    setEditData((d) => ({
                      ...d,
                      departmentId: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nhập mã khoa"
                  min={1}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded bg-base-600 text-white hover:bg-base-700 disabled:opacity-60"
                >
                  {editLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa phòng khám này? Thao tác này sẽ không thể hoàn tác."
      />
    </div>
  );
};

export default ClinicCard;
