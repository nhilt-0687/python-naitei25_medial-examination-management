"use client"

import type React from "react"
import { CreditCard, Shield, Calculator } from 'lucide-react'
import type { PaymentSummary } from "../../../../../shared/types/payment"
import { formatCurrency } from "../../../../../shared/utils/paymentTransform"

interface PaymentSummaryCardProps {
  summary: PaymentSummary
  showDetails?: boolean
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({ 
  summary, 
  showDetails = true 
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calculator className="h-5 w-5 mr-2" />
        Tóm tắt thanh toán
      </h3>

      {showDetails && (
        <div className="space-y-3 mb-4">
          {summary.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {item.name} x{item.quantity}
              </span>
              <span className="font-medium">{formatCurrency(item.total)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tổng tiền dịch vụ</span>
          <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
        </div>

        {summary.insuranceDiscount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Giảm BHYT
            </span>
            <span className="font-medium">-{formatCurrency(summary.insuranceDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-lg font-bold text-cyan-600 pt-2 border-t border-gray-200">
          <span className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Số tiền thanh toán
          </span>
          <span>{formatCurrency(summary.finalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentSummaryCard
