"use client"

import type React from "react"
import type { DayOption } from "../../../../../shared/types"

interface DateSelectorProps {
  days: DayOption[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

const DateSelector: React.FC<DateSelectorProps> = ({ days, selectedDate, onSelectDate }) => {
  return (
    <div className="flex space-x-3 overflow-x-auto pb-2">
      {days.map((day) => (
        <button
          key={day.date}
          onClick={() => onSelectDate(day.date)}
          disabled={!day.isAvailable}
          className={`flex-shrink-0 w-24 h-28 rounded-lg flex flex-col items-center justify-center border-2 transition-colors
          ${day.isAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
          ${selectedDate === day.date ? "bg-cyan-500 border-cyan-500 text-white" : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"}
          ${!day.isAvailable ? "relative overflow-hidden" : ""}
        `}
        >
          {day.isAvailable ? (
            <>
              <span className={`text-sm font-medium ${selectedDate === day.date ? "text-white" : "text-gray-600"}`}>
                {day.label}
              </span>
              <span className={`text-3xl font-bold mt-1 ${selectedDate === day.date ? "text-white" : "text-gray-900"}`}>
                {new Date(day.date).getDate()}
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-gray-400">{day.label}</span>
              <span className="text-3xl font-bold mt-1 text-gray-400">{new Date(day.date).getDate()}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-gray-400 rotate-45 transform" />
              </div>
            </>
          )}
        </button>
      ))}
    </div>
  )
}

export default DateSelector
