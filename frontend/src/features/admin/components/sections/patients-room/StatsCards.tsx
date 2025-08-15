import { useEffect, useState } from "react"
import Card from "../../ui/card/Card"

export default function StatsCards() {
  const [scheduledDays, setScheduledDays] = useState(0)

  useEffect(() => {
    const today = new Date()
    const dayOfMonth = today.getDate()
    setScheduledDays(5)
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-4 flex flex-col items-center">
        <div className="mb-2 text-blue-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#E6F7FF" />
            <path d="M18 7H6V17H18V7Z" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 11H18" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-2xl font-bold">10</span>
        <span className="text-sm text-gray-500">Tổng giường</span>
      </Card>

      <Card className="p-4 flex flex-col items-center">
        <div className="mb-2 text-blue-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#E6F7FF" />
            <path d="M18 7H6V17H18V7Z" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 11H18" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-2xl font-bold">2</span>
        <span className="text-sm text-gray-500">Giường trống</span>
      </Card>

      <Card className="p-4 flex flex-col items-center">
        <div className="mb-2 text-blue-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#E6F7FF" />
            <path
              d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="#0EA5E9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
              stroke="#0EA5E9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold">8</span>
        <span className="text-sm text-gray-500">Bệnh nhân</span>
      </Card>

      <Card className="p-4 flex flex-col items-center">
        <div className="mb-2 text-blue-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#E6F7FF" />
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="#0EA5E9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 6V12L16 14" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-2xl font-bold">{scheduledDays}</span>
        <span className="text-sm text-gray-500">Ngày lịch</span>
      </Card>
    </div>
  )
}
