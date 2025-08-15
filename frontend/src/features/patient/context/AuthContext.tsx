"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../shared/services/authService'
import { storage } from '../../../shared/utils/storage'
import { LocalStorageKeys } from '../../../shared/constants/storageKeys'
import type { AuthUser, DoctorInfo, LoginCredentials } from '../../../shared/types/auths'

interface AuthContextType {
  user: AuthUser | null
  doctorInfo: DoctorInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const isAuthenticated = !!user

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = storage.getRaw(LocalStorageKeys.AUTH_TOKEN)
        const storedUser = storage.get<AuthUser>(LocalStorageKeys.AUTH_USER)
        const storedDoctorInfo = storage.get<DoctorInfo>(LocalStorageKeys.DOCTOR_INFO)

        if (token && storedUser) {
          // Verify token is still valid
          const isValid = await authService.verifyToken(token)
          if (isValid) {
            setUser(storedUser)
            if (storedDoctorInfo) {
              setDoctorInfo(storedDoctorInfo)
            }
          } else {
            // Token is invalid, clear storage
            await logout()
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        await logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await authService.login(credentials)
      setUser(response.user)
      
      if (response.doctorInfo) {
        setDoctorInfo(response.doctorInfo)
      }

      // Redirect based on role
      switch (response.user.role) {
        case 'A':
          navigate('/admin')
          break
        case 'D':
          navigate('/doctor')
          break
        case 'RECEPTIONIST':
          navigate('/receptionist')
          break
        case 'P':
        default:
          navigate('/')
          break
      }
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setDoctorInfo(null)
      setError(null)
      navigate('/login')
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    doctorInfo,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
