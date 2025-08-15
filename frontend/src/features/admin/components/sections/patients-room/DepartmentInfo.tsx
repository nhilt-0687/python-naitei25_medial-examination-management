export default function DepartmentInfo() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
        </div>
        <div>
          <h2 className="text-xl font-medium">Khoa Thần Kinh</h2>
          <p className="text-sm text-gray-500">
            Điều trị các rối loạn thần kinh như động kinh, Parkinson, đau nửa đầu, tai biến mạch máu não...
          </p>
          <div className="flex items-center mt-1 text-teal-600 text-sm font-medium">
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Khu vực: Tòa nhà B - Tầng 4 (Khu điều trị nội trú)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
