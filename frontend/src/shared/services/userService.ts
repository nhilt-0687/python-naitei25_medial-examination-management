import type {
  User,
  UserRequest,
  UserUpdateRequest,
  ChangePasswordRequest,
  PagedResponse,
} from "../types/user";
import { api } from "./api";
import { handleApiError } from "../utils/errorHandler";

export const userService = {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>("/users/me");
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async getUserById(userId: number): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async getAllUsers(page = 0, size = 10): Promise<PagedResponse<User>> {
    try {
      const response = await api.get<PagedResponse<User>>(
        `/users?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async addUser(userData: UserRequest): Promise<User> {
    try {
      const response = await api.post<User>("/users", userData);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async updateUser(userId: number, data: UserUpdateRequest): Promise<User> {
    try {
      const response = await api.put<User>(`/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async partialUpdateUser(
    userId: number,
    data: Partial<UserUpdateRequest>
  ): Promise<User> {
    try {
      // Sử dụng PATCH để partial update - chỉ gửi những trường thay đổi
      const response = await api.patch<User>(`/users/${userId}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async deleteUser(userId: number): Promise<string> {
    try {
      const response = await api.delete<string>(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async changePassword(
    userId: number,
    data: ChangePasswordRequest
  ): Promise<string> {
    try {
      const response = await api.put<string>(
        `/users/change-password/${userId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error, false));
    }
  },

  async isCurrentUser(userId: number): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      return currentUser.userId === userId;
    } catch {
      return false;
    }
  },
};
