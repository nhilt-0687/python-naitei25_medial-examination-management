"use client"

import React, { useRef, useEffect } from "react"
import { Button, message } from "antd"
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons"
import type { Prescription } from "../types/prescription"
import type { PatientInfo } from "../types/patient"

// Declare html2pdf globally
declare global {
  interface Window {
    html2pdf: any
  }
}

interface PrescriptionPDFProps {
  prescription: Prescription
  patientName?: string
  patientInfo?: PatientInfo
  showControls?: boolean
  className?: string
}

export const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({
  prescription,
  patientName,
  patientInfo,
  showControls = true,
  className = "",
}) => {
  const prescriptionRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  const hospitalData = {
    name: "BỆNH VIỆN ĐA KHOA QUỐC TẾ WECARE",
    address: "Số 1 Hàn Thuyên - Phường Linh Trung - Tp.Thủ Đức - Tp.Hồ Chí Minh",
    phone: "028 4567896",
    website: "www.wecarehospital.com.vn",
    email: "wecare@hospital.com.vn",
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("vi-VN")
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })
  }

  const loadHtml2Pdf = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (window.html2pdf) {
        resolve(window.html2pdf)
        return
      }

      const existingScript = document.querySelector('script[src*="html2pdf"]')
      if (existingScript) {
        const checkInterval = setInterval(() => {
          if (window.html2pdf) {
            clearInterval(checkInterval)
            resolve(window.html2pdf)
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkInterval)
          reject(new Error("Timeout loading html2pdf"))
        }, 10000)
        return
      }

      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
      script.async = true
      script.onload = () => resolve(window.html2pdf)
      script.onerror = () => reject(new Error("Failed to load html2pdf"))
      document.body.appendChild(script)
    })
  }

  const handleDownloadPDF = async () => {
    if (!prescriptionRef.current) return
    setIsGenerating(true)

    try {
      const html2pdf = await loadHtml2Pdf()
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `prescription_${prescription.prescriptionId}_${new Date().toISOString().split("T")[0]}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(prescriptionRef.current)
        .save()
      message.success("Tải PDF thành công")
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error generating PDF:`, error)
      message.error("Không thể tạo PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = async () => {
    if (!prescriptionRef.current) return
    setIsGenerating(true)

    try {
      const html2pdf = await loadHtml2Pdf()
      const pdf = await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(prescriptionRef.current)
        .toPdf()
      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.text(`Trang ${i} / ${totalPages}`, pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 10, {
          align: "center",
        })
      }
      pdf.autoPrint()
      window.open(pdf.output("bloburl"), "_blank")
      message.success("In PDF thành công")
    } catch (error) {
      console.error(`[${new Date().toLocaleString("vi-VN")}] Error printing PDF:`, error)
      message.error("Không thể in PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    return () => {
      const scripts = document.querySelectorAll('script[src*="html2pdf"]')
      scripts.forEach((script) => document.body.removeChild(script))
    }
  }, [])

  return (
    <div>
      <div ref={prescriptionRef} className={`p-6 bg-white ${className}`}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase">{hospitalData.name}</h1>
          <p className="text-sm">{hospitalData.address}</p>
          <p className="text-sm">Điện thoại: {hospitalData.phone} | Website: {hospitalData.website} | Email: {hospitalData.email}</p>
          <p className="text-sm mt-2">Ngày xuất: {formatDateTime(new Date().toISOString())}</p>
        </div>

        {/* Patient Info */}
        <div className="flex justify-between mb-6">
          <div>
            <p><strong>Bệnh nhân:</strong> {patientName || patientInfo?.fullName || "Không xác định"}</p>
            <p><strong>Mã bệnh nhân:</strong> {patientInfo?.patientId || "Không xác định"}</p>
          </div>
          <div className="text-right">
            <p><strong>Ngày kê đơn:</strong> {formatDate(prescription.createdAt)}</p>
            <p><strong>Giờ:</strong> {formatDateTime(prescription.createdAt)}</p>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-2 bg-blue-50 rounded">
            <p className="text-xs text-gray-500">Huyết áp tâm thu</p>
            <p className="font-bold">{prescription.systolicBloodPressure} mmHg</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <p className="text-xs text-gray-500">Huyết áp tâm trương</p>
            <p className="font-bold">{prescription.diastolicBloodPressure} mmHg</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <p className="text-xs text-gray-500">Nhịp tim</p>
            <p className="font-bold">{prescription.heartRate} bpm</p>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <p className="text-xs text-gray-500">Đường huyết</p>
            <p className="font-bold">{prescription.bloodSugar} mg/dL</p>
          </div>
        </div>

        {/* Diagnosis and Notes */}
        <div className="mb-6">
          <p><strong>Chẩn đoán:</strong> {prescription.diagnosis}</p>
          <p><strong>Ghi chú bác sĩ:</strong> {prescription.note || "Không có"}</p>
        </div>

        {/* Prescription Details */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Tên thuốc</th>
              <th className="border p-2">Liều lượng</th>
              <th className="border p-2">Đơn vị</th>
              <th className="border p-2">Tần suất</th>
              <th className="border p-2">Cách dùng</th>
              <th className="border p-2">Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {prescription.prescriptionDetails.map((detail) => (
              <tr key={detail.detailId} className="border">
                <td className="border p-2">{detail.medicine.medicineName}</td>
                <td className="border p-2">{detail.dosage}</td>
                <td className="border p-2">{detail.unit || detail.medicine.unit}</td>
                <td className="border p-2">{detail.frequency}</td>
                <td className="border p-2">{detail.prescriptionNotes || "Không có"}</td>
                <td className="border p-2 text-center">{detail.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="mb-6">
          <p><strong>Tổng số loại thuốc:</strong> {prescription.prescriptionDetails.length}</p>
          <p><strong>Tổng giá trị:</strong> {prescription.prescriptionDetails.reduce((sum, detail) => sum + detail.medicine.price * detail.quantity, 0).toLocaleString("vi-VN")} VNĐ</p>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-sm space-y-3" style={{ marginLeft: "220px" }}>
          <div><span className="font-bold">Lời dặn:</span> {prescription.note || "Không có"}</div>
          <div><span className="font-bold">Tái khám:</span> {prescription.followUpDate ? `vào ngày ${formatDate(prescription.followUpDate)}` : "Không"}</div>
          <div className="leading-relaxed">
            Người bệnh đăng ký tái khám TRƯỚC ngày khám qua ứng dụng WeCare hoặc đăng ký tái khám tại các quầy Đăng ký khám bệnh
          </div>
        </div>

        {/* Signature */}
        <div className="flex justify-end mt-12">
          <div className="text-center text-sm">
            <div className="w-40 h-12 border-b border-black mb-2 relative bg-gray-50">
              <span className="absolute right-2 bottom-1 italic text-gray-500 text-sm">Signature ✓</span>
            </div>
            <div className="font-bold">Bác sĩ khám bệnh</div>
            <div className="mt-1">Ngày ký: {formatDateTime(prescription.createdAt || new Date().toISOString())}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-black">
          <div className="text-sm text-center mb-3">
            *Đơn thuốc dùng một lần. Khi cần hỗ trợ, xin vui lòng liên hệ số điện thoại: {hospitalData.phone}.
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex-1">
              <p>Cài đặt ứng dụng WeCare (quét mã QR)</p>
              <p>để đăng ký khám bệnh, thanh toán viện phí và xem Hồ sơ sức khỏe.</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs">
              QR
            </div>
          </div>
        </div>
      </div>

      {showControls && (
        <div className="mt-4 flex space-x-4">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
            loading={isGenerating}
            type="primary"
          >
            Tải PDF
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            loading={isGenerating}
            type="default"
          >
            In
          </Button>
        </div>
      )}
    </div>
  )
}
