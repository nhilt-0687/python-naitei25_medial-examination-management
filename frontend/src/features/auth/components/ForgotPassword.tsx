"use client"
import type React from "react"
import { useState } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { authService } from "../../../shared/services/authService"
import { message } from "antd"
import LanguageSwitcher from "../../../shared/components/common/LanguageSwitcher"
import { ValidationUtils } from "../../../shared/utils/validation"

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: { email?: string; phone?: string } = {}

    // Validate email or phone using ValidationUtils
    const emailOrPhoneResult = ValidationUtils.validateEmailOrPhone(email, phone)
    if (!emailOrPhoneResult.isValid) {
      newErrors.email = emailOrPhoneResult.errorMessage
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const payload = { email: email.trim() }
      console.log("Requesting OTP with payload:", payload)
      await authService.forgotPassword(payload)
      message.success(t("messages.otpSent"))
      navigate("/verify-otp", { state: { email } })
    } catch (error: any) {
      console.error("Forgot password error:", error.response?.data || error.message)
      message.error(
        error.message?.includes("không tồn tại")
          ? t("messages.emailNotFound")
          : error.message || t("messages.errorMessage"),
      )
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
      <div className="w-full max-w-6xl flex rounded-lg shadow-theme-lg overflow-hidden relative z-[var(--z-index-9)]">
        <div
          className="w-1/2 hidden md:block bg-cover bg-center"
          style={{
            backgroundImage: "url('/public/images/auth/register.png')",
          }}
        ></div>
        <div className="w-full md:w-1/2 bg-gray-50 p-8 fade-in">
          <div className="flex justify-center mb-6">
            <img className="w-30 pb-10 pt-10" src="/public/images/logo/logo.png" alt="logo" />
          </div>
          <h2 className="text-title-md font-bold text-center text-gray-900 mb-6">{t("auth.forgotPasswordTitle")}</h2>
          <div className="text-center text-gray-600 text-theme-sm mb-8">
            <p>{t("messages.enterEmailOrPhone")}</p>
          </div>
          <div className="w-3/4 mx-auto h-px bg-gray-300 mb-8"></div>
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-theme-sm font-medium text-gray-700">
                {t("auth.email")} <span className="text-error-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((prev) => ({ ...prev, email: "" }))
                }}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
                placeholder={t("placeholders.enterEmailRegister")}
              />
              {errors.email && <p className="text-error-500 text-theme-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-theme-sm font-medium text-gray-700">
                {t("forms.phoneNumber")} <span className="text-error-500">*</span>
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setErrors((prev) => ({ ...prev, phone: "" }))
                }}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
                placeholder={t("placeholders.enterPhoneRegister")}
              />
              {errors.phone && <p className="text-error-500 text-theme-xs mt-1">{errors.phone}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-warning-500 text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-warning-600"
              }`}
            >
              {isLoading ? t("messages.sending") : t("messages.sendOtp")}
            </button>
          </form>
          <div className="mt-6 text-center">
            <NavLink to="/auth/patient-login" className="text-brand-500 font-medium hover:underline">
              {t("auth.backToLogin")}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
