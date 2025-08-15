"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  XCircleIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
} from "lucide-react"
import { appointmentService } from "../../../shared/services/appointmentService"
import { paymentService } from "../../../shared/services/paymentService"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"
import type { Appointment } from "../../../shared/types/appointment"
import { mapAppointmentStatus } from "../../../shared/constants/enums"

type SortField = "date" | "doctor" | "status" | "price"
type SortOrder = "asc" | "desc"

const UpcomingAppointmentsPage: React.FC = () => {
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchUpcomingAppointments()
  }, [])

  const fetchUpcomingAppointments = async () => {
    try {
      setLoading(true)
      const data = await appointmentService.getUpcomingAppointments()
      setAppointments(data)
    } catch (err: any) {
      setError(err.message || t("upcomingAppointments.loadError"))
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort appointments
  const filteredAndSortedAppointments = useMemo(() => {
    const filtered = appointments.filter((appointment) => {
      const searchMatch =
        searchTerm === "" ||
        appointment.doctorInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorInfo?.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())

      const statusKey = mapAppointmentStatus(appointment.status).key
      const statusMatch = statusFilter === "all" || statusKey === statusFilter

      let dateMatch = true
      if (dateFilter !== "all") {
        const appointmentDate = new Date(appointment.schedule?.work_date || "")
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)

        switch (dateFilter) {
          case "today":
            dateMatch = appointmentDate.toDateString() === today.toDateString()
            break
          case "tomorrow":
            dateMatch = appointmentDate.toDateString() === tomorrow.toDateString()
            break
          case "week":
            dateMatch = appointmentDate >= today && appointmentDate <= nextWeek
            break
        }
      }

      return searchMatch && statusMatch && dateMatch
    })

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
          aValue = mapAppointmentStatus(a.status).key
          bValue = mapAppointmentStatus(b.status).key
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
  }, [appointments, searchTerm, statusFilter, dateFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAppointments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAndSortedAppointments.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter, sortField, sortOrder])

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!window.confirm(t("upcomingAppointments.confirmCancel"))) return
    try {
      setCancellingId(appointmentId)
      await appointmentService.cancelAppointment(appointmentId, t("upcomingAppointments.cancelReason"))
      await fetchUpcomingAppointments()
    } catch (err: any) {
      alert(t("upcomingAppointments.cancelError") + ": " + err.message)
    } finally {
      setCancellingId(null)
    }
  }

  const handlePayment = async (appointment: Appointment) => {
    try {
      const bill = await paymentService.createBillFromAppointment(appointment)
      const paymentLink = await paymentService.createPaymentLink(bill.id)
      window.open(paymentLink.checkoutUrl, "_blank")
    } catch (err: any) {
      alert(t("upcomingAppointments.paymentError") + ": " + err.message)
    }
  }

  const getStatusBadge = (statusCode: string) => {
    const { key, labelKey } = mapAppointmentStatus(statusCode)

    const statusConfig = {
      PENDING: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <AlertCircleIcon className="w-4 h-4" />,
      },
      CONFIRMED: {
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircleIcon className="w-4 h-4" />,
      },
      CANCELLED: {
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircleIcon className="w-4 h-4" />,
      },
      COMPLETED: {
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircleIcon className="w-4 h-4" />,
      },
      IN_PROGRESS: {
        className: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <ClockIcon className="w-4 h-4" />,
      },
      NO_SHOW: {
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <XCircleIcon className="w-4 h-4" />,
      },
      UNKNOWN: {
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <AlertCircleIcon className="w-4 h-4" />,
      },
    }

    const config = statusConfig[key as keyof typeof statusConfig]

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.icon}
        {t(labelKey)}
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

  const formatTime = (timeString: string) => {
    return timeString ? timeString.slice(0, 5) : ""
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

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push("...")
      if (totalPages > 1) pages.push(totalPages)
    }
    return pages
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          <LoadingSpinner size="lg" message={t("upcomingAppointments.loadingMessage")} />
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{t("upcomingAppointments.title")}</h1>
                <p className="text-gray-600">
                  {t("upcomingAppointments.subtitle", { count: filteredAndSortedAppointments.length })}
                </p>
              </div>
            </div>
            <Link
              to="/patient/book-appointment"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              {t("upcomingAppointments.bookNew")}
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
                  placeholder={t("upcomingAppointments.searchPlaceholder")}
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
              <span>{t("upcomingAppointments.filters")}</span>
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
                    {t("upcomingAppointments.statusFilter")}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t("upcomingAppointments.allStatuses")}</option>
                    <option value="P">{t("upcomingAppointments.pending")}</option>
                    <option value="C">{t("upcomingAppointments.confirmed")}</option>
                    <option value="I">{t("upcomingAppointments.inProgress")}</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("upcomingAppointments.timeFilter")}
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t("upcomingAppointments.allTimes")}</option>
                    <option value="today">{t("upcomingAppointments.today")}</option>
                    <option value="tomorrow">{t("upcomingAppointments.tomorrow")}</option>
                    <option value="week">{t("upcomingAppointments.thisWeek")}</option>
                  </select>
                </div>

                {/* Sort Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("upcomingAppointments.sortBy")}
                  </label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">{t("upcomingAppointments.appointmentDate")}</option>
                    <option value="doctor">{t("upcomingAppointments.doctorName")}</option>
                    <option value="status">{t("upcomingAppointments.status")}</option>
                    <option value="price">{t("upcomingAppointments.price")}</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("upcomingAppointments.sortOrder")}
                  </label>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    <span>
                      {sortOrder === "asc" ? t("upcomingAppointments.ascending") : t("upcomingAppointments.descending")}
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
            {t("upcomingAppointments.showing", {
              start: startIndex + 1,
              end: Math.min(endIndex, filteredAndSortedAppointments.length),
              total: filteredAndSortedAppointments.length,
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t("upcomingAppointments.itemsPerPage")}</span>
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
              <CalendarIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filteredAndSortedAppointments.length === 0
                ? t("upcomingAppointments.noAppointments")
                : t("upcomingAppointments.noResults")}
            </h3>
            <p className="text-gray-600 mb-6">
              {filteredAndSortedAppointments.length === 0
                ? t("upcomingAppointments.noAppointmentsText")
                : t("upcomingAppointments.noResultsText")}
            </p>
            {filteredAndSortedAppointments.length === 0 && (
              <Link
                to="/patient/book-appointment"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <CalendarIcon className="w-4 h-4" />
                {t("upcomingAppointments.bookAppointment")}
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
                                firstName: appointment.doctorInfo.fullName?.split(" ")[0],
                                lastName: appointment.doctorInfo.fullName?.split(" ").slice(1).join(" "),
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
                          <p className="text-xs text-gray-600">{t("upcomingAppointments.examDate")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatTime(appointment.slot_start || "")} - {formatTime(appointment.slot_end || "")}
                          </p>
                          <p className="text-xs text-gray-600">
                            {t("upcomingAppointments.shift")}:{" "}
                            {appointment.schedule?.shift === "M"
                              ? t("upcomingAppointments.morning")
                              : t("upcomingAppointments.afternoon")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg md:col-span-2">
                        <MapPinIcon className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{appointment.schedule?.location}</p>
                          <p className="text-xs text-gray-600">
                            {t("upcomingAppointments.floor")} {appointment.schedule?.floor},{" "}
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
                          {t("upcomingAppointments.symptoms")}:
                        </h4>
                        <p className="text-sm text-yellow-900">{appointment.symptoms}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {t("upcomingAppointments.bookedOn")}: {formatDateTime(appointment.createdAt)}
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
                    {t("upcomingAppointments.previous")}
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
                    {t("upcomingAppointments.next")}
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

export default UpcomingAppointmentsPage
