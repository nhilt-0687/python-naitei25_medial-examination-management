import { MapPin, Navigation, Building } from "lucide-react"

export default function LocationBanner() {
  return (
    <div className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-teal-100 p-2 rounded-full mr-3">
            <MapPin className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Vị trí hiện tại</h3>
            <p className="text-sm text-gray-500">Tòa nhà B - Tầng 4 - Khu Điều trị Nội trú</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <Building className="h-4 w-4 mr-1 text-teal-600" />
            <span>Khu B</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="h-4 w-4 mr-1 text-teal-600"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M4 8H20" stroke="currentColor" strokeWidth="2" />
              <path d="M8 4L8 8" stroke="currentColor" strokeWidth="2" />
              <path d="M16 4L16 8" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>Tầng 4</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Navigation className="h-4 w-4 mr-1 text-teal-600" />
            <span>Phòng 404</span>
          </div>
        </div>
      </div>
    </div>
  )
}
