import React from "react"
import { ArrowLeft } from 'lucide-react'

interface DoctorBookingHeaderProps {
  title: string
  onBackClick: () => void
}

const DoctorBookingHeader: React.FC<DoctorBookingHeaderProps> = ({ title, onBackClick }) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBackClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
    </div>
  )
}

export default DoctorBookingHeader
