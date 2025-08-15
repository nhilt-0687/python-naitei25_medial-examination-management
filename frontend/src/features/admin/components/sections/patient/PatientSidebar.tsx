import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { patientService } from "../../../services/patientService";
import { Patient } from "../../../types/patient";

const MedicalRecordIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <path d="M14 2v6h6"></path>
    <path d="M16 13H8"></path>
    <path d="M16 17H8"></path>
    <path d="M10 9H8"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const PaymentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const HealthIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
  </svg>
);

interface PatientSidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export default function PatientSidebar({
  activeTab,
  setActiveTab,
}: PatientSidebarProps) {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!patientId) return;
    const fetchPatient = async () => {
      try {
        const response = await patientService.getPatientById(Number(patientId));
        console.log("Patient data:", response);
        setPatient(response.data);
      } catch (error) {
        console.error("Failed to fetch patient data:", error);
      }
    };
    fetchPatient();
  }, [patientId]);

  // Menu items configuration
  const menuItems = [
    { id: "medical-records", name: "Bệnh án", icon: <MedicalRecordIcon /> },
    { id: "appointments", name: "Lịch khám", icon: <CalendarIcon /> },
    { id: "invoices", name: "Hóa đơn", icon: <PaymentIcon /> },
    // { id: "payments", name: "Thanh toán", icon: <PaymentIcon /> },
    { id: "patient-info", name: "Thông tin bệnh nhân", icon: <UserIcon /> },
    { id: "health-info", name: "Thông tin sức khỏe", icon: <HealthIcon /> },
    {
      id: "contact-info",
      name: "Thông tin liên lạc khẩn cấp",
      icon: <ListIcon />,
    },
  ];

  return (
    <div className="w-full bg-white py-6 px-3 rounded-lg border border-gray-200">
      <div className="flex flex-col items-center">
        {/* Patient Image */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
          <img
            src={patient?.avatar || "https://photos.hancinema.net/photos/photo1769662.jpg"}
            alt="Patient"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Patient Info */}
        <h3 className="mt-4 text-lg font-bold text-gray-800">
          {patient ? patient.fullName : "Đang tải..."}
        </h3>
        <p className="text-gray-500 text-sm my-1">
          BN{patient ? patient.patientId?.toString().padStart(4, "0") : ""}
        </p>
        {/* <p className="text-gray-700 text-sm">{patient?.phone || ""}</p> */}
      </div>

      {/* Sidebar Menu */}
      <div className="mt-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-3 text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${
                activeTab === item.id
                  ? "text-base-700 bg-base-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            onClick={() => setActiveTab(item.id)}
          >
            <span
              className={
                activeTab === item.id ? "text-base-700" : "text-gray-500"
              }
            >
              {item.icon}
            </span>
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
