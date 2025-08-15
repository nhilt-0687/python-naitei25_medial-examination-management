export type BillStatus = "P" | "U" | "C";
export type BillDetailItemType = "C" | "M" | "S";
export type PaymentMethod = "C" | "B";
export type TransactionStatus = "S" | "F" | "P";

export interface Bill {
  billId: number;
  appointmentId: number;
  totalCost: number;
  insuranceDiscount: number;
  amount: number;
  status: BillStatus;
  createdAt: string;
  billDetails?: BillDetail[];
}

export interface BillDto {
  appointmentId: number;
  totalCost: number;
  insuranceDiscount: number;
  amount: number;
  status: BillStatus;
}

export interface BillDetail {
  detailId: number;
  billId: number;
  itemType: BillDetailItemType;
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  insuranceDiscount: number;
  createdAt: string;
}

export interface BillDetailDto {
  itemType: BillDetailItemType;
  quantity: number;
  insuranceDiscount: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Transaction {
  transactionId: number;
  billId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface TransactionDto {
  billId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
}

export interface BillResponse {
  billId: number;
  appointmentId: number;
  patientId: number;
  totalCost: number;
  insuranceDiscount: number;
  amount: number;
  status: "PAID" | "UNPAID" | "CANCELLED";
  createdAt: string;
  billDetails: BillDetail[];
}
