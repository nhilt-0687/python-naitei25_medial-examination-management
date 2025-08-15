import React, { useState, useEffect, useCallback } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { message } from 'antd';
import { appointmentService } from '../../../shared/services/appointmentService';
import { paymentService } from '../../../shared/services/paymentService';
import { patientApiService } from '../services/patientApiService'; 
import { patientService } from '../../../shared/services/patientService'; 
import { useAuth } from '../../../shared/context/AuthContext'; 
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import ErrorMessage from '../../../shared/components/common/ErrorMessage';
import { AppointmentStatus, type Appointment } from '../../../shared/types/appointment'; 
import type { Doctor } from '../../../shared/types/doctor'; 
import type { Patient } from '../../../shared/types/patient'; 

const AppointmentConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const doctorId = Number(params.get('doctorId'));
  const appointmentId = Number(params.get('appointmentId'));
  const appointmentDateFromUrl = params.get('date'); 
  const { getCurrentUserId } = useAuth();
  const userId = getCurrentUserId();

  const [appointment, setAppointment] = useState<Appointment | null>(null); 
  const [doctorDetails, setDoctorDetails] = useState<Doctor | null>(null); 
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!appointmentId || !doctorId || !userId) {
          throw new Error('Thông tin cần thiết bị thiếu để tải trang xác nhận.'); 
        }

        const appointmentData = await appointmentService.getAppointmentById(appointmentId);
        setAppointment(appointmentData);
        console.log('Appointment data:', appointmentData);

        const doctorData = await patientApiService.doctors.getById(doctorId); 
        setDoctorDetails(doctorData);
        console.log('Doctor details:', doctorData);

        const patientData = await patientService.getPatientByUserId(userId);
        setPatientDetails(patientData);
        console.log('Patient details:', patientData);

      } catch (err: any) {
        console.error('Error fetching data for confirmation:', err.response?.data || err.message);
        setError(err.response?.data?.error || err.message || 'Đã xảy ra lỗi khi tải thông tin xác nhận.'); 
        setAppointment({
          id: appointmentId,
          status: 'P' as AppointmentStatus, 
          symptoms: '', notes: '', appointmentDate: '', appointmentTime: '', 
          doctorId: doctorId, patientId: 0, createdAt: '', updatedAt: '',
          doctorInfo: { id: doctorId, fullName: 'Đang tải...', specialty: '', department: '' },
          patientInfo: { id: 0, fullName: 'Đang tải...', email: '' }
        });
        setDoctorDetails({ id: doctorId, fullName: 'Đang tải...', specialty: '', department: '', price: 0 }); 
        setPatientDetails({ id: 0, fullName: 'Đang tải...', email: '' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId, doctorId, userId]); 

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    try {
      console.log('handleConfirm - current appointment:', appointment);
      console.log('handleConfirm - current doctorDetails:', doctorDetails);
      console.log('handleConfirm - current patientDetails:', patientDetails);
      console.log('handleConfirm - doctorDetails.price:', doctorDetails?.price); 

      if (!appointment || !doctorDetails || !patientDetails || doctorDetails.price === undefined || doctorDetails.price === null || doctorDetails.price <= 0) {
        throw new Error('Dữ liệu cuộc hẹn không hợp lệ hoặc thiếu thông tin giá bác sĩ/bệnh nhân.'); 
      }

      // SỬA ĐỔI Ở ĐÂY: Gửi 'C' thay vì AppointmentStatus.CONFIRMED
      await appointmentService.updateAppointment(appointment.id, { status: 'C' as AppointmentStatus }); 

      const bill = await paymentService.createBillFromAppointment(
        appointment.id,
        patientDetails.id,
        doctorDetails.price 
      );
      console.log('Bill created:', bill);

      const paymentUrl = await paymentService.createPaymentLink(bill.id);
      console.log('Payment URL:', paymentUrl);
      window.location.href = paymentUrl;
    } catch (error: any) {
      console.error('Error during confirmation:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi xác nhận và thanh toán.'; 
      message.error(errorMsg);
      setError(errorMsg);
    } finally {
      setConfirming(false);
    }
  }, [appointment, doctorDetails, patientDetails, confirming]); 

  const handleBackToDoctor = () => {
    navigate(`/patient/doctors/${doctorId}`); 
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin xác nhận..." />; 
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <ErrorMessage message={error} />
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleBackToDoctor}
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!appointment || !doctorDetails || !patientDetails) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <ErrorMessage message="Không thể tải đầy đủ thông tin cuộc hẹn." /> 
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleBackToDoctor}
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const getPatientFullName = (patient: Patient | null) => {
    if (!patient) return 'N/A';
    if (patient.first_name && patient.last_name) {
      return `${patient.first_name} ${patient.last_name}`;
    }
    if (patient.fullName) {
      return patient.fullName;
    }
    return 'N/A';
  };

  const getDoctorFullName = (doctor: Doctor | null) => {
    if (!doctor) return 'N/A';
    if (doctor.first_name && doctor.last_name) {
      return `${doctor.first_name} ${doctor.last_name}`;
    }
    if ((doctor as any).fullName) { 
      return (doctor as any).fullName;
    }
    return 'N/A';
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="shadow-lg border border-gray-200 rounded-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg p-6">
          <CardTitle className="text-2xl font-bold text-center">
            Xác nhận lịch hẹn 
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Chi tiết lịch hẹn 
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">ID:</span>
                <p className="text-gray-900 font-medium">{appointment.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Bác sĩ:</span>
                <p className="text-gray-900 font-medium">{getDoctorFullName(doctorDetails)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Ngày:</span>
                <p className="text-gray-900 font-medium">
                  {appointmentDateFromUrl 
                    ? new Date(appointmentDateFromUrl).toLocaleDateString('vi-VN') 
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Giờ:</span>
                <p className="text-gray-900 font-medium">
                  {appointment.slotStart 
                    ? appointment.slotStart.substring(0, 5) 
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Trạng thái:</span>
                <p className="text-yellow-600 font-semibold">
                  {/* SỬA ĐỔI Ở ĐÂY: Hiển thị 'CONFIRMED' nếu trạng thái là 'C' */}
                  {appointment.status === 'P' ? 'PENDING' : 
                   appointment.status === 'C' ? 'CONFIRMED' : 
                   appointment.status}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Bệnh nhân:</span>
                <p className="text-gray-900 font-medium">
                  {getPatientFullName(patientDetails)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Ca làm việc:</span>
                <p className="text-gray-900 font-medium">
                  {appointment.schedule?.shift === 'M' ? 'Buổi sáng' : appointment.schedule?.shift === 'A' ? 'Buổi chiều' : appointment.schedule?.shift || 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Số tiền:</span>
                <p className="text-gray-900 font-medium">{doctorDetails.price?.toLocaleString('vi-VN') || 'N/A'} VND</p>
              </div>
            </div>
            {appointment.symptoms && (
              <div className="mt-4">
                <span className="font-medium text-gray-600">Triệu chứng:</span>
                <p className="text-gray-900 mt-2 p-3 bg-blue-50 rounded-lg">{appointment.symptoms}</p>
              </div>
            )}
            {appointment.schedule && (
              <div className="mt-4">
                <span className="font-medium text-gray-600">Địa điểm:</span>
                <p className="text-gray-900 mt-2">
                  <span className="font-medium">Phòng {appointment.schedule.room}</span>
                  {appointment.schedule.floor && ` - Tầng ${appointment.schedule.floor}`}
                  {appointment.schedule.building && ` - Tòa nhà ${appointment.schedule.building}`}
                </p>
                <p className="text-sm text-gray-500">
                  Thời gian làm việc: {appointment.schedule.start_time?.substring(0, 5)} - {appointment.schedule.end_time?.substring(0, 5)}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleConfirm}
              disabled={confirming || appointment.status !== 'P'} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 ease-in-out disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {confirming ? 'Đang xử lý...' : 'Xác nhận và thanh toán'}
            </Button>
            <Button
              type="button"
              onClick={handleBackToDoctor}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg font-semibold transition duration-200 ease-in-out"
            >
              Quay lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentConfirmationPage;
