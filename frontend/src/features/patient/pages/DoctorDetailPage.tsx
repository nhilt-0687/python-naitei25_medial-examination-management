import React from 'react';
import DoctorHeader from '../components/common/Doctor/DoctorHeader';
import AppointmentForm from '../components/form/AppointmentForm';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../shared/context/AuthContext';
import { message } from 'antd';

const DoctorDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getCurrentUserId } = useAuth();
  const isBooking = new URLSearchParams(location.search).get('book') === 'true';
  const patientId = getCurrentUserId();

  if (!patientId && isBooking) {
    message.error(t('auth.pleaseLogin'));
    navigate('/login');
  }

  const handleBookAppointment = () => {
    if (!patientId) {
      message.error(t('auth.pleaseLogin'));
      navigate('/login');
      return;
    }
    navigate(`/patient/doctors/${id}?book=true`);
  };

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      <DoctorHeader doctorId={Number(id)} onBook={handleBookAppointment} isBooking={isBooking} />
      {isBooking && <AppointmentForm doctorId={Number(id)} />}
    </div>
  );
};

export default DoctorDetailPage;