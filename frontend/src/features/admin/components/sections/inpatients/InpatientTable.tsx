"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { RoomDetail } from "../../../types/patient";
import { patientService } from "../../../services/patientService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { format } from "date-fns";
import Pagination from "../../../components/common/Pagination";
import SearchInput from "../../../components/common/SearchInput";
import { DeleteConfirmationModal } from "../../../components/ui/modal/DeleteConfirmationModal";

const PAGE_SIZE = 10;

export default function InpatientTable() {
  const [inpatients, setInpatients] = useState<RoomDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [inpatientToDelete, setInpatientToDelete] = useState<number | null>(
    null
  );
  const [viewPatient, setViewPatient] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadInpatients();
  }, []);

  const loadInpatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAllRoomDetails();
      setInpatients(data);
    } catch (error) {
      console.error("Error loading inpatients:", error);
      setInpatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm theo detailId
  const handleSearch = async () => {
    if (!searchTerm) {
      loadInpatients();
      return;
    }
    try {
      setLoading(true);
      const id = Number(searchTerm);
      if (isNaN(id)) {
        setInpatients([]);
      } else {
        const detail = await patientService.getRoomDetailById(id);
        setInpatients(detail ? [detail] : []);
      }
      setCurrentPage(1);
    } catch (error) {
      setInpatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Thay thế handleView để dùng modal thay vì alert
  const handleView = async (inpatientId: number, patientId: number) => {
    try {
      const patient = await patientService.getPatientById(patientId);
      const inpatientDetail = inpatients.find(
        (i) => i.detailId === inpatientId
      );
      setViewPatient({ ...patient, inpatientDetail });
      setShowViewModal(true);
    } catch (error) {
      setViewPatient({
        error: "Không thể lấy thông tin bệnh nhân!",
      });
      setShowViewModal(true);
    }
  };

  const handleEdit = async (
    detailId: number,
    updatedData: Partial<RoomDetail>
  ) => {
    try {
      const updated = await patientService.updateRoomDetail(
        detailId,
        updatedData
      );
      setInpatients((prev) =>
        prev.map((inpatient) =>
          inpatient.detailId === detailId
            ? { ...inpatient, ...updated }
            : inpatient
        )
      );
    } catch (error) {
      console.error("Error updating inpatient:", error);
    }
  };

  const handleDelete = (inpatientId: number) => {
    setInpatientToDelete(inpatientId);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (inpatientToDelete === null) return;
    try {
      await patientService.deleteRoomDetail(inpatientToDelete);
      setInpatients((prev) =>
        prev.filter((inpatient) => inpatient.detailId !== inpatientToDelete)
      );
    } catch (error) {
      console.error("Error deleting inpatient:", error);
    } finally {
      setModalOpen(false);
      setInpatientToDelete(null);
    }
  };

  // Format admission date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  // Pagination
  const totalItems = inpatients.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const paginatedData = inpatients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-base-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Đang tải danh sách bệnh nhân nội trú...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start items-center pt-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Danh sách nội trú
          </h2>
          <span className="ml-5 text-sm bg-base-600/20 text-base-600 py-1 px-4 rounded-full font-bold">
            {totalItems} bệnh nhân
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm mã nội trú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Tìm kiếm
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 pr-9 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Mã nội trú
              </TableCell>
              <TableCell
                isHeader
                className="py-3 pr-9 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Mã phòng
              </TableCell>
              <TableCell
                isHeader
                className="py-3 pr-7 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Mã bệnh nhân
              </TableCell>
              <TableCell
                isHeader
                className="py-3 pr-13 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Ngày tạo
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedData.map((inpatient) => (
              <TableRow key={inpatient.detailId}>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  MT{inpatient.detailId.toString().padStart(4, "0")}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  P{inpatient.roomId.toString().padStart(4, "0")}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  BN{inpatient.patientId.toString().padStart(4, "0")}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {format(new Date(inpatient.createdAt), "dd-MM-yyyy")}
                </TableCell>

                <TableCell className="py-3 text-theme-md">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleView(inpatient.detailId, inpatient.patientId)
                      }
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
                      onClick={() =>
                        navigate(
                          `/admin/inpatients-rooms/edit/${inpatient.detailId}`
                        )
                      }
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
                      onClick={() => handleDelete(inpatient.detailId)}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa bệnh nhân nội trú này? Thao tác này sẽ không thể hoàn tác."
      />

      {/* Modal hiển thị thông tin bệnh nhân */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4 text-base-600">
              Thông tin bệnh nhân
            </h2>
            {viewPatient?.error ? (
              <div className="text-red-600">{viewPatient.error}</div>
            ) : viewPatient ? (
              <div className="text-left space-y-2">
                <div className="my-1">
                  <span className="font-medium mr-1">Họ tên:</span>{" "}
                  {viewPatient.fullName}
                </div>
                <div className="my-1">
                  <span className="font-medium mr-1">Email:</span>{" "}
                  {viewPatient.email}
                </div>
                <div className="my-1">
                  <span className="font-medium mr-1">SĐT:</span>{" "}
                  {viewPatient.phone}
                </div>
                <div className="my-1">
                  <span className="font-medium mr-1">Ngày sinh:</span>{" "}
                  {viewPatient.birthday
                    ? format(new Date(viewPatient.birthday), "dd-MM-yyyy")
                    : ""}
                </div>
                {/* Thông tin phòng nội trú */}
                {viewPatient.inpatientDetail && (
                  <>
                    <div className="my-1">
                      <span className="font-medium mr-1">Mã nội trú:</span> MT
                      {String(viewPatient.inpatientDetail.detailId).padStart(
                        4,
                        "0"
                      )}
                    </div>
                    <div className="my-1">
                      <span className="font-medium mr-1">Mã phòng:</span> P
                      {String(viewPatient.inpatientDetail.roomId).padStart(
                        4,
                        "0"
                      )}
                    </div>
                    <div className="my-1">
                      <span className="font-medium mr-1">Ngày tạo:</span>{" "}
                      {viewPatient.inpatientDetail.createdAt
                        ? format(
                            new Date(viewPatient.inpatientDetail.createdAt),
                            "dd-MM-yyyy"
                          )
                        : ""}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div>Đang tải...</div>
            )}
            <button
              onClick={() => setShowViewModal(false)}
              className="mt-6 px-4 py-2 bg-base-600 text-white rounded hover:bg-base-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
