import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronRight, Download } from 'lucide-react';

interface PrescriptionCardProps {
  prescription: {
    id: number;
    created_at: string;
    diagnosis: string;
    prescription_details?: Array<{ id: number }>;
  };
  onViewDetails: (id: number) => void;
  onDownloadPdf: (id: number) => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  onViewDetails,
  onDownloadPdf,
}) => {
  const { t } = useTranslation();

  // Format ngày tháng
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="border rounded-lg shadow p-4 bg-white flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold mb-2">
          {t('prescription.prescriptionId', { id: prescription.id })}
        </h2>
        <p className="text-sm text-gray-500 mb-1">
          {t('prescription.createdAt')}: {formatDate(prescription.created_at)}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          {t('prescription.diagnosis')}: {prescription.diagnosis || t('common.noDiagnosis')}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {t('prescription.detailsCount')}: {prescription.prescription_details?.length ?? 0}
        </p>
      </div>

      <div className="flex justify-between mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(prescription.id)}
        >
          {t('common.viewDetails')} <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onDownloadPdf(prescription.id)}
        >
          <Download className="mr-1 w-4 h-4" /> {t('common.download')}
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionCard;
