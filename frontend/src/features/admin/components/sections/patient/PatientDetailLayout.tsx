"use client"

import { useState } from "react"
import PatientSidebar from "./PatientSidebar"
import {
  MedicalRecordsContent,
  AppointmentsContent,
  InvoicesContent,
  PatientInfoContent,
  HealthInfoContent,
  ContactInfoContent,
} from "./PatientDetailContent"
import type { Patient } from "../../../types/patient" // Import Patient type

interface PatientDetailLayoutProps {
  patient: Patient // Add patient prop
}

export default function PatientDetailLayout({ patient }: PatientDetailLayoutProps) {
  const [activeTab, setActiveTab] = useState("medical-records")

  // Content mapping based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "medical-records":
        return <MedicalRecordsContent />
      case "appointments":
        return <AppointmentsContent />
      case "invoices":
        return <InvoicesContent />
      // case "payments":
      //   return <PaymentsContent />;
      case "patient-info":
        return <PatientInfoContent patient={patient} /> // Pass patient prop
      case "health-info":
        return <HealthInfoContent patient={patient} /> // Pass patient prop
      case "contact-info":
        return <ContactInfoContent patient={patient} /> // Pass patient prop
      default:
        return <MedicalRecordsContent /> // Changed default to MedicalRecordsContent
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1">
        <PatientSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="md:col-span-3">{renderContent()}</div>
    </div>
  )
}
