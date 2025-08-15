import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DepartmentCard from '../components/common/Doctor/DepartmentCard';
import SearchBar from '../components/form/SearchBar';
import { useApi } from '../hooks/useApi';
import { departmentService } from '../../../shared/services/departmentService';
import type { DepartmentDetail } from '../types/department';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import ErrorMessage from '../../../shared/components/common/ErrorMessage';

const DepartmentListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: departments, loading, error } = useApi(() => departmentService.getDepartments(), []);

  console.log('Departments:', departments);
  console.log('Loading:', loading);
  console.log('Error:', error);

  const filteredDepartments = departments?.filter(department =>
    department.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDepartmentClick = (id: number) => {
    navigate(`/patient/departments/${id}/doctors`);
  };

  const handleSearch = () => {
    // Search is handled by filtering, no need for navigation
  };

  if (loading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('common.departmentList')}</h2>
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder={t('common.searchDepartmentsPlaceholder')}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {searchQuery ? `${filteredDepartments.length} ${t('common.searchResults')}` : `${departments?.length || 0} ${t('common.department')}`}
        </p>
      </div>

      {/* Departments Grid */}
      {filteredDepartments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {filteredDepartments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              onClick={handleDepartmentClick}
              showDoctorCount={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {searchQuery ? t('common.noDepartmentsFound') : t('common.noDepartmentsAvailable')}
          </p>
        </div>
      )}
    </div>
  );
};

export default DepartmentListPage;