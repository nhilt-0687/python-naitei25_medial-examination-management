"use client"

import type React from "react"
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Thử lại
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
