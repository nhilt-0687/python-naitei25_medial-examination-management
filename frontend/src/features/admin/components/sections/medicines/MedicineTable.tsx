"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { medicineService } from "../../../services/pharmacyService";
import type { Medicine } from "../../../types/pharmacy";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";
import Pagination from "../../../components/common/Pagination";
import SearchInput from "../../../components/common/SearchInput";
import { DeleteConfirmationModal } from "../../../components/ui/modal/DeleteConfirmationModal";

const PAGE_SIZE = 10;

export default function MedicineTable() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  // Load medicines from API
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineService.getAllMedicines();
      setMedicines(data);
    } catch (error) {
      console.error("Error loading medicines:", error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // Search medicines
  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await medicineService.searchMedicine(
        searchTerm || undefined,
        selectedCategory || undefined
      );
      setMedicines(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view medicine details
  const handleView = (medicineId: number) => {
    navigate(`/admin/medicines/${medicineId}`);
  };

  // Handle edit medicine
  const handleEdit = (medicineId: number) => {
    navigate(`/admin/medicines/edit/${medicineId}`);
  };

  // Handle delete medicine
  const handleDelete = (medicineId: number) => {
    setMedicineToDelete(medicineId);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (medicineToDelete === null) return;

    try {
      await medicineService.deleteMedicine(medicineToDelete);
      setMedicines((prev) =>
        prev.filter((medicine) => medicine.medicineId !== medicineToDelete)
      );
    } catch (error) {
      console.error("Error deleting medicine:", error);
    } finally {
      setModalOpen(false);
      setMedicineToDelete(null);
    }
  };

  // Get status based on quantity
  const getStatus = (quantity: number): "Có sẵn" | "Hết" => {
    return quantity > 0 ? "Có sẵn" : "Hết";
  };

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Pagination
  const totalItems = medicines.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const paginatedData = medicines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start items-center pt-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Danh sách thuốc
          </h2>
          <span className="ml-5 text-sm bg-base-600/20 text-base-600 py-1 px-4 rounded-full font-bold">
            {totalItems} loại thuốc
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            inputRef={inputRef}
            placeholder="Tìm kiếm tên thuốc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <select
            className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            <option value="Thuốc kháng sinh">Thuốc kháng sinh</option>
            <option value="Thuốc giảm đau">Thuốc giảm đau</option>
            <option value="Vitamin">Vitamin</option>
            <option value="Thuốc ho">Thuốc ho</option>
          </select>

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

      {/* Loading spinner */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-base-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Đang tải danh sách thuốc...
          </p>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 pr-6 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Mã thuốc
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Tên thuốc
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 pr-6 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Đơn giá
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Danh mục
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 pr-6 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Tình trạng
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 pr-6 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Tồn kho
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 pr-6 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Đơn vị
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
              {paginatedData.map((medicine) => (
                <TableRow key={medicine.medicineId}>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    T{medicine.medicineId.toString().padStart(4, "0")}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                        {medicine.avatar ? (
                          <img
                            src={medicine.avatar}
                            alt={medicine.medicineName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-6 w-6 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {medicine.medicineName}
                          {medicine.insuranceDiscountPercent > 0 && (
                            <span className="bg-purple-500/30 ml-2 text-xs px-2 rounded-3xl font-bold text-purple-500">
                              BHYT
                            </span>
                          )}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {medicine.manufactor}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatPrice(medicine.price)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {medicine.category}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        getStatus(medicine.quantity) === "Có sẵn"
                          ? "success"
                          : "error"
                      }
                    >
                      {getStatus(medicine.quantity)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {medicine.quantity}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {medicine.unit}
                  </TableCell>
                  <TableCell className="py-3 text-theme-md">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(medicine.medicineId)}
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
                        onClick={() => handleEdit(medicine.medicineId)}
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
                        onClick={() => handleDelete(medicine.medicineId)}
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
      )}

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa thuốc này? Thao tác này sẽ không thể hoàn tác."
      />
    </div>
  );
}
