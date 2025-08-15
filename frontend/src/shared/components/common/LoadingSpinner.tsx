"use client"

import type React from "react"

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Đang tải...' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-cyan-500 ${sizeClasses[size]} mb-2`}></div>
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
