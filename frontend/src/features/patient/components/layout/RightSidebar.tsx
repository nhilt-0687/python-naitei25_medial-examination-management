"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { useApi } from "../../hooks/useApi"
import { patientApiService } from "../../services/patientApiService"

const RightSidebar: React.FC = () => {
  const navigate = useNavigate()
  
  // Sử dụng API thực tế
  const { data: specialties, loading: specialtiesLoading } = useApi(() => patientApiService.getFeaturedSpecialties(), [])
  const { data: doctors, loading: doctorsLoading } = useApi(() => patientApiService.getFeaturedDoctors(), [])
  const { data: upcomingAppointment, loading: appointmentLoading } = useApi(() => 
    patientApiService.getUpcomingAppointments().then(appointments => appointments[0] || null), []
  )

  const displaySpecialties = specialties?.slice(0, 4) || []
  const featuredDoctors = doctors?.slice(0, 2) || []

  return (
    <aside className="w-80 p-6 bg-white border-l border-gray-200 min-h-screen sticky top-16">
      {/* Specialties Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Các chuyên khoa</h3>
          <button 
            onClick={() => navigate("/find-doctors")} 
            className="text-cyan-500 text-sm hover:underline"
          >
            Tất cả
          </button>
        </div>
        
        {specialtiesLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displaySpecialties.map((specialty) => (
              <div
                key={specialty.id}
                onClick={() => navigate(`/find-doctors?specialty=${specialty.name}`)}
                className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-cyan-600 text-sm font-medium">
                    {specialty.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{specialty.name}</p>
                  <p className="text-xs text-gray-500">{specialty.doctorCount} bác sĩ</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Doctors Section */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Bác sĩ nổi bật</h3>
        
        {doctorsLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-lg">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {featuredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => navigate(`/doctors/${doctor.id}`)}
                className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {doctor.avatar ? (
                    <img 
                      src={doctor.avatar || "/placeholder.svg"} 
                      alt={doctor.user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-medium">
                      {doctor.user.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{doctor.user.fullName}</p>
                  <p className="text-xs text-blue-600">{doctor.specialization}</p>
                  <p className="text-xs text-gray-500">{doctor.experience} năm kinh nghiệm</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointment Section */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Lịch hẹn gần nhất</h3>
        
        {appointmentLoading ? (
          <div className="animate-pulse">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
                <div className="w-20 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ) : upcomingAppointment ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {upcomingAppointment.doctor.user.fullName}
                </p>
                <p className="text-xs text-blue-600">
                  {upcomingAppointment.doctor.specialization}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {upcomingAppointment.appointmentTime} - {new Date(upcomingAppointment.appointmentDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => navigate("/appointments")}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md transition-colors"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Không có lịch hẹn nào</p>
            <button
              onClick={() => navigate("/find-doctors")}
              className="mt-2 text-cyan-500 text-sm hover:underline"
            >
              Đặt lịch ngay
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default RightSidebar
