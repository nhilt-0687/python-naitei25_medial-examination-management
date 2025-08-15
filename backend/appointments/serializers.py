from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from pharmacy.models import Prescription
from .models import Appointment, AppointmentNote, ServiceOrder, Service
from doctors.models import Schedule, Doctor, Department, ExaminationRoom
from patients.serializers import PatientSerializer
from common.enums import ServiceType, Gender, AppointmentStatus
from common.constants import DECIMAL_MAX_DIGITS, DECIMAL_DECIMAL_PLACES, PAGE_NO_DEFAULT, PAGE_SIZE_DEFAULT, MIN_VALUE
from django.utils.translation import gettext_lazy as _
from datetime import date, datetime, timedelta

class DoctorSerializer(serializers.ModelSerializer):
    fullName = serializers.SerializerMethodField()
    academicDegree = serializers.CharField(source='academic_degree', read_only=True)
    specialization = serializers.CharField(read_only=True)
    price = serializers.DecimalField(
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_DECIMAL_PLACES,
        read_only=True,
        allow_null=True
    )
    # avatar_url = serializers.CharField(source='avatar', read_only=True, allow_null=True)

    class Meta:
        model = Doctor
        fields = ['id', 'fullName', 'academicDegree', 'specialization', 'price']

    def get_fullName(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class ServiceSerializer(serializers.ModelSerializer):
    service_id = serializers.IntegerField(source='id', read_only=True)
    service_name = serializers.CharField(required=True)
    service_type = serializers.ChoiceField(
        choices=[(item.value, item.name) for item in ServiceType],
        required=True
    )
    price = serializers.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES, required=True)
    created_at = serializers.CharField(required=False, allow_null=True)
    service_orders = serializers.SerializerMethodField()

    def get_service_orders(self, obj):
        return []

    def create(self, validated_data):
        return Service.objects.create(**validated_data)

    class Meta:
        model = Service
        fields = ['service_id', 'service_name', 'service_type', 'price', 'created_at', 'service_orders']


class ServiceOrderSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(source='id', required=False)
    appointment_id = serializers.IntegerField(
        required=True,
        error_messages={
            'required': _('Mã lịch hẹn không được để trống')
        }
    )
    room_id = serializers.IntegerField(
        required=True,
        error_messages={
            'required': _('Mã phòng không được để trống')
        }
    )
    service_id = serializers.IntegerField(
        required=True,
        error_messages={
            'required': _('Mã dịch vụ không được để trống')
        }
    )
    service_name = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    order_status = serializers.CharField(source='status', required=False)
    result = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    number = serializers.IntegerField(required=False)
    order_time = serializers.DateTimeField(required=False)
    result_time = serializers.DateTimeField(required=False)
    created_at = serializers.CharField(required=False)
    result_file_url = serializers.CharField(read_only=True)
    result_file_public_id = serializers.CharField(read_only=True)

    def _get_service_attr(self, obj, attr):
        # Helper to fetch attribute from related service, fallback to DB lookup
        try:
            return getattr(obj.service, attr)
        except AttributeError:
            from .models import Service
            try:
                return getattr(Service.objects.get(id=obj.service_id), attr)
            except Service.DoesNotExist:
                return None

    def get_service_name(self, obj):
        return self._get_service_attr(obj, 'service_name')

    def get_price(self, obj):
        return self._get_service_attr(obj, 'price')

    def create(self, validated_data):
        return ServiceOrder.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if 'appointment_id' in validated_data:
            instance.appointment_id = validated_data['appointment_id']
        if 'room_id' in validated_data:
            instance.room_id = validated_data['room_id']
        if 'service_id' in validated_data:
            instance.service_id = validated_data['service_id']
        if 'status' in validated_data:
            instance.status = validated_data['status']
        if 'result' in validated_data:
            instance.result = validated_data['result']
        if 'number' in validated_data:
            instance.number = validated_data['number']
        if 'order_time' in validated_data:
            instance.order_time = validated_data['order_time']
        if 'result_time' in validated_data:
            instance.result_time = validated_data['result_time']
        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request') if hasattr(self, 'context') else None
        for key in ['result', 'result_file_url']:
            val = data.get(key)
            if val and isinstance(val, str) and val.startswith('/') and request:
                data[key] = request.build_absolute_uri(val)
        return data

    def update(self, instance, validated_data):
        if 'appointment_id' in validated_data:
            instance.appointment_id = validated_data['appointment_id']
        if 'room_id' in validated_data:
            instance.room_id = validated_data['room_id']
        if 'service_id' in validated_data:
            instance.service_id = validated_data['service_id']
        if 'status' in validated_data:
            instance.status = validated_data['status']
        if 'result' in validated_data:
            instance.result = validated_data['result']
        if 'number' in validated_data:
            instance.number = validated_data['number']
        if 'order_time' in validated_data:
            instance.order_time = validated_data['order_time']
        if 'result_time' in validated_data:
            instance.result_time = validated_data['result_time']
        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request') if hasattr(self, 'context') else None
        for key in ['result', 'result_file_url']:
            val = data.get(key)
            if val and isinstance(val, str) and val.startswith('/') and request:
                data[key] = request.build_absolute_uri(val)
        return data


class ScheduleSerializer(serializers.ModelSerializer):
    scheduleId = serializers.IntegerField(source='id', read_only=True)
    doctorId = serializers.IntegerField(source='doctor.id', read_only=True)
    workDate = serializers.DateField(source='work_date', read_only=True)
    startTime = serializers.TimeField(source='start_time', read_only=True)
    endTime = serializers.TimeField(source='end_time', read_only=True)
    roomId = serializers.IntegerField(source='room.id', read_only=True)
    doctorName = serializers.SerializerMethodField()
    departmentName = serializers.SerializerMethodField()
    maxPatients = serializers.IntegerField(source='max_patients', read_only=True)
    currentPatients = serializers.IntegerField(source='current_patients', read_only=True)
    status = serializers.CharField(read_only=True)
    defaultAppointmentDurationMinutes = serializers.IntegerField(source='default_appointment_duration_minutes', read_only=True)
    location = serializers.CharField(source='room.location', read_only=True)
    room_note = serializers.CharField(source='room.room_note', read_only=True)
    floor = serializers.IntegerField(source='room.floor', read_only=True)
    building = serializers.CharField(source='room.building', read_only=True)

    class Meta:
        model = Schedule
        fields = [
            'scheduleId',
            'id',
            'doctorId',
            'doctor',
            'doctorName',
            'workDate',
            'work_date',
            'startTime',
            'start_time',
            'endTime',
            'end_time',
            'shift',
            'roomId',
            'room',
            'departmentName',
            'maxPatients',
            'currentPatients',
            'status',
            'defaultAppointmentDurationMinutes',
            'location',
            'room_note',
            'floor',
            'building',
        ]

    def get_doctorName(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"

    def get_departmentName(self, obj):
        return obj.room.department.department_name


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'id',
            'slot_start', 'slot_end', 'schedule',
            'symptoms',
            'doctor', 'patient'
        ]
        read_only_fields = ['id']


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor', 'patient', 'schedule', 'symptoms',
            'status', 'slot_start', 'slot_end'
        ]


class AppointmentNoteSerializer(serializers.ModelSerializer):
    appointmentId = serializers.IntegerField(source='appointment.id', read_only=True)
    content = serializers.CharField(source='note_text')
    note_type = serializers.CharField()

    class Meta:
        model = AppointmentNote
        fields = ['id', 'appointmentId', 'note_type', 'content', 'created_at']


class AvailableSlotSerializer(serializers.Serializer):
    slot_start = serializers.TimeField(required=False)
    slot_end = serializers.TimeField(required=False)
    available = serializers.BooleanField()
    scheduleId = serializers.IntegerField(required=True)


class ScheduleTimeSerializer(serializers.Serializer):
    schedule_id = serializers.IntegerField(required=True)
    start_time = serializers.TimeField(required=False)
    end_time = serializers.TimeField(required=False)


class AppointmentSerializer(serializers.ModelSerializer):
    appointmentId = serializers.IntegerField(source='id', read_only=True)
    doctorId = serializers.IntegerField(source='doctor.id', read_only=True)
    patientId = serializers.IntegerField(source='patient.id', read_only=True)
    appointmentStatus = serializers.CharField(source='status', read_only=True)
    slotStart = serializers.TimeField(source='slot_start', read_only=True)
    slotEnd = serializers.TimeField(source='slot_end', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    patientInfo = PatientSerializer(source='patient', read_only=True)
    doctorInfo = DoctorSerializer(source='doctor', read_only=True)
    schedule = ScheduleSerializer()
    appointment_notes = AppointmentNoteSerializer(many=True, read_only=True, source='appointmentnote_set')
    service_orders = ServiceOrderSerializer(many=True, read_only=True, source='serviceorder_set')

    class Meta:
        model = Appointment
        fields = [
            'appointmentId',
            'doctorId',
            'patientId',
            'schedule',
            'symptoms',
            'slotStart',
            'slotEnd',
            'appointmentStatus',
            'createdAt',
            'patientInfo',
            'doctorInfo',
            'appointment_notes',
            'service_orders',
            'id', 'doctor', 'patient', 'slot_start', 'slot_end', 'status', 'created_at',
        ]


class AppointmentDetailSerializer(serializers.ModelSerializer):
    patientInfo = PatientSerializer(source='patient', read_only=True)
    doctorInfo = DoctorSerializer(source='doctor', read_only=True)
    schedule = ScheduleSerializer()
    appointmentNotes = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor', 'schedule', 'symptoms',
            'slot_start', 'slot_end', 'status', 'created_at',
            'patientInfo', 'doctorInfo', 'appointmentNotes',
        ]

    def get_appointmentNotes(self, obj):
        notes = AppointmentNote.objects.filter(appointment=obj)
        return AppointmentNoteSerializer(notes, many=True).data


class AppointmentDoctorViewSerializer(serializers.ModelSerializer):
    patientInfo = PatientSerializer(source='patient', read_only=True)
    schedule = ScheduleSerializer()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_id', 'patientInfo', 'symptoms',
            'schedule', 'status', 'created_at'
        ]


class AppointmentPatientViewSerializer(serializers.ModelSerializer):
    doctorInfo = DoctorSerializer(source='doctor', read_only=True)
    schedule = ScheduleSerializer()
    doctorId = serializers.IntegerField(source='doctor.id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    prescriptionId = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'doctorId', 'doctorInfo', 'schedule',
            'symptoms', 'slot_start', 'slot_end',
            'status', 'createdAt', 'prescriptionId'
        ]

    def get_prescriptionId(self, obj):
        prescription = obj.prescription_set.first()
        return prescription.id if prescription else None


class CustomPageNumberPagination(PageNumberPagination):
    page_size_query_param = 'pageSize'
    page_query_param = 'pageNo'

    def get_paginated_response(self, data):
        return Response({
            "content": data,
            "pageNo": self.page.number,
            "pageSize": self.page.paginator.per_page,
            "totalElements": self.page.paginator.count,
            "totalPages": self.page.paginator.num_pages,
            "last": not self.page.has_next()
        })


class AppointmentFilterSerializer(serializers.Serializer):
    shift = serializers.CharField(required=False, allow_blank=True)
    workDate = serializers.DateField(required=False, source='work_date', input_formats=['%Y-%m-%d'])
    appointmentStatus = serializers.CharField(required=False, source='appointment_status', allow_blank=True)
    roomId = serializers.IntegerField(required=False, source='room_id')
    pageNo = serializers.IntegerField(default=PAGE_NO_DEFAULT, min_value=MIN_VALUE, source='page_no')
    pageSize = serializers.IntegerField(default=PAGE_SIZE_DEFAULT, min_value=MIN_VALUE, source='page_size')



class AppointmentPatientFilterSerializer(serializers.Serializer):
    pageNo = serializers.IntegerField(default=PAGE_NO_DEFAULT, min_value=MIN_VALUE, source='page_no')
    pageSize = serializers.IntegerField(default=PAGE_SIZE_DEFAULT, min_value=MIN_VALUE, source='page_size')
    status = serializers.CharField(required=False, allow_blank=True)


class CancelAppointmentRequestSerializer(serializers.Serializer):
    appointment_id = serializers.IntegerField(required=True)
