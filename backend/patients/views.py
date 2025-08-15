from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from .models import Patient, EmergencyContact
from .serializers import PatientSerializer, CreatePatientRequestSerializer, EmergencyContactSerializer
from .services import PatientService, EmergencyContactService

class PatientViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Patient, pk=pk)
    
    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def list(self, request):
            user_id = request.query_params.get('user_id')
            if user_id:
                try:
                    patient = Patient.objects.get(user_id=user_id)
                    serializer = PatientSerializer(patient)
                    return Response(serializer.data)
                except Patient.DoesNotExist:
                    return Response(
                        {"error": _("Không tìm thấy bệnh nhân với user_id này")},
                        status=status.HTTP_404_NOT_FOUND
                    )
            patients = Patient.objects.all()
            serializer = PatientSerializer(patients, many=True)
            return Response(serializer.data)

    def retrieve(self, request, pk=None):
        patient = self.get_object(pk)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    def create(self, request):
        serializer = CreatePatientRequestSerializer(data=request.data)
        if serializer.is_valid():
            patient = PatientService().create_patient(serializer.validated_data)
            return Response(PatientSerializer(patient).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            patient = self.get_object(pk)
            if patient.user != request.user:
                return Response({"error": _("Không có quyền cập nhật")}, status=status.HTTP_403_FORBIDDEN)

            serializer = PatientSerializer(patient, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def destroy(self, request, pk=None):
        patient = self.get_object(pk)
        patient.delete()
        return Response({"message": _("Bệnh nhân được xóa thành công")}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='me')
    def get_current_patient(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({"error": _("Không tìm thấy bệnh nhân")},
                            status=status.HTTP_404_NOT_FOUND)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='avatar')
    def upload_avatar(self, request, pk=None):
        try:
            file = request.FILES.get('avatar')
            if not file:
                return Response({"error": _("Thiếu file avatar")}, status=status.HTTP_400_BAD_REQUEST)
            patient = self.get_object(pk)
            if patient.user != request.user:
                return Response({"error": _("Không có quyền cập nhật")}, status=status.HTTP_403_FORBIDDEN)
            updated_patient = PatientService().upload_avatar(patient, file)
            return Response({"avatar": updated_patient.avatar}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'], url_path='avatar/delete')
    def delete_avatar(self, request, pk=None):
        try:
            patient = self.get_object(pk)
            if patient.user != request.user:
                return Response({"error": _("Không có quyền xóa")}, status=status.HTTP_403_FORBIDDEN)
            updated_patient = PatientService().delete_avatar(patient)
            return Response({"avatar": updated_patient.avatar or ""}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=True, methods=['get', 'post'], url_path='contacts')
    def contacts(self, request, pk=None):
        patient = self.get_object(pk)

        if request.method == 'GET':
            contacts = EmergencyContactService().get_all_emergency_contacts(patient.id)
            serializer = EmergencyContactSerializer(contacts, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = EmergencyContactSerializer(data=request.data)
            if serializer.is_valid():
                contact = EmergencyContactService().create_emergency_contact(
                    patient.id,
                    serializer.validated_data
                )
                return Response(EmergencyContactSerializer(contact).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class EmergencyContactViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request, patient_id=None):
        serializer = EmergencyContactSerializer(data=request.data)
        if serializer.is_valid():
            contact = EmergencyContactService().create_emergency_contact(patient_id, serializer.validated_data)
            return Response(EmergencyContactSerializer(contact).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response({"error": _("Bị thiếu patient_id")}, status=400)
        contacts = EmergencyContactService().get_all_emergency_contacts(patient_id)
        serializer = EmergencyContactSerializer(contacts, many=True)
        return Response(serializer.data)

    def retrieve(self, request, patient_id=None, pk=None):
        contact = EmergencyContactService().get_contact_by_id_and_patient_id(pk, patient_id)
        return Response(EmergencyContactSerializer(contact).data)

    def update(self, request, patient_id=None, pk=None):
        serializer = EmergencyContactSerializer(data=request.data)
        if serializer.is_valid():
            contact = EmergencyContactService().update_emergency_contact(pk, patient_id, serializer.validated_data)
            return Response(EmergencyContactSerializer(contact).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, patient_id=None, pk=None):
        EmergencyContactService().delete_emergency_contact(pk, patient_id)
        return Response({"message": _("Liên lạc được xóa thành công")}, status=status.HTTP_200_OK)
