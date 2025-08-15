"use client"

import type React from "react"
import { Heart, Baby, Stethoscope, User, Eye, Phone } from 'lucide-react'
import type { Specialty } from "../../types"

interface SpecialtyCardProps {
  specialty: Specialty
  onClick?: () => void
}

const iconMap = {
  Heart,
  Baby,
  Stethoscope,
  User,
  Eye,
  Phone,
}

const SpecialtyCard: React.FC<SpecialtyCardProps> = ({ specialty, onClick }) => {
  const IconComponent = iconMap[specialty.icon as keyof typeof iconMap] || Heart

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
    >
      <div className="flex items-center space-x-4">
        <div className={`${specialty.color} rounded-full p-3`}>
          <IconComponent className="h-6 w-6 text-white" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{specialty.name}</h4>
          <p className="text-sm text-cyan-500">{specialty.doctorCount}</p>
        </div>
      </div>
    </div>
  )
}

export default SpecialtyCard
