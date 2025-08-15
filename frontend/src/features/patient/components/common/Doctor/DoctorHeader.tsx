import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, User, DollarSign } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { doctorService } from '../../../../../shared/services/doctorService';
import LoadingSpinner from '../../../../../shared/components/common/LoadingSpinner';
import ErrorMessage from '../../../../../shared/components/common/ErrorMessage';
import { ACADEMIC_DEGREE_LABELS } from '../../../../../shared/types/doctor';
import { useTranslation } from 'react-i18next';

interface DoctorHeaderProps {
  doctorId: number;
  onBook: () => void;
  isBooking: boolean;
}

const DoctorHeader: React.FC<DoctorHeaderProps> = ({ doctorId, onBook, isBooking }) => {
  const { t } = useTranslation();
  const { data: doctor, loading, error } = useApi(
    () => doctorService.getDoctorById(doctorId),
    [doctorId]
  );

  const formatPrice = (price?: number) =>
    price
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
      : t('common.priceNotAvailable');

  if (loading) return <LoadingSpinner message={t('common.loadingDoctor')} />;
  if (error) return <ErrorMessage message={error || t('common.error')} />;
  if (!doctor) return <ErrorMessage message={t('common.doctorNotFound')} />;

  const avatarUrl = doctor.avatar || 'https://via.placeholder.com/600x200';

  return (
    <Card className="shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="p-0">
        <div
          className="h-48 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${avatarUrl})` }}
          role="img"
          aria-label={t('common.doctorAvatar', {
            firstName: doctor.first_name,
            lastName: doctor.last_name
          })}
        />
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          {t('common.doctorTitle', { firstName: doctor.first_name, lastName: doctor.last_name })}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-gray-700">
            <Stethoscope className="h-5 w-5 text-cyan-600" />
            <p><span className="font-semibold">{t('common.specialization')}:</span> {doctor.specialization}</p>
          </div>
          <div className="flex items-center space-x-3 text-gray-700">
            <User className="h-5 w-5 text-cyan-600" />
            <p><span className="font-semibold">{t('common.academicDegree')}:</span> {ACADEMIC_DEGREE_LABELS[doctor.academic_degree] || doctor.academic_degree}</p>
          </div>
          <div className="flex items-center space-x-3 text-gray-700">
            <DollarSign className="h-5 w-5 text-cyan-600" />
            <p><span className="font-semibold">{t('common.price')}:</span> {formatPrice(doctor.price)}</p>
          </div>
        </div>
        {!isBooking && (
          <Button
            onClick={onBook}
            className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg"
          >
            {t('common.bookAppointment')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorHeader;