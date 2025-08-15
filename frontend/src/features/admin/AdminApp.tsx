import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "../auth/pages/Login";
import NotFound from "./pages/OtherPage/NotFound";
import Profile from "./pages/Profile/Profile";
import AppLayout from "../../shared/layouts/AppLayout";
import { ScrollToTop } from "../../shared/components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Patient from "./pages/Patients/Patient";
import PatientDetail from "./pages/Patients/PatientDetail"
import PatientAddForm from "./pages/Patients/PatientAddForm";
import Doctor from "./pages/Doctors/Doctor";
import Medicines from "./pages/Medicines/Medicines";
import Services from "./pages/HealthServices/Service";
import Department from "./pages/Departments/Department";
import InpatientRoom from "./pages/Inpatient/InpatientRoom";
import MedicalCalendar from "./pages/MedicalExamination/MedicalCalendar";
import Authorization from "./pages/Authorization/Authorization";
// import DoctorSchedule from "./pages/Doctors/DoctorSchedule";
import DoctorSchedule from "./pages/Doctors/inChanging";
import DoctorDetail from "./pages/Doctors/DoctorDetail";

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const role = localStorage.getItem("authRole");
  if (role !== "A") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminApp: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Auth Layout */}
        <Route path="login" element={<SignIn />} />

        {/* Dashboard Layout */}
        <Route
          element={
            <RequireAdmin>
              <AppLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />

          {/* Medical Examinations Pages */}
          <Route path="calendar" element={<MedicalCalendar />} />

          {/* Patients Pages */}
          <Route path="patients" element={<Patient />} />
          <Route path="patients/add" element={<PatientAddForm />} />
          <Route path="patients/:patientId" element={<PatientDetail />} />

          {/* Doctors Page */}
          <Route path="doctors" element={<Doctor />} />

          <Route path="doctors/schedule/:id" element={<DoctorSchedule />} />
          <Route path="doctors/detail/:doctorId" element={<DoctorDetail />} />

          {/* Medicines Pages */}
          {/* <Route path="medicines" element={<Medicines />} /> */}

          {/* Services Page */}
          {/* <Route path="health-services" element={<Services />} /> */}

          {/* Inpatients Page */}
          {/* <Route path="inpatients-rooms" element={<InpatientRoom />} /> */}

          {/* Medical Examination Pages */}

          {/* Department Page */}
          {/* <Route path="departments" element={<Department />} /> */}

          {/* Authorization Page */}
          <Route path="authorization" element={<Authorization />} />

          {/* Others Page */}
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AdminApp;
