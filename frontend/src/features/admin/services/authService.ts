import axios from "axios";
import { api } from "../../../shared/services/api";
import type { AuthUser } from "../types/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_BASE_URL}/users/auth/login`,
    data
  );
  return response.data;
};

export const authService = {
  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<AuthUser>("/users/me");
    return response.data;
  },
};
