import type { Bill } from '../services/paymentService'

export interface BillDisplay {
  id: number
  patientName: string
  doctorName?: string
  appointmentDate?: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: string
  statusColor: string
  dueDate: string
  createdDate: string
  items: Array<{
    itemName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
}

export const transformBillToDisplay = (bill: Bill): BillDisplay => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'PAID':
        return 'text-green-600 bg-green-100'
      case 'PARTIALLY_PAID':
        return 'text-blue-600 bg-blue-100'
      case 'OVERDUE':
        return 'text-red-600 bg-red-100'
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ thanh toán'
      case 'PAID':
        return 'Đã thanh toán'
      case 'PARTIALLY_PAID':
        return 'Thanh toán một phần'
      case 'OVERDUE':
        return 'Quá hạn'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return status
    }
  }

  return {
    id: bill.id,
    patientName: bill.patient.fullName,
    doctorName: bill.appointment?.doctor.fullName,
    appointmentDate: bill.appointment?.appointmentDate,
    totalAmount: bill.totalAmount,
    paidAmount: bill.paidAmount,
    remainingAmount: bill.remainingAmount,
    status: getStatusText(bill.status),
    statusColor: getStatusColor(bill.status),
    dueDate: bill.dueDate,
    createdDate: bill.createdAt,
    items: bill.items.map(item => ({
      itemName: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    }))
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
