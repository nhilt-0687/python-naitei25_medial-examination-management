// "use client"
// import type React from "react"
// import { useState, useEffect } from "react"
// import { useNavigate, NavLink } from "react-router-dom"
// import { useTranslation } from "react-i18next"
// import { useAuth } from "../../../shared/context/AuthContext"
// import { storage } from "../../../shared/utils/storage"
// import { LocalStorageKeys } from "../../../shared/constants/storageKeys"
// import LanguageSwitcher from "../../../shared/components/common/LanguageSwitcher"
// import type { LoginCredentials } from "../../../shared/types/auths"
// import { ValidationUtils } from "../../../shared/utils/validation"

// const PatientLoginForm: React.FC = () => {
//   const { t } = useTranslation()
//   const { login, isLoading, error } = useAuth()
//   const navigate = useNavigate()
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
//   const [errorMessage, setErrorMessage] = useState("")
//   const [showPassword, setShowPassword] = useState(false)
//   const [initialCheckDone, setInitialCheckDone] = useState(false)

//   const validateForm = () => {
//     const newErrors: { email?: string; password?: string } = {}

//     // Validate email using ValidationUtils
//     const emailResult = ValidationUtils.validateEmail(email)
//     if (!emailResult.isValid) {
//       newErrors.email = emailResult.errorMessage
//     }

//     // Validate password using ValidationUtils
//     const passwordResult = ValidationUtils.validatePassword(password)
//     if (!passwordResult.isValid) {
//       newErrors.password = passwordResult.errorMessage
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setErrorMessage("")
//     setErrors({})

//     if (!validateForm()) {
//       return
//     }

//     try {
//       const credentials: LoginCredentials = { email: email.trim(), password }
//       const success = await login(credentials)
//       if (success) {
//         const user = storage.get(LocalStorageKeys.AUTH_USER)
//         if (user && user.role === "P") {
//           navigate("/patient", { replace: true })
//         } else {
//           setErrorMessage(t("messages.accountNotPatient"))
//           navigate("/login")
//         }
//       }
//     } catch (error) {
//       setErrorMessage(error || t("messages.loginError"))
//     }
//   }

//   useEffect(() => {
//     if (!initialCheckDone) {
//       const user = storage.get(LocalStorageKeys.AUTH_USER)
//       if (user && user.role === "P") {
//         navigate("/patient", { replace: true })
//       }
//       setInitialCheckDone(true)
//     }
//   }, [navigate, initialCheckDone])

//   return (
//     <div className="min-h-screen flex items-center justify-center py-10 relative font-outfit bg-gray-50">
//       <div className="absolute top-4 right-4 z-10">
//         <LanguageSwitcher />
//       </div>
//       <div
//         className="absolute inset-0 bg-gradient-to-r animate-gradient opacity-60"
//         style={{
//           backgroundImage:
//             "linear-gradient(to right, var(--color-brand-200), var(--color-base-300), var(--color-brand-200))",
//         }}
//       ></div>
//       <style>
//         {`
//           @keyframes gradient {
//             0% { background-position: 0% 50%; }
//             50% { background-position: 100% 50%; }
//             100% { background-position: 0% 50%; }
//           }
//           .animate-gradient {
//             background-size: 200% 200%;
//             animation: gradient 20s ease infinite;
//           }
//           .input-focus {
//             transition: all 0.3s ease;
//           }
//           .input-focus:focus {
//             transform: scale(1.02);
//             box-shadow: var(--shadow-focus-ring);
//             border-color: var(--color-brand-400);
//           }
//           .button-hover {
//             transition: all 0.3s ease;
//           }
//           .button-hover:hover:not(:disabled) {
//             transform: translateY(-2px);
//             box-shadow: var(--shadow-theme-sm);
//             background-color: var(--color-warning-600);
//           }
//           .fade-in {
//             animation: fadeIn 0.5s ease-in;
//           }
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(10px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//         `}
//       </style>
//       <div className="w-full max-w-6xl flex rounded-lg shadow-theme-lg overflow-hidden relative z-[var(--z-index-9)]">
//         <div
//           className="w-1/2 hidden md:block bg-cover bg-center"
//           style={{
//             backgroundImage: "url('/public/images/auth/login.png')",
//           }}
//         ></div>
//         <div className="w-full md:w-1/2 bg-gray-50 p-8 fade-in">
//           <div className="flex justify-center mb-6">
//             <img className="w-30 pb-10 pt-10" src="/public/images/logo/logo.png" alt="logo" />
//           </div>
//           <h2 className="text-title-md font-bold text-center text-gray-900 mb-6">{t("auth.loginTitle")}</h2>
//           <div className="text-center text-gray-600 text-theme-sm mb-8">
//             <p>{t("auth.welcomeBack")}</p>
//           </div>
//           <div className="w-3/4 mx-auto h-px bg-gray-300 mb-8"></div>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="email" className="block text-theme-sm font-medium text-gray-700">
//                 {t("auth.email")} <span className="text-error-500">*</span>
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => {
//                   setEmail(e.target.value)
//                   setErrors((prev) => ({ ...prev, email: "" }))
//                 }}
//                 className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
//                 placeholder={t("placeholders.enterEmail")}
//               />
//               {errors.email && <p className="text-error-500 text-theme-xs mt-1">{errors.email}</p>}
//             </div>
//             <div>
//               <label htmlFor="password" className="block text-theme-sm font-medium text-gray-700">
//                 {t("auth.password")} <span className="text-error-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => {
//                     setPassword(e.target.value)
//                     setErrors((prev) => ({ ...prev, password: "" }))
//                   }}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
//                   placeholder={t("placeholders.enterPassword")}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-sm text-gray-500 hover:text-brand-500 transition-colors duration-200"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
//                 </button>
//               </div>
//               {errors.password && <p className="text-error-500 text-theme-xs mt-1">{errors.password}</p>}
//               <div className="text-right mt-2">
//                 <NavLink to="/forgot-password" className="text-theme-sm text-brand-500 hover:underline">
//                   {t("auth.forgotPassword")}
//                 </NavLink>
//               </div>
//             </div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className={`w-full bg-warning-500 text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${
//                 isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-warning-600"
//               }`}
//             >
//               {isLoading ? t("messages.loggingIn") : t("auth.login")}
//             </button>
//           </form>
//           {(error || errorMessage) && (
//             <div className="mt-4 text-center text-error-500 text-theme-sm">
//               <p>
//                 {error || errorMessage}{" "}
//                 <a href="#" onClick={() => window.location.reload()} className="underline">
//                   {t("common.tryAgain")}
//                 </a>
//               </p>
//             </div>
//           )}
//           <div className="mt-6 text-center">
//             <p className="text-theme-sm text-gray-600">
//               {t("auth.noAccount")}{" "}
//               <NavLink to="/register" className="text-brand-500 font-medium hover:underline">
//                 {t("auth.registerNow")}
//               </NavLink>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default PatientLoginForm
// =======
"use client"
import type React from "react"
import { useState } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../shared/context/AuthContext"
import { storage } from "../../../shared/utils/storage"
import { LocalStorageKeys } from "../../../shared/constants/storageKeys"
import LanguageSwitcher from "../../../shared/components/common/LanguageSwitcher"
import type { LoginCredentials } from "../../../shared/types/auths"
import { ValidationUtils } from "../../../shared/utils/validation"

const PatientLoginForm: React.FC = () => {
  const { t } = useTranslation()
  const { login, logout, isLoading, error, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [errorMessage, setErrorMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Handle logout
  const handleLogout = async () => {
    await logout();
    // After logout, the component will re-render and show login form
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    const emailResult = ValidationUtils.validateEmail(email)
    if (!emailResult.isValid) {
      newErrors.email = emailResult.errorMessage
    }

    const passwordResult = ValidationUtils.validatePassword(password)
    if (!passwordResult.isValid) {
      newErrors.password = passwordResult.errorMessage
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setErrors({})

    if (!validateForm()) {
      return
    }

    try {
      const credentials: LoginCredentials = { email: email.trim(), password }
      const success = await login(credentials)
      if (success) {
        const user = storage.get(LocalStorageKeys.AUTH_USER)
        if (user && user.role === "P") {
          navigate("/patient/dashboard", { replace: true })
        } else {
          setErrorMessage(t("messages.accountNotPatient"))
          navigate("/auth/login")
        }
      }
    } catch (error) {
      setErrorMessage(error || t("messages.loginError"))
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
            backgroundImage: "url('/public/images/auth/login.png')",
          }}
        ></div>
        <div className="w-full md:w-1/2 bg-gray-50 p-8 fade-in">
          <div className="flex justify-center mb-6">
            <img className="w-30 pb-10 pt-10" src="/public/images/logo/logo.png" alt="logo" />
          </div>
          <h2 className="text-title-md font-bold text-center text-gray-900 mb-6">{t("auth.loginTitle")}</h2>
          <div className="text-center text-gray-600 text-theme-sm mb-8">
            <p>{t("auth.welcomeBack")}</p>
          </div>
          <div className="w-3/4 mx-auto h-px bg-gray-300 mb-8"></div>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder={t("placeholders.enterEmail")}
              />
              {errors.email && <p className="text-error-500 text-theme-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-theme-sm font-medium text-gray-700">
                {t("auth.password")} <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, password: "" }))
                  }}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none input-focus text-gray-800"
                  placeholder={t("placeholders.enterPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-sm text-gray-500 hover:text-brand-500 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                </button>
              </div>
              {errors.password && <p className="text-error-500 text-theme-xs mt-1">{errors.password}</p>}
              <div className="text-right mt-2">
                <NavLink to="/auth/forgot-password" className="text-theme-sm text-brand-500 hover:underline">
                  {t("auth.forgotPassword")}
                </NavLink>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-warning-500 text-white py-2 rounded-lg font-bold transition-all duration-300 button-hover ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-warning-600"
              }`}
            >
              {isLoading ? t("messages.loggingIn") : t("auth.login")}
            </button>
          </form>
          {(error || errorMessage) && (
            <div className="mt-4 text-center text-error-500 text-theme-sm">
              <p>
                {error || errorMessage}{" "}
                <a href="#" onClick={() => window.location.reload()} className="underline">
                  {t("common.tryAgain")}
                </a>
              </p>
            </div>
          )}
          <div className="mt-6 text-center">
            <p className="text-theme-sm text-gray-600">
              {t("auth.noAccount")}{" "}
              <NavLink to="/auth/register" className="text-brand-500 font-medium hover:underline">
                {t("auth.registerNow")}
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientLoginForm
