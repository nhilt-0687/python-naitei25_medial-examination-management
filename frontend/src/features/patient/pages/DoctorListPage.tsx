"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import DoctorCard from "../components/common/DoctorCard"
import { useApi } from "../hooks/useApi"
import { patientApiService } from "../services/patientApiService"
import type { Doctor } from "../../../shared/types"

const DoctorListPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const specialty = searchParams.get('specialty')
  const query = searchParams.get('q')
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let result: Doctor[]
        
        if (specialty) {
          result = await patientApiService.searchDoctors('', specialty)
        } else if (query) {
          result = await patientApiService.searchDoctors(query)
        } else {
          result = await patientApiService.getDoctors()
        }
        
        setDoctors(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [specialty, query])

  const handleDoctorClick = (doctorId: number) => {
    navigate(`/doctors/${doctorId}/book`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải danh sách bác sĩ...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <p className="mb-2">Lỗi: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const title = specialty ? `Bác sĩ ${specialty}` : query ? `Kết quả tìm kiếm: "${query}"` : 'Danh sách bác sĩ'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{doctors.length} bác sĩ</p>
      </div>

      {/* Doctors List */}
      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onClick={() => handleDoctorClick(doctor.id)}
              showDetails={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">Không tìm thấy bác sĩ nào.</p>
        </div>
      )}
    </div>
  )
}

export default DoctorListPage
