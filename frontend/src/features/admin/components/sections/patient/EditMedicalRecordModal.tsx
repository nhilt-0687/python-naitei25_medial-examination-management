"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Modal } from "../../ui/modal"
import type {
  UpdatePrescriptionRequest,
  PrescriptionDetailRequest,
  PrescriptionResponse,
  Medicine,
} from "../../../types/pharmacy"
import { pharmacyService } from "../../../services/pharmacyService"

interface EditMedicalRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (prescriptionId: number, data: UpdatePrescriptionRequest) => Promise<void>
  prescription: PrescriptionResponse | null
}

export default function EditMedicalRecordModal({
  isOpen,
  onClose,
  onSubmit,
  prescription,
}: EditMedicalRecordModalProps) {
  const [form, setForm] = useState<UpdatePrescriptionRequest>({
    follow_up_date: "", // CHANGED: from followUpDate
    is_follow_up: false, // CHANGED: from isFollowUp
    diagnosis: "",
    systolic_blood_pressure: 120, // CHANGED: from systolicBloodPressure
    diastolic_blood_pressure: 80, // CHANGED: from diastolicBloodPressure
    heart_rate: 70, // CHANGED: from heartRate
    blood_sugar: 90, // CHANGED: from bloodSugar
    note: "",
    prescription_details: [], // CHANGED: from prescriptionDetails
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [medicines, setMedicines] = useState<Medicine[]>([])

  // State for frequency inputs (times and unit)
  const [frequencyInputs, setFrequencyInputs] = useState<{ [key: number]: { times: string; unit: string } }>({})

  // Load medicines on component mount
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const medicineList = await pharmacyService.getAllMedicines()
        setMedicines(medicineList)
      } catch (error) {
        console.error("Error loading medicines:", error)
      }
    }
    loadMedicines()
  }, [])

  // Initialize form when prescription changes
  useEffect(() => {
    if (prescription && isOpen) {
      // Parse frequency for existing prescription details
      const initialFrequencyInputs: { [key: number]: { times: string; unit: string } } = {}

      const prescriptionDetails = prescription.prescription_details.map((detail, index) => {
        // CHANGED: from prescriptionDetails
        // Parse frequency like "2 lần/ngày" into times and unit
        const frequencyMatch = detail.frequency.match(/(\d+)\s*lần\/(.+)/)
        if (frequencyMatch) {
          initialFrequencyInputs[index] = {
            times: frequencyMatch[1],
            unit: frequencyMatch[2],
          }
        } else {
          initialFrequencyInputs[index] = { times: "", unit: "ngày" }
        }

        return {
          medicine_id: detail.medicine.medicine_id, // CHANGED: from medicineId
          dosage: detail.dosage,
          frequency: detail.frequency,
          duration: detail.duration,
          quantity: detail.quantity,
          prescription_notes: detail.prescription_notes || "", // CHANGED: from prescriptionNotes
        }
      })

      setFrequencyInputs(initialFrequencyInputs)

      setForm({
        follow_up_date: prescription.follow_up_date || "", // CHANGED: from followUpDate
        is_follow_up: prescription.is_follow_up, // CHANGED: from isFollowUp
        diagnosis: prescription.diagnosis,
        systolic_blood_pressure: prescription.systolic_blood_pressure, // CHANGED: from systolicBloodPressure
        diastolic_blood_pressure: prescription.diastolic_blood_pressure, // CHANGED: from diastolicBloodPressure
        heart_rate: prescription.heart_rate, // CHANGED: from heartRate
        blood_sugar: prescription.blood_sugar, // CHANGED: from bloodSugar
        note: prescription.note || "",
        prescription_details: prescriptionDetails, // CHANGED: from prescriptionDetails
      })
      setErrors({})
    }
  }, [prescription, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.diagnosis?.trim()) {
      newErrors.diagnosis = "Chẩn đoán là bắt buộc"
    }

    if (form.systolic_blood_pressure && (form.systolic_blood_pressure < 80 || form.systolic_blood_pressure > 200)) {
      // CHANGED: from systolicBloodPressure
      newErrors.systolic_blood_pressure = "Huyết áp tâm thu phải từ 80-200 mmHg" // CHANGED: from systolicBloodPressure
    }

    if (form.diastolic_blood_pressure && (form.diastolic_blood_pressure < 40 || form.diastolic_blood_pressure > 120)) {
      // CHANGED: from diastolicBloodPressure
      newErrors.diastolic_blood_pressure = "Huyết áp tâm trương phải từ 40-120 mmHg" // CHANGED: from diastolicBloodPressure
    }

    if (form.heart_rate && (form.heart_rate < 40 || form.heart_rate > 200)) {
      // CHANGED: from heartRate
      newErrors.heart_rate = "Nhịp tim phải từ 40-200 bpm" // CHANGED: from heartRate
    }

    if (form.blood_sugar && (form.blood_sugar < 50 || form.blood_sugar > 500)) {
      // CHANGED: from bloodSugar
      newErrors.blood_sugar = "Đường huyết phải từ 50-500 mg/dL" // CHANGED: from bloodSugar
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !prescription) {
      return
    }

    // Debug: Log form data before submitting
    console.log("Form data being submitted:", form)
    console.log("Prescription details:", form.prescription_details) // CHANGED: from prescriptionDetails
    form.prescription_details?.forEach((detail, index) => {
      // CHANGED: from prescriptionDetails
      console.log(`Detail ${index}:`, detail)
      console.log(`Quantity for detail ${index}:`, detail.quantity, typeof detail.quantity)
    })

    try {
      setLoading(true)
      await onSubmit(prescription.id, form) // Sử dụng prescription.id
      onClose()
    } catch (error) {
      console.error("Error updating medical record:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  // Functions for managing prescription details
  const addPrescriptionDetail = () => {
    const newDetail: PrescriptionDetailRequest = {
      medicine_id: 0, // CHANGED: from medicineId
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 1,
      prescription_notes: "", // CHANGED: from prescriptionNotes
    }
    const newIndex = form.prescription_details?.length || 0 // CHANGED: from prescriptionDetails

    // Initialize frequency inputs for the new detail
    setFrequencyInputs((prev) => ({
      ...prev,
      [newIndex]: { times: "", unit: "ngày" },
    }))

    setForm((prev) => ({
      ...prev,
      prescription_details: [...(prev.prescription_details || []), newDetail], // CHANGED: from prescriptionDetails
    }))
  }

  const updatePrescriptionDetail = (index: number, field: keyof PrescriptionDetailRequest, value: string | number) => {
    // Process value based on field type
    let processedValue = value
    if (field === "quantity") {
      // Ensure quantity is always a positive integer
      const numValue = typeof value === "string" ? Number.parseInt(value, 10) : value
      processedValue = Math.max(1, isNaN(numValue) ? 1 : numValue)
      console.log(
        `Updating quantity for index ${index}: ${value} -> ${processedValue} (type: ${typeof processedValue})`,
      )
    } else if (field === "medicine_id") {
      // CHANGED: from medicineId
      // Ensure medicine_id is a number
      const numValue = typeof value === "string" ? Number.parseInt(value, 10) : value
      processedValue = isNaN(numValue) ? 0 : numValue
    }

    setForm((prev) => ({
      ...prev,
      prescription_details:
        prev.prescription_details?.map((detail, i) =>
          i === index ? { ...detail, [field]: processedValue } : detail,
        ) || // CHANGED: from prescriptionDetails
        [],
    }))
  }

  const removePrescriptionDetail = (index: number) => {
    // Remove the frequency input for this index
    setFrequencyInputs((prev) => {
      const newFrequencyInputs = { ...prev }
      delete newFrequencyInputs[index]

      // Reindex remaining frequency inputs
      const reindexed: { [key: number]: { times: string; unit: string } } = {}
      Object.keys(newFrequencyInputs)
        .map((k) => Number.parseInt(k))
        .filter((k) => k > index)
        .forEach((k) => {
          reindexed[k - 1] = newFrequencyInputs[k]
        })

      // Keep frequency inputs with index less than removed index
      Object.keys(newFrequencyInputs)
        .map((k) => Number.parseInt(k))
        .filter((k) => k < index)
        .forEach((k) => {
          reindexed[k] = newFrequencyInputs[k]
        })

      return reindexed
    })

    setForm((prev) => ({
      ...prev,
      prescription_details: prev.prescription_details?.filter((_, i) => i !== index) || [], // CHANGED: from prescriptionDetails
    }))
  }

  // Helper functions for frequency
  const updateFrequencyTimes = (index: number, times: string) => {
    const currentFreq = frequencyInputs[index] || { times: "", unit: "ngày" }
    const newFreq = { ...currentFreq, times }
    setFrequencyInputs((prev) => ({ ...prev, [index]: newFreq }))

    // Update the actual form data
    const frequencyString = times && newFreq.unit ? `${times} lần/${newFreq.unit}` : ""
    updatePrescriptionDetail(index, "frequency", frequencyString)
  }

  const updateFrequencyUnit = (index: number, unit: string) => {
    const currentFreq = frequencyInputs[index] || { times: "", unit: "ngày" }
    const newFreq = { ...currentFreq, unit }
    setFrequencyInputs((prev) => ({ ...prev, [index]: newFreq }))

    // Update the actual form data
    const frequencyString = currentFreq.times && unit ? `${currentFreq.times} lần/${unit}` : ""
    updatePrescriptionDetail(index, "frequency", frequencyString)
  }

  const getFrequencyTimes = (index: number) => {
    return frequencyInputs[index]?.times || ""
  }

  const getFrequencyUnit = (index: number) => {
    return frequencyInputs[index]?.unit || "ngày"
  }

  if (!prescription) return null
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[700px] lg:p-8 mt-[5vh] mb-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 px-2 pb-4">
          <h5 className="mb-4 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
            Chỉnh sửa bệnh án
          </h5>
        </div>

        <div className="flex-1 px-2">
          <form id="edit-medical-record-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chẩn đoán <span className="text-red-500">*</span>
              </label>
              <input
                name="diagnosis"
                value={form.diagnosis || ""}
                onChange={handleChange}
                type="text"
                placeholder="Nhập chẩn đoán"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                title="Nhập chẩn đoán của bệnh nhân"
                required
              />
              {errors.diagnosis && <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do khám</label>
              <textarea
                name="note"
                value={form.note || ""}
                onChange={handleChange}
                placeholder="Nhập lý do khám và ghi chú"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0 min-h-[80px] resize-none"
                title="Nhập lý do khám và ghi chú thêm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Huyết áp tâm thu <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="systolic_blood_pressure" // CHANGED: from systolicBloodPressure
                  value={form.systolic_blood_pressure || 120} // CHANGED: from systolicBloodPressure
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                  min={80}
                  max={200}
                  title="Nhập huyết áp tâm thu (mmHg)"
                  placeholder="120"
                  required
                />
                {errors.systolic_blood_pressure && ( // CHANGED: from systolicBloodPressure
                  <p className="mt-1 text-sm text-red-600">{errors.systolic_blood_pressure}</p> // CHANGED: from systolicBloodPressure
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Huyết áp tâm trương <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="diastolic_blood_pressure" // CHANGED: from diastolicBloodPressure
                  value={form.diastolic_blood_pressure || 80} // CHANGED: from diastolicBloodPressure
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                  min={40}
                  max={120}
                  title="Nhập huyết áp tâm trương (mmHg)"
                  placeholder="80"
                  required
                />
                {errors.diastolic_blood_pressure && ( // CHANGED: from diastolicBloodPressure
                  <p className="mt-1 text-sm text-red-600">{errors.diastolic_blood_pressure}</p> // CHANGED: from diastolicBloodPressure
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhịp tim <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="heart_rate" // CHANGED: from heartRate
                  value={form.heart_rate || 70} // CHANGED: from heartRate
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                  min={40}
                  max={200}
                  title="Nhập nhịp tim (bpm)"
                  placeholder="70"
                  required
                />
                {errors.heart_rate && <p className="mt-1 text-sm text-red-600">{errors.heart_rate}</p>}{" "}
                {/* CHANGED: from heartRate */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đường huyết <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="blood_sugar" // CHANGED: from bloodSugar
                  value={form.blood_sugar || 90} // CHANGED: from bloodSugar
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                  min={50}
                  max={500}
                  title="Nhập nồng độ đường huyết (mg/dL)"
                  placeholder="90"
                  required
                />
                {errors.blood_sugar && <p className="mt-1 text-sm text-red-600">{errors.blood_sugar}</p>}{" "}
                {/* CHANGED: from bloodSugar */}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_follow_up" // CHANGED: from isFollowUp
                checked={form.is_follow_up || false} // CHANGED: from isFollowUp
                onChange={handleChange}
                className="h-4 w-4 text-base-600 focus:ring-base-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Cần tái khám</label>
            </div>

            {form.is_follow_up && ( // CHANGED: from isFollowUp
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tái khám</label>
                <input
                  type="date"
                  name="follow_up_date" // CHANGED: from followUpDate
                  value={form.follow_up_date || ""} // CHANGED: from followUpDate
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                />
              </div>
            )}

            {/* Prescription Details Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Chi tiết đơn thuốc</label>
                <button
                  type="button"
                  onClick={addPrescriptionDetail}
                  className="px-3 py-2 text-sm font-medium text-white bg-rose-800 rounded-lg hover:bg-rose-900"
                >
                  + Thêm thuốc
                </button>
              </div>
              {form.prescription_details && form.prescription_details.length > 0 ? ( // CHANGED: from prescriptionDetails
                form.prescription_details.map(
                  (
                    detail,
                    index, // CHANGED: from prescriptionDetails
                  ) => (
                    <div key={index} className="p-4 mb-4 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-start mb-3">
                        <h6 className="font-medium text-gray-700">Thuốc {index + 1}</h6>
                        <button
                          type="button"
                          onClick={() => removePrescriptionDetail(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Thuốc</label>
                          <select
                            value={detail.medicine_id} // CHANGED: from medicineId
                            onChange={(e) => updatePrescriptionDetail(index, "medicine_id", Number(e.target.value))} // CHANGED: from medicineId
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                            title="Chọn thuốc từ danh sách"
                          >
                            <option value={0}>Chọn thuốc</option>
                            {medicines.map((med) => (
                              <option key={med.medicineId} value={med.medicineId}>
                                {med.medicineName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Liều lượng</label>
                          <input
                            type="text"
                            value={detail.dosage}
                            onChange={(e) => updatePrescriptionDetail(index, "dosage", e.target.value)}
                            placeholder="VD: 500mg"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                            title="Nhập liều lượng thuốc"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số lần</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={getFrequencyTimes(index)}
                              onChange={(e) => updateFrequencyTimes(index, e.target.value)}
                              placeholder="2"
                              className="w-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                              min="1"
                              title="Nhập số lần dùng"
                            />

                            <select
                              value={getFrequencyUnit(index)}
                              onChange={(e) => updateFrequencyUnit(index, e.target.value)}
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                              title="Chọn đơn vị thời gian"
                            >
                              <option value="ngày">ngày</option>
                              <option value="tuần">tuần</option>
                              <option value="tháng">tháng</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                          <input
                            type="text"
                            value={detail.duration}
                            onChange={(e) => updatePrescriptionDetail(index, "duration", e.target.value)}
                            placeholder="VD: 7 ngày"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                            title="Nhập thời gian dùng thuốc"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={detail.quantity || 1} // Đảm bảo hiển thị 1 nếu quantity là 0 hoặc null/undefined
                            onChange={(e) => {
                              const inputValue = e.target.value
                              const quantity = inputValue === "" ? 1 : Math.max(1, Number.parseInt(inputValue, 10) || 1)
                              console.log("Updating quantity for index", index + ":", quantity, typeof quantity)
                              updatePrescriptionDetail(index, "quantity", quantity)
                            }}
                            min="1"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                            title="Nhập số lượng thuốc"
                            placeholder="1" // Thêm placeholder
                            required // Đảm bảo trường này là bắt buộc
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                          <textarea
                            value={detail.prescription_notes || ""} // CHANGED: from prescriptionNotes
                            onChange={(e) => updatePrescriptionDetail(index, "prescription_notes", e.target.value)} // CHANGED: from prescriptionNotes
                            placeholder="Ghi chú thêm về cách dùng thuốc"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0 min-h-[80px] resize-none"
                            title="Nhập ghi chú về cách dùng"
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border">
                  Chưa có thuốc nào trong đơn. Nhấn "Thêm thuốc" để thêm.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 pt-4 px-2">
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={handleClose}
              type="button"
              className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Hủy
            </button>
            <button
              form="edit-medical-record-form"
              type="submit"
              disabled={loading}
              className="flex justify-center rounded-lg bg-base-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-base-900 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Cập nhật bệnh án"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
