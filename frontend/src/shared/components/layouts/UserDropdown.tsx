"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import { Dropdown } from "../ui/dropdown/Dropdown"
import { authService } from "../../services/authService"
import { patientService } from "../../services/patientService"
import type { AuthUser } from "../../types/user"
import type { PatientInfo } from "../../services/patientService"

export default function UserDropdown() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [patient, setPatient] = useState<PatientInfo | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy thông tin user đăng nhập
        const userData = await authService.getCurrentUser()
        setUser(userData)

        // Nếu là bệnh nhân, gọi API /patients/me để lấy thông tin chi tiết
        if (userData?.role === "P") {
          const patientData = await patientService.getCurrentPatient()
          setPatient(patientData)
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error)
      }
    }
    fetchUserData()
  }, [])

  const toggleDropdown = () => setIsOpen(!isOpen)
  const closeDropdown = () => setIsOpen(false)

  const getRoleText = (role: string) => {
    switch (role) {
      case "A":
        return t("roles.admin")
      case "D":
        return t("roles.doctor")
      case "P":
        return t("roles.patient")
      case "RECEPTIONIST":
        return t("roles.receptionist")
      default:
        return t("roles.user")
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img
            src={
              patient?.avatar ||
              user?.avatar ||
              "/images/user/owner.jpg"
            }
            alt="User"
            className="object-cover w-full h-full"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {patient
            ? `${patient.first_name} ${patient.last_name}`
            : user?.full_name || getRoleText(user?.role || "")}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {getRoleText(user?.role || "")}
          </span>
          <span className="mt-1 block text-theme-xs text-gray-500 dark:text-gray-400">
            {patient?.email || user?.email || "Chưa cập nhật"}
          </span>
        </div>

        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          {t("auth.logout")}
        </Link>
      </Dropdown>
    </div>
  )
}
