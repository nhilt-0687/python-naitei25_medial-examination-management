import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import { useState, useEffect } from "react";
import type { AuthUser } from "../../../types/user";
import { authService } from "../../../services/authService";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };
    fetchUser();
  }, []);

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img src="/images/user/owner.jpg" alt="user" />
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user?.role === "ADMIN"
                ? "Quản trị viên"
                : user?.role === "DOCTOR"
                ? "Bác sĩ"
                : user?.role === "PATIENT"
                ? "Bệnh nhân"
                : user?.role === "RECEPTIONIST"
                ? "Lễ tân"
                : "Người dùng"}
            </h4>
            {/* <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.role === "ADMIN"
                  ? "Quản trị viên"
                  : user.role === "DOCTOR"
                  ? "Bác sĩ"
                  : user.role === "PATIENT"
                  ? "Bệnh nhân"
                  : "Lễ tân"}
              </p> */}
            {/* <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.phone}
              </p> */}
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
