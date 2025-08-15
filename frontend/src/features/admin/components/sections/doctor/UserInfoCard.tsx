"use client";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import type { Doctor } from "../../../types/doctor";
interface UserInfoCardProps {
  doctorData: Doctor;
  setDoctorData: React.Dispatch<React.SetStateAction<Doctor | null>>;
}

export default function UserInfoCard({
  doctorData,
  setDoctorData,
}: UserInfoCardProps) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };

  if (!doctorData) return <div>Không tìm thấy bác sĩ</div>;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {doctorData ? "Thông tin cá nhân" : "Personal Information"}
            </h4>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      {doctorData ? "Họ và tên đệm" : "First Name"}
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {doctorData.fullName}
                    </p>
                  </div>

                  {doctorData && (
                    <>
                      <div>
                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                          Giới tính
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {doctorData.gender === "MALE"
                            ? "Nam"
                            : doctorData.gender === "FEMALE"
                            ? "Nữ"
                            : "Khác"}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                          Ngày sinh
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {format(new Date(doctorData.birthday), "dd-MM-yyyy")}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                          Địa chỉ
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {doctorData.address}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                          Căn cước công dân
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {doctorData.identityNumber}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                          Ngày tạo
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {format(new Date(doctorData.createdAt), "dd-MM-yyyy")}
                        </p>
                      </div>
                    </>
                  )}

                  {/* <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      {doctorData ? "Email" : "Email address"}
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {doctorData.email}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      {doctorData ? "Số điện thoại" : "Phone"}
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {doctorData.phone}
                    </p>
                  </div> */}

                  {/* {!doctorData && (
                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Bio
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {doctorData.bio}
                      </p>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto transition-all duration-200"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            {doctorData ? "Chỉnh sửa" : "Edit"}
          </button>
        </div>
      </div>

      {/* Professional Information Card - chỉ hiển thị khi có doctorData */}
      {doctorData && (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                Thông tin nghề nghiệp
              </h4>

              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Khoa trực thuộc
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {doctorData.departmentName}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Mã bác sĩ
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {doctorData.doctorId}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Loại tài khoản
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {doctorData.type === "SERVICE"
                          ? "Khám dịch vụ"
                          : doctorData.type === "EXAMINATION"
                          ? "Khám thường"
                          : "Khác"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Chức danh
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {doctorData.academicDegree}
                      </p>
                    </div>

                    <div className="lg:col-span-2">
                      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Chuyên khoa
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {doctorData.specialization}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={openModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto transition-all duration-200"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
                />
              </svg>
              {doctorData ? "Chỉnh sửa" : "Edit"}
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-6 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 max-h-[80vh]">
          <div className="mb-6">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {doctorData ? "Chỉnh sửa thông tin" : "Edit Personal Information"}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {doctorData
                ? "Cập nhật thông tin cá nhân và nghề nghiệp của bạn."
                : "Update your details to keep your profile up-to-date."}
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label>{doctorData ? "Họ và tên đệm" : "First Name"}</Label>
                <Input
                  type="text"
                  value={doctorData.fullName}
                  onChange={() => {}}
                />
              </div>

              {doctorData && (
                <>
                  <div>
                    <Label>Giới tính</Label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                      defaultValue={doctorData.gender}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <Label>Ngày sinh</Label>
                    <Input type="date" value={doctorData.birthday} />
                  </div>
                </>
              )}

              <div>
                <Label>Email</Label>
                <Input type="email" value="admin@gmail.com" />
              </div>
              {/* <div>
                <Label>{doctorData ? "Số điện thoại" : "Phone"}</Label>
                <Input type="tel" value={doctorData.phone} />
              </div> */}

              {doctorData && (
                <>
                  {/* <div>
                    <Label>Khoa trực thuộc</Label>
                    <Input
                      type="text"
                      value={doctorData.department.departmentName}
                    />
                  </div> */}
                  <div>
                    <Label>Mã bác sĩ</Label>
                    <Input type="text" value={doctorData.doctorId} disabled />
                  </div>
                  <div>
                    <Label>Chức danh</Label>
                    <Input type="text" value={doctorData.academicDegree} />
                  </div>
                  <div>
                    <Label>Chuyên khoa</Label>
                    <Input type="text" value={doctorData.specialization} />
                  </div>
                </>
              )}

              {/* {!doctorData && (
                <div className="col-span-2">
                  <Label>Bio</Label>
                  <Input type="text" value={doctorData.bio} />
                </div>
              )} */}
            </div>

            <div className="flex items-center gap-3 justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                {doctorData ? "Hủy" : "Close"}
              </Button>
              <Button size="sm" onClick={handleSave}>
                {doctorData ? "Lưu thay đổi" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
