"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

interface RegisterData {
  email?: string
  phone?: string
  password?: string
  fullName?: string
  dateOfBirth?: string
  gender?: "M" | "F" | "O"
  cccd?: string
  healthInsurance?: string
  address?: string
}

interface RegisterContextType {
  registerData: RegisterData
  setRegisterData: (data: RegisterData) => void
  clearRegisterData: () => void
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined)

export const RegisterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registerData, setRegisterData] = useState<RegisterData>({})

  const clearRegisterData = () => setRegisterData({})

  return (
    <RegisterContext.Provider value={{ registerData, setRegisterData, clearRegisterData }}>
      {children}
    </RegisterContext.Provider>
  )
}

export const useRegister = () => {
  const context = useContext(RegisterContext)
  if (!context) {
    throw new Error("useRegister must be used within a RegisterProvider")
  }
  return context
}
