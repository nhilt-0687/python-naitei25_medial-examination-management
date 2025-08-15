"use client"

import type React from "react"
import { Modal, Typography, Row, Col, Divider, Table } from "antd"
import { CalendarOutlined, UserOutlined } from "@ant-design/icons"
import type { Prescription } from "../types/prescription"
import { PrescriptionPDF } from "./PrescriptionPDF"
import type { PatientInfo } from "../types/patient"
import { useTranslation } from "react-i18next"

const { Text, Title } = Typography

interface PrescriptionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  prescription: Prescription | null
  patientInfo?: PatientInfo
}

export const PrescriptionHistoryModal: React.FC<PrescriptionHistoryModalProps> = ({
  isOpen,
  onClose,
  prescription,
  patientInfo,
}) => {
  const { t } = useTranslation()
  if (!prescription) return null
  // Normalize possible API shapes (camelCase vs snake_case) and guard undefineds
  const createdAt: string | undefined = (prescription as any).createdAt || (prescription as any).created_at
  const systolicBP = (prescription as any).systolicBloodPressure ?? (prescription as any).systolic_blood_pressure
  const diastolicBP = (prescription as any).diastolicBloodPressure ?? (prescription as any).diastolic_blood_pressure
  const heartRate = (prescription as any).heartRate ?? (prescription as any).heart_rate
  const bloodSugar = (prescription as any).bloodSugar ?? (prescription as any).blood_sugar
  const diagnosis = (prescription as any).diagnosis
  const note = (prescription as any).note
  const details: any[] =
    (prescription as any).prescriptionDetails || (prescription as any).prescription_details || []

  const safeDate = (dateString?: string) => {
    if (!dateString) return "—"
    const d = new Date(dateString)
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("vi-VN")
  }
  const safeTime = (dateString?: string) => {
    if (!dateString) return "—"
    const d = new Date(dateString)
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
  }

  const columns = [
    {
      title: t("table.medicine"),
      key: "medicineName",
      render: (_: any, record: any) => {
        const med = record.medicine || {}
        // console.log("Medicine record:", record)
        const medName = med.medicineName || med.medicine_name || med.name || "—"
        const category = med.category || "—"
        const price = typeof med.price === "number" ? med.price : Number(med.price) || 0
        const unit = med.unit || med.unit_name || "—"
        return (
          <div>
            <div className="font-medium">{medName}</div>
            <div className="text-sm text-gray-500">{category}</div>
            <div className="text-xs text-gray-400">{price.toLocaleString("vi-VN")} {t("currency.vnd")}/{unit}</div>
          </div>
        )
      },
    },
    {
      title: t("table.dosage"),
      dataIndex: "dosage",
      key: "dosage",
      width: 100,
      render: (text: any) => <div className="text-center font-medium">{text ?? "—"}</div>,
    },
    {
      title: t("table.unit"),
      key: "unit",
      width: 70,
      render: (_: any, record: any) => <div className="font-medium">{(record.medicine?.unit || record.medicine?.unit_name || "—")}</div>,
    },
    { title: t("table.frequency"), dataIndex: "frequency", key: "frequency", width: 200 },
    { title: t("table.duration"), dataIndex: "duration", key: "duration", width: 100, render: (text: any) => <div className="text-center">{text ?? "—"}</div> },
    { title: t("table.quantity"), dataIndex: "quantity", key: "quantity", width: 100, render: (text: any) => <div className="text-center font-medium">{text ?? "—"}</div> },
  ]

  return (
    <Modal title={t("titles.prescriptionHistory")} open={isOpen} onCancel={onClose} footer={null} width={1200} style={{ top: 20 }}>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="bg-gray-50 p-4 rounded mb-4">
          <Row gutter={24}>
            <Col span={12}>
              <div className="flex items-center">
                <UserOutlined style={{ marginRight: 8 }} />
                <Text strong>{t("labels.patient")}: {patientInfo?.first_name } {patientInfo?.last_name}</Text>
              </div>
              <div><Text type="secondary">{t("labels.patientCode")}: {(patientInfo as any)?.id || t("table.unknown")}</Text></div>
            </Col>
            <Col span={12}>
              <div className="flex items-center justify-end">
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text strong>{t("labels.prescriptionDate")}: {safeDate(createdAt)}</Text>
              </div>
              <div className="text-right"><Text type="secondary">{t("labels.time")}: {safeTime(createdAt)}</Text></div>
            </Col>
          </Row>
        </div>

        <div className="mb-6">
          <Row gutter={24}>
            <Col span={6}>
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-sm text-gray-500">{t("labels.systolicBloodPressure")}</div>
                <div className="text-lg font-semibold text-blue-600">{systolicBP ?? "—"}</div>
                <div className="text-xs text-gray-400">{t("units.mmHg")}</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-500">{t("labels.diastolicBloodPressure")}</div>
                <div className="text-lg font-semibold text-green-600">{diastolicBP ?? "—"}</div>
                <div className="text-xs text-gray-400">{t("units.mmHg")}</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-sm text-gray-500">{t("labels.heartRate")}</div>
                <div className="text-lg font-semibold text-red-600">{heartRate ?? "—"}</div>
                <div className="text-xs text-gray-400">{t("units.bpm")}</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="text-sm text-gray-500">{t("labels.bloodSugar")}</div>
                <div className="text-lg font-semibold text-yellow-600">{bloodSugar ?? "—"}</div>
                <div className="text-xs text-gray-400">{t("units.mgPerDl")}</div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="mb-6">
          <Row gutter={24}>
            <Col span={12}>
              <Title level={5} className="mb-3">{t("labels.diagnosis")}</Title>
              <div className="p-3 bg-gray-50 rounded min-h-[100px]">
                <Text>{diagnosis || "—"}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Title level={5} className="mb-3">{t("labels.doctorNotes")}</Title>
              <div className="p-3 bg-gray-50 rounded min-h-[100px]">
                <Text>{note || t("labels.noNotes")}</Text>
              </div>
            </Col>
          </Row>
        </div>

        <Divider />

        <div className="mb-6">
          <Title level={5} className="mb-3">{t("medicalRecord.prescriptionDetails")}</Title>
          <Table
            columns={columns}
            dataSource={details}
            rowKey={(row) => row.detailId || row.detail_id || row.id}
            pagination={false}
            size="small"
            className="border border-gray-200 rounded"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <Row gutter={24}>
            <Col span={12}>
              <Text strong>{t("prescriptionHistory.totalMedicineTypes")}: </Text>
              <Text className="text-blue-600">{details.length}</Text>
            </Col>
            <Col span={12}>
              <Text strong>{t("prescriptionHistory.totalPrescriptionValue")}: </Text>
              <Text className="text-blue-600">
                {details.reduce((total, detail) => {
                  const price = typeof detail?.medicine?.price === "number" ? detail.medicine.price : Number(detail?.medicine?.price) || 0
                  const qty = Number(detail?.quantity) || 0
                  return total + price * qty
                }, 0).toLocaleString("vi-VN")} {t("currency.vnd")}
              </Text>
            </Col>
          </Row>
        </div>

        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <PrescriptionPDF
            prescription={{
              ...prescription,
              createdAt: createdAt as any,
              systolicBloodPressure: systolicBP as any,
              diastolicBloodPressure: diastolicBP as any,
              heartRate: heartRate as any,
              bloodSugar: bloodSugar as any,
              prescriptionDetails: details as any,
            } as any}
            patientName={patientInfo?.fullName}
            patientInfo={patientInfo}
            showControls={false}
          />
        </div>
      </div>
    </Modal>
  )
}
