import PageMeta from "../../components/common/PageMeta";
import { PatientTable } from "../../components/sections/patient";
import AddButton from "../../components/ui/button/AddButton";
import { Link } from "react-router-dom";
export default function Patient() {

  return (
    <>
      <PageMeta
        title="Bệnh nhân | Bệnh viện Đa khoa Wecare"
        description="This is Patient Dashboard"
      />
      <div className="">
        <div className="col-span-12 xl:col-span-7">
          <PatientTable />
        </div>

        <div className="fixed right-5 bottom-5">
          <Link to="/admin/patients/add">
            <AddButton />
          </Link>
        </div>
      </div>
    </>
  );
}