"use client"

import type React from "react"
import { useState } from "react"
import AppointmentList from "../components/common/Appointments/AppointmentList"
import type { AppointmentDisplay } from "../../../shared/types/appointment"

const AppointmentsPage: React.FC = () => {
  // Mock patient ID - trong thực tế sẽ lấy từ authentication context
  const patientId = 1

  const handleAppointmentClick = (appointment: AppointmentDisplay) => {
    console.log("Navigate to appointment detail:", appointment.id)
    // Implement navigation to appointment detail page
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Lịch khám của tôi</h2>
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors">
          Đặt lịch mới
        </button>
      </div>

      <AppointmentList 
        patientId={patientId}
        onAppointmentClick={handleAppointmentClick}
      />
    </div>
  )
}

export default AppointmentsPage
