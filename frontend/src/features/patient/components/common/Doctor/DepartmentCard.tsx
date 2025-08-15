import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Users, Building2 } from 'lucide-react';
import type { DepartmentDetail } from '../../../../../shared/types/department';
import { useTranslation } from 'react-i18next';

interface DepartmentCardProps {
  department: DepartmentDetail;
  onClick: (id: number) => void;
  showDoctorCount?: boolean;
  doctorCount?: number;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ 
  department, 
  onClick, 
  showDoctorCount = false,
  doctorCount = 0 
}) => {
  const { t } = useTranslation();

  // Hàm để thêm tham số tối ưu hóa cho URL avatar từ Cloudinary
  const getOptimizedAvatarUrl = (url?: string | null) => {
    if (!url) return null;
    const baseUrl = url.split('/upload/');
    if (baseUrl.length < 2) return url;
    return `${baseUrl[0]}/upload/w_auto,h_1000,c_fill,q_auto,f_auto/${baseUrl[1]}`;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-100"
      onClick={() => onClick(department.id)}
    >
      <CardHeader className="p-4 pb-2">
        {/* Avatar */}
        {department.avatar ? (
          <img
            src={getOptimizedAvatarUrl(department.avatar)}
            alt={`${department.department_name} avatar`}
            className="w-full h-32 object-contain"
          />
        ) : (
          <div className="w-full h-32 rounded-md bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-gray-500" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        {/* Department Name */}
        <CardTitle className="text-lg font-semibold text-gray-900">
          {department.department_name}
        </CardTitle>
        {/* Description */}
        {department.description && (
          <CardDescription className="text-sm text-gray-600 line-clamp-2">
            {department.description}
          </CardDescription>
        )}
        {/* Doctor Count */}
        {showDoctorCount && (
          <div className="flex items-center text-sm text-cyan-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{t('common.doctorCount', { count: doctorCount })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentCard;