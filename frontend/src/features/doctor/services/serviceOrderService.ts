import { api } from "../../../shared/services/api"
import type { ServiceOrder } from "../types/serviceOrder"

// Interface cho filter parameters
export interface ServiceOrderFilterParams {
  status?: string
  orderDate?: string // YYYY-MM-DD format
}

export const getAllServiceOrders = async (serviceId: number): Promise<ServiceOrder[]> => {
  try {
    const response = await api.get(`/appointments/services/${serviceId}/service-orders`)
    return response.data
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn dịch vụ:", error)
    throw new Error("Không thể lấy danh sách đơn dịch vụ")
  }
}

export const getServiceOrderById = async (serviceId: number, orderId: number): Promise<ServiceOrder> => {
  try {
    const response = await api.get(`/appointments/services/${serviceId}/service-orders/${orderId}`)
    return response.data
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn dịch vụ:", error)
    throw new Error("Không thể lấy chi tiết đơn dịch vụ")
  }
}

export const createServiceOrder = async (
  appointment_id: number,
  service_id: number,
  room_id: number,
  order_status: "O"
): Promise<ServiceOrder> => {
  try {
    const serviceOrder = {
      appointment_id,
      service_id,
      room_id,
      order_status
    }
    const response = await api.post(`/service-orders/`, serviceOrder)
    return response.data
  } catch (error) {
    console.error("Lỗi khi tạo đơn dịch vụ:", error)
    throw new Error("Không thể tạo đơn dịch vụ")
  }
}

export const updateServiceOrder = async (
  serviceId: number,
  orderId: number,
  serviceOrder: ServiceOrder,
): Promise<ServiceOrder> => {
  try {
    // Backend ServiceOrderViewSet.update expects field names in snake_case
    const payload: any = {
      appointment_id: serviceOrder.appointmentId,
      room_id: serviceOrder.roomId,
      service_id: serviceOrder.serviceId,
      order_status: serviceOrder.orderStatus, // mapped to status via serializer source
      result: serviceOrder.result,
      number: serviceOrder.number,
      order_time: serviceOrder.orderTime,
      result_time: serviceOrder.resultTime,
    }
    const response = await api.put(`/service-orders/${orderId}/`, payload)
    return response.data
  } catch (error) {
    console.error("Lỗi khi cập nhật đơn dịch vụ:", error)
    throw new Error("Không thể cập nhật đơn dịch vụ")
  }
}

export const deleteServiceOrder = async (serviceId: number, orderId: number): Promise<string> => {
  try {
    const response = await api.delete(`/appointments/services/${serviceId}/service-orders/${orderId}`)
    return response.data || "Đơn dịch vụ đã xóa thành công"
  } catch (error) {
    console.error("Lỗi khi xóa đơn dịch vụ:", error)
    throw new Error("Không thể xóa đơn dịch vụ")
  }
}

export const getServiceOrdersByAppointmentId = async (appointmentId: number): Promise<ServiceOrder[]> => {
  try {
    const response = await api.get(`/service-orders/appointments/${appointmentId}/orders`)
    return response.data
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn dịch vụ theo appointmentId:", error)
    throw new Error("Không thể lấy danh sách đơn dịch vụ theo appointmentId")
  }
}

export const getServiceOrdersByRoomId = async (
  roomId: number,
  status?: string,
  orderDate?: string,
): Promise<ServiceOrder[]> => {
  try {
    const params: ServiceOrderFilterParams = {}
    if (status) params.status = status
    if (orderDate) params.orderDate = orderDate

    const response = await api.get(`/service-orders/rooms/${roomId}/orders`, { params })
    console.log("Request URL:", response.config.url);
    return response.data
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn dịch vụ theo roomId:", error)
    throw new Error("Không thể lấy danh sách đơn dịch vụ theo roomId")
  }
}
