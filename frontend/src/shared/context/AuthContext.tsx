"use client"

import { App, message } from "antd"
import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { authService } from "../services/authService"
import { userService } from "../services/userService"
import { doctorService } from "../services/doctorService"
import { storage } from "../utils/storage"
import { LocalStorageKeys } from "../constants/storageKeys"
import type { AuthState, AuthUser, DoctorInfo, LoginCredentials } from "../types/auths"

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: AuthUser; doctorInfo?: DoctorInfo; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_USER"; payload: AuthUser }
  | { type: "UPDATE_DOCTOR_INFO"; payload: DoctorInfo }

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  updateUser: (user: AuthUser) => void
  updateDoctorInfo: (doctorInfo: DoctorInfo) => void
  isAdmin: () => boolean
  isDoctor: () => boolean
  isReceptionist: () => boolean
  hasRole: (role: string) => boolean
  getCurrentUserId: () => number | null
  getCurrentDoctorId: () => number | null
}

const initialState: AuthState = {
  user: null,
  doctorInfo: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        doctorInfo: action.payload.doctorInfo || null,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case "LOGIN_FAILURE":
      return { ...initialState, isLoading: false, error: action.payload }
    case "LOGOUT":
      return { ...initialState, isLoading: false }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "UPDATE_USER":
      return { ...state, user: action.payload }
    case "UPDATE_DOCTOR_INFO":
      return { ...state, doctorInfo: action.payload }
    default:
      return state
  }
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const loadAuthData = async () => {
      const token = storage.getRaw(LocalStorageKeys.AUTH_TOKEN)
      if (token) {
        try {
          const user = await userService.getCurrentUser()
          const userId = user.userId ?? user.id
          if (!userId) throw new Error("User ID is missing")
          let doctorInfo: DoctorInfo | undefined
          if (user.role === "D") {
            try {
              const doctor = await doctorService.getDoctorByUserId(userId)
              if (doctor) {
                doctorInfo = doctor
                storage.set(LocalStorageKeys.DOCTOR_INFO, doctor)
                storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctor.doctorId.toString())
              }
            } catch (error) {
              console.error("Failed to fetch doctor info:", error)
            }
          }
          storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
          storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())
          dispatch({ type: "LOGIN_SUCCESS", payload: { user: { ...user, userId }, doctorInfo, token } })
        } catch (error) {
          console.error("Token validation failed:", error)
          storage.clear()
          dispatch({ type: "LOGOUT" })
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }
    loadAuthData()
  }, [])

  const getRoleText = useCallback(
    (role: string) => {
      switch (role) {
        case "A":
          return t("roles.admin")
        case "D":
          return t("roles.doctor")
        case "P":
          return t("roles.patient")
        case "RECEPTIONIST":
          return t("roles.receptionist")
        default:
          return t("roles.user")
      }
    },
    [t],
  )

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        dispatch({ type: "LOGIN_START" })
        const { token, user, doctorInfo } = await authService.login(credentials)
        dispatch({ type: "LOGIN_SUCCESS", payload: { user, doctorInfo, token } })
        message.success(t("auth.welcomeRole", { role: getRoleText(user.role) }))
        return true
      } catch (error: any) {
        console.error("Login error:", error)
        storage.clear()
        const errorMessage =
          error.response?.status === 401
            ? t("auth.invalidCredentials")
            : error.response?.data?.message || error.message || t("auth.loginFailed")
        dispatch({ type: "LOGIN_FAILURE", payload: errorMessage })
        message.error(errorMessage)
        return false
      }
    },
    [t, getRoleText],
  )

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout()
      dispatch({ type: "LOGOUT" })
      message.success(t("auth.logoutSuccess"))
    } catch (error) {
      console.error("Logout error:", error)
      dispatch({ type: "LOGOUT" })
    }
  }, [t])

  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const user = await userService.getCurrentUser()
      const userId = user.userId ?? user.id
      if (!userId) throw new Error("User ID is missing")
      dispatch({ type: "UPDATE_USER", payload: { ...user, userId } })
      if (user.role === "D") {
        try {
          const doctorInfo = await doctorService.getDoctorByUserId(userId)
          if (doctorInfo) {
            dispatch({ type: "UPDATE_DOCTOR_INFO", payload: doctorInfo })
            storage.set(LocalStorageKeys.DOCTOR_INFO, doctorInfo)
            storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctorInfo.doctorId.toString())
          }
        } catch (error) {
          console.error("Failed to fetch doctor info:", error)
        }
      }
      storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
      storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())
    } catch (error) {
      console.error("Error refreshing auth data:", error)
      dispatch({ type: "SET_ERROR", payload: t("auth.refreshAuthError") })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [t])

  const updateUser = useCallback((user: AuthUser) => {
    const userId = user.userId ?? user.id
    if (!userId) throw new Error("User ID is missing")
    dispatch({ type: "UPDATE_USER", payload: { ...user, userId } })
    storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
    storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())
  }, [])

  const updateDoctorInfo = useCallback((doctorInfo: DoctorInfo) => {
    dispatch({ type: "UPDATE_DOCTOR_INFO", payload: doctorInfo })
    storage.set(LocalStorageKeys.DOCTOR_INFO, doctorInfo)
    storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctorInfo.doctorId.toString())
  }, [])

  const getCurrentUserId = useCallback(() => state.user?.userId || null, [state.user])
  const getCurrentDoctorId = useCallback(() => state.doctorInfo?.doctorId || null, [state.doctorInfo])
  const isAdmin = useCallback(() => state.user?.role === "A", [state.user])
  const isDoctor = useCallback(() => state.user?.role === "D", [state.user])
  const isReceptionist = useCallback(() => state.user?.role === "RECEPTIONIST", [state.user])
  const hasRole = useCallback((role: string) => state.user?.role === role, [state.user])

  return (
    <App>
      <AuthContext.Provider
        value={{
          ...state,
          login,
          logout,
          refreshAuth,
          updateUser,
          updateDoctorInfo,
          isAdmin,
          isDoctor,
          isReceptionist,
          hasRole,
          getCurrentUserId,
          getCurrentDoctorId,
        }}
      >
        {children}
      </AuthContext.Provider>
    </App>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
// =======
// <<<<<<< HEAD
// "use client"

// import { App, message } from "antd"
// import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react"
// import { useTranslation } from "react-i18next"
// import { useLocation, useNavigate } from "react-router-dom"
// import { authService } from "../services/authService"
// import { userService } from "../services/userService"
// import { doctorService } from "../services/doctorService"
// import { storage } from "../utils/storage"
// import { LocalStorageKeys } from "../constants/storageKeys"
// import type { AuthState, AuthUser, DoctorInfo, LoginCredentials } from "../types/auths"

// type AuthAction =
//   | { type: "LOGIN_START" }
//   | { type: "LOGIN_SUCCESS"; payload: { user: AuthUser; doctorInfo?: DoctorInfo; token: string } }
//   | { type: "LOGIN_FAILURE"; payload: string }
//   | { type: "LOGOUT" }
//   | { type: "SET_LOADING"; payload: boolean }
//   | { type: "SET_ERROR"; payload: string | null }
//   | { type: "UPDATE_USER"; payload: AuthUser }
//   | { type: "UPDATE_DOCTOR_INFO"; payload: DoctorInfo }

// interface AuthContextType extends AuthState {
//   login: (credentials: LoginCredentials) => Promise<boolean>
//   logout: () => Promise<void>
//   refreshAuth: () => Promise<void>
//   updateUser: (user: AuthUser) => void
//   updateDoctorInfo: (doctorInfo: DoctorInfo) => void
//   isAdmin: () => boolean
//   isDoctor: () => boolean
//   isReceptionist: () => boolean
//   hasRole: (role: string) => boolean
//   getCurrentUserId: () => number | null
//   getCurrentDoctorId: () => number | null
// }

// const initialState: AuthState = {
//   user: null,
//   doctorInfo: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: true,
//   error: null,
// }

// const authReducer = (state: AuthState, action: AuthAction): AuthState => {
//   switch (action.type) {
//     case "LOGIN_START":
//       return { ...state, isLoading: true, error: null }
//     case "LOGIN_SUCCESS":
//       return {
//         ...state,
//         user: action.payload.user,
//         doctorInfo: action.payload.doctorInfo || null,
//         token: action.payload.token,
//         isAuthenticated: true,
//         isLoading: false,
//         error: null,
//       }
//     case "LOGIN_FAILURE":
//       return { ...initialState, isLoading: false, error: action.payload }
//     case "LOGOUT":
//       return { ...initialState, isLoading: false }
//     case "SET_LOADING":
//       return { ...state, isLoading: action.payload }
//     case "SET_ERROR":
//       return { ...state, error: action.payload }
//     case "UPDATE_USER":
//       return { ...state, user: action.payload }
//     case "UPDATE_DOCTOR_INFO":
//       return { ...state, doctorInfo: action.payload }
//     default:
//       return state
//   }
// }

// export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const { t } = useTranslation()
//   const [state, dispatch] = useReducer(authReducer, initialState)
//   const location = useLocation()
//   const navigate = useNavigate()

//   useEffect(() => {
//     console.log('AuthProvider useEffect triggered, current path:', location.pathname)
//     console.log('Current auth state:', { 
//       isAuthenticated: state.isAuthenticated, 
//       user: state.user?.role,
//       token: !!storage.getRaw(LocalStorageKeys.AUTH_TOKEN)
//     })
    
//     const loadAuthData = async () => {
//       const token = storage.getRaw(LocalStorageKeys.AUTH_TOKEN)
//       console.log('Token from storage:', token ? 'exists' : 'not found')
      
//       if (token) {
//         console.log('Token found, validating...')
//         try {
//           const user = await userService.getCurrentUser()
//           console.log('User validated:', user)
          
//           const userId = user.userId ?? user.id
//           if (!userId) throw new Error("User ID is missing")
//           let doctorInfo: DoctorInfo | undefined
//           if (user.role === "D") {
//             try {
//               const doctor = await doctorService.getDoctorByUserId(userId)
//               if (doctor) {
//                 doctorInfo = doctor
//                 storage.set(LocalStorageKeys.DOCTOR_INFO, doctor)
//                 storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctor.doctorId.toString())
//               }
//             } catch (error) {
//               console.error("Failed to fetch doctor info:", error)
//             }
//           }
//           storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
//           storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())
          
//           console.log('About to dispatch LOGIN_SUCCESS')
//           dispatch({ type: "LOGIN_SUCCESS", payload: { user: { ...user, userId }, doctorInfo, token } })
          
//           // Auto redirect based on role - CHỈ KHI KHÔNG Ở AUTH PAGES
//           console.log('User role:', user.role, 'Current path:', location.pathname)
          
//           // KHÔNG REDIRECT KHI ĐANG Ở AUTH PAGES
//           if (!location.pathname.startsWith('/auth/')) {
//             console.log('Not on auth page, checking for redirect...')
//             if (user.role === 'A' && !location.pathname.startsWith('/admin')) {
//               console.log('Redirecting admin to /admin')
//               navigate('/admin/', { replace: true })
//             } else if (user.role === 'D' && !location.pathname.startsWith('/doctor')) {
//               console.log('Redirecting doctor to /doctor')
//               navigate('/doctor/', { replace: true })
//             } else if (user.role === 'P' && location.pathname === '/') {
//               console.log('Redirecting patient from root to /patient')
//               navigate('/patient/', { replace: true })
//             }
//           } else {
//             console.log('On auth page, skipping auto-redirect')
//           }
          
//         } catch (error) {
//           console.error("Token validation failed:", error)
//           storage.clear()
//           dispatch({ type: "LOGOUT" })
//         }
//       } else {
//         console.log('No token found, setting loading to false')
//         dispatch({ type: "SET_LOADING", payload: false })
//       }
//     }
//     loadAuthData()
//   }, [location.pathname, navigate]) // Thêm dependency để track path changes

//   const getRoleText = useCallback(
//     (role: string) => {
//       switch (role) {
//         case "A":
//           return t("roles.admin")
//         case "D":
//           return t("roles.doctor")
//         case "P":
//           return t("roles.patient")
//         case "RECEPTIONIST":
//           return t("roles.receptionist")
//         default:
//           return t("roles.user")
//       }
//     },
//     [t],
//   )

//   const login = useCallback(
//     async (credentials: LoginCredentials): Promise<boolean> => {
//       try {
//         dispatch({ type: "LOGIN_START" })
//         const { token, user, doctorInfo } = await authService.login(credentials)
//         dispatch({ type: "LOGIN_SUCCESS", payload: { user, doctorInfo, token } })
//         message.success(t("auth.welcomeRole", { role: getRoleText(user.role) }))
        
//         // Redirect sau khi login thành công
//         if (user.role === 'A') {
//           navigate('/admin/', { replace: true })
//         } else if (user.role === 'D') {
//           navigate('/doctor/', { replace: true })
//         } else if (user.role === 'P') {
//           navigate('/patient/dashboard', { replace: true })
//         }
        
//         return true
//       } catch (error: any) {
//         console.error("Login error:", error)
//         storage.clear()
//         const errorMessage =
//           error.response?.status === 401
//             ? t("auth.invalidCredentials")
//             : error.response?.data?.message || error.message || t("auth.loginFailed")
//         dispatch({ type: "LOGIN_FAILURE", payload: errorMessage })
//         message.error(errorMessage)
//         return false
//       }
//     },
//     [t, getRoleText, navigate],
//   )

//   const logout = useCallback(async (): Promise<void> => {
//     try {
//       await authService.logout()
//       dispatch({ type: "LOGOUT" })
//       navigate('/patient/', { replace: true }) // Về homepage sau khi logout
//       message.success(t("auth.logoutSuccess"))
//     } catch (error) {
//       console.error("Logout error:", error)
//       dispatch({ type: "LOGOUT" })
//       navigate('/patient/', { replace: true })
//     }
//   }, [t, navigate])

//   const refreshAuth = useCallback(async (): Promise<void> => {
//     try {
//       dispatch({ type: "SET_LOADING", payload: true })
//       const user = await userService.getCurrentUser()
//       const userId = user.userId ?? user.id
//       if (!userId) throw new Error("User ID is missing")
//       dispatch({ type: "UPDATE_USER", payload: { ...user, userId } })
//       if (user.role === "D") {
//         try {
//           const doctorInfo = await doctorService.getDoctorByUserId(userId)
//           if (doctorInfo) {
//             dispatch({ type: "UPDATE_DOCTOR_INFO", payload: doctorInfo })
//             storage.set(LocalStorageKeys.DOCTOR_INFO, doctorInfo)
//             storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctorInfo.doctorId.toString())
//           }
//         } catch (error) {
//           console.error("Failed to fetch doctor info:", error)
//         }
//       }
//       storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
//       storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())
//     } catch (error) {
//       console.error("Error refreshing auth data:", error)
//       dispatch({ type: "SET_ERROR", payload: t("auth.refreshAuthError") })
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false })
//     }
//   }, [t])

//   const updateUser = useCallback((user: AuthUser) => {
//     const userId = user.userId ?? user.id
//     if (!userId) throw new Error("User ID is missing")
//     dispatch({ type: "UPDATE_USER", payload: { ...user, userId } })
//     storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
//     storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())
//   }, [])

//   const updateDoctorInfo = useCallback((doctorInfo: DoctorInfo) => {
//     dispatch({ type: "UPDATE_DOCTOR_INFO", payload: doctorInfo })
//     storage.set(LocalStorageKeys.DOCTOR_INFO, doctorInfo)
//     storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctorInfo.doctorId.toString())
//   }, [])

//   const getCurrentUserId = useCallback(() => state.user?.userId || null, [state.user])
//   const getCurrentDoctorId = useCallback(() => state.doctorInfo?.doctorId || null, [state.doctorInfo])
//   const isAdmin = useCallback(() => state.user?.role === "A", [state.user])
//   const isDoctor = useCallback(() => state.user?.role === "D", [state.user])
//   const isReceptionist = useCallback(() => state.user?.role === "RECEPTIONIST", [state.user])
//   const hasRole = useCallback((role: string) => state.user?.role === role, [state.user])

//   return (
//     <App>
//       <AuthContext.Provider
//         value={{
//           ...state,
//           login,
//           logout,
//           refreshAuth,
//           updateUser,
//           updateDoctorInfo,
//           isAdmin,
//           isDoctor,
//           isReceptionist,
//           hasRole,
//           getCurrentUserId,
//           getCurrentDoctorId,
//         }}
//       >
//         {children}
//       </AuthContext.Provider>
//     </App>
//   )
// }

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext)
//   if (!context) throw new Error("useAuth must be used within an AuthProvider")
//   return context
// }
// =======
// "use client"

// import { App, message } from "antd"
// import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react"
// import { useTranslation } from "react-i18next"
// import { authService } from "../services/authService"
// import { userService } from "../services/userService"
// import { doctorService } from "../services/doctorService"
// import { storage } from "../utils/storage"
// import { LocalStorageKeys } from "../constants/storageKeys"
// import type { AuthState, AuthUser, DoctorInfo, LoginCredentials } from "../types/auths"

// type AuthAction =
//   | { type: "LOGIN_START" }
//   | { type: "LOGIN_SUCCESS"; payload: { user: AuthUser; doctorInfo?: DoctorInfo; token: string } }
//   | { type: "LOGIN_FAILURE"; payload: string }
//   | { type: "LOGOUT" }
//   | { type: "SET_LOADING"; payload: boolean }
//   | { type: "SET_ERROR"; payload: string | null }
//   | { type: "UPDATE_USER"; payload: AuthUser }
//   | { type: "UPDATE_DOCTOR_INFO"; payload: DoctorInfo }

// interface AuthContextType extends AuthState {
//   login: (credentials: LoginCredentials) => Promise<boolean>
//   logout: () => Promise<void>
//   refreshAuth: () => Promise<void>
//   updateUser: (user: AuthUser) => void
//   updateDoctorInfo: (doctorInfo: DoctorInfo) => void
//   isAdmin: () => boolean
//   isDoctor: () => boolean
//   isReceptionist: () => boolean
//   hasRole: (role: string) => boolean
//   getCurrentUserId: () => number | null
//   getCurrentDoctorId: () => number | null
// }

// const initialState: AuthState = {
//   user: null,
//   doctorInfo: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: true,
//   error: null,
// }

// const authReducer = (state: AuthState, action: AuthAction): AuthState => {
//   switch (action.type) {
//     case "LOGIN_START":
//       return { ...state, isLoading: true, error: null }
//     case "LOGIN_SUCCESS":
//       return {
//         ...state,
//         user: action.payload.user,
//         doctorInfo: action.payload.doctorInfo || null,
//         token: action.payload.token,
//         isAuthenticated: true,
//         isLoading: false,
//         error: null,
//       }
//     case "LOGIN_FAILURE":
//       return { ...initialState, isLoading: false, error: action.payload }
//     case "LOGOUT":
//       return { ...initialState, isLoading: false }
//     case "SET_LOADING":
//       return { ...state, isLoading: action.payload }
//     case "SET_ERROR":
//       return { ...state, error: action.payload }
//     case "UPDATE_USER":
//       return { ...state, user: action.payload }
//     case "UPDATE_DOCTOR_INFO":
//       return { ...state, doctorInfo: action.payload }
//     default:
//       return state
//   }
// }

// export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const { t } = useTranslation()
//   const [state, dispatch] = useReducer(authReducer, initialState)

//   useEffect(() => {
//     const loadAuthData = async () => {
//       const token = storage.getRaw(LocalStorageKeys.AUTH_TOKEN)
//       if (token) {
//         try {
//           const user = await userService.getCurrentUser()
//           const userId = user.userId ?? user.id
//           if (!userId) throw new Error("User ID is missing")
//           let doctorInfo: DoctorInfo | undefined
//           if (user.role === "D") {
//             try {
//               const doctor = await doctorService.getDoctorByUserId(userId)
//               if (doctor) {
//                 doctorInfo = doctor
//                 storage.set(LocalStorageKeys.DOCTOR_INFO, doctor)
//                 storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctor.doctorId.toString())
//               }
//             } catch (error) {
//               console.error("Failed to fetch doctor info:", error)
//             }
//           }
//           storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
//           storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())
//           dispatch({ type: "LOGIN_SUCCESS", payload: { user: { ...user, userId }, doctorInfo, token } })
//         } catch (error) {
//           console.error("Token validation failed:", error)
//           storage.clear()
//           dispatch({ type: "LOGOUT" })
//         }
//       } else {
//         dispatch({ type: "SET_LOADING", payload: false })
//       }
//     }
//     loadAuthData()
//   }, [])

//   const getRoleText = useCallback(
//     (role: string) => {
//       switch (role) {
//         case "A":
//           return t("roles.admin")
//         case "D":
//           return t("roles.doctor")
//         case "P":
//           return t("roles.patient")
//         case "RECEPTIONIST":
//           return t("roles.receptionist")
//         default:
//           return t("roles.user")
//       }
//     },
//     [t],
//   )

//   const login = useCallback(
//     async (credentials: LoginCredentials): Promise<boolean> => {
//       try {
//         dispatch({ type: "LOGIN_START" })
//         const { token, user, doctorInfo } = await authService.login(credentials)
//         dispatch({ type: "LOGIN_SUCCESS", payload: { user, doctorInfo, token } })
//         message.success(t("auth.welcomeRole", { role: getRoleText(user.role) }))
//         return true
//       } catch (error: any) {
//         console.error("Login error:", error)
//         storage.clear()
//         const errorMessage =
//           error.response?.status === 401
//             ? t("auth.invalidCredentials")
//             : error.response?.data?.message || error.message || t("auth.loginFailed")
//         dispatch({ type: "LOGIN_FAILURE", payload: errorMessage })
//         message.error(errorMessage)
//         return false
//       }
//     },
//     [t, getRoleText],
//   )

//   const logout = useCallback(async (): Promise<void> => {
//     try {
//       await authService.logout()
//       dispatch({ type: "LOGOUT" })
//       message.success(t("auth.logoutSuccess"))
//     } catch (error) {
//       console.error("Logout error:", error)
//       dispatch({ type: "LOGOUT" })
//     }
//   }, [t])

//   const refreshAuth = useCallback(async (): Promise<void> => {
//     try {
//       dispatch({ type: "SET_LOADING", payload: true })
//       const user = await userService.getCurrentUser()
//       const userId = user.userId ?? user.id
//       if (!userId) throw new Error("User ID is missing")
//       dispatch({ type: "UPDATE_USER", payload: { ...user, userId } })
//       if (user.role === "D") {
//         try {
//           const doctorInfo = await doctorService.getDoctorByUserId(userId)
//           if (doctorInfo) {
//             dispatch({ type: "UPDATE_DOCTOR_INFO", payload: doctorInfo })
//             storage.set(LocalStorageKeys.DOCTOR_INFO, doctorInfo)
//             storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctorInfo.doctorId.toString())
//           }
//         } catch (error) {
//           console.error("Failed to fetch doctor info:", error)
//         }
//       }
//       storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
//       storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())
//     } catch (error) {
//       console.error("Error refreshing auth data:", error)
//       dispatch({ type: "SET_ERROR", payload: t("auth.refreshAuthError") })
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false })
//     }
//   }, [t])

//   const updateUser = useCallback((user: AuthUser) => {
//     const userId = user.userId ?? user.id
//     if (!userId) throw new Error("User ID is missing")
//     dispatch({ type: "UPDATE_USER", payload: { ...user, userId } })
//     storage.set(LocalStorageKeys.AUTH_USER, { ...user, userId })
//     storage.setRaw(LocalStorageKeys.CURRENT_USER_ID, userId.toString())
//   }, [])

//   const updateDoctorInfo = useCallback((doctorInfo: DoctorInfo) => {
//     dispatch({ type: "UPDATE_DOCTOR_INFO", payload: doctorInfo })
//     storage.set(LocalStorageKeys.DOCTOR_INFO, doctorInfo)
//     storage.setRaw(LocalStorageKeys.CURRENT_DOCTOR_ID, doctorInfo.doctorId.toString())
//   }, [])

//   const getCurrentUserId = useCallback(() => state.user?.userId || null, [state.user])
//   const getCurrentDoctorId = useCallback(() => state.doctorInfo?.doctorId || null, [state.doctorInfo])
//   const isAdmin = useCallback(() => state.user?.role === "A", [state.user])
//   const isDoctor = useCallback(() => state.user?.role === "D", [state.user])
//   const isReceptionist = useCallback(() => state.user?.role === "RECEPTIONIST", [state.user])
//   const hasRole = useCallback((role: string) => state.user?.role === role, [state.user])

//   return (
//     <App>
//       <AuthContext.Provider
//         value={{
//           ...state,
//           login,
//           logout,
//           refreshAuth,
//           updateUser,
//           updateDoctorInfo,
//           isAdmin,
//           isDoctor,
//           isReceptionist,
//           hasRole,
//           getCurrentUserId,
//           getCurrentDoctorId,
//         }}
//       >
//         {children}
//       </AuthContext.Provider>
//     </App>
//   )
// }

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext)
//   if (!context) throw new Error("useAuth must be used within an AuthProvider")
//   return context
// }
// >>>>>>> 6a1da04 (View Doctor List and Schedule)
// >>>>>>> f782cf1 (Added frontend for doctors' patients list)
