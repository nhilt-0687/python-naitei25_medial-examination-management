import React from "react";
import type { Doctor } from "../../../types/doctor";
import Badge from "../../ui/badge/Badge";

interface DoctorCardProps {
  doctor: Doctor;
  onViewSchedule?: () => void;
  onViewDetail?: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onViewSchedule,
  onViewDetail,
}) => (
  <div className="flex flex-col md:flex-row items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm">
    {/* Avatar và thông tin bác sĩ */}
    <div className="flex items-center justify-center gap-4 w-full md:w-auto">
      <div className="">
        <img
          src={doctor.avatar || "/images/user/owner.jpg"}
          alt={doctor.fullName}
          className="w-20 h-20 rounded-lg object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/user/owner.jpg";
          }}
        />
      </div>
      <div className="grid grid-rows-2 gap-2">
        <div className="flex">
          <h3 className="font-semibold text-gray-800">
            {doctor.academicDegree}. {doctor.fullName}
          </h3>
          <div className="text-gray-500 text-xs ml-3">
            {/* <Badge
                        size="md"
                        color={
                            doctor.status === "Online"
                            ? "success"
                            : doctor.status === "Bận"
                            ? "warning"
                            : "error"
                        }
                        >
                        {doctor.status}
                    </Badge> */}
          </div>
        </div>
        <div className="flex gap-5">
          <p className="text-base-600 text-sm font-medium">
            <span>{doctor.specialization}</span>
          </p>
          <p className="text-gray-400 text-sm">Mã số: {doctor.doctorId}</p>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-6 w-full md:w-auto">
      <button
        className="px-4 py-2 text-white bg-base-600 rounded-lg hover:bg-base-700 font-medium transition"
        onClick={onViewSchedule}
      >
        Xem lịch làm việc
      </button>
      <button
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition"
        onClick={onViewDetail}
      >
        Xem chi tiết bác sĩ
      </button>
    </div>
  </div>
);

export default DoctorCard;
