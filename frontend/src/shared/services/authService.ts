import type { LoginCredentials, LoginResponse, AuthUser, DoctorInfo, AdminInfo, ReceptionistInfo } from "../types/auths"
import { api } from "./api"
import { doctorService } from "./doctorService"
import { storage } from "../utils/storage"
import { LocalStorageKeys } from "../constants/storageKeys"
import { handleApiError } from "../utils/errorHandler"
import i18n from "../../i18n"

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const loginResponse = await api.post<{ token: string; refresh?: string }>("/auth/login/", credentials)
      const { token, refresh } = loginResponse.data

      storage.setRaw(LocalStorageKeys.AUTH_TOKEN, token)
      if (refresh) {
        storage.setRaw(LocalStorageKeys.REFRESH_TOKEN, refresh)
      }

      const userResponse = await api.get<AuthUser>("/users/me/")
      const user = userResponse.data
      const userId = user.userId ?? user.id
      if (!userId) {
        throw new Error(i18n.t("errors.userIdMissing"))
      }

      storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
      storage.setRaw(LocalStorageKeys.AUTH_ROLE, user.role)
      storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())

      let doctorInfo: DoctorInfo | undefined
      if (user.role === "D") {
        try {
          const doctor = await doctorService.getDoctorByUserId(userId)
          if (doctor && doctor.id) {
            doctorInfo = doctor
            storage.set(LocalStorageKeys.DOCTOR_INFO, doctor)
            storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctor.id.toString())
          } else {
            console.warn("No doctor found or doctor ID missing for user:", userId)
          }
        } catch (error) {
          console.error("Failed to fetch doctor info:", error)
        }
      } else if (user.role === "A") {
        const adminInfo: AdminInfo = { ...user, role: "A", userId }
        storage.set(LocalStorageKeys.ADMIN_INFO, adminInfo)
      } else if (user.role === "RECEPTIONIST") {
        const receptionistInfo: ReceptionistInfo = { ...user, role: "RECEPTIONIST", userId }
        storage.set(LocalStorageKeys.RECEPTIONIST_INFO, receptionistInfo)
      }

      return { token, user: { ...user, userId }, doctorInfo }
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  async register(payload: {
    email?: string
    phone?: string
    password: string
    fullName: string
    dateOfBirth: string
    gender: "M" | "F" | "O"
    cccd: string
    healthInsurance?: string
    address: string
    role: "P"
  }): Promise<{ message: string; email?: string; phone?: string }> {
    try {
      console.log("Starting registration process with payload:", payload)

      if (!payload.email && !payload.phone) {
        throw new Error(i18n.t("errors.emailOrPhoneRequired"))
      }
      if (!payload.password) {
        throw new Error(i18n.t("errors.passwordRequired"))
      }
      if (!payload.fullName) {
        throw new Error(i18n.t("errors.fullNameRequired"))
      }
      if (!payload.cccd) {
        throw new Error(i18n.t("errors.cccdRequired"))
      }

      const registerPayload = {
        email: payload.email || "",
        phone: payload.phone || "",
        password: payload.password,
        fullName: payload.fullName,
        identityNumber: payload.cccd,
        insuranceNumber: payload.healthInsurance || "",
        birthday: payload.dateOfBirth,
        gender: payload.gender,
        address: payload.address,
      }

      console.log("Sending register request with payload:", registerPayload)
      const response = await api.post<{ message: string }>("/auth/register/", registerPayload)
      console.log("Register response:", response.data)

      return {
        message: response.data.message,
        email: payload.email,
        phone: payload.phone,
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      throw new Error(handleApiError(error, false) || i18n.t("errors.registrationFailed"))
    }
  },

  async verifyRegistration(payload: { email: string; otp: string }): Promise<{ id: number; role: string }> {
    try {
      console.log("Verifying registration with payload:", payload)
      const response = await api.post<{ id: number; role: string }>("/auth/register/verify/", payload)
      console.log("Registration verified successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Registration verification error:", error)
      throw new Error(handleApiError(error, false) || i18n.t("errors.otpVerificationFailed"))
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/users/auth/logout/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      storage.clear()
    }
  },

  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await api.get<AuthUser>("/users/me/")
      const user = response.data
      const userId = user.userId ?? user.id
      if (!userId) {
        throw new Error(i18n.t("errors.userIdMissing"))
      }
      return { ...user, userId }
    } catch (error: any) {
      throw new Error(handleApiError(error, false))
    }
  },

  async getCurrentUserWithDoctorInfo(): Promise<{ user: AuthUser; doctorInfo?: DoctorInfo }> {
    const user = await this.getCurrentUser()
    let doctorInfo: DoctorInfo | undefined
    if (user.role === "D") {
      try {
        const doctor = await doctorService.getDoctorByUserId(user.userId)
        if (doctor) {
          doctorInfo = doctor
        }
      } catch (error) {
        console.error("Failed to fetch doctor info:", error)
      }
    }
    return { user, doctorInfo }
  },

  async refreshToken(): Promise<string> {
    try {
      const refreshToken = storage.getRaw(LocalStorageKeys.REFRESH_TOKEN)
      const response = await api.post<{ token: string }>("/users/auth/refresh/", { refresh: refreshToken })
      if (response.data.token) {
        storage.setRaw(LocalStorageKeys.AUTH_TOKEN, response.data.token)
      }
      return response.data.token
    } catch (error: any) {
      throw new Error(handleApiError(error, false) || i18n.t("errors.refreshTokenFailed"))
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await api.post<{ valid: boolean }>("/users/auth/verify/", { token })
      return response.data.valid
    } catch {
      return false
    }
  },

  async verifyOtp(payload: { email?: string; phone?: string; otp: string }): Promise<{ resetToken: string }> {
    try {
      console.log("Verifying OTP with payload:", payload)
      const response = await api.post("/auth/verify-otp/", payload)
      console.log("OTP verified successfully:", response.data)
      return { resetToken: response.data.resetToken }
    } catch (error: any) {
      console.error("OTP verification error:", error.response?.data || error.message)
      throw new Error(handleApiError(error, false) || i18n.t("errors.otpVerificationFailed"))
    }
  },

  async resendOtp(payload: { email?: string; phone?: string }): Promise<void> {
    try {
      console.log("Resending OTP with payload:", payload)
      await api.post("/auth/register/resend-otp/", payload)
      console.log("OTP resent successfully")
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      throw new Error(handleApiError(error, false) || i18n.t("errors.resendOtpFailed"))
    }
  },

  async forgotPassword(payload: { email?: string; phone?: string }): Promise<void> {
    try {
      console.log("Requesting forgot password with payload:", payload)
      await api.post("/auth/forgot-password/", payload)
      console.log("Forgot password request sent successfully")
    } catch (error: any) {
      console.error("Forgot password error:", error)
      throw new Error(handleApiError(error, false) || i18n.t("errors.forgotPasswordFailed"))
    }
  },

  async resetPassword(payload: {
    email?: string
    phone?: string
    otp: string
    newPassword: string
  }): Promise<void> {
    try {
      console.log("Resetting password with payload:", payload)
      await api.put("/auth/reset-password/", payload)
      console.log("Password reset successfully")
    } catch (error: any) {
      console.error("Reset password error:", error)
      throw new Error(handleApiError(error, false) || i18n.t("errors.resetPasswordFailed"))
    }
  },
}

export default authService
