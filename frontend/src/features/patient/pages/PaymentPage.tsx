import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Calendar, CheckCircle, Clock, DollarSign, FileText, MapPin, RefreshCw, User, XCircle } from 'lucide-react'
import { message } from 'antd'

// Services
import { paymentService } from '../../../shared/services/paymentService'
import { doctorService } from '../../../shared/services/doctorService'
import { patientService } from '../../../shared/services/patientService'
import { scheduleService } from '../../../shared/services/scheduleService'

// Shared UI
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner'
import ErrorMessage from '../../../shared/components/common/ErrorMessage'

type AnyObj = Record<string, any>

export default function PaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { billId } = useParams<{ billId: string }>()
  const { pathname, search } = useLocation()

  // URL state (PayOS return)
  const isSuccess = pathname.includes('/success')
  const isCancel = pathname.includes('/cancel')
  const urlParams = new URLSearchParams(search)
  const orderCode = urlParams.get('orderCode')
  const status = urlParams.get('status')
  const payosCode = urlParams.get('code')
  const payosId = urlParams.get('id')
  const cancelFlag = urlParams.get('cancel')

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)

  // Data state
  const [bill, setBill] = useState<any>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [doctorData, setDoctorData] = useState<any>(null)
  const [patientData, setPatientData] = useState<any>(null)
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [paymentProcessed, setPaymentProcessed] = useState(false)

  // Helpers
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? 'Có' : 'Không'
    if (typeof value === 'object') {
      if ('department_name' in value) return (value as AnyObj).department_name
      if ('name' in value) return (value as AnyObj).name
      if ('fullName' in value) return (value as AnyObj).fullName
      if ('first_name' in value && 'last_name' in value)
        return `${(value as AnyObj).first_name} ${(value as AnyObj).last_name}`
      return JSON.stringify(value)
    }
    return String(value)
  }

  const pickFirst = (...candidates: any[]) => {
    for (const c of candidates) {
      if (c !== undefined && c !== null && c !== '') return c
    }
    return undefined
  }

  const parseDateFlexible = (input: any): Date | null => {
    if (!input) return null
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input
    if (typeof input === 'number') {
      const d = new Date(input)
      return isNaN(d.getTime()) ? null : d
    }
    if (typeof input === 'string') {
      const str = input.trim()
      if (!str) return null
      if (str.includes('T') || str.endsWith('Z')) {
        const d = new Date(str)
        return isNaN(d.getTime()) ? null : d
      }
      const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str)
      if (ymd) {
        const y = Number(ymd[1])
        const m = Number(ymd[2]) - 1
        const d = Number(ymd[3])
        const dt = new Date(y, m, d)
        return isNaN(dt.getTime()) ? null : dt
      }
      const d = new Date(str)
      return isNaN(d.getTime()) ? null : d
    }
    return null
  }

  const formatVNDateFromCandidates = (...candidates: any[]): string => {
    for (const c of candidates) {
      const d = parseDateFlexible(c)
      if (d) {
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yyyy = d.getFullYear()
        return `${dd}/${mm}/${yyyy}`
      }
    }
    return 'N/A'
  }

  const computeShiftCode = (rawShift: any, startTime?: string): 'M' | 'A' | 'E' | 'U' => {
    const v = String(rawShift || '').toUpperCase()
    if (v === 'M' || v === 'A' || v === 'E') return v as any
    const hh = startTime?.slice(0, 2)
    const h = hh ? Number(hh) : NaN
    if (!isNaN(h)) {
      if (h < 12) return 'M'
      if (h < 18) return 'A'
      return 'E'
    }
    return 'U'
  }

  const shiftLabel = (code: 'M' | 'A' | 'E' | 'U') => {
    switch (code) {
      case 'M':
        return 'Ca sáng'
      case 'A':
        return 'Ca chiều'
      case 'E':
        return 'Ca tối'
      default:
        return 'N/A'
    }
  }

  const formatDoctorName = (doctor: any): string => {
    if (!doctor) return 'N/A'
    if (typeof doctor === 'string') return `BS. ${doctor}`
    if (doctor.fullName) return `BS. ${doctor.fullName}`
    if (doctor.first_name && doctor.last_name) return `BS. ${doctor.first_name} ${doctor.last_name}`
    if (doctor.name) return `BS. ${doctor.name}`
    return 'Bác sĩ'
  }

  const formatPatientName = (patient: any): string => {
    if (!patient) return 'N/A'
    if (typeof patient === 'string') return patient
    if (patient.fullName) return patient.fullName
    if (patient.first_name && patient.last_name) return `${patient.first_name} ${patient.last_name}`
    if (patient.name) return patient.name
    return 'Bệnh nhân'
  }

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    const birth = parseDateFlexible(dateOfBirth)
    if (!birth) return 0
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const md = today.getMonth() - birth.getMonth()
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const formatDepartment = (department: any): string => {
    if (!department) return 'N/A'
    if (typeof department === 'string') return department
    if (department.department_name) return department.department_name
    if (department.name) return department.name
    return 'N/A'
  }

    const locationTexts = (appt: AnyObj, sched: AnyObj | null) => {
    const s = sched || appt?.schedule || {}
    const si = appt?.scheduleInfo || {}

    const roomVal = pickFirst(s.room, s.room_id, si.room, si.room_id, appt?.room, appt?.schedule_room)
    const room = typeof roomVal === 'number' ? `Phòng #${roomVal}` : roomVal || 'N/A'

    const floorVal = pickFirst(s.floor, s.floor_name, si.floor, si.floor_name, appt?.floor, appt?.schedule_floor)
    const floor = floorVal || 'N/A'

    const buildingVal = pickFirst(s.building, s.building_name, si.building, si.building_name, appt?.building)
    const building = buildingVal || 'N/A'

    const department = formatDepartment(pickFirst(s.department, si.department, appt?.department))

    return { room, floor, building, department }
  }

  const mapAppointmentStatus = (s: any): { text: string; color: string } => {
    const v = String(s || '').toUpperCase()
    if (v === 'C' || v === 'CONFIRMED') return { text: 'Đã xác nhận', color: 'bg-green-100 text-green-800' }
    if (v === 'P' || v === 'PENDING') return { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' }
    if (v === 'X' || v === 'CANCELLED' || v === 'CANCELED') return { text: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    if (v === 'S' || v === 'SUCCESS' || v === 'COMPLETED') return { text: 'Hoàn tất', color: 'bg-emerald-100 text-emerald-800' }
    return { text: v || 'N/A', color: 'bg-gray-100 text-gray-800' }
  }

  const symptomLabel = (sym: string) => {
    if (!sym) return ''
    const s = sym.toLowerCase()
    const map: Record<string, string> = {
      fever: 'Sốt - Bệnh nhân có triệu chứng sốt, cần được khám và tư vấn điều trị',
      cough: 'Ho - Cần đánh giá thêm để loại trừ nhiễm trùng hô hấp',
      headache: 'Đau đầu - Theo dõi dấu hiệu và điều trị triệu chứng',
    }
    return map[s] || `🧾 ${sym}`
  }

  // Data fetchers
  const fetchDoctorData = async (doctorId: number) => {
    try {
      let doctor = null
      try {
        doctor = await doctorService.getDoctorById(doctorId)
      } catch {
        doctor = await doctorService.getDoctorByUserId(doctorId)
      }
      setDoctorData(
        doctor || {
          id: doctorId,
          fullName: 'Bác sĩ khám bệnh',
          specialty: 'Tổng quát',
          consultationFee: 22500,
        }
      )
    } catch {
      setDoctorData({
        id: doctorId,
        fullName: 'Bác sĩ khám bệnh',
        specialty: 'Tổng quát',
        consultationFee: 22500,
      })
    }
  }

  const fetchPatientData = async (patientId: number) => {
    try {
      const patient = await patientService.getPatientById(patientId)
      setPatientData(patient || { id: patientId, fullName: 'Bệnh nhân' })
    } catch {
      setPatientData({ id: patientId, fullName: 'Bệnh nhân' })
    }
  }

  const fetchScheduleData = async (scheduleId: number | any) => {
    if (!scheduleId || typeof scheduleId !== 'number') {
      setScheduleData(null)
      return
    }
    try {
      const sched = await scheduleService.getScheduleById(scheduleId)
      setScheduleData(sched)
    } catch {
      setScheduleData(null)
    }
  }

  // Load bill + appointment + lookups
  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await paymentService.getPaymentInfo(Number(billId), orderCode || undefined)
        if (!response?.data) throw new Error('No data returned from API')

        setBill({
          id: billId,
          amount: response.data.amount,
          status: response.data.status,
          created_at: response.data.createdAt,
          description: response.data.description,
          orderCode: response.data.orderCode || orderCode,
        })

        const appointmentData = response.data.appointment
        setAppointment(appointmentData || null)

        if (appointmentData?.doctor) fetchDoctorData(appointmentData.doctor)
        if (appointmentData?.patient) fetchPatientData(appointmentData.patient)
        if (appointmentData?.schedule) fetchScheduleData(appointmentData.schedule)
      } catch (err: any) {
        // Optional: fallback when API missing appointment
        if (err?.response?.data?.message?.includes('appointment')) {
          setBill({
            id: billId,
            amount: 100000,
            status: status === 'PAID' ? 'PAID' : 'PENDING',
            created_at: new Date().toISOString(),
            description: `Hóa đơn #${billId}`,
            orderCode: orderCode,
          })
          const mock = {
            id: Number(billId),
            doctor: 5,
            patient: 13,
            schedule: 7,
            slot_start: '11:30:00',
            slot_end: '12:00:00',
            status: 'C',
            symptoms: 'fever',
            created_at: new Date().toISOString(),
          }
          setAppointment(mock)
          fetchDoctorData(mock.doctor)
          fetchPatientData(mock.patient)
          fetchScheduleData(mock.schedule)
        } else {
          setError(err?.response?.data?.message || err?.message || t('common.error'))
        }
      } finally {
        setLoading(false)
      }
    }

    if (billId) fetchBill()
  }, [billId, orderCode, t, status])

  useEffect(() => {
    const processPaymentCallback = async () => {
      if (billId && (isSuccess || isCancel) && !paymentProcessed) {
        try {
          setPaymentProcessed(true)

          if (isSuccess && status === 'PAID' && cancelFlag === 'false') {
            await paymentService.updatePaymentStatus(Number(billId), 'success', {
              orderCode,
              status,
              payosCode,
              payosId,
            })
            message.success(t('payment.paymentSuccess', { defaultValue: 'Thanh toán thành công' }))
          } else if (isCancel || cancelFlag === 'true') {
            await paymentService.updatePaymentStatus(Number(billId), 'cancel', {
              orderCode,
              status,
              payosCode,
              payosId,
            })
            message.error(t('payment.paymentCancelled', { defaultValue: 'Thanh toán đã hủy' }))
          }

          setTimeout(async () => {
            try {
              const response = await paymentService.getPaymentInfo(Number(billId), orderCode || undefined)
              setBill({
                id: billId,
                amount: response.data.amount,
                status: response.data.status,
                created_at: response.data.createdAt,
                description: response.data.description,
                orderCode: response.data.orderCode || orderCode,
              })
              const appt = response.data.appointment || null
              setAppointment(appt)
              if (appt?.schedule) fetchScheduleData(appt.schedule)
            } catch {
              // ignore
            }
          }, 1000)
        } catch {
          // ignore to avoid UI crash
        }
      }
    }

    processPaymentCallback()
  }, [billId, isSuccess, isCancel, status, orderCode, payosCode, payosId, cancelFlag, paymentProcessed, t])

  const handlePay = async () => {
    try {
      const link = await paymentService.createPaymentLink(Number(billId))
      if (link) window.location.href = link
      else message.error(t('payment.noPaymentLink', { defaultValue: 'Không tạo được link thanh toán' }))
    } catch {
      message.error(t('payment.createPaymentLinkFailed', { defaultValue: 'Tạo link thanh toán thất bại' }))
    }
  }

  const handleCancel = () => navigate('/appointments')
  const handleReturnToDashboard = () => navigate('/dashboard')

  if (loading) return <LoadingSpinner message={t('common.loading', { defaultValue: 'Đang tải...' })} />

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <ErrorMessage message={error} />
        <div className="flex justify-center mt-4">
          <Button onClick={handleCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg">
            {t('common.goBack', { defaultValue: 'Quay lại' })}
          </Button>
        </div>
      </div>
    )
  }

  if (!bill || !appointment) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <ErrorMessage message={t('payment.billNotFound', { defaultValue: 'Không tìm thấy hóa đơn' })} />
        <div className="flex justify-center mt-4">
          <Button onClick={handleCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg">
            {t('common.goBack', { defaultValue: 'Quay lại' })}
          </Button>
        </div>
      </div>
    )
  }

  const isPaid = bill.status === 'S' || bill.status === 'PAID'
  const isCancelled = bill.status === 'CANCELLED' || bill.status === 'C'

  const dateText = formatVNDateFromCandidates(
    scheduleData?.work_date,
    scheduleData?.date,
    appointment?.date,
    appointment?.created_at
  )

  const timeStart = pickFirst(
    scheduleData?.start_time,
    scheduleData?.startTime,
    appointment?.schedule?.start_time,
    appointment?.slot_start
  )
  const timeEnd = pickFirst(
    scheduleData?.end_time,
    scheduleData?.endTime,
    appointment?.schedule?.end_time,
    appointment?.slot_end
  )
  const shiftCode = computeShiftCode(
    pickFirst(scheduleData?.shift, appointment?.schedule?.shift, appointment?.shift),
    timeStart
  )
  const shiftText = shiftLabel(shiftCode)

  const scheduleSource = appointment.schedule || scheduleData || {}

  const room = scheduleSource.room ? `Phòng ${scheduleSource.room}` : 'N/A'
  const floor = scheduleSource.floor ? `Tầng ${scheduleSource.floor}` : 'N/A'
  const building = scheduleSource.building ? `Tòa ${scheduleSource.building}` : 'N/A'
  const department = scheduleSource.department?.department_name || 'N/A'


  const apptStatus = mapAppointmentStatus(appointment.status)

  return (
    <div className="container mx-auto max-w-4xl">
      <Card className="shadow-lg border border-gray-200 rounded-lg">
        <CardHeader
          className={`text-white rounded-t-lg p-6 ${
            isPaid
              ? 'bg-gradient-to-r from-green-500 to-green-700'
              : isCancelled
              ? 'bg-gradient-to-r from-red-500 to-red-700'
              : 'bg-gradient-to-r from-blue-500 to-blue-700'
          }`}
        >
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            {isPaid ? (
              <>
                <CheckCircle className="w-8 h-8" />
                {t('payment.successTitle', { defaultValue: 'Thanh toán thành công' })}
              </>
            ) : isCancelled ? (
              <>
                <XCircle className="w-8 h-8" />
                {t('payment.cancelTitle', { defaultValue: 'Thanh toán đã hủy' })}
              </>
            ) : (
              <>
                <Clock className="w-8 h-8" />
                {t('payment.paymentTitle', { defaultValue: 'Thông tin thanh toán' })}
              </>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Doctor */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-inner border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin bác sĩ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-blue-600">Tên bác sĩ:</span>
                <p className="text-gray-900 font-medium text-lg">{formatDoctorName(doctorData)}</p>
              </div>
              <div>
                <span className="font-medium text-blue-600">Chuyên khoa:</span>
                <p className="text-gray-900 font-medium">
                  {safeRender(doctorData?.specialty || doctorData?.department || 'Tổng quát')}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-600 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Phí khám:
                </span>
                <p className="text-gray-900 font-medium text-lg text-green-600">
                  {(
                    doctorData?.consultationFee ||
                    doctorData?.price ||
                    appointment?.doctorInfo?.price ||
                    22500
                  ).toLocaleString('vi-VN')}{' '}
                  VND
                </p>
              </div>
            </div>
          </div>

          {/* Appointment */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg shadow-inner border border-yellow-100">
            <h3 className="text-xl font-semibold text-yellow-800 border-b border-yellow-200 pb-2 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Thông tin cuộc hẹn
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-yellow-600">Mã cuộc hẹn:</span>
                <p className="text-gray-900 font-medium">#{safeRender(appointment.id)}</p>
              </div>

              <div>
                <span className="font-medium text-yellow-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Ngày khám:
                </span>
                <p className="text-gray-900 font-medium">{dateText}</p>
              </div>

              <div>
                <span className="font-medium text-yellow-600">Thời gian:</span>
                <p className="text-gray-900 font-medium">
                  {timeStart ? `${String(timeStart).substring(0, 5)} - ${String(timeEnd || '').substring(0, 5)}` : 'N/A'}
                </p>
              </div>

              <div>
                <span className="font-medium text-yellow-600">Ca khám:</span>
                <p className="text-gray-900 font-medium">{shiftText}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-yellow-600">Trạng thái:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${apptStatus.color}`}>
                  {apptStatus.text}
                </span>
              </div>

              <div>
                <span className="font-medium text-yellow-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Địa điểm:
                </span>
              <p className="text-gray-900 font-medium">
                {room} - {floor}
                <br />
                <span className="text-sm text-gray-600">
                  {building}
                </span>
              </p>
                {scheduleData?.start_time && scheduleData?.end_time && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t('appointment.scheduleTime', {
                      start: String(scheduleData.start_time).substring(0, 5),
                      end: String(scheduleData.end_time).substring(0, 5),
                    })}
                  </p>
                )}
              </div>
            </div>

            {appointment?.symptoms && (
              <div className="mt-4">
                <span className="font-medium text-yellow-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Triệu chứng:
                </span>
                <div className="mt-2 p-3 bg-white rounded-lg border border-yellow-200">
                  <p className="text-gray-900">{symptomLabel(appointment.symptoms)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bill */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg shadow-inner border border-purple-100">
            <h3 className="text-xl font-semibold text-purple-800 border-b border-purple-200 pb-2 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Thông tin hóa đơn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-purple-600">Mã hóa đơn:</span>
                <p className="text-gray-900 font-medium">#{safeRender(bill.id)}</p>
              </div>
              <div>
                <span className="font-medium text-purple-600 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Số tiền:
                </span>
                <p className="text-gray-900 font-medium text-xl text-green-600">
                  {bill.amount?.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div>
                <span className="font-medium text-purple-600">Trạng thái:</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isPaid ? 'bg-green-100 text-green-800' : isCancelled ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {isPaid ? '✅ Đã thanh toán' : isCancelled ? '❌ Đã hủy' : '⏳ Chờ thanh toán'}
                </span>
              </div>
              <div>
                <span className="font-medium text-purple-600">Ngày tạo:</span>
                <p className="text-gray-900 font-medium">{formatVNDateFromCandidates(bill.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isPaid ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="text-green-800 font-medium">✅ Thanh toán thành công! Cuộc hẹn của bạn đã được xác nhận.</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleReturnToDashboard} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                  {t('common.returnToDashboard', { defaultValue: 'Về trang chủ' })}
                </Button>
                <Button
                  onClick={() => navigate('/patient/appointments/upcoming')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {t('appointment.viewAppointments', { defaultValue: 'Xem lịch hẹn' })}
                </Button>
              </div>
            </div>
          ) : isCancelled ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="text-red-800 font-medium">❌ Thanh toán đã bị hủy. Bạn có thể thử lại hoặc quay lại.</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handlePay} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {t('payment.tryAgain', { defaultValue: 'Thử lại thanh toán' })}
                </Button>
                <Button onClick={handleCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg font-semibold">
                  {t('common.goBack', { defaultValue: 'Quay lại' })}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div className="text-yellow-800 font-medium">⏳ Vui lòng thanh toán để xác nhận cuộc hẹn của bạn.</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handlePay}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition duration-200 ease-in-out shadow-lg"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  {t('payment.payNow', { defaultValue: 'Thanh toán ngay' })}
                </Button>
                <Button
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg font-semibold transition duration-200 ease-in-out"
                >
                  {t('payment.cancel', { defaultValue: 'Hủy bỏ' })}
                </Button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-amber-800">
                <div className="font-medium mb-1">Lưu ý quan trọng:</div>
                <p className="text-sm">
                  Vui lòng đến đúng giờ hẹn và mang theo giấy tờ tùy thân. Nếu cần thay đổi lịch hẹn, vui lòng liên hệ trước ít nhất 2 giờ.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-4 mt-6">
        <p>© 2024 Hệ thống quản lý bệnh viện. Mọi quyền được bảo lưu.</p>
        <p className="mt-1">Nếu có vấn đề, vui lòng liên hệ hỗ trợ: support@hospital.com</p>
      </div>
    </div>
  )
}
