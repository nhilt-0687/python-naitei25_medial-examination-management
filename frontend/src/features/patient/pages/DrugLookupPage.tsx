"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Pill, DollarSign, Shield, AlertTriangle, Clock, User } from "lucide-react"
import { medicineService, type Medicine } from "../../../shared/services/medicineService"

const DrugLookupPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMedicines = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await medicineService.getAllMedicines()
      setMedicines(data)
      if (data.length > 0) {
        setSelectedMedicine(data[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const searchMedicines = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      fetchMedicines()
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await medicineService.searchMedicines({ name: searchQuery })
      setMedicines(data)
      if (data.length > 0) {
        setSelectedMedicine(data[0])
      } else {
        setSelectedMedicine(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tìm kiếm")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchMedicines(searchTerm)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Pill className="text-blue-600" />
            Tra Cứu Thông Tin Thuốc
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên thuốc, hoạt chất, nhà sản xuất..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách thuốc */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Danh sách thuốc ({medicines.length})</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Đang tải...</div>
                ) : medicines.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Không tìm thấy thuốc nào</div>
                ) : (
                  medicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      onClick={() => setSelectedMedicine(medicine)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMedicine?.id === medicine.id ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    >
                      <h3 className="font-medium text-gray-900 mb-1">{medicine.medicine_name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{medicine.manufactor}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{medicine.category}</span>
                        <span className="text-sm font-medium text-green-600">{formatPrice(medicine.price)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chi tiết thuốc */}
          <div className="lg:col-span-2">
            {selectedMedicine ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMedicine.medicine_name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedMedicine.manufactor}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedMedicine.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Thông tin cơ bản */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Giá và Bảo hiểm
                      </h3>
                      <p className="text-lg font-bold text-green-600 mb-2">{formatPrice(selectedMedicine.price)}</p>
                      <div className="flex items-center gap-2">
                        <Shield
                          className={`w-4 h-4 ${selectedMedicine.is_insurance_covered ? "text-green-600" : "text-gray-400"}`}
                        />
                        <span className="text-sm">
                          {selectedMedicine.is_insurance_covered
                            ? `Được bảo hiểm (${selectedMedicine.insurance_discount_percent}% giảm giá)`
                            : "Không được bảo hiểm"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Thông tin sản phẩm</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Phân loại:</span> {selectedMedicine.category}
                        </p>
                        <p>
                          <span className="font-medium">Đơn vị:</span> {selectedMedicine.unit}
                        </p>
                        <p>
                          <span className="font-medium">Số lượng:</span> {selectedMedicine.quantity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mô tả */}
                  {selectedMedicine.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedMedicine.description}</p>
                    </div>
                  )}

                  {/* Cách sử dụng */}
                  {selectedMedicine.usage && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Cách sử dụng</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedMedicine.usage}</p>
                    </div>
                  )}

                  {/* Tác dụng phụ */}
                  {selectedMedicine.side_effects && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Tác dụng phụ
                      </h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed">{selectedMedicine.side_effects}</p>
                      </div>
                    </div>
                  )}

                  {/* Cảnh báo */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Cảnh báo quan trọng
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Chỉ sử dụng theo chỉ định của bác sĩ hoặc dược sĩ</li>
                      <li>• Đọc kỹ hướng dẫn sử dụng trước khi dùng</li>
                      <li>• Ngưng sử dụng và tham khảo ý kiến bác sĩ nếu có tác dụng phụ</li>
                      <li>• Bảo quản nơi khô ráo, thoáng mát, tránh ánh sáng trực tiếp</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn một loại thuốc để xem chi tiết</h3>
                <p className="text-gray-600">Chọn thuốc từ danh sách bên trái để xem thông tin chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrugLookupPage
