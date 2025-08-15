"use client";

import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import { FiEdit } from "react-icons/fi";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";
import React from "react";
import type { Doctor } from "../../../types/doctor";
interface UserMetaCardProps {
  doctorData: Doctor;
  setDoctorData: React.Dispatch<React.SetStateAction<Doctor | null>>;
}

const UserMetaCard: React.FC<UserMetaCardProps> = ({
  doctorData,
  setDoctorData,
}) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [tempImage, setTempImage] = useState(null);

  // const handleSave = () => {
  //   if (tempImage && setDoctorData) {
  //     setDoctorData((prev) => ({
  //       ...prev,
  //       profileImage: tempImage,
  //     }))
  //   }
  //   console.log("Saving profile changes...")
  //   closeModal()
  // }

  // const handleImageUpload = (event) => {
  //   const file = event.target.files[0]
  //   if (file) {
  //     const reader = new FileReader()
  //     reader.onload = (e) => {
  //       setTempImage(e.target.result)
  //     }
  //     reader.readAsDataURL(file)
  //   }
  // }

  // Fallback data nếu không có doctorData
  const data = doctorData || {
    fullName: "Musharof Chowdhury",
    position: "Team Manager",
    department: "Arizona, United States",
    avatar: "/images/user/owner.jpg",
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
          Thông tin hồ sơ
        </h4>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Họ và tên
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {data.fullName}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Chuyên khoa
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {data.specialization}
            </p>
          </div>
          {/* Thêm các trường khác nếu cần */}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full p-6 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900">
          <div className="mb-6">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {doctorData ? "Chỉnh sửa ảnh đại diện" : "Edit Profile Picture"}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {doctorData
                ? "Tải lên ảnh đại diện mới cho hồ sơ của bạn."
                : "Upload a new profile picture."}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 overflow-hidden border-2 border-gray-200 rounded-full dark:border-gray-700">
              <img
                src={tempImage || "/placeholder.svg?height=128&width=128"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* <div className="w-full">
              <Label>{doctorData ? "Chọn ảnh mới" : "Choose new image"}</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <p className="mt-1 text-xs text-gray-500">
                {doctorData
                  ? "Định dạng: JPG, JPEG, PNG. Kích thước tối đa: 3MB"
                  : "Formats: JPG, JPEG, PNG. Max size: 3MB"}
              </p>
            </div> */}
          </div>

          {/* <div className="flex items-center gap-3 mt-6 justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              {doctorData ? "Hủy" : "Close"}
            </Button>
            <Button size="sm" onClick={handleSave}>
              {doctorData ? "Lưu thay đổi" : "Save Changes"}
            </Button>
          </div> */}
        </div>
      </Modal>
    </>
  );
};

export default UserMetaCard;
