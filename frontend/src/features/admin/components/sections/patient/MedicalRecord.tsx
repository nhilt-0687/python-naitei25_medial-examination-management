import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { useEffect } from "react";
import InfoField from "../../form/InfoField";
import type {
  PrescriptionResponse,
  PrescriptionDetailResponse,
} from "../../../types/pharmacy";


interface MedicalRecordProps {
  prescription: PrescriptionResponse
  onEdit?: (prescriptionId: number) => void
  onDelete?: (prescriptionId: number) => void
}

const MedicalRecord: React.FC<MedicalRecordProps> = ({ prescription, onEdit, onDelete }) => {
  const { isOpen, openModal, closeModal } = useModal()

  // Debug: Log the prescription data when component renders
  console.log("MedicalRecord component - prescription data:", prescription)

  const prescriptionId = prescription.id || null

  // Lấy thông tin tổng hợp từ prescription
  const {
    createdAt,
    note,
    diagnosis,
    prescriptionDetails,
    systolicBloodPressure,
    diastolicBloodPressure,
    heartRate,
    bloodSugar,
  } = prescription

  console.log("MedicalRecord component - extracted prescriptionId:", prescriptionId, typeof prescriptionId)

  // Debug: Log prescription details specifically
  console.log("MedicalRecord component - prescription details:", prescriptionDetails)

  // Validate prescription details
  useEffect(() => {
    if (prescriptionDetails && prescriptionDetails.length > 0) {
      prescriptionDetails.forEach((detail, index) => {
        console.log(`Prescription Detail ${index}:`, {
          detailId: detail.detailId,
          quantity: detail.quantity,
          quantityType: typeof detail.quantity,
          medicineName: detail.medicine?.medicineName,
          medicine: detail.medicine,
          dosage: detail.dosage,
          frequency: detail.frequency,
          duration: detail.duration,
        })

        if (!detail.quantity || detail.quantity === 0) {
          console.warn(`Warning: Prescription detail ${detail.detailId} has zero or undefined quantity!`)
        }
      })
    }
  }, [prescriptionDetails])

  // Helper function để format sinh hiệu an toàn
  const formatVitalSigns = () => {
    const parts = []

    console.log("=== DEBUG: Formatting vital signs ===")
    console.log("systolicBloodPressure:", systolicBloodPressure, typeof systolicBloodPressure)
    console.log("diastolicBloodPressure:", diastolicBloodPressure, typeof diastolicBloodPressure)
    console.log("heartRate:", heartRate, typeof heartRate)
    console.log("bloodSugar:", bloodSugar, typeof bloodSugar)

    // Xử lý huyết áp
    if (systolicBloodPressure && diastolicBloodPressure) {
      parts.push(`Huyết áp: ${systolicBloodPressure}/${diastolicBloodPressure} mmHg`)
    } else if (systolicBloodPressure || diastolicBloodPressure) {
      parts.push(`Huyết áp: ${systolicBloodPressure || "?"}/${diastolicBloodPressure || "?"} mmHg`)
    }

    // Xử lý nhịp tim
    if (heartRate) {
      parts.push(`Nhịp tim: ${heartRate} bpm`)
    }

    // Xử lý đường huyết
    if (bloodSugar) {
      parts.push(`Đường huyết: ${bloodSugar} mg/dL`)
    }

    const result = parts.length > 0 ? parts.join(", ") : "Chưa có thông tin sinh hiệu"
    console.log("=== Formatted vital signs result ===", result)
    return result
  }

  // Helper function để format đơn thuốc an toàn
  const formatPrescriptionSummary = () => {
    if (!prescriptionDetails || prescriptionDetails.length === 0) {
      return "Chưa có đơn thuốc"
    }

    return prescriptionDetails
      .map((detail) => {
        const medicineName = detail.medicine?.medicineName || "Thuốc không xác định"
        const dosage = detail.dosage || ""
        const frequency = detail.frequency || ""
        const duration = detail.duration || ""
        const quantity = detail.quantity || 0

        const parts = [medicineName]
        if (dosage) parts.push(dosage)
        if (frequency) parts.push(frequency)
        if (duration) parts.push(duration)
        parts.push(`(SL: ${quantity})`)

        return parts.join(" - ")
      })
      .join("; ")
  }

  // Tổng hợp đơn thuốc dạng bảng
  const renderPrescriptionTable = () => {
    console.log("Rendering prescription table with details:", prescriptionDetails)

    if (!prescriptionDetails || prescriptionDetails.length === 0) {
      return <div className="p-4 text-center text-gray-500">Chưa có thông tin đơn thuốc</div>
    }

    return (
      <table className="w-full text-sm bg-gray-50">
        <thead>
          <tr className="bg-white border-b border-gray-200">
            <th className="p-2 text-left">Tên thuốc</th>
            <th className="p-2 text-left">Giá (₫)</th>
            <th className="p-2 text-left">Liều dùng</th>
            <th className="p-2 text-left">Hướng dẫn</th>
            <th className="p-2 text-left">Số lượng</th>
            <th className="p-2 text-left">Thành tiền (₫)</th>
          </tr>
        </thead>
        <tbody>
          {prescriptionDetails.map((detail: PrescriptionDetailResponse) => {
            console.log(
              `Detail ${detail.detailId}: quantity=${detail.quantity}, medicine=${detail.medicine?.medicineName}`,
            )

            const medicineName = detail.medicine?.medicineName || "Thuốc không xác định"
            const price = detail.medicine?.price || 0
            const dosage = detail.dosage || ""
            const frequency = detail.frequency || ""
            const duration = detail.duration || ""
            const quantity = detail.quantity || 0
            const totalPrice = price && quantity ? price * quantity : 0

            return (
              <tr key={detail.detailId} className="border-b border-gray-200">
                <td className="p-2">{medicineName}</td>
                <td className="p-2">{price > 0 ? price.toLocaleString() : "0"}</td>
                <td className="p-2">{dosage}</td>
                <td className="p-2">
                  {frequency && duration ? `${frequency} - ${duration}` : frequency || duration || ""}
                </td>
                <td className="p-2 font-semibold text-blue-600">{quantity}</td>
                <td className="p-2 font-semibold text-green-600">
                  {totalPrice > 0 ? totalPrice.toLocaleString() : "0"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 p-4 justify-between bg-gray-50/50 rounded-lg border-gray-200 border">
        {/* Thông tin bệnh án */}
        <div className="mb-6">
          <h3 className="text-gray-600 font-semibold">Bệnh án #{prescriptionId || "N/A"}</h3>
          <span className="text-gray-400 text-sm font-semibold">
            {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : ""}
          </span>
        </div>

        {/* Chi tiết bệnh án */}
        <div className="md:w-[55%]">
          <p className="text-gray-600 truncate">
            <span className="font-medium text-gray-800">Lưu ý: </span>
            {note || "Không có ghi chú"}
          </p>
          <p className="text-gray-600 truncate">
            <span className="font-medium text-gray-800">Chẩn đoán: </span>
            {diagnosis || "Chưa có chẩn đoán"}
          </p>
          <p className="text-gray-600 truncate">
            <span className="font-medium text-gray-800">Sinh hiệu: </span>
            {formatVitalSigns()}
          </p>
          <p className="text-gray-600 truncate">
            <span className="font-medium text-gray-800">Đơn thuốc: </span>
            {formatPrescriptionSummary()}
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="flex gap-2">
          {/* Nút xem */}
          <button
            className="flex size-10 justify-center items-center gap-1 px-3 py-1 text-xs font-medium text-sky-700 bg-sky-100 rounded-md hover:bg-blue-200 transition-colors"
            onClick={openModal}
            title="Xem chi tiết"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Nút chỉnh sửa */}
          <button
            className="flex size-10 justify-center items-center gap-1 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            onClick={() => prescriptionId && onEdit?.(prescriptionId)}
            title="Chỉnh sửa bệnh án"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>

          {/* Nút xóa */}
          <button
            className="flex size-10 justify-center items-center gap-1 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
            onClick={() => prescriptionId && onDelete?.(prescriptionId)}
            title="Xóa bệnh án"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal khi nhấn vào button xem */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[900px] min-w-[300px] p-6 lg:p-10 mb-10">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Bệnh án #{prescriptionId || "N/A"}</h3>

          <div className="space-y-3">
            <InfoField label="Lý do khám" value={note || "Không có ghi chú"} />
            <InfoField label="Chẩn đoán" value={diagnosis || "Chưa có chẩn đoán"} />
            <InfoField label="Sinh hiệu" value={formatVitalSigns()} />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500">Đơn thuốc</h4>
            <div className="overflow-x-auto border bg-gray-50 border-gray-200 rounded-md">
              {renderPrescriptionTable()}
            </div>
          </div>
        </div>

        <div className="mt-6 w-full">
          <button
            className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
            onClick={() => console.log("View Invoice clicked")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            Xem hóa đơn
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default MedicalRecord
