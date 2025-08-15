"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Modal, Form, Input, Button, Typography, message, Row, Col, Card } from "antd"
import { SaveOutlined, ReloadOutlined, ExperimentOutlined } from "@ant-design/icons"
import type { ServiceOrder } from "../types/serviceOrder"
import type { ExaminationRoom } from "../types/examinationRoom"
import { updateServiceOrder } from "../services/serviceOrderService"

const { Text } = Typography
const { TextArea } = Input

interface TestResultDetailModalProps {
  isOpen: boolean
  onClose: () => void
  serviceOrder: ServiceOrder | null
  appointment?: any
  examinationRoom?: ExaminationRoom | null
  onUpdate?: (updatedOrder: ServiceOrder) => void
}

export const TestResultDetailModal: React.FC<TestResultDetailModalProps> = ({
  isOpen,
  onClose,
  serviceOrder,
  appointment,
  onUpdate,
}) => {
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (isOpen && serviceOrder) {
      form.setFieldsValue({
        result: serviceOrder.result || "",
        orderStatus: serviceOrder.orderStatus,
      })
    }
  }, [isOpen, serviceOrder, form])

  const handleSave = async () => {
    if (!serviceOrder) {
  message.error(t("errors.noServiceOrderInfo"))
      return
    }

    try {
      const values = await form.validateFields()
      setSaving(true)

      const updateData: Partial<ServiceOrder> = {
        ...serviceOrder,
        orderStatus: values.orderStatus || serviceOrder.orderStatus,
        result: values.result || "",
        resultTime: values.orderStatus === "COMPLETED" ? new Date().toISOString() : serviceOrder.resultTime,
      }

      const updatedOrder = await updateServiceOrder(
        serviceOrder.service.serviceId,
        serviceOrder.orderId,
        updateData as ServiceOrder,
      )

      if (onUpdate) {
        onUpdate(updatedOrder)
      }

  message.success(t("success.updateTestResult"))
  onClose()
    } catch (error) {
      console.error("Error updating service order:", error)
  message.error(t("errors.updateTestResultFailed"))
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "O":
        return "#d97706"
      case "C":
        return "#059669"
      default:
        return "#6b7280"
    }
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return t("labels.notAvailable")
    try {
      return new Date(dateString).toLocaleString("vi-VN")
    } catch (e) {
      return t("errors.invalidDateFormat")
    }
  }


  if (!serviceOrder) {
    return null
  }

  return (
    <Modal
      title={
        <div className="flex items-center">
          <ExperimentOutlined style={{ marginRight: 8 }} />
          <span>{t("titles.testResultDetail")}</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      <div className="p-4">
        <Card title={<div style={{ color: "#036672" }}>{t("titles.generalInfo")}</div>}>
          <Row gutter={24}>
            <Col span={12}>
              <div>
                <Text type="secondary">{t("labels.patientName")}</Text>
                <div className="font-medium">{appointment?.patientInfo?.first_name} {appointment?.patientInfo?.last_name}</div>
              </div>
              <div>
                <Text type="secondary">{t("labels.patientId")}</Text>
                <div className="font-medium">{appointment?.patientInfo?.id || t("labels.loading")}</div>
              </div>
              {appointment?.patientInfo?.allergies && (
                <div className="text-sm">
                  <Text type="secondary">{t("labels.allergies")}</Text>
                  <div className="font-medium">{appointment.patientInfo.allergies}</div>
                </div>
              )}
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">{t("labels.service")}</Text>
                <div className="font-medium">{
                  serviceOrder.serviceName
                  || serviceOrder.service_name
                  || (serviceOrder.service && (serviceOrder.service.serviceName || serviceOrder.service.service_name))
                  || t("labels.notAvailable")
                }</div>
              </div>
              <div>
                <Text type="secondary">{t("labels.room")}</Text>
                <div className="font-medium">{serviceOrder.room_id ?? ""}</div>
              </div>
              <div>
                <Text type="secondary">{t("labels.orderTime")}</Text>
                <div className="font-medium">{formatDateTime(serviceOrder.order_time)}</div>
              </div>
            </Col>
          </Row>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">{t("labels.currentStatus")}</Text>
                <span
                  className="ml-2 px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    color: getStatusColor(serviceOrder.order_status),
                    backgroundColor: `${getStatusColor(serviceOrder.order_status)}20`,
                  }}
                >
                  {serviceOrder.order_status === "O" ? t("status.pending") : t("status.completed")}
                </span>
              </div>
              <div className="text-right">
                <Text type="secondary">{t("labels.servicePrice")}</Text>
                <div className="font-bold text-lg text-blue-600">
                  {typeof serviceOrder.price === "number" && !isNaN(serviceOrder.price)
                    ? serviceOrder.price.toLocaleString("vi-VN") + ` ${t("labels.currency")}`
                    : typeof serviceOrder.price === "string" && serviceOrder.price !== ""
                      ? Number(serviceOrder.price).toLocaleString("vi-VN") + ` ${t("labels.currency")}`
                      : t("labels.notAvailable")}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title={<div style={{ color: "#036672" }}>{t("titles.result")}</div>} className="mt-4">
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              name="result"
              rules={[]}
            >
              <TextArea
                rows={8}
                readOnly
              />
            </Form.Item>

            {serviceOrder.order_status === "O" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <Text type="warning">
                  <strong>{t("labels.note")}</strong> {t("messages.testPending")}
                </Text>
              </div>
            )}

            {serviceOrder.order_status === "C" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <Text type="success">
                  <strong>{t("status.completed")}</strong> {t("messages.testResultUpdatedAt")} {formatDateTime(serviceOrder.result_time)}
                </Text>
              </div>
            )}
          </Form>
        </Card>

        <div className="flex justify-end space-x-3 mt-4">
          <Button onClick={onClose}>{t("buttons.close")}</Button>
          {serviceOrder.orderStatus === "ORDERED" && (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              {t("buttons.updateResult")}
            </Button>
          )}
          <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
            {t("buttons.refresh")}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
