"use client"

import type React from "react"
import { Calendar, CreditCard, FileText, DollarSign } from 'lucide-react'
import type { BillDisplay } from "../../../../../shared/types/payment"
import { formatCurrency } from "../../../../../shared/utils/paymentTransform"

interface BillCardProps {
  bill: BillDisplay
  onClick?: () => void
}

const BillCard: React.FC<BillCardProps> = ({ bill, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-50 rounded-full p-2">
            <FileText className="h-5 w-5 text-cyan-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Hóa đơn #{bill.id}</p>
            <p className="text-sm text-gray-600">{bill.doctorName}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.statusColor}`}>
          {bill.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{bill.createdDate}</span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4" />
          <span>Tổng tiền: {formatCurrency(bill.totalCost)}</span>
        </div>
        {bill.insuranceDiscount > 0 && (
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Giảm BHYT: {formatCurrency(bill.insuranceDiscount)}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 font-semibold text-cyan-600">
          <DollarSign className="h-4 w-4" />
          <span>Thanh toán: {formatCurrency(bill.finalAmount)}</span>
        </div>
      </div>

      {/* Items preview */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Dịch vụ:</p>
        <div className="flex flex-wrap gap-1">
          {bill.items.slice(0, 3).map((item, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {item.itemName} x{item.quantity}
            </span>
          ))}
          {bill.items.length > 3 && (
            <span className="text-xs text-gray-500">+{bill.items.length - 3} khác</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BillCard
