import type React from "react"
import { Routes, Route } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HomeLayout } from "../public/layouts/HomeLayout"
import AuthenticatedPatientLayout from "./layouts/AuthenticatedPatientLayout"
import HomePage from "../public/pages/HomePage"
import DashboardPage from "./pages/DashboardPage"
import DoctorListPage from "./pages/DoctorListPage"
import DoctorBookingPage from "./pages/DoctorBookingPage"
import AppointmentsPage from "./pages/AppointmentsPage"
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage"
import PaymentPage from "./pages/PaymentPage"
import DepartmentListPage from "./pages/DepartmentListPage"
import DepartmentDetailPage from "./pages/DepartmentDetailPage"
import DoctorDetailPage from "./pages/DoctorDetailPage"
import ProfilePage from "./pages/ProfilePage"
import UpcomingAppointmentsPage from "./pages/UpcomingAppointmentsPage"
import PastAppointmentsPage from "./pages/PastAppointmentsPage"
import NotFound from "../../shared/components/common/NotFound"
import PrescriptionsPage from "./pages/PrescriptionsPage"
import PrescriptionDetailPage from "./pages/PrescriptionDetailPage"
import { ScrollToTop } from "../../shared/components/common/ScrollToTop"
import { PatientProvider } from "./context/PatientContext"
import MedicalRecordDetailPage from "./pages/MedicalRecordDetailPage"
import DrugLookupPage from "./pages/DrugLookupPage"

export const PatientApp: React.FC = () => {
  const { t } = useTranslation()

  console.log("PatientApp rendering...")

  return (
    <PatientProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route index element={<HomePage />} />
          <Route path="/doctors/list" element={<DoctorListPage />} />
        </Route>
        <Route element={<AuthenticatedPatientLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="doctors/:id" element={<DoctorDetailPage />} />
          <Route path="doctors/:id/book" element={<DoctorBookingPage />} />
          <Route path="book-appointment" element={<DepartmentListPage />} />
          <Route path="departments/:id/doctors" element={<DepartmentDetailPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="prescriptions/:id" element={<PrescriptionDetailPage />} />
          <Route path="appointments/confirm" element={<AppointmentConfirmationPage />} />
          <Route path="payment/:billId" element={<PaymentPage />} />
          <Route path="payment/:billId/success" element={<PaymentPage />} />
          <Route path="payment/:billId/cancel" element={<PaymentPage />} />
          <Route path="appointments/upcoming" element={<UpcomingAppointmentsPage />} />
          <Route path="appointments/past" element={<PastAppointmentsPage />} />
          <Route path="medical-record/:id" element={<MedicalRecordDetailPage />} />

          <Route path="profile" element={<ProfilePage />} />
          <Route path="drug-lookup" element={<DrugLookupPage />} />
          <Route
            path="ai-diagnosis"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">{t("sidebar.aiDiagnosis")}</h1>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mb-2">
                    {t("sidebar.new")}
                  </span>
                  <p>AI Diagnosis Page - Coming Soon</p>
                </div>
              </div>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PatientProvider>
  )
}

export default PatientApp
