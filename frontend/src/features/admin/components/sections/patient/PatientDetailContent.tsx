"use client"

import MedicalRecord from "./MedicalRecord"
import AddMedicalRecordModal from "./AddMedicalRecordModal"
import EditMedicalRecordModal from "./EditMedicalRecordModal"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table"
import { format } from "date-fns"
import Badge from "../../ui/badge/Badge"
import type React from "react"
import { useState, useEffect } from "react"
import { patientService } from "../../../services/patientService"
import type { Patient, EmergencyContact, PatientUpdateDto, EmergencyContactDto } from "../../../types/patient"
import { useParams, useNavigate } from "react-router-dom"
import { appointmentService } from "../../../services/appointmentService"
import type { Appointment, AppointmentUpdateRequest } from "../../../types/appointment"
import type { Bill } from "../../../types/payment"
import { paymentService } from "../../../services/paymentService"
import type { ServiceOrder } from "../../../types/serviceOrder"
import { BillModal } from "./BillModal"
import type { PrescriptionResponse, UpdatePrescriptionRequest } from "../../../types/pharmacy"
import { pharmacyService } from "../../../services/pharmacyService"
import { DeleteConfirmationModal } from "../../ui/modal/DeleteConfirmationModal"
import { useModal } from "../../../hooks/useModal"
import { Loader2 } from "lucide-react"
import type { CreatePrescriptionRequest } from "../../../types/pharmacy"
import { AppointmentModal } from "./AppointmentModal"
import { getServiceOrdersByAppointmentId } from "../../../services/serviceOrderService";
import { servicesService } from "../../../services/servicesService";


export function MedicalRecordsContent() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Thêm trạng thái lỗi
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionResponse | null>(null)

  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal()
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal()
  const {
    isOpen: isDeleteConfirmModalOpen,
    openModal: openDeleteConfirmModal,
    closeModal: closeDeleteConfirmModal,
  } = useModal()
  const [deletingPrescriptionId, setDeletingPrescriptionId] = useState<number | null>(null)

  const fetchMedicalRecords = async () => {
    if (!patientId) {
      setError("ID bệnh nhân không hợp lệ.")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null) // Reset lỗi
    try {
      console.log("=== DEBUG: Fetching medical records for patient ===", patientId)
      const data = await pharmacyService.getPrescriptionHistoryByPatientId(Number(patientId))
      console.log("=== DEBUG: Received data from service ===", data)

      // Đảm bảo dữ liệu được ánh xạ đúng cách, đặc biệt là quantity
      const mappedData = data.map((prescription: any) => ({
        ...prescription,
        prescriptionDetails:
          prescription.prescriptionDetails?.map((detail: any) => ({
            ...detail,
            prescriptionId: detail.prescriptionId ?? prescription.prescriptionId,
            quantity: detail.quantity !== undefined && detail.quantity !== null ? Number(detail.quantity) : 1,
          })) ?? [],
      }))

      console.log("=== DEBUG: Final mapped data for state ===", mappedData)
      setPrescriptions(mappedData)
    } catch (err) {
      console.error("Lỗi khi tải bệnh án:", err)
      setError("Không thể tải bệnh án. Vui lòng thử lại sau.")
      setPrescriptions([]) // Đặt lại danh sách rỗng khi có lỗi
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicalRecords()
  }, [patientId])

  const handleAddMedicalRecord = async (appointmentId: number, prescriptionData: CreatePrescriptionRequest) => {
    try {
      const finalData = {
        ...prescriptionData,
        appointment_id: appointmentId,
        patient_id: Number(patientId),
      }

      await pharmacyService.createPrescription(finalData)
      await fetchMedicalRecords()
      closeAddModal()
    } catch (err) {
      console.error("Lỗi khi thêm bệnh án:", err)
      alert("Thêm bệnh án thất bại! Vui lòng kiểm tra lại thông tin.")
    }
  }

  const handleEditMedicalRecord = (prescriptionId: number) => {
    const prescriptionToEdit = prescriptions.find((p) => p.prescriptionId === prescriptionId)
    if (prescriptionToEdit) {
      setSelectedPrescription(prescriptionToEdit)
      openEditModal()
    } else {
      alert("Không tìm thấy bệnh án để chỉnh sửa.")
    }
  }

  const handleUpdateMedicalRecord = async (prescriptionId: number, data: UpdatePrescriptionRequest) => {
    try {
      await pharmacyService.updatePrescription(prescriptionId, data)
      await fetchMedicalRecords() // Tải lại dữ liệu sau khi cập nhật
      closeEditModal() // Đóng modal
    } catch (err) {
      console.error("Lỗi khi cập nhật bệnh án:", err)
      alert("Cập nhật bệnh án thất bại! Vui lòng kiểm tra lại thông tin.")
    }
  }

  const handleDeleteMedicalRecord = (prescriptionId: number) => {
    setDeletingPrescriptionId(prescriptionId)
    openDeleteConfirmModal()
  }

  const handleConfirmDeleteMedicalRecord = async () => {
    if (!deletingPrescriptionId) return

    try {
      await pharmacyService.deletePrescription(deletingPrescriptionId)
      await fetchMedicalRecords() // Tải lại dữ liệu sau khi xóa
      closeDeleteConfirmModal()
      alert("Xóa bệnh án thành công!")
    } catch (err) {
      console.error("Lỗi khi xóa bệnh án:", err)
      alert("Xóa bệnh án thất bại! Vui lòng thử lại.")
    }
  }

  return (
    <div className="font-outfit bg-white py-6 px-4 rounded-lg border border-gray-200">
      <div className="flex justify-between mb-4 ml-1">
        <h2 className="text-xl font-semibold">Bệnh án</h2>
        <button
          className="flex items-center justify-center bg-base-700 py-2.5 px-5 rounded-lg text-white text-sm hover:bg-base-700/70"
          onClick={openAddModal} // Sử dụng openAddModal từ useModal
        >
          Thêm bệnh án
          <span className="ml-2 text-lg">+</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải bệnh án...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <button onClick={fetchMedicalRecords} className="mt-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Thử lại
            </button>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có bệnh án nào.</div>
        ) : (
          prescriptions.map((pres) => (
            <MedicalRecord
              key={pres.prescriptionId}
              prescription={pres}
              onEdit={handleEditMedicalRecord}
              onDelete={handleDeleteMedicalRecord}
            />
          ))
        )}
      </div>
      <AddMedicalRecordModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal} // Sử dụng closeModal từ useModal
        onSubmit={handleAddMedicalRecord}
        patientId={Number(patientId)}
      // Nếu có appointmentId từ context, bạn có thể truyền vào đây
      // appointmentId={someAppointmentId}
      />
      <EditMedicalRecordModal
        isOpen={isEditModalOpen} // Sử dụng isEditModalOpen từ useModal
        onClose={closeEditModal} // Sử dụng closeModal từ useModal
        onSubmit={handleUpdateMedicalRecord}
        prescription={selectedPrescription} // Sử dụng selectedPrescription
      />
      <DeleteConfirmationModal
        isOpen={isDeleteConfirmModalOpen} // Sử dụng isDeleteConfirmModalOpen từ useModal
        onClose={closeDeleteConfirmModal} // Sử dụng closeModal từ useModal
        onConfirm={handleConfirmDeleteMedicalRecord}
        title="Xác nhận xóa bệnh án"
        message="Bạn có chắc chắn muốn xóa bệnh án này không? Hành động này không thể hoàn tác."
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
      />
    </div>
  )
}

// AppointmentsContent
export function AppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const { patientId } = useParams()
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [deleteModal, setDeleteModal] = useState<Appointment | null>(null)
  const [editModal, setEditModal] = useState<AppointmentUpdateRequest | null>(null)

  const formatHHmm = (timeStr: string) => {
    if (!timeStr) return "N/A"
    const parts = timeStr.split(":")
    if (parts.length < 2) return "N/A"
    return `${parts[0]}:${parts[1]}`
  }

  const reloadAppointments = async () => {
    if (!patientId) return
    try {
      const data = await appointmentService.getAppointmentsByPatientId(Number(patientId), 1, 50)
      setAppointments(Array.isArray(data) ? data : data.content || [])
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    }
  }

  useEffect(() => {
    reloadAppointments()
  }, [patientId])

  const handleEdit = async (appointmentId: number) => {
    try {
      const data = await appointmentService.getAppointmentById(appointmentId)
      setEditModal({
        appointmentId: data.appointmentId,
        doctorId: data.doctorId,
        patientId: data.patientInfo?.patientId ?? data.patientId ?? 0,
        scheduleId: data.schedule?.scheduleId ?? data.scheduleId ?? 0,
        symptoms: data.symptoms || "",
        // The 'number' field is missing in AppointmentUpdateRequest, assuming it's not needed for update payload
        // If it is, you'll need to add it to AppointmentUpdateRequest type
        appointmentStatus: data.appointmentStatus,
        slotStart: data.slotStart,
        slotEnd: data.slotEnd,
      })
    } catch (error) {
      alert("Không thể tải thông tin cuộc hẹn!")
    }
  }

  return (
    <div className="bg-white py-6 px-4 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 ml-1">Lịch khám</h2>
      <Table>
        <TableHeader className="border-b border-gray-100 bg-slate-600/10 dark:border-white/[0.05]">
          <TableRow>
            <TableCell
              isHeader
              className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
            >
              Mã đặt lịch
            </TableCell>
            <TableCell isHeader className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-gray-400">
              Tên bác sĩ
            </TableCell>
            <TableCell isHeader className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-gray-400">
              Tình trạng
            </TableCell>
            <TableCell isHeader className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-gray-400">
              Thời gian khám
            </TableCell>
            <TableCell isHeader className="px-3 py-3 font-medium text-gray-800 text-theme-sm dark:text-gray-400">
              Hành động
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {appointments.length > 0 ? (
            appointments.map((appt) => (
              <TableRow key={appt.appointmentId}>
                <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                  CH{appt.appointmentId.toString().padStart(4, "0")}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                  {appt.doctorInfo?.fullName}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      appt.appointmentStatus === "PENDING"
                        ? "pending"
                        : appt.appointmentStatus === "COMPLETED"
                          ? "completed"
                          : appt.appointmentStatus === "CANCELLED"
                            ? "cancelled"
                            : appt.appointmentStatus === "CONFIRMED"
                              ? "confirmed"
                              : "light"
                    }
                  >
                    {appt.appointmentStatus === "PENDING"
                      ? "Chờ xác nhận"
                      : appt.appointmentStatus === "COMPLETED"
                        ? "Đã khám"
                        : appt.appointmentStatus === "CANCELLED"
                          ? "Đã hủy"
                          : appt.appointmentStatus === "CONFIRMED"
                            ? "Đã xác nhận"
                            : "Chưa xác định"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                  {formatHHmm(appt.slotStart)} - {formatHHmm(appt.slotEnd)}
                </TableCell>
                <TableCell className="px-4 py-3 flex items-center text-gray-500 text-theme-md dark:text-gray-400">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAppointment(appt)}
                      className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-sky-700 bg-sky-100 rounded-md hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(appt.appointmentId)}
                      className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteModal(appt)}
                      className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="text-center text-gray-500">
                <span className="block col-span-5">Không có lịch khám nào.</span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {selectedAppointment && (
        <AppointmentModal {...selectedAppointment} isOpen={true} onClose={() => setSelectedAppointment(null)} />
      )}
      {editModal && (
        <AppointmentEditModalComponent
          appointment={{
            ...editModal,
          }}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onSubmit={async (updatedData) => {
            try {
              await appointmentService.updateAppointment(editModal.appointmentId, {
                doctorId: updatedData.doctorId,
                patientId: updatedData.patientId,
                scheduleId: updatedData.scheduleId,
                symptoms: updatedData.symptoms,
                // number: updatedData.number, // Removed as it's not in AppointmentUpdateRequest
                appointmentStatus: updatedData.appointmentStatus,
                slotStart: updatedData.slotStart,
                slotEnd: updatedData.slotEnd,
              })
              setEditModal(null)
              reloadAppointments()
            } catch (error) {
              throw error
            }
          }}
        />
      )}
      {deleteModal && (
        <DeleteAppointmentModal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          appointmentId={deleteModal.appointmentId}
          onDelete={async () => {
            await appointmentService.deleteAppointment(deleteModal.appointmentId)
            setDeleteModal(null)
            reloadAppointments()
          }}
        />
      )}
    </div>
  )
}

// InvoicesContent
export function InvoicesContent() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [billServices, setBillServices] = useState<Record<number, ServiceOrder[]>>({});
  const { patientId } = useParams();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadBills = async () => {
    try {
      setLoading(true);
      console.log("Fetching bills for patient:", patientId);

      // 1️⃣ Lấy dữ liệu bill từ backend
      const billsDataRaw = await paymentService.getBillsByPatientId(Number(patientId));

      const billsData: Bill[] = billsDataRaw.map((b: any) => {
        let appointmentObj = null;

        if (typeof b.appointment === "number") {
          appointmentObj = { appointmentId: b.appointment };
        } else if (b.appointment && typeof b.appointment === "object" && "appointmentId" in b.appointment) {
          appointmentObj = b.appointment;
        }

        return {
          billId: b.id,
          appointment: appointmentObj,
          patientId: b.patient,
          totalCost: Number(b.total_cost),
          insuranceDiscount: Number(b.insurance_discount),
          amount: Number(b.amount),
          status: b.status === "P" ? "PAID" : b.status === "U" ? "UNPAID" : b.status,
          createdAt: b.created_at,
          updatedAt: b.updated_at,
          billDetails: b.billDetails || []
        };
      });

      console.log("Bills data:", billsData);

      // 2️⃣ Lấy danh sách dịch vụ của từng bill
      const servicesData = await Promise.all(
        billsData.map(async (bill) => {
          if (bill.appointment?.appointmentId) {
            const serviceOrders = await getServiceOrdersByAppointmentId(
              bill.appointment.appointmentId
            );

            // 3️⃣ Lấy thêm thông tin chi tiết dịch vụ
            const serviceOrdersWithInfo = await Promise.all(
              serviceOrders.map(async (order: any) => {
                try {
                  const serviceInfo = await servicesService.getServiceById(order.service_id);
                  return {
                    ...order,
                    serviceName: serviceInfo.service_name, // lấy đúng field từ backend
                    price: Number(serviceInfo.price)
                  };
                } catch (err) {
                  console.error(`Lỗi lấy dịch vụ id=${order.service_id}`, err);
                  return {
                    ...order,
                    serviceName: "Không xác định",
                    price: 0
                  };
                }
              })
            );

            return { billId: bill.billId, services: serviceOrdersWithInfo };
          } else {
            return { billId: bill.billId, services: [] };
          }
        })
      );

      console.log("Services data:", servicesData);

      // 4️⃣ Map billId -> list services
      const servicesMap = Object.fromEntries(
        servicesData.map(item => [item.billId, item.services])
      );

      setBillServices(servicesMap);
      setBills(billsData);

    } catch (err) {
      console.error("Error loading bills:", err);
      setError("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      reloadBills();
    }
  }, [patientId]);

  const handlePayment = async (bill: Bill, method: "online" | "cash") => {
    try {
      if (method === "online") {
        const paymentUrl = await paymentService.createPayment(bill.billId)
        window.open(paymentUrl, "_blank")

        const checkPaymentStatus = setInterval(async () => {
          try {
            const updatedBills = await paymentService.getBillsByPatientId(Number(patientId))
            const currentBill = updatedBills.find((b) => b.billId === bill.billId)

            if (currentBill?.status === "PAID") {
              clearInterval(checkPaymentStatus)
              setBills(updatedBills)
            }
          } catch (error) {
            console.error("Lỗi kiểm tra trạng thái thanh toán:", error)
          }
        }, 2000)

        setTimeout(
          () => {
            clearInterval(checkPaymentStatus)
          },
          5 * 60 * 1000,
        )
      } else {
        await paymentService.processCashPayment(bill.billId)
        reloadBills()
      }
    } catch (error: any) {
      alert(error.message || "Không thể thực hiện thanh toán")
    }
  }

  const calculateTotalFromServices = (billId: number) => {
    const services = billServices[billId] || []
    return services.reduce((total, service) => total + (service.service?.price || 0), 0)
  }

  return (
    <div className="bg-white py-6 px-4 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 ml-1">Hóa đơn</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-slate-600/10 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Mã hóa đơn
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Ngày tạo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Dịch vụ
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Tình trạng
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Trị giá
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Hành động
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell className="text-center py-4" colSpan={6}>
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell className="text-center text-red-500 py-4" colSpan={6}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : bills.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-gray-500 py-4" colSpan={6}>
                    Không có hóa đơn nào
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => {
                  const services = billServices[bill.billId || 0] || []
                  const totalFromServices = calculateTotalFromServices(bill.billId || 0)

                  return (
                    <TableRow key={bill.billId || Math.random()}>
                      <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-400">
                        #{(bill.billId || 0).toString().padStart(4, "0")}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-400">
                        {bill.createdAt ? format(new Date(bill.createdAt), "dd-MM-yyyy") : "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-400">
                        {services.length > 0 ? (
                          <div className="space-y-1">
                            {services.slice(0, 2).map((service, index) => (
                              <div key={index} className="text-xs">
                                <span className="font-medium">{service.service?.serviceName}</span>
                                <span className="text-gray-500 ml-1">
                                  ({(service.service?.price || 0).toLocaleString("vi-VN")} VNĐ)
                                </span>
                              </div>
                            ))}
                            {services.length > 2 && (
                              <div className="text-xs text-gray-500">+{services.length - 2} dịch vụ khác</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Không có dịch vụ</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={bill.status === "PAID" ? "success" : bill.status === "UNPAID" ? "error" : "cancel"}
                        >
                          {bill.status === "PAID"
                            ? "Đã thanh toán"
                            : bill.status === "UNPAID"
                              ? "Chưa thanh toán"
                              : "Đã hủy"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-start text-xs text-green-700 font-semibold">
                        {totalFromServices.toLocaleString("vi-VN")} VNĐ
                        {totalFromServices !== (bill.amount || 0) && (
                          <div className="text-gray-400 text-xs line-through">
                            {(bill.amount || 0).toLocaleString("vi-VN")} VNĐ
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-md dark:text-gray-400">
                        <div className="flex gap-2">
                          {bill.status === "UNPAID" ? (
                            <>
                              <button
                                onClick={() => handlePayment(bill, "online")}
                                className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Online
                              </button>

                              <button
                                onClick={() => handlePayment(bill, "cash")}
                                className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Tiền mặt
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedBill(bill)}
                              className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-sky-700 bg-sky-100 rounded-md hover:bg-sky-200 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Xem chi tiết
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedBill && (
        <BillModal
          {...selectedBill}
          services={billServices[selectedBill.billId || 0] || []}
          isOpen={true}
          onClose={() => {
            setSelectedBill(null)
            reloadBills()
          }}
        />
      )}
    </div>
  )
}

// PaymentsContent
export function PaymentsContent() {
  // Define Payment interface locally as it's not exported from ../../../types/payment
  interface Payment {
    id: string
    transactionDate: string
    status: "Thành công" | "Lỗi" | "Đang chờ"
    amount: string
    method: "Tiền mặt" | "Chuyển khoản" | "Thẻ"
  }

  const paymentData: Payment[] = [
    {
      id: "P2025-0045",
      transactionDate: "2025-02-15 12:50",
      status: "Đang chờ",
      amount: "2.250.000 VNĐ",
      method: "Thẻ",
    },
    {
      id: "P2025-0023",
      transactionDate: "2025-01-14 12:50",
      status: "Thành công",
      amount: "150.000 VNĐ",
      method: "Chuyển khoản",
    },
    {
      id: "P2025-0018",
      transactionDate: "2025-01-13 12:50",
      status: "Lỗi",
      amount: "150.000 VNĐ",
      method: "Chuyển khoản",
    },
    {
      id: "P2025-0011",
      transactionDate: "2025-01-12 12:50",
      status: "Thành công",
      amount: "500.000 VNĐ",
      method: "Tiền mặt",
    },
    {
      id: "P2025-0023",
      transactionDate: "2025-01-11 12:50",
      status: "Thành công",
      amount: "150.000 VNĐ",
      method: "Chuyển khoản",
    },
    {
      id: "P2025-0018",
      transactionDate: "2025-01-10 12:50",
      status: "Lỗi",
      amount: "150.000 VNĐ",
      method: "Chuyển khoản",
    },
    {
      id: "P2025-0011",
      transactionDate: "2025-01-08 12:50",
      status: "Đang chờ",
      amount: "500.000 VNĐ",
      method: "Tiền mặt",
    },
  ]
  return (
    <div className="bg-white py-6 px-4 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Thanh toán</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-slate-600/10 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Mã giao dịch
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Thời gian thanh toán
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Tình trạng
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Số tiền
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Phương thức
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Hành động
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paymentData.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm font-bold dark:text-gray-400">
                    GD{transaction.id.toString().padStart(4, "0")}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                    {transaction.transactionDate}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        transaction.status === "Thành công"
                          ? "success"
                          : transaction.status === "Đang chờ"
                            ? "warning"
                            : "error"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-green-700 font-semibold text-theme-sm dark:text-gray-400">
                    {transaction.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                    {transaction.method}
                  </TableCell>
                  <TableCell className="px-4 py-3 flex items-center text-gray-500 text-theme-md dark:text-gray-400">
                    <button className="flex items-center gap-2 px-5 py-1 text-xs font-medium text-sky-700 bg-sky-100 rounded-md hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                      <svg
                        className="stroke-current fill-white dark:fill-gray-800"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.29004 5.90393H17.7067"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17.7075 14.0961H2.29085"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// PatientInfoContent
export function PatientInfoContent({ patient }: { patient: Patient }) {
  const { patientId } = useParams()
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState<PatientUpdateDto>({} as PatientUpdateDto)
  const [loading, setLoading] = useState(false)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  useEffect(() => {
    if (patient) {
      setEditData({
        userId: patient.patientId,
        height: patient.height,
        weight: patient.weight,
        bloodType: patient.bloodType,
        avatar: patient.avatar,
        allergies: patient.allergies,
        fullName: patient.fullName,
        birthday: patient.birthday,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        insuranceNumber: patient.insuranceNumber,
        identityNumber: patient.identityNumber,
      })
    }
  }, [patient])

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId) return
    try {
      setLoading(true)
      await patientService.updatePatient(Number(patientId), {
        fullName: editData.fullName,
        identityNumber: editData.identityNumber,
        insuranceNumber: editData.insuranceNumber,
        birthday: editData.birthday,
        phone: editData.phone,
        email: editData.email,
        avatar: editData.avatar,
        gender: editData.gender as "MALE" | "FEMALE" | "OTHER",
        address: editData.address,
        allergies: editData.allergies,
        height: editData.height,
        weight: editData.weight,
        bloodType: editData.bloodType,
      })
      setShowEditModal(false)
      // Re-fetch patient data to update the parent component's state
      const updatedPatient = await patientService.getPatientById(Number(patientId))
      // This assumes PatientDetailLayout will re-render with the new patient prop
      // In a real app, you might want to pass a callback to update parent state
      // For now, relying on the parent (PatientDetail) to re-fetch if needed.
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error)
      let message = "Cập nhật thông tin thất bại!"
      if (error?.response?.data?.message) {
        message = error.response.data.message
      } else if (error?.response?.data) {
        message = JSON.stringify(error.response.data)
      } else if (error?.message) {
        message = error.message
      }
      setErrorModal(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-6 px-5 rounded-lg border border-gray-200">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Thông tin bệnh nhân</h2>
        <button
          className="flex items-center justify-center bg-base-700 py-2.5 px-5 rounded-lg text-white text-sm hover:bg-base-700/70"
          onClick={() => setShowEditModal(true)}
        >
          Sửa
        </button>
      </div>
      <div className="space-y-4 ml-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Họ và tên</p>
            <p className="font-medium">{patient?.fullName}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Mã bệnh nhân</p>
            <p className="font-medium">BN{patient?.patientId?.toString().padStart(4, "0")}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Ngày sinh</p>
            <p className="font-medium">{patient?.birthday}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Giới tính</p>
            <p className="font-medium">
              {patient?.gender === "MALE" ? "Nam" : patient?.gender === "FEMALE" ? "Nữ" : "Khác"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Điện thoại</p>
            <p className="font-medium">{patient?.phone || ""}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-medium">{patient?.email || ""}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Địa chỉ</p>
            <p className="font-medium">{patient?.address}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Bảo hiểm y tế</p>
            <p className="font-medium">{patient?.insuranceNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Căn cước công dân</p>
            <p className="font-medium">{patient?.identityNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Ngày tạo tài khoản</p>
            <p className="font-medium">
              {patient?.createdAt ? format(new Date(patient?.createdAt), "dd-MM-yyyy") : ""}
            </p>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999">
          <div
            className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
            onClick={() => setShowEditModal(false)}
          ></div>
          <div
            className="relative w-full rounded-3xl bg-white dark:bg-gray-900 max-w-[700px] lg:p-8 mt-[5vh] mb-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 px-2 pb-4">
                <h5 className="mb-4 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-xl">
                  Chỉnh sửa thông tin bệnh nhân
                </h5>
              </div>

              <div className="flex-1 px-2">
                <form id="patient-edit-form" onSubmit={handleEditSubmit} className="space-y-6">
                  {/* Thông tin cơ bản */}
                  <div>
                    <h6 className="text-base font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
                      Thông tin cơ bản
                    </h6>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Họ và tên <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="fullName"
                            value={editData.fullName || ""}
                            onChange={handleEditChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                            placeholder="Nhập họ và tên"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giới tính <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="gender"
                            value={editData.gender || ""}
                            onChange={handleEditChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                            required
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày sinh <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="birthday"
                          type="date"
                          value={editData.birthday || ""}
                          onChange={handleEditChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thông tin liên hệ */}
                  <div>
                    <h6 className="text-base font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
                      Thông tin liên hệ
                    </h6>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                          <input
                            name="phone"
                            value={editData.phone || ""}
                            onChange={handleEditChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            name="email"
                            type="email"
                            value={editData.email || ""}
                            onChange={handleEditChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                            placeholder="Nhập địa chỉ email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input
                          name="address"
                          value={editData.address || ""}
                          onChange={handleEditChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                          placeholder="Nhập địa chỉ"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thông tin giấy tờ */}
                  <div>
                    <h6 className="text-base font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
                      Thông tin giấy tờ
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Căn cước công dân</label>
                        <input
                          name="identityNumber"
                          value={editData.identityNumber || ""}
                          onChange={handleEditChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                          placeholder="Nhập số căn cước công dân"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hiểm y tế</label>
                        <input
                          name="insuranceNumber"
                          value={editData.insuranceNumber || ""}
                          onChange={handleEditChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                          placeholder="Nhập số bảo hiểm y tế"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ảnh đại diện */}
                  <div>
                    <h6 className="text-base font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
                      Ảnh đại diện
                    </h6>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL ảnh đại diện</label>
                        <input
                          name="avatar"
                          value={editData.avatar || ""}
                          onChange={handleEditChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                          placeholder="Nhập đường dẫn ảnh đại diện (https://...)"
                        />
                        <p className="mt-1 text-xs text-gray-500">Nhập URL hình ảnh hợp lệ.</p>
                      </div>

                      {editData.avatar && (
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border">
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <img
                                src={editData.avatar || "/placeholder.svg"}
                                alt="Preview ảnh đại diện"
                                className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHA0aCBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjOUNBNEFGIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4KPC9zdmc+"
                                  target.classList.add("opacity-50")
                                }}
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900">Preview ảnh đại diện</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Đây là cách ảnh của bạn sẽ hiển thị trong hệ thống
                            </p>
                            <button
                              type="button"
                              onClick={() => setEditData((prev) => ({ ...prev, avatar: "" }))}
                              className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        </div>
                      )}

                      {!editData.avatar && (
                        <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500">Chưa có ảnh đại diện</p>
                            <p className="text-xs text-gray-400">Nhập URL ảnh bên trên để xem preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex-shrink-0 px-2 pt-4 border-t border-gray-200 bg-white">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2.5 text-sm font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowEditModal(false)}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    form="patient-edit-form"
                    className="px-4 py-2.5 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Lỗi</h2>
            <p>{errorModal}</p>
            <div className="flex justify-end mt-6">
              <button onClick={() => setErrorModal(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// HealthInfoContent
export function HealthInfoContent({ patient }: { patient: Patient }) {
  const { patientId } = useParams()
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState<PatientUpdateDto>({} as PatientUpdateDto)
  const [loading, setLoading] = useState(false)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  useEffect(() => {
    if (patient) {
      setEditData({
        userId: patient.patientId,
        fullName: patient.fullName,
        birthday: patient.birthday,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        avatar: patient.avatar,
        address: patient.address,
        insuranceNumber: patient.insuranceNumber,
        identityNumber: patient.identityNumber,
        allergies: patient.allergies,
        height: patient.height,
        weight: patient.weight,
        bloodType: patient.bloodType,
      })
    }
  }, [patient])

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({
      ...prev,
      [name]: name === "height" || name === "weight" ? Number(value) : value,
    }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId) return
    try {
      setLoading(true)
      await patientService.updatePatient(Number(patientId), {
        fullName: editData.fullName,
        identityNumber: editData.identityNumber,
        insuranceNumber: editData.insuranceNumber,
        birthday: editData.birthday,
        phone: editData.phone,
        email: editData.email,
        avatar: editData.avatar,
        gender: editData.gender,
        address: editData.address,
        allergies: editData.allergies,
        height: editData.height,
        weight: editData.weight,
        bloodType: editData.bloodType,
      })
      setShowEditModal(false)
      // Re-fetch patient data to update the parent component's state
      const updatedPatient = await patientService.getPatientById(Number(patientId))
      // For now, relying on the parent (PatientDetail) to re-fetch if needed.
    } catch (error: any) {
      setErrorModal("Cập nhật thông tin sức khỏe thất bại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-6 px-5 rounded-lg border border-gray-200">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Thông tin sức khỏe</h2>
        <button
          className="flex items-center justify-center bg-base-700 py-2.5 px-5 rounded-lg text-white text-sm hover:bg-base-700/70"
          onClick={() => setShowEditModal(true)}
        >
          Sửa
        </button>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Dị ứng</h3>
          <ul className="list-disc pl-5 space-y-1">
            {patient?.allergies?.split("\n").map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">Các chỉ số sức khỏe</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Chiều cao</p>
              <p className="font-medium">{patient?.height} cm</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Cân nặng</p>
              <p className="font-medium">{patient?.weight} kg</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Nhóm máu</p>
              <p className="font-medium">{patient?.bloodType || "Chưa xác định"}</p>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999">
          <div
            className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
            onClick={() => setShowEditModal(false)}
          ></div>
          <div
            className="relative w-full rounded-3xl bg-white dark:bg-gray-900 max-w-[500px] lg:p-8 mt-[5vh] mb-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 px-2 pb-4">
                <h5 className="mb-4 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  Chỉnh sửa thông tin sức khỏe
                </h5>
              </div>

              <div className="flex-1 px-2">
                <form id="health-edit-form" onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dị ứng</label>
                    <textarea
                      name="allergies"
                      value={editData.allergies || ""}
                      onChange={handleEditChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0 min-h-[80px] resize-none"
                      placeholder="Nhập dị ứng (mỗi dòng 1 dị ứng)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao (cm)</label>
                      <input
                        name="height"
                        type="number"
                        value={editData.height ?? ""}
                        onChange={handleEditChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                        min={0}
                        placeholder="Nhập chiều cao"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                      <input
                        name="weight"
                        type="number"
                        value={editData.weight ?? ""}
                        onChange={handleEditChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                        min={0}
                        placeholder="Nhập cân nặng"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm máu</label>
                    <select
                      name="bloodType"
                      value={editData.bloodType || ""}
                      onChange={handleEditChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                    >
                      <option value="">Chọn nhóm máu</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </form>
              </div>

              <div className="flex-shrink-0 px-2 pt-4 border-t border-gray-200 bg-white">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2.5 text-sm font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowEditModal(false)}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    form="health-edit-form"
                    className="px-4 py-2.5 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Lỗi</h2>
            <p>{errorModal}</p>
            <div className="flex justify-end mt-6">
              <button onClick={() => setErrorModal(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AppointmentEditModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
}: {
  appointment: AppointmentUpdateRequest
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AppointmentUpdateRequest) => Promise<void>
}) {
  const [formData, setFormData] = useState<AppointmentUpdateRequest>({
    ...appointment,
    // number: appointment.number, // Removed as it's not in AppointmentUpdateRequest
  })
  const [loading, setLoading] = useState(false)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "number" || name === "doctorId" ? Number(value) : value,
    }))
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      appointmentStatus: e.target.value as AppointmentUpdateRequest["appointmentStatus"],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      setErrorModal(null)
    } catch (error: any) {
      // In chi tiết lỗi ra console
      console.error("Lỗi cập nhật lịch khám:", error)

      // Lấy thông tin chi tiết lỗi từ backend nếu có
      let message = "Cập nhật lịch khám thất bại!"
      if (error?.response?.data) {
        // Nếu backend trả về mảng lỗi hoặc object lỗi chi tiết
        if (Array.isArray(error.response.data)) {
          message = error.response.data.map((err: any) => err.message || JSON.stringify(err)).join("\n")
        } else if (typeof error.response.data === "object") {
          // Nếu là object, lấy từng trường lỗi
          message = Object.values(error.response.data)
            .map((msg) => (Array.isArray(msg) ? msg.join(", ") : msg))
            .join("\n")
        } else if (error.response.data.message) {
          message = error.response.data.message
        } else {
          message = JSON.stringify(error.response.data)
        }
      } else if (error?.message) {
        message = error.message
      }
      alert(message)
      setErrorModal(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl ">
          <h2 className="text-xl font-semibold mb-4">Chỉnh sửa lịch khám</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Bác sĩ (ID)</label>
                <input
                  name="doctorId"
                  type="number"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Triệu chứng</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Thời gian bắt đầu</label>
                <input
                  name="slotStart"
                  type="time"
                  value={formData.slotStart}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Thời gian kết thúc</label>
                <input
                  name="slotEnd"
                  type="time"
                  value={formData.slotEnd}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Số thứ tự</label>
                <input
                  name="number"
                  type="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Tình trạng</label>
                <select
                  name="appointmentStatus"
                  value={formData.appointmentStatus || ""}
                  onChange={handleStatusChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="COMPLETED">Đã khám</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-base-600 text-white rounded-lg hover:bg-base-700"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Lỗi</h2>
            <p>{errorModal}</p>
            <div className="flex justify-end mt-6">
              <button onClick={() => setErrorModal(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function ContactInfoContent({ patient }: { patient: Patient }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const { patientId } = useParams()
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null)
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null)
  const [deleteContact, setDeleteContact] = useState<EmergencyContact | null>(null)
  const [editData, setEditData] = useState<EmergencyContactDto>({
    contactName: "",
    contactPhone: "",
    relationship: "FAMILY",
  })
  const [loading, setLoading] = useState(false)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  const reloadContacts = async () => {
    if (!patientId) return
    try {
      const data = await patientService.getEmergencyContacts(Number(patientId))
      setContacts(data)
    } catch (error) {
      setErrorModal("Không thể tải danh sách liên hệ!")
    }
  }

  useEffect(() => {
    if (patientId) {
      reloadContacts()
    }
    // eslint-disable-next-line
  }, [patientId])

  const handleView = (contact: EmergencyContact) => {
    setSelectedContact(contact)
  }

  const handleEdit = (contact: EmergencyContact) => {
    setEditContact(contact)
    setEditData({
      contactName: contact.contactName,
      contactPhone: contact.contactPhone,
      relationship: contact.relationship as "FAMILY" | "FRIEND" | "OTHERS",
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editContact || !patientId) return
    if (
      !editData.contactName ||
      !editData.contactPhone ||
      !editData.relationship ||
      !["FAMILY", "FRIEND", "OTHERS"].includes(editData.relationship)
    ) {
      setErrorModal("Vui lòng nhập đầy đủ và đúng thông tin liên hệ!")
      return
    }
    setLoading(true)
    try {
      await patientService.updateEmergencyContact(editContact.contactId, Number(patientId), editData)
      setEditContact(null)
      setEditData({
        contactName: "",
        contactPhone: "",
        relationship: "FAMILY",
      })
      reloadContacts()
    } catch (error: any) {
      console.error("Lỗi cập nhật liên hệ:", error)

      let message = "Cập nhật liên hệ thất bại!"
      if (error?.response?.data) {
        if (Array.isArray(error.response.data)) {
          message = error.response.data.map((err: any) => err.message || JSON.stringify(err)).join("\n")
        } else if (typeof error.response.data === "object") {
          message = Object.values(error.response.data)
            .map((msg) => (Array.isArray(msg) ? msg.join(", ") : msg))
            .join("\n")
        } else if (error.response.data.message) {
          message = error.response.data.message
        } else {
          message = JSON.stringify(error.response.data)
        }
      } else if (error?.message) {
        message = error.message
      }
      setErrorModal(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteContact || !patientId) return
    setLoading(true)
    try {
      await patientService.deleteEmergencyContact(deleteContact.contactId, Number(patientId))
      setDeleteContact(null)
      reloadContacts()
    } catch (error: any) {
      setErrorModal("Xóa liên hệ thất bại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-6 px-4 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 ml-1">Thông tin liên lạc khẩn cấp</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-slate-600/10 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Tên người liên lạc
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Số điện thoại
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Mối quan hệ
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHeader>

            {contacts && contacts.length > 0 ? (
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {contacts.map((contact) => (
                  <TableRow key={contact.contactId}>
                    <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-400">
                      {contact.contactName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                      {contact.contactPhone}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                      {contact.relationship === "FAMILY"
                        ? "Gia đình"
                        : contact.relationship === "FRIEND"
                          ? "Bạn bè"
                          : contact.relationship === "OTHERS"
                            ? "Khác"
                            : "Chưa xác định"}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-theme-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(contact)}
                          className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-sky-700 bg-sky-100 rounded-md hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Xem
                        </button>
                        <button
                          onClick={() => handleEdit(contact)}
                          className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-yellow-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Sửa
                        </button>
                        <button
                          onClick={() => setDeleteContact(contact)}
                          className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Xóa
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell className="pl-4 py-2 text-gray-500 text-theme-sm dark:text-gray-400">
                    Không có liên hệ khẩn cấp
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </div>
      </div>

      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Chi tiết liên hệ</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Tên:</span> {selectedContact.contactName}
              </div>
              <div>
                <span className="font-medium">Số điện thoại:</span> {selectedContact.contactPhone}
              </div>
              <div>
                <span className="font-medium">Mối quan hệ:</span>{" "}
                {selectedContact.relationship === "FAMILY"
                  ? "Gia đình"
                  : selectedContact.relationship === "FRIEND"
                    ? "Bạn bè"
                    : selectedContact.relationship === "OTHERS"
                      ? "Khác"
                      : "Chưa xác định"}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {editContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Chỉnh sửa liên hệ</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Tên người liên lạc</label>
                <input
                  name="contactName"
                  value={editData.contactName || ""}
                  onChange={(e) => setEditData((d) => ({ ...d, contactName: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Số điện thoại</label>
                <input
                  name="contactPhone"
                  value={editData.contactPhone || ""}
                  onChange={(e) => setEditData((d) => ({ ...d, contactPhone: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Mối quan hệ</label>
                <select
                  name="relationship"
                  value={editData.relationship || ""}
                  onChange={(e) =>
                    setEditData((d) => ({
                      ...d,
                      relationship: e.target.value as EmergencyContact["relationship"],
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Chọn mối quan hệ</option>
                  <option value="FAMILY">Gia đình</option>
                  <option value="FRIEND">Bạn bè</option>
                  <option value="OTHERS">Khác</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditContact(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-base-600 text-white rounded-lg hover:bg-base-700"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={!!deleteContact}
        onClose={() => setDeleteContact(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa liên hệ"
        message={
          deleteContact
            ? `Bạn có chắc chắn muốn xóa liên hệ ${deleteContact.contactName} không? Thao tác này sẽ không thể hoàn tác.`
            : ""
        }
      />

      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Lỗi</h2>
            <p>{errorModal}</p>
            <div className="flex justify-end mt-6">
              <button onClick={() => setErrorModal(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
