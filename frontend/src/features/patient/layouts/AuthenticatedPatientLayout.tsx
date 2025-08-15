import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../../../shared/context/SidebarContext";
import AppHeader from "../../../shared/layouts/AppHeader";
import Backdrop from "../../../shared/layouts/Backdrop";
import AppSidebar from "../../../shared/layouts/AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      {/* Left Sidebar */}
      <div>
        <AppSidebar />
        <Backdrop />
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[250px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-7xl md:p-6">
          <Outlet /> {/* Thay children bằng Outlet */}
        </div>
      </div>
    </div>
  );
};

const AuthenticatedPatientLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AuthenticatedPatientLayout;