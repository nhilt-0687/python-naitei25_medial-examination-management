"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  XCircleIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  Eye,
  Search,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react"
import { appointmentService } from "../../../shared/services/appointmentService"
import { prescriptionService } from "../../../shared/services/prescriptionService"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"
import type { Appointment } from "../../../shared/types/appointment"

type SortField = "date" | "doctor" | "status" | "rating" | "price"
type SortOrder = "asc" | "desc"

const PastAppointmentsPage: React.FC = () => {
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set())

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [showFilters, setShowFilters] = useState(false)

  const navigate = useNavigate()

  const fetchPastAppointments = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch all past appointments without server-side filtering for client-side processing
      const data = await appointmentService.getMyAppointments(1, 1000, { status: "" })
      setAppointments(data?.content || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("pastAppointments.loadError")
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPastAppointments()
  }, [fetchPastAppointments])

  // Filter and sort appointments
  const filteredAndSortedAppointments = useMemo(() => {
    const filtered = appointments.filter((appointment) => {
      // Search filter
      const searchMatch =
        searchTerm === "" ||
        appointment.doctorInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorInfo?.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const statusMatch = statusFilter === "all" || appointment.status === statusFilter

      // Date filter
      let dateMatch = true
      if (dateFilter !== "all") {
        const appointmentDate = new Date(appointment.schedule?.work_date || "")
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

        dateMatch = appointmentDate >= filterDate
      }

      // Rating filter (for completed appointments)
      let ratingMatch = true
      if (ratingFilter !== "all" && appointment.status === "COMPLETED") {
        const rating = 4 // Mock rating, replace with actual rating from appointment
        switch (ratingFilter) {
          case "5":
            ratingMatch = rating === 5
            break
          case "4":
            ratingMatch = rating >= 4
            break
          case "3":
            ratingMatch = rating >= 3
            break
          case "low":
            ratingMatch = rating < 3
            break
        }
      }

      return searchMatch && statusMatch && dateMatch && ratingMatch
    })

    // Sort appointments
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "date":
          aValue = new Date(a.schedule?.work_date || "")
          bValue = new Date(b.schedule?.work_date || "")
          break
        case "doctor":
          aValue = a.doctorInfo?.fullName || ""
          bValue = b.doctorInfo?.fullName || ""
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "rating":
          aValue = a.status === "COMPLETED" ? 4 : 0 // Mock rating
          bValue = b.status === "COMPLETED" ? 4 : 0 // Mock rating
          break
        case "price":
          aValue = Number(a.doctorInfo?.price || 0)
          bValue = Number(b.doctorInfo?.price || 0)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [appointments, searchTerm, statusFilter, dateFilter, ratingFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAppointments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAndSortedAppointments.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter, ratingFilter, sortField, sortOrder])

  // Statistics
  const stats = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "COMPLETED").length
    const cancelled = appointments.filter((a) => a.status === "CANCELLED").length
    const totalCost = appointments
      .filter((a) => a.status === "COMPLETED")
      .reduce((sum, a) => sum + Number(a.doctorInfo?.price || 0), 0)

    return { completed, cancelled, totalCost }
  }, [appointments])

  const toggleNotes = (appointmentId: number) => {
    const newExpanded = new Set(expandedNotes)
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId)
    } else {
      newExpanded.add(appointmentId)
    }
    setExpandedNotes(newExpanded)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc") // Default to desc for past appointments (most recent first)
    }
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return t("common.invalidDate")

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    }).format(date)
  }

  const handleViewMedicalRecord = (prescriptionId?: number | null) => {
    if (!prescriptionId) return
    // Thêm query parameter để biết đến từ past appointments
    navigate(`/patient/medical-record/${prescriptionId}?from=past-appointments`)
  }

  const handleDownloadPrescription = async (prescriptionId?: number | null) => {
    if (!prescriptionId) {
      setError(t("pastAppointments.noPrescriptionError"))
      return
    }
    try {
      const pdfUrl = await prescriptionService.downloadPrescriptionPdf(prescriptionId)
      window.open(pdfUrl, "_blank")
    } catch (err) {
      console.error("Download PDF error:", err)
      setError(t("pastAppointments.downloadError"))
    }
  }

  const getStatusBadge = (backendStatus: string) => {
    const statusMap: Record<string, string> = {
      P: "PENDING",
      C: "CONFIRMED",
      I: "IN_PROGRESS",
      D: "COMPLETED",
      X: "CANCELLED",
      N: "NO_SHOW",
    }

    const fullStatus = statusMap[backendStatus] || "UNKNOWN"

    const statusConfig = {
      COMPLETED: {
        label: t("pastAppointments.statusCompleted"),
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircleIcon className="w-4 h-4" />,
      },
      CANCELLED: {
        label: t("pastAppointments.statusCancelled"),
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircleIcon className="w-4 h-4" />,
      },
      NO_SHOW: {
        label: t("pastAppointments.statusNoShow"),
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <XCircleIcon className="w-4 h-4" />,
      },
      PENDING: {
        label: t("pastAppointments.statusPending"),
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <AlertCircleIcon className="w-4 h-4" />,
      },
      CONFIRMED: {
        label: t("pastAppointments.statusConfirmed"),
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircleIcon className="w-4 h-4" />,
      },
      IN_PROGRESS: {
        label: t("pastAppointments.statusInProgress"),
        className: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <ClockIcon className="w-4 h-4" />,
      },
      UNKNOWN: {
        label: t("pastAppointments.statusUnknown"),
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <AlertCircleIcon className="w-4 h-4" />,
      },
    }

    const config = statusConfig[fullStatus as keyof typeof statusConfig]

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.icon}
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const renderStars = (rating = 0) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
          ) : (
            <StarOff key={star} className="w-4 h-4 text-gray-300" />
          ),
        )}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    )
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          <LoadingSpinner size="lg" message={t("pastAppointments.loadingMessage")} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{t("pastAppointments.title")}</h1>
                <p className="text-gray-600">
                  {t("pastAppointments.subtitle", { count: filteredAndSortedAppointments.length })}
                </p>
              </div>
            </div>
            <Link
              to="/patient/book-appointment"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              {t("pastAppointments.bookNew")}
            </Link>
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
                  placeholder={t("pastAppointments.searchPlaceholder")}
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
              <span>{t("pastAppointments.filters")}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("pastAppointments.statusFilter")}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t("pastAppointments.allStatuses")}</option>
                    <option value="COMPLETED">{t("pastAppointments.completed")}</option>
                    <option value="CANCELLED">{t("pastAppointments.cancelled")}</option>
                    <option value="NO_SHOW">{t("pastAppointments.noShow")}</option>
                    <option value="PENDING">{t("pastAppointments.statusPending")}</option>
                    <option value="CONFIRMED">{t("pastAppointments.statusConfirmed")}</option>
                    <option value="IN_PROGRESS">{t("pastAppointments.statusInProgress")}</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("pastAppointments.timeFilter")}
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t("pastAppointments.allTimes")}</option>
                    <option value="week">{t("pastAppointments.lastWeek")}</option>
                    <option value="month">{t("pastAppointments.lastMonth")}</option>
                    <option value="3months">{t("pastAppointments.last3Months")}</option>
                    <option value="6months">{t("pastAppointments.last6Months")}</option>
                    <option value="year">{t("pastAppointments.lastYear")}</option>
                  </select>
                </div>

                {/* Sort Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("pastAppointments.sortBy")}</label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">{t("pastAppointments.appointmentDate")}</option>
                    <option value="doctor">{t("pastAppointments.doctorName")}</option>
                    <option value="status">{t("pastAppointments.status")}</option>
                    <option value="rating">{t("pastAppointments.rating")}</option>
                    <option value="price">{t("pastAppointments.price")}</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("pastAppointments.sortOrder")}
                  </label>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    <span>
                      {sortOrder === "asc" ? t("pastAppointments.ascending") : t("pastAppointments.descending")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t("pastAppointments.showing", {
              start: startIndex + 1,
              end: Math.min(endIndex, filteredAndSortedAppointments.length),
              total: filteredAndSortedAppointments.length,
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t("pastAppointments.itemsPerPage")}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        {currentAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileTextIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filteredAndSortedAppointments.length === 0
                ? t("pastAppointments.noAppointments")
                : t("pastAppointments.noResults")}
            </h3>
            <p className="text-gray-600 mb-6">
              {filteredAndSortedAppointments.length === 0
                ? t("pastAppointments.noAppointmentsText")
                : t("pastAppointments.noResultsText")}
            </p>
            {filteredAndSortedAppointments.length === 0 && (
              <Link
                to="/patient/book-appointment"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <CalendarIcon className="w-4 h-4" />
                {t("pastAppointments.bookAppointment")}
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {appointment.doctorInfo?.avatar ? (
                            <img
                              src={appointment.doctorInfo.avatar || "/placeholder.svg"}
                              alt={t("common.doctorTitle", {
                                firstName: "BS.",
                                lastName: appointment.doctorInfo.fullName,
                              })}
                              className="w-12 h-12 object-cover"
                            />
                          ) : (
                            <UserIcon className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {t("common.doctorTitle", { firstName: "BS.", lastName: appointment.doctorInfo?.fullName })}
                          </h3>
                          <p className="text-sm text-gray-600">{appointment.doctorInfo?.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(appointment.status)}
                        <div className="text-lg font-semibold text-blue-600 mt-2">
                          {Number(appointment.doctorInfo?.price).toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.schedule?.work_date || "")}
                          </p>
                          <p className="text-xs text-gray-600">{t("pastAppointments.examDate")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatTime(appointment.slot_start || "")} - {formatTime(appointment.slot_end || "")}
                          </p>
                          <p className="text-xs text-gray-600">
                            {t("pastAppointments.shift")}:{" "}
                            {appointment.schedule?.shift === "M"
                              ? t("pastAppointments.morning")
                              : t("pastAppointments.afternoon")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg md:col-span-2">
                        <MapPinIcon className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{appointment.schedule?.location}</p>
                          <p className="text-xs text-gray-600">
                            {t("pastAppointments.floor")} {appointment.schedule?.floor},{" "}
                            {appointment.schedule?.building}
                            {appointment.schedule?.room_note && ` - ${appointment.schedule.room_note}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Symptoms */}
                    {appointment.symptoms && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">
                          {t("pastAppointments.initialSymptoms")}:
                        </h4>
                        <p className="text-sm text-yellow-900">{appointment.symptoms}</p>
                      </div>
                    )}

                    {/* Appointment Notes */}
                    {appointment.appointment_notes && appointment.appointment_notes.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => toggleNotes(appointment.id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                        >
                          <FileTextIcon className="w-4 h-4" />
                          <span>
                            {expandedNotes.has(appointment.id)
                              ? t("pastAppointments.hideResults")
                              : t("pastAppointments.viewResults")}{" "}
                            {t("pastAppointments.examResults")} ({appointment.appointment_notes.length})
                          </span>
                          {expandedNotes.has(appointment.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {expandedNotes.has(appointment.id) && (
                          <div className="mt-3 space-y-2">
                            {appointment.appointment_notes.map((note) => (
                              <div key={note.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-blue-600">
                                    {note.note_type === "DIAGNOSIS"
                                      ? t("pastAppointments.diagnosis")
                                      : note.note_type === "PRESCRIPTION"
                                        ? t("pastAppointments.prescription")
                                        : t("pastAppointments.note")}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(note.createdAt).toLocaleString("vi-VN")}
                                  </span>
                                </div>
                                <p className="text-sm text-blue-900">{note.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rating for completed appointments */}
                    {appointment.status === "COMPLETED" && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 mb-2">
                          {t("pastAppointments.appointmentRating")}:
                        </h4>
                        {renderStars(4)}
                        <p className="text-xs text-green-700 mt-1">{t("pastAppointments.thankYou")}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      {appointment.createdAt && (
                        <div className="text-xs text-gray-500">
                          {t("pastAppointments.bookedOn")}: {formatDateTime(appointment.createdAt)}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {appointment.status === "COMPLETED" && (
                          <>
                            <button className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium">
                              {t("pastAppointments.rate")}
                            </button>
                            <Link
                              to={`/patient/doctors/${appointment.doctorId}/book`}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                            >
                              {t("pastAppointments.bookAgain")}
                            </Link>
                          </>
                        )}

                        {appointment.status === "CANCELLED" && (
                          <Link
                            to={`/patient/doctors/${appointment.doctorId}/book`}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                          >
                            {t("pastAppointments.bookAgain")}
                          </Link>
                        )}

                        {appointment.prescriptionId && (
                          <>
                            <button
                              onClick={() => handleViewMedicalRecord(appointment.prescriptionId)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              {t("pastAppointments.viewMedicalRecord")}
                            </button>
                          </>
                        )}
                      </div>
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
                    {t("pastAppointments.previous")}
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
                    {t("pastAppointments.next")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PastAppointmentsPage
