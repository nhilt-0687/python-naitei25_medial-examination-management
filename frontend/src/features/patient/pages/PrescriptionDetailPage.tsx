"use client"

import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { prescriptionService } from "../../../shared/services/prescriptionService"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"
import ErrorMessage from "../../../shared/components/common/ErrorMessage"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Pill,
  Download,
  Calendar,
  Stethoscope,
  Clock,
  Hash,
  Droplets,
  FileText,
  AlertCircle,
  Info,
  Package,
  Timer,
  Scale,
  StickyNote,
  PrinterIcon as Print,
  Share2,
} from "lucide-react"

interface PrescriptionDetail {
  id: number
  prescription: number
  medicine: { medicine_id: number; medicine_name: string }
  dosage: string
  frequency: string
  duration: string
  quantity: number
  prescription_notes?: string
  created_at: string
  unit?: string
}

interface Prescription {
  id: number
  diagnosis: string
  created_at: string
  prescription_details: PrescriptionDetail[]
}

const PrescriptionDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [prescription, setPrescription] = React.useState<Prescription | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchPrescription = async () => {
      if (!id) {
        setError(t("common.noPrescriptionId"))
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await prescriptionService.getPrescriptionById(Number(id))
        console.log("Prescription Data:", data)
        setPrescription(data)
      } catch (err: any) {
        setError(err.message || t("common.error"))
      } finally {
        setLoading(false)
      }
    }
    fetchPrescription()
  }, [id, t])

  const handleBack = () => navigate(-1)
  const handleDownloadPdf = async () => {
    if (!id) return
    try {
      const pdfUrl = await prescriptionService.downloadPrescriptionPdf(Number(id))
      window.open(pdfUrl, "_blank")
    } catch (err) {
      setError(t("common.downloadFailed"))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("prescriptionDetail.shareTitle", { id: prescription?.id }),
          text: t("prescriptionDetail.shareText", { id: prescription?.id }),
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert(t("prescriptionDetail.linkCopied"))
    }
  }

  if (loading) return <LoadingSpinner size="lg" message={t("common.loading")} />
  if (error) return <ErrorMessage message={error} />
  if (!prescription) return <ErrorMessage message={t("common.noData")} />

  return (
    <div className="min-h-screen">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t("common.goBack")}</span>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>{t("common.downloadPdf")}</span>
            </Button>
          </div>
        </div>

        {/* Prescription Header */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {t("prescriptionDetail.prescriptionTitle", { id: prescription.id })}
                </h1>
                <p className="text-blue-100 mt-1">{t("prescriptionDetail.prescriptionSubtitle")}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Diagnosis */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-900">{t("prescriptionDetail.diagnosis")}</h3>
                </div>
                <p className="text-blue-800 font-medium leading-relaxed">
                  {prescription.diagnosis || t("prescriptionDetail.noDiagnosis")}
                </p>
              </div>

              {/* Date & Summary */}
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-900">{t("prescriptionDetail.prescriptionDate")}</h3>
                  </div>
                  <p className="text-green-800 font-medium">
                    {new Date(prescription.created_at).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-900">{t("prescriptionDetail.overview")}</h3>
                  </div>
                  <p className="text-purple-800 font-medium">
                    {t("prescriptionDetail.medicineCount", { count: prescription.prescription_details.length })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">{t("prescriptionDetail.importantNotice")}</h3>
              <p className="text-amber-800 text-sm leading-relaxed">{t("prescriptionDetail.importantNoticeText")}</p>
            </div>
          </div>
        </div>

        {/* Medicine List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t("prescriptionDetail.medicineListTitle")}</h2>
                <p className="text-green-100 mt-1">{t("prescriptionDetail.medicineListSubtitle")}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {prescription.prescription_details.length > 0 ? (
              <div className="space-y-6">
                {prescription.prescription_details.map((detail, index) => (
                  <div
                    key={detail.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    {/* Medicine Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{detail.medicine.medicine_name}</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {t("prescriptionDetail.medicineCode")}: {detail.medicine.medicine_id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {t("prescriptionDetail.medicineNumber", { number: index + 1 })}
                        </div>
                      </div>
                    </div>

                    {/* Medicine Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Dosage */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-900">{t("prescriptionDetail.dosage")}</span>
                        </div>
                        <p className="text-red-800 font-bold text-lg">
                          {detail.dosage || t("prescriptionDetail.notSpecified")}
                        </p>
                      </div>

                      {/* Frequency */}
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900">
                            {t("prescriptionDetail.frequency")}
                          </span>
                        </div>
                        <p className="text-orange-800 font-bold text-lg">
                          {detail.frequency || t("prescriptionDetail.notSpecified")}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Timer className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">{t("prescriptionDetail.duration")}</span>
                        </div>
                        <p className="text-green-800 font-bold text-lg">
                          {detail.duration || t("prescriptionDetail.notSpecified")}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">
                            {t("prescriptionDetail.quantity")}
                          </span>
                        </div>
                        <p className="text-purple-800 font-bold text-lg">
                          {detail.quantity} {detail.unit || t("prescriptionDetail.unit")}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Unit */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{t("prescriptionDetail.unit")}</span>
                        </div>
                        <p className="text-gray-800 font-medium">
                          {detail.unit || t("prescriptionDetail.notSpecified")}
                        </p>
                      </div>

                      {/* Notes */}
                      {detail.prescription_notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <StickyNote className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-900">
                              {t("prescriptionDetail.specialNotes")}
                            </span>
                          </div>
                          <p className="text-yellow-800 font-medium leading-relaxed">{detail.prescription_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Usage Instructions */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {t("prescriptionDetail.usageInstructions")}
                        </span>
                      </div>
                      <div className="text-blue-800 text-sm space-y-1">
                        <p>
                          • {t("prescriptionDetail.dosageLabel")}: {detail.dosage}
                        </p>
                        <p>
                          • {t("prescriptionDetail.frequencyLabel")}: {detail.frequency}
                        </p>
                        <p>
                          • {t("prescriptionDetail.durationLabel")}: {detail.duration}
                        </p>
                        <p>
                          • {t("prescriptionDetail.totalQuantityLabel")}: {detail.quantity} {detail.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Pill className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("prescriptionDetail.noMedicines")}</h3>
                <p className="text-gray-600">{t("prescriptionDetail.noMedicinesText")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600 text-sm">
              {t("prescriptionDetail.createdOn", {
                date: new Date(prescription.created_at).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }),
              })}
            </p>
            <p className="text-gray-500 text-xs">{t("prescriptionDetail.keepPrescription")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionDetailPage
