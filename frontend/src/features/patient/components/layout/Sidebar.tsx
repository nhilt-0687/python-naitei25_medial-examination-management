"use client"

import type React from "react"
import { Search, Calendar, MessageCircle, User, UserCircle, Stethoscope, Receipt } from 'lucide-react'
import { useNavigate, useLocation } from "react-router-dom"

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { icon: UserCircle, label: "Trang chủ", path: "/" },
    { icon: Search, label: "Tra cứu", path: "/search" },
    { icon: Stethoscope, label: "Đặt lịch khám", path: "/find-doctors" },
    { icon: Calendar, label: "Lịch khám", path: "/appointments" },
    { icon: Receipt, label: "Hóa đơn", path: "/bills" },
    { icon: MessageCircle, label: "Đơn thuốc", path: "/prescriptions" },
    { icon: User, label: "Hồ sơ", path: "/profile" },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-start px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-cyan-500 bg-cyan-50" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <IconComponent className="mr-3 h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
