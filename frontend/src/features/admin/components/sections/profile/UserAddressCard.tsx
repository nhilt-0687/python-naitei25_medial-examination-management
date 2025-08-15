import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import { useState, useEffect } from "react";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Delay 5 giây
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };

  if (loading) {
    return <div className="text-center py-10"></div>;
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Địa chỉ
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Đất nước
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Việt Nam
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Thành phố
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Hồ Chí Minh
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal code giữ nguyên nếu cần */}
    </>
  );
}
