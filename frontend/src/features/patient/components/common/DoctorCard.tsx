import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Stethoscope } from 'lucide-react';
import type { Doctor } from '../../../../shared/types/doctor';
import { ACADEMIC_DEGREE_LABELS } from '../../../../shared/types/doctor';

interface DoctorCardProps {
  doctor: Doctor & { avatar?: string; price?: number };
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const avatarUrl = doctor.avatar || 'https://via.placeholder.com/300x150';
  const formatPrice = (price?: number) => {
    if (!price) return t('common.priceNotAvailable');
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const goToBooking = () => {
    navigate(`/patient/doctors/${doctor.id}?book=true`);
  };

  return (
    <Card 
      className="overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-none bg-white"
      onClick={goToBooking}
    >
      <CardHeader className="p-0">
        <div 
          className="h-48 w-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${avatarUrl})` }}
          role="img"
          aria-label={`${doctor.first_name} ${doctor.last_name} avatar`}
        >
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <CardTitle className="text-white text-xl font-bold line-clamp-1">
              BS. {doctor.first_name} {doctor.last_name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm text-gray-600 font-medium">
            {t('common.specialization')}: {doctor.specialization}
          </CardDescription>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center text-sm text-cyan-600">
          <Stethoscope className="h-4 w-4 mr-2" />
          <span>{ACADEMIC_DEGREE_LABELS[doctor.academic_degree] || doctor.academic_degree}</span>
        </div>
        <div className="text-sm font-semibold text-gray-800">
          {t('common.price')}: {formatPrice(doctor.price)}
        </div>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            goToBooking();
          }}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg mt-2"
        >
          {t('common.bookAppointment')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;