import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import Badge from "../../components/ui/badge/Badge";
import Pagination from "../../components/common/Pagination";
import SearchInput from "../../components/common/SearchInput";
import { Settings, Trash, Edit, UserPlus, RefreshCw } from "lucide-react";
import {
  userService,
  User,
  CreateUserData,
  UpdateUserData,
} from "../../services/authorizationService";

const PAGE_SIZE = 10;

// Debug constant
console.log("PAGE_SIZE constant:", PAGE_SIZE);

export default function UserRoleTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // API state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    phone: "",
    email: "",
    password: "",
    role: "DOCTOR",
  });

  const [updateFormData, setUpdateFormData] = useState<UpdateUserData>({
    phone: "",
    email: "",
    role: "DOCTOR",
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debug effect để theo dõi state changes
  useEffect(() => {
    console.log(
      "State changed - currentPage:",
      currentPage,
      "totalPages:",
      totalPages,
      "totalItems:",
      totalItems
    );
  }, [currentPage, totalPages, totalItems]);

  // Load users data
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Chỉ gửi đúng tên trường filter mà backend cần (role, department)
      const params: {
        page: number;
        limit: number;
        search?: string;
        role?: string;
        department?: string;
        status?: string;
      } = {
        page: currentPage,
        limit: PAGE_SIZE,
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (roleFilter) params.role = roleFilter;
      if (departmentFilter) params.department = departmentFilter;
      if (statusFilter) params.status = statusFilter;

      // Ghi log để kiểm tra filter truyền đi FE
      console.log("Filter params:", params);
      console.log("Loading users for page:", currentPage);
      console.log("PAGE_SIZE constant in loadUsers:", PAGE_SIZE);

      const response = await userService.getUsers(params);

      setUsers(response.users);
      setTotalItems(response.total);
      // Tính toán totalPages một cách chính xác
      const calculatedTotalPages = Math.ceil(response.total / PAGE_SIZE);
      setTotalPages(calculatedTotalPages);

      // Log để debug
      console.log("API Response:", response);
      console.log("Total items:", response.total);
      console.log("PAGE_SIZE:", PAGE_SIZE);
      console.log("Calculated total pages:", calculatedTotalPages);
      console.log("Current page:", currentPage);
      console.log(
        "Should show next page button:",
        currentPage < calculatedTotalPages
      );
      console.log(
        "Math.ceil calculation:",
        `${response.total} / ${PAGE_SIZE} = ${
          response.total / PAGE_SIZE
        } = ${calculatedTotalPages}`
      );
    } catch (err) {
      setError("Không thể tải dữ liệu người dùng");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    roleFilter,
    departmentFilter,
    statusFilter,
  ]);

  // Load statistics data
  // Note: Statistics are handled in Authorization.tsx parent component

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Thêm useEffect riêng để theo dõi thay đổi trang
  useEffect(() => {
    console.log("Current page changed to:", currentPage);
    // Không cần gọi loadUsers() ở đây vì đã có trong loadUsers dependency
  }, [currentPage]);

  // Debug effect để theo dõi loadUsers function
  useEffect(() => {
    console.log("loadUsers function changed, dependencies:", {
      currentPage,
      debouncedSearchTerm,
      roleFilter,
      departmentFilter,
      statusFilter,
    });
  }, [loadUsers]);
  const handleCreateUser = async () => {
    setShowCreateModal(true);
    // Reset form when opening
    setCreateFormData({
      phone: "",
      email: "",
      password: "",
      role: "DOCTOR",
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
    // Pre-fill form with current user data
    setUpdateFormData({
      phone: user.phone,
      email: user.email,
      role: user.role,
    });
  };

  const handleSubmitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading) return;

    try {
      setFormLoading(true);

      // Validate required fields
      if (!createFormData.phone.trim()) {
        alert("Số điện thoại là bắt buộc!");
        return;
      }
      if (!createFormData.password.trim()) {
        alert("Mật khẩu là bắt buộc!");
        return;
      }

      console.log("Creating user with data:", createFormData);
      await userService.createUser(createFormData);

      // Success
      alert("Tạo người dùng thành công!");
      setShowCreateModal(false);
      await loadUsers(); // Reload data

      // Reset form
      setCreateFormData({
        phone: "",
        email: "",
        password: "",
        role: "DOCTOR",
      });
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tạo người dùng";
      alert("Lỗi: " + errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || !selectedUser) return;

    try {
      setFormLoading(true);

      console.log("Updating user with data:", updateFormData);

      // Use email instead of ID for updating
      if (!selectedUser.email) {
        throw new Error("Email không hợp lệ để cập nhật người dùng");
      }

      await userService.updateUserByEmail(selectedUser.email, updateFormData);

      // Success
      alert("Cập nhật người dùng thành công!");
      setShowEditModal(false);
      await loadUsers(); // Reload data
    } catch (error: unknown) {
      console.error("Error updating user:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật người dùng";
      alert("Lỗi: " + errorMessage);
    } finally {
      setFormLoading(false);
    }
  };
  const handleDeleteUser = async (user: User) => {
    // Validate that user has a valid email
    if (!user.email) {
      alert("Không thể xóa người dùng: Email không hợp lệ!");
      console.error("Invalid user email for deletion:", user);
      return;
    }

    if (
      confirm(
        `Bạn có chắc chắn muốn xóa người dùng ${user.user.name} (${user.email})?`
      )
    ) {
      try {
        console.log("Deleting user by email:", user.email);
        await userService.deleteUserByEmail(user.email);
        await loadUsers(); // Reload data
        alert("Xóa người dùng thành công!");
      } catch (error) {
        alert("Không thể xóa người dùng. Vui lòng thử lại!");
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    loadUsers();
    // Note: Statistics refresh is handled in Authorization.tsx parent component
  };

  // Format date utility
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  // Role mapping từ English sang Vietnamese
  const getRoleDisplayName = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "Admin";
      case "DOCTOR":
        return "Bác sĩ";
      case "PATIENT":
        return "Bệnh nhân";
      default:
        return role || "Chưa xác định";
    }
  };

  const getRoleColor = (role: string) => {
    const normalizedRole = role?.toUpperCase();
    switch (normalizedRole) {
      case "ADMIN":
        return "error";
      case "DOCTOR":
        return "base";
      case "PATIENT":
        return "pending";
      default:
        return "light";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoạt động":
        return "success";
      case "Tạm khóa":
        return "error";
      case "Chờ xác thực":
        return "warning";
      default:
        return "light";
    }
  };

  // Handlers to reset page and update filters
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); // Reset page when filter changes
  };
  const handleDepartmentFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1); // Reset page when filter changes
  };
  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setDepartmentFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        {" "}
        <div className="flex justify-start items-center pt-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Danh sách người dùng
          </h2>
          <span className="ml-5 text-sm bg-base-600/20 text-base-600 py-1 px-4 rounded-full font-bold">
            {totalItems} người dùng
          </span>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors text-sm font-medium"
          >
            <UserPlus size={16} />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Search Bar */}
          <SearchInput
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {/* Dropdown for Role Filter */}
          <div className="relative">
            <select
              title="Lọc theo vai trò"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm font-medium text-gray-800 shadow-theme-xs appearance-none focus:border-base-300 focus:outline-none focus:ring-3 focus:ring-base-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">Admin</option>
              <option value="DOCTOR">Bác sĩ</option>
              <option value="PATIENT">Bệnh nhân</option>
            </select>
          </div>

          {/* Dropdown for Department Filter */}
          <div className="relative">
            <select
              title="Lọc theo khoa"
              value={departmentFilter}
              onChange={handleDepartmentFilterChange}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm font-medium text-gray-800 shadow-theme-xs appearance-none focus:border-base-300 focus:outline-none focus:ring-3 focus:ring-base-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Tất cả khoa</option>
              <option value="Quản trị hệ thống">Quản trị hệ thống</option>
              <option value="Tim mạch">Tim mạch</option>
              <option value="Nội khoa">Nội khoa</option>
              <option value="Ngoại khoa">Ngoại khoa</option>
              <option value="Sản khoa">Sản khoa</option>
              <option value="Nhi khoa">Nhi khoa</option>
              <option value="Cơ xương khớp">Cơ xương khớp</option>
              <option value="Tiêu hóa">Tiêu hóa</option>
              <option value="Thần kinh">Thần kinh</option>
              <option value="Da liễu">Da liễu</option>
              <option value="Mắt">Mắt</option>
              <option value="Tai mũi họng">Tai mũi họng</option>
              <option value="Phụ khoa">Phụ khoa</option>
              <option value="Khoa Dược">Khoa Dược</option>
              <option value="Tiếp nhận">Tiếp nhận</option>
              <option value="Tài chính">Tài chính</option>
              <option value="Bệnh nhân">Bệnh nhân</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <button
            onClick={handleResetFilters}
            type="button"
            className="h-11 w-full rounded-lg bg-base-700 text-white text-sm font-medium shadow-theme-xs hover:bg-base-600 focus:outline-hidden focus:ring-3 focus:ring-base-600/50 flex items-center justify-center gap-2"
          >
            <Settings size={16} />
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Người dùng
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Vai trò
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Khoa/Phòng ban
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Trạng thái
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Đăng nhập cuối
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
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
          </TableHeader>{" "}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {" "}
            {loading ? (
              <TableRow>
                <TableCell className="py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-base-600"></div>
                    <span className="text-gray-500">Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell className="py-8 text-center">
                  <div className="text-red-500">
                    <p>{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-2 text-sm underline hover:no-underline"
                    >
                      Thử lại
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center">
                  <span className="text-gray-500">
                    Không có dữ liệu người dùng
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  {" "}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[40px] w-[40px] flex-shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <img
                          src={user.user.image}
                          className="h-full w-full object-cover"
                          alt={user.user.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/19/465/avatar-trang-1.jpg";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.user.name}
                        </p>
                        <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {user.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getRoleColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.department}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>{" "}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.lastLogin || "Chưa có dữ liệu"}
                  </TableCell>{" "}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.createdAt
                      ? formatDateTime(user.createdAt)
                      : "Chưa có dữ liệu"}
                  </TableCell>
                  <TableCell className="py-3">
                    {" "}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors dark:bg-slate-900/30 dark:text-slate-400 dark:hover:bg-slate-900/50"
                        title="Chỉnh sửa người dùng"
                      >
                        <Edit size={14} />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        title="Xóa người dùng"
                      >
                        <Trash size={14} />
                        Xóa
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            onPageChange={(page) => {
              console.log("Page change requested to:", page);
              setCurrentPage(page);
            }}
          />
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Thêm người dùng mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Đóng"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>{" "}
            <form className="space-y-4" onSubmit={handleSubmitCreateUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={createFormData.phone}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                    placeholder="Nhập email..."
                  />
                </div>
              </div>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    title="Chọn vai trò"
                    required
                    value={createFormData.role}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        role: e.target.value as CreateUserData["role"],
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 dark:bg-gray-800 outline-0 dark:border-gray-600 dark:text-white"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="DOCTOR">Bác sĩ</option>
                    <option value="PATIENT">Bệnh nhân</option>
                  </select>
                </div>{" "}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={createFormData.password}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                    placeholder="Nhập mật khẩu..."
                  />
                </div>{" "}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  className="rounded border-gray-300 text-base-600 focus:ring-base-500"
                />
                <label
                  htmlFor="sendEmail"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Gửi email thông báo đến người dùng
                </label>
              </div>{" "}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {formLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {formLoading ? "Đang tạo..." : "Tạo người dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Chỉnh sửa người dùng: {selectedUser.user.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Đóng"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmitUpdateUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={updateFormData.phone}
                    onChange={(e) =>
                      setUpdateFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={updateFormData.email || ""}
                    onChange={(e) =>
                      setUpdateFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                    placeholder="Nhập email..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  title="Chọn vai trò"
                  required
                  value={updateFormData.role}
                  onChange={(e) =>
                    setUpdateFormData((prev) => ({
                      ...prev,
                      role: e.target.value as UpdateUserData["role"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 dark:bg-gray-800 outline-0 dark:border-gray-600 dark:text-white"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="DOCTOR">Bác sĩ</option>
                  <option value="PATIENT">Bệnh nhân</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {formLoading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {formLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
