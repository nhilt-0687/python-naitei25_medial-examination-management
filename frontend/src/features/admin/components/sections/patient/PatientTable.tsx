"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import SearchInput from "../../common/SearchInput";
import Badge from "../../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { DeleteConfirmationModal } from "../../ui/modal/DeleteConfirmationModal";
import { patientService } from "../../../services/patientService";
import type { Patient } from "../../../types/patient";
import { format } from "date-fns";
import { X } from "lucide-react";
import type { PatientUpdateDto } from "../../../types/patient";

export default function PatientTable() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editData, setEditData] = useState<Partial<Patient>>({});
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error("API error:", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleView = (patientId: number) => {
    navigate(`/admin/patients/${patientId}`);
  };

  const handleDelete = (patientId: number) => {
    setPatientToDelete(patientId);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete === null) return;
    try {
      await patientService.deletePatient(patientToDelete);
      setPatients((prev) =>
        prev.filter((patient) => patient.patientId !== patientToDelete)
      );
    } catch (err) {
      console.error("Error deleting patient:", err);
    } finally {
      setModalOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!searchTerm.trim()) {
        await fetchPatients();
      } else {
        const params: {
          identityNumber?: string;
          insuranceNumber?: string;
          fullName?: string;
        } = {};
        if (/^\d{9,12}$/.test(searchTerm.trim())) {
          params.identityNumber = searchTerm.trim();
        } else if (/^[A-Za-z0-9]{8,20}$/.test(searchTerm.trim())) {
          params.insuranceNumber = searchTerm.trim();
        } else {
          params.fullName = searchTerm.trim();
        }
        const result = await patientService.searchPatient(params);
        setPatients(result ? [result] : []);
      }
    } catch (err) {
      setPatients([]);
      console.error("Error during search:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (patient: Patient) => {
    setEditPatient(patient);
    setEditData({
      patientId: patient.patientId,
      fullName: patient.fullName,
      identityNumber: patient.identityNumber,
      insuranceNumber: patient.insuranceNumber,
      birthday: patient.birthday,
      phone: patient.phone,
      email: patient.email,
      gender: patient.gender,
      address: patient.address,
      allergies: patient.allergies,
      height: patient.height,
      weight: patient.weight,
      bloodType: patient.bloodType,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPatient || !editData.patientId) return;
    setEditLoading(true);
    try {
      const updatePayload: Partial<PatientUpdateDto> = {
        fullName: editData.fullName,
        identityNumber: editData.identityNumber,
        insuranceNumber: editData.insuranceNumber,
        birthday: editData.birthday,
        phone: editData.phone,
        email: editData.email,
        gender: editData.gender,
        address: editData.address,
        allergies: editData.allergies,
        height: editData.height,
        weight: editData.weight,
        bloodType: editData.bloodType,
      };

      await patientService.updatePatient(editData.patientId, updatePayload);
      setShowEditModal(false);
      await fetchPatients();
    } catch (err) {
      console.error("Error updating patient:", err);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] px-3">
      <div className="flex justify-start items-center px-5 pt-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Danh sách bệnh nhân
        </h2>
        <span className="ml-5 text-sm bg-base-600/20 text-base-600 py-1 px-4 rounded-full font-bold">
          {patients.length} bệnh nhân
        </span>
      </div>
      {loading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-base-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Đang tải danh sách bệnh nhân...
          </p>
        </div>
      )}
      {!loading && (
        <>
          <div className="flex items-center p-4 gap-2">
            <div className="flex-1">
              <SearchInput
                inputRef={inputRef}
                placeholder="Tìm kiếm theo CCCD, BHYT hoặc Họ tên"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
            <button
              className="h-11 w-20 rounded-lg bg-base-700 text-white text-sm font-medium shadow-theme-xs hover:bg-base-600 focus:outline-hidden focus:ring-3 focus:ring-base-600/50"
              onClick={handleSearch}
            >
              Lọc
            </button>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-slate-500 text-start text-theme-sm dark:text-slate-400"
                  >
                    Họ tên
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-slate-500 text-start text-theme-sm dark:text-slate-400"
                  >
                    Căn cước công dân
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-slate-500 text-start text-theme-sm dark:text-slate-400"
                  >
                    Bảo hiểm y tế
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-slate-500 text-start text-theme-sm dark:text-slate-400"
                  >
                    Giới tính
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-slate-500 text-start text-theme-sm dark:text-slate-400"
                  >
                    Ngày sinh
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-slate-500 text-start text-theme-sm dark:text-slate-400"
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {patients.map((patient) => (
                  <TableRow key={patient.patientId}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {patient.fullName}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {patient.identityNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {patient.insuranceNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          patient.gender === "MALE"
                            ? "success"
                            : patient.gender === "FEMALE"
                            ? "warning"
                            : "error"
                        }
                      >
                        {patient.gender === "MALE"
                          ? "Nam"
                          : patient.gender === "FEMALE"
                          ? "Nữ"
                          : "Khác"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {format(new Date(patient.birthday), "dd-MM-yyyy")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-md dark:text-gray-400">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(patient.patientId)}
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
                          onClick={() => handleEditClick(patient)}
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
                          onClick={() => handleDelete(patient.patientId)}
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
          </div>
          {/* Modal sửa bệnh nhân */}
          {showEditModal && editPatient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg text-center relative">
                <div className="flex flex-row justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-base-600">
                    Sửa thông tin bệnh nhân
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 text-gray-400 hover:bg-slate-500/20 bg-slate-500/10 rounded-full"
                    aria-label="Đóng"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form
                  onSubmit={handleEditSubmit}
                  className="space-y-4 text-left"
                >
                  <div>
                    <label className="block font-medium mb-1">Họ tên</label>
                    <input
                      type="text"
                      value={editData.fullName || ""}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, fullName: e.target.value }))
                      }
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">CCCD</label>
                    <input
                      type="text"
                      value={editData.identityNumber || ""}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          identityNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">BHYT</label>
                    <input
                      type="text"
                      value={editData.insuranceNumber || ""}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          insuranceNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={
                        editData.birthday
                          ? new Date(editData.birthday)
                              .toISOString()
                              .slice(0, 10)
                          : ""
                      }
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, birthday: e.target.value }))
                      }
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-4 py-2 rounded-lg bg-base-600 text-white hover:bg-base-700 disabled:opacity-60"
                    >
                      {editLoading ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <DeleteConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Xác nhận xóa"
            message="Bạn có chắc chắn muốn xóa bệnh nhân này? Thao tác này sẽ không thể hoàn tác."
          />
        </>
      )}
    </div>
  );
}
