import axios, { AxiosError } from "axios"
import type { DoctorInfo, ExaminationRoom } from "../types/doctor"

// API base URL from environment variable, with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

// Configure axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        } else {
            console.warn("No auth token found in localStorage")
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

export const doctorService = {
    async getDoctor(doctorId: number): Promise<DoctorInfo> {
        try {
            const response = await api.get(`/doctors/${doctorId}`)
            return response.data
        } catch (error) {
            console.error(`Failed to fetch doctor with ID ${doctorId}:`, error)        
            throw new Error("Không thể  fetch doctor id")
        }
    },

    async getDoctorByUserId(userId: number): Promise<DoctorInfo> {
        try {
            const response = await api.get(`/doctors/user/${userId}`)
            return response.data as DoctorInfo
        } catch (error) {
            const axiosError = error as AxiosError
            console.error(`Failed to fetch doctor for user ID ${userId}:`, {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            })
            throw new Error(`Unable to fetch doctor details for user ID ${userId}: ${axiosError.message}`)
        }
    },

    async updateDoctor(doctorId: number, doctorData: Partial<DoctorInfo>): Promise<DoctorInfo> {
        try {
            const response = await api.put(`/doctors/${doctorId}`, doctorData)
            return response.data as DoctorInfo
        } catch (error) {
            const axiosError = error as AxiosError
            console.error(`Failed to update doctor with ID ${doctorId}:`, {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            })
            throw new Error(`Unable to update doctor details for ID ${doctorId}: ${axiosError.message}`)
        }
    },

    async uploadAvatar(doctorId: number, file: File): Promise<DoctorInfo> {
        try {
            const formData = new FormData()
            formData.append("file", file)
            const response = await api.post(`/doctors/${doctorId}/avatar`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            return response.data as DoctorInfo
        } catch (error) {
            const axiosError = error as AxiosError
            console.error(`Failed to upload avatar for doctor ID ${doctorId}:`, {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            })
            throw new Error(`Unable to upload avatar for doctor ID ${doctorId}: ${axiosError.message}`)
        }
    },

    async deleteAvatar(doctorId: number): Promise<DoctorInfo> {
        try {
            const response = await api.delete(`/doctors/${doctorId}/avatar`)
            return response.data as DoctorInfo
        } catch (error) {
            const axiosError = error as AxiosError
            console.error(`Failed to delete avatar for doctor ID ${doctorId}:`, {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            })
            throw new Error(`Unable to delete avatar for doctor ID ${doctorId}: ${axiosError.message}`)
        }
    },
}
