"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { authService } from "../../../shared/services/authService"
import { message } from "antd"
import LanguageSwitcher from "../../../shared/components/common/LanguageSwitcher"
import { ValidationUtils } from "../../../shared/utils/validation"

const ResetPassword: React.FC = () => {
  const { t } = useTranslation()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { email, resetToken } = location.state || {}

  useEffect(() => {
    if (!email || !resetToken) {
      message.error(t("messages.missingResetToken"))
      navigate("/verify-otp")
    }
  }, [email, resetToken, navigate, t])

  const validateForm = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {}

    // Validate password using ValidationUtils
    const passwordResult = ValidationUtils.validatePassword(newPassword)
    if (!passwordResult.isValid) {
      newErrors.newPassword = passwordResult.errorMessage
    }

    // Validate password match using ValidationUtils
    const passwordMatchResult = ValidationUtils.validatePasswordMatch(newPassword, confirmPassword)
    if (!passwordMatchResult.isValid) {
      newErrors.confirmPassword = passwordMatchResult.errorMessage
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
        resetToken,
        password: newPassword,
      }
      console.log("Resetting password with payload:", payload)
      await authService.resetPassword(payload)
      message.success(t("messages.passwordResetSuccess"))
      setTimeout(() => navigate("/patient-login"), 2000)
    } catch (error: any) {
      console.error("Reset password error:", error.response?.data || error.message)
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
          <h2 className="text-title-md font-bold text-center text-gray-900 mb-6">{t("auth.resetPasswordTitle")}</h2>
          <div className="text-center text-gray-600 text-theme-sm mb-8">
            <p>
              {t("messages.enterNewPassword")} {email}
            </p>
          </div>
          <div className="w-3/4 mx-auto h-px bg-gray-300 mb-8"></div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-theme-sm font-medium text-gray-700">
                {t("auth.newPassword")} <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, newPassword: "" }))
                  }}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
                  placeholder={t("placeholders.enterNewPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-sm text-gray-500 hover:text-brand-500 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                </button>
              </div>
              {errors.newPassword && <p className="text-error-500 text-theme-xs mt-1">{errors.newPassword}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-theme-sm font-medium text-gray-700">
                {t("auth.confirmPassword")} <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                  }}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
                  placeholder={t("placeholders.confirmNewPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-sm text-gray-500 hover:text-brand-500 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-error-500 text-theme-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-warning-500 text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-warning-600"
              }`}
            >
              {isLoading ? t("messages.updating") : t("messages.resetPassword")}
            </button>
          </form>
          <div className="mt-6 text-center">
            <NavLink to="/patient-login" className="text-brand-500 font-medium hover:underline">
              {t("auth.backToLogin")}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
