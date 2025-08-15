from datetime import datetime, date, timedelta
from django.core.paginator import Paginator
from django.core.files.uploadedfile import UploadedFile
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q # Import Q object for complex queries
from uuid import uuid4
from common.constants import PAGE_NO_DEFAULT, PAGE_SIZE_DEFAULT
from doctors.models import Schedule, ScheduleStatus
from .models import Appointment, AppointmentNote, ServiceOrder, Service
from .serializers import ServiceOrderSerializer, AppointmentNoteSerializer, ServiceSerializer 
from common.enums import AppointmentStatus

class AppointmentService:

  @staticmethod
  def get_appointments_by_doctor_id_optimized(
      doctor_id, shift=None, work_date=None, appointment_status=None, room_id=None, page_no=PAGE_NO_DEFAULT, page_size=PAGE_SIZE_DEFAULT
  ):
      qs = Appointment.objects.filter(doctor_id=doctor_id)

      if shift:
          qs = qs.filter(schedule__shift=shift)

      if work_date:
          qs = qs.filter(schedule__work_date=work_date)

      if appointment_status:
          qs = qs.filter(status=appointment_status)

      if room_id:
          qs = qs.filter(schedule__room_id=room_id)

      paginator = Paginator(qs.order_by("schedule__start_time"), page_size)
      page = paginator.get_page(page_no + 1)

      return {
          "results": list(page),
          "pageNo": page_no,
          "pageSize": page_size,
          "totalElements": paginator.count,
          "totalPages": paginator.num_pages,
          "last": not page.has_next()
      }

  @staticmethod
  def get_appointments_by_patient_id_optimized(patient_id, page_no, page_size, appointment_type='all', appointment_status=None, current_datetime=None):
        queryset = Appointment.objects.filter(patient_id=patient_id).select_related('doctor', 'schedule').prefetch_related('prescription_set')

        if current_datetime is None:
            current_datetime = datetime.now()
        
        today_date = current_datetime.date()
        current_time = current_datetime.time()

        if appointment_type == 'upcoming':
            queryset = queryset.filter(
                Q(schedule__work_date__gt=today_date) |
                Q(schedule__work_date=today_date, slot_start__gte=current_time)
            )
            if appointment_status:
                if isinstance(appointment_status, (list, tuple)):
                    queryset = queryset.filter(status__in=appointment_status)
                else:
                    queryset = queryset.filter(status=appointment_status)
            else:
                queryset = queryset.filter(status__in=[
                    AppointmentStatus.PENDING.value,
                    AppointmentStatus.CONFIRMED.value,
                    AppointmentStatus.IN_PROGRESS.value
                ])
            queryset = queryset.order_by('schedule__work_date', 'slot_start')
        elif appointment_type == 'past':
            queryset = queryset.filter(
                Q(schedule__work_date__lt=today_date) |
                Q(schedule__work_date=today_date, slot_start__lt=current_time)
            )
            if appointment_status and appointment_status != '':
                if isinstance(appointment_status, (list, tuple)):
                    queryset = queryset.filter(status__in=appointment_status)
                else:
                    queryset = queryset.filter(status=appointment_status)
            queryset = queryset.order_by('-schedule__work_date', '-slot_start')
        else:
            if appointment_status:
                if isinstance(appointment_status, (list, tuple)):
                    queryset = queryset.filter(status__in=appointment_status)
                else:
                    queryset = queryset.filter(status=appointment_status)
            queryset = queryset.order_by('-created_at')

        paginator = Paginator(queryset, page_size)
        page = paginator.get_page(page_no + 1)

        return {
          "results": list(page),
          "pageNo": page_no,
          "pageSize": page_size,
          "totalElements": paginator.count,
          "totalPages": paginator.num_pages,
          "last": not page.has_next()
      }

  @staticmethod
  def get_all_appointments(page_no=PAGE_NO_DEFAULT, page_size=PAGE_SIZE_DEFAULT):
      appointments = Appointment.objects.all().order_by('-created_at')
      paginator = Paginator(appointments, page_size)
      return paginator.get_page(page_no + 1)

  @staticmethod
  def get_appointments_by_doctor(doctor_id, page_no=None, page_size=None):
      qs = Appointment.objects.filter(doctor_id=doctor_id)
      if page_no and page_size:
          paginator = Paginator(qs, page_size)
          return paginator.get_page(page_no)
      return qs

  @staticmethod
  def get_appointments_by_patient(patient_id, page_no=None, page_size=None):
      qs = Appointment.objects.filter(patient_id=patient_id)
      if page_no and page_size:
          paginator = Paginator(qs, page_size)
          return paginator.get_page(page_no)
      return qs

  @staticmethod
  def get_appointments_by_doctor_and_date(doctor_id, date):
      return Appointment.objects.filter(doctor_id=doctor_id, schedule__work_date=date)

  @staticmethod
  def count_by_schedule_and_slot_start(schedule_id, slot_start):
      return Appointment.objects.filter(schedule_id=schedule_id, slot_start=slot_start).count()

  @staticmethod
  def get_appointments_by_schedule_ordered(schedule_id):
      return Appointment.objects.filter(schedule_id=schedule_id).order_by("slot_start")

  @staticmethod
  def get_appointments_by_doctor_and_schedules(doctor_id, schedule_ids, page_no=1, page_size=PAGE_SIZE_DEFAULT):
      qs = Appointment.objects.filter(doctor_id=doctor_id, schedule_id__in=schedule_ids)
      paginator = Paginator(qs, page_size)
      return paginator.get_page(page_no)

  @staticmethod
  def get_available_time_slots(schedule_id): 
      schedule = get_object_or_404(Schedule, id=schedule_id)
      schedule_start_dt = datetime.combine(schedule.work_date, schedule.start_time)
      schedule_end_dt = datetime.combine(schedule.work_date, schedule.end_time)
      total_duration_minutes = (schedule_end_dt - schedule_start_dt).total_seconds() / 60
      max_appointments_by_time = int(total_duration_minutes / schedule.default_appointment_duration_minutes)
      effective_max_patients = min(schedule.max_patients, max_appointments_by_time)

      booked_appointments = Appointment.objects.filter(
          schedule_id=schedule_id,
          status__in=[AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value, AppointmentStatus.IN_PROGRESS.value]
      ).values_list('slot_start', flat=True)

      booked_slots_set = set(booked_appointments)

      available_slots = []
      current_slot_start_dt = schedule_start_dt

      while current_slot_start_dt + timedelta(minutes=schedule.default_appointment_duration_minutes) <= schedule_end_dt:
          slot_start_time = current_slot_start_dt.time()
          slot_end_time = (current_slot_start_dt + timedelta(minutes=schedule.default_appointment_duration_minutes)).time()

          is_booked = slot_start_time in booked_slots_set

          available_slots.append({
              "slot_start": slot_start_time.strftime("%H:%M:%S"),
              "slot_end": slot_end_time.strftime("%H:%M:%S"),
              "available": not is_booked
          })

          current_slot_start_dt += timedelta(minutes=schedule.default_appointment_duration_minutes)

      return available_slots

  @staticmethod
  def create_appointment(data):
      with transaction.atomic():
          schedule = data['schedule']

          if schedule.current_patients >= schedule.max_patients:
              raise ValueError("Lịch khám đã đầy, không thể đặt thêm cuộc hẹn.")

          existing_appointments_in_slot = Appointment.objects.filter(
              schedule=schedule,
              slot_start=data['slot_start'],
              status__in=[AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value, AppointmentStatus.IN_PROGRESS.value]
          ).count()

          if existing_appointments_in_slot > 0:
              raise ValueError("Slot thời gian này đã có người đặt.")

          appointment = Appointment.objects.create(
              doctor=data['doctor'],
              patient=data['patient'],
              schedule=schedule,
              symptoms=data['symptoms'],
              slot_start=data['slot_start'],
              slot_end=data['slot_end'],
              status=AppointmentStatus.PENDING.value
          )

          schedule.current_patients += 1
          if schedule.current_patients >= schedule.max_patients:
              schedule.status = ScheduleStatus.FULL.value
          schedule.save()

          return appointment

  @staticmethod
  def update_appointment(appointment_id, data):
      appointment = get_object_or_404(Appointment, id=appointment_id)

      # Save old status for transition logic
      old_status = appointment.status
      new_status = data.get('status', old_status)

      # Update all fields provided in data
      for field, value in data.items():
          if hasattr(appointment, field):
              setattr(appointment, field, value)

      # Custom logic for status transitions
      if old_status != new_status:
          schedule = appointment.schedule
          # If moving from active to completed/cancelled/no_show, decrement current_patients
          if old_status in [AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value, AppointmentStatus.IN_PROGRESS.value] and \
                  new_status in [AppointmentStatus.CANCELLED.value, AppointmentStatus.NO_SHOW.value, AppointmentStatus.COMPLETED.value]:
              if schedule.current_patients > 0:
                  schedule.current_patients -= 1
              if schedule.current_patients < schedule.max_patients:
                  schedule.status = ScheduleStatus.AVAILABLE.value
              schedule.save()
          # If moving from cancelled/no_show to active, increment current_patients
          elif old_status in [AppointmentStatus.CANCELLED.value, AppointmentStatus.NO_SHOW.value] and \
                  new_status in [AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value, AppointmentStatus.IN_PROGRESS.value]:
              if schedule.current_patients < schedule.max_patients:
                  schedule.current_patients += 1
              if schedule.current_patients >= schedule.max_patients:
                  schedule.status = ScheduleStatus.FULL.value
              schedule.save()

      appointment.save()
      return appointment

  @staticmethod
  def cancel_appointment(appointment_id):
      appointment = get_object_or_404(Appointment, id=appointment_id)

      if appointment.status in [AppointmentStatus.CANCELLED.value, AppointmentStatus.COMPLETED.value, AppointmentStatus.NO_SHOW.value]:
          raise ValueError("Cuộc hẹn này đã được hủy hoặc hoàn thành.")

      with transaction.atomic():
          appointment.status = AppointmentStatus.CANCELLED.value
          appointment.save()

          schedule = appointment.schedule
          if schedule.current_patients > 0:
              schedule.current_patients -= 1
          if schedule.current_patients < schedule.max_patients:
              schedule.status = ScheduleStatus.AVAILABLE.value
          schedule.save()

          return appointment

          return appointment

class AppointmentNoteService:

  @staticmethod
  def get_notes_by_appointment_id(appointment_id):
      return AppointmentNote.objects.filter(appointment_id=appointment_id)

  @staticmethod
  def create_note(appointment_id, data):
      data['appointment'] = appointment_id
      serializer = AppointmentNoteSerializer(data=data)
      serializer.is_valid(raise_exception=True)
      return serializer.save()

  @staticmethod
  def update_note(note_id, data):
      note = get_object_or_404(AppointmentNote, id=note_id)
      serializer = AppointmentNoteSerializer(note, data=data, partial=True)
      serializer.is_valid(raise_exception=True)
      return serializer.save()

  @staticmethod
  def delete_note(note_id):
      note = get_object_or_404(AppointmentNote, id=note_id)
      note.delete()


class ServiceOrderService:

  @staticmethod
  def get_all_orders():
      return ServiceOrder.objects.all().order_by('-created_at')

  @staticmethod
  def get_order_by_id(order_id):
      return get_object_or_404(ServiceOrder, id=order_id)

  @staticmethod 
  def create_order(data):
      if 'order_time' not in data or not data.get('order_time'):
          from django.utils import timezone
          data['order_time'] = timezone.now()
      return ServiceOrder.objects.create(**data)

  @staticmethod
  def update_order(order_id, data):
      order = get_object_or_404(ServiceOrder, id=order_id)
      serializer = ServiceOrderSerializer(order, data=data, partial=True)
      serializer.is_valid(raise_exception=True)
      return serializer.save()

  @staticmethod
  def delete_order(order_id):
      order = get_object_or_404(ServiceOrder, id=order_id)
      order.delete()

  @staticmethod
  def get_orders_by_appointment_id(appointment_id):
      return ServiceOrder.objects.filter(appointment_id=appointment_id)

  @staticmethod
  def get_orders_by_room_and_status_and_date(room_id, status=None, order_date=None):
      filters = {
          "appointment__schedule__room_id": room_id,
      }
      if status:
          filters["status"] = status
      if order_date:
          filters["order_time__date"] = order_date

      return ServiceOrder.objects.filter(**filters).order_by("-order_time", "-created_at")

  @staticmethod
  def upload_test_result(order_id, file: UploadedFile):
      order = get_object_or_404(ServiceOrder, id=order_id)
            # Persist file using default storage and record URL
      unique_name = f"service_results/{uuid4()}_{file.name}"
      stored_path = default_storage.save(unique_name, file)
      try:
          file_url = default_storage.url(stored_path)
      except Exception:
          file_url = stored_path
      from django.conf import settings
      if settings.DEBUG and not file_url.startswith('http'):
          if not file_url.startswith('/'):
              file_url = f"/{file_url}"
          if settings.MEDIA_URL and not file_url.startswith(settings.MEDIA_URL):
              media_url = settings.MEDIA_URL
              if not media_url.startswith('/'):
                  media_url = '/' + media_url
              if not media_url.endswith('/'):
                  media_url += '/'
              cleaned_path = file_url.lstrip('/')
              file_url = media_url + cleaned_path.split('media/', 1)[-1] if 'media/' in cleaned_path else media_url + cleaned_path
      order.result_file_url = file_url
      order.result_file_public_id = stored_path
      order.result = file_url
      if not order.result_time:
          order.result_time = datetime.now()
      order.save()
      return order


class ServicesService:

  @staticmethod
  def get_all_services():
      return Service.objects.all().order_by('-created_at')

  @staticmethod
  def get_service_by_id(service_id):
      return get_object_or_404(Service, id=service_id)

  @staticmethod
  def create_service(data):
      serializer = ServiceSerializer(data=data)
      serializer.is_valid(raise_exception=True)
      return serializer.save()

  @staticmethod
  def update_service(service_id, data):
      service = get_object_or_404(Service, id=service_id)
      serializer = ServiceSerializer(service, data=data, partial=True)
      serializer.is_valid(raise_exception=True)
      return serializer.save()

  @staticmethod
  def delete_service(service_id):
      service = get_object_or_404(Service, id=service_id)
      service.delete()
