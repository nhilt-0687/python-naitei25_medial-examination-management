import PageMeta from "../../components/common/PageMeta";
import DoctorTable from "../../components/sections/doctor/DoctorTable";
import AddButton from "../../components/ui/button/AddButton";
import { useNavigate } from "react-router-dom";

export default function Doctor() {
  const navigate = useNavigate();

  const handleAddDoctor = () => {
    navigate("/admin/doctors/add");
  };

  return (
    <div>
      <PageMeta
        title="Doctor | Admin Dashboard"
        description="This is Doctor Dashboard"
      />
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
          Quản lý bác sĩ
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="col-span-12 xl:col-span-7">
          <DoctorTable />
        </div>
        <div className="fixed right-5 bottom-5">
          <AddButton onClick={handleAddDoctor} />
        </div>
      </div>
    </div>
  );
}
