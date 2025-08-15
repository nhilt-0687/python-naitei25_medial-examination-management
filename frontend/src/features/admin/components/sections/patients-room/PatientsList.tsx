"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Badge from "../../ui/badge/Badge"
import { StatusIndicator } from "./StatusIndicator"

// Extended patient data
const allPatients = [
  {
    id: "1",
    name: "Demi Wilkinson",
    username: "@demi",
    age: 70,
    gender: "Nam",
    status: "Hoàn thành",
    avatar: "/images/user/user-17.jpg",
  },
  {
    id: "2",
    name: "Olivia Rhye",
    username: "@olivia",
    age: 63,
    gender: "Nữ",
    status: "Đang chờ",
    avatar: "/images/user/user-18.jpg",
  },
  {
    id: "3",
    name: "Phoenix Baker",
    username: "@phoenix",
    age: 39,
    gender: "Nam",
    status: "Xét nghiệm",
    avatar: "/images/user/user-19.jpg",
  },
  {
    id: "4",
    name: "Demi Wilkinson",
    username: "@demi",
    age: 36,
    gender: "Nam",
    status: "Hoàn thành",
    avatar: "/images/user/user-20.jpg",
  },
  {
    id: "5",
    name: "Lana Steiner",
    username: "@lana",
    age: 36,
    gender: "Nam",
    status: "Xét nghiệm",
    avatar: "/images/user/user-21.jpg",
  },
  {
    id: "6",
    name: "Lê Thiện Nhi",
    username: "@nhi",
    age: 18,
    gender: "Nữ",
    status: "Đang chờ",
    avatar: "/images/user/user-22.jpg",
  },
  {
    id: "7",
    name: "Trần Nhật Trường",
    username: "@truong",
    age: 21,
    gender: "Nam",
    status: "Hoàn thành",
    avatar: "/images/user/user-23.jpg",
  },
  {
    id: "8",
    name: "Carla George",
    username: "@carla",
    age: 42,
    gender: "Nữ",
    status: "Xét nghiệm",
    avatar: "/images/user/user-24.jpg",
  },
]

const ITEMS_PER_PAGE = 5

export default function PatientsList() {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Calculate pagination
  const indexOfLastPatient = currentPage * ITEMS_PER_PAGE
  const indexOfFirstPatient = indexOfLastPatient - ITEMS_PER_PAGE
  const currentPatients = allPatients.slice(indexOfFirstPatient, indexOfLastPatient)
  const totalPages = Math.ceil(allPatients.length / ITEMS_PER_PAGE)

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Handle age sorting
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Danh sách bệnh nhân</h3>
        <Badge variant="light" color="primary" size="md">
          {allPatients.length} bệnh nhân
        </Badge>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên bệnh nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tuổi
                  <button className="ml-1 inline-flex" onClick={toggleSortDirection}>
                    <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 0L7.4641 6H0.535898L4 0Z" fill="#9CA3AF" />
                    </svg>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giới tính
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tình trạng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-full" src={patient.avatar || "/placeholder.svg"} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.age}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIndicator status={patient.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{indexOfFirstPatient + 1}</span> đến{" "}
                <span className="font-medium">
                  {indexOfLastPatient > allPatients.length ? allPatients.length : indexOfLastPatient}
                </span>{" "}
                của <span className="font-medium">{allPatients.length}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Trước</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === index + 1
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Sau</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
