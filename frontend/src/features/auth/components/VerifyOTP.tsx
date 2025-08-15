"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import authService from "../../../shared/services/authService"
import { message } from "antd"
import LanguageSwitcher from "../../../shared/components/common/LanguageSwitcher"
import { ValidationUtils } from "../../../shared/utils/validation"

const VerifyOTP: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location
  const [otp, setOtp] = useState("")
  const [errors, setErrors] = useState<{ otp?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!state?.email) {
      message.error(t("messages.missingEmailInfo"))
      navigate("/forgot-password")
    }
  }, [state, navigate, t])

  const validateForm = () => {
    const newErrors: { otp?: string } = {}

    // Validate OTP using ValidationUtils
    const otpResult = ValidationUtils.validateOTP(otp)
    if (!otpResult.isValid) {
      newErrors.otp = otpResult.errorMessage
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        email: state?.email || "",
        otp: otp.trim(),
      }
      console.log("Verifying OTP with payload:", payload)
      const response = await authService.verifyOtp(payload)
      console.log("OTP verification response:", response)
      message.success(t("messages.otpVerified"))
      navigate("/reset-password", { state: { email: state.email, resetToken: response.resetToken } })
    } catch (error: any) {
      console.error("OTP verification error:", error.response?.data || error.message)
      message.error(
        error.message?.includes("không đúng")
          ? t("messages.otpInvalid")
          : error.message?.includes("hết hạn")
            ? t("messages.otpExpired")
            : error.message || t("messages.errorMessage"),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    try {
      await authService.forgotPassword({ email: state?.email })
      message.success(t("messages.otpSent"))
    } catch (error: any) {
      console.error("Resend OTP error:", error.response?.data || error.message)
      message.error(error.message || t("messages.errorMessage"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10 relative font-outfit bg-gray-50">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-r animate-gradient opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-brand-200), var(--color-base-300), var(--color-brand-200))",
        }}
      ></div>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 20s ease infinite;
          }
          .input-focus {
            transition: all 0.3s ease;
          }
          .input-focus:focus {
            transform: scale(1.02);
            box-shadow: var(--shadow-focus-ring);
            border-color: var(--color-brand-400);
          }
          .button-hover {
            transition: all 0.3s ease;
          }
          .button-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: var(--shadow-theme-sm);
            background-color: var(--color-warning-600);
          }
          .fade-in {
            animation: fadeIn 0.5s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div className="w-full max-w-md bg-gray-50 p-8 rounded-lg shadow-theme-lg relative z-[var(--z-index-9)] fade-in">
        <h2 className="text-title-md font-bold text-center text-gray-900 mb-6">{t("auth.verifyOtpTitle")}</h2>
        <div className="text-center text-gray-600 text-theme-sm mb-8">
          <p>
            {t("messages.enterOtpSentTo")} {state?.email}.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-theme-sm font-medium text-gray-700">
              {t("forms.otp")} <span className="text-error-500">*</span>
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value)
                setErrors((prev) => ({ ...prev, otp: "" }))
              }}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
              placeholder={t("placeholders.enterOtp")}
            />
            {errors.otp && <p className="text-error-500 text-theme-xs mt-1">{errors.otp}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-warning-500 text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-warning-600"
            }`}
          >
            {isLoading ? t("messages.processing") : t("messages.verifyOtp")}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button type="button" onClick={handleResendOtp} className="text-brand-500 font-medium hover:underline">
            {t("forms.resendOtp")}
          </button>
        </div>
        <div className="mt-4 text-center">
          <NavLink to="/forgot-password" className="text-brand-500 font-medium hover:underline">
            {t("common.goBack")} OTP
          </NavLink>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP
