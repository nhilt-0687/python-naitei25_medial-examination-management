import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { doctorService } from "../../../../shared/services/doctorService";
import { patientService } from "../../../../shared/services/patientService";
import { appointmentService } from "../../../../shared/services/appointmentService";
import { useAuth } from "../../../../shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import LoadingSpinner from "../../../../shared/components/common/LoadingSpinner";
import ErrorMessage from "../../../../shared/components/common/ErrorMessage";
import { Button } from "@/components/ui/button";
import type { BackendCreateAppointmentPayload } from "../../../../shared/types/appointment";

interface AppointmentFormProps {
  doctorId: number;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ doctorId }) => {
  const { getCurrentUserId } = useAuth();
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const [patientId, setPatientId] = useState<number | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    date: new Date().toISOString().split("T")[0],
    session: "M",
    time: "",
    symptoms: [] as string[],
    note: "",
  });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symptomsList = [
    { value: "fever", label: "Sốt" },
    { value: "cough", label: "Ho" },
    { value: "headache", label: "Đau đầu" },
    { value: "other", label: "Khác" },
  ];

  const sessions = [
    { value: "M", label: "Buổi sáng" },
    { value: "A", label: "Buổi chiều" },
  ];

  useEffect(() => {
    if (userId) {
      setLoadingSchedules(true);
      patientService
        .getPatientByUserId(userId)
        .then((data) => {
          setPatientId(data.id);
          setLoadingSchedules(false);
        })
        .catch((err) => {
          setError("Không tìm thấy thông tin bệnh nhân.");
          message.error("Không tìm thấy thông tin bệnh nhân.");
          setLoadingSchedules(false);
        });
    }
  }, [userId]);

  useEffect(() => {
    if (appointmentForm.date) {
      setLoadingSchedules(true);
      setError(null);
      doctorService
        .getDoctorSchedule(doctorId, appointmentForm.date)
        .then((data) => {
          setSchedules(data);
          setLoadingSchedules(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoadingSchedules(false);
          message.error(err.message);
        });
    }
  }, [appointmentForm.date, doctorId]);

  useEffect(() => {
    if (appointmentForm.date && schedules.length > 0) {
      setLoadingSlots(true);
      setError(null);
      const schedule = schedules.find(
        (s) =>
          s.shift === appointmentForm.session &&
          s.work_date === appointmentForm.date
      );
      if (schedule) {
        doctorService
          .getAvailableTimeSlots(schedule.id, appointmentForm.date)
          .then((data) => {
            const filteredSlots = (data?.timeSlots || []).filter(
              (slot) => slot.available
            );
            setAvailableSlots(filteredSlots);
            if (
              !filteredSlots.some((slot) => slot.time === appointmentForm.time)
            ) {
              handleInputChange("time", filteredSlots[0]?.time || "");
            }
            setLoadingSlots(false);
          })
          .catch((err) => {
            setError(err.message);
            setLoadingSlots(false);
            message.error(err.message);
          });
      } else {
        setAvailableSlots([]);
        setLoadingSlots(false);
      }
    }
  }, [appointmentForm.date, appointmentForm.session, doctorId, schedules]);

  const handleInputChange = (field: string, value: any) => {
    setAppointmentForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field !== "time" ? { time: "" } : {}),
    }));
  };

  const calculateSlotEnd = (startTime: string) => {
    if (!startTime) return "";
    const [hours, minutes, seconds = "00"] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes + 30, seconds);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      message.error("Vui lòng đăng nhập.");
      navigate("/login");
      return;
    }

    if (!patientId) {
      message.error("Không tìm thấy thông tin bệnh nhân.");
      return;
    }

    if (!appointmentForm.time) {
      message.error("Vui lòng chọn thời gian.");
      return;
    }

    const selectedSlot = availableSlots.find(
      (slot) => slot.time === appointmentForm.time
    );
    if (!selectedSlot) {
      message.error("Vui lòng chọn thời gian.");
      return;
    }

    const now = new Date();
    // Sửa lỗi "ReferenceError: slot is not defined"
    const slotDateTime = new Date(
      appointmentForm.date + "T" + selectedSlot.time
    );
    if (slotDateTime <= now) {
      message.error("Không thể đặt lịch trong quá khứ.");
      return;
    }

    setLoadingSlots(true);

    try {
      const schedule = schedules.find(
        (s) =>
          s.shift === appointmentForm.session &&
          s.work_date === appointmentForm.date
      );

      if (!schedule) {
        message.error("Không tìm thấy lịch trình phù hợp.");
        setLoadingSlots(false);
        return;
      }

      const payload: BackendCreateAppointmentPayload = {
        doctor: doctorId,
        patient: patientId,
        schedule: schedule.id,
        slot_start: appointmentForm.time,
        slot_end: calculateSlotEnd(appointmentForm.time),
        symptoms:
          appointmentForm.symptoms.join(", ") +
          (appointmentForm.note ? `; Note: ${appointmentForm.note}` : ""),
        status: "PENDING",
      };

      console.log("Sending payload:", payload);

      const appointment = await appointmentService.createAppointment(payload);

      console.log("Appointment created successfully:", appointment);

      message.success("Đặt lịch hẹn thành công!");

      setTimeout(() => {
        navigate(
          `/patient/appointments/confirm?doctorId=${doctorId}&date=${appointmentForm.date}&appointmentId=${appointment.id}`
        );
      }, 500);
    } catch (error: any) {
      console.error("Error submitting appointment:", error);

      let errorMessage = "Đã xảy ra lỗi khi đặt lịch hẹn.";

      if (error?.response?.data) {
        const apiError = error.response.data;
        if (typeof apiError === "string") {
          errorMessage = apiError;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.error) {
          errorMessage = apiError.error;
        } else {
          const validationErrors = [];
          for (const [field, messages] of Object.entries(apiError)) {
            if (Array.isArray(messages)) {
              validationErrors.push(`${field}: ${messages.join(", ")}`);
            } else if (typeof messages === "string") {
              validationErrors.push(`${field}: ${messages}`);
            }
          }
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join("; ");
          }
        }
      } else if (error?.message) {
        try {
          const parsedError = JSON.parse(error.message);
          if (typeof parsedError === "object") {
            errorMessage = JSON.stringify(parsedError);
          } else {
            errorMessage = parsedError;
          }
        } catch {
          errorMessage = error.message;
        }
      }

      message.error(errorMessage);

      if (error?.response?.status === 201 || error?.response?.status === 200) {
        console.log("Appointment might have been created despite error");
        message.warning("Vui lòng kiểm tra trạng thái lịch hẹn.");
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  return (
    <Card className="shadow-lg border border-gray-200 rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Đặt lịch hẹn
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingSchedules || loadingSlots ? <LoadingSpinner /> : null}
        {error && <ErrorMessage message={error} />}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-cyan-600" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                Ngày
              </label>
              <DatePicker
                selected={new Date(appointmentForm.date)}
                onChange={(date) =>
                  handleInputChange(
                    "date",
                    date?.toISOString().split("T")[0] || ""
                  )
                }
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-cyan-600 focus:border-cyan-600"
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-cyan-600" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                Ca làm việc
              </label>
              <div className="flex space-x-2 mt-1">
                {sessions.map((session) => (
                  <button
                    key={session.value}
                    type="button"
                    onClick={() => handleInputChange("session", session.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      appointmentForm.session === session.value
                        ? "bg-cyan-600 text-white"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {session.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-cyan-600" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                Thời gian
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {availableSlots.length === 0 ? (
                  <span className="text-gray-500">
                    Không có khung giờ nào khả dụng.
                  </span>
                ) : (
                  availableSlots.map((slot) => {
                    const isToday =
                      appointmentForm.date ===
                      new Date().toISOString().split("T")[0];
                    const now = new Date();
                    const slotDateTime = new Date(
                      appointmentForm.date + "T" + slot.time
                    );
                    const isPastSlot = isToday && slotDateTime <= now;

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={isPastSlot}
                        onClick={() => handleInputChange("time", slot.time)}
                        className={`px-4 py-2 rounded-lg border transition ${
                          isPastSlot
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : appointmentForm.time === slot.time
                            ? "bg-cyan-600 text-white"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Triệu chứng
            </label>
            <Select
              isMulti
              className="basic-multi-select"
              classNamePrefix="select"
              options={symptomsList}
              value={symptomsList.filter((opt) =>
                appointmentForm.symptoms.includes(opt.value)
              )}
              onChange={(selected) =>
                handleInputChange(
                  "symptoms",
                  (selected as { value: string; label: string }[]).map(
                    (s) => s.value
                  )
                )
              }
              placeholder="Chọn triệu chứng"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                Ghi chú
              </label>
              <textarea
                value={appointmentForm.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-cyan-600 focus:border-cyan-600"
                rows={4}
                placeholder="Nhập ghi chú thêm..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg w-full"
            >
              Gửi
            </Button>
            <Button
              type="button"
              onClick={() =>
                navigate(`/patient/departments/${doctorId}/doctors`)
              }
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg w-full"
            >
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppointmentForm;
