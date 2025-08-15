import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Array<{ day: string; date: number; isActive: boolean }>>([])

  // Get the current day of the month
  const today = new Date()

  // Function to generate calendar days for the current month
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay()
    // Adjust for Monday as first day of week
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const days = []

    // Vietnamese weekday names
    const weekdayNames = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"]

    // Add days from the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i)
      const dayOfWeek = dayDate.getDay()
      // Adjust for Monday as first day of week
      const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

      days.push({
        day: weekdayNames[adjustedDayOfWeek],
        date: i,
        isActive: i === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
      })
    }

    return days
  }

  // Format month and year in Vietnamese
  const formatMonthYear = (date: Date) => {
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ]
    return `${months[date.getMonth()]}, ${date.getFullYear()}`
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  // Navigate to next month
  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  // Update calendar when the current date changes
  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentDate))
  }, [currentDate])

  // Initialize calendar on component mount
  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentDate))
  }, [])

  // Group days by weeks for better display
  const weeks: Array<Array<{ day: string; date: number; isActive: boolean }>> = []
  let currentWeek: Array<{ day: string; date: number; isActive: boolean }> = []

  calendarDays.forEach((day, index) => {
    currentWeek.push(day)

    // Start a new week after every 7 days or at the end
    if ((index + 1) % 7 === 0 || index === calendarDays.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  return (
    <div className="mb-8 bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{formatMonthYear(currentDate)}</h3>
        <div className="flex items-center gap-2">
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
          {week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`flex flex-col items-center p-2 rounded-md ${
                day.isActive ? "bg-base-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              <span className="text-xs">{day.day}</span>
              <span className="text-sm font-medium">{day.date}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
