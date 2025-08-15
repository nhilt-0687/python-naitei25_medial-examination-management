"use client"

import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { prescriptionService } from "../../../shared/services/prescriptionService"
import { patientService } from "../../../shared/services/patientService"
import { useAuth } from "../../../shared/context/AuthContext"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"
import ErrorMessage from "../../../shared/components/common/ErrorMessage"
import {
  FileText,
  Download,
  Calendar,
  Stethoscope,
  Pill,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  Package,
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
  created_at: string
  diagnosis: string
  prescription_details: PrescriptionDetail[]
}

type SortField = "date" | "diagnosis" | "medicineCount" | "id"
type SortOrder = "asc" | "desc"

const PrescriptionsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getCurrentUserId } = useAuth()

  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(12)

  // Search and filter state
  const [searchTerm, setSearchTerm] = React.useState("")
  const [dateFilter, setDateFilter] = React.useState<string>("all")
  const [medicineCountFilter, setMedicineCountFilter] = React.useState<string>("all")
  const [sortField, setSortField] = React.useState<SortField>("date")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc")
  const [showFilters, setShowFilters] = React.useState(false)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = getCurrentUserId()
        if (!userId) {
          setError(t("common.noUserId"))
          setLoading(false)
          return
        }
        setLoading(true)
        const patient = await patientService.getPatientByUserId(userId)
        const data = await prescriptionService.getPrescriptionsByPatient(patient.id)
        console.log("Prescriptions Data:", data)
        setPrescriptions(data)
      } catch (err: any) {
        setError(err.message || t("common.error"))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [getCurrentUserId, t])

  // Filter and sort prescriptions
  const filteredAndSortedPrescriptions = useMemo(() => {
    const filtered = prescriptions.filter((prescription) => {
      // Search filter
      const searchMatch =
        searchTerm === "" ||
        prescription.id.toString().includes(searchTerm) ||
        prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescription_details.some((detail) =>
          detail.medicine.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      // Date filter
      let dateMatch = true
      if (dateFilter !== "all") {
        const prescriptionDate = new Date(prescription.created_at)
        const today = new Date()
        const filterDate = new Date(today)

        switch (dateFilter) {
          case "week":
            filterDate.setDate(today.getDate() - 7)
            break
          case "month":
            filterDate.setMonth(today.getMonth() - 1)
            break
          case "3months":
            filterDate.setMonth(today.getMonth() - 3)
            break
          case "6months":
            filterDate.setMonth(today.getMonth() - 6)
            break
          case "year":
            filterDate.setFullYear(today.getFullYear() - 1)
            break
        }

        dateMatch = prescriptionDate >= filterDate
      }

      // Medicine count filter
      let medicineCountMatch = true
      if (medicineCountFilter !== "all") {
        const count = prescription.prescription_details.length
        switch (medicineCountFilter) {
          case "1":
            medicineCountMatch = count === 1
            break
          case "2-3":
            medicineCountMatch = count >= 2 && count <= 3
            break
          case "4-5":
            medicineCountMatch = count >= 4 && count <= 5
            break
          case "6+":
            medicineCountMatch = count >= 6
            break
        }
      }

      return searchMatch && dateMatch && medicineCountMatch
    })

    // Sort prescriptions
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "date":
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case "diagnosis":
          aValue = a.diagnosis || ""
          bValue = b.diagnosis || ""
          break
        case "medicineCount":
          aValue = a.prescription_details.length
          bValue = b.prescription_details.length
          break
        case "id":
          aValue = a.id
          bValue = b.id
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [prescriptions, searchTerm, dateFilter, medicineCountFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPrescriptions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPrescriptions = filteredAndSortedPrescriptions.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, dateFilter, medicineCountFilter, sortField, sortOrder])

  // Statistics
  const stats = useMemo(() => {
    const totalPrescriptions = prescriptions.length
    const totalMedicines = prescriptions.reduce((sum, p) => sum + p.prescription_details.length, 0)
    const avgMedicinesPerPrescription = totalPrescriptions > 0 ? (totalMedicines / totalPrescriptions).toFixed(1) : 0
    const recentPrescriptions = prescriptions.filter((p) => {
      const prescriptionDate = new Date(p.created_at)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return prescriptionDate >= monthAgo
    }).length

    return { totalPrescriptions, totalMedicines, avgMedicinesPerPrescription, recentPrescriptions }
  }, [prescriptions])

  const handleViewDetails = (id: number) => {
    navigate(`/patient/prescriptions/${id}`)
  }

  const handleDownloadPdf = async (id: number) => {
    try {
      const pdfUrl = await prescriptionService.downloadPrescriptionPdf(id)
      window.open(pdfUrl, "_blank")
    } catch (err) {
      setError(t("common.downloadFailed"))
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleViewMedicalRecord = (prescriptionId: number) => {
    // Thêm query parameter để biết đến từ prescriptions
    navigate(`/patient/medical-record/${prescriptionId}?from=prescriptions`)
  }

  if (loading) return <LoadingSpinner size="lg" message={t("common.loading")} />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="min-h-screen">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{t("prescriptions.title")}</h1>
              <p className="text-gray-600">
                {t("prescriptions.subtitle", { count: filteredAndSortedPrescriptions.length })}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t("prescriptions.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>{t("prescriptions.filters")}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("prescriptions.timeFilter")}
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t("prescriptions.allTimes")}</option>
                    <option value="week">{t("prescriptions.lastWeek")}</option>
                    <option value="month">{t("prescriptions.lastMonth")}</option>
                    <option value="3months">{t("prescriptions.last3Months")}</option>
                    <option value="6months">{t("prescriptions.last6Months")}</option>
                    <option value="year">{t("prescriptions.lastYear")}</option>
                  </select>
                </div>

                {/* Medicine Count Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("prescriptions.medicineCountFilter")}
                  </label>
                  <select
                    value={medicineCountFilter}
                    onChange={(e) => setMedicineCountFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t("prescriptions.allCounts")}</option>
                    <option value="1">{t("prescriptions.oneType")}</option>
                    <option value="2-3">{t("prescriptions.twoToThreeTypes")}</option>
                    <option value="4-5">{t("prescriptions.fourToFiveTypes")}</option>
                    <option value="6+">{t("prescriptions.sixPlusTypes")}</option>
                  </select>
                </div>

                {/* Sort Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("prescriptions.sortBy")}</label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">{t("prescriptions.createdDate")}</option>
                    <option value="diagnosis">{t("prescriptions.diagnosis")}</option>
                    <option value="medicineCount">{t("prescriptions.medicineCount")}</option>
                    <option value="id">{t("prescriptions.prescriptionId")}</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("prescriptions.sortOrder")}</label>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    <span>{sortOrder === "asc" ? t("prescriptions.ascending") : t("prescriptions.descending")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t("prescriptions.showing", {
              start: startIndex + 1,
              end: Math.min(endIndex, filteredAndSortedPrescriptions.length),
              total: filteredAndSortedPrescriptions.length,
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t("prescriptions.itemsPerPage")}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {currentPrescriptions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {t("prescriptions.prescriptionNumber", { id: prescription.id })}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <Package className="w-3 h-3" />
                        {prescription.prescription_details.length}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{t("prescriptions.createdOn")}</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(prescription.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <Stethoscope className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-gray-600">{t("prescriptions.diagnosisLabel")}</span>
                          <p className="text-gray-900 font-medium mt-1 line-clamp-2">
                            {prescription.diagnosis || t("prescriptions.noDiagnosis")}
                          </p>
                        </div>
                      </div>

                      {/* Medicine Preview */}
                      <div className="flex items-start gap-2 text-sm">
                        <Pill className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-gray-600">{t("prescriptions.medicinesLabel")}</span>
                          <div className="mt-1 space-y-1">
                            {prescription.prescription_details.slice(0, 2).map((detail, index) => (
                              <p key={index} className="text-gray-900 text-xs truncate">
                                • {detail.medicine.medicine_name}
                              </p>
                            ))}
                            {prescription.prescription_details.length > 2 && (
                              <p className="text-gray-500 text-xs">
                                {t("prescriptions.moreTypes", { count: prescription.prescription_details.length - 2 })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewDetails(prescription.id)}
                        className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                      >
                        {t("prescriptions.viewDetails")}
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(prescription.id)}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                        title={t("prescriptions.downloadPdf")}
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleViewMedicalRecord(prescription.id)}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                        title={t("prescriptions.viewMedicalRecord")}
                      >
                        <Stethoscope className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-1 bg-white rounded-lg shadow-sm border p-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {t("prescriptions.previous")}
                  </button>

                  <div className="flex space-x-1">
                    {getPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <span key={index} className="px-3 py-2 text-sm text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(page as number)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            currentPage === page ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {t("prescriptions.next")}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filteredAndSortedPrescriptions.length === 0
                ? t("prescriptions.noPrescriptions")
                : t("prescriptions.noResults")}
            </h3>
            <p className="text-gray-600">
              {filteredAndSortedPrescriptions.length === 0
                ? t("prescriptions.noPrescriptionsText")
                : t("prescriptions.noResultsText")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PrescriptionsPage
