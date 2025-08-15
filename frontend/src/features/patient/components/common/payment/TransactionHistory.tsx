"use client"

import type React from "react"
import { useState } from "react"
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useApi } from "../../../hooks/useApi"
import { transactionService } from "../../../../../shared/services/paymentService"
import { formatCurrency, getPaymentMethodName, getTransactionStatusName } from "../../../../../shared/utils/paymentTransform"
import LoadingSpinner from "../../../../../shared/components/common/LoadingSpinner"
import ErrorMessage from "../../../../../shared/components/common/ErrorMessage"
import type { Transaction } from "../../../../../shared/types/payment"

interface TransactionHistoryProps {
  billId: number
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ billId }) => {
  const { 
    data: transactions, 
    loading, 
    error, 
    refetch 
  } = useApi(
    () => transactionService.getTransactionsByBillId(billId),
    [billId]
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'CANCELLED':
        return <AlertCircle className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-100'
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return <LoadingSpinner message="Đang tải lịch sử giao dịch..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Chưa có giao dịch nào.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h3>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getStatusIcon(transaction.status)}
                <div>
                  <p className="font-medium text-gray-900">
                    {getPaymentMethodName(transaction.payment_method)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.transaction_date).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-lg font-semibold text-cyan-600 mt-1">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                {getTransactionStatusName(transaction.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransactionHistory
