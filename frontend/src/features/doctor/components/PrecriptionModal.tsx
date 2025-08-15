"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal, Form, Input, Select, Button, Table, Typography, InputNumber, Spin, message } from "antd"
import { SearchOutlined, DeleteOutlined, DownloadOutlined } from "@ant-design/icons"
import { usePatientDetail } from "../hooks/usePatientDetail"
import type { Medicine } from "../types/medicine"
import type { PrescriptionDetail } from "../types/prescriptionDetail"
import type { Prescription } from "../types/prescription"
import { stringToDate, dateToString } from "../services/dateHelpServices"
import { PrescriptionPDF } from "./PrescriptionPDF"
import { useAppointmentContext } from "../context/AppointmentContext"
import { useTranslation } from "react-i18next"
const { Text } = Typography

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    appointmentId?: number
    existingPrescription?: Prescription | null
    onPrescriptionSaved?: () => void
    formParent: any
}

export const PrescriptionModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    appointmentId,
    existingPrescription,
    onPrescriptionSaved,
    formParent,
}) => {
    const { t } = useTranslation()
    const {
        patientDetail,
        prescription,
        medications,
        currentPrescriptionId,
        searchInput,
        searchLoading,
        saving,
        searchMedicines,
        addMedicine,
        updateMedicationField,
        deleteMedication,
        savePrescription,
        loadExistingPrescription,
        checkExistingPrescription,
        setSearchInput,
        setMedications,
    } = usePatientDetail(appointmentId)
    const { appointments } = useAppointmentContext()

    const [form] = Form.useForm()
    const [searchResults, setSearchResults] = useState<Medicine[]>([])
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [savedPrescription, setSavedPrescription] = useState<Prescription | null>(null)
    const [showPDF, setShowPDF] = useState(false)

    // Safely derive patient name and code, defaulting if patientDetail is null
    const appointment = appointments.find((appt) => appt.appointmentId === appointmentId)
    const patientName = appointment?.patientInfo
        ? `${appointment.patientInfo.first_name || ""} ${appointment.patientInfo.last_name || ""}`.trim()
        : patientDetail?.patientInfo
            ? `${patientDetail.patientInfo.first_name || ""} ${patientDetail.patientInfo.last_name || ""}`.trim()
            : t("labels.unknownPatient")
    const patientCode = existingPrescription?.patient || patientDetail?.patient || t("labels.unknownPatientCode")

    useEffect(() => {
        if (isOpen && appointmentId) {
            if (existingPrescription) {
                loadExistingPrescription(existingPrescription)
                form.setFieldsValue({
                    doctorNotes: existingPrescription.note || "",
                })
            } else if (prescription) {
                loadExistingPrescription(prescription[0]) // Assuming prescription is an array
                form.setFieldsValue({
                    doctorNotes: prescription[0].note || "",
                })
            } else {
                checkExistingPrescription().then((existing) => {
                    if (existing) {
                        loadExistingPrescription(existing)
                        form.setFieldsValue({
                            doctorNotes: existing.note || "",
                        })
                    }
                }).catch((err) => console.error("Error checking existing prescription:", err))
            }
        }
    }, [isOpen, appointmentId, existingPrescription, prescription, loadExistingPrescription, checkExistingPrescription, form])

    useEffect(() => {
        if (!isOpen) {
            form.resetFields()
            setSearchInput("")
            setMedications([])
        }
    }, [isOpen, form, setSearchInput, setMedications])

    const handleSearch = async (value: string) => {
        setSearchInput(value)
        if (value.trim()) {
            const results = await searchMedicines(value)
            setSearchResults(results)
            setShowSearchResults(true)
        } else {
            setSearchResults([])
            setShowSearchResults(false)
        }
    }

    const handleAddMedicine = (medicine: Medicine) => {
        addMedicine(medicine)
        setSearchInput("")
        setSearchResults([])
        setShowSearchResults(false)
    }

    const handleUpdateMedication = (index: number, field: keyof PrescriptionDetail, value: any) => {
        updateMedicationField(index, field, value)
    }

    const handleDeleteMedication = (index: number) => {
        deleteMedication(index)
    }

    const handleSave = async () => {
        if (!appointmentId || !medications || medications.length === 0) {
            message.error(t("errors.noMedicationsAdded"))
            return
        }
        try {
            const values = await form.validateFields()
            const parentFormValues = await formParent.validateFields() // Get values from PatientDetail form

            const prescriptionData = {
                appointment_id: appointmentId,
                patient_id: patientDetail?.patient || existingPrescription?.patient || 0,
                follow_up_date: parentFormValues.followUpDate ? dateToString(parentFormValues.followUpDate) : null,
                is_follow_up: parentFormValues.isFollowUp || false,
                diagnosis: parentFormValues.diagnosis || existingPrescription?.diagnosis || "",
                systolic_blood_pressure: parentFormValues.systolicBloodPressure || 0,
                diastolic_blood_pressure: parentFormValues.diastolicBloodPressure || 0,
                heart_rate: parentFormValues.heartRate || 0,
                blood_sugar: parentFormValues.bloodSugar || 0,
                note: values.doctorNotes || "",
                prescription_details: medications.map((med) => ({
                    medicine_id: med.medicine_id,
                    prescription_notes: med.prescriptionNotes || t("labels.noNotes"),
                    dosage: med.dosage || "",
                    frequency: med.frequency || t("options.frequency.onceMorning"),
                    duration: med.duration || "",
                    quantity: med.quantity || 1,
                })),
            }

            const saved = await savePrescription(prescriptionData)
            if (saved) {
                setSavedPrescription(saved)
                message.success(t("success.prescriptionSaved"))
                onPrescriptionSaved?.()
                onClose()
            }
        } catch (error) {
            console.error("Error saving prescription:", error)
            message.error(t("errors.savePrescriptionFailed"))
        }
    }

    const handleShowPDF = () => {
        setShowPDF(true)
    }

    const handleClose = () => {
        onClose()
    }

    const columns = [
        {
            title: t("table.medicine"),
            dataIndex: ["medicine", "medicineName"],
            key: "medicineName",
            render: (text: string, record: PrescriptionDetail) => {
                if (!record.medicine) return <div>{t("labels.noInformation")}</div>
                return (
                    <div>
                        <div className="font-medium">{record.medicine.medicine_name || t("labels.noName")}</div>
                        <div className="text-sm text-gray-500">{record.medicine.category || t("labels.noCategory")}</div>
                        <div className="text-xs text-gray-400">
                            {(record.medicine.price || 0).toLocaleString("vi-VN")} {t("labels.currency")}/{record.medicine.unit || t("labels.unit")}
                        </div>
                        {record.medicine.quantity && <div className="text-xs text-gray-400">{t("labels.available")}: {record.medicine.quantity}</div>}
                    </div>
                )
            },
        },
        {
            title: t("table.dosage"),
            dataIndex: "dosage",
            key: "dosage",
            width: 100,
            render: (text: string, record: PrescriptionDetail, index: number) => (
                <Input
                    value={text || ""}
                    onChange={(e) => updateMedicationField(index, "dosage", e.target.value)}
                    className="w-full text-center"
                    placeholder="1"
                />
            ),
        },
        {
            title: t("table.frequency"),
            dataIndex: "frequency",
            key: "frequency",
            width: 200,
            render: (text: string, record: PrescriptionDetail, index: number) => (
                <Select
                    value={text || t("options.frequency.onceMorning")}
                    onChange={(value) => updateMedicationField(index, "frequency", value)}
                    style={{ width: "100%" }}
                    options={[
                        { value: t("options.frequency.onceMorning"), label: t("options.frequency.onceMorning") },
                        { value: t("options.frequency.onceNoon"), label: t("options.frequency.onceNoon") },
                        { value: t("options.frequency.onceAfternoon"), label: t("options.frequency.onceAfternoon") },
                        { value: t("options.frequency.onceEvening"), label: t("options.frequency.onceEvening") },
                        { value: t("options.frequency.twiceMorningEvening"), label: t("options.frequency.twiceMorningEvening") },
                        { value: t("options.frequency.thriceMorningNoonAfternoon"), label: t("options.frequency.thriceMorningNoonAfternoon") },
                    ]}
                />
            ),
        },
        {
            title: t("table.instructions"),
            dataIndex: "prescriptionNotes",
            key: "prescriptionNotes",
            width: 150,
            render: (text: string, record: PrescriptionDetail, index: number) => (
                <Select
                    value={text || t("options.instructions.beforeMeal")}
                    onChange={(value) => updateMedicationField(index, "prescriptionNotes", value)}
                    style={{ width: "100%" }}
                    options={[
                        { value: t("options.instructions.beforeMeal"), label: t("options.instructions.beforeMeal") },
                        { value: t("options.instructions.beforeMeal30Min"), label: t("options.instructions.beforeMeal30Min") },
                        { value: t("options.instructions.afterMeal"), label: t("options.instructions.afterMeal") },
                        { value: t("options.instructions.afterMeal30Min"), label: t("options.instructions.afterMeal30Min") },
                        { value: t("options.instructions.duringMeal"), label: t("options.instructions.duringMeal") },
                        { value: t("options.instructions.beforeSleep30Min"), label: t("options.instructions.beforeSleep30Min") },
                        { value: t("options.instructions.asNeeded"), label: t("options.instructions.asNeeded") },
                    ]}
                />
            ),
        },
        {
            title: t("table.duration"),
            dataIndex: "duration",
            key: "duration",
            width: 120,
            render: (text: string, record: PrescriptionDetail, index: number) => (
                <Input
                    value={text || ""}
                    onChange={(e) => updateMedicationField(index, "duration", e.target.value)}
                    className="w-full text-center"
                    placeholder={t("placeholders.duration")}
                />
            ),
        },
        {
            title: t("table.quantity"),
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            render: (text: number, record: PrescriptionDetail, index: number) => (
                <InputNumber
                    value={text || 1}
                    onChange={(value) => updateMedicationField(index, "quantity", value || 1)}
                    className="w-full text-center"
                    min={1}
                    placeholder="1"
                />
            ),
        },
        {
            title: "",
            key: "action",
            width: 70,
            render: (_: any, record: PrescriptionDetail, index: number) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteMedication(index)} />
            ),
        },
    ]

    return (
        <>
            <Modal
                title={currentPrescriptionId ? t("titles.editPrescription") : t("titles.createPrescription")}
                open={isOpen}
                onCancel={handleClose}
                footer={null}
                width={1200}
                destroyOnClose={true}
            >
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-1">
                            <Text strong>{t("labels.patient")}: {patientName}</Text>
                            <div>
                                <Text type="secondary">{t("labels.patientCode")}: {patientCode}</Text>
                            </div>
                            {patientDetail?.age && (
                                <div>
                                    <Text type="secondary">{t("labels.age")}: {patientDetail.age}</Text>
                                </div>
                            )}
                            {currentPrescriptionId && (
                                <div>
                                    <Text type="secondary">{t("labels.editingPrescription")} #{currentPrescriptionId}</Text>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <Text strong>{t("labels.date")}: {new Date().toLocaleDateString("vi-VN")}</Text>
                            <div>
                                <Text type="secondary">
                                    {t("labels.time")}: {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                </Text>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center mb-4">
                        <div className="relative flex-1 max-w-md">
                            <Input
                                placeholder={t("placeholders.searchMedicine")}
                                prefix={<SearchOutlined />}
                                value={searchInput}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full"
                                suffix={searchLoading ? <Spin size="small" /> : null}
                            />
                            {showSearchResults && searchResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {searchResults.map((medicine) => (
                                        <div
                                            key={medicine.medicineId}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            onClick={() => handleAddMedicine(medicine)}
                                        >
                                            <div className="font-medium">{medicine.medicine_name}</div>
                                            <div className="text-sm text-gray-500">{medicine.category}</div>
                                            <div className="text-xs text-gray-400">
                                                {medicine.price.toLocaleString("vi-VN")} {t("labels.currency")}/{medicine.unit}
                                                {medicine.quantity && ` - ${t("labels.available")}: ${medicine.quantity}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showSearchResults && (!searchResults || searchResults.length === 0) && searchInput && !searchLoading && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3">
                                    <div className="text-gray-500 text-center">{t("empty.noMedicinesFound")}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={medications || []}
                        rowKey={(record, index) => `${record.medicine?.medicineId || 0}-${index}`}
                        pagination={false}
                        className="mb-6"
                        loading={saving}
                        locale={{
                            emptyText: t("empty.noMedicinesInPrescription"),
                        }}
                    />

                    <Form form={form} layout="vertical">
                        <Form.Item label={t("labels.doctorNotes")} name="doctorNotes">
                            <Input.TextArea rows={4} placeholder={t("placeholders.doctorNotes")} />
                        </Form.Item>
                    </Form>
                </div>

                <div className="flex justify-between">
                    <div>
                        {(savedPrescription || currentPrescriptionId) && (
                            <Button icon={<DownloadOutlined />} onClick={handleShowPDF} type="default">
                                {t("buttons.viewPDF")}
                            </Button>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <Button onClick={handleClose} disabled={saving}>
                            {t("buttons.cancel")}
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            loading={saving}
                            disabled={!medications || medications.length === 0}
                        >
                            {currentPrescriptionId ? t("buttons.updatePrescription") : t("buttons.savePrescription")}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                title={t("titles.prescriptionPDF")}
                open={showPDF}
                onCancel={() => setShowPDF(false)}
                footer={null}
                width={1000}
                style={{ top: 20 }}
            >
                {(savedPrescription || (prescription && prescription.length > 0)) && (
                    <PrescriptionPDF
                        prescription={savedPrescription || prescription![0]}
                        patientName={patientName}
                        patientInfo={patientDetail?.patientInfo}
                        showControls={true}
                    />
                )}
            </Modal>
        </>
    )
}
