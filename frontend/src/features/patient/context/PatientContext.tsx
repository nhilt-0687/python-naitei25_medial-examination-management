"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, BookingDetails } from "../../../shared/types"

interface PatientContextType {
  user: User | null
  setUser: (user: User | null) => void
  bookingDetails: BookingDetails | null
  setBookingDetails: (details: BookingDetails | null) => void
  clearBookingDetails: () => void
  isBookingInProgress: boolean
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export const usePatientContext = () => {
  const context = useContext(PatientContext)
  if (!context) {
    throw new Error("usePatientContext must be used within PatientProvider")
  }
  return context
}

interface PatientProviderProps {
  children: ReactNode
}

export const PatientProvider: React.FC<PatientProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('patientUser')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error)
    }
  }, [])

  // Save user data to localStorage when user changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('patientUser', JSON.stringify(user))
      } catch (error) {
        console.error('Error saving user data to localStorage:', error)
      }
    } else {
      localStorage.removeItem('patientUser')
    }
  }, [user])

  const clearBookingDetails = () => {
    setBookingDetails(null)
  }

  const isBookingInProgress = bookingDetails !== null

  const contextValue: PatientContextType = {
    user,
    setUser,
    bookingDetails,
    setBookingDetails,
    clearBookingDetails,
    isBookingInProgress,
  }

  return (
    <PatientContext.Provider value={contextValue}>
      {children}
    </PatientContext.Provider>
  )
}