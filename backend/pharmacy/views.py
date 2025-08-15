from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext as _
from .models import Prescription, PrescriptionDetail, Medicine
from .services import PharmacyService
from .serializers import (
    PrescriptionSerializer, PrescriptionDetailSerializer, MedicineSerializer,
    NewMedicineRequestSerializer, UpdateMedicineRequestSerializer,
    CreatePrescriptionRequestSerializer, UpdatePrescriptionRequestSerializer,
    AddMedicineToPrescriptionRequestSerializer, UpdatePrescriptionDetailRequestSerializer,
    PrescriptionPdfDtoSerializer
)


class CustomPermission(IsAuthenticated):
    def has_permission(self, request, view):
        if request.method in ['GET']:
            return True
        allowed_roles = ['A', 'D']
        return request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role in allowed_roles


class PrescriptionViewSet(viewsets.ViewSet):
    permission_classes = [CustomPermission]

    def get_object(self, pk):
        return get_object_or_404(Prescription, pk=pk)

    def list(self, request):
        prescriptions = Prescription.objects.all()
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        prescription = self.get_object(pk)
        serializer = PrescriptionSerializer(prescription)
        return Response(serializer.data)

    def create(self, request):
        serializer = CreatePrescriptionRequestSerializer(data=request.data)
        if serializer.is_valid():
            prescription = PharmacyService().create_prescription(serializer.validated_data)
            return Response(PrescriptionSerializer(prescription).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        serializer = UpdatePrescriptionRequestSerializer(data=request.data)
        if serializer.is_valid():
            prescription = PharmacyService().update_prescription(pk, serializer.validated_data)
            return Response(PrescriptionSerializer(prescription).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        if not request.user.groups.filter(name='ADMIN').exists():
            return Response({"error": _("Chỉ admin mới có quyền xóa")}, status=status.HTTP_403_FORBIDDEN)
        PharmacyService().delete_prescription(pk)
        return Response({"message": _("Xóa thành công đơn thuốc")}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='detail')
    def add_medicine_to_prescription(self, request):
        serializer = AddMedicineToPrescriptionRequestSerializer(data=request.data)
        if serializer.is_valid():
            detail = PharmacyService().add_medicine_to_prescription(serializer.validated_data)
            return Response(PrescriptionDetailSerializer(detail).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='detail')
    def get_prescription_details(self, request, pk=None):
        details = PharmacyService().get_prescription_details(pk)
        serializer = PrescriptionDetailSerializer(details, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['put'], url_path='detail/(?P<detail_id>\d+)')
    def update_prescription_detail(self, request, pk=None, detail_id=None):
        serializer = UpdatePrescriptionDetailRequestSerializer(data=request.data)
        if serializer.is_valid():
            detail = PharmacyService().update_prescription_detail(detail_id, serializer.validated_data)
            return Response(PrescriptionDetailSerializer(detail).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='detail/(?P<detail_id>\d+)')
    def delete_prescription_detail(self, request, pk=None, detail_id=None):
        PharmacyService().delete_prescription_detail(detail_id)
        return Response({"message": _("Chi tiết đơn thuốc được xóa thành công")}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>\d+)')
    def get_prescriptions_by_patient_id(self, request, patient_id=None):
        prescriptions = PharmacyService().get_prescriptions_by_patient_id(patient_id)
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='appointment/(?P<appointment_id>\d+)')
    def get_prescriptions_by_appointment_id(self, request, appointment_id=None):
        prescriptions = PharmacyService().get_prescriptions_by_appointment_id(appointment_id)
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='pdf')
    def get_prescription_pdf(self, request, pk=None):
        pdf_buffer = PharmacyService().generate_prescription_pdf(pk)
        response = FileResponse(pdf_buffer, as_attachment=True, filename=f'prescription_{pk}.pdf')
        response['Content-Type'] = 'application/pdf'
        return response


class MedicineViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        medicines = PharmacyService().get_all_medicines()
        serializer = MedicineSerializer(medicines, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        medicine = PharmacyService().get_medicine_by_id(pk)
        serializer = MedicineSerializer(medicine)
        return Response(serializer.data)

    def create(self, request):
        serializer = NewMedicineRequestSerializer(data=request.data)
        if serializer.is_valid():
            medicine = PharmacyService().add_new_medicine(serializer.validated_data)
            return Response(MedicineSerializer(medicine).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        serializer = UpdateMedicineRequestSerializer(data=request.data)
        if serializer.is_valid():
            medicine = PharmacyService().update_medicine(pk, serializer.validated_data)
            return Response(MedicineSerializer(medicine).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        if not request.user.groups.filter(name='ADMIN').exists():
            return Response({"error": _("Chỉ admin mới có quyền xóa")}, status=status.HTTP_403_FORBIDDEN)
        PharmacyService().delete_medicine(pk)
        return Response({"message": _("Thuốc được xóa thành công")}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='search')
    def search_medicine(self, request):
        name = request.query_params.get('name', '')
        category = request.query_params.get('category', '')
        medicines = PharmacyService().search_medicine(name, category)
        serializer = MedicineSerializer(medicines, many=True)
        return Response(serializer.data)
