import axios from "axios";
import { storage } from "../utils/storage";
import { LocalStorageKeys } from "../constants/storageKeys";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import i18n from "../../i18n"

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/";
const API_PREFIX = "/api/v1";

export const api = axios.create({
  baseURL: `${BASE_URL.replace(/\/+$/, "")}${API_PREFIX}`,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// === Request Interceptor ===
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getRaw(LocalStorageKeys.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const language = storage.getRaw(LocalStorageKeys.LANGUAGE) || i18n.language
    if (config.headers) {
      config.headers["Accept-Language"] = language
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// === Response Interceptor ===
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshResponse = await axios.post<{ token: string }>(
            `${BASE_URL.replace(/\/+$/, "")}${API_PREFIX}/auth/token/refresh/`,
            {},
            {
              headers: {
                Authorization: `Bearer ${storage.getRaw(LocalStorageKeys.AUTH_TOKEN)}`,
              },
            }
          );

          const newToken = refreshResponse.data.token;
          storage.setRaw(LocalStorageKeys.AUTH_TOKEN, newToken);
          onRefreshed(newToken);
        } catch (refreshError) {
          [
            LocalStorageKeys.AUTH_TOKEN,
            LocalStorageKeys.AUTH_USER,
            LocalStorageKeys.DOCTOR_INFO,
            LocalStorageKeys.CURRENT_USER_ID,
            LocalStorageKeys.CURRENT_DOCTOR_ID,
            LocalStorageKeys.ADMIN_INFO,
            LocalStorageKeys.RECEPTIONIST_INFO,
          ].forEach((key) => storage.remove(key));

          window.location.href = "/";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);
