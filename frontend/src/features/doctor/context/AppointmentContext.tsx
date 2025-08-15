"use client"

import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"
import { message } from "antd"
import { appointmentService, type AppointmentQueryParams } from "../services/appointmentService"
import type { Appointment, AppointmentFilters, AppointmentStats } from "../types/appointment"
import dayjs from "dayjs"

const statusMap: { [key: string]: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" } = {
    P: "PENDING",
    C: "CONFIRMED",
    D: "COMPLETED",
    X: "CANCELLED"
}

export interface PaginatedResponse<T> {
    content: T[]
    pageNo: number
    pageSize: number
    totalElements: number
    totalPages: number
    last: boolean
}

interface AppointmentContextType {
    // Data
    appointments: Appointment[]
    paginatedData: PaginatedResponse<Appointment>
    stats: AppointmentStats
    filters: AppointmentFilters

    // Loading states
    loading: boolean
    error: string | null

    // Actions
    updateFilters: (newFilters: Partial<AppointmentFilters>) => void
    updatePagination: (page: number, size?: number) => void
    clearDateFilter: () => void
    setTodayFilter: () => void
    refreshAppointments: () => Promise<void>
    updateAppointmentStatus: (appointmentId: number, status: string) => Promise<void>

    // Cache management
    clearCache: () => void
    isDataStale: () => boolean
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined)

interface AppointmentProviderProps {
    children: ReactNode
}

export const AppointmentProvider: React.FC<AppointmentProviderProps> = ({ children }) => {
    // Data states
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Appointment>>({
        content: [],
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
    })

    // Filter and pagination states
    const [filters, setFilters] = useState<AppointmentFilters>({
        work_date: dayjs().format("YYYY-MM-DD"),
    })

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
    })

    // Loading states
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Cache management
    const lastFetchTime = useRef<number>(0)
    const cacheTimeout = 5 * 60 * 1000 // 5 minutes
    const isInitialized = useRef(false)

    // Check if data is stale
    const isDataStale = useCallback(() => {
        return Date.now() - lastFetchTime.current > cacheTimeout
    }, [])

    // Fetch appointments from API
    const fetchAppointments = useCallback(
        async (force = false) => {
            if (!force && !isDataStale() && isInitialized.current) {
                return
            }

            try {
                setLoading(true)
                setError(null)

                const queryParams: AppointmentQueryParams = {
                    page: pagination.page + 1,
                    size: pagination.size,
                }

                if (filters.work_date) {
                    queryParams.work_date = filters.work_date
                }
                if (filters.appointmentStatus && filters.appointmentStatus !== "all") {
                    queryParams.appointmentStatus = filters.appointmentStatus
                }
                if (filters.shift) {
                    queryParams.shift = filters.shift
                }
                if (filters.roomId) {
                    queryParams.roomId = filters.roomId
                }

                const response = await appointmentService.getAppointments(queryParams)

                // Map the status to appointmentStatus
                const mappedAppointments = response.content.map((apt, index) => ({
                    ...apt,
                    number: index + 1, // Assign sequential number starting from 1
                    appointmentStatus: statusMap[apt.status] || apt.status,
                    appointmentId: apt.id || apt.appointmentId,
                }))

                setPaginatedData({ ...response, content: mappedAppointments })
                setAppointments(mappedAppointments)

                lastFetchTime.current = Date.now()
                isInitialized.current = true
            } catch (err) {
                console.error("Fetch Error Details:", err)
                const errorMessage = err instanceof Error ? err.message : "Không thể tải danh sách lịch hẹn"
                setError(errorMessage)
                message.error(errorMessage)
            } finally {
                setLoading(false)
            }
        },
        [pagination, filters, isDataStale],
    )

    // Apply additional client-side filters (for search term, gender, etc.)
    const filteredAppointments = React.useMemo(() => {
        return appointments.filter((appointment) => {
            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase()
                const symptomsMatch = appointment.symptoms?.toLowerCase().includes(searchLower) || false
                const nameMatch = appointment.patientInfo?.fullName?.toLowerCase().includes(searchLower) || false
                if (!symptomsMatch && !nameMatch) {
                    return false
                }
            }
            return true
        })
    }, [appointments, filters])

    // Calculate stats
    const stats = React.useMemo((): AppointmentStats => {
        return filteredAppointments.reduce(
            (stats, appointment) => {
                stats.total++
                switch (appointment.appointmentStatus) {
                    case "PENDING":
                        stats.pending++
                        break
                    case "CONFIRMED":
                        stats.confirmed++
                        break
                    case "COMPLETED":
                        stats.completed++
                        break
                    case "CANCELLED":
                        stats.cancelled++
                        break
                    case "PENDING_TEST_RESULT":
                        stats.pendingTestResult = (stats.pendingTestResult || 0) + 1
                        break
                    case "IN_PROGRESS":
                        stats.inProgress = (stats.inProgress || 0) + 1
                        break
                }
                return stats
            },
            {
                total: 0,
                pending: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0,
                pendingTestResult: 0,
                inProgress: 0,
            },
        )
    }, [filteredAppointments])

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<AppointmentFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }))
        setPagination((prev) => ({ ...prev, page: 0 }))
    }, [])

    // Update pagination
    const updatePagination = useCallback(
        (page: number, size?: number) => {
            const newPagination = {
                page: page - 1, // Convert from 1-based to 0-based
                size: size || pagination.size,
            }
            setPagination(newPagination)
        },
        [pagination.size],
    )

    // Clear date filter
    const clearDateFilter = useCallback(() => {
        setFilters((prev) => {
            const { work_date, ...rest } = prev
            return rest
        })
    }, [])

    // Set today filter
    const setTodayFilter = useCallback(() => {
        updateFilters({ work_date: dayjs().format("YYYY-MM-DD") })
    }, [updateFilters])

    // Refresh appointments (force fetch)
    const refreshAppointments = useCallback(async () => {
        await fetchAppointments(true)
    }, [fetchAppointments])

    // Update appointment status
    const updateAppointmentStatus = useCallback(async (appointmentId: number, status: string) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, status)
            message.success("Cập nhật trạng thái thành công")
            setAppointments((prev) =>
                prev.map((apt) => (apt.appointmentId === appointmentId ? { ...apt, appointmentStatus: status } : apt)),
            )
        } catch (error) {
            console.error("Error updating appointment status:", error)
            message.error("Không thể cập nhật trạng thái")
        }
    }, [])

    // Clear cache
    const clearCache = useCallback(() => {
        setAppointments([])
        setPaginatedData({
            content: [],
            pageNo: 0,
            pageSize: 10,
            totalElements: 0,
            totalPages: 0,
            last: true,
        })
        lastFetchTime.current = 0
        isInitialized.current = false
    }, [])

    // Auto-fetch when filters or pagination changes
    React.useEffect(() => {
        fetchAppointments()
    }, [filters, pagination])

    // Initial fetch
    React.useEffect(() => {
        if (!isInitialized.current) {
            fetchAppointments()
        }
    }, [fetchAppointments])

    const contextValue: AppointmentContextType = {
        appointments: filteredAppointments,
        paginatedData,
        stats,
        filters,
        loading,
        error,
        updateFilters,
        updatePagination,
        clearDateFilter,
        setTodayFilter,
        refreshAppointments,
        updateAppointmentStatus,
        clearCache,
        isDataStale,
    }

    return <AppointmentContext.Provider value={contextValue}>{children}</AppointmentContext.Provider>
}

export const useAppointmentContext = () => {
    const context = useContext(AppointmentContext)
    if (context === undefined) {
        throw new Error("useAppointmentContext must be used within an AppointmentProvider")
    }
    return context
}
