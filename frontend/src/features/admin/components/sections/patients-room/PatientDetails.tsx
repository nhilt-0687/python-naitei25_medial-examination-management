"use client"
import { Edit } from "lucide-react"
import Button from "../../ui/button/Button"

// Sample patient data
const patientData = {
  id: "6",
  name: "Lê Thiện Nhi",
  age: 18,
  gender: "Nữ",
  status: "Đang chờ",
  avatar: "/images/user/user-22.jpg",
  email: "morshed.ali@mail.com",
  phone: "+88017180011122",
  height: "150 cm",
  weight: "60 kg",
  roomNumber: "305",
  testingStatus: "Đang xét nghiệm",
  medicationStatus: "Chưa kê thuốc",
}

export default function PatientDetails() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Chi tiết bệnh nhân</h3>
        <Button variant="outline" size="sm" startIcon={<Edit className="h-4 w-4" />} className="text-teal-600">
          Xem chi tiết
        </Button>
      </div>

      <div>
        <div className="flex flex-col items-center mb-6">
          <img src={patientData.avatar || "/placeholder.svg"} alt="Patient" className="w-20 h-20 rounded-full mb-2" />
          <h4 className="text-lg font-medium">{patientData.name}</h4>
          <p className="text-sm text-gray-500">
            {patientData.gender}, {patientData.age} tuổi
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm">{patientData.email}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Số điện thoại</span>
            <span className="text-sm">{patientData.phone}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Chiều cao</span>
            <span className="text-sm">{patientData.height}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Cân nặng</span>
            <span className="text-sm">{patientData.weight}</span>
          </div>
        </div>

        <div className="bg-teal-50 rounded-lg p-4 mb-6">
          <h3 className="text-black font-medium mb-2">Trạng thái hiện tại</h3>

          <div className="bg-teal-100 rounded py-2 px-4 mb-2 flex items-center">
            <div className="w-3 h-3 bg-teal-600 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-black flex items-center">
              Phòng bệnh số: {patientData.roomNumber}
            </span>
          </div>

          <div className="bg-teal-100 rounded py-2 px-4 mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-teal-600 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-black">{patientData.testingStatus}</span>
            </div>
            <button className="text-gray-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="bg-teal-100 rounded py-2 px-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-teal-600 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-black">{patientData.medicationStatus}</span>
            </div>
            <button className="text-gray-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-base font-medium mb-2">Lịch sử khám</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                    stroke="#0EA5E9"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M16 2V6" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 2V6" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 10H21" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Dị Ứng - Miễn Dịch Lâm Sàng</p>
                <p className="text-xs text-gray-500">Ngày khám: 21/02/2025</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                    stroke="#0EA5E9"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M16 2V6" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 2V6" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 10H21" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Dị Ứng - Miễn Dịch Lâm Sàng</p>
                <p className="text-xs text-gray-500">Ngày khám: 21/02/2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
