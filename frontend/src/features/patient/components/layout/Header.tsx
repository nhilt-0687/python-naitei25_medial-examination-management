"use client"

import type React from "react"
import { Bell, LogOut } from 'lucide-react'
import { useLocation } from "react-router-dom"
import { Button } from '@/components/ui/button'
import { useAuth } from '../../context/AuthContext'

const Header: React.FC = () => {
  const location = useLocation()
  const { user, logout } = useAuth()

  let headerTitle = "Trang chủ"
  if (location.pathname === "/find-doctors") {
    headerTitle = "Tìm bác sĩ"
  } else if (location.pathname === "/news") {
    headerTitle = "Tin tức"
  } else if (location.pathname === "/search") {
    headerTitle = "Tra cứu"
  } else if (location.pathname === "/appointments") {
    headerTitle = "Lịch khám"
  } else if (location.pathname === "/bills") {
    headerTitle = "Hóa đơn"
  } else if (location.pathname === "/profile") {
    headerTitle = "Hồ sơ"
  } else if (location.pathname.startsWith("/search/drugs")) {
    if (location.pathname.includes("/results")) {
      headerTitle = "Kết quả tìm kiếm thuốc"
    } else if (location.pathname.includes("/detail")) {
      headerTitle = "Chi tiết thuốc"
    } else {
      headerTitle = "Tra cứu thuốc"
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full max-w-[1440px] mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-gray-900">{headerTitle}</h1>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-gray-600 mr-2">
                Xin chào, {user.name || user.phone}
              </span>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Đăng xuất
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
