"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useRegister } from "../context/RegisterContext"
import authService from "../../../shared/services/authService"
import { message } from "antd"
import LanguageSwitcher from "../../../shared/components/common/LanguageSwitcher"
import { ValidationUtils } from "../../../shared/utils/validation"

const RegisterDetail: React.FC = () => {
  const { t } = useTranslation()
  const { registerData, setRegisterData, clearRegisterData } = useRegister()
  const navigate = useNavigate()

  useEffect(() => {
    if (!registerData.email && !registerData.phone) {
      message.error(t("messages.missingEmailOrPhone"))
      navigate("/register")
    }
  }, [registerData, navigate, t])

  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState<"M" | "F" | "O">("M")
  const [cccd, setCccd] = useState("")
  const [healthInsurance, setHealthInsurance] = useState("")
  const [address, setAddress] = useState("")
  const [errors, setErrors] = useState<{
    fullName?: string
    dateOfBirth?: string
    gender?: string
    cccd?: string
    healthInsurance?: string
    address?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: {
      fullName?: string
      dateOfBirth?: string
      gender?: string
      cccd?: string
      healthInsurance?: string
      address?: string
    } = {}

    // Validate full name using ValidationUtils
    const fullNameResult = ValidationUtils.validateFullName(fullName)
    if (!fullNameResult.isValid) {
      newErrors.fullName = fullNameResult.errorMessage
    }

    // Validate date of birth using ValidationUtils
    const dateOfBirthResult = ValidationUtils.validateDateOfBirth(dateOfBirth)
    if (!dateOfBirthResult.isValid) {
      newErrors.dateOfBirth = dateOfBirthResult.errorMessage
    }

    // Validate gender
    if (!gender) {
      newErrors.gender = `${t("forms.gender")} ${t("validation.required")}`
    }

    // Validate CCCD using ValidationUtils
    const cccdResult = ValidationUtils.validateCCCD(cccd)
    if (!cccdResult.isValid) {
      newErrors.cccd = cccdResult.errorMessage
    }

    // Validate health insurance using ValidationUtils (optional field)
    const healthInsuranceResult = ValidationUtils.validateHealthInsurance(healthInsurance)
    if (!healthInsuranceResult.isValid) {
      newErrors.healthInsurance = healthInsuranceResult.errorMessage
    }

    // Validate address using ValidationUtils
    const addressResult = ValidationUtils.validateAddress(address)
    if (!addressResult.isValid) {
      newErrors.address = addressResult.errorMessage
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

    if (!registerData.email && !registerData.phone) {
      message.error(t("messages.missingEmailOrPhone"))
      navigate("/register")
      return
    }

    if (!registerData.password) {
      message.error(t("messages.missingPassword"))
      navigate("/register")
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        email: registerData.email || undefined,
        phone: registerData.phone || undefined,
        password: registerData.password,
        fullName: fullName.trim(),
        dateOfBirth,
        gender,
        cccd: cccd.trim(),
        healthInsurance: healthInsurance.trim() || undefined,
        address: address.trim(),
        role: "P" as const,
      }

      console.log("Payload gửi đi:", payload)

      const response = await authService.register(payload)
      message.success(response.message || t("messages.registerSuccess"))

      setRegisterData({
        ...registerData,
        email: response.email,
        phone: response.phone,
      })

      navigate("/verify-otp", {
        state: {
          email: response.email,
          phone: response.phone,
        },
      })
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error)
      if (error.message?.includes("email")) {
        message.error(t("messages.emailExists"))
      } else if (error.message?.includes("phone")) {
        message.error(t("messages.phoneExists"))
      } else if (error.message?.includes("CCCD")) {
        message.error(t("messages.cccdExists"))
      } else {
        message.error(error.message || t("messages.registerError"))
      }
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
          <h2 className="text-title-md font-bold text-center text-gray-900 mb-6">{t("auth.registerDetailTitle")}</h2>
          <div className="text-center text-gray-600 text-theme-sm mb-8">
            <p>{t("messages.completeInfo")}</p>
          </div>
          <div className="w-3/4 mx-auto h-px bg-gray-300 mb-8"></div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-theme-sm font-medium text-gray-700">
                {t("forms.fullName")} <span className="text-error-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setErrors((prev) => ({ ...prev, fullName: "" }))
                }}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
                placeholder={t("placeholders.enterFullName")}
              />
              {errors.fullName && <p className="text-error-500 text-theme-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-theme-sm font-medium text-gray-700">
                {t("forms.dateOfBirth")} <span className="text-error-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value)
                  setErrors((prev) => ({ ...prev, dateOfBirth: "" }))
                }}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
              />
              {errors.dateOfBirth && <p className="text-error-500 text-theme-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label htmlFor="gender" className="block text-theme-sm font-medium text-gray-700">
                {t("forms.gender")} <span className="text-error-500">*</span>
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value as "M" | "F" | "O")
                  setErrors((prev) => ({ ...prev, gender: "" }))
                }}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
              >
                <option value="M">{t("forms.male")}</option>
                <option value="F">{t("forms.female")}</option>
                <option value="O">{t("forms.other")}</option>
              </select>
              {errors.gender && <p className="text-error-500 text-theme-xs mt-1">{errors.gender}</p>}
            </div>
            <div>
              <label htmlFor="cccd" className="block text-theme-sm font-medium text-gray-700">
                {t("forms.cccd")} <span className="text-error-500">*</span>
              </label>
              <input
                id="cccd"
                type="text"
                value={cccd}
                onChange={(e) => {
                  setCccd(e.target.value)
                  setErrors((prev) => ({ ...prev, cccd: "" }))
                }}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
                placeholder={t("placeholders.enterCccd")}
              />
              {errors.cccd && <p className="text-error-500 text-theme-xs mt-1">{errors.cccd}</p>}
            </div>
            <div>
              <label htmlFor="healthInsurance" className="block text-theme-sm font-medium text-gray-700">
                {t("forms.healthInsurance")}
              </label>
              <input
                id="healthInsurance"
                type="text"
                value={healthInsurance}
                onChange={(e) => {
                  setHealthInsurance(e.target.value)
                  setErrors((prev) => ({ ...prev, healthInsurance: "" }))
                }}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
                placeholder={t("placeholders.enterHealthInsurance")}
              />
              {errors.healthInsurance && <p className="text-error-500 text-theme-xs mt-1">{errors.healthInsurance}</p>}
            </div>
            <div>
              <label htmlFor="address" className="block text-theme-sm font-medium text-gray-700">
                {t("forms.address")} <span className="text-error-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  setErrors((prev) => ({ ...prev, address: "" }))
                }}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
                placeholder={t("placeholders.enterAddress")}
              />
              {errors.address && <p className="text-error-500 text-theme-xs mt-1">{errors.address}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-warning-500 text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-warning-600"
              }`}
            >
              {isLoading ? t("messages.processing") : t("messages.registerAndSendOtp")}
            </button>
          </form>
          <div className="mt-6 text-center">
            <NavLink to="/register" className="text-brand-500 font-medium hover:underline">
              {t("common.goBack")}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterDetail
