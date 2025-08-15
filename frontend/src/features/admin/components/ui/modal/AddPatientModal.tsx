import { FormEvent, useState } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientModal({ isOpen, onClose }: PatientModalProps) {
  const handleSubmit = (e: FormEvent, section: string) => {
    e.preventDefault();
    console.log(`Form submitted for section: ${section}`);
    // Thêm xử lý logic lưu thông tin ở đây
    onClose(); // Đóng modal sau khi submit thành công
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div 
        className="fixed inset-0 w-screen h-screen"
        onClick={onClose}
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h2 className="text-xl font-medium text-teal-700">Thêm bệnh nhân</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-teal-600 mb-6">Thông tin cơ bản</h2>
                <form onSubmit={(e) => handleSubmit(e, "basic")}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Nguyễn Văn A..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">
                        CCCD/CMND <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 001234567890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">BHYT</label>
                      <input
                        type="text"
                        placeholder="VD: ytaucsonns"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="VD: 0917165628"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">
                        Giới tính <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                          required
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-gray-700 font-medium">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                          required
                        >
                          <option value="">Chọn địa chỉ</option>
                          <option value="hanoi">Hà Nội</option>
                          <option value="hcm">TP. Hồ Chí Minh</option>
                          <option value="danang">Đà Nẵng</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-teal-600 mb-6">Thông tin tài khoản</h2>

                <form onSubmit={(e) => handleSubmit(e, "account")}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">Bác sĩ phụ trách</label>
                      <input
                        type="text"
                        placeholder="VD: Nguyễn Văn A..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">ID người tạo</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">Ngày tạo tài khoản</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    >
                      Lưu thông tin
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}