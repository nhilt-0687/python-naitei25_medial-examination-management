export interface Bill {
  id: number
  patientId: number
  appointmentId?: number
  amount: number
  status: BillStatus
  dueDate: string
  paidDate?: string
  description: string
  items: BillItem[]
  createdAt: string
  updatedAt: string
}

export interface BillItem {
  id: number
  serviceId: number
  serviceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface Transaction {
  id: number
  billId: number
  amount: number
  method: PaymentMethod
  status: TransactionStatus
  paymentId?: string
  paymentUrl?: string
  paidAt?: string
  createdAt: string
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  PAYOS = 'PAYOS'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}
