"use client"

import React, { useState } from "react"
import AppointmentCard from "./AppointmentCard"
import LoadingSpinner from "../../../../../shared/components/common/LoadingSpinner"
import ErrorMessage from "../../../../../shared/components/common/ErrorMessage"
import { useApi } from "../../../hooks/useApi"
import { appointmentService } from "../../../../../shared/services/appointmentService"
import { transformAppointmentToDisplay, type AppointmentDisplay } from "../../../../../shared/utils/appointmentTransform"

interface AppointmentListProps {
  patientId: number
  onAppointmentClick?: (appointment: AppointmentDisplay) => void
}

const AppointmentList: React.FC<AppointmentListProps> = ({ patientId, onAppointmentClick }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { 
    data: appointmentsResponse, 
    loading, 
    error, 
    refetch 
  } = useApi(
    () => appointmentService.getMyAppointments(currentPage, pageSize),
    [patientId, currentPage]
  )

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách lịch hẹn..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  if (!appointmentsResponse || appointmentsResponse.results.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Bạn chưa có lịch hẹn nào</p>
          <p className="text-gray-500 text-sm mt-1">Đặt lịch khám với bác sĩ để bắt đầu</p>
        </div>
      </div>
    )
  }

  const appointments = appointmentsResponse.results.map(transformAppointmentToDisplay)

  const handleLoadMore = () => {
    if (appointmentsResponse.next) {
      setCurrentPage(prev => prev + 1)
    }
  }

  return (
    <div className="space-y-4">
      {/* Appointment Cards */}
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onClick={() => onAppointmentClick?.(appointment)}
          />
        ))}
      </div>

      {/* Pagination Info */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Hiển thị {appointmentsResponse.results.length} / {appointmentsResponse.count} lịch hẹn
        </p>
        
        {appointmentsResponse.next && (
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {loading ? 'Đang tải...' : 'Tải thêm'}
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-600">{appointmentsResponse.count}</div>
          <div className="text-sm text-gray-600">Tổng lịch hẹn</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {appointments.filter(a => a.status === 'Hoàn thành').length}
          </div>
          <div className="text-sm text-gray-600">Đã hoàn thành</div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentList
