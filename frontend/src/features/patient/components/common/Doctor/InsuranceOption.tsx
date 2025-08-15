import React from "react"
import { Check } from 'lucide-react'

interface InsuranceOptionProps {
  hasInsurance: boolean | null
  onSelect: (value: boolean) => void
}

const InsuranceOption: React.FC<InsuranceOptionProps> = ({ hasInsurance, onSelect }) => {
  return (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <button
          onClick={() => onSelect(true)}
          className={`flex-1 p-4 border rounded-lg transition-colors ${
            hasInsurance === true
              ? 'border-cyan-500 bg-cyan-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="font-medium text-gray-900">Có bảo hiểm</p>
              <p className="text-sm text-gray-600">Sử dụng bảo hiểm y tế</p>
            </div>
            {hasInsurance === true && (
              <Check className="h-5 w-5 text-cyan-500" />
            )}
          </div>
        </button>

        <button
          onClick={() => onSelect(false)}
          className={`flex-1 p-4 border rounded-lg transition-colors ${
            hasInsurance === false
              ? 'border-cyan-500 bg-cyan-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="font-medium text-gray-900">Không bảo hiểm</p>
              <p className="text-sm text-gray-600">Thanh toán đầy đủ</p>
            </div>
            {hasInsurance === false && (
              <Check className="h-5 w-5 text-cyan-500" />
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

export default InsuranceOption
