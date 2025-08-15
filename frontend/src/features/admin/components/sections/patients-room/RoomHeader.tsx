import { useState } from "react"
import { Search, Filter, Plus, Map } from "lucide-react"
import Button from "../../ui/button/Button"
import PatientModal from "../../ui/modal/AddPatientModal"

export default function RoomHeader() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-teal-700">Phòng bệnh 404</h1>
          <div className="flex items-center text-gray-500 text-sm">
            <Map className="h-4 w-4 mr-1.5" />
            <span>Tầng 4, Tòa nhà B - Khoa Thần kinh</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Lê Thiện Nhi"
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <button className="absolute right-3 top-2.5">
              <Search className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center">
            <Button variant="outline" size="sm" startIcon={<Filter className="h-4 w-4" />} children={undefined}></Button>
          </div>

          <Button 
            variant="primary" 
            size="md" 
            startIcon={<Plus className="h-4 w-4" />}
            onClick={openModal}
          >
            Thêm bệnh nhân
          </Button>
        </div>
      </div>

      <PatientModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}
