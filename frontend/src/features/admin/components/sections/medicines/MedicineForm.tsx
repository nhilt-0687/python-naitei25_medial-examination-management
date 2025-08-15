"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { medicineService } from "../../../services/pharmacyService"
import type { Medicine, NewMedicineRequest, UpdateMedicineRequest } from "../../../types/medicine"

interface MedicineFormProps {
  isEdit?: boolean
}

export default function MedicineForm({ isEdit = false }: MedicineFormProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [medicine, setMedicine] = useState<Medicine | null>(null)

  const [formData, setFormData] = useState({
    medicineName: "",
    manufactor: "",
    category: "",
    description: "",
    usage: "",
    unit: "",
    insuranceDiscountPercent: 0,
    sideEffects: "",
    price: 0,
    quantity: 0,
  })

  useEffect(() => {
    if (isEdit && id) {
      loadMedicine(Number.parseInt(id))
    }
  }, [isEdit, id])

  const loadMedicine = async (medicineId: number) => {
    try {
      setLoading(true)
      const data = await medicineService.getMedicineById(medicineId)
      setMedicine(data)
      setFormData({
        medicineName: data.medicineName,
        manufactor: data.manufactor || "",
        category: data.category,
        description: data.description || "",
        usage: data.usage,
        unit: data.unit,
        insuranceDiscountPercent: data.insuranceDiscountPercent,
        sideEffects: data.sideEffects || "",
        price: data.price,
        quantity: data.quantity,
      })
    } catch (error) {
      console.error("Error loading medicine:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      if (isEdit && id) {
        const updateData: UpdateMedicineRequest = formData
        await medicineService.updateMedicine(Number.parseInt(id), updateData)
      } else {
        const newData: NewMedicineRequest = formData
        await medicineService.addNewMedicine(newData)
      }

      navigate("/admin/medicines")
    } catch (error) {
      console.error("Error saving medicine:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  if (isEdit && loading && !medicine) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">{isEdit ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên thuốc *</label>
              <input
                type="text"
                name="medicineName"
                value={formData.medicineName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhà sản xuất</label>
              <input
                type="text"
                name="manufactor"
                value={formData.manufactor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn danh mục</option>
                <option value="Thuốc kháng sinh">Thuốc kháng sinh</option>
                <option value="Thuốc giảm đau">Thuốc giảm đau</option>
                <option value="Vitamin">Vitamin</option>
                <option value="Thuốc ho">Thuốc ho</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cách sử dụng *</label>
              <input
                type="text"
                name="usage"
                value={formData.usage}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đơn vị *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn đơn vị</option>
                <option value="Hộp">Hộp</option>
                <option value="Gói">Gói</option>
                <option value="Chai">Chai</option>
                <option value="Viên">Viên</option>
                <option value="Lọ">Lọ</option>
                <option value="Ống">Ống</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phần trăm bảo hiểm (%) *</label>
              <input
                type="number"
                name="insuranceDiscountPercent"
                value={formData.insuranceDiscountPercent}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tác dụng phụ</label>
            <textarea
              name="sideEffects"
              value={formData.sideEffects}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/medicines")}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
