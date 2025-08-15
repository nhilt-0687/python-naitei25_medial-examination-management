from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from common.constants import PAGE_NO_DEFAULT, PAGE_SIZE_DEFAULT
from django.utils.translation import gettext as _
from datetime import date, datetime, timedelta
import logging

from .models import (
  Appointment,
  AppointmentNote,
  ServiceOrder,
  Service,
  Schedule 
)
from .serializers import (
  AppointmentSerializer,
  AppointmentCreateSerializer,
  AppointmentUpdateSerializer,
  AppointmentDoctorViewSerializer,
  AppointmentPatientViewSerializer,
  AvailableSlotSerializer, 
  ScheduleTimeSerializer, 
  CustomPageNumberPagination,
  AppointmentNoteSerializer,
  ServiceOrderSerializer,
  ServiceSerializer,
  AppointmentFilterSerializer,
  AppointmentPatientFilterSerializer,
  CancelAppointmentRequestSerializer 
)
from .services import (
  AppointmentService,
  ServiceOrderService,
  ServicesService
)
from common.enums import AppointmentStatus

logger = logging.getLogger(__name__) 

class AppointmentViewSet(viewsets.ModelViewSet):
  queryset = Appointment.objects.all().order_by("-created_at")
  serializer_class = AppointmentSerializer
  pagination_class = CustomPageNumberPagination
  permission_classes = [IsAuthenticated]

  def get_serializer_class(self):
      if self.action == 'create':
          return AppointmentCreateSerializer
      elif self.action == 'update':
          return AppointmentUpdateSerializer
      elif self.action == 'retrieve':
          return AppointmentSerializer
      elif self.action == 'available_slots':
          return ScheduleTimeSerializer
      elif self.action == 'cancel_appointment':
          return CancelAppointmentRequestSerializer
      return AppointmentSerializer

  @action(detail=False, methods=['get'], url_path='doctor/(?P<doctor_id>[^/.]+)')
  def get_by_doctor(self, request, doctor_id):
      filter_serializer = AppointmentFilterSerializer(data=request.query_params)
      filter_serializer.is_valid(raise_exception=True)
      validated = filter_serializer.validated_data

      result_page = AppointmentService.get_appointments_by_doctor_id_optimized(
          doctor_id=doctor_id,
          shift=validated.get('shift'),
          work_date=validated.get('work_date'),
          appointment_status=validated.get('appointment_status'),
          room_id=validated.get('room_id'),
          page_no=validated['page_no'],
          page_size=validated['page_size']
      )

      serializer = AppointmentDoctorViewSerializer(result_page['results'], many=True)
      return Response({
          "content": serializer.data,
          "pageNo": result_page['pageNo'],
          "pageSize": result_page['pageSize'],
          "totalElements": result_page['totalElements'],
          "totalPages": result_page['totalPages'],
          "last": result_page['last'],
      })

  @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>[^/.]+)')
  def get_by_patient(self, request, patient_id):
      query_serializer = AppointmentPatientFilterSerializer(data=request.query_params)
      query_serializer.is_valid(raise_exception=True)
      validated = query_serializer.validated_data

      appointment_status = validated.get('status')
      
      result_page = AppointmentService.get_appointments_by_patient_id_optimized(
          patient_id,
          validated['page_no'],
          validated['page_size'],
          appointment_type='all',
          appointment_status=appointment_status
      )
      response_serializer = AppointmentPatientViewSerializer(result_page['results'], many=True)
      return Response({
          "content": response_serializer.data,
          "pageNo": result_page['pageNo'],
          "pageSize": result_page['pageSize'],
          "totalElements": result_page['totalElements'],
          "totalPages": result_page['totalPages'],
          "last": result_page['last']
      })

  @action(detail=False, methods=['get'], url_path='my')
  def my_appointments(self, request):
      patient_id = request.user.patient.id

      query_serializer = AppointmentPatientFilterSerializer(data=request.query_params)
      query_serializer.is_valid(raise_exception=True)
      validated = query_serializer.validated_data

      appointment_status = validated.get('status')
      
      result_page = AppointmentService.get_appointments_by_patient_id_optimized(
          patient_id,
          validated['page_no'],
          validated['page_size'],
          appointment_type='past',
          appointment_status=appointment_status
      )
      response_serializer = AppointmentPatientViewSerializer(result_page['results'], many=True)
      return Response({
          "content": response_serializer.data,
          "pageNo": result_page['pageNo'],
          "pageSize": result_page['pageSize'],
          "totalElements": result_page['totalElements'],
          "totalPages": result_page['totalPages'],
          "last": result_page['last']
      })

  @action(detail=False, methods=['get'], url_path='upcoming')
  def upcoming_appointments(self, request):
      patient_id = request.user.patient.id

      queryset_data = AppointmentService.get_appointments_by_patient_id_optimized(
          patient_id,
          page_no=PAGE_NO_DEFAULT,
          page_size=100,
          appointment_type='upcoming',
          appointment_status=[AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value, AppointmentStatus.IN_PROGRESS.value]
      )['results']

      serializer = AppointmentPatientViewSerializer(queryset_data, many=True)
      return Response({"results": serializer.data})

  @action(detail=False, methods=['post'], url_path='schedule/available-slots')
  def available_slots(self, request):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      schedule_id = serializer.validated_data.get('schedule_id')
      if schedule_id is None:
          return Response({"message": _("Thiếu schedule_id trong yêu cầu.")}, status=status.HTTP_400_BAD_REQUEST)

      result = AppointmentService.get_available_time_slots(schedule_id)
      return Response(result)

  @action(detail=False, methods=['get'], url_path='schedule/(?P<schedule_id>[^/.]+)')
  def get_by_schedule(self, request, schedule_id):
      result = AppointmentService.get_appointments_by_schedule_ordered(schedule_id)
      serializer = AppointmentSerializer(result, many=True)
      return Response(serializer.data)

  @action(detail=True, methods=['post'], url_path='cancel')
  def cancel_appointment(self, request, pk=None):
      try:
          appointment = AppointmentService.cancel_appointment(pk)
          serializer = AppointmentSerializer(appointment) 
          return Response(serializer.data, status=status.HTTP_200_OK)
      except ValueError as e: 
          return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
      except Exception as e: 
          logger.exception("Error cancelling appointment:")
          return Response({"message": _("Đã xảy ra lỗi khi hủy cuộc hẹn.")}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      try:
          appointment = AppointmentService.create_appointment(serializer.validated_data)
          return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
      except ValueError as e: 
          return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
      except Exception as e: 
          logger.exception("Error creating appointment:")
          return Response({"message": _("Đã xảy ra lỗi khi tạo cuộc hẹn. Chi tiết: ") + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  def update(self, request, *args, **kwargs):
      partial = kwargs.pop('partial', False)
      instance = self.get_object()
      serializer = self.get_serializer(instance, data=request.data, partial=partial)
      serializer.is_valid(raise_exception=True)
      try:
          updated_appointment = AppointmentService.update_appointment(instance.id, serializer.validated_data)
          return Response(AppointmentSerializer(updated_appointment).data)
      except ValueError as e:
          return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
      except Exception as e:
          logger.exception("Error updating appointment:")
          return Response({"message": _("Đã xảy ra lỗi khi cập nhật cuộc hẹn.")}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  @action(detail=False, methods=['get'], url_path='upcoming')
  def upcoming_appointments(self, request):
      patient_id = request.user.patient.id

      queryset_data = AppointmentService.get_appointments_by_patient_id_optimized(
          patient_id,
          page_no=PAGE_NO_DEFAULT,
          page_size=100,
          appointment_type='upcoming',
          appointment_status=[AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value, AppointmentStatus.IN_PROGRESS.value]
      )['results']

      serializer = AppointmentPatientViewSerializer(queryset_data, many=True)
      return Response({"results": serializer.data})

  @action(detail=False, methods=['post'], url_path='schedule/available-slots')
  def available_slots(self, request):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      schedule_id = serializer.validated_data.get('schedule_id')
      if schedule_id is None:
          return Response({"message": _("Thiếu schedule_id trong yêu cầu.")}, status=status.HTTP_400_BAD_REQUEST)

      result = AppointmentService.get_available_time_slots(schedule_id)
      return Response(result)

  @action(detail=False, methods=['get'], url_path='schedule/(?P<schedule_id>[^/.]+)')
  def get_by_schedule(self, request, schedule_id):
      result = AppointmentService.get_appointments_by_schedule_ordered(schedule_id)
      serializer = AppointmentSerializer(result, many=True)
      return Response(serializer.data)

  @action(detail=True, methods=['post'], url_path='cancel')
  def cancel_appointment(self, request, pk=None):
      try:
          appointment = AppointmentService.cancel_appointment(pk)
          serializer = AppointmentSerializer(appointment) 
          return Response(serializer.data, status=status.HTTP_200_OK)
      except ValueError as e: 
          return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
      except Exception as e: 
          logger.exception("Error cancelling appointment:")
          return Response({"message": _("Đã xảy ra lỗi khi hủy cuộc hẹn.")}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      try:
          appointment = AppointmentService.create_appointment(serializer.validated_data)
          return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
      except ValueError as e: 
          return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
      except Exception as e: 
          logger.exception("Error creating appointment:")
          return Response({"message": _("Đã xảy ra lỗi khi tạo cuộc hẹn. Chi tiết: ") + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  def update(self, request, *args, **kwargs):
      partial = kwargs.pop('partial', False)
      instance = self.get_object()
      serializer = self.get_serializer(instance, data=request.data, partial=partial)
      serializer.is_valid(raise_exception=True)
      try:
          updated_appointment = AppointmentService.update_appointment(instance.id, serializer.validated_data)
          return Response(AppointmentSerializer(updated_appointment).data)
      except ValueError as e:
          return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
      except Exception as e:
          logger.exception("Error updating appointment:")
          return Response({"message": _("Đã xảy ra lỗi khi cập nhật cuộc hẹn.")}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AppointmentNoteViewSet(viewsets.ModelViewSet):
  queryset = AppointmentNote.objects.all()
  serializer_class = AppointmentNoteSerializer

  @action(detail=False, methods=['get'], url_path='appointment/(?P<appointment_id>[^/.]+)/notes')
  def list_by_appointment(self, request, appointment_id=None):
      notes = AppointmentNote.objects.filter(appointment_id=appointment_id)
      serializer = self.get_serializer(notes, many=True)
      return Response(serializer.data)

  @action(detail=False, methods=['post'], url_path='appointment/(?P<appointment_id>[^/.]+)/notes/create')
  def create_note(self, request, appointment_id=None):
      data = request.data.copy()
      data['appointment'] = appointment_id
      serializer = self.get_serializer(data=data)
      serializer.is_valid(raise_exception=True)
      serializer.save(appointment_id=appointment_id)
      return Response(serializer.data, status=status.HTTP_201_CREATED)

class ServiceOrderViewSet(viewsets.ViewSet):
    parser_classes = [MultiPartParser, JSONParser]

    def list(self, request):
        orders = ServiceOrderService.get_all_orders()
        serializer = ServiceOrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        order = ServiceOrderService.get_order_by_id(pk)
        serializer = ServiceOrderSerializer(order, context={'request': request})
        return Response(serializer.data)

    def create(self, request):
        serializer = ServiceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(ServiceOrderSerializer(order, context={'request': request}).data)

    def update(self, request, pk=None):
        order = ServiceOrderService.get_order_by_id(pk)
        serializer = ServiceOrderSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_order = serializer.save()
        return Response(ServiceOrderSerializer(updated_order, context={'request': request}).data)

    def destroy(self, request, pk=None):
        ServiceOrderService.delete_order(pk)
        return Response({"message": _("Đặt dịch vụ đã xóa thành công")})

    @action(detail=False, methods=['get'], url_path='appointments/(?P<appointment_id>[^/.]+)/orders')
    def by_appointment(self, request, appointment_id=None):
        orders = ServiceOrderService.get_orders_by_appointment_id(appointment_id)
        serializer = ServiceOrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='rooms/(?P<room_id>[^/.]+)/orders')
    def by_room(self, request, room_id=None):
        status_param = request.query_params.get('status')
        order_date_str = request.query_params.get('orderDate')

        order_date = None
        if order_date_str:
            order_date = parse_date(order_date_str)
            if not order_date:
                return Response({"error": _("Ngày không hợp lệ. Định dạng đúng: YYYY-MM-DD")}, status=400)

        orders = ServiceOrderService.get_orders_by_room_and_status_and_date(
            room_id=room_id,
            status=status_param,
            order_date=order_date
        )
        serializer = ServiceOrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='result')
    def upload_result(self, request, pk=None):
        file = request.FILES.get('file')
        if not file:
            return Response({"message": _("Thiếu tệp kết quả.")}, status=status.HTTP_400_BAD_REQUEST)

        updated_order = ServiceOrderService.upload_test_result(pk, file)
        return Response({
            "message": _("Tải lên kết quả thành công."),
            "data": ServiceOrderSerializer(updated_order, context={'request': request}).data
        })

class ServiceViewSet(viewsets.ViewSet):
  def list(self, request):
      services = ServicesService.get_all_services()
      serializer = ServiceSerializer(services, many=True)
      return Response(serializer.data)

  def retrieve(self, request, pk=None):
      service = ServicesService.get_service_by_id(pk)
      serializer = ServiceSerializer(service)
      return Response(serializer.data)

  def create(self, request):
      serializer = ServiceSerializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      created = serializer.save()
      return Response(ServiceSerializer(created).data, status=status.HTTP_201_CREATED)

  def update(self, request, pk=None):
      serializer = ServiceSerializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      updated = ServicesService.update_service(pk, serializer.validated_data)
      return Response(ServiceSerializer(updated).data)

  def destroy(self, request, pk=None):
      ServicesService.delete_service(pk)
      return Response({"message": _("Dịch vụ đã xóa thành công")})
