"use client"

import type React from "react"
import { Stethoscope } from 'lucide-react'
import { useRouter } from "next/navigation"

interface BookingCardProps {
  onClick?: () => void
}

const BookingCard: React.FC<BookingCardProps> = ({ onClick }) => {
  const router = useRouter()

  const handleClick = () => {
    router.push("/find-doctors")
    onClick?.()
  }

  return (
    <div
      onClick={handleClick}
      className="bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-lg p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-white/20 rounded-full p-3">
          <Stethoscope className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Bác sĩ</h3>
          <p className="text-cyan-100">Đặt lịch khám</p>
        </div>
      </div>
    </div>
  )
}

export default BookingCard
