import { Routes, Route, useLocation } from "react-router-dom"
import PublicApp from "./features/public/PublicApp"
import AuthApp from "./features/auth/AuthApp"
import AdminApp from "./features/admin/AdminApp"
import DoctorApp from "./features/doctor/DoctorApp"
import PatientApp from "./features/patient/PatientApp"
import { AuthProvider } from "./shared/context/AuthContext"
import { SidebarProvider } from "./shared/context/SidebarContext"
import ProtectedRoute from "./shared/components/ProtectedRoute"

// Debug component để log routing
const RouteDebugger = () => {
  const location = useLocation()
  console.log("Current location:", location.pathname)
  return null
}

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <RouteDebugger />
        <Routes>
          {/* Public routes - không cần đăng nhập */}
          <Route path="/*" element={<PublicApp />} />

          {/* Auth routes - Không có ProtectedRoute */}
          <Route path="/auth/*" element={<AuthApp />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="A">
                <AdminApp />
              </ProtectedRoute>
            }
          />

          {/* Doctor routes */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute requiredRole="D">
                <DoctorApp />
              </ProtectedRoute>
            }
          />

          {/* Patient routes - chỉ các route cần đăng nhập */}
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute requiredRole="P">
                <PatientApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  )
}

export default App
