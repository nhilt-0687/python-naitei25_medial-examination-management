"use client"

import { useState, useEffect, useCallback } from "react"
import { message } from "antd"
import { pharmacyService } from "../services/pharmacyServices"
import type { Prescription } from "../types/prescription"

export const usePrescriptionHistory = (patientId?: number) => {
  const [prescriptionHistory, setPrescriptionHistory] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(false)

  const loadPrescriptionHistory = useCallback(async () => {
    if (!patientId) {
      return
    }

    try {
      setLoading(true)
      const data = await pharmacyService.getPrescriptionHistoryByPatientId(patientId)
      setPrescriptionHistory(data)
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error loading prescription history for patient ${patientId}:`, error)
      message.error("Không thể tải lịch sử đơn thuốc")
    } finally {
      setLoading(false)
    }
  }, [patientId])

  const refreshHistory = useCallback(() => {
    const debounce = setTimeout(() => loadPrescriptionHistory(), 300)
    return () => clearTimeout(debounce)
  }, [loadPrescriptionHistory])

  useEffect(() => {
    loadPrescriptionHistory()
  }, [patientId, loadPrescriptionHistory])

  return {
    prescriptionHistory,
    loading,
    refreshHistory,
  }
}
