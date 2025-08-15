import { api } from "../../../shared/services/api";

// Error response interface for type safety
interface ApiErrorResponse {
  response?: {
    data?: string | { message?: string; [key: string]: unknown };
  };
  message?: string;
}

// Add development auth token if not exists
const setDevelopmentAuth = () => {
  if (!localStorage.getItem("authToken")) {
    // Set a development token or create a test user session
    console.log("Setting development auth token...");
    localStorage.setItem("authToken", "dev-token-for-testing");
  }
};

// Backend User interface to match real API
export interface BackendUser {
  id: number; // Backend returns 'id' not 'userId'
  email: string | null;
  phone: string;
  role: "A" | "P" | "D"; // Backend uses single letters - only 3 roles
  created_at: string; // Backend uses snake_case
}

// Extended User interface for frontend display (we'll map backend roles to extended roles)
export interface User {
  id: string;
  userId: number;
  email: string | null;
  phone: string;
  role: "ADMIN" | "PATIENT" | "DOCTOR";
  createdAt: string;
  // Extended fields for admin table display
  user: {
    image: string;
    name: string;
    email: string;
  };
  department: string;
  status: string;
  lastLogin: string;
}

// Helper function to map backend role to frontend role
const mapBackendRoleToFrontend = (
  backendRole: BackendUser["role"]
): User["role"] => {
  // Map backend single letters to frontend full names
  switch (backendRole) {
    case "A":
      return "ADMIN";
    case "D":
      return "DOCTOR";
    case "P":
      return "PATIENT";
    default:
      return "PATIENT"; // fallback
  }
};

// Helper function to map frontend role to backend role
const mapFrontendRoleToBackend = (
  frontendRole: CreateUserData["role"]
): BackendUser["role"] => {
  switch (frontendRole) {
    case "ADMIN":
      return "A";
    case "DOCTOR":
      return "D";
    case "PATIENT":
      return "P";
    default:
      // Fallback or throw an error if an unmapped role is encountered
      console.warn("Unknown frontend role:", frontendRole);
      return "P"; // Default to PATIENT or handle as an error
  }
};

// Additional interfaces for API data - aligned with backend UserRequest/UserUpdateRequest
export interface CreateUserData {
  phone: string;
  email?: string; // Optional field
  password: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT"; // Only 3 roles supported
}

export interface UpdateUserData {
  phone?: string;
  email?: string | null; // Can be null
  password?: string;
  role?: "ADMIN" | "DOCTOR" | "PATIENT";
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
  color?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
  color?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  category: string;
}

// Permission list data
export const permissionsData: Permission[] = [
  { id: "dashboard_view", name: "Xem dashboard", category: "Dashboard" },
  { id: "patient_view", name: "Xem bệnh nhân", category: "Bệnh nhân" },
  { id: "patient_create", name: "Tạo bệnh nhân", category: "Bệnh nhân" },
  { id: "patient_edit", name: "Sửa bệnh nhân", category: "Bệnh nhân" },
  { id: "doctor_view", name: "Xem bác sĩ", category: "Bác sĩ" },
  { id: "doctor_create", name: "Tạo bác sĩ", category: "Bác sĩ" },
  { id: "appointment_view", name: "Xem lịch hẹn", category: "Lịch hẹn" },
  { id: "appointment_create", name: "Tạo lịch hẹn", category: "Lịch hẹn" },
  { id: "medicine_view", name: "Xem thuốc", category: "Kho thuốc" },
  { id: "medicine_manage", name: "Quản lý thuốc", category: "Kho thuốc" },
  { id: "user_manage", name: "Quản lý người dùng", category: "Hệ thống" },
  { id: "role_manage", name: "Quản lý vai trò", category: "Hệ thống" },
];

// Statistics interfaces
export interface UserStatistics {
  totalUsers: number;
  todayLogins: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  usersByRole: {
    [role: string]: number;
  };
  // Growth metrics
  userGrowthPercent: number; // so với tháng trước
  loginGrowthPercent: number; // so với hôm qua
}

// Mock data for fallback
const mockUsers: User[] = [
  {
    id: "U001",
    userId: 1,
    email: "truong@wecare.vn",
    phone: "0123456789",
    role: "ADMIN",
    createdAt: "2025-01-15T00:00:00.000Z",
    user: {
      image: "/images/user/owner.jpg",
      name: "Trần Nhật Trường",
      email: "truong@wecare.vn",
    },
    department: "Quản trị hệ thống",
    status: "Hoạt động",
    lastLogin: "30/04/2025 14:30",
  },
  {
    id: "U002",
    userId: 2,
    email: "mai@wecare.vn",
    phone: "0123456790",
    role: "DOCTOR",
    createdAt: "2025-01-20T00:00:00.000Z",
    user: {
      image: "/images/user/owner.jpg",
      name: "Nguyễn Thị Mai",
      email: "mai@wecare.vn",
    },
    department: "Khoa Tim mạch",
    status: "Hoạt động",
    lastLogin: "30/04/2025 09:15",
  },
  {
    id: "U003",
    userId: 3,
    email: "hung@wecare.vn",
    phone: "0123456791",
    role: "DOCTOR",
    createdAt: "2025-01-25T00:00:00.000Z",
    user: {
      image: "/images/user/owner.jpg",
      name: "Lê Văn Hùng",
      email: "hung@wecare.vn",
    },
    department: "Khoa Nội",
    status: "Hoạt động",
    lastLogin: "29/04/2025 16:45",
  },
  {
    id: "U004",
    userId: 4,
    email: "lan@wecare.vn",
    phone: "0123456792",
    role: "DOCTOR",
    createdAt: "2025-02-10T00:00:00.000Z",
    user: {
      image: "/images/user/owner.jpg",
      name: "Phạm Thị Lan",
      email: "lan@wecare.vn",
    },
    department: "Tiếp nhận",
    status: "Tạm khóa",
    lastLogin: "28/04/2025 11:20",
  },
  {
    id: "U005",
    userId: 5,
    email: "tuan@wecare.vn",
    phone: "0123456793",
    role: "DOCTOR",
    createdAt: "2025-02-05T00:00:00.000Z",
    user: {
      image: "/images/user/owner.jpg",
      name: "Hoàng Minh Tuấn",
      email: "tuan@wecare.vn",
    },
    department: "Khoa Dược",
    status: "Hoạt động",
    lastLogin: "30/04/2025 13:10",
  },
  {
    id: "U006",
    userId: 6,
    email: "huong@wecare.vn",
    phone: "0123456794",
    role: "ADMIN",
    createdAt: "2025-02-12T00:00:00.000Z",
    user: {
      image: "/images/user/user-22.jpg",
      name: "Đỗ Thị Hương",
      email: "huong@wecare.vn",
    },
    department: "Tài chính",
    status: "Hoạt động",
    lastLogin: "30/04/2025 08:30",
  },
];

// Hàm tạo mockRoles với userCount lấy từ dữ liệu thật (mockUsers)
const getMockRolesWithUserCount = (): Role[] => {
  const nameToRole: Record<string, string> = {
    "Quản trị viên": "ADMIN",
    "Bác sĩ": "DOCTOR",
    "Bệnh nhân": "PATIENT",
  };
  const baseRoles: Omit<Role, "userCount">[] = [
    {
      id: "R001",
      name: "Quản trị viên",
      description:
        "Quyền cao nhất trong hệ thống, có thể thực hiện mọi thao tác",
      permissions: [
        "dashboard_view",
        "patient_view",
        "patient_create",
        "patient_edit",
        "patient_delete",
        "doctor_view",
        "doctor_create",
        "doctor_edit",
        "appointment_view",
        "appointment_create",
        "medicine_view",
        "medicine_manage",
        "finance_view",
        "finance_manage",
        "user_manage",
        "role_manage",
      ],
      color: "error",
      createdAt: "15/01/2025",
      updatedAt: "30/04/2025",
    },
    {
      id: "R002",
      name: "Bác sĩ",
      description: "Quyền truy cập dành cho bác sĩ trong hệ thống",
      permissions: [
        "dashboard_view",
        "patient_view",
        "patient_edit",
        "appointment_view",
        "appointment_create",
        "medicine_view",
      ],
      color: "success",
      createdAt: "15/01/2025",
      updatedAt: "29/04/2025",
    },
    // {
    //   id: "R003",
    //   name: "Lễ tân",
    //   description: "Quyền truy cập dành cho lễ tân tiếp nhận",
    //   permissions: [
    //     "dashboard_view",
    //     "patient_view",
    //     "patient_create",
    //     "appointment_view",
    //     "appointment_create",
    //   ],
    //   color: "warning",
    //   createdAt: "15/01/2025",
    //   updatedAt: "26/04/2025",
    // },
    {
      id: "R004",
      name: "Bệnh nhân",
      description: "Quyền truy cập dành cho bệnh nhân",
      permissions: [
        "dashboard_view",
        "patient_view",
        "medicine_view",
        "medicine_manage",
      ],
      color: "light",
      createdAt: "15/01/2025",
      updatedAt: "25/04/2025",
    },
  ];
  return baseRoles.map((role) => {
    const backendRole = nameToRole[role.name];
    const userCount = mockUsers.filter((u) => u.role === backendRole).length;
    return { ...role, userCount };
  });
};

let mockRoles: Role[] = getMockRolesWithUserCount();

// Helper function to filter users
const filterUsers = (
  users: User[],
  filters: {
    search?: string;
    role?: string;
    department?: string;
    status?: string;
  }
): User[] => {
  return users.filter((user) => {
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableFields = [
        user.user.name,
        user.email,
        user.phone,
        user.department,
      ].filter(Boolean);

      if (
        !searchableFields.some((field) =>
          field?.toLowerCase().includes(searchLower)
        )
      ) {
        return false;
      }
    }

    // Filter by role
    if (filters.role && user.role !== filters.role) {
      return false;
    }

    // Filter by department
    if (filters.department && user.department !== filters.department) {
      return false;
    }

    // Filter by status
    if (filters.status && user.status !== filters.status) {
      return false;
    }

    return true;
  });
};

// User Service - connects to real backend
// Export the mapping functions for use in other parts of the application
export { mapBackendRoleToFrontend, mapFrontendRoleToBackend };

export const userService = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
    status?: string;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    console.log("🔍 [DEBUG] getUsers called with params:", params);

    // Set development auth if needed
    setDevelopmentAuth();

    try {
      // Get all users from backend using the correct endpoint
      const queryParams = new URLSearchParams();
      queryParams.append("page", "0"); // Get first page
      queryParams.append("size", "1000"); // Get a large number of records
      const apiUrl = `/users/all/?${queryParams.toString()}`;
      console.log("🌐 [DEBUG] Calling users API:", apiUrl);

      const response = await api.get(apiUrl);
      console.log("✅ [DEBUG] API Response received:", response.data);

      // Transform and filter users
      const transformedUsers = await Promise.all(
        (response.data.content || []).map(async (backendUser: BackendUser) => {
          // Debug: Log the raw backend user data
          console.log("🔍 [DEBUG] Raw backend user data:", backendUser);
          console.log("🔍 [DEBUG] backendUser keys:", Object.keys(backendUser));
          console.log(
            "🔍 [DEBUG] backendUser.id:",
            backendUser.id,
            "Type:",
            typeof backendUser.id
          );
          console.log(
            "🔍 [DEBUG] backendUser has id property:",
            "id" in backendUser
          );
          console.log(
            "🔍 [DEBUG] backendUser.id === undefined:",
            backendUser.id === undefined
          );
          console.log(
            "🔍 [DEBUG] backendUser.id === null:",
            backendUser.id === null
          );

          // Map backend role to frontend role format
          const role = mapBackendRoleToFrontend(backendUser.role);

          // Create display name from email if no other name fields
          let displayName =
            backendUser.email?.split("@")[0] || `User${backendUser.id}`;
          let userEmail = backendUser.email || "";
          let userAvatar =
            "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/19/465/avatar-trang-1.jpg";
          let department =
            role === "ADMIN"
              ? "Quản trị hệ thống"
              : role === "DOCTOR"
              ? "Chưa phân khoa"
              : role === "PATIENT"
              ? "Bệnh nhân"
              : "Chưa phân công";

          // Note: Removed calls to /doctors/users/ and /patients/users/ endpoints
          // as they don't exist in the backend
          // TODO: Implement these endpoints in backend if detailed user info is needed

          const transformedUser = {
            id: backendUser.id?.toString() || "unknown",
            userId: backendUser.id || 0,
            email: backendUser.email,
            phone: backendUser.phone || "N/A",
            role: role,
            createdAt: backendUser.created_at,
            user: {
              image: userAvatar,
              name: displayName,
              email: userEmail,
            },
            department: department,
            status: "Hoạt động", // Default status
            lastLogin: "Chưa có dữ liệu",
          };

          // Debug: Log the transformed user
          console.log("🔍 [DEBUG] Transformed user:", transformedUser);
          console.log("🔍 [DEBUG] Final user ID:", transformedUser.id);

          return transformedUser;
        })
      );

      console.log("✅ [DEBUG] Users transformed:", transformedUsers);

      // Apply client-side filtering
      const filteredUsers = filterUsers(await Promise.all(transformedUsers), {
        search: params?.search,
        role: params?.role,
        department: params?.department,
        status: params?.status,
      }); // Calculate pagination for filtered results
      const pageSize = params?.limit || 30; // Use requested page size or default to 10
      const currentPage = params?.page || 1;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      // Get total before pagination
      const totalFilteredUsers = filteredUsers.length;

      // Apply pagination to filtered results
      const paginatedUsers = filteredUsers.slice(
        startIndex,
        Math.min(endIndex, totalFilteredUsers)
      );

      return {
        users: paginatedUsers,
        total: response.data.totalElements || totalFilteredUsers,
        page: response.data.page || currentPage,
        totalPages:
          response.data.totalPages || Math.ceil(totalFilteredUsers / pageSize),
      };
    } catch (error) {
      console.error("Failed to load users from backend API:", error);
      throw new Error("Cannot load users from backend: " + error);
    }
  },
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/users/get_user_by_id/${id}/`);
      const backendUser: BackendUser = response.data;

      const role = mapBackendRoleToFrontend(backendUser.role);
      let displayName = backendUser.email?.split("@")[0] || "Unknown User";
      let userEmail = backendUser.email || "";
      let userAvatar =
        "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/19/465/avatar-trang-1.jpg";
      let department =
        role === "ADMIN"
          ? "Quản trị hệ thống"
          : role === "DOCTOR"
          ? "Chưa phân khoa"
          : role === "PATIENT"
          ? "Bệnh nhân"
          : "Chưa phân công";

      // Note: Removed calls to /doctors/users/ and /patients/users/ endpoints
      // as they don't exist in the backend
      // TODO: Implement these endpoints in backend if detailed user info is needed

      return {
        id: backendUser.id?.toString() || id,
        userId: backendUser.id || 0,
        email: backendUser.email,
        phone: backendUser.phone || "N/A",
        role: role,
        createdAt: backendUser.created_at,
        user: {
          image: userAvatar,
          name: displayName,
          email: userEmail,
        },
        department: department,
        status: "Hoạt động",
        lastLogin: "Chưa có dữ liệu",
      };
    } catch (error) {
      console.error("Failed to get user by ID from backend:", error);
      throw new Error("User not found in backend: " + error);
    }
  },
  createUser: async (userData: CreateUserData): Promise<User> => {
    console.log("🔧 [DEBUG] Creating user with data:", userData);
    setDevelopmentAuth();
    try {
      // Map frontend role to backend role format
      const backendUserData = {
        phone: userData.phone,
        email: userData.email || null,
        password: userData.password,
        role: mapFrontendRoleToBackend(userData.role),
      };

      console.log("🌐 [DEBUG] Sending to backend:", backendUserData);
      const response = await api.post("/users/add/", backendUserData);
      console.log("✅ [DEBUG] User created successfully:", response.data);

      const backendUser: BackendUser = response.data;
      const role = mapBackendRoleToFrontend(backendUser.role);
      const displayName =
        backendUser.email?.split("@")[0] || `User${backendUser.id}`;

      return {
        id: backendUser.id?.toString() || "unknown",
        userId: backendUser.id || 0,
        email: backendUser.email,
        phone: backendUser.phone || "N/A",
        role: role,
        createdAt: backendUser.created_at,
        user: {
          image:
            "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/19/465/avatar-trang-1.jpg",
          name: displayName,
          email: backendUser.email || `user${backendUser.id}@wecare.vn`,
        },
        department:
          role === "ADMIN"
            ? "Quản trị hệ thống"
            : role === "DOCTOR"
            ? "Chưa phân khoa"
            : "Chưa phân công",
        status: "Hoạt động",
        lastLogin: "Chưa đăng nhập",
      };
    } catch (error: unknown) {
      console.error("❌ [DEBUG] Failed to create user in backend:", error);

      // Extract meaningful error message
      let errorMessage = "Cannot create user in backend";
      const errorResponse = error as ApiErrorResponse;

      if (errorResponse.response?.data) {
        if (typeof errorResponse.response.data === "string") {
          errorMessage = errorResponse.response.data;
        } else if (errorResponse.response.data.message) {
          errorMessage = errorResponse.response.data.message;
        } else {
          errorMessage = JSON.stringify(errorResponse.response.data);
        }
      } else if (errorResponse.message) {
        errorMessage = errorResponse.message;
      }

      throw new Error(errorMessage);
    }
  },
  updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
    console.log("🔧 [DEBUG] Updating user with ID:", id, "data:", userData);
    setDevelopmentAuth();
    try {
      // Map frontend role to backend role format if role is provided
      const backendUserData: {
        phone?: string;
        email?: string | null;
        password?: string;
        role?: BackendUser["role"];
      } = {
        phone: userData.phone,
        email: userData.email,
        password: userData.password,
      };

      if (userData.role) {
        backendUserData.role = mapFrontendRoleToBackend(userData.role);
      }

      console.log("🌐 [DEBUG] Sending update to backend:", backendUserData);
      const response = await api.put(
        `/users/${id}/edit_user/`,
        backendUserData
      );
      console.log("✅ [DEBUG] User updated successfully:", response.data);

      const backendUser: BackendUser = response.data;
      const role = mapBackendRoleToFrontend(backendUser.role);
      const displayName = backendUser.email?.split("@")[0] || "Unknown User";

      // Get additional data from doctor/patient services if applicable
      let userAvatar =
        "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/19/465/avatar-trang-1.jpg";
      let department =
        role === "ADMIN"
          ? "Quản trị hệ thống"
          : role === "DOCTOR"
          ? "Chưa phân khoa"
          : "Chưa phân công";

      try {
        if (role === "DOCTOR") {
          const doctorResponse = await api.get(
            `/doctors/users/${backendUser.id}`
          );
          if (doctorResponse.data) {
            const doctorData = doctorResponse.data;
            userAvatar = doctorData.avatar || userAvatar;
            department = doctorData.specialization || "Chưa phân khoa";
          }
        } else if (role === "PATIENT") {
          const patientResponse = await api.get(
            `/patients/users/${backendUser.id}`
          );
          if (patientResponse.data) {
            const patientData = patientResponse.data;
            userAvatar = patientData.avatar || userAvatar;
            department = "Bệnh nhân";
          }
        }
      } catch (serviceError) {
        console.warn(
          `⚠️ [DEBUG] Failed to fetch service data for updated user:`,
          serviceError
        );
      }

      return {
        id: backendUser.id?.toString() || id,
        userId: backendUser.id || 0,
        email: backendUser.email,
        phone: backendUser.phone || "N/A",
        role: role,
        createdAt: backendUser.created_at,
        user: {
          image: userAvatar,
          name: displayName,
          email: backendUser.email || "",
        },
        department: department,
        status: "Hoạt động", // Default status
        lastLogin: "Chưa có dữ liệu",
      };
    } catch (error: unknown) {
      console.error("❌ [DEBUG] Failed to update user in backend:", error);

      // Extract meaningful error message
      let errorMessage = "Cannot update user in backend";
      const errorResponse = error as ApiErrorResponse;

      if (errorResponse.response?.data) {
        if (typeof errorResponse.response.data === "string") {
          errorMessage = errorResponse.response.data;
        } else if (errorResponse.response.data.message) {
          errorMessage = errorResponse.response.data.message;
        } else {
          errorMessage = JSON.stringify(errorResponse.response.data);
        }
      } else if (errorResponse.message) {
        errorMessage = errorResponse.message;
      }

      throw new Error(errorMessage);
    }
  },

  updateUserByEmail: async (
    email: string,
    userData: UpdateUserData
  ): Promise<User> => {
    setDevelopmentAuth();
    try {
      console.log("🔍 [DEBUG] Getting user ID for email:", email);

      // First, get user ID from email
      const userResponse = await api.get(
        `/users/get_user_by_email/?email=${encodeURIComponent(email)}`
      );
      const userId = userResponse.data.id;

      console.log("✅ [DEBUG] Found user ID:", userId, "for email:", email);

      // Then update user by ID
      return await userService.updateUser(userId.toString(), userData);
    } catch (error: unknown) {
      console.error("❌ [DEBUG] Failed to update user by email:", error);
      let errorMessage = "Cannot update user in backend";
      const errorResponse = error as ApiErrorResponse;
      if (errorResponse.response?.data) {
        if (typeof errorResponse.response.data === "string") {
          errorMessage = errorResponse.response.data;
        } else if (errorResponse.response.data.message) {
          errorMessage = errorResponse.response.data.message;
        } else {
          errorMessage = JSON.stringify(errorResponse.response.data);
        }
      } else if (errorResponse.message) {
        errorMessage = errorResponse.message;
      }
      throw new Error(errorMessage);
    }
  },
  deleteUser: async (id: string): Promise<void> => {
    setDevelopmentAuth(); // Set development auth if needed
    try {
      console.log("🗑️ [DEBUG] Attempting to delete user with ID:", id);
      const response = await api.delete(`/users/${id}/delete_user/`);
      console.log("✅ [DEBUG] User deleted successfully:", response.data);
    } catch (error: unknown) {
      console.error("❌ [DEBUG] Failed to delete user in backend:", error);
      let errorMessage = "Cannot delete user in backend";
      const errorResponse = error as ApiErrorResponse;
      if (errorResponse.response?.data) {
        if (typeof errorResponse.response.data === "string") {
          errorMessage = errorResponse.response.data;
        } else if (errorResponse.response.data.message) {
          errorMessage = errorResponse.response.data.message;
        } else {
          errorMessage = JSON.stringify(errorResponse.response.data);
        }
      } else if (errorResponse.message) {
        errorMessage = errorResponse.message;
      }
      throw new Error(errorMessage);
    }
  },

  deleteUserByEmail: async (email: string): Promise<void> => {
    setDevelopmentAuth();
    try {
      console.log("🔍 [DEBUG] Getting user ID for email:", email);

      // First, get user ID from email
      const userResponse = await api.get(
        `/users/get_user_by_email/?email=${encodeURIComponent(email)}`
      );
      const userId = userResponse.data.id;

      console.log("✅ [DEBUG] Found user ID:", userId, "for email:", email);

      // Then delete user by ID
      const deleteResponse = await api.delete(`/users/${userId}/delete_user/`);
      console.log("✅ [DEBUG] User deleted successfully:", deleteResponse.data);
    } catch (error: unknown) {
      console.error("❌ [DEBUG] Failed to delete user by email:", error);
      let errorMessage = "Cannot delete user in backend";
      const errorResponse = error as ApiErrorResponse;
      if (errorResponse.response?.data) {
        if (typeof errorResponse.response.data === "string") {
          errorMessage = errorResponse.response.data;
        } else if (errorResponse.response.data.message) {
          errorMessage = errorResponse.response.data.message;
        } else {
          errorMessage = JSON.stringify(errorResponse.response.data);
        }
      } else if (errorResponse.message) {
        errorMessage = errorResponse.message;
      }
      throw new Error(errorMessage);
    }
  },

  forceDeleteUser: async (id: string): Promise<void> => {
    setDevelopmentAuth(); // Set development auth if needed
    try {
      console.log("💥 [DEBUG] Attempting to force delete user with ID:", id);
      const response = await api.delete(`/users/${id}/force-delete/`);
      console.log("✅ [DEBUG] User force deleted successfully:", response.data);
    } catch (error: unknown) {
      console.error(
        "❌ [DEBUG] Failed to force delete user in backend:",
        error
      );
      let errorMessage = "Cannot force delete user in backend";
      const errorResponse = error as ApiErrorResponse;
      if (errorResponse.response?.data) {
        if (typeof errorResponse.response.data === "string") {
          errorMessage = errorResponse.response.data;
        } else if (errorResponse.response.data.message) {
          errorMessage = errorResponse.response.data.message;
        } else {
          errorMessage = JSON.stringify(errorResponse.response.data);
        }
      } else if (errorResponse.message) {
        errorMessage = errorResponse.message;
      }
      throw new Error(errorMessage);
    }
  },
};

// Role Service
export const roleService = {
  getRoles: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    roles: Role[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const response = await api.get("/roles", { params });
      return response.data;
    } catch (error) {
      console.warn("Using mock data for roles:", error);
      let filteredRoles = [...mockRoles];

      if (params?.search) {
        filteredRoles = filteredRoles.filter(
          (role) =>
            role.name.toLowerCase().includes(params.search!.toLowerCase()) ||
            role.description
              .toLowerCase()
              .includes(params.search!.toLowerCase())
        );
      }

      const page = params?.page || 1;
      const limit = params?.limit || 30;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      return {
        roles: filteredRoles.slice(startIndex, endIndex),
        total: filteredRoles.length,
        page,
        totalPages: Math.ceil(filteredRoles.length / limit),
      };
    }
  },

  getRoleById: async (id: string): Promise<Role> => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.warn("Using mock data for role:", error);
      const role = mockRoles.find((r) => r.id === id);
      if (!role) throw new Error("Role not found");
      return role;
    }
  },

  createRole: async (roleData: CreateRoleData): Promise<Role> => {
    try {
      const response = await api.post("/roles", roleData);
      return response.data;
    } catch (error) {
      console.warn("Creating mock role:", error);
      const newRole: Role = {
        id: `R${Date.now()}`,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        userCount: 0,
        color: "info",
        createdAt: new Date().toLocaleDateString("vi-VN"),
        updatedAt: new Date().toLocaleDateString("vi-VN"),
      };
      mockRoles.push(newRole);
      return newRole;
    }
  },

  updateRole: async (id: string, roleData: UpdateRoleData): Promise<Role> => {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.warn("Updating mock role:", error);
      const roleIndex = mockRoles.findIndex((r) => r.id === id);
      if (roleIndex === -1) throw new Error("Role not found");

      mockRoles[roleIndex] = {
        ...mockRoles[roleIndex],
        ...roleData,
        updatedAt: new Date().toLocaleDateString("vi-VN"),
      };
      return mockRoles[roleIndex];
    }
  },

  deleteRole: async (id: string): Promise<void> => {
    try {
      await api.delete(`/roles/${id}`);
    } catch (error) {
      console.warn("Deleting mock role:", error);
      const roleIndex = mockRoles.findIndex((r) => r.id === id);
      if (roleIndex === -1) throw new Error("Role not found");
      mockRoles.splice(roleIndex, 1);
    }
  },
};

// Permission Service
export const permissionService = {
  getPermissions: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<{
    permissions: Permission[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const response = await api.get("/permissions", { params });
      return response.data;
    } catch (error) {
      console.warn("Using mock data for permissions:", error);
      // Create mock permissions with correct structure
      const mockPermissions: Permission[] = [
        { id: "1", name: "User Management", category: "Admin" },
        { id: "2", name: "Role Management", category: "Admin" },
        { id: "3", name: "Patient View", category: "Doctor" },
        { id: "4", name: "Appointment Management", category: "Doctor" },
      ];

      let filteredPermissions = [...mockPermissions];

      if (params?.search) {
        filteredPermissions = filteredPermissions.filter(
          (perm) =>
            perm.name.toLowerCase().includes(params.search!.toLowerCase()) ||
            perm.category.toLowerCase().includes(params.search!.toLowerCase())
        );
      }

      if (params?.category) {
        filteredPermissions = filteredPermissions.filter(
          (perm) => perm.category === params.category
        );
      }

      const page = params?.page || 1;
      const limit = params?.limit || 30;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return {
        permissions: filteredPermissions.slice(startIndex, endIndex),
        total: filteredPermissions.length,
        page,
        totalPages: Math.ceil(filteredPermissions.length / limit),
      };
    }
  },
};

// Statistics Service
export const statisticsService = {
  getUserStatistics: async (): Promise<UserStatistics> => {
    try {
      // Try to get statistics from backend API
      console.log("🔍 [STATS] Trying to get statistics from backend API...");
      const response = await api.get("/users/statistics");
      console.log("✅ [STATS] Backend statistics API response:", response.data);
      return response.data;
    } catch (error) {
      console.warn(
        "⚠️ [STATS] Backend statistics API not available, calculating from user data:",
        error
      );
      try {
        // Get real user data from userService
        console.log("🔍 [STATS] Getting user data from userService...");
        const allUsersResponse = await userService.getUsers({ limit: 1000 }); // Get all users
        console.log("✅ [STATS] UserService response:", allUsersResponse);

        const users = allUsersResponse.users;
        console.log("👥 [STATS] Users array length:", users.length);
        console.log("👥 [STATS] Users array:", users);

        // Calculate statistics from real user data
        const totalUsers = users.length;
        const activeUsers = users.filter(
          (user: User) => user.status === "Hoạt động"
        ).length;
        const inactiveUsers = totalUsers - activeUsers;

        // Calculate today logins (realistic estimate: 30-70% of active users)
        const todayLogins = Math.floor(
          activeUsers * (0.3 + Math.random() * 0.4)
        );

        // Count users by role from real data
        const usersByRole: { [role: string]: number } = {};
        users.forEach((user: User) => {
          usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
        });

        // Get total roles count
        const totalRoles = Object.keys(usersByRole).length;

        const stats = {
          totalUsers,
          todayLogins,
          activeUsers,
          inactiveUsers,
          totalRoles,
          usersByRole,
          userGrowthPercent: Math.floor(Math.random() * 20) + 5, // Random growth percentage for demo
          loginGrowthPercent: Math.floor(Math.random() * 10) + 1, // Random growth percentage for demo
        };

        console.log("📊 [STATS] Calculated statistics:", stats);
        return stats;
      } catch (userError) {
        console.error(
          "❌ [STATS] Failed to get user data for statistics:",
          userError
        );

        // Fallback: Try direct API call without complex transformation
        try {
          console.log("🔄 [STATS] Trying direct API call as fallback...");
          setDevelopmentAuth();

          const queryParams = new URLSearchParams();
          queryParams.append("page", "0");
          queryParams.append("size", "1000");
          const apiUrl = `/users/all/?${queryParams.toString()}`;

          const directResponse = await api.get(apiUrl);
          console.log("✅ [STATS] Direct API response:", directResponse.data);

          const backendUsers = directResponse.data.content || [];
          console.log("👥 [STATS] Backend users count:", backendUsers.length);

          // Simple statistics calculation
          const totalUsers = backendUsers.length;
          const usersByRole: { [role: string]: number } = {};
          backendUsers.forEach((user: any) => {
            const role = user.role || "UNKNOWN";
            usersByRole[role] = (usersByRole[role] || 0) + 1;
          });

          const stats = {
            totalUsers,
            todayLogins: Math.floor(totalUsers * 0.5), // Estimate 50% of users logged in today
            activeUsers: totalUsers,
            inactiveUsers: 0,
            totalRoles: Object.keys(usersByRole).length,
            usersByRole,
            userGrowthPercent: 15, // Demo value
            loginGrowthPercent: 8, // Demo value
          };

          console.log("📊 [STATS] Fallback statistics calculated:", stats);
          return stats;
        } catch (fallbackError) {
          console.error("❌ [STATS] Fallback also failed:", fallbackError);

          // Final fallback: return mock data
          const mockStats = {
            totalUsers: 25, // Mock value
            todayLogins: 18,
            activeUsers: 25,
            inactiveUsers: 0,
            totalRoles: 3,
            usersByRole: { ADMIN: 5, DOCTOR: 8, PATIENT: 10 },
            userGrowthPercent: 15,
            loginGrowthPercent: 8,
          };

          console.log("📊 [STATS] Using mock statistics:", mockStats);
          return mockStats;
        }
      }
    }
  },
};
