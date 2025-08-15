"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { message } from "antd"
import { patientService, type UpdatePatientRequest } from "../services/patientServices"
import { pharmacyService } from "../services/pharmacyServices"
import { appointmentNoteService } from "../services/appointmentNoteServices"
import { servicesService } from "../services/servicesService"
import { getServiceOrdersByAppointmentId } from "../services/serviceOrderService"
import type { PatientDetail } from "../types/patient"
import type { Prescription } from "../types/prescription"
import type { PrescriptionDetail } from "../types/prescriptionDetail"
import type { Medicine } from "../types/medicine"
import type { ServiceOrder } from "../types/serviceOrder"
import type { AppointmentNote, CreateAppointmentNoteRequest } from "../types/appointmentNote"
import type { Appointment } from "../types/appointment"
import { stringToDate, dateToString } from "../services/dateHelpServices"

// Define statusMap for mapping appointment statuses
const statusMap: { [key: string]: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" } = {
    P: "PENDING",
    C: "CONFIRMED",
    D: "COMPLETED",
    X: "CANCELLED",
}

interface UsePatientDetailReturn {
    patientDetail: PatientDetail | null
    prescription: Prescription | null
    serviceOrders: ServiceOrder[]
    appointmentNotes: AppointmentNote[]
    appointment: Appointment | null
    medications: PrescriptionDetail[]
    currentPrescriptionId: number | null
    searchInput: string
    searchLoading: boolean
    loading: boolean
    prescriptionLoading: boolean
    serviceOrdersLoading: boolean
    notesLoading: boolean
    saving: boolean
    fetchPatientDetail: (appointmentId: number) => Promise<void>
    fetchPrescription: (appointmentId: number) => Promise<void>
    fetchServiceOrders: (appointmentId: number) => Promise<void>
    fetchAppointmentNotes: (appointmentId: number) => Promise<void>
    createAppointmentNote: (appointmentId: number, note: CreateAppointmentNoteRequest) => Promise<void>
    updateAppointmentNote: (noteId: number, note: CreateAppointmentNoteRequest) => Promise<void>
    deleteAppointmentNote: (appointmentId: number, noteId: number) => Promise<void>
    updatePatientInfo: (appointmentId: number, updateData: UpdatePatientRequest) => Promise<void>
    updateVitalSigns: (appointmentId: number, vitalSigns: any) => Promise<void>
    searchMedicines: (searchTerm: string) => Promise<Medicine[]>
    addMedicine: (medicine: Medicine) => void
    updateMedicationField: (index: number, field: keyof PrescriptionDetail, value: any) => void
    deleteMedication: (index: number) => void
    savePrescription: (prescriptionData: any) => Promise<Prescription | null>
    loadExistingPrescription: (prescription: Prescription | null) => void
    checkExistingPrescription: () => Promise<Prescription | null>
    resetPrescriptionLoadState: () => void
    setSearchInput: (value: string) => void
    setMedications: (medications: PrescriptionDetail[]) => void
    refreshAll: (appointmentId: number) => Promise<void>
    refreshSpecific: (appointmentId: number, targets: ("patient" | "prescription" | "services" | "notes")[]) => Promise<void[]>
}

export const usePatientDetail = (initialAppointmentId?: number): UsePatientDetailReturn => {
    const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null)
    const [prescription, setPrescription] = useState<Prescription | null>(null)
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([])
    const [appointmentNotes, setAppointmentNotes] = useState<AppointmentNote[]>([])
    const [appointment, setAppointment] = useState<Appointment | null>(null)
    const [medications, setMedications] = useState<PrescriptionDetail[]>([])
    const [currentPrescriptionId, setCurrentPrescriptionId] = useState<number | null>(null)
    const [searchInput, setSearchInput] = useState("")
    const [searchLoading, setSearchLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [prescriptionLoading, setPrescriptionLoading] = useState(false)
    const [serviceOrdersLoading, setServiceOrdersLoading] = useState(false)
    const [notesLoading, setNotesLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const hasLoadedRef = useRef(false)

    const fetchPatientDetail = useCallback(async (appointmentId: number) => {
        try {
            setLoading(true)
            const detail = await patientService.getPatientDetail(appointmentId)
            // Map the appointment status using statusMap
            const mappedAppointment = detail
                ? {
                      ...detail,
                      status: statusMap[detail.status] || detail.status,
                  }
                : null
            setPatientDetail(mappedAppointment)
            setAppointment(mappedAppointment)
        } catch (error) {
            console.error("Error fetching patient detail:", error)
            message.error("Không thể tải thông tin bệnh nhân")
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchPrescription = useCallback(async (appointmentId: number) => {
        try {
            setPrescriptionLoading(true)
            const pres = await pharmacyService.getCurrentPrescriptionByAppointmentId(appointmentId)
            setPrescription(pres)
            setCurrentPrescriptionId(pres.prescriptionId)
            loadExistingPrescription(pres)
        } catch (error) {
            console.error("Error fetching prescription:", error)
            setPrescription(null)
            setCurrentPrescriptionId(null)
        } finally {
            setPrescriptionLoading(false)
        }
    }, [])

    const fetchServiceOrders = useCallback(async (appointmentId: number) => {
        try {
            setServiceOrdersLoading(true)
            const orders = await getServiceOrdersByAppointmentId(appointmentId)
            setServiceOrders(orders)
        } catch (error) {
            console.error("Error fetching service orders:", error)
            setServiceOrders([])
        } finally {
            setServiceOrdersLoading(false)
        }
    }, [])

    const fetchAppointmentNotes = useCallback(async (appointmentId: number) => {
        try {
            setNotesLoading(true)
            const notes = await appointmentNoteService.getNotesByAppointmentId(appointmentId)
            setAppointmentNotes(notes)
        } catch (error) {
            console.error("Error fetching appointment notes:", error)
            setAppointmentNotes([])
        } finally {
            setNotesLoading(false)
        }
    }, [])

    const createAppointmentNote = useCallback(async (appointmentId: number, note: CreateAppointmentNoteRequest) => {
        try {
            setSaving(true)
            const newNote = await appointmentNoteService.createAppointmentNote(appointmentId, note)
            setAppointmentNotes((prev) => [...prev, newNote])
            message.success("Thêm ghi chú thành công")
        } catch (error) {
            console.error("Error creating appointment note:", error)
            message.error("Không thể thêm ghi chú")
        } finally {
            setSaving(false)
        }
    }, [])

    const updateAppointmentNote = useCallback(async (noteId: number, note: CreateAppointmentNoteRequest) => {
        try {
            setSaving(true)
            const updatedNote = await appointmentNoteService.updateAppointmentNote(noteId, note)
            setAppointmentNotes((prev) => prev.map((n) => (n.noteId === noteId ? updatedNote : n)))
            message.success("Cập nhật ghi chú thành công")
        } catch (error) {
            console.error("Error updating appointment note:", error)
            message.error("Không thể cập nhật ghi chú")
        } finally {
            setSaving(false)
        }
    }, [])

    const deleteAppointmentNote = useCallback(async (appointmentId: number, noteId: number) => {
        try {
            setSaving(true)
            await appointmentNoteService.deleteAppointmentNote(appointmentId, noteId)
            setAppointmentNotes((prev) => prev.filter((n) => n.noteId !== noteId))
            message.success("Xóa ghi chú thành công")
        } catch (error) {
            console.error("Error deleting appointment note:", error)
            message.error("Không thể xóa ghi chú")
        } finally {
            setSaving(false)
        }
    }, [])

    const updatePatientInfo = useCallback(async (appointmentId: number, updateData: UpdatePatientRequest) => {
        try {
            setSaving(true)
            const updated = await patientService.updatePatientInfo(appointmentId, updateData)
            setPatientDetail((prev) => (prev ? { ...prev, ...updated } : null))
            message.success("Cập nhật thông tin bệnh nhân thành công")
        } catch (error) {
            console.error("Error updating patient info:", error)
            message.error("Không thể cập nhật thông tin bệnh nhân")
        } finally {
            setSaving(false)
        }
    }, [])

    const updateVitalSigns = useCallback(async (appointmentId: number, vitalSigns: any) => {
        try {
            setSaving(true)
            const updated = await patientService.updateVitalSigns(appointmentId, vitalSigns)
            setPatientDetail((prev) => (prev ? { ...prev, ...updated } : null))
            message.success("Cập nhật chỉ số sức khỏe thành công")
        } catch (error) {
            console.error("Error updating vital signs:", error)
            message.error("Không thể cập nhật chỉ số sức khỏe")
        } finally {
            setSaving(false)
        }
    }, [])

    const searchMedicines = useCallback(async (searchTerm: string): Promise<Medicine[]> => {
        try {
            setSearchLoading(true)
            const medicines = await pharmacyService.searchMedicine(searchTerm)
            return medicines
        } catch (error) {
            console.error("Error searching medicines:", error)
            return []
        } finally {
            setSearchLoading(false)
        }
    }, [])

    const addMedicine = useCallback((medicine: Medicine) => {
        setMedications((prev) => [
            ...prev,
            {
                detailId: Date.now(),
                medicine_id: medicine.id,
                medicine,
                dosage: "1",
                unit: medicine.unit,
                frequency: "1 lần/ngày",
                prescriptionNotes: "",
                duration: "1",
                quantity: 1
            },
        ])
        message.success(`Đã thêm ${medicine.medicine_name}`)
    }, [])

    const updateMedicationField = useCallback((index: number, field: keyof PrescriptionDetail, value: any) => {
        setMedications((prev) => prev.map((med, i) => (i === index ? { ...med, [field]: value } : med)))
    }, [])

    const deleteMedication = useCallback((index: number) => {
        setMedications((prev) => prev.filter((_, i) => i !== index))
    }, [])

    const savePrescription = useCallback(async (prescriptionData: any): Promise<Prescription | null> => {
        if (!initialAppointmentId) return null
        try {
            setSaving(true)
            const saved = await pharmacyService.createPrescription(initialAppointmentId, prescriptionData)
            setPrescription(saved)
            setCurrentPrescriptionId(saved.prescriptionId)
            message.success("Lưu toa thuốc thành công")
            return saved
        } catch (error) {
            console.error("Error saving prescription:", error)
            message.error("Không thể lưu toa thuốc")
            return null
        } finally {
            setSaving(false)
        }
    }, [initialAppointmentId])

    const loadExistingPrescription = useCallback((prescription: Prescription | null) => {
        if (prescription) {
            setPrescription(prescription)
            setCurrentPrescriptionId(prescription.prescriptionId)
            setMedications(prescription.prescriptionDetails || [])
        } else {
            setMedications([])
        }
    }, [])

    const checkExistingPrescription = useCallback(async (): Promise<Prescription | null> => {
        if (!initialAppointmentId) return null
        try {
            const existing = await pharmacyService.getCurrentPrescriptionByAppointmentId(initialAppointmentId)
            if (existing.prescriptionId) {
                loadExistingPrescription(existing)
                return existing
            }
            return null
        } catch (error) {
            console.error("Error checking existing prescription:", error)
            return null
        }
    }, [initialAppointmentId, loadExistingPrescription])

    const resetPrescriptionLoadState = useCallback(() => {
        hasLoadedRef.current = false
        setMedications([])
        setCurrentPrescriptionId(null)
    }, [])

    const refreshAll = useCallback(async (appointmentId: number) => {
        const promises = [
            fetchPatientDetail(appointmentId),
            fetchPrescription(appointmentId),
            fetchServiceOrders(appointmentId),
            fetchAppointmentNotes(appointmentId),
        ]
        await Promise.all(promises)
    }, [fetchPatientDetail, fetchPrescription, fetchServiceOrders, fetchAppointmentNotes])

    const refreshSpecific = useCallback(
        (appointmentId: number, targets: ("patient" | "prescription" | "services" | "notes")[]) => {
            const promises = []
            if (targets.includes("patient")) promises.push(fetchPatientDetail(appointmentId))
            if (targets.includes("prescription")) promises.push(fetchPrescription(appointmentId))
            if (targets.includes("services")) promises.push(fetchServiceOrders(appointmentId))
            if (targets.includes("notes")) promises.push(fetchAppointmentNotes(appointmentId))
            return Promise.all(promises)
        },
        [fetchPatientDetail, fetchPrescription, fetchServiceOrders, fetchAppointmentNotes],
    )

    useEffect(() => {
        if (initialAppointmentId) {
            refreshAll(initialAppointmentId)
        }
    }, [initialAppointmentId, refreshAll])

    return {
        patientDetail,
        prescription,
        serviceOrders,
        appointmentNotes,
        appointment,
        medications,
        currentPrescriptionId,
        searchInput,
        searchLoading,
        loading,
        prescriptionLoading,
        serviceOrdersLoading,
        notesLoading,
        saving,
        fetchPatientDetail,
        fetchPrescription,
        fetchServiceOrders,
        fetchAppointmentNotes,
        createAppointmentNote,
        updateAppointmentNote,
        deleteAppointmentNote,
        updatePatientInfo,
        updateVitalSigns,
        searchMedicines,
        addMedicine,
        updateMedicationField,
        deleteMedication,
        savePrescription,
        loadExistingPrescription,
        checkExistingPrescription,
        resetPrescriptionLoadState,
        setSearchInput,
        setMedications,
        refreshAll,
        refreshSpecific,
    }
}
