"use client"

import type React from "react"
import { CreditCard, Smartphone, Banknote, Building } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export type PaymentMethodType = 'ONLINE_BANKING' | 'CASH' | 'CREDIT_CARD' | 'MOMO'

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType | null
  onSelectMethod: (method: PaymentMethodType) => void
  availableMethods?: PaymentMethodType[]
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
  selectedMethod, 
  onSelectMethod,
  availableMethods = ['ONLINE_BANKING', 'CASH', 'MOMO']
}) => {
  const paymentMethods = [
    {
      id: 'ONLINE_BANKING' as PaymentMethodType,
      name: 'Chuyển khoản ngân hàng',
      description: 'Thanh toán qua PayOS',
      icon: Building,
      available: availableMethods.includes('ONLINE_BANKING')
    },
    {
      id: 'MOMO' as PaymentMethodType,
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: Smartphone,
      available: availableMethods.includes('MOMO')
    },
    {
      id: 'CREDIT_CARD' as PaymentMethodType,
      name: 'Thẻ tín dụng',
      description: 'Visa, MasterCard, JCB',
      icon: CreditCard,
      available: availableMethods.includes('CREDIT_CARD')
    },
    {
      id: 'CASH' as PaymentMethodType,
      name: 'Tiền mặt',
      description: 'Thanh toán tại quầy',
      icon: Banknote,
      available: availableMethods.includes('CASH')
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h3>
      
      <RadioGroup 
        value={selectedMethod || ""} 
        onValueChange={(value: PaymentMethodType) => onSelectMethod(value)}
      >
        {paymentMethods.filter(method => method.available).map((method) => {
          const IconComponent = method.icon
          
          return (
            <div key={method.id} className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <RadioGroupItem value={method.id} id={method.id} />
              <div className="flex items-center space-x-3 flex-1">
                <div className="bg-cyan-50 rounded-full p-2">
                  <IconComponent className="h-5 w-5 text-cyan-500" />
                </div>
                <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">{method.name}</p>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </Label>
              </div>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

export default PaymentMethodSelector
