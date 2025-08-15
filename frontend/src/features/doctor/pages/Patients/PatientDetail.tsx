"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
    Row,
    Col,
    Form,
    Input,
    DatePicker,
    Button,
    Checkbox,
    Typography,
    Spin,
    Tabs,
    InputNumber,
    message,
    Empty,
    Select,
    Tag,
    Tooltip,
} from "antd"
import {
    PlusOutlined,
    EyeOutlined,
    FileTextOutlined,
    EnvironmentOutlined,
    MessageOutlined,
    ReloadOutlined,
    CloseOutlined,
    MedicineBoxOutlined,
    UserOutlined,
} from "@ant-design/icons"
import { PrescriptionModal } from "../../components/PrecriptionModal"
import { ServiceOrderModal } from "../../components/ServiceOrderModal"
import { PrescriptionHistoryModal } from "../../components/PrescriptionHistoryModal"
import { TestResultDetailModal } from "../../components/TestResultDetailModal"
import { usePatientDetail } from "../../hooks/usePatientDetail"
import { usePrescriptionHistory } from "../../hooks/usePrescriptionHistory"
import { useAppointmentContext } from "../../context/AppointmentContext"
import { NoteType } from "../../types/appointmentNote"
import type { Prescription } from "../../types/prescription"
import type { ServiceOrder } from "../../types/serviceOrder"
import { appointmentService } from "../../services/appointmentService"
import { stringToDate, dateToString } from "../../services/dateHelpServices"
import { getAppointmentStatusColor } from "../../services/appointmentService"
import { useTranslation } from "react-i18next"

const { Title, Text } = Typography
const { TabPane } = Tabs
const { Option } = Select

const PatientDetail: React.FC = () => {
    const { t } = useTranslation()
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
    const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false)
    const [isPrescriptionHistoryModalOpen, setIsPrescriptionHistoryModalOpen] = useState(false)
    const [isTestResultDetailModalOpen, setIsTestResultDetailModalOpen] = useState(false)
    const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrder | null>(null)
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
    const [noteText, setNoteText] = useState("")
    const [form] = Form.useForm()
    const location = useLocation()
    const navigate = useNavigate()
    const { appointmentId } = location.state || {}

    const { appointments } = useAppointmentContext()

    const {
        patientDetail,
        prescription,
        serviceOrders,
        appointmentNotes,
        loading,
        serviceOrdersLoading,
        notesLoading,
        saving,
        createAppointmentNote,
        deleteAppointmentNote,
        refreshAll,
        refreshSpecific,
        fetchPrescription,
    } = usePatientDetail(appointmentId)

    const {
        prescriptionHistory,
        loading: historyLoading,
        refreshHistory,
    } = usePrescriptionHistory(patientDetail?.patient?.id || patientDetail?.patient)

    const handlePrescriptionSaved = async () => {
        await refreshAll(appointmentId)
    }

    const [examinationCompletedLoading, setExaminationCompletedLoading] = useState(false)
    const [pendingTestStatusLoading, setPendingTestStatusLoading] = useState(false)

    useEffect(() => {
        if (patientDetail) {
            const appointment = appointments.find((appt) => appt.appointmentId === patientDetail.id)
            const pres = Array.isArray(prescription) && prescription.length > 0 ? prescription[prescription.length - 1] : prescription
            const formValues = {
                name: appointment?.patientInfo
                    ? `${appointment.patientInfo.first_name || ""} ${appointment.patientInfo.last_name || ""}`.trim()
                    : t("labels.unknownPatient"),
                clinic: appointment?.schedule?.room?.note || appointment?.schedule?.room || t("labels.unknownClinic"),
                appointmentTime: `${(patientDetail.slot_start || "").slice(0, 5)} - ${(patientDetail.slot_end || "").slice(0, 5)}`,
                appointmentDate: appointment?.schedule?.work_date || patientDetail.created_at?.split("T")[0] || t("labels.unknownDate"),
                symptoms: patientDetail?.symptoms || "",
                diagnosis: pres?.diagnosis || "",
                doctorNotes: pres?.note || "",
                isFollowUp: pres?.is_follow_up || false,
                followUpDate: stringToDate(pres?.follow_up_date) || null,
                systolicBloodPressure: pres?.systolic_blood_pressure || undefined,
                diastolicBloodPressure: pres?.diastolic_blood_pressure || undefined,
                heartRate: pres?.heart_rate || undefined,
                bloodSugar: pres?.blood_sugar || undefined,
            }
            form.setFieldsValue(formValues)
        }
    }, [patientDetail, prescription, appointments, form, t])

    // const changeToPendingTestStatus = async () => {
    //     if (!appointmentId) {
    //         message.error(t("errors.noAppointmentFound"))
    //         return
    //     }
    //
    //     setPendingTestStatusLoading(true)
    //
    //     try {
    //         const appointment = appointments.find((appt) => appt.appointmentId === patientDetail.id)
    //         const updateAppointmentData = {
    //             appointmentId: patientDetail.id,
    //             patientId: appointment?.patientInfo?.id || patientDetail.patient,
    //             scheduleId: appointment?.schedule?.scheduleId || patientDetail.schedule,
    //             symptoms: patientDetail.symptoms,
    //             slot_start: patientDetail.slot_start,
    //             slot_end: patientDetail.slot_end,
    //             status: "PENDING_TEST_RESULT",
    //         }
    //
    //         await appointmentService.updateAppointmentById(appointmentId, updateAppointmentData)
    //
    //         message.success(t("success.pendingTestResult"))
    //         await refreshAll(appointmentId)
    //     } catch (error) {
    //         console.error(t("errors.failedToChangeStatus"), error)
    //         message.error(t("errors.statusChangeFailed"))
    //     } finally {
    //         setPendingTestStatusLoading(false)
    //     }
    // }

    const handleCompleteExamination = async () => {
        if (!appointmentId) {
            message.error(t("errors.noAppointmentFound"))
            return
        }

        setExaminationCompletedLoading(true)

        try {
            const values = await form.validateFields()

            const requiredVitalSigns = [
                "systolicBloodPressure",
                "diastolicBloodPressure",
                "heartRate",
                "bloodSugar",
                "diagnosis",
                "doctorNotes",
            ]
            const missingVitalSigns = requiredVitalSigns.filter((field) => !values[field])

            if (missingVitalSigns.length > 0) {
                message.error(t("errors.missingRequiredFields"))
                return
            }
            
            const appointment = appointments.find((appt) => appt.appointmentId === patientDetail.id)
            console.log("heheheh", appointment)
            const updateData = {
                id: patientDetail.id,
                doctor: appointment?.schedule?.doctor || patientDetail.doctor,
                patient: appointment?.patientInfo?.id || patientDetail.patient,
                schedule: appointment?.schedule?.scheduleId || patientDetail.schedule,
                symptoms: patientDetail.symptoms,
                slot_start: patientDetail.slot_start,
                slot_end: patientDetail.slot_end,
                status: "D", // Set status to 'D' for Completed
            }
            console.log("updateData", updateData)
            console.log("appointmentId", appointmentId)
            await appointmentService.updateAppointmentById(appointmentId, updateData)

            message.success(t("success.examinationCompleted"))
            await refreshAll(appointmentId)
        } catch (error) {
            console.error(t("errors.failedToCompleteExamination"), error)
            message.error(t("errors.examinationCompletionFailed"))
        } finally {
            setExaminationCompletedLoading(false)
        }
    }

    const handleAddNote = () => {
        if (noteText.trim() && patientDetail && appointmentId) {
            createAppointmentNote(appointmentId, { content: noteText, noteType: NoteType.DOCTOR })
            setNoteText("")
        }
    }

    const handleDeleteNote = (noteId: string) => {
        if (noteId && appointmentId) {
            deleteAppointmentNote(appointmentId, noteId)
        }
    }

    const handleViewTestResult = (order: ServiceOrder) => {
        setSelectedServiceOrder(order)
        setIsTestResultDetailModalOpen(true)
    }

    const handleClosePrescriptionModal = () => {
        setIsPrescriptionModalOpen(false)
    }

    const formatDateTime = useCallback((dateString?: string) => {
        if (!dateString) return ""
        try {
            return new Date(dateString).toLocaleString("vi-VN")
        } catch (e) {
            return t("errors.invalidDateFormat")
        }
    }, [t])

    const formatDate = useCallback((dateString?: string) => {
        if (!dateString) return ""
        try {
            return new Date(dateString).toLocaleDateString("vi-VN")
        } catch (e) {
            return t("errors.invalidDateFormat")
        }
    }, [t])

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

    if (loading) {
        return (
            <div className="flex-1 min-h-screen bg-gray-50 flex items-center justify-center">
                <Spin size="large" />
            </div>
        )
    }

    if (!patientDetail) {
        return (
            <div className="flex-1 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Text type="danger">{t("errors.noPatientInfo")}</Text>
                    <div className="mt-4">
                        <Button onClick={() => refreshAll(appointmentId)}>{t("buttons.retry")}</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 min-h-screen bg-gray-50 p-6">
            <main>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="mb-6">
                        <Row gutter={24} align="middle">
                            <Col span={10}>
                                <Title level={4}>{t("titles.patientDetails")}</Title>
                            </Col>
                            <Col span={14} style={{ textAlign: "right" }}>
                                <Text strong>{t("labels.status")}:</Text>{" "}
                                <Tooltip title={patientDetail.status}>
                                    <span style={{ color: "#374151" }}>
                                        {getStatusBadge(patientDetail.status)}
                                    </span>
                                </Tooltip>
                            </Col>
                        </Row>
                    </div>

                    <Form form={form} layout="vertical">
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item label={t("labels.patientName")} name="name">
                                    <Input disabled style={{ color: "black" }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t("labels.clinic")} name="clinic">
                                    <Input disabled style={{ color: "black" }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t("labels.appointmentTime")} name="appointmentTime">
                                    <Input disabled style={{ color: "black" }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t("labels.appointmentDate")} name="appointmentDate">
                                    <Input disabled style={{ color: "black" }} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t("labels.symptoms")} name="symptoms">
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t("labels.diagnosis")} name="diagnosis">
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t("labels.doctorNotes")} name="doctorNotes">
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t("labels.followUp")} name="isFollowUp" valuePropName="checked">
                                    <Checkbox>{t("labels.followUpCheckbox")}</Checkbox>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t("labels.followUpDate")} name="followUpDate">
                                    <DatePicker style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={t("labels.systolicBloodPressure")} name="systolicBloodPressure">
                                    <InputNumber style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={t("labels.diastolicBloodPressure")} name="diastolicBloodPressure">
                                    <InputNumber style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={t("labels.heartRate")} name="heartRate">
                                    <InputNumber style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={t("labels.bloodSugar")} name="bloodSugar">
                                    <InputNumber style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsMedicalModalOpen(true)}
                                >
                                    {t("buttons.pendingTestResult")}
                                </Button>
                            </Col>
                            <Col span={12} style={{ textAlign: "right" }}>
                                <Button
                                    type="primary"
                                    loading={examinationCompletedLoading}
                                    onClick={handleCompleteExamination}
                                >
                                    {t("buttons.completeExamination")}
                                </Button>
                            </Col>
                        </Row>
                    </Form>

                    <div className="mt-6">
                        <Tabs defaultActiveKey="1">
                            <TabPane tab={t("tabs.testResults")} key="1">
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-gray-700 font-medium">{t("headers.testResults")}</h3>
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={() => appointmentId && refreshSpecific(appointmentId, ["serviceOrders"])}
                                        >
                                            {t("buttons.refresh")}
                                        </Button>
                                    </div>
                                    {serviceOrdersLoading ? (
                                        <div className="text-center py-4">
                                            <Spin />
                                        </div>
                                    ) : !serviceOrders || serviceOrders.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">{t("empty.noTestResults")}</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {serviceOrders.map((order) => (
                                                <div key={order.orderId} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-medium">{t("labels.serviceName")}: {order.service_name}</p>
                                                        <p className="text-sm text-gray-500">{t("labels.room")}: {order.room_id || t("labels.notSpecified")}</p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {t("labels.status")}: {order.order_status === "D" ? t("status.completed") : t("status.pending")}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="text"
                                                        icon={<EyeOutlined />}
                                                        onClick={() => handleViewTestResult(order)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabPane>

                            <TabPane tab={t("tabs.notes")} key="2">
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-gray-700 font-medium">{t("headers.notes")}</h3>
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={() => appointmentId && refreshAll(appointmentId)}
                                        >
                                            {t("buttons.refresh")}
                                        </Button>
                                    </div>

                                    <div className="mb-4">
                                        <Input.TextArea
                                            rows={4}
                                            placeholder={t("placeholders.addNewNote")}
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                        />
                                        <div className="flex justify-end mt-2">
                                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNote}>
                                                {t("buttons.addNote")}
                                            </Button>
                                        </div>
                                    </div>

                                    {notesLoading ? (
                                        <div className="text-center py-4">
                                            <Spin />
                                        </div>
                                    ) : !appointmentNotes || appointmentNotes.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">{t("empty.noNotes")}</div>
                                    ) : (
                                        appointmentNotes.map((note) => (
                                            <div key={note.noteId} className="border border-gray-200 rounded-lg p-4 mb-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center mb-2">
                                                            <MessageOutlined style={{ marginRight: 8 }} />
                                                            <span className="font-medium">
                                                                {note.noteType === NoteType.DOCTOR ? note.doctorName || t("labels.doctor") : t("labels.patient")}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700">{note.content || ""}</p>
                                                        {note.createdAt && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                {new Date(note.createdAt).toLocaleString("vi-VN")}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<CloseOutlined />}
                                                        onClick={() => handleDeleteNote(note.noteId)}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabPane>

                            <TabPane tab={t("tabs.prescriptions")} key="3">
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-gray-700 font-medium">{t("headers.prescriptions")}</h3>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => setIsPrescriptionModalOpen(true)}
                                        >
                                            {t("buttons.addPrescription")}
                                        </Button>
                                    </div>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={() => appointmentId && fetchPrescription(appointmentId)}
                                    >
                                        {t("buttons.refresh")}
                                    </Button>
                                    {prescription && Array.isArray(prescription) && prescription.length > 0 ? (
                                        <div className="mt-4 space-y-4">
                                            {prescription.map((pres) => (
                                                <div
                                                    key={pres.id}
                                                    className="bg-white rounded-lg border border-gray-200 p-4 mb-3"
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <div className="w-8 h-8 bg-base-100 rounded-full flex items-center justify-center mr-3">
                                                            <MedicineBoxOutlined style={{ fontSize: 16 }} className="text-blue-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{t("labels.prescription")} #{pres.id}</p>
                                                            <p className="text-xs text-gray-500">{t("labels.prescriptionDate")}: {formatDateTime(pres.created_at)}</p>
                                                            <p className="text-xs text-gray-500">{t("labels.diagnosis")}: {pres.diagnosis || t("labels.noDiagnosis")}</p>
                                                        </div>
                                                        <button
                                                            className="text-base-600 hover:text-blue-800"
                                                            onClick={() => {
                                                                setSelectedPrescription(pres)
                                                                setIsPrescriptionHistoryModalOpen(true)
                                                            }}
                                                        >
                                                            <EyeOutlined style={{ fontSize: 16 }} />
                                                        </button>
                                                    </div>
                                                    {pres.is_follow_up && (
                                                        <p className="text-xs text-blue-500">
                                                            {t("labels.followUpAppointment")}: {pres.follow_up_date ? formatDate(pres.follow_up_date) : t("labels.yes")}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500">{t("empty.noPrescriptions")}</div>
                                    )}
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>

                    <div className="mt-6">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => appointmentId && refreshAll(appointmentId)}
                        >
                            {t("buttons.refreshAll")}
                        </Button>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <PrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={handleClosePrescriptionModal}
                appointmentId={appointmentId}
                existingPrescription={Array.isArray(prescription) && prescription.length > 0 ? prescription[0] : prescription}
                onPrescriptionSaved={handlePrescriptionSaved}
                formParent={form}
            />
            <ServiceOrderModal
                isOpen={isMedicalModalOpen}
                onClose={() => setIsMedicalModalOpen(false)}
                appointmentId={appointmentId}
            />
            <PrescriptionHistoryModal
                isOpen={isPrescriptionHistoryModalOpen}
                onClose={() => {
                    setIsPrescriptionHistoryModalOpen(false)
                    setSelectedPrescription(null)
                }}
                prescription={selectedPrescription}
                patientInfo={appointments.find((appt) => appt.appointmentId === patientDetail.id)?.patientInfo || null}
            />
            <TestResultDetailModal
                isOpen={isTestResultDetailModalOpen}
                onClose={() => {
                    setIsTestResultDetailModalOpen(false)
                    setSelectedServiceOrder(null)
                }}
                serviceOrder={selectedServiceOrder}
                appointment={patientDetail}
                examinationRoom={null}
                onUpdate={(updatedOrder) => {
                    refreshSpecific(appointmentId, ["serviceOrders"])
                }}
            />
        </div>
    )
}

export default PatientDetail
