"use client"

import type React from "react"
import { useState } from "react"
import { Table, Input, DatePicker, Button, Avatar, Space, Card, Select, Tooltip, Empty, Tag } from "antd"
import {
    EditOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    ClearOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    UserOutlined,
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { useAppointmentContext } from "../../context/AppointmentContext"
import { useTranslation } from "react-i18next"
import { getAppointmentStatusColor } from "../../services/appointmentService"
import type { Appointment } from "../../types/appointment"
import dayjs, { type Dayjs } from "dayjs"

const { Search } = Input
const { Option } = Select

const Patient: React.FC = () => {
    const { t } = useTranslation()
    const [localSearch, setLocalSearch] = useState("")
    const navigate = useNavigate()

    const {
        appointments,
        paginatedData,
        loading,
        error,
        stats,
        filters,
        updateFilters,
        updatePagination,
        clearDateFilter,
        setTodayFilter,
        refreshAppointments,
    } = useAppointmentContext()

    // Handle viewing patient details
    const handleViewPatient = (id: number) => {
        navigate(`/doctor/examination/patient/detail`, { state: { appointmentId: id } })
    }

    // Handle refresh action
    const handleRefresh = () => {
        refreshAppointments()
    }

    // Handle date filter change
    const handleDateChange = (date: Dayjs | null, dateString: string | string[]) => {
        if (date) {
            const isoDate = date.format("YYYY-MM-DD")
            console.log("Updating date filter:", isoDate)
            updateFilters({ work_date: isoDate })
        } else {
            console.log("Clearing date filter")
            updateFilters({ work_date: undefined })
        }
    }

    // Handle shift filter change
    const handleShiftFilterChange = (value: string) => {
        console.log("Updating shift filter:", value)
        updateFilters({ shift: value === "all" ? undefined : value })
    }

    // Handle status filter change
    const handleStatusFilterChange = (value: string) => {
        console.log("Updating status filter:", value)
        updateFilters({ appointmentStatus: value === "all" ? undefined : value })
    }

    // Handle local search change
    const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearch(e.target.value)
    }

    // Handle clearing all filters
    const handleClearFilters = () => {
        // Clear date
        clearDateFilter()
        // Reset shift and status to 'all' by unsetting their values
        updateFilters({ shift: undefined, appointmentStatus: undefined })
        // Clear local search input
        setLocalSearch("")
    }

    // Get status badge with color
    const getStatusBadge = (appointmentStatus: string) => {
        const { color, bgColor } = getAppointmentStatusColor(appointmentStatus)
        return (
            <Tag
                color={color}
                style={{
                    color,
                    backgroundColor: bgColor,
                    border: `1px solid ${color}`,
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 500,
                }}
            >
                {t(`status.${appointmentStatus.toLowerCase()}`)}
            </Tag>
        )
    }

    // Get shift label using translation
    const getShiftLabel = (shift: string) => {
        const shiftLabels = {
            M: t("shifts.morning"),
            A: t("shifts.afternoon"),
            E: t("shifts.evening"),
            N: t("shifts.night"),
        }
        return shiftLabels[shift as keyof typeof shiftLabels] || shift
    }

    // Filter appointments based on local search
    const filteredAppointments = appointments.filter((appointment) => {
        if (!localSearch) return true
        const searchLower = localSearch.toLowerCase()
        return (
            appointment.patientInfo?.first_name?.toLowerCase().includes(searchLower) ||
            appointment.patientInfo?.last_name?.toLowerCase().includes(searchLower) ||
            appointment.patientInfo?.phoneNumber?.includes(searchLower) ||
            appointment.patientInfo?.id?.toString().includes(searchLower)
        )
    })

    // Define table columns
    const columns = [
        {
            title: t("table.no"),
            dataIndex: "number",
            key: "number",
            width: 70,
            render: (number: number) => <span style={{ fontWeight: 500, color: "#6b7280" }}>
                {number !== undefined ? number : "-"}
            </span>
        },
        {
            title: t("table.patient"),
            dataIndex: "patientInfo",
            key: "patientInfo",
            render: (patientInfo: any, record: Appointment) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        src={
                            patientInfo?.avatar ||
                            "https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-440x512-ni4kvfm4.png"
                        }
                        size={48}
                        style={{ marginRight: 12, border: "2px solid #f0f9ff" }}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <div style={{ fontWeight: 600, color: "#111827", marginBottom: "2px" }}>
                            {patientInfo
                                ? `${patientInfo.first_name || ""} ${patientInfo.last_name || ""}`.trim() || t("table.noInformation")
                                : t("table.noInformation")}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{patientInfo?.phoneNumber || "N/A"}</div>
                    </div>
                </div>
            ),
        },
        {
            title: t("table.examinationDate"),
            dataIndex: "schedule",
            key: "schedule",
            render: (schedule: any) => (
                <div>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                        <CalendarOutlined style={{ marginRight: 8, color: "#6b7280" }} />
                        <span style={{ color: "#374151" }}>
                            {schedule?.work_date && dayjs(schedule.work_date, "YYYY-MM-DD").format("DD/MM/YYYY")}
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <ClockCircleOutlined style={{ marginRight: 8, color: "#6b7280" }} />
                        <span style={{ color: "#374151", fontSize: "12px" }}>
                            {getShiftLabel(schedule?.shift)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: t("table.examinationRoom"),
            dataIndex: "schedule",
            key: "schedule",
            render: (schedule: any) => (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{ color: "#374151" }}>
                        {t("table.room")} {schedule?.room || t("table.notAssigned")}
                    </span>
                    <span style={{ color: "#374151" }}>
                        {`${t("table.building")} ${schedule?.building || ""} - ${t("table.floor")} ${schedule?.floor || ""}` || t("table.notAssigned")}
                    </span>
                </div>
            ),
        },
        {
            title: t("table.symptoms"),
            dataIndex: "symptoms",
            key: "symptoms",
            ellipsis: true,
            render: (symptoms: string) => (
                <Tooltip title={symptoms}>
                    <span style={{ color: "#374151" }}>{symptoms || t("table.none")}</span>
                </Tooltip>
            ),
        },
        {
            title: t("table.status"),
            dataIndex: "appointmentStatus",
            key: "appointmentStatus",
            render: (status: string) => getStatusBadge(status),
        },
        {
            title: t("table.actions"),
            key: "action",
            width: 120,
            render: (_: any, record: Appointment) => (
                <Space size="small">
                    <Button
                        icon={<EditOutlined />}
                        type="text"
                        size="small"
                        onClick={() => handleViewPatient(record.appointmentId)}
                        style={{ color: "#047481" }}
                    >
                        {t("table.viewDetails")}
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ padding: "24px" }}>
                {/* Header */}
                <div style={{ marginBottom: "24px" }}>
                    <h1
                        style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: "#111827",
                            margin: 0,
                            marginBottom: "8px",
                        }}
                    >
                        {t("header.patientList")}
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "16px", margin: 0 }}>
                        {t("header.manageAndTrack")}
                        {filters.work_date && (
                            <span style={{ marginLeft: "8px", fontWeight: 500 }}>
                                - {t("header.date")}: {dayjs(filters.work_date, "YYYY-MM-DD").format("DD/MM/YYYY")}
                            </span>
                        )}
                        {filters.shift && (
                            <span style={{ marginLeft: "8px", fontWeight: 500 }}>- {t("header.shift")}: {getShiftLabel(filters.shift)}</span>
                        )}
                    </p>
                </div>

                {/* Stats Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "16px",
                        marginBottom: "24px",
                    }}
                >
                    <Card size="small" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#111827" }}>{stats.total}</div>
                        <div style={{ color: "#6b7280" }}>{t("stats.totalAppointments")}</div>
                    </Card>
                    <Card size="small" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#d97706" }}>{stats.pending}</div>
                        <div style={{ color: "#6b7280" }}>{t("stats.pending")}</div>
                    </Card>
                    <Card size="small" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb" }}>{stats.confirmed}</div>
                        <div style={{ color: "#6b7280" }}>{t("stats.confirmed")}</div>
                    </Card>
                    <Card size="small" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669" }}>{stats.completed}</div>
                        <div style={{ color: "#6b7280" }}>{t("stats.completed")}</div>
                    </Card>
                </div>

                {/* Filters */}
                <Card
                    bordered={false}
                    style={{
                        borderRadius: "16px",
                        marginBottom: "24px",
                        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                        <Search
                            placeholder={t("placeholders.searchPatient")}
                            value={localSearch}
                            onChange={handleLocalSearchChange}
                            style={{ width: 320 }}
                            prefix={<SearchOutlined style={{ color: "#6b7280" }} />}
                        />
                        <DatePicker
                            placeholder={t("placeholders.selectWorkingDate")}
                            style={{ width: 200 }}
                            value={filters.work_date ? dayjs(filters.work_date, "YYYY-MM-DD") : null}
                            onChange={handleDateChange}
                            format="DD/MM/YYYY"
                            allowClear
                        />
                        <Select
                            placeholder={t("placeholders.shift")}
                            value={filters.shift || "all"}
                            onChange={handleShiftFilterChange}
                            style={{ width: 150 }}
                            suffixIcon={<FilterOutlined style={{ color: "#6b7280" }} />}
                        >
                            <Option value="all">{t("options.allShifts")}</Option>
                            <Option value="MORNING">{t("shifts.morning")}</Option>
                            <Option value="AFTERNOON">{t("shifts.afternoon")}</Option>
                            <Option value="EVENING">{t("shifts.evening")}</Option>
                            <Option value="NIGHT">{t("shifts.night")}</Option>
                        </Select>
                        <Select
                            placeholder={t("placeholders.status")}
                            value={filters.appointmentStatus || "all"}
                            onChange={handleStatusFilterChange}
                            style={{ width: 180 }}
                            suffixIcon={<FilterOutlined style={{ color: "#6b7280" }} />}
                        >
                            <Option value="all">{t("options.allStatuses")}</Option>
                            <Option value="PENDING">{t("status.pending")}</Option>
                            <Option value="CONFIRMED">{t("status.confirmed")}</Option>
                            <Option value="IN_PROGRESS">{t("status.inProgress")}</Option>
                            <Option value="PENDING_TEST_RESULT">{t("status.pendingTestResult")}</Option>
                            <Option value="COMPLETED">{t("status.completed")}</Option>
                            <Option value="CANCELLED">{t("status.cancelled")}</Option>
                        </Select>
                        <Button icon={<ClearOutlined />} onClick={handleClearFilters} type="text">
                            {t("buttons.clearFilters")}
                        </Button>
                        <Button onClick={setTodayFilter} type="text">
                            {t("buttons.today")}
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={loading}
                            style={{ marginLeft: "auto" }}
                        >
                            {t("buttons.refresh")}
                        </Button>
                    </div>
                </Card>

                {/* Patient Table */}
                <Card
                    bordered={false}
                    style={{
                        borderRadius: "16px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        height: "100%",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <h2
                                style={{
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    color: "#111827",
                                    margin: 0,
                                }}
                            >
                                {t("header.patientList")}
                            </h2>
                            <span
                                style={{
                                    backgroundColor: "#dbeafe",
                                    color: "#1d4ed8",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                }}
                            >
                                {filteredAppointments.length} {t("header.patients")}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <Empty description={t("empty.loading")} />
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <Empty description={error} />
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <Empty description={t("empty.noPatientsFound")} />
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredAppointments}
                            rowKey="appointmentId"
                            pagination={{
                                current: paginatedData.pageNo + 1, // Convert from 0-based to 1-based
                                pageSize: paginatedData.pageSize,
                                total: paginatedData.totalElements,
                                showSizeChanger: true,
                                pageSizeOptions: ["10", "20", "50"],
                                showTotal: (total, range) => t("pagination.showing", { start: range[0], end: range[1], total }),
                                onChange: (page, pageSize) => updatePagination(page, pageSize),
                                style: { marginTop: "16px" },
                            }}
                            style={{ borderRadius: "12px" }}
                            rowClassName={(record, index) => (index % 2 === 0 ? "table-row-light" : "table-row-dark")}
                        />
                    )}
                </Card>
            </div>
        </div>
    )
}

export default Patient
