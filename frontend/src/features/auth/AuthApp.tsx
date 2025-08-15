import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next"
import Login from '../../features/auth/pages/Login';
import PatientLoginForm from './components/PatientLoginForm';
import ErrorBoundary from "./components/ErrorBoundary";
import { RegisterProvider } from "./context/RegisterContext";
import RegisterCommon from "./components/RegisterCommon";
import RegisterDetail from "./components/RegisterDetail";
import VerifyOTP from "./components/VerifyOTP";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const AuthApp: React.FC = () => {
  const { t } = useTranslation()

  return (
    <RegisterProvider>
      <ErrorBoundary>
        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/patient-login" element={<PatientLoginForm />} />
            <Route path="/register" element={<RegisterCommon />} />
            <Route path="/register/details" element={<RegisterDetail />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Fallback route cho debug */}
            <Route path="*" element={<div>AuthApp 404 - Path: {location.pathname}</div>} />
          </Routes>
        </div>
      </ErrorBoundary>
    </RegisterProvider>
  )
}

export default AuthApp
