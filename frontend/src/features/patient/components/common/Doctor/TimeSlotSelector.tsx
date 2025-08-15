"use client"

import type React from "react"
import { Sun, Moon } from 'lucide-react'
import type { TimeSlot, TimeOfDay } from "../../../../../shared/types"

interface TimeSlotSelectorProps {
  morningSlots: TimeSlot[]
  afternoonSlots: TimeSlot[]
  selectedTimeOfDay: TimeOfDay | null
  selectedTimeSlot: string | null
  onSelectTimeOfDay: (timeOfDay: TimeOfDay) => void
  onSelectTimeSlot: (time: string) => void
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  morningSlots,
  afternoonSlots,
  selectedTimeOfDay,
  selectedTimeSlot,
  onSelectTimeOfDay,
  onSelectTimeSlot,
}) => {
  const currentSlots = selectedTimeOfDay === "morning" ? morningSlots : afternoonSlots

  return (
    <div className="space-y-6">
      {/* Time of Day Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelectTimeOfDay("morning")}
          className={`flex items-center justify-center space-x-3 py-4 rounded-lg border-2 transition-colors
            ${selectedTimeOfDay === "morning" ? "bg-cyan-500 border-cyan-500 text-white" : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"}
          `}
        >
          <Sun className={`h-6 w-6 ${selectedTimeOfDay === "morning" ? "text-white" : "text-yellow-500"}`} />
          <span className="font-semibold text-lg">Sáng</span>
        </button>
        <button
          onClick={() => onSelectTimeOfDay("afternoon")}
          className={`flex items-center justify-center space-x-3 py-4 rounded-lg border-2 transition-colors
            ${selectedTimeOfDay === "afternoon" ? "bg-cyan-500 border-cyan-500 text-white" : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"}
          `}
        >
          <Moon className={`h-6 w-6 ${selectedTimeOfDay === "afternoon" ? "text-white" : "text-blue-700"}`} />
          <span className="font-semibold text-lg">Chiều</span>
        </button>
      </div>

      {/* Time Slots Grid */}
      {selectedTimeOfDay && (
        <div className="grid grid-cols-3 gap-3">
          {currentSlots.length > 0 ? (
            currentSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => onSelectTimeSlot(slot.time)}
                disabled={!slot.isAvailable}
                className={`py-3 rounded-lg border-2 text-sm font-medium transition-colors
                  ${slot.isAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                  ${selectedTimeSlot === slot.time ? "bg-cyan-500 border-cyan-500 text-white" : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"}
                `}
              >
                {slot.time.replace(" AM", "").replace(" PM", "")}
              </button>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-4">Không có khung giờ nào khả dụng.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default TimeSlotSelector
