import type React from "react"
interface StatsCardProps {
  icon: React.ReactNode
  value: string
  label: string
}

export default function StatsCard({ icon, value, label }: StatsCardProps) {
  return (
    <div className="p-4 flex flex-col items-center bg-white rounded-lg shadow-sm">
      <div className="mb-2">{icon}</div>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  )
}
