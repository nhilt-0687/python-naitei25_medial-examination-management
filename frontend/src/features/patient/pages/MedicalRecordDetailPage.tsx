"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  prescriptionService,
  type Prescription as PrescriptionType,
} from "../../../shared/services/prescriptionService"
import { appointmentService } from "../../../shared/services/appointmentService"
import { serviceService } from "../../../shared/services/serviceService"
import type { Appointment } from "../../../shared/types/appointment"
import type { MedicalService } from "../../../shared/types/service"
import {
  Heart,
  Activity,
  Droplets,
  Calendar,
  FileText,
  Stethoscope,
  TestTube,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"

interface PrescriptionDetail {
  id: number
  prescription: number
  medicine: {
    medicine_id: number
    medicine_name: string
  }
  dosage: string
  frequency: string
  duration: string
  prescription_notes: string | null
  quantity: number
  created_at: string
  unit?: string
}

const MedicalRecordDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<PrescriptionType | null>(null)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [serviceDetails, setServiceDetails] = useState<MedicalService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        const prescriptionData = await prescriptionService.getPrescriptionById(Number(id))
        console.log("Prescription Data:", prescriptionData)
        setRecord(prescriptionData)

        if (prescriptionData.appointment) {
          const appointmentData = await appointmentService.getAppointmentById(prescriptionData.appointment)
          console.log("Appointment Data:", appointmentData)
          setAppointment(appointmentData)
        } else {
          setError(t("medicalRecord.noAppointmentFound"))
        }
      } catch (err) {
        setError(t("common.error"))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, t])

  useEffect(() => {
    if (appointment && appointment.service_orders && appointment.service_orders.length > 0) {
      const fetchServices = async () => {
        try {
          console.log("Service Orders:", appointment.service_orders)
          const promises = appointment.service_orders.map((order) => serviceService.getServiceById(order.service_id))
          const details = await Promise.all(promises)
          console.log("Service Details:", details)
          const mappedDetails = details.map((detail) => ({
            id: detail.service_id,
            name: detail.service_name,
            category: detail.service_type,
            price: detail.price,
            createdAt: detail.created_at,
            description: detail.description || "",
            duration: detail.duration || 0,
            isActive: detail.is_active || true,
            updatedAt: detail.updated_at || detail.created_at,
          }))
          setServiceDetails(mappedDetails)
        } catch (err) {
          setError(t("medicalRecord.serviceFetchError"))
        }
      }

      fetchServices()
    }
  }, [appointment, t])

  if (loading) return <LoadingSpinner size="lg" message={t("common.loading")} />
  if (error) return <p>{error}</p>
  if (!record || !appointment) return <p>{t("medicalRecord.noData")}</p>

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{t("medicalRecord.title")}</h1>
          </div>
          <p className="text-gray-600 ml-15">{t("medicalRecord.subtitle")}</p>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{t("medicalRecord.medicalInfo")}</h2>
          </div>

          {/* Diagnosis */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">{t("medicalRecord.diagnosis")}</span>
            </div>
            <p className="text-green-900 font-medium">{record.diagnosis}</p>
          </div>

          {/* Vital Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">{t("medicalRecord.bloodPressure")}</span>
              </div>
              <p className="text-red-900 font-semibold">
                {record.systolic_blood_pressure}/{record.diastolic_blood_pressure} mmHg
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">{t("medicalRecord.heartRate")}</span>
              </div>
              <p className="text-blue-900 font-semibold">{record.heart_rate} bpm</p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">{t("medicalRecord.bloodSugar")}</span>
              </div>
              <p className="text-purple-900 font-semibold">{record.blood_sugar} mg/dL</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">{t("medicalRecord.createdAt")}</span>
              </div>
              <p className="text-gray-900 font-semibold">{formatDate(record.created_at)}</p>
            </div>
          </div>

          {/* Notes and Follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.note && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">{t("medicalRecord.note")}</span>
                </div>
                <p className="text-yellow-900">{record.note}</p>
              </div>
            )}

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">{t("medicalRecord.followUpDate")}</span>
              </div>
              <p className="text-gray-900 font-medium">
                {record.follow_up_date ? formatDate(record.follow_up_date) : t("medicalRecord.noData")}
              </p>
            </div>
          </div>
        </div>

        {/* Services and Results */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TestTube className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{t("medicalRecord.servicesAndResults")}</h2>
          </div>

          {appointment.service_orders && appointment.service_orders.length > 0 ? (
            <div className="space-y-4">
              {appointment.service_orders.map((order, index) => {
                const detail = serviceDetails[index] || {}
                const isCompleted = order.order_status === "completed" || order.status === "completed"

                return (
                  <div key={order.order_id || index} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isCompleted ? "bg-green-100" : "bg-orange-100"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {detail.name || detail.service_name || t("medicalRecord.noData")}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {detail.category || detail.service_type || t("medicalRecord.noData")}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isCompleted ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {order.order_status || order.status || t("medicalRecord.noData")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">{t("medicalRecord.price")}</p>
                        <p className="font-medium text-gray-900">{detail.price || t("medicalRecord.noData")}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">{t("medicalRecord.orderTime")}</p>
                        <p className="font-medium text-gray-900">
                          {order.order_time ? formatDate(order.order_time) : t("medicalRecord.noData")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">{t("medicalRecord.resultTime")}</p>
                        <p className="font-medium text-gray-900">
                          {order.result_time ? formatDate(order.result_time) : t("medicalRecord.noData")}
                        </p>
                      </div>
                    </div>

                    {order.result && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                        <p className="text-green-800 font-medium mb-1">{t("medicalRecord.result")}</p>
                        <p className="text-green-900">{order.result}</p>
                      </div>
                    )}

                    {order.result_file_url && (
                      <a
                        href={order.result_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t("medicalRecord.viewFile")}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TestTube className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">{t("medicalRecord.noServices")}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
          >
            {t("common.goBack")}
          </button>
          <Link
            to={`/patient/prescriptions/${record.id}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            {t("medicalRecord.viewPrescription")}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MedicalRecordDetailPage
