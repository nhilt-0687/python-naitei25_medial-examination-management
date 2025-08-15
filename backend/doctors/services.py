import cloudinary.uploader
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.http import Http404
from rest_framework.exceptions import ValidationError # Added for ScheduleService
from .models import Doctor, Department, ExaminationRoom, Schedule, ScheduleStatus
from appointments.models import Appointment
from patients.models import Patient
from users.models import User
from users.services import UserService
from common.enums import UserRole, AppointmentStatus
from common.constants import SCHEDULE_DEFAULTS
from django.utils.translation import gettext_lazy as _


class DoctorService:
    def get_all_doctors(self):
        return Doctor.objects.all().order_by('last_name', 'first_name')

    def get_doctor_by_id(self, doctor_id):
        return get_object_or_404(Doctor, pk=doctor_id)

    def create_doctor(self, data):
        with transaction.atomic():
            user_data = {
                'email': data.get('email'),
                'phone': data.get('phone'),
                'password': data['password'],
                'role': UserRole.DOCTOR.value
            }
            if not user_data['email'] and not user_data['phone']:
                raise ValueError(_("Email hoặc số điện thoại là bắt buộc"))
            user = UserService().add_user(user_data)
            doctor = Doctor.objects.create(
                user_id=user['userId'],
                department_id=data['department_id'],
                identity_number=data['identity_number'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                birthday=data['birthday'],
                gender=data['gender'],
                address=data.get('address'),
                academic_degree=data['academic_degree'],
                specialization=data['specialization'],
                type=data['type'],
                avatar=data.get('avatar'),
                price=data.get('price')
            )
        return doctor

    def update_doctor(self, doctor_id, data):
        doctor = self.get_doctor_by_id(doctor_id)
        for key, value in data.items():
            if key not in ['user', 'department']:
                setattr(doctor, key, value)
        doctor.save()
        return doctor

    def delete_doctor(self, doctor_id):
        doctor = get_object_or_404(Doctor, pk=doctor_id)
        doctor.delete()

    def find_by_identity_number(self, identity_number):
        return Doctor.objects.filter(identity_number=identity_number).first()

    def filter_doctors(self, gender, academic_degree, specialization, type):
        query = Doctor.objects.all()
        if gender:
            query = query.filter(gender=gender)
        if academic_degree:
            query = query.filter(academic_degree=academic_degree)
        if specialization:
            query = query.filter(specialization=specialization)
        if type:
            query = query.filter(type=type)
        return query.order_by('last_name', 'first_name')

    def get_doctor_by_user_id(self, user_id):
        return Doctor.objects.filter(user_id=user_id).first()

    def upload_avatar(self, doctor, file):
        upload_result = cloudinary.uploader.upload(file)
        doctor.avatar = upload_result['secure_url']
        doctor.save()
        return doctor

    def delete_avatar(self, doctor):
        if doctor.avatar:
            public_id = doctor.avatar.split('/')[-1].split('.')[0]
            cloudinary.uploader.destroy(public_id)
            doctor.avatar = None
            doctor.save()
        return doctor


class DepartmentService:
    def get_all_departments(self):
        return Department.objects.all().order_by('department_name')

    def get_department_by_id(self, department_id):
        return get_object_or_404(Department, pk=department_id)

    def create_department(self, data):
        return Department.objects.create(**data)

    def update_department(self, department_id, data):
        department = self.get_department_by_id(department_id)
        for key, value in data.items():
            setattr(department, key, value)
        department.save()
        return department

    def delete_department(self, department_id):
        department = self.get_department_by_id(department_id)
        department.delete()

    def get_doctors_by_department_id(self, department_id):
        return Doctor.objects.filter(department_id=department_id).order_by('last_name', 'first_name')

class ExaminationRoomService:
    def get_all_examination_rooms(self):
        return ExaminationRoom.objects.all().order_by('building', 'floor', 'id')

    def get_examination_room_by_id(self, room_id):
        return get_object_or_404(ExaminationRoom, pk=room_id)

    def create_examination_room(self, data):
        return ExaminationRoom.objects.create(**data)

    def update_examination_room(self, room_id, data):
        room = self.get_examination_room_by_id(room_id)
        for key, value in data.items():
            setattr(room, key, value)
        room.save()
        return room

    def delete_examination_room(self, room_id):
        room = self.get_examination_room_by_id(room_id)
        room.delete()

    def filter_rooms(self, type, building, floor):
        query = ExaminationRoom.objects.all()
        if type:
            query = query.filter(type=type)
        if building:
            query = query.filter(building=building)
        if floor:
            query = query.filter(floor=floor)
        return query.order_by('building', 'floor')

class ScheduleService:
    def get_all_schedules(self, doctor_id, shift, work_date, room_id):
        query = Schedule.objects.filter(doctor_id=doctor_id) if doctor_id else Schedule.objects.all()
        if shift:
            query = query.filter(shift=shift)
        if work_date:
            query = query.filter(work_date=work_date)
        if room_id:
            query = query.filter(room_id=room_id)
        return query.order_by('work_date', 'start_time')

    def get_schedule_by_id(self, schedule_id):
        return get_object_or_404(Schedule, pk=schedule_id)

    def create_schedule(self, doctor_id, data):
        # doctor: ưu tiên từ URL; nếu không có thì dùng giá trị trong data
        doctor = None
        if doctor_id:
            doctor = get_object_or_404(Doctor, pk=doctor_id)
        else:
            doctor = data.get('doctor')  # có thể là int hoặc instance
            if isinstance(doctor, int):
                doctor = get_object_or_404(Doctor, pk=doctor)
            elif doctor is None:
                raise ValidationError("doctor là bắt buộc")

        # room: cho phép int hoặc instance
        room = data.get('room') or data.get('room_id')
        if isinstance(room, int):
            room = get_object_or_404(ExaminationRoom, pk=room)
        if room is None:
            raise ValidationError("room là bắt buộc")

        # dọn data rác để tránh __all__
        data.pop('room_id', None)
        data['doctor'] = doctor
        data['room'] = room

        return Schedule.objects.create(**data)

    def update_schedule(self, doctor_id, schedule_id, data):
        schedule = self.get_schedule_by_id(schedule_id)
        if schedule.doctor.id != doctor_id:
            raise Http404

        if 'doctor' in data:
            schedule.doctor = data.pop('doctor')
        if 'room' in data:
            schedule.room = data.pop('room')

        for key, value in data.items():
            if key not in ['current_patients']:
                setattr(schedule, key, value)
        schedule.save()
        return schedule

    def delete_schedule(self, doctor_id, schedule_id):
        schedule = self.get_schedule_by_id(schedule_id)
        if schedule.doctor.id != doctor_id:
            raise Http404
        schedule.delete()

    def get_all_schedules_for_admin(self):
        return Schedule.objects.all().order_by('work_date', 'start_time')

    def get_schedules_by_ids(self, schedule_ids):
        return Schedule.objects.filter(pk__in=schedule_ids).order_by('work_date', 'start_time')

    @transaction.atomic
    def update_current_patients_count(self, schedule_id):
        schedule = self.get_schedule_by_id(schedule_id)
        active_statuses = [
            AppointmentStatus.PENDING.value,
            AppointmentStatus.CONFIRMED.value,
            AppointmentStatus.IN_PROGRESS.value,
            AppointmentStatus.COMPLETED.value
        ]

        current_appointments_count = Appointment.objects.filter(
            schedule_id=schedule_id,
            status__in=active_statuses
        ).count()

        schedule.current_patients = current_appointments_count

        if schedule.current_patients >= schedule.max_patients:
            schedule.status = ScheduleStatus.FULL.value
        else:
            schedule.status = ScheduleStatus.AVAILABLE.value

        schedule.save()
        return schedule
